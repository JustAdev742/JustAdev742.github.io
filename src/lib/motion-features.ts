// Motion's animation features, split out of the first bundle and loaded by
// <LazyMotion> once the page is up. Scroll-linked styles work before they
// arrive; only `animate` transitions wait for them.
import { domAnimation } from 'motion/react'

export default domAnimation
