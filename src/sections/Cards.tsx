import { links } from '../content/site'
import { projectById } from '../content/projects'
import { FillTheBlank } from '../components/cards/FillTheBlank'
import { HowItGoes } from '../components/cards/HowItGoes'
import { ActionLink, TextLink } from '../components/ui/Action'
import { Eyebrow, Lines, reveal, Section } from '../components/ui/Section'
import { StatusChip } from '../components/ui/StatusChip'

// The game's own world: its black, its paper white, its headline voice.

const features = [
  {
    title: 'No app, no server',
    body: 'The TV hosts the table and re-checks every move. Phones reach it directly over WebRTC, so no card text or player name ever touches a server.',
  },
  {
    title: 'Two full decks',
    body: 'The 2022 print-and-play deck and Cards Against Humanity’s own Family Edition, 500 white cards each, transcribed card for card.',
  },
  {
    title: 'Bots with taste',
    body: '6 personalities fill empty seats, each with its own sense of humour, tested against held-out benchmarks of real cards rather than a random player.',
  },
  {
    title: 'Survives real rooms',
    body: 'If a phone locks, reloads or drops off the Wi-Fi, it comes back to the same seat with the same hand and the same score.',
  },
]

export function Cards() {
  const game = projectById.get('cards-against-the-humanity')!

  return (
    <Section id="cards" labelledBy="cards-title" canvas="ink" className="pt-[var(--section-y)]">
      <div className="shell">
        <div className="grid-12 gap-y-10">
          <div className="col-span-4 flex flex-col gap-8 md:col-span-12 lg:col-span-8">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3" {...reveal('fade')}>
              <Eyebrow index="02">Game</Eyebrow>
              <StatusChip status={game.status} />
            </div>
            <Lines
              id="cards-title"
              sectionHeading
              className="max-w-[14ch] text-[clamp(2.75rem,1.6rem+4.8vw,6.25rem)] font-extrabold leading-[0.95] tracking-[-0.035em] text-paper"
              lines={['Cards Against', 'The Humanity']}
            />
          </div>
          <div className="col-span-4 flex flex-col justify-end gap-6 md:col-span-8 lg:col-span-4">
            <p className="text-[clamp(1.375rem,1.1rem+1vw,1.875rem)] font-extrabold leading-[1.15] tracking-[-0.02em] text-paper" {...reveal('up', 100)}>
              The TV is the table. Everybody’s phone is their hand.
            </p>
            <p className="text-[var(--cah-ash)]" {...reveal('up', 160)}>
              Cards Against The Humanity is a fan-made Cards Against Humanity for the living room. Put it on the big screen and everyone joins from their phone. No app to install, no account, no game server.
            </p>
            <div className="flex flex-wrap gap-3" {...reveal('up', 220)}>
              <ActionLink href={links.cardsPlay}>Play now</ActionLink>
              <ActionLink href={links.cardsRepo} variant="secondary">
                Source on GitHub
              </ActionLink>
            </div>
          </div>
        </div>

        <div className="mt-[clamp(4rem,8vw,7rem)]" {...reveal('up')}>
          <h3 className="label mb-8">How a game goes</h3>
          <HowItGoes />
        </div>

        <ul className="mt-[clamp(5rem,10vw,9rem)] grid gap-x-[var(--gutter)] gap-y-10 border-t border-[var(--cah-line)] pt-10 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <li key={feature.title} className="flex flex-col gap-3" {...reveal('up', index * 70)}>
              <span className="label text-paper">{String(index + 1).padStart(2, '0')}</span>
              <h3 className="text-h3 font-extrabold tracking-[-0.02em] text-paper">{feature.title}</h3>
              <p className="text-[var(--cah-ash)]">{feature.body}</p>
            </li>
          ))}
        </ul>

        <div className="mt-[clamp(5rem,10vw,9rem)]" {...reveal('up')}>
          <FillTheBlank />
        </div>

        <p className="mt-16 max-w-[70ch] text-small text-[var(--cah-ash)]" {...reveal('fade')}>
          An unofficial, non-commercial fan project, not affiliated with or endorsed by Cards Against Humanity LLC. The cards are theirs, used under{' '}
          <TextLink href={links.cahLicense}>CC BY-NC-SA 2.0</TextLink>, and the game is released under the same licence.
        </p>
      </div>
    </Section>
  )
}
