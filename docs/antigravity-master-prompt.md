# INITIAL MASTER PROMPT — FOUNDERS' AFFAIR WEBSITE

You are being briefed on this project for the first time. Treat everything below and the repository documents as the complete initial project brief. Do not assume I previously gave you another prompt, a PDF, a video, or any other reference files.

## 1. Your task

Help me build a premium, cinematic website for **Founders' Affair**, a two-day business simulation by EIC at SAII. The most important part is a cohesive, immersive, scroll-driven story that feels art-directed and intentional—not a generic website, not a collection of unrelated 3D models, and not a technically impressive scene that looks visually chaotic.

Start by auditing the existing repository and preview. Then improve the existing immersive prototype in a coherent, reviewable batch. Do not start from scratch or replace the current architecture without a strong technical reason.

## 2. Repository and environments

- GitHub repository: https://github.com/akshatambasta-dev/founders-affair
- Branch for immersive visual review: `immersive-storyboard-prototype`
- Existing draft pull request: https://github.com/akshatambasta-dev/founders-affair/pull/6
- Production website: https://founders-affair.onrender.com
- Separate prototype preview: https://founders-affair-storyboard-preview.onrender.com

**Work from `immersive-storyboard-prototype` or a new isolated feature branch.** PR #6 contains the current procedural story-tunnel prototype and project-context files. The production site/main branch must not be changed until I explicitly approve a merge and production deployment. Opening this repository publicly is only to make code/context accessible; it is not permission to deploy, merge or change the live site.

If you cannot access the repository/branch or its preview, state the exact blocker rather than pretending to have inspected it. If the repository has not yet been made public and your GitHub integration cannot access private repositories, ask me to finish the GitHub visibility step or connect the repository; do not guess the code state.

## 3. Read the persistent project context first

Before editing, read these files in the current branch:
1. `AGENTS.md` — persistent rules, brand, workflow and release safety.
2. `docs/creative-brief.md` — approved storyboard and the visual language captured from the reference video.
3. `docs/event-facts.md` — event facts transcribed from the pitch deck and a list of unknowns.
4. `docs/immersive-storyboard-prototype.md` — how the current procedural scene is arranged.
5. `.agents/skills/founders-affair/SKILL.md` — reusable implementation/QA workflow.
6. `README.md` and `docs/antigravity-setup.md` — repository setup.

The written creative brief and event facts were prepared specifically so I do not need to attach the original pitch deck PDF or reference video for ordinary work. Do not ask me to upload them again just to re-learn the content. If the written description genuinely misses one essential visual detail, ask one focused question about that detail only.

## 4. What the reference video should feel like

The reference video is about 28 seconds and was reviewed as a sequence of these broad visual beats:
- Woven ivory fabric fills the frame.
- Fabric/aperture parts to reveal a centred circular mechanical gear.
- Editorial typography is placed within the environment with deliberate composition.
- The camera continuously travels through a detailed mechanical tunnel.
- A colour transition leads to three large, aligned rings.
- A large fabric curtain opens into a calmer final chamber.

These are design beats, not exact timecodes or a demand to copy every frame literally. Use the approved sequence below to translate the reference's craft, rhythm and camera movement into the site.

## 5. Approved website storyboard

Create one coherent camera journey through the story. Keep the following order:

**Scene 1 — EIC / woven opening**
A calm, tactile woven ivory textile fills the screen. Use the actual EIC logo at `public/eic-logo.svg`. EIC must appear first, before the FOUNDERS' AFFAIR identity/title. Keep the opening composed and not crowded.

**Scene 2 — fabric-to-machinery reveal**
The textile panels part, peel or reveal a single centred concentric gear/aperture. Bring in FOUNDERS' AFFAIR as part of the reveal. Avoid multiple competing focal points.

**Scene 3 — full-screen continuous industrial tunnel**
The camera moves forward through one deep, cinematic mechanical corridor. Ribs, longitudinal rails, regularly spaced brackets and restrained copper milestone collars create a deliberate rhythm and vanishing point. Use coherent structural logic, scale and controlled lighting. It must read as one designed environment, not separate unrelated backgrounds.

**Scene 4 — primary statement**
Reveal the line: **“Build the company. Move the market. Win the investors.”** Make the type large, editorial, readable and timed to the camera passage.

**Scene 5 — five executive roles**
Show five clearly ordered stations/gates for **CEO, CFO, CMO, COO and CTO**. They should form an intentional sequence along the same path, with consistent visual weight and readable labels.

**Scene 6 — the two-day simulation**
Build the story through the actual event activities:
- **Day 1:** Acquisition Floor, Boardroom Crisis and Stock Market.
- **Day 2:** Brand War and Founders' Affair Investor Marketplace.

The sequence should communicate a progression: acquire a foundation, operate through decisions/crises and market reaction, then build a brand, pitch it and seek simulated investor cheques.

**Scene 7 — three-ring climax**
Three large rings align in one purposeful composition for **BUILD / MOVE / FUND**. The shapes should feel machined and spatially grounded. They must be a clear triptych rather than three randomly floating hoops.

**Scene 8 — woven curtain finale**
Paired textile curtains open from the centre, leading into a calmer, warmer final chamber. Use approved deck copy such as **“BUILD IT. RUN IT. MOVE IT. SELL IT. FUND IT.”** End with a resolved, memorable composition.

## 6. Art direction and palette

Use this palette consistently:
- Emerald: `#0B3D2E`
- Deep black: `#0A0A0A`
- Copper: `#B8734A`
- Sage: `#2E5748`
- Ivory: `#EDE7D9`
- Charcoal: `#1F1F1F`

The intended aesthetic is premium editorial craft meeting industrial machinery: tactile cloth and weave; brushed or darkened metal; restrained copper edges; subtle emerald atmosphere; purposeful highlights; strong depth, silhouette and negative space; refined typography; controlled pacing. Avoid generic neon cyberpunk, noisy HUDs, random floating objects, excessive bloom/glow, duplicated rings, unrelated imported models, stock-model collisions and decorative elements without a clear story purpose.

Use existing site design tokens and component conventions. Reuse the real EIC logo; do not invent an alternate logo.

## 7. Important scene-cohesion and motion rules

- Use one normalized scroll progress source as the source of truth for camera position, cloth opening, object reveals and chapter timing. Keep animation synchronized going both forward and backward.
- Organize all 3D content around one camera path. Use shared centreline, deliberate axial stations, consistent scale, symmetry or explainable offsets, and repeatable intervals.
- Ensure the tunnel fills the viewport with meaningful perspective and lighting; do not add more objects solely to make it look detailed.
- Keep important copy as accessible HTML overlays rather than text baked into textures.
- Provide responsive behavior for desktop and narrow/mobile layouts.
- Respect `prefers-reduced-motion`; allow the user to understand and navigate the story even when reduced motion is enabled.
- Keep a useful fallback if WebGL is unavailable or the 3D scene fails. Do not let an initialization error blank the entire page.
- Sound, if ever introduced, must be opt-in and never autoplay.
- The user previously rejected the integration of the individual Aero_Station_Ring, Aero_Door and Aero_Lampost model imports. **Do not reintroduce them.**
- Open-source asset/model/material research may inform the work, but examine the actual item, license, scale, style and context before using it. Cite/document provenance. Prefer the existing intentionally composed procedural geometry over inserting assets that do not fit.

## 8. Verified event facts — do not invent information

Use `docs/event-facts.md` as the content source of truth. Key details:
- Event name: Founders' Affair; presented by EIC at SAII.
- Tagline: “Build the company. Move the market. Win the investors.”
- Format: two-day company simulation, five people/five C-suite roles.
- Starting simulated capital stated in the deck: **$100,000**. This is simulated starting capital, not a claim of a $100,000 real-world prize.
- Day 1: Acquisition Floor, Boardroom Crisis and Stock Market.
- Day 2: Brand War and Founders' Affair Investor Marketplace.
- Eight steps: Acquire, Operate, Move the market, Manage, Build the brand, Pitch, Get funded, Win. The deck says the overall winner is decided across all eight steps.
- Contact details in the source deck: foundersaffair@gmail.com and Instagram @eic.foundersaffair. Contact names/numbers are in `docs/event-facts.md`; show them only when relevant and as transcribed.
- Registration's last recorded status is pending; there is no confirmed public registration URL in the source deck.
- Do not invent dates, venue/room, prices, eligibility, real prize amounts, new partners, claims, testimonials, or registration URLs. Treat unconfirmed items as unconfirmed and ask only if essential.

## 9. Existing code and technical caveats

- Stack: React + TypeScript + Vite/TanStack Start, using existing Tailwind/design tokens and components.
- Existing scene component on the prototype branch: `src/components/site/StoryTunnelScene.tsx`.
- Current hero/scroll integration: `src/components/site/Hero.tsx`.
- Existing palette/design tokens: `src/styles.css`.
- Three.js currently loads via runtime import from `https://esm.sh/three@0.185.0` in the review prototype. This is an acknowledged prototype limitation. Before a production release, install/bundle Three.js as a local project dependency and validate the fallback. Do not claim this is complete until it has been implemented and tested.
- The prototype currently uses custom procedural geometry and generated canvas textures; Quaternius pack models and Poly Haven textures have been researched but are not yet integrated. Do not silently add them merely because the sources are available.

## 10. First-session workflow — follow exactly

**Phase A: Audit**
1. Confirm repository, current branch, latest commit, working-tree status and PR/preview state.
2. Inspect the actual code and current preview. If browser preview is accessible, view the start, mid-scroll, role stations, Day 1/Day 2 section, ring climax and finale. Check mobile/narrow layout and reverse scrolling. Do not claim visual inspection if you cannot do it.
3. Review existing build/test scripts and identify limitations.
4. Report a concise baseline assessment: what currently exists, what is already good, key visual or technical problems, and the three most valuable improvements ranked by impact.

**Phase B: Plan**
5. Propose a small, coherent implementation batch with specific files/components and expected visible effects. Do not redesign unrelated sections.
6. If the work would materially change the approved storyboard, require my approval of the changed direction first. Routine improvements within the approved direction do not need a new storyboard approval.

**Phase C: Implement**
7. Work on `immersive-storyboard-prototype` or a new isolated branch. Preserve the existing architecture, Lovable compatibility and already-published Git history. Do not force-push, rebase, amend or squash published commits.
8. Improve the scene deliberately—lighting, geometry, texture detail, camera composition, timing, typography, responsive handling or performance. Do not use an arbitrary object import as a substitute for art direction.
9. Bundle Three.js locally as a separate production-hardening change if safe and appropriate; otherwise report it as an explicitly uncompleted requirement rather than implying the runtime-CDN caveat is resolved.

**Phase D: Verify**
10. Run `npm run build`, `npm run lint` and relevant tests available in `package.json`. Fix any failures caused by your changes.
11. Test the isolated preview at multiple scroll positions and in reverse, plus mobile width and reduced motion where possible. Check the WebGL fallback if you can.
12. Be exact about what passed, what failed and what could not be checked. Build success alone is not visual QA.

**Phase E: Handoff**
13. Summarize changed files, visible improvements, tests and browser checks, limitations, and what I should inspect.
14. Provide the isolated preview URL: https://founders-affair-storyboard-preview.onrender.com, and request visual feedback before any production merge/deployment.

## 11. Hard production approval gate

Production: https://founders-affair.onrender.com

The current review PR is: https://github.com/akshatambasta-dev/founders-affair/pull/6

Never merge PR #6, merge any branch into `main`, push unapproved visual changes to `main`, or trigger a production deployment until I explicitly approve that action in the current conversation. An open PR, a passing build, or a working preview does not mean I approved production. Keep the isolated preview as the review target.

## 12. What I expect you to do now

Treat this as the start of the project session. Do not simply repeat the brief back to me or respond with a generic checklist. Begin Phase A now: inspect the actual repository/branch/prototype and preview, then tell me the baseline assessment and ranked top three improvements. After that, proceed with a coherent implementation batch within the approved direction, verify it honestly, and stop for my visual review before any production action.

If the current environment cannot access GitHub or the Render preview, explicitly say what you could access and what I need to connect/open. Never invent code inspection, screenshots, build results or deployment status.