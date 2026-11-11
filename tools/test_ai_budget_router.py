"""Offline safety and model-routing acceptance tests. No Abacus API calls."""
import json
import subprocess
import sys
import tempfile
import unittest
from decimal import Decimal
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import ai_budget_router as router


class AgentBudgetRouterTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.ledger = Path(self.tmp.name) / "usage.json"
        self._run_dir = router.RUN_DIR
        router.RUN_DIR = Path(self.tmp.name) / "runs"
        self.addCleanup(setattr, router, "RUN_DIR", self._run_dir)
        self.policy = {
            "cycle_id": "2026-11-07",
            "monthly_cap": 1500,
            "daily_cap": 350,
            "task_cap": 500,
            "min_wallet_balance": 1000,
            "reserves": {"RouteLLM": 3, "Opus 5.5": 90, "Fable 5.1": 200},
        }

    def test_simple_task_routes_to_economy(self):
        self.assertEqual(router.classify_task("Düğme metnini düzelt"), "economy")
        self.assertEqual(router.choose_model("Düğme metnini düzelt", "plan", False), "RouteLLM")

    def test_architecture_routes_to_opus_if_premium_authorized(self):
        self.assertEqual(router.classify_task("Çok dosyalı mimari refaktör yap"), "advanced")
        self.assertEqual(router.choose_model("Çok dosyalı mimari refaktör yap", "review", True), "Opus 5.5")

    def test_critical_routes_fable_only_when_authorized(self):
        task = "Kritik güvenlik mimarisi ve şifreleme denetimi"
        self.assertEqual(router.classify_task(task), "critical")
        self.assertEqual(router.choose_model(task, "review", False), "RouteLLM")
        self.assertEqual(router.choose_model(task, "review", True), "Fable 5.1")

    def test_implementation_uses_cheap_model_even_when_premium_allowed(self):
        self.assertEqual(router.choose_model("Kritik güvenlik mimarisi", "implement", True), "RouteLLM")

    def test_verify_does_not_use_a_paid_model(self):
        self.assertEqual(router.choose_model("Kritik güvenlik", "verify", True), "LOCAL_TESTS")

    def test_pipeline_orders_four_specialist_roles(self):
        plan = router.make_plan("Çok dosyalı mimari refaktör", True)
        self.assertEqual([x["role"] for x in plan], ["plan", "implement", "review", "verify"])
        self.assertEqual([x["model"] for x in plan],
                         ["Opus 5.5", "RouteLLM", "Opus 5.5", "LOCAL_TESTS"])

    def test_parse_actual_cli_credits(self):
        self.assertEqual(router.parse_credits("model: CLAUDE_V5_1_FABLE\nCredits used: 130.49\nTEST_OK"),
                         Decimal("130.49"))
        with self.assertRaises(ValueError):
            router.parse_credits("model: ROUTE_LLM\nTEST_OK")

    def test_budget_blocks_monthly_daily_and_task_overages(self):
        state = router.BudgetLedger(self.ledger, self.policy)
        state.record(Decimal("280"))
        self.assertFalse(state.can_reserve("Opus 5.5", task_spent=Decimal("0")))
        self.assertFalse(state.can_reserve("Fable 5.1", task_spent=Decimal("400")))
        self.assertTrue(state.can_reserve("RouteLLM", task_spent=Decimal("0")))
        self.assertEqual(router.BudgetLedger(self.ledger, self.policy).spent, Decimal("280"))

    def test_wallet_balance_guard_stops_below_reserve(self):
        state = router.BudgetLedger(self.ledger, self.policy)
        self.assertFalse(state.can_reserve("Fable 5.1", wallet_balance=1100))
        self.assertTrue(state.can_reserve("RouteLLM", wallet_balance=1100))

    def test_dry_run_is_no_charge_and_does_not_create_ledger(self):
        calls = []
        def runner(argv, prompt, cwd):
            calls.append(argv)
            raise AssertionError("dry-run launched CLI")
        result = router.run_pipeline("Kritik güvenlik", self.policy, self.ledger,
                                     allow_premium=True, execute=False, runner=runner)
        self.assertFalse(result["executed"])
        self.assertEqual(calls, [])
        self.assertFalse(self.ledger.exists())

    def test_execute_requires_confirmed_wallet(self):
        with self.assertRaises(ValueError):
            router.run_pipeline("Düğmeyi düzelt", self.policy, self.ledger, execute=True)

    def test_secret_input_is_rejected_before_any_model_call(self):
        with self.assertRaises(ValueError):
            router.make_plan("token=sk-proj-FAKESECRET", False)

    def test_readonly_cli_command_and_role_handoff(self):
        calls = []
        def runner(argv, prompt, cwd):
            calls.append((argv, prompt, cwd))
            n = len(calls)
            return subprocess.CompletedProcess(argv, 0, "model: ROUTE_LLM\nCredits used: 1.25\n" + ("A" * 1800) + f" step{n}", "")
        result = router.run_pipeline("Düğmeyi düzelt", self.policy, self.ledger,
                                     execute=True, wallet_balance=19933, runner=runner,
                                     stages=("plan", "implement", "review"), project_dir=self.tmp.name)
        self.assertTrue(result["executed"])
        self.assertEqual(len(calls), 3)
        self.assertEqual(router.BudgetLedger(self.ledger, self.policy).spent, Decimal("3.75"))
        for argv, prompt, cwd in calls:
            self.assertNotIn("--dangerously-skip-permissions", argv)
            allowed = argv[argv.index("--allowed-tools") + 1]
            denied = argv[argv.index("--disallowed-tools") + 1]
            role = prompt.split("ROLE: ", 1)[1].split(".", 1)[0]
            if role == "implement":
                self.assertEqual(argv[argv.index("--permission-mode") + 1], "accept-edits")
                self.assertEqual(allowed, router.WRITE_ROLE_TOOLS)
                for tool in ("Write", "Edit", "Bash"):
                    self.assertIn(tool, allowed.split(","))
                self.assertIn("WebFetch", denied.split(","))
            else:
                self.assertEqual(argv[argv.index("--permission-mode") + 1], "plan")
                self.assertEqual(allowed, router.READ_ONLY_TOOLS)
                for tool in ("Read", "Grep", "Glob"):
                    self.assertIn(tool, allowed.split(","))
                for tool in ("Write", "Edit", "Bash", "WebFetch"):
                    self.assertIn(tool, denied.split(","))
                self.assertNotIn("*", denied)
        self.assertIn("step1", calls[1][1])
        self.assertIn("step2", calls[2][1])
        self.assertLess(len(calls[2][1]), 2900)

    def test_provider_failure_stops_next_role_and_records_no_fictitious_credits(self):
        calls = []
        def runner(argv, prompt, cwd):
            calls.append(argv)
            return subprocess.CompletedProcess(argv, 2, "", "provider failed")
        with self.assertRaises(RuntimeError):
            router.run_pipeline("Düğmeyi düzelt", self.policy, self.ledger,
                                execute=True, wallet_balance=19933,
                                runner=runner, stages=("plan", "review"))
        self.assertEqual(len(calls), 2)
        self.assertEqual(router.BudgetLedger(self.ledger, self.policy).spent, Decimal("0"))

    def test_missing_credits_fails_closed_without_next_call(self):
        calls = []
        def runner(argv, prompt, cwd):
            calls.append(argv)
            return subprocess.CompletedProcess(argv, 0, "OK", "")
        with self.assertRaises(ValueError):
            router.run_pipeline("Düğmeyi düzelt", self.policy, self.ledger,
                                execute=True, wallet_balance=19933,
                                runner=runner, stages=("plan", "review"))
        self.assertEqual(len(calls), 1)

    def test_premium_high_cost_stops_followup_when_task_cap_exceeded(self):
        calls = []
        def runner(argv, prompt, cwd):
            calls.append(argv)
            return subprocess.CompletedProcess(argv, 0, "Credits used: 495\nPlan hazır", "")
        with self.assertRaises(RuntimeError):
            router.run_pipeline("Kritik güvenlik mimarisi", self.policy, self.ledger,
                                allow_premium=True, execute=True, wallet_balance=19933,
                                runner=runner, stages=("plan", "review"))
        self.assertEqual(len(calls), 1)
        self.assertEqual(router.BudgetLedger(self.ledger, self.policy).spent, Decimal("495"))

    def test_verify_uses_fixed_local_command_only(self):
        self.assertEqual(router.verification_commands()[0][:2], ["npm", "test"])
        self.assertFalse(any("git" in part or "deploy" in part
                             for cmd in router.verification_commands() for part in cmd))

    def test_ledger_rejects_corrupted_file(self):
        self.ledger.write_text("not-json", encoding="utf-8")
        with self.assertRaises(ValueError):
            router.BudgetLedger(self.ledger, self.policy)


if __name__ == "__main__":
    unittest.main()


class RouterSecurityTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name)
        self.ledger = self.root / "ledger.json"
        self.policy = {
            "cycle_id": "2026-11-07",
            "monthly_cap": 1500, "daily_cap": 350, "task_cap": 500,
            "min_wallet_balance": 1000,
            "reserves": {"RouteLLM": 3, "Opus 5.5": 90, "Fable 5.1": 200},
        }

    def test_premium_fallback_not_mislabeled_as_fable(self):
        calls = []
        def runner(argv, prompt, cwd):
            calls.append(argv)
            return subprocess.CompletedProcess(
                argv, 0, "model: ROUTE_LLM\nCredits used: 130.49\nTEST_OK", "")
        with self.assertRaises(RuntimeError):
            router.run_pipeline("Kritik güvenlik mimarisi", self.policy, self.ledger,
                                allow_premium=True, execute=True, wallet_balance=19933,
                                runner=runner, stages=("plan",))
        self.assertEqual(len(calls), 1)
        self.assertEqual(router.BudgetLedger(self.ledger, self.policy).spent,
                         Decimal("130.49"))

    def test_refuse_concurrent_run_with_existing_lock(self):
        lock = self.ledger.with_suffix(".json.lock")
        lock.write_text("active", encoding="utf-8")
        calls = []
        def runner(argv, prompt, cwd):
            calls.append(argv)
            return subprocess.CompletedProcess(argv, 0, "Credits used: 1", "")
        with self.assertRaises(RuntimeError):
            router.run_pipeline("Düğmeyi düzelt", self.policy, self.ledger,
                                execute=True, wallet_balance=19933, runner=runner,
                                stages=("plan",))
        self.assertEqual(calls, [])

    def test_explicit_source_context_is_bounded_and_labeled(self):
        src = self.root / "src"
        src.mkdir()
        (src / "sample.js").write_text("const test = 1;\n" * 1800, encoding="utf-8")
        context = router.read_source_context(self.root, ("src/sample.js",))
        self.assertIn("FILE: src/sample.js", context)
        self.assertIn("TRUNCATED", context)
        self.assertLess(len(context), 15000)

    def test_reject_source_traversal_and_secrets(self):
        (self.root / "src").mkdir()
        (self.root / "src" / "token.js").write_text(
            "const key = 'sk-proj-TESTSECRET';", encoding="utf-8")
        with self.assertRaises(ValueError):
            router.read_source_context(self.root, ("../outside.js",))
        with self.assertRaises(ValueError):
            router.read_source_context(self.root, ("src/token.js",))
        with self.assertRaises(ValueError):
            router.read_source_context(self.root, (".env",))

    def test_source_context_in_prompt_truncated(self):
        p = router.make_prompt("Düğmeyi düzelt", "plan", context="FILE: src/a.js\nconst a=1")
        self.assertIn("src/a.js", p)
        self.assertIn("const a=1", p)

    def test_pipeline_returns_final_bounded_agent_summary(self):
        def runner(argv, prompt, cwd):
            return subprocess.CompletedProcess(argv, 0,
                "model: ROUTE_LLM\nCredits used: 0.78\nHEAD " + "A" * 5000 +
                " TAIL " + "Z" * 3000, "")
        result = router.run_pipeline("Düğme metnini düzelt", self.policy,
                                     self.ledger, execute=True,
                                     wallet_balance=19933, runner=runner,
                                     stages=("plan",))
        summary = result["final_summary"]
        self.assertLessEqual(len(summary), router.SUMMARY_HEAD + router.SUMMARY_TAIL + 10)
        self.assertIn("HEAD", summary)
        self.assertIn("Z", summary)
        self.assertIn("[...]", summary)
        self.assertEqual(len(result["artifacts"]), 1)
        self.assertTrue(Path(result["artifacts"][0]).exists())

    def test_missing_model_identity_is_not_accepted_after_charge(self):
        def runner(argv, prompt, cwd):
            return subprocess.CompletedProcess(argv, 0,
                "Credits used: 0.78\nTEST_OK", "")
        with self.assertRaises(RuntimeError):
            router.run_pipeline("Düğme metnini düzelt", self.policy, self.ledger,
                                execute=True, wallet_balance=19933,
                                runner=runner, stages=("plan",))
        self.assertEqual(router.BudgetLedger(self.ledger, self.policy).spent,
                         Decimal("0.78"))

    def test_prompt_includes_only_real_project_verification_commands(self):
        prompt = router.make_prompt("Düğmeyi düzelt", "plan")
        self.assertIn("npm test", prompt)
        self.assertIn("npm run build", prompt)
        self.assertIn("npm run test:browser", prompt)
        self.assertIn("Do not invent", prompt)
