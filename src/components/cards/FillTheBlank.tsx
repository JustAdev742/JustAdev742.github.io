import { useId, useRef, useState, type KeyboardEvent } from 'react'
import { cn } from '../../lib/cn'

// The TV's trick, in miniature: pick a white card and it writes itself into
// the black one. Card text is from Cards Against Humanity's own Family Edition
// (CC BY-NC-SA 2.0), as it ships in the game.

const PROMPT = { before: 'The aliens are here. They want', after: '.' }
const ANSWERS = ['Space lasers', 'The huge, stupid moon', 'Eight hours of video games', 'Pirate music']
const TILTS = ['-rotate-[5deg]', '-rotate-[1.5deg]', 'rotate-[2deg]', 'rotate-[5.5deg]']

export function FillTheBlank() {
  const uid = useId()
  const [picked, setPicked] = useState<number | null>(null)
  const cards = useRef<(HTMLButtonElement | null)[]>([])
  const answer = picked === null ? null : ANSWERS[picked]!
  // Radio group keyboard model: one tab stop, arrows move and select.
  const tabStop = picked ?? 0

  const onKeyDown = (event: KeyboardEvent) => {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key]
    if (!step) return
    event.preventDefault()
    const next = (tabStop + step + ANSWERS.length) % ANSWERS.length
    setPicked(next)
    cards.current[next]?.focus()
  }

  return (
    <div className="grid-12 items-center gap-y-12">
      <div className="col-span-4 md:col-span-6 lg:col-span-5">
        {/* The black card, in the game's own colours */}
        <div className="flex aspect-[5/6] max-w-[26rem] flex-col justify-between rounded-[18px] border border-[var(--cah-line)] bg-card-black p-[clamp(1.5rem,4vw,2.25rem)] shadow-[0_30px_60px_-30px_rgb(0_0_0/0.9)]">
          <p className="text-[clamp(1.5rem,1.1rem+1.6vw,2.25rem)] font-extrabold leading-[1.12] tracking-[-0.025em] text-paper" aria-live="polite">
            {PROMPT.before}{' '}
            {answer ? (
              <span key={answer} className="blank-fill underline decoration-2 underline-offset-[0.14em]">
                {answer}
              </span>
            ) : (
              <span className="inline-block w-[4.5em] translate-y-[0.1em] border-b-[3px] border-paper">
                <span className="sr-only">blank</span>
              </span>
            )}
            {PROMPT.after}
          </p>
          <p className="label text-[var(--cah-ash)]">Cards Against The Humanity</p>
        </div>
      </div>

      <div className="col-span-4 flex flex-col gap-6 md:col-span-6 lg:col-span-6 lg:col-start-7">
        <p id={`${uid}-hint`} className="label">
          Pick a card. It writes itself in, the way it does on the TV.
        </p>
        <div role="radiogroup" aria-labelledby={`${uid}-hint`} className="grid grid-cols-2 gap-3 sm:gap-4" onKeyDown={onKeyDown}>
          {ANSWERS.map((text, index) => {
            const selected = picked === index
            return (
              <button
                key={text}
                ref={(el) => {
                  cards.current[index] = el
                }}
                type="button"
                role="radio"
                aria-checked={selected}
                tabIndex={index === tabStop ? 0 : -1}
                onClick={() => setPicked(selected ? null : index)}
                className={cn(
                  'press group relative flex aspect-[4/3] flex-col justify-between rounded-[14px] bg-paper p-4 text-left text-[var(--cah-ink)] forced-colors:border sm:p-5',
                  'shadow-[0_1px_0_0_var(--cah-paper-edge),0_18px_30px_-18px_rgb(0_0_0/0.8)] transition-[transform,opacity] duration-300 ease-[var(--ease-out)]',
                  TILTS[index],
                  'hover:-translate-y-1 hover:rotate-0',
                  selected && 'rotate-0 outline outline-[3px] outline-offset-[4px] outline-paper',
                  picked !== null && !selected && 'opacity-55 hover:opacity-100',
                )}
              >
                <span className="text-[clamp(1rem,0.9rem+0.5vw,1.25rem)] font-extrabold leading-[1.15] tracking-[-0.015em]">{text}.</span>
                <span aria-hidden="true" className={cn('label text-[var(--cah-ash-ink)] transition-opacity', selected ? 'opacity-100' : 'opacity-0')}>
                  Played
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
