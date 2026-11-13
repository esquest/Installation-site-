# Project memory

## Esquest Skill Deck (`skill-deck/`)

A playful personal training page for learning Claude and Claude Code. It's published as a private claude.ai Artifact:
https://claude.ai/artifact/AzxqYUvFcQ6Cef9L3CHdz3 (republish to this same URL with the Artifact tool's `url`).

- **Edit content** in `skill-deck/src/data.ts` (reps, Studio Lab reels, the reference wall).
- **Build:** `cd skill-deck && npm install && npm run build` writes `dist/skill-deck.html`, a single self-contained file with the JS and CSS inlined.
- **Stack:** React + three.js (`src/scene.ts`, the 3D gallery wall), with a Stageshow demo (`src/demo/EsqRep.tsx`, using the copied `skill-deck/kit`).
- **Look:** kraft-paper templates taped to a plaster wall. Hanging a rep peels the template and drops in a framed artwork. A laser-level sweeps the wall on load, and confetti fires when a frame is hung. The user picked this direction through impeccable. Tokens are in `skill-deck/DESIGN.md`, and product facts are in `skill-deck/PRODUCT.md`.

### Decisions so far
- The user wants it to feel like a **fun site**, not a deck, with motion and interactive elements. Unreal Engine can't run in a web page, so three.js covers this.
- **Removed:** the job loop, the website track and the run-the-business track. The installation business is out of scope here.
- **Kept:** the tracks A (Think with Claude) and C (Level up Claude Code), plus the Studio Lab (an idea spinner for a creative studio and a reference wall of design/art references).
- **More tracks will be added later.** Add them in `data.ts`; the `track` type is `'A' | 'C'`, so extend it there.
- The user is new to Claude Code and opens the page on both phone and laptop. Keep the copy plain.
- Progress and pinned references are saved per browser (localStorage).

### Skills installed in this repo
`.claude/skills/impeccable` (design), `.claude/skills/stageshow` (faux product UI demos).
