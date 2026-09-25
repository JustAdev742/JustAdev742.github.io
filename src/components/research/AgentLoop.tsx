// An illustration of the loop the agent is built around, played out on a toy
// grid. It is not an ARC-AGI-3 game and not a recording of our agent; it shows
// the method: perceive exactly, test cheaply, model, plan against the model,
// then spend as few real actions as possible, because every one is scored.

import { useEffect, useRef, useState } from 'react'
import { loop, type LoopPhase } from '../../content/research'
import { useAmbientMotion } from '../../hooks/useAmbientMotion'
import { cn } from '../../lib/cn'
import { MotionToggle } from '../ui/MotionToggle'

const MAPS = [
  [
    '############',
    '#A....#....#',
    '#.##..#.##.#',
    '#..#....#..#',
    '##.#.####.##',
    '#..#......##',
    '#.####.##..#',
    '#......#...#',
    '###.####.#.#',
    '#........#G#',
    '#.###......#',
    '############',
  ],
  [
    '############',
    '#.....#...G#',
    '#.###.#.##.#',
    '#...#...#..#',
    '###.###.#.##',
    '#.....#....#',
    '#.###.####.#',
    '#.#......#.#',
    '#.#.####.#.#',
    '#A..#......#',
    '#.......##.#',
    '############',
  ],
  [
    '############',
    '#...#......#',
    '#.#.#.####.#',
    '#.#...#....#',
    '#.#####.####',
    '#......A...#',
    '####.#####.#',
    '#....#...#.#',
    '#.####.#.#.#',
    '#G.....#...#',
    '#......#####',
    '############',
  ],
]

type Cell = [number, number]

function parse(map: string[]) {
  let start: Cell = [1, 1]
  let goal: Cell = [1, 1]
  const walls = new Set<string>()
  map.forEach((row, y) =>
    [...row].forEach((ch, x) => {
      if (ch === '#') walls.add(`${x},${y}`)
      if (ch === 'A') start = [x, y]
      if (ch === 'G') goal = [x, y]
    }),
  )
  return { walls, start, goal, size: map.length }
}

/** Shortest path through the agent's own model of the grid. */
function bfs(walls: Set<string>, start: Cell, goal: Cell): Cell[] {
  const key = (c: Cell) => `${c[0]},${c[1]}`
  const previous = new Map<string, Cell | null>([[key(start), null]])
  const queue: Cell[] = [start]
  while (queue.length) {
    const cell = queue.shift()!
    if (cell[0] === goal[0] && cell[1] === goal[1]) break
    for (const [dx, dy] of [
      [0, -1],
      [1, 0],
      [0, 1],
      [-1, 0],
    ] as const) {
      const next: Cell = [cell[0] + dx, cell[1] + dy]
      if (walls.has(key(next)) || previous.has(key(next))) continue
      previous.set(key(next), cell)
      queue.push(next)
    }
  }
  const path: Cell[] = []
  let at: Cell | null = goal
  while (at) {
    path.unshift(at)
    at = previous.get(key(at)) ?? null
  }
  return path
}

/** Each round's world is fixed by its map, so compute it once. */
const worlds = new Map<number, ReturnType<typeof buildWorld>>()
function buildWorld(index: number) {
  const parsed = parse(MAPS[index]!)
  const best = bfs(parsed.walls, parsed.start, parsed.goal)
  // The probe: one action spent only to learn what it does. It usually
  // isn't on the best route, which is exactly what makes probing expensive.
  const [sx, sy] = parsed.start
  const free = (
    [
      [sx, sy - 1],
      [sx + 1, sy],
      [sx, sy + 1],
      [sx - 1, sy],
    ] as Cell[]
  ).filter(([x, y]) => !parsed.walls.has(`${x},${y}`))
  const onRoute = best[1]!
  const probe = free.find(([x, y]) => x !== onRoute[0] || y !== onRoute[1]) ?? onRoute
  const plan = bfs(parsed.walls, probe, parsed.goal)
  return { ...parsed, best, probe, plan }
}
function worldFor(round: number) {
  const index = round % MAPS.length
  let world = worlds.get(index)
  if (!world) {
    world = buildWorld(index)
    worlds.set(index, world)
  }
  return world
}

// Timeline, in ticks of 150 ms.
const TICK = 150
const PHASE_TICKS: Record<LoopPhase, number> = { observe: 12, hypothesize: 10, test: 8, model: 8, plan: 10, act: 0, learn: 12 }
const ACT_TICKS_PER_STEP = 2

function durationsFor(round: number) {
  const steps = worldFor(round).plan.length - 1
  return loop.map((phase) => (phase.id === 'act' ? steps * ACT_TICKS_PER_STEP : PHASE_TICKS[phase.id]))
}
function totalFor(round: number) {
  return durationsFor(round).reduce((sum, value) => sum + value, 0)
}

export function AgentLoop() {
  const playing = useAmbientMotion()
  const root = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  const [{ round, tick }, setClock] = useState({ round: 0, tick: 0 })
  const world = worldFor(round)

  const planFrom = world.probe
  const plan = world.plan
  const humanBaseline = world.best.length - 1
  const agentActions = 1 + (plan.length - 1)

  const durations = durationsFor(round)

  let phaseIndex = 0
  let into = tick
  while (phaseIndex < durations.length - 1 && into >= durations[phaseIndex]!) {
    into -= durations[phaseIndex]!
    phaseIndex++
  }
  const phase = loop[phaseIndex]!.id

  useEffect(() => {
    const el = root.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => setInView(Boolean(entry?.isIntersecting)), { threshold: 0.25 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!playing || !inView) return
    const id = window.setInterval(() => {
      setClock((clock) => (clock.tick + 1 < totalFor(clock.round) ? { round: clock.round, tick: clock.tick + 1 } : { round: clock.round + 1, tick: 0 }))
    }, TICK)
    return () => window.clearInterval(id)
  }, [playing, inView])

  // Where the avatar is, given the phase.
  const actStepsDone = phase === 'act' ? Math.min(plan.length - 1, Math.floor(into / ACT_TICKS_PER_STEP) + 1) : phase === 'learn' ? plan.length - 1 : 0
  const afterTest = phaseIndex >= 2 && (phase !== 'test' || into >= 3)
  const avatar: Cell = phase === 'act' || phase === 'learn' ? plan[actStepsDone]! : afterTest ? planFrom : world.start
  const actionsSpent = (afterTest ? 1 : 0) + actStepsDone
  const budget = Math.max(0, 1 - actionsSpent / (humanBaseline * 3))
  const solved = phase === 'learn'
  const score = Math.min((humanBaseline / agentActions) ** 2, 1)

  const cell = 100 / world.size
  const showComponents = phase === 'observe' && into > 2
  const showDiff = phase === 'test' && into >= 3
  const showPlan = phase === 'plan' || phase === 'act'
  const planShown = phase === 'plan' ? Math.min(plan.length, Math.ceil(((into + 1) / PHASE_TICKS.plan) * plan.length)) : plan.length

  const notes: Record<LoopPhase, string> = {
    observe: `${world.walls.size} wall cells · 1 small object · 1 marker`,
    hypothesize: 'H1: the arrows move the blue cell. H2: the marker is the goal.',
    test: 'Spend one action. Predicted: the blue cell moves one step.',
    model: 'Prediction matched the frame. H1 kept, written as code.',
    plan: `Searching the model: ${plan.length - 1} moves to the marker.`,
    act: `Executing the plan. Actions spent: ${actionsSpent}.`,
    learn: 'Level complete. Goal kind and move rule carried to the next level.',
  }

  return (
    <div ref={root} className="grid-12 gap-y-10">
      <figure className="col-span-4 flex flex-col gap-4 md:col-span-7">
        <div className="frame overflow-hidden bg-[var(--slate-900)] p-[4%]">
          {/* Budget bar: every game draws one; running out loses the attempt. */}
          <div className="mb-[3%] flex h-2 gap-[2px]" aria-hidden="true">
            {Array.from({ length: 24 }, (_, i) => (
              <span
                key={i}
                className={cn('flex-1 transition-colors duration-300', i / 24 < budget ? 'bg-[var(--arc-magenta)]' : 'bg-[var(--slate-800)]')}
              />
            ))}
          </div>
          <svg viewBox="0 0 100 100" className="aspect-square w-full" role="img" aria-label="Illustration of an agent exploring a small grid: walls, a blue cell it controls, and a yellow marker it plans a route to.">
            {[...world.walls].map((w) => {
              const [x, y] = w.split(',').map(Number) as Cell
              return <rect key={w} x={x * cell} y={y * cell} width={cell} height={cell} fill="var(--slate-700)" />
            })}
            {/* The marker */}
            <rect x={world.goal[0] * cell + 1} y={world.goal[1] * cell + 1} width={cell - 2} height={cell - 2} fill="none" stroke="var(--arc-yellow)" strokeWidth={1.2} />
            <rect
              x={world.goal[0] * cell + 2.6}
              y={world.goal[1] * cell + 2.6}
              width={cell - 5.2}
              height={cell - 5.2}
              fill="var(--arc-yellow)"
              opacity={solved ? 1 : 0.35}
              style={{ transition: 'opacity 300ms' }}
            />
            {/* The plan, searched in the model before any action is spent */}
            {showPlan
              ? plan.slice(0, planShown).map(([x, y], i) => (
                  <circle key={`${x},${y}`} cx={x * cell + cell / 2} cy={y * cell + cell / 2} r={0.9} fill="var(--europa-400)" opacity={phase === 'act' && i <= actStepsDone ? 0.15 : 0.9} />
                ))
              : null}
            {/* The frame diff after the test action */}
            {showDiff ? (
              <>
                <rect x={world.start[0] * cell} y={world.start[1] * cell} width={cell} height={cell} fill="none" stroke="var(--europa-400)" strokeWidth={0.8} strokeDasharray="1.4 1" />
                <rect x={planFrom[0] * cell} y={planFrom[1] * cell} width={cell} height={cell} fill="none" stroke="var(--europa-400)" strokeWidth={0.8} strokeDasharray="1.4 1" />
              </>
            ) : null}
            {/* The avatar */}
            <rect
              x={avatar[0] * cell + 0.8}
              y={avatar[1] * cell + 0.8}
              width={cell - 1.6}
              height={cell - 1.6}
              fill="var(--arc-blue)"
              style={{ transition: 'x 140ms linear, y 140ms linear' }}
            />
            {/* Components found by exact perception */}
            {showComponents ? (
              <>
                <rect x={0.4} y={0.4} width={99.2} height={99.2} fill="none" stroke="var(--europa-400)" strokeWidth={0.5} strokeDasharray="2 1.4" opacity={0.7} />
                <rect x={avatar[0] * cell - 0.6} y={avatar[1] * cell - 0.6} width={cell + 1.2} height={cell + 1.2} fill="none" stroke="var(--europa-400)" strokeWidth={0.6} />
                <rect x={world.goal[0] * cell - 0.6} y={world.goal[1] * cell - 0.6} width={cell + 1.2} height={cell + 1.2} fill="none" stroke="var(--europa-400)" strokeWidth={0.6} />
              </>
            ) : null}
          </svg>
          <span className="ticks" aria-hidden="true" />
        </div>
        <figcaption className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 text-small text-fg-subtle">
          <span>Illustration only: a toy grid world, not an ARC-AGI-3 game or a recording of our agent.</span>
          <MotionToggle className="-mr-2" />
        </figcaption>
      </figure>

      <div className="col-span-4 flex flex-col gap-8 md:col-span-5 md:pl-4">
        <ol className="flex flex-col" aria-label="The loop">
          {loop.map((step, index) => {
            const active = index === phaseIndex
            return (
              <li
                key={step.id}
                aria-current={active ? 'step' : undefined}
                className={cn('grid grid-cols-[2.25rem_1fr] items-baseline gap-x-3 border-b border-line py-2.5 transition-colors duration-300', active ? 'text-fg' : 'text-fg-subtle')}
              >
                <span className={cn('label transition-colors', active ? 'text-research' : 'text-fg-subtle')}>{String(index + 1).padStart(2, '0')}</span>
                <span className="flex flex-col">
                  <span className="font-semibold">{step.label}</span>
                  <span className={cn('grid text-small text-fg-muted transition-[grid-template-rows,opacity] duration-300 ease-[var(--ease-out)]', active ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0')}>
                    <span className="overflow-hidden">{step.note}</span>
                  </span>
                </span>
              </li>
            )
          })}
        </ol>

        <div className="flex flex-col gap-3 rounded-[var(--radius-frame)] border border-line bg-surface-1 p-5 font-mono text-[0.8125rem] leading-[1.6] [font-stretch:87.5%]">
          <p className="label text-research">Agent log</p>
          <p aria-live="off" className="min-h-[3.2em] text-fg">
            {notes[phase]}
          </p>
          <dl className="grid grid-cols-3 gap-3 border-t border-line pt-3 tabular-nums">
            <div>
              <dt className="label">Actions</dt>
              <dd className="text-fg">{actionsSpent}</dd>
            </div>
            <div>
              <dt className="label">Human</dt>
              <dd className="text-fg">{humanBaseline}</dd>
            </div>
            <div>
              <dt className="label">Level score</dt>
              <dd className="text-fg">
                {solved ? (
                  score.toFixed(2)
                ) : (
                  <>
                    <span aria-hidden="true">—</span>
                    <span className="sr-only">not scored yet</span>
                  </>
                )}
              </dd>
            </div>
          </dl>
          <p className="text-small text-fg-subtle [font-family:var(--font-sans)] [font-stretch:100%]">
            Score = (human actions ÷ agent actions)². Here, {agentActions - humanBaseline} extra actions cost {Math.round((1 - score) * 100)}% of the level.
          </p>
        </div>
      </div>
    </div>
  )
}
