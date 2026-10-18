# Founders' Affair — immersive event website

Founders' Affair is a two-day corporate simulation by EIC at SAII. This repository contains the website and the experimental immersive, scroll-driven story tunnel.

## Start here (especially for AI coding agents)

Before any project work, read:

1. [Persistent project rules](AGENTS.md)
2. [Creative brief and storyboard](docs/creative-brief.md)
3. [Verified event facts](docs/event-facts.md)
4. [Current immersive prototype notes](docs/immersive-storyboard-prototype.md)
5. [Antigravity setup](docs/antigravity-setup.md)
6. [Reusable Antigravity skill](.agents/skills/founders-affair/SKILL.md)

The reference-video storyboard and pitch-deck facts are written into the repo so ordinary follow-up tasks do not require re-uploading the original video or PDF. Update the tracked context when the user explicitly changes or confirms information.

## Important environments

- **Production:** https://founders-affair.onrender.com
- **Isolated visual-review preview:** https://founders-affair-storyboard-preview.onrender.com
- **Prototype branch:** `immersive-storyboard-prototype`
- **Draft PR:** https://github.com/akshatambasta-dev/founders-affair/pull/6

Keep development on the prototype branch or another isolated branch. Do not merge to `main` or deploy to production without explicit user approval.

## Stack and local development

The project uses React, TypeScript, Vite/TanStack Start, Tailwind CSS and existing project components.

Requirements: Node.js and npm.

```sh
npm install
npm run dev
```

Useful checks:

```sh
npm run build
npm run lint
npm test
```

Use the exact package scripts in `package.json`; tests or commands may not be configured for every area. Report which checks were actually run and their results.

## Lovable workflow

This repository is also connected to [Lovable](https://lovable.dev). Preserve published Git history—do not force-push or rewrite already-published commits. Keep experimental work isolated and make sure it remains in a working state.
