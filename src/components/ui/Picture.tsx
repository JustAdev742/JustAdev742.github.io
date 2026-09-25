import { useCallback, useState, type CSSProperties } from 'react'
import { media, type MediaId } from '../../content/media.gen'
import { cn } from '../../lib/cn'

const BASE = import.meta.env.BASE_URL

function withBase(srcset: string) {
  return srcset
    .split(', ')
    .map((entry) => BASE + entry)
    .join(', ')
}

interface PictureProps {
  id: MediaId
  alt: string
  /** How wide the image renders at each breakpoint, so the browser picks the right file. */
  sizes: string
  className?: string
  imgClassName?: string
  /** Above-the-fold images load eagerly with high priority. */
  priority?: boolean
  fit?: 'cover' | 'contain'
  style?: CSSProperties
}

/**
 * AVIF with a WebP fallback, intrinsic size reserved up front, and a blurred
 * 24px placeholder that the real image fades over once it has decoded.
 */
export function Picture({ id, alt, sizes, className, imgClassName, priority = false, fit = 'cover', style }: PictureProps) {
  const asset = media[id]
  const [loaded, setLoaded] = useState(false)

  // An image that finished before hydration never fires onLoad; check on attach.
  const attach = useCallback((img: HTMLImageElement | null) => {
    if (img?.complete && img.naturalWidth > 0) setLoaded(true)
  }, [])

  return (
    <span
      className={cn('picture', className)}
      data-fit={fit}
      data-loaded={loaded ? '' : undefined}
      style={{ '--lqip': `url(${asset.placeholder})`, ...style } as CSSProperties}
    >
      <picture>
        <source type="image/avif" srcSet={withBase(asset.avif)} sizes={sizes} />
        <source type="image/webp" srcSet={withBase(asset.webp)} sizes={sizes} />
        <img
          ref={attach}
          src={BASE + asset.src}
          alt={alt}
          width={asset.width}
          height={asset.height}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={priority ? 'high' : 'auto'}
          onLoad={() => setLoaded(true)}
          className={imgClassName}
        />
      </picture>
    </span>
  )
}
