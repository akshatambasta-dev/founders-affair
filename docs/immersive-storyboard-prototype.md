# Founders’ Affair — immersive storyboard prototype

This prototype implements the approved scene order in src/components/site/StoryTunnelScene.tsx.

## Scene order and object intent

1. Mechanical Iris Aperture opening (EIC): an 8-blade brushed-copper and dark-steel precision iris diaphragm fills the viewport and rotates open on scroll. The EIC logo and presenter copy sit centered over the aperture.
2. Gear aperture (Founders’ Affair reveal): one concentric gear gate sits on the camera path. Its 48 teeth are evenly spaced and its nested rings share one centre.
3. Continuous corridor: one dark interior shell, a centreline, regularly spaced ribs, copper milestone collars, twelve equally repeated brackets and twenty longitudinal rails establish perspective and fill the view.
4. Five executive-role passage: five distinct architectural stations along the corridor: CEO diamond crest, CFO hexagonal valuation vault, CMO radial broadcast fin, COO clockwork meshed gear train, CTO octagonal tech matrix.
5. Two-day simulation:
   - Day 1: 3D Volumetric Financial Depth terrain with dynamic candlestick bars along the floor and walls, framing the central Market Arch.
   - Day 2: Business Conclave Investor Rotunda with 6 vertical illuminated columns framing the portal.
6. Three-part statement: three large rings for Build / Move / Fund architecturally grounded with an industrial cross-beam and vertical copper mounting pylons.
7. Mechanical Iris finale: an 8-blade copper/dark-steel iris diaphragm opens into a calm, resolved final portal.

## Visual and motion rules

- One normalized scroll value drives the camera and chapter-specific movement.
- No model is placed arbitrarily. Repeated parts use fixed intervals, symmetry and a common centreline.
- One camera path passes through each sequence; the scene does not cut to unrelated backgrounds.
- Copy remains HTML above the scene for readability and accessibility.
- Sound is opt-in. Reduced-motion preference removes continuous motion while scroll still navigates the story.
- Textures in this first prototype are generated in-browser from canvas patterns. The visual prototype does not depend on remote GLB URLs.

## Research and provenance

- Showroom — MIT: https://github.com/sutheimernico/showroom. Reviewed for scroll-driven 3D scene architecture and environmental storytelling. The Wet Circuit scene was reviewed as a code reference; it is not embedded as a separate website or canvas.
- Quaternius Modular Sci-Fi Megakit — CC0: https://quaternius.com/packs/modularscifimegakit.html. Reviewed as a possible modular architecture source. This prototype uses custom, deliberately aligned corridor geometry rather than importing pieces that would need to be forced into the storyboard. Asset inserts can be evaluated after the scene composition is approved.
- Poly Haven asset licence — CC0: https://polyhaven.com/license. Reviewed as a source for future PBR materials and HDRIs. The current scene uses generated weave, metal and floor maps so the preview does not depend on remote texture URLs.
- Three.js is bundled locally (`three@^0.185.0`) as a direct project dependency, enabling tree-shaking, predictable bundling and offline resilience. The WebGL fallback remains active if the context cannot initialize.
- Scene 5 (Build / Move / Fund rings) features an architectural grounding cross-beam and vertical mounting pylons connecting to the floor rail.

This is a review prototype. The main branch and existing live site have not been changed by this branch.
