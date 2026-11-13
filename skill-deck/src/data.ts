// Reps, Studio Lab reels and the reference wall. Edit this file to add or
// change content; the 3D wall, the list and the panel all read from it.

export type Rep = { id: string; track: 'A' | 'C'; t: string; min: number; skill: string; why: string; p: string }

export const TRACKS = {
  A: { name: 'Think with Claude', blurb: 'Get ideas out of your head and into a plan before anything gets built.' },
  C: { name: 'Level up Claude Code', blurb: 'Make Claude remember you, run on a schedule and work in parallel.' },
} as const

export const REPS: Rep[] = [
  { id: 'A1', track: 'A', t: 'Run a real brainstorm', min: 15, skill: 'superpowers:brainstorming', why: 'This skill makes Claude ask one question at a time until you have a spec. It works for a business idea as well as a feature.', p: 'Use the brainstorming skill. I want to start a small creative studio. Ask me one question at a time until we have a one-page plan: what we make, who it is for, and the first three projects.' },
  { id: 'A2', track: 'A', t: 'Have Claude interview you', min: 5, skill: 'AskUserQuestion', why: 'Answering four quick multiple-choice questions beats writing a long prompt.', p: "Before you start, ask me up to 4 multiple-choice questions about anything you'd otherwise have to guess. Then do the work." },
  { id: 'A3', track: 'A', t: 'Plan before anything changes', min: 10, skill: 'plan mode', why: 'Claude shows you a plan and waits for your OK before touching a file. In the terminal, Shift+Tab switches to plan mode.', p: "Plan first and don't edit anything yet. I want to add a new section to my Skill Deck. Show me the plan and wait for my OK." },
  { id: 'A4', track: 'A', t: 'Pressure-test an idea', min: 10, skill: 'none needed', why: 'Claude argues against your idea so you find the weak spots before a client does.', p: "Argue against this idea as a skeptical client: [idea]. Give me 5 reasons you'd say no, then one fix for each." },
  { id: 'A5', track: 'A', t: 'Sketch it on a whiteboard', min: 15, skill: 'Whiteboard artifact', why: 'A canvas you can drag around beats a wall of text when an idea has many parts.', p: 'Make me a whiteboard artifact that maps my creative studio idea: services, the people it serves, three first projects, and what each one needs.' },
  { id: 'C1', track: 'C', t: 'Install a skill and use it', min: 10, skill: 'npx skills add', why: "You already did this with impeccable and stageshow. Do it once more on purpose so it sticks.", p: 'List the skills I have installed in this repo, explain what each one is for in one line, then run /impeccable critique on skill-deck.' },
  { id: 'C2', track: 'C', t: 'Write your own skill', min: 30, skill: 'skill-creator', why: 'Turn a way of working you repeat into a skill Claude can follow every time.', p: 'Use skill-creator to make a skill called esquest-brief. Input: a rough creative idea. Output: a one-page brief with goal, audience, references, deliverables and a first step. Ask me questions first.' },
  { id: 'C3', track: 'C', t: 'Set up a scheduled task', min: 15, skill: 'scheduled tasks', why: 'Claude shows up on its own, so the habit doesn’t depend on remembering.', p: 'Every Monday at 8:40am Pacific, pick my next unfinished rep from the Skill Deck and one design reference from the Studio Lab, and write me a 15-minute plan as a Gmail draft. Don’t send it.' },
  { id: 'C4', track: 'C', t: 'Add a hook', min: 15, skill: 'update-config', why: 'Hooks run on their own, like the one that reminded me to push your skills.', p: 'Add a hook that rebuilds skill-deck and checks it for broken links before every commit.' },
  { id: 'C5', track: 'C', t: 'Run parallel agents', min: 15, skill: 'parallel agents', why: 'Two jobs run at once and you get one merged answer back.', p: 'Use parallel agents: one researches 5 design references for a mural studio, one drafts the studio’s one-page brief. Merge them.' },
  { id: 'C6', track: 'C', t: 'Unblock your missing tools', min: 10, skill: 'environment settings', why: 'Figma, Canva and Slack were blocked in cloud sessions. Once they’re allowed, Claude can work in them.', p: 'Figma, Canva, Slack and HubSpot failed to connect with a proxy 403. Walk me through which hosts to allow in my cloud environment, and propose the change.' },
  { id: 'C7', track: 'C', t: 'Get a review before merging', min: 10, skill: 'code-review', why: 'A second set of eyes on every change before it ships.', p: '/code-review high on my current branch, then --fix whatever is safe to fix.' },
  { id: 'C8', track: 'C', t: 'Learn the five shortcuts', min: 10, skill: 'Claude Code', why: 'Shift+Tab switches modes, @ points at a file, /clear starts fresh, Esc stops Claude, and Esc twice rewinds.', p: 'Teach me the 5 Claude Code shortcuts I’ll use most, with one example each, then quiz me.' },
]

export const REELS = {
  medium: ['murals', 'gallery walls', 'shop signs', 'furniture', 'posters', 'motion graphics', 'installations', 'brand identities', 'album art', 'ceramics'],
  influence: ['Bauhaus', 'Memphis', 'the Swiss grid', 'Light and Space', 'Googie', 'the Eameses', 'Kenya Hara’s emptiness', 'Hockney’s pools', 'Ed Ruscha', 'Op art'],
  twist: ['uses only two colors', 'is fully modular', 'is made from found materials', 'glows at night', 'kids can help make', 'is rooted in Long Beach', 'ships in a week', 'comes with a soundtrack', 'fits in a car trunk', 'changes with the seasons'],
}

export type Ref = { name: string; who: string; tags: string[]; look: string }

export const REFS: Ref[] = [
  { name: 'Bauhaus', who: 'German school, 1919 to 1933', tags: ['Type', 'Color'], look: 'Primary shapes and colors, and furniture built from what the material does best.' },
  { name: 'Interaction of Color', who: 'Josef Albers, 1963', tags: ['Color'], look: 'The same color looks different next to different neighbors. Nested squares make it obvious.' },
  { name: 'Swiss style', who: 'Josef Müller-Brockmann', tags: ['Type'], look: 'Strict grids, flush-left type and photos cropped hard. Every poster is a system.' },
  { name: 'NYC subway map', who: 'Massimo Vignelli, 1972', tags: ['Type', 'Systems'], look: 'Geography bent into clean 45 and 90 degree lines so a stranger reads it at a glance.' },
  { name: 'Film titles', who: 'Saul Bass', tags: ['Motion'], look: 'Cut-paper shapes that move with the music and tell you the film in one minute.' },
  { name: 'Public Theater posters', who: 'Paula Scher, Pentagram', tags: ['Type', 'Space'], look: 'Type crowded edge to edge, loud and joyful, then painted across whole rooms.' },
  { name: 'Memphis Group', who: 'Ettore Sottsass, Milan 1981', tags: ['Objects', 'Color'], look: 'Squiggles, laminate and clashing pastels. Furniture that refuses to be serious.' },
  { name: 'Eames House', who: 'Charles and Ray Eames, Pacific Palisades', tags: ['Objects', 'LA'], look: 'Off-the-shelf steel parts made into a warm home, full of collected things.' },
  { name: 'Ten principles', who: 'Dieter Rams, Braun', tags: ['Objects'], look: 'Good design is as little design as possible. Every part has a reason.' },
  { name: 'Emptiness', who: 'Kenya Hara, MUJI', tags: ['Space'], look: 'White space as a container people fill with their own meaning.' },
  { name: 'Serigraphs', who: 'Corita Kent, Los Angeles', tags: ['Color', 'LA', 'Type'], look: 'Grocery-store slogans and bright inks turned into hopeful hand-pulled prints.' },
  { name: 'Word paintings', who: 'Ed Ruscha', tags: ['Type', 'LA'], look: 'A single word floating over a sunset gradient. Every Building on the Sunset Strip as one long photo.' },
  { name: 'A Bigger Splash', who: 'David Hockney, 1967', tags: ['Color', 'LA'], look: 'Flat California light, a pool, and one frozen splash.' },
  { name: 'Light and Space', who: 'James Turrell, Robert Irwin, Mary Corse', tags: ['Space', 'LA'], look: 'Rooms where light itself is the material and the edges disappear.' },
  { name: 'Googie', who: 'Pann’s, the LAX Theme Building', tags: ['Space', 'LA'], look: 'Boomerangs, starbursts and space-age roofs built to stop cars on the boulevard.' },
  { name: 'Text works', who: 'Barbara Kruger', tags: ['Type'], look: 'White Futura on red bars. A sentence used like a billboard.' },
  { name: 'Hard-edge shapes', who: 'Ellsworth Kelly', tags: ['Color'], look: 'One curve, one color, cut clean. Space around the shape matters as much as the shape.' },
  { name: 'Akari lamps', who: 'Isamu Noguchi', tags: ['Objects', 'Space'], look: 'Paper and bamboo light sculptures that fold flat and glow.' },
]

export const REF_TAGS = ['All', 'Type', 'Color', 'Space', 'Objects', 'Motion', 'LA']
