// The ARC-AGI-3 section's content. Lessons are quoted from the research
// repository's docs/lessons (lightly trimmed); competition facts come from the
// public competition pages. No scores or rankings are shown on purpose.

const lesson = (file: string) =>
  `https://github.com/JustAdev742/Arc-Agi-3-Kaggle-comp/blob/HEAD/docs/lessons/${file}`

export const fieldNotes = [
  {
    no: '0001',
    title: 'Exploration is quadratically expensive',
    body: 'A level scores the square of human actions over agent actions. Twice the human count already costs three quarters of the level.',
    href: lesson('0001-scorer-facts.md'),
  },
  {
    no: '0003',
    title: 'Blind search is worthless here',
    body: 'Random and novelty search finish a few early levels, but at 10–100× the human action count, which the metric rounds to zero.',
    href: lesson('0003-blind-search-is-worthless-for-rhae.md'),
  },
  {
    no: '0008',
    title: 'Connected components are not entities',
    body: 'Separate terrain from sprites before fitting rules, or most “events” are artefacts of something walking over the floor.',
    href: lesson('0008-terrain-vs-sprites.md'),
  },
  {
    no: '0009',
    title: 'Calls are the budget',
    body: 'A game gets about 35 model calls in its 20 minutes. Design every helper to save calls, not tokens.',
    href: lesson('0009-calls-are-the-budget.md'),
  },
  {
    no: '0010',
    title: 'A verifier needs a stop rule',
    body: 'A world model that is wrong three times running is not being revised. Retire it and refit from the evidence.',
    href: lesson('0010-verifier-needs-a-stop-rule.md'),
  },
] as const

/** The loop the agent is built around (docs/ARC-AGI-3_Research_Vision.md). */
export const loop = [
  { id: 'observe', label: 'Observe', note: 'Parse the frame exactly: components, diffs, scale.' },
  { id: 'hypothesize', label: 'Hypothesise', note: 'Propose what each action might do.' },
  { id: 'test', label: 'Test', note: 'Spend one action to tell the hypotheses apart.' },
  { id: 'model', label: 'Model', note: 'Write the rule down as code that predicts the next frame.' },
  { id: 'plan', label: 'Plan', note: 'Search the model, not the game, for the shortest route.' },
  { id: 'act', label: 'Act', note: 'Send the actions. Every one is counted.' },
  { id: 'learn', label: 'Learn', note: 'Keep what held, for the next level.' },
] as const

export type LoopPhase = (typeof loop)[number]['id']

export const pipeline = [
  {
    label: 'Frame',
    title: 'Up to 64 × 64 cells',
    body: '16 colours, no instructions. Only the game knows what its actions do.',
  },
  {
    label: 'Perception',
    title: 'Exact, not estimated',
    body: 'Components, frame diffs, scale detection and an entity tracker, available to the model as code.',
  },
  {
    label: 'World model',
    title: 'Written, then checked',
    body: 'The model writes the game’s rules as code and verifies each prediction against the real frame.',
  },
  {
    label: 'Planner',
    title: 'Search before spending',
    body: 'Shortest paths through the model’s own simulation, before the agent sends a single real action.',
  },
  {
    label: 'Action',
    title: 'Counted against a human',
    body: 'RESET, ACTION1–7, and a click with coordinates. The fewer, the better.',
  },
] as const
