# Design: Esquest Skill Deck

World: kraft-paper templates taped to a gallery wall. Reps start as templates and become framed art when hung.

## Tokens (src/styles.css)
| Token | Light | Dark | Role |
|---|---|---|---|
| --wall | #E9ECE8 | #2A2D2B | Page ground, plaster wall |
| --paper | #F7F8F5 | #232624 | Quiet band, prompt boxes |
| --card | #FFFFFF | #2A2D2B | Rep panel |
| --ink | #1C1B19 | #F1EFE9 | Text |
| --muted | #5C6058 | #A9ADA5 | Secondary text |
| --kraft / --kraft-ink | #C8995F / #3A2614 | same | Templates, rep IDs, reels |
| --tape | #2F7DF6 | #5B9BFF | Primary action, focus, tape strips |
| --tomato --sun --pool --pink | #FF5A36 #FFC21A #1FB5D6 #FF8FB1 | same | Rewards: artworks, spin button, reference cards |

Type: Bricolage Grotesque (display, 800), Figtree (body), Kalam (pencil notes on templates and reel labels), JetBrains Mono (prompts only).

## Signature moves
- The 3D wall (`src/scene.ts`): a laser-level sweep on load, hover lift, hanging a rep peels the template and drops a framed artwork with a level wobble and confetti. Drag to pan on phones.
- Studio Lab slot reels: three kraft reels with locks, plus a pressable tomato spin button.
- The Stageshow demo of a rep running in Claude Code (`src/demo/EsqRep.tsx`).

The Studio Lab band is inverted (ink ground). Reference cards are pastel gallery labels.
Reduced motion: the wall draws its final state, and the reels and panel skip animation.
