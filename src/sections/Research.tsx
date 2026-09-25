import { fieldNotes, pipeline } from '../content/research'
import { links } from '../content/site'
import { projectById } from '../content/projects'
import { AgentLoop } from '../components/research/AgentLoop'
import { ActionLink } from '../components/ui/Action'
import { ArrowUpRight } from '../components/ui/Icon'
import { Eyebrow, Lines, reveal, Section } from '../components/ui/Section'
import { StatusChip } from '../components/ui/StatusChip'

// ARC-AGI-3 as a research programme: what the benchmark asks, how the agent
// works, and how the work is run. No scores or rankings, on purpose.

const asks = [
  {
    title: 'No instructions',
    body: 'Each game is a grid of up to 64 × 64 cells in 16 colours. The agent gets frames and a handful of actions; what each action does is for it to find out.',
  },
  {
    title: 'Efficiency is the score',
    body: 'A level scores the square of human actions over agent actions. Twice the human’s moves earns a quarter of the level, so wandering is ruinous.',
  },
  {
    title: 'Offline, on the clock',
    body: 'Submissions run on Kaggle with the internet switched off and 9 hours to play every hidden game. The model, its weights and every tool have to ship inside the notebook.',
  },
]

const discipline = ['State the hypothesis', 'Run the fixed evaluation', 'Keep it or revert it', 'Write it in the log']

const external = [
  { label: 'ARC Prize 2026 on Kaggle', href: links.kaggleCompetition },
  { label: 'ARC-AGI-3 at ARC Prize', href: links.arcAgi3 },
  { label: 'ARC-AGI-3 documentation', href: links.arcDocs },
]

export function Research() {
  const agent = projectById.get('arc-agi-3')!

  return (
    <Section id="research" labelledBy="research-title" canvas="cool" className="pt-[var(--section-y)]">
      <div className="shell">
        <div className="grid-12 gap-y-10">
          <div className="col-span-4 flex flex-col gap-8 md:col-span-12 lg:col-span-7">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3" {...reveal('fade')}>
              <Eyebrow index="03">Research</Eyebrow>
              <StatusChip status={{ label: 'Competing in ARC Prize 2026', tone: agent.status.tone }} />
            </div>
            <Lines id="research-title" sectionHeading className="caps-display text-display" lines={['ARC-AGI-3']} />
            <p className="max-w-[34ch] text-[clamp(1.375rem,1.1rem+1vw,2rem)] font-medium leading-[1.2] tracking-[-0.015em]" {...reveal('up', 120)}>
              Can an agent learn a game it has never seen, with no instructions, as efficiently as a person?
            </p>
          </div>
          <div className="col-span-4 flex flex-col justify-end gap-8 md:col-span-8 lg:col-span-5 lg:pl-[8%]">
            <p className="text-fg-muted" {...reveal('up', 200)}>
              Jovian Games is competing in ARC-AGI-3 on Kaggle, part of ARC Prize 2026. ARC-AGI-3 is the interactive edition of the Abstraction and Reasoning Corpus. The work is ongoing: final submissions close on 2 November 2026.
            </p>
            <div className="flex flex-wrap gap-3" {...reveal('up', 260)}>
              <ActionLink href={links.kaggleCompetition}>The competition on Kaggle</ActionLink>
              <ActionLink href={links.arcRepo} variant="secondary">
                Research repository
              </ActionLink>
            </div>
          </div>
        </div>

        <div className="mt-[clamp(4rem,8vw,7rem)]">
          <h3 className="label" {...reveal('fade')}>
            What the benchmark asks
          </h3>
          <div className="hairline-grid mt-6 md:grid-cols-3" {...reveal('fade')}>
            {asks.map((item, index) => (
              <div key={item.title} className="py-6 md:px-6 md:first:pl-0 md:last:pr-0">
                <div className="flex flex-col gap-3" {...reveal('up', index * 70)}>
                  <p className="label text-research">{String(index + 1).padStart(2, '0')}</p>
                  <h4 className="text-h3 font-semibold tracking-[-0.015em]">{item.title}</h4>
                  <p className="text-fg-muted">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-[clamp(5rem,10vw,9rem)] flex flex-col gap-10">
          <div className="grid-12 gap-y-6">
            <h3 className="col-span-4 text-h2 font-semibold tracking-[-0.025em] md:col-span-6" {...reveal('up')}>
              Observe, hypothesise, test, model, plan, act, learn.
            </h3>
            <p className="col-span-4 self-end text-fg-muted md:col-span-5 md:col-start-8" {...reveal('up', 100)}>
              The agent is meant to behave less like a chatbot answering a puzzle and more like a small team of researchers investigating an unknown world. It should say what it doesn’t know, run the experiment that tells two ideas apart, and drop a model as soon as reality disagrees with it.
            </p>
          </div>
          <div {...reveal('up')}>
            <AgentLoop />
          </div>
        </div>

        <div className="mt-[clamp(5rem,10vw,9rem)]">
          <div className="grid-12 gap-y-6">
            <h3 className="col-span-4 text-h2 font-semibold tracking-[-0.025em] md:col-span-6" {...reveal('up')}>
              How our agent plays
            </h3>
            <p className="col-span-4 self-end text-fg-muted md:col-span-5 md:col-start-8" {...reveal('up', 100)}>
              One local model, served offline, plays by writing and running code in a persistent Python sandbox. Anything code can compute exactly, code computes; the model spends its calls on judgement.
            </p>
          </div>
          <ol className="mt-10 grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-5" {...reveal('fade')}>
            {pipeline.map((stage, index) => (
              <li key={stage.label} className="relative bg-canvas py-6 pr-6 transition-colors duration-700 sm:[&:nth-child(2n)]:pl-5 lg:px-5 lg:first:pl-0 lg:[&:nth-child(2n)]:pl-5">
                <div className="flex flex-col gap-3" {...reveal('up', index * 70)}>
                  <p className="label flex items-center gap-2 text-research">
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    <span className="text-fg-subtle">{stage.label}</span>
                  </p>
                  <h4 className="font-semibold">{stage.title}</h4>
                  <p className="text-small text-fg-muted">{stage.body}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-6 flex flex-wrap gap-x-3 gap-y-2" {...reveal('fade')}>
            {agent.stack.map((item) => (
              <span key={item} className="label rounded-[2px] border border-line px-2 py-1">
                {item}
              </span>
            ))}
            <span className="label rounded-[2px] border border-line px-2 py-1">RTX PRO 6000</span>
          </p>
        </div>

        <div className="mt-[clamp(5rem,10vw,9rem)] grid-12 gap-y-10 border-t border-line-strong pt-10">
          <div className="col-span-4 flex flex-col gap-4 md:col-span-12 lg:col-span-5" {...reveal('up')}>
            <h3 className="text-h3 font-semibold tracking-[-0.015em]">Every change is a hypothesis</h3>
            <p className="text-fg-muted">
              We split the 25 public games in two: 19 to develop against and 6 we never tune on. Two identical runs can score differently, so a small effect has to hold across several runs before it counts.
            </p>
          </div>
          <ol className="col-span-4 grid grid-cols-2 gap-px bg-line md:col-span-12 md:grid-cols-4 lg:col-span-6 lg:col-start-7" {...reveal('fade')}>
            {discipline.map((step, index) => (
              <li key={step} className="bg-canvas p-4 transition-colors duration-700">
                <div className="flex flex-col gap-2" {...reveal('up', index * 60)}>
                  <span className="label text-research">{String(index + 1).padStart(2, '0')}</span>
                  <span className="text-small font-medium">{step}</span>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-[clamp(5rem,10vw,9rem)]">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <h3 className="text-h2 font-semibold tracking-[-0.025em]" {...reveal('up')}>
              Field notes
            </h3>
            <p className="max-w-[44ch] text-fg-muted" {...reveal('up', 80)}>
              The repository records every lesson that holds on more than one game. A few of them:
            </p>
          </div>
          <ul className="mt-10 grid gap-x-[var(--gutter)] gap-y-8 sm:grid-cols-2 lg:grid-cols-5">
            {fieldNotes.map((note, index) => (
              <li key={note.no} {...reveal('up', index * 60)}>
                <a href={note.href} target="_blank" rel="noopener noreferrer" className="group flex h-full flex-col gap-3 border-t border-research/60 pt-4">
                  <span className="label flex items-center justify-between">
                    Lesson {note.no}{' '}
                    <ArrowUpRight className="text-fg-subtle transition-[transform,color] duration-[var(--dur-hover)] group-hover:-translate-y-px group-hover:translate-x-px group-hover:text-research" />
                  </span>{' '}
                  <span className="font-semibold underline decoration-transparent decoration-1 underline-offset-[0.22em] transition-colors group-hover:decoration-fg">{note.title}</span>{' '}
                  <span className="text-small text-fg-muted">{note.body}</span>
                  <span className="sr-only"> (opens the lesson on GitHub in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-line pt-8 md:flex-row md:items-center md:justify-between" {...reveal('fade')}>
          <p className="label">Read more</p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {external.map((link) => (
              <li key={link.href}>
                <a href={link.href} target="_blank" rel="noopener noreferrer" className="group inline-flex min-h-11 items-center gap-1.5 text-small font-medium text-fg-muted transition-colors hover:text-fg">
                  {link.label}
                  <ArrowUpRight size={14} className="transition-transform group-hover:-translate-y-px group-hover:translate-x-px" />
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  )
}
