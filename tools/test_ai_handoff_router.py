"""Offline-only regression tests for the issue-to-model fallback router."""
import json
import os
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch
import sys

sys.path.insert(0, str(Path(__file__).resolve().parent))
import ai_handoff_router as router


class ModelRouterTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.original_root = router.ROOT
        router.ROOT = Path(self.temp.name).resolve()
        (router.ROOT / "src").mkdir()
        (router.ROOT / "src" / "smoke.js").write_text("const answer = 1;\n", encoding="utf-8")

    def tearDown(self):
        router.ROOT = self.original_root
        self.temp.cleanup()

    def test_free_first_and_paid_opt_in(self):
        keys = {"GEMINI_API_KEY": "test", "OPENROUTER_API_KEY": "test"}
        names = [name for _, name in router.models(keys)]
        self.assertEqual(names[0], "gemini-3.8-flash")
        self.assertIn("nvidia/nemotron-3-ultra-550b-a55b:free", names)
        self.assertNotIn("z-ai/glm-5.3-flash", names)
        names2 = [name for _, name in router.models({**keys, "AI_ENABLE_PAID_FALLBACK": "true"})]
        self.assertIn("z-ai/glm-5.3-flash", names2)

    def test_invalid_and_outside_paths(self):
        for bad in ("../secrets.json", ".github/workflows/check.yml",
                    "src/../../private.txt", "src/missing.js", "src/token.js"):
            with self.subTest(path=bad):
                with self.assertRaises(ValueError):
                    router.safe_file(bad)

    def test_existing_path_from_issue(self):
        files = router.source_context("Please inspect src/smoke.js as requested.")
        self.assertEqual(files, {"src/smoke.js": "const answer = 1;\n"})

    def test_valid_exact_replacement(self):
        original = {"src/smoke.js": "const answer = 1;\n"}
        edits = [{"path": "src/smoke.js", "find": "const answer", "replace": "// smoke\nconst answer"}]
        modified = router.validate_edits(edits, original)
        self.assertEqual(modified["src/smoke.js"], "// smoke\nconst answer = 1;\n")

    def test_must_match_exactly_once(self):
        data = {"src/smoke.js": "foo foo"}
        with self.assertRaises(ValueError):
            router.validate_edits([{"path": "src/smoke.js", "find": "foo", "replace": "bar"}], data)

    def test_wrong_path_not_accepted(self):
        with self.assertRaises(ValueError):
            router.validate_edits([{"path": "src/evil.js", "find": "1", "replace": "2"}],
                                  {"src/smoke.js": "1"})

    def test_markdown_fenced_json(self):
        response = chr(96)*3 + "json\n" + json.dumps(
            {"edits": [{"path": "src/smoke.js", "find": "1", "replace": "2"}]}) + "\n" + chr(96)*3
        self.assertEqual(router.decode_plan(response)[0]["find"], "1")

    def test_fallback_after_provider_error(self):
        event = {"repository": {"owner": {"login": "owner"}},
                 "issue": {"user": {"login": "owner"}, "title": "[AI DEVIR] test",
                           "body": "Modify src/smoke.js by changing 1 to 2."}}
        def mocked(provider, model, prompt, env):
            if model == "gemini-3.8-flash":
                raise router.ProviderError("capacity")
            return json.dumps({"edits": [{"path": "src/smoke.js",
                                          "find": "answer = 1", "replace": "answer = 2"}]})
        with patch.object(router, "infer", side_effect=mocked):
            router.run(event, {"GEMINI_API_KEY": "not-real"})
        self.assertEqual((router.ROOT / "src" / "smoke.js").read_text(),
                         "const answer = 2;\n")

    def test_fail_closed_no_edits_if_all_fail(self):
        event = {"repository": {"owner": {"login": "owner"}},
                 "issue": {"user": {"login": "owner"}, "title": "[AI DEVIR] test",
                           "body": "Modify src/smoke.js."}}
        with patch.object(router, "infer", side_effect=router.ProviderError("quota")):
            with self.assertRaises(RuntimeError):
                router.run(event, {"GEMINI_API_KEY": "not-real"})
        self.assertEqual((router.ROOT / "src" / "smoke.js").read_text(),
                         "const answer = 1;\n")

    def test_non_owner_rejected(self):
        event = {"repository": {"owner": {"login": "owner"}},
                 "issue": {"user": {"login": "visitor"}, "title": "[AI DEVIR] foo",
                           "body": "Change src/smoke.js"}}
        with self.assertRaises(ValueError):
            router.run(event, {"GEMINI_API_KEY": "not-real"})


if __name__ == "__main__":
    unittest.main()
