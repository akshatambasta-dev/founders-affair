---
name: founders-affair
description: Continue, improve, review, or prepare a release of the Founders' Affair website using its persistent brand brief, event facts, immersive storyboard and safe branch/preview workflow. Use for design, animation, 3D scene, copy, accessibility, responsive layout, QA or deployment tasks in this repository.
---

# Founders' Affair development skill

Use this skill for any substantial task in this repository. The repo is intended to contain enough context that the user does not need to reattach the original pitch deck or reference video for ordinary work.

## Before editing

1. Read root `AGENTS.md`.
2. Read `docs/creative-brief.md`, `docs/event-facts.md` and `docs/immersive-storyboard-prototype.md`.
3. Check the current branch, worktree/diff, current file structure and the actual current app state. Look at `public/eic-logo.svg` and reuse existing local assets before making substitutes.
4. Identify whether the request is visual, copy, interaction, performance or release work. Make the smallest cohesive change that solves it; don't rewrite the app wholesale.
5. Reuse project context in those files. Only ask for clarification if an essential decision really is missing. Do not ask the user to upload the old deck/video just to remind you of details already captured in the docs.

## Design and implementation

- Treat the site as a premium, continuous, scroll-driven story from woven EIC opening to machined tunnel, role stations, Day 1/Day 2 stations, aligned BUILD / MOVE / FUND rings and curtain finale.
- Keep the objects designed around one camera path, common centreline, sensible scale/depth, symmetry and deliberate spacing. Avoid random props and visual clutter.
- Do not reintroduce the rejected Aero_Station_Ring, Aero_Door or Aero_Lampost model integration.
- Check exact asset licences and preview every candidate asset in context before adding it; document the source and purpose. Procedural geometry is preferable if it produces a more coherent result.
- Keep headlines and key information as accessible HTML. Test mobile layout, reverse-scroll behavior, reduced-motion behavior, contrast and non-WebGL fallback.
- Read event content from `docs/event-facts.md`. Do not invent a registration URL, date, venue, pricing, partner name, award, quote or promise. Do not turn the deck's simulated $100,000 capital into a real prize claim.
- Three.js is runtime-loaded from esm.sh in the current storyboard prototype. This is a known pre-production limitation; bundle it as a local dependency and verify fallback behavior before asking for any production approval.

## Validate and report

- Run `npm run build` and `npm run lint` when possible. If dependencies are missing, install only as appropriate and report any command that was not run.
- When visual changes are involved, inspect the actual isolated browser preview at the start, middle and end of the scroll journey, including reverse scrolling and a narrow/mobile viewport. A build passing is not visual QA. Never say you inspected a browser if you did not.
- Summarize: files changed, user-visible effect, commands/checks run and results, preview URL, known limitations, and what the user should review next.

## Release safety

- Develop on `immersive-storyboard-prototype` or a new isolated branch, not `main`.
- The current isolated visual review is https://founders-affair-storyboard-preview.onrender.com and the existing draft PR is https://github.com/akshatambasta-dev/founders-affair/pull/6.
- Production is https://founders-affair.onrender.com. Keep it unchanged while experimenting.
- Never merge, push visual changes to `main`, or trigger a production deployment until the user explicitly approves that action in the current conversation. A PR being open, a successful build, or a preview that looks plausible is not approval.
- Do not force-push, rebase, amend or squash already-published history; the repository is connected to Lovable.
