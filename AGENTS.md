<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

# Founders' Affair — persistent project rules

## First read, every task
- Read `docs/creative-brief.md`, `docs/event-facts.md`, and `docs/immersive-storyboard-prototype.md` before changing visuals, copy, scene choreography, or event information.
- For a larger change, also read `.agents/skills/founders-affair/SKILL.md`.
- Treat these tracked files as the durable replacement for repeatedly supplied reference PDFs/videos. Do not ask the user to upload the already-summarized Founders' Affair deck or reference video again just to continue this project.
- Inspect the current branch, git diff, app entry points, existing assets, and current preview before editing. Do not assume an old conversation accurately describes the code's present state.

## Identity and art direction
- Brand palette: emerald `#0B3D2E`, deep black `#0A0A0A`, copper `#B8734A`, sage `#2E5748`, ivory `#EDE7D9`, charcoal `#1F1F1F`.
- Use the existing EIC logo asset at `public/eic-logo.svg`. Establish EIC first, then the FOUNDERS' AFFAIR identity/title; do not substitute an invented logo.
- The intended mood is premium editorial craft meeting coherent industrial machinery: tactile woven fabric, dark emerald/black space, restrained copper metal, cinematic perspective, controlled light, intentional negative space, and legible editorial typography.
- The approved visual sequence is one continuous story and one camera path. All structures must be intentionally placed along a shared centreline or a clearly justified station. Use symmetry, repeatable intervals, scale and depth to create a designed environment—not a random collection of downloaded props.
- Preserve the approved scroll sequence: woven EIC opening → fabric-to-machine gear/aperture reveal and Founders' Affair title → continuous tunnel flight → central statement → five C-suite roles → Day 1 and Day 2 stations → three aligned BUILD / MOVE / FUND rings → paired curtain finale.
- Keep important text in accessible HTML overlays rather than baking it into textures. Support reverse scrolling, small screens, keyboard/accessibility requirements and reduced-motion preferences. Audio must be opt-in.
- Prefer a coherent procedural scene over model imports that do not match the composition. Do not reintroduce the previously rejected Aero_Station_Ring, Aero_Door or Aero_Lampost model integration. Before using any new external model/material, inspect the exact preview and licence, document provenance, and explain why it belongs in the scene.

## Implementation and quality
- Stack is React, TypeScript and Vite/TanStack Start. Follow the existing patterns and do not replace the framework or perform broad rewrites for a small feature.
- Components should use semantic design tokens from `src/styles.css`; sections use the existing `.theme-dark`, `.theme-ivory`, or `.theme-brand` conventions.
- The custom cursor reads `data-cursor` values `view`, `drag`, and `cta`. Keep it `pointer-events: none` and limited to fine pointers so it never blocks interaction.
- Keep one normalized scroll progress as the source of truth for camera, curtain and scene choreography. Avoid independent animations that drift out of sync.
- The current storyboard preview imports Three.js from a runtime CDN. Treat that as prototype-only: bundle Three.js locally and verify fallback behavior before any production release. Do not claim this hardening has happened unless it is actually verified.
- Verify with `npm run build` and `npm run lint` when available. Inspect the browser preview at multiple scroll positions, mobile width, reverse scrolling, and reduced-motion mode. Be transparent about checks you could not perform.
- Do not invent event facts, dates, venue details, pricing, registration links, partnerships or testimonials. Consult `docs/event-facts.md` and mark unknown details as unconfirmed.

## Branching, preview and release safety
- Production URL: https://founders-affair.onrender.com
- Current visual review branch: `immersive-storyboard-prototype`
- Isolated preview URL: https://founders-affair-storyboard-preview.onrender.com
- Draft review PR: https://github.com/akshatambasta-dev/founders-affair/pull/6
- Keep visual experiments and all unapproved work on an isolated branch with the isolated preview. The production website and `main` must remain unchanged until the user explicitly approves a production merge/deploy.
- Never merge a PR, push a visual change to `main`, or trigger a production deployment without explicit approval in the current conversation. A successful build is not visual approval.
- Before work starts, confirm the current branch and status. Before proposing review, summarize changes, test evidence, preview URL, limitations and anything needing visual sign-off.
- Do not rewrite published history or force-push; this repo is connected to Lovable.

## Information discipline
- The deck-derived facts in `docs/event-facts.md` and storyboard in `docs/creative-brief.md` take precedence over guesses. The PDF and original video are not stored in this repository; those documents contain the project knowledge extracted from them.
- Registration was pending in the last recorded state. Do not create a fake registration link or imply registration is open unless the user provides the confirmed destination/status.
