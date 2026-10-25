# MATCH STUDIO — MOBILE AI AGENT HANDOFF PILOT
Version: 2026-10-25 (experimental, owner review required)

## Purpose

Continue a narrowly scoped Match Studio coding task from a Galaxy Z Fold phone after Codex usage runs out, without requiring a local PC or a permanent secondary subscription.

**Critical limitation:** GitHub Actions cannot observe ChatGPT/Codex mobile quota meters or transfer the private Codex chat automatically. The owner must create a GitHub issue using the AI Handoff template. The rest of the pilot is designed to run in the cloud.

The canonical code remains in `daricagucusk/Match-Studio`. The production Vercel project must not be changed by this workflow. The existing `verify.yml` CI remains the acceptance gate.

## One-time owner setup — phone browser

1. Open the private Match-Studio repository on GitHub.
2. Under **Settings > Secrets and variables > Actions**, create a **repository secret** named exactly `GEMINI_API_KEY` using a Google AI Studio API key. Never paste the API key into an issue, a pull request, or ChatGPT.
3. Under **Settings > Actions > General > Workflow permissions**, confirm that GitHub Actions may create pull requests and grant its workflow-declared repository permissions. Where this is disallowed, the code branch might push but the draft PR step will fail; enable only if acceptable to the repository owner.
4. Review and merge the pilot setup PR to `main` only after inspecting the workflow and any GitHub security warnings. The issue-triggered workflow becomes active only from the default branch.
5. Observe free-tier Gemini API quotas and GitHub Actions minute limits. No unlimited free use is promised.

## Starting a handoff on Android

1. In GitHub mobile or Chrome open `https://github.com/daricagucusk/Match-Studio/issues/new/choose`.
2. Choose **AI Devir - Mobil Kodlama**.
3. Fill in one well-bounded request, preserved behaviors, acceptance criteria, and the last Codex status or PR link.
4. **Do not change the title prefix** `[AI DEVIR]`.
5. Submit the issue as repository owner `daricagucusk`.
6. Go to **Actions > Mobile AI Handoff Pilot** to inspect status. A successful run should generate a new `agent/mobile-handoff-<issue>-<run>` branch and a **draft Pull Request**.
7. The draft PR job explicitly triggers **Verify Match Studio release** via GitHub workflow_dispatch, because bot-authored PR events can require separate approval or fail to trigger automatic CI. Examine all changed files and verify that dispatched run. Merge only after explicit owner approval and separate production release validation.

## Security and rollback

- Trigger is limited to new issues opened by the repo owner with the exact title prefix.
- Gemini runs in a read-only GitHub-token job without checkout credentials. Note: Google's pinned `run-gemini-cli` Action internally starts the CLI with `--yolo`; therefore this pilot explicitly limits built-in tools using `tools.core` to `read_file`, `write_file`, `replace`, `glob`, `grep_search`, and `list_directory`. The CLI cannot call its built-in shell or web tools with this configuration. This is defense-in-depth, **not** a complete sandbox or guarantee against malicious source content. Review the workflow before enabling it.
- Changes must be small; prohibited modifications to `.github/`, deployment/build configuration, credentials, shell scripts, file deletions or renames make the job fail. The patch size is capped at 200 KB.
- `npm run build` and `npm test` run before a patch is transferred. Existing PR CI carries out heavier browser/release tests.
- A separate job with write permission applies only the patch and opens a draft PR; no commit is made to `main`. It needs scoped `actions: write` to request the existing `verify.yml` workflow on the new branch.
- Never put production credentials, player PII, API keys, or sensitive backup files in GitHub issues. AI providers receive relevant task text and repository context.
- An AI-generated patch can still be incorrect or unsafe; human review is mandatory.
- To disable the pilot, delete or rename `.github/workflows/mobile-ai-handoff.yml` in a reviewed PR. A failed task does not change the main branch or production.
- If the `gh pr create` step fails due to repository policy, an agent branch may still have been pushed. The Actions run log shows the branch name for manual inspection.

## Pilot limitations and criteria

Initial source is the repository's currently merged `main`, not automatically the newest open F.12/F.13/F.14 feature branch. Don't request tasks that depend on code found only in unmerged pull requests without merging or explicitly adapting the workflow later.

Pilot passes only when:
- the owner has configured `GEMINI_API_KEY`;
- a small owner-authored issue produces source changes in a separate branch;
- build + unit tests and the existing release CI succeed;
- a **draft** PR appears without changing `main` or Vercel production.

This protocol is a task handoff, **not** a native continuation of the ChatGPT conversation. GitHub issues, source files, Git history, and test logs preserve transferable context.
