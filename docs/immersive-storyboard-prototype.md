# Founders’ Affair — immersive storyboard prototype

This prototype implements the approved scene order in src/components/site/StoryTunnelScene.tsx.

## Scene order and object intent

1. Woven opening (EIC): two woven sheets fill the viewport and part from the centre. The EIC logo and presenter copy sit over the fabric.
2. Gear aperture (Founders’ Affair reveal): one concentric gear gate sits on the camera path. Its 48 teeth are evenly spaced and its nested rings share one centre.
3. Continuous corridor: one dark interior shell, a centreline, regularly spaced ribs, copper milestone collars, twelve equally repeated brackets and twenty longitudinal rails establish perspective and fill the view.
4. Five executive-role passage: five centred gates at fixed depth intervals accompany the C-suite text. They are a sequence along the same corridor, not a scatter of props.
5. Two-day simulation: Day 1 has a three-ring station; Day 2 has a converging investor portal. These are positioned at their matching scroll chapters.
6. Three-part statement: three large rings are aligned on one plane for the Build / Move / Fund beat.
7. Curtain chamber: paired woven panels open from the centre to reveal a warmer portal and calmer final frame.

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
