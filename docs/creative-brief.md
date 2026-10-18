# Founders' Affair — creative brief and reference-video storyboard

This document captures the approved project direction from the reference video and the follow-up storyboard discussion. Keep it in sync whenever the user explicitly approves a change. It is meant to let a new agent continue without asking for the same video or design context again.

## Core idea

Founders' Affair is a two-day corporate business simulation presented by EIC at SAII. The experience should feel like entering a crafted, cinematic machine that gradually reveals the company-building game: acquire, operate, move a market, build a brand, pitch, and get funded.

Primary line from the pitch deck:
> Build the company. Move the market. Win the investors.

Supporting phrase from the closing slide:
> BUILD IT. RUN IT. MOVE IT. SELL IT. FUND IT.

The user wants a polished, immersive, premium result—not a generic website with decorative 3D items. Art direction is a meeting of woven textile craft and precise industrial mechanics.

## Brand and visual language

Palette:
- Emerald: `#0B3D2E`
- Deep black: `#0A0A0A`
- Copper: `#B8734A`
- Sage: `#2E5748`
- Ivory: `#EDE7D9`
- Charcoal: `#1F1F1F`

Use the existing EIC mark at `public/eic-logo.svg`; do not redraw, replace or invent it. EIC identity appears before the FOUNDERS' AFFAIR title treatment.

Material cues: tactile ivory woven fabric, tiny fibres and stitch-like texture, muted emerald darkness, brushed/dark metal, restrained copper edges and ring highlights, warm controlled light, subtle dust/atmosphere, editorial type, strong hierarchy, carefully controlled negative space. Keep the palette sophisticated; avoid neon overload, random sci-fi HUDs, unmotivated lens effects or overly busy decoration.

## Captured reference-video beats

The original reference is approximately 28 seconds long. These beats were recorded from review; they are a design reference, not frame-accurate timecodes:

1. **Woven ivory opening:** a calm, tactile fabric surface fills the frame.
2. **Mechanical circular reveal:** the fabric or aperture reveals a precise circular gear/ring mechanism.
3. **Editorial title inside the environment:** typography feels intentionally placed in the physical scene rather than pasted over a disconnected stock background.
4. **Continuous mechanical tunnel flight:** the camera advances through a deep, detailed, perspective-rich corridor. The motion feels like one continuous path, not a set of unrelated background cuts.
5. **Colour shift and three aligned rings:** move from the tunnel toward a simple, strong three-ring statement. The rings are large, composed and aligned.
6. **Curtain finale:** a large fabric curtain opens to reveal a calmer closing chamber. The ending should feel resolved, not abruptly cut off.

## Approved full site story — follow in this order

Treat the site as a scroll-driven cinematic sequence with one primary camera path. It may have clear chapters, but should not feel like unrelated scenes stitched together.

1. **EIC / woven opening.** Full-screen ivory woven fabric, quiet lighting and the EIC logo. Let the audience settle into the texture; keep copy minimal.
2. **Fabric-to-machinery reveal.** The panels part or peel back to reveal one centred circular gear/aperture. The FOUNDERS' AFFAIR title is revealed with intention. Do not add several competing focal points.
3. **Continuous full-screen tunnel.** Move through a coherent industrial corridor. Repeating ribs, longitudinal rails, copper collars and structural brackets can establish scale, but should share a centreline, fixed intervals, symmetry and perspective.
4. **Central statement.** Use the primary line: “Build the company. Move the market. Win the investors.” Let the environment support its rhythm and maintain strong typographic readability.
5. **Five executive roles.** Reveal CEO, CFO, CMO, COO and CTO as five purposeful stations or gates along the same passage. Keep all five spatially ordered and equally legible.
6. **Two-day simulation.** Present Day 1 (Acquisition Floor, Boardroom Crisis, Stock Market) and Day 2 (Brand War, Founders' Affair Investor Marketplace) as stations on the same path. Preserve the causal story: acquire and operate, react to the market, build a brand, then pitch investors.
7. **Three-ring climax.** Three large aligned rings spell BUILD / MOVE / FUND. They should occupy one deliberate composition, not float independently at random depths or angles.
8. **Fabric-curtain finale.** Two woven curtain panels open from the centre to a warmer, calmer ending chamber. Close on “BUILD IT. RUN IT. MOVE IT. SELL IT. FUND IT.” or another already-approved deck line; do not write an invented event promise.

## Scene engineering rules

- One normalized scroll-progress value is the source of truth for the camera, cloth movement, object reveals and chapter transitions. They must remain synchronized in both forward and reverse scrolling.
- Define stations explicitly along the camera path. Prefer shared centreline, designed offsets, repeated spacing and coherent scale. Never scatter unrelated props throughout the tunnel.
- Use the existing procedural Three.js scene as the initial composition baseline. Improve shape, depth, lighting, texturing and movement together rather than importing models just to increase object count.
- The earlier experimental integration of individual Aero_Station_Ring, Aero_Door and Aero_Lampost public models was rejected by the user. Do not reintroduce them.
- The current prototype uses generated Canvas textures and custom geometry. Quaternius assets and Poly Haven materials were reviewed as possible sources but have not been approved/embedded into this scene. Before adding any asset, verify the exact item, licence, fit and provenance; describe why it improves the approved composition.
- Important headlines, role names and event facts remain accessible HTML, not texture lettering. Keep contrast, focus order and responsive type strong.
- The page must remain useful if WebGL is unavailable. Respect reduced motion; do not force sound or autoplay audio.
- A preview that builds successfully is not automatically visually approved. The user must inspect and approve before production merge/deploy.

## Existing repo/preview landmarks

- Main application: React/TypeScript, Vite/TanStack Start.
- Existing logo: `public/eic-logo.svg`.
- Procedural scene: `src/components/site/StoryTunnelScene.tsx` on the review branch.
- Existing scene implementation notes: `docs/immersive-storyboard-prototype.md`.
- Production site (read-only until approval): https://founders-affair.onrender.com
- Visual-review branch: `immersive-storyboard-prototype`
- Isolated preview: https://founders-affair-storyboard-preview.onrender.com
- Draft PR: https://github.com/akshatambasta-dev/founders-affair/pull/6

Do not request the old PDF/video again for routine iteration. Refer to this brief and the event facts first. If a future request requires exact matching to a detail not captured here, ask one focused question about that missing detail rather than restarting the whole brief.
