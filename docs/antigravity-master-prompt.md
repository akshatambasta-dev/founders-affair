# Antigravity Master Prompt — Founders' Affair

Use this prompt when starting a fresh Antigravity task for the Founders' Affair website. The project context has been captured in this repository so the source pitch deck PDF and reference video do not need to be attached for routine work.

## Repository and working context

- Repository: https://github.com/akshatambasta-dev/founders-affair
- Working branch for immersive review: `immersive-storyboard-prototype`
- Current draft PR: https://github.com/akshatambasta-dev/founders-affair/pull/6
- Production website (do not alter without approval): https://founders-affair.onrender.com
- Isolated visual-review preview: https://founders-affair-storyboard-preview.onrender.com

## First actions — do these before editing

1. Read `AGENTS.md`.
2. Read `docs/creative-brief.md` to understand the reference-video language and approved sequence.
3. Read `docs/event-facts.md` for source-of-truth event copy and known unknowns.
4. Read `docs/immersive-storyboard-prototype.md` to understand the current procedural Three.js scene and its choreography.
5. Read `.agents/skills/founders-affair/SKILL.md` and follow the skill's implementation, validation and release workflow.
6. Inspect the current branch, git status/diff, package scripts, main entry points, available local assets and the actual current preview before changing anything. Do not assume prior conversation summaries equal the current code state.

Do not ask for the pitch-deck PDF or original reference video again just to repeat facts that are already documented. If a crucial visual detail is missing from the written brief, ask only about that specific detail.

## Goal

Continue from the existing immersive storyboard prototype and develop the website into a cohesive, high-quality, cinematic experience. Improve the result through deliberate scene composition, materials, lighting, depth, camera choreography, typography, responsiveness and smooth interactions—not by adding unrelated objects or layers of decoration.

Before substantial implementation, state a concise plan and identify the exact files/components that will change. If a major visual direction is genuinely different from the approved storyboard, present a small proposed visual plan for approval before implementing it.

## Visual storytelling requirements

The intended experience is one continuous, scroll-driven journey:

1. Tactile woven ivory opening establishing EIC. Use the existing `public/eic-logo.svg` and make EIC appear before FOUNDERS' AFFAIR.
2. Fabric parts or opens to reveal one centred mechanical gear/aperture and the title.
3. A continuous, deep industrial tunnel flight built from coherent architectural elements, repeated ribs, rails, brackets, restrained copper milestones and controlled emerald lighting.
4. A clear typographic statement: “Build the company. Move the market. Win the investors.”
5. Five deliberately ordered executive-role stations: CEO, CFO, CMO, COO and CTO.
6. Two simulation-day chapters:
   - Day 1: Acquisition Floor, Boardroom Crisis and Stock Market.
   - Day 2: Brand War and Founders' Affair Investor Marketplace.
7. Three aligned rings representing BUILD / MOVE / FUND, composed as one intentional visual climax.
8. A woven curtain opens into a calmer ending chamber. Use approved copy from the deck, such as “BUILD IT. RUN IT. MOVE IT. SELL IT. FUND IT.”

Art direction:
- Emerald `#0B3D2E`
- Deep black `#0A0A0A`
- Copper `#B8734A`
- Sage `#2E5748`
- Ivory `#EDE7D9`
- Charcoal `#1F1F1F`

The mood is premium editorial craft meeting industrial machinery: tactile textile, convincing surface response, strong silhouette, precise mechanical forms, layered depth, deliberate negative space and restrained cinematic lighting. Avoid neon overload, generic sci-fi HUD clutter, random assets, distracting glows, weak scale, duplicated focal points and visual changes that do not serve the story.

### Cohesion rules

- One normalized scroll-progress value should control camera movement, curtain opening, object reveals and chapter text so the experience stays aligned while scrolling both forwards and backwards.
- Place scene stations deliberately along one camera path with clear centreline, scale, rhythm, spacing and perspective.
- Text remains readable, accessible HTML layered above the 3D scene; don't rely on text baked into a texture.
- Respect reduced-motion preferences, support narrow/mobile screens, maintain a useful fallback when WebGL cannot initialize, and never autoplay audio.
- Do not reintroduce the previously rejected Aero_Station_Ring, Aero_Door or Aero_Lampost model integration.
- Only use external models, code, textures, HDRIs or reference assets after reviewing the exact source, license and fit. Document provenance. Do not assume an asset is suitable because the licence is permissive.
- The current prototype runtime-loads Three.js from esm.sh. Before production hardening, add Three.js as a project dependency and bundle it locally; verify the CSS/non-WebGL fallback. Do not claim this has been done until tested.

## Content and truthfulness

Use `docs/event-facts.md` as the event facts source. In particular:
- Five C-suite roles; one company simulation across two days.
- Deck tagline: “Build the company. Move the market. Win the investors.”
- The deck describes $100,000 as simulated starting capital, not as a real prize.
- Day 1 includes Acquisition Floor, Boardroom Crisis and Stock Market.
- Day 2 includes Brand War and the investor marketplace.
- Registration was last recorded as pending. Do not invent a registration link.
- Do not invent an event date, exact venue, entry price, new sponsor, prize amount or claims absent from the source. Ask for a confirmation only if a missing fact is essential to the requested change.

## Technical workflow

The project uses React, TypeScript, Vite/TanStack Start and the existing design-token system. Follow the existing architecture and component patterns. Avoid wholesale rewrites for isolated improvements.

1. Audit the target section and current preview.
2. Identify one coherent improvement at a time.
3. Implement on `immersive-storyboard-prototype` or a new isolated branch; do not push experimental visuals into `main`.
4. Run `npm run build` and `npm run lint` where available. Run relevant tests if configured.
5. Visually inspect the isolated preview at the beginning, middle and end of the scroll journey, and in reverse. Check desktop and a narrow/mobile viewport. Check reduced motion and WebGL fallback where possible.
6. Fix issues discovered during QA rather than merely listing them.
7. Report exactly what was changed, what commands passed/failed, what browser checks were actually performed, known limitations and what needs user visual approval.

Never claim visual QA, testing or a deployment occurred if it did not.

## Hard release gate

- Production is https://founders-affair.onrender.com.
- The isolated review is https://founders-affair-storyboard-preview.onrender.com.
- PR #6 is a draft review PR.
- Keep all current work isolated and keep production unchanged. Do not merge a PR, update `main`, or trigger a production deployment until I explicitly approve that action in the current conversation.
- A successful build is not visual approval. Always give me the preview and the changes summary first.
- Do not rewrite published Git history, force-push, rebase, amend or squash published commits; this repository is connected to Lovable.

## Expected result from this session

Start by reporting a short audit of the present branch and preview, with the top three high-impact improvements ranked by visual and technical benefit. Then implement the highest-value improvements in a coherent, reviewable batch, unless the current task I gave you asks for a different specific change. Keep changes isolated, validate honestly and stop before any production release.