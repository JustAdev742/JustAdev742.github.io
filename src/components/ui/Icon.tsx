// A small hand-drawn set on a 16px grid with 1.5px strokes, to match the
// site's hairlines. Decorative by default: callers label the control instead.

import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement> & { size?: number }

function Svg({ size = 16, children, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="square"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  )
}

export function ArrowUpRight(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M5 11 11 5M6 4.75h5.25V10" />
    </Svg>
  )
}

export function ArrowRight(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M2.75 8h10M9 4.25 12.75 8 9 11.75" />
    </Svg>
  )
}

export function ArrowDown(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M8 2.75v10M4.25 9 8 12.75 11.75 9" />
    </Svg>
  )
}

export function ArrowUp(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M8 13.25v-10M4.25 7 8 3.25 11.75 7" />
    </Svg>
  )
}

export function Close(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="m3.75 3.75 8.5 8.5M12.25 3.75l-8.5 8.5" />
    </Svg>
  )
}

export function Search(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="7" cy="7" r="4.25" />
      <path d="m10.25 10.25 3 3" />
    </Svg>
  )
}

export function Pause(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M5.5 3.5v9M10.5 3.5v9" />
    </Svg>
  )
}

export function Play(props: IconProps) {
  return (
    <Svg {...props} strokeLinejoin="round">
      <path d="M5 3.25v9.5L12.5 8 5 3.25Z" />
    </Svg>
  )
}

export function StepForward(props: IconProps) {
  return (
    <Svg {...props} strokeLinejoin="round">
      <path d="M3.75 3.75v8.5L9.5 8 3.75 3.75ZM12.25 3.5v9" />
    </Svg>
  )
}

export function Grid(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M2.75 2.75h4v4h-4zM9.25 2.75h4v4h-4zM2.75 9.25h4v4h-4zM9.25 9.25h4v4h-4z" />
    </Svg>
  )
}

/** GitHub's mark, filled, as published in their brand assets. */
export function GitHub({ size = 16, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden="true" focusable="false" {...props}>
      <path
        fill="currentColor"
        d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8Z"
      />
    </svg>
  )
}
