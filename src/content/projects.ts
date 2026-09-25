// Every project Jovian Games has shipped or is working on. The index (⌘K),
// the archive and the project sheets all read from this list, so a new
// project needs one entry here (and, if it has one, an image in media-src/).
//
// Facts come from each project's own repository. Nothing here is estimated.

import type { MediaId } from './media.gen'
import type { SectionId } from './site'
import { links } from './site'

export type ProjectFilter = 'engine' | 'games' | 'ai' | 'hardware'

export type StatusTone = 'live' | 'active' | 'research' | 'neutral'

export interface ProjectLink {
  label: string
  href: string
}

export interface Project {
  id: string
  name: string
  /** Short, human kind shown in lists: "Game engine", "Party game"… */
  kind: string
  filters: ProjectFilter[]
  year: string
  status: { label: string; tone: StatusTone }
  /** One sentence. Used in the archive and the index. */
  summary: string
  /** Two or three short paragraphs for the project sheet. */
  description: string[]
  stack: string[]
  media?: { id: MediaId; alt: string }
  links: ProjectLink[]
  /** Featured projects have a section of their own on the page. */
  section?: SectionId
  /** Extra words the index search should match. */
  keywords?: string
}

export const filters: { id: ProjectFilter | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'engine', label: 'Engine' },
  { id: 'games', label: 'Games' },
  { id: 'ai', label: 'AI' },
  { id: 'hardware', label: 'Hardware' },
]

export const projects: Project[] = [
  {
    id: 'jovian-engine',
    name: 'Jovian Engine',
    kind: 'Game engine and editor',
    filters: ['engine'],
    year: '2026',
    status: { label: 'Active development', tone: 'active' },
    summary: 'A DirectX 12 Ultimate game engine and editor, built from the ground up in C++20.',
    description: [
      'The engine and its editor run as one native process. The same Direct3D 12 device that renders the game draws the editor, so what you see in the viewport is the game, at the game’s frame rate.',
      'It ships with a physically based Forward+ renderer and a docking editor with 18 panels and 7 workspaces. Lua scripting has a real line debugger, Blueprints compile to the same Lua, and a control server lets scripts and AI agents drive the editor.',
      'Next: global team collaboration and a major visual update.',
    ],
    stack: ['C++20', 'Direct3D 12 Ultimate', 'HLSL', 'Lua 5.4', 'MCP'],
    media: {
      id: 'engine-editor',
      alt: 'The Jovian editor: the World Outliner on the left, the card game running in the viewport, and the World Settings panel below.',
    },
    links: [
      { label: 'Source on GitHub', href: links.engineRepo },
      { label: 'Technical reference', href: links.engineTechnical },
    ],
    section: 'engine',
    keywords: 'directx dx12 d3d12 renderer editor c++ engine lua blueprint mcp',
  },
  {
    id: 'cards-against-the-humanity',
    name: 'Cards Against The Humanity',
    kind: 'Party game',
    filters: ['games'],
    year: '2026',
    status: { label: 'Live', tone: 'live' },
    summary: 'Cards Against Humanity for a living room: the TV is the table, everybody’s phone is their hand.',
    description: [
      'Put the game on the TV and everyone else joins from their phone. No app, no account and no game server: the TV hosts the game and the phones connect to it directly over WebRTC.',
      'The full 2022 print-and-play deck and the Family Edition are both included. If you’re short of players, bots with 6 different senses of humour take a seat.',
      'An unofficial, non-commercial fan project, released under the same CC BY-NC-SA 2.0 licence as the original cards.',
    ],
    stack: ['React', 'TypeScript', 'WebRTC', 'PeerJS', 'Vite'],
    media: {
      id: 'cards-tv-lobby',
      alt: 'The TV lobby: a four-letter table code, a QR code and three seated players, two of them bots.',
    },
    links: [
      { label: 'Play now', href: links.cardsPlay },
      { label: 'Source on GitHub', href: links.cardsRepo },
    ],
    section: 'cards',
    keywords: 'cah party game tv phones webrtc bots family deck',
  },
  {
    id: 'arc-agi-3',
    name: 'ARC-AGI-3 agent',
    kind: 'AI research',
    filters: ['ai'],
    year: '2026',
    status: { label: 'Competing', tone: 'research' },
    summary: 'An agent for ARC Prize 2026 that learns games it has never seen, offline and against the clock.',
    description: [
      'Jovian Games is competing in ARC-AGI-3 on Kaggle, part of ARC Prize 2026. Each game starts with no instructions; the agent has to work out the rules and the goal from what its actions do.',
      'A local model plays by writing and running code in a persistent Python sandbox. It uses exact perception helpers, writes a world model and checks it against real frames, and searches with a planner before it spends an action.',
      'Every change is a hypothesis: run the fixed evaluation, keep or revert, and write the result down.',
    ],
    stack: ['Python', 'vLLM', 'Qwen3.8-27B', 'Kaggle'],
    links: [
      { label: 'The competition on Kaggle', href: links.kaggleCompetition },
      { label: 'Research repository', href: links.arcRepo },
    ],
    section: 'research',
    keywords: 'arc agi arc-agi-3 kaggle arc prize ai agent reasoning benchmark llm',
  },
  {
    id: 'cards-3d',
    name: 'Cards Against The Humanity — 3D',
    kind: 'Engine sample',
    filters: ['engine', 'games'],
    year: '2026',
    status: { label: 'Sample', tone: 'neutral' },
    summary: 'The web game rebuilt as a lamp-lit 3D card table inside Jovian Engine.',
    description: [
      'Every card is real geometry with its text rasterised onto it, so it catches the lamp, drops a shadow on the felt and turns over in your hand.',
      'You play one seat; 3 bots with different senses of humour play the rest and take turns as Card Czar. Plain Lua on top of the engine.',
    ],
    stack: ['Jovian Engine', 'Lua 5.4'],
    media: {
      id: 'engine-hand',
      alt: 'A hand of seven white cards fanned towards the camera, the black card on its stand across a green felt table.',
    },
    links: [{ label: 'Source on GitHub', href: links.engineRepo }],
    section: 'engine',
    keywords: '3d cards table lua sample',
  },
  {
    id: 'skyward',
    name: 'Skyward',
    kind: 'Engine sample',
    filters: ['engine', 'games'],
    year: '2026',
    status: { label: 'Sample', tone: 'neutral' },
    summary: 'A Flappy Bird replica built to stress the engine: half a million triangles in 6 draw calls.',
    description: [
      'A rigged bird, pooled pipes, recycled scenery, real-time shadows and a scoreboard that is lit geometry in the world.',
      '645 entities and about half a million triangles in 6 draw calls, in under 8 ms of GPU time on an RX 6700 XT.',
    ],
    stack: ['Jovian Engine', 'Lua 5.4'],
    media: {
      id: 'engine-skyward',
      alt: 'A yellow bird flying between green pipes over rolling hills, a score of 12 at the top.',
    },
    links: [{ label: 'Source on GitHub', href: links.engineRepo }],
    section: 'engine',
    keywords: 'flappy bird stress test instancing draw calls',
  },
  {
    id: 'voxel-odyssey',
    name: 'Voxel Odyssey',
    kind: 'Browser game',
    filters: ['games'],
    year: '2026',
    status: { label: 'Playable', tone: 'live' },
    summary: 'A first-person voxel sandbox that runs entirely in the browser, in a single 1.5 MB file.',
    description: [
      'An infinite procedural world to explore, mine and build in, with crafting, mobs and a day–night cycle. The game synthesises every sound in code; there are no asset files anywhere.',
      'The voxel engine is hand-rolled on Three.js: face-culled chunk meshing with ambient occlusion, swept-AABB physics and flood-fill lighting. Multiplayer runs on an authoritative server whose WebSocket layer implements RFC 6455 directly.',
    ],
    stack: ['Three.js', 'WebGL', 'JavaScript', 'WebSockets'],
    media: {
      id: 'voxel-sunset',
      alt: 'A voxel landscape at sunset: dark green blocky trees under a pink sky, a hotbar of tools along the bottom.',
    },
    links: [
      { label: 'Play in the browser', href: links.voxelPlay },
      { label: 'Source on GitHub', href: links.voxelRepo },
    ],
    section: 'lab',
    keywords: 'minecraft voxel sandbox threejs multiplayer procedural',
  },
  {
    id: 'the-settling',
    name: 'The Settling',
    kind: 'Minecraft mod',
    filters: ['games'],
    year: '2026',
    status: { label: 'v0.26.2', tone: 'neutral' },
    summary: 'A psychological horror mod for Minecraft. The world is slowly learning how to become you.',
    description: [
      'Built on Forge 1.20.1 and released as a jar you drop into your mods folder. The source stays private.',
    ],
    stack: ['Java', 'Minecraft Forge 1.20.1'],
    links: [{ label: 'Download the mod', href: links.settlingDownload }],
    section: 'lab',
    keywords: 'minecraft forge horror mod java',
  },
  {
    id: 'sunburn-device',
    name: 'Sunburn device',
    kind: 'Wearable',
    filters: ['hardware'],
    year: '2026',
    status: { label: 'Firmware 3.3', tone: 'neutral' },
    summary: 'A UV wearable for the BBC micro:bit that taps your arm until you put sunscreen on.',
    description: [
      'It reads a UV sensor, combines it with the live UV index a phone sends over Bluetooth, then flashes, beeps or taps your arm until you put sunscreen on. Two hours later it reminds you to reapply.',
      'The program is real MakeCode blocks, laid out to follow the flowchart box by box. The expo posters come straight from the project itself.',
    ],
    stack: ['micro:bit V2', 'MakeCode', 'Web Bluetooth', 'Servo', 'UV sensor'],
    media: {
      id: 'sunburn-poster',
      alt: 'The wall poster for the Sunburn device: the flowchart built out of the program’s real MakeCode blocks, with a note under each one.',
    },
    links: [
      { label: 'Companion app', href: links.sunburnApp },
      { label: 'Source on GitHub', href: links.sunburnRepo },
    ],
    section: 'lab',
    keywords: 'microbit uv sunscreen wearable bluetooth makecode hardware',
  },
  {
    id: 'neurogrip',
    name: 'NeuroGrip',
    kind: 'Prosthetic hand prototype',
    filters: ['hardware', 'ai'],
    year: '2026',
    status: { label: 'Prototype', tone: 'neutral' },
    summary: 'An AI-assisted prosthetic hand prototype: muscle signals decide, a palm camera suggests the grip.',
    description: [
      'Muscle signals (EMG) decide when the hand acts. A palm camera and a YOLO model classify what is in front of it and recommend one of 21 grips. The wearer always confirms, and any failure falls back to a safe grip.',
      'Built for a school showcase on a Raspberry Pi 4 with 5 servos, with a smartwatch-style dashboard. An educational prototype, not a medical device.',
    ],
    stack: ['Python', 'Raspberry Pi 4', 'YOLO', 'EMG', 'FastAPI'],
    media: {
      id: 'neurogrip-watch',
      alt: 'The NeuroGrip smartwatch dashboard: system state, grip detection and a drawing of the hand.',
    },
    links: [{ label: 'Source on GitHub', href: links.neurogripRepo }],
    section: 'lab',
    keywords: 'prosthetic hand emg yolo raspberry pi vision grasp',
  },
]

export const projectById = new Map(projects.map((p) => [p.id, p]))
