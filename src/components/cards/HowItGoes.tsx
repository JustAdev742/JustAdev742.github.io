import { useId, useRef, useState, type KeyboardEvent } from 'react'
import { cn } from '../../lib/cn'
import { Picture } from '../ui/Picture'
import type { MediaId } from '../../content/media.gen'

const steps: { label: string; title: string; body: string; image: MediaId; alt: string }[] = [
  {
    label: 'The TV opens a table',
    title: 'Four letters and a QR code.',
    body: 'Open the site on whatever is plugged into the TV. Everyone else scans the code or types the four letters on their phone, and bots can fill empty seats.',
    image: 'cards-tv-lobby',
    alt: 'The TV lobby: the table code in huge letters, a QR code, three seated players, and the deck set to the Family Edition.',
  },
  {
    label: 'Everyone plays from their phone',
    title: 'The answers write themselves in.',
    body: 'The Czar turns the answers over one at a time from their phone. Each card writes itself into the black card on the TV, so the whole room reads the same joke at the same moment.',
    image: 'cards-tv-reveal',
    alt: 'The TV mid-round: the black card reads “All I want for Christmas is Pirate music.” with both answers laid out beside it.',
  },
  {
    label: 'The Czar picks a winner',
    title: 'A point, then the next round deals itself.',
    body: 'The winning card holds on the TV for a moment, the Czar passes round the table, and hands refill automatically.',
    image: 'cards-tv-winner',
    alt: 'The TV after judging: “Madam President, we’ve run out of time. The only option is Big Randy.” with the line “Ozzy takes the point.”',
  },
]

/** A tabbed walk through one round, shown on the TV the way the room sees it. */
export function HowItGoes() {
  const uid = useId()
  const [step, setStep] = useState(0)
  const tabs = useRef<(HTMLButtonElement | null)[]>([])

  const select = (index: number, focus = false) => {
    const next = (index + steps.length) % steps.length
    setStep(next)
    if (focus) tabs.current[next]?.focus()
  }

  const onKeyDown = (event: KeyboardEvent) => {
    const keys: Record<string, number> = { ArrowRight: step + 1, ArrowDown: step + 1, ArrowLeft: step - 1, ArrowUp: step - 1, Home: 0, End: steps.length - 1 }
    const target = keys[event.key]
    if (target === undefined) return
    event.preventDefault()
    select(target, true)
  }

  const current = steps[step]!

  return (
    <div className="grid-12 gap-y-10">
      <div className="relative col-span-4 md:col-span-12 lg:col-span-8">
        {/* The TV */}
        <div
          id={`${uid}-panel`}
          role="tabpanel"
          aria-labelledby={`${uid}-tab-${step}`}
          className="relative overflow-hidden rounded-[10px] border border-[var(--cah-line)] bg-[var(--cah-ink)] p-[0.6%] shadow-[0_40px_80px_-40px_rgb(0_0_0/0.9)]"
        >
          <div className="relative aspect-video overflow-hidden rounded-[6px]">
            {steps.map((item, index) => (
              <div
                key={item.image}
                aria-hidden={index !== step}
                className={cn(
                  'absolute inset-0 transition-[opacity,filter] duration-300 ease-[var(--ease-out)]',
                  index === step ? 'opacity-100 blur-0' : 'pointer-events-none opacity-0 blur-[6px]',
                )}
              >
                <Picture id={item.image} alt={index === step ? item.alt : ''} sizes="(min-width: 1024px) 60vw, 94vw" className="size-full" />
              </div>
            ))}
          </div>
        </div>
        <div aria-hidden="true" className="mx-auto h-3 w-[18%] rounded-b-[4px] border-x border-b border-[var(--cah-line)] bg-surface-1" />

        {/* A phone at the table, the same moment from the other side */}
        <div className="absolute -bottom-10 right-[-2%] hidden w-[23%] min-w-[9rem] rotate-[4deg] md:block">
          <div className="rounded-[1.9rem] border border-[var(--cah-line)] bg-[var(--cah-ink)] p-[5%] shadow-[0_30px_60px_-20px_rgb(0_0_0/0.95)]">
            <div className="overflow-hidden rounded-[1.45rem]">
              <Picture
                id="cards-phone-judge"
                alt="A phone showing the same round: the black card, then “Pick the funniest” above the two white answers."
                sizes="16rem"
                className="aspect-[1170/2532] w-full"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="col-span-4 flex flex-col gap-8 md:col-span-12 lg:col-span-4 lg:pl-4">
        <div role="tablist" aria-label="How a game goes" aria-orientation="vertical" className="flex flex-col border-t border-[var(--cah-line)]" onKeyDown={onKeyDown}>
          {steps.map((item, index) => {
            const selected = index === step
            return (
              <button
                key={item.label}
                ref={(el) => {
                  tabs.current[index] = el
                }}
                id={`${uid}-tab-${index}`}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls={`${uid}-panel`}
                tabIndex={selected ? 0 : -1}
                onClick={() => select(index)}
                className={cn(
                  'group relative flex min-h-14 items-center gap-4 border-b border-[var(--cah-line)] py-4 text-left transition-colors duration-[var(--dur-hover)]',
                  selected ? 'text-paper' : 'text-[var(--cah-ash)] hover:text-paper',
                )}
              >
                <span className="label w-6 shrink-0 text-inherit">{String(index + 1).padStart(2, '0')}</span>{' '}
                <span className="font-semibold">{item.label}</span>
                <span
                  aria-hidden="true"
                  className={cn(
                    'absolute bottom-[-1px] left-0 h-px origin-left bg-paper transition-transform duration-300 ease-[var(--ease-out)]',
                    selected ? 'w-full scale-x-100' : 'w-full scale-x-0',
                  )}
                />
              </button>
            )
          })}
        </div>
        <div aria-live="polite" className="flex flex-col gap-3">
          <p className="text-h3 font-extrabold leading-[1.15] tracking-[-0.02em] text-paper">{current.title}</p>
          <p className="text-[var(--cah-ash)]">{current.body}</p>
        </div>
      </div>
    </div>
  )
}
