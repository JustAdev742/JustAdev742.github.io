import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode, Ref } from 'react'
import { cn } from '../../lib/cn'
import { ArrowRight, ArrowUpRight } from './Icon'

/** Anything that leaves this page opens in a new tab and says so. */
export function isExternal(href: string) {
  return /^https?:\/\//.test(href)
}

function externalProps(href: string) {
  return isExternal(href) ? { target: '_blank', rel: 'noopener noreferrer' } : {}
}

function NewTabNote({ href }: { href: string }) {
  return isExternal(href) ? <span className="sr-only"> (opens in a new tab)</span> : null
}

// At least 48px tall; on the narrowest screens a long label wraps inside the button instead of overflowing.
const base =
  'press group inline-flex min-h-12 max-w-full items-center justify-center gap-2.5 rounded-[var(--radius-control)] ' +
  'px-5 py-3 text-[0.9375rem] font-semibold leading-tight tracking-[-0.005em] ' +
  'transition-[background-color,border-color,color,transform] duration-[var(--dur-hover)] ease-out'

const variants = {
  primary:
    'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-fg)] hover:bg-[var(--btn-primary-bg-hover)]',
  secondary:
    'border border-[var(--btn-secondary-border)] text-fg hover:border-fg hover:bg-fg/[0.06]',
} as const

type Variant = keyof typeof variants

interface ActionLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string
  variant?: Variant
  children: ReactNode
  ref?: Ref<HTMLAnchorElement>
}

/** The site's button-shaped link. Arrows say where it goes: ↗ leaves, → stays. */
export function ActionLink({ href, variant = 'primary', children, className, ref, ...rest }: ActionLinkProps) {
  const external = isExternal(href)
  return (
    <a ref={ref} href={href} className={cn(base, variants[variant], className)} {...externalProps(href)} {...rest}>
      <span>{children}</span>
      {external ? (
        <ArrowUpRight className="transition-transform duration-[var(--dur-hover)] ease-out group-hover:-translate-y-px group-hover:translate-x-px" />
      ) : (
        <ArrowRight className="transition-transform duration-[var(--dur-hover)] ease-out group-hover:translate-x-0.5" />
      )}
      <NewTabNote href={href} />
    </a>
  )
}

interface ActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  children: ReactNode
  ref?: Ref<HTMLButtonElement>
}

export function ActionButton({ variant = 'secondary', children, className, type = 'button', ref, ...rest }: ActionButtonProps) {
  return (
    <button ref={ref} type={type} className={cn(base, variants[variant], className)} {...rest}>
      {children}
    </button>
  )
}

interface TextLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string
  children: ReactNode
}

/** An inline link inside running text. */
export function TextLink({ href, children, className, ...rest }: TextLinkProps) {
  const external = isExternal(href)
  return (
    <a href={href} className={cn('text-link', className)} {...externalProps(href)} {...rest}>
      {children}
      {external ? <ArrowUpRight size={12} className="ml-0.5 inline-block align-[0.05em]" /> : null}
      <NewTabNote href={href} />
    </a>
  )
}

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string
  children: ReactNode
  ref?: Ref<HTMLButtonElement>
}

/** A square control with an icon; the label is for assistive tech and the tooltip. */
export function IconButton({ label, children, className, type = 'button', ref, ...rest }: IconButtonProps) {
  return (
    <button
      ref={ref}
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        'press inline-flex size-11 items-center justify-center rounded-[var(--radius-control)] text-fg-muted',
        'transition-colors duration-[var(--dur-hover)] ease-out hover:bg-fg/[0.07] hover:text-fg',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  )
}
