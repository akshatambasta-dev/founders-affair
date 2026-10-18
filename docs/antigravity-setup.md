# Using Antigravity with Founders' Affair

The repository now keeps the reusable project context in version control. You should not need to repeatedly attach the original pitch deck PDF or reference video for ordinary development tasks.

## Open the right code

1. Open Antigravity.
2. Open/clone the GitHub repository `akshatambasta-dev/founders-affair`.
3. Check out the branch `immersive-storyboard-prototype` before continuing the experimental immersive redesign. This branch has the persistent context and is isolated from production.
4. Confirm Antigravity sees the root `AGENTS.md`. Its repository rules should load automatically. The reusable skill lives in `.agents/skills/founders-affair/SKILL.md`.
5. Give your request in natural language. For a larger task, invoke the `founders-affair` skill if the Antigravity surface offers slash-command skills, or ask it to follow that SKILL.md.

## Where the context lives

- `AGENTS.md` — always-on rules, brand direction, current branches/URLs, quality requirements and deployment safety.
- `docs/creative-brief.md` — written storyboard of the reference video and the approved 8-scene website sequence.
- `docs/event-facts.md` — facts extracted from the 16-slide pitch deck, including roles, simulation flow, event copy and contacts; also lists unconfirmed details.
- `docs/immersive-storyboard-prototype.md` — current prototype scene composition, scene engineering notes and asset provenance.
- `.agents/skills/founders-affair/SKILL.md` — reusable workflow for implementation, QA and safe release preparation.

## Copy/paste starter request

> Read `AGENTS.md`, `docs/creative-brief.md`, `docs/event-facts.md`, `docs/immersive-storyboard-prototype.md` and `.agents/skills/founders-affair/SKILL.md`. Inspect the current branch, diff and live preview before editing. Continue the requested Founders' Affair work in the existing visual direction. Do not ask me to re-upload the source deck/video for facts already documented. Use an isolated branch/preview, run the available checks, and report what you could and could not verify. Do not merge to main or deploy to production without my explicit approval.

## How to update the stored context later

When the user supplies a new confirmed fact, newly approved design reference or explicit storyboard change, update the matching tracked document in the same branch/PR. Keep facts separate from design interpretation, note unresolved information instead of guessing, and do not replace the approved narrative without sign-off.
