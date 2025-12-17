/**
 * Framer Motion Page Transition Configurations
 * Reusable transition and variant settings for page-level animations
 */

import { Transition, Variants } from 'framer-motion';

/**
 * Standard page transition configuration
 */
export const pageTransition: Transition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.5,
};

/**
 * Fast page transition
 */
export const fastTransition: Transition = {
  type: 'tween',
  ease: 'easeInOut',
  duration: 0.3,
};

/**
 * Spring-based page transition
 */
export const springTransition: Transition = {
  type: 'spring',
  damping: 25,
  stiffness: 300,
};

/**
 * Page slide variants (left to right)
 */
export const pageVariants: Variants = {
  initial: { opacity: 0, x: -20 },
  in: { opacity: 1, x: 0 },
  out: { opacity: 0, x: 20 },
};

/**
 * Page fade variants
 */
export const pageFadeVariants: Variants = {
  initial: { opacity: 0 },
  in: { opacity: 1 },
  out: { opacity: 0 },
};

/**
 * Page scale variants
 */
export const pageScaleVariants: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  in: { opacity: 1, scale: 1 },
  out: { opacity: 0, scale: 1.05 },
};

/**
 * Slide up page variants
 */
export const pageSlideUpVariants: Variants = {
  initial: { opacity: 0, y: 50 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -50 },
};

/**
 * Route transition configuration object
 * Use with AnimatePresence for route changes
 */
export const routeTransition = {
  variants: pageVariants,
  transition: pageTransition,
  initial: 'initial',
  animate: 'in',
  exit: 'out',
};

/**
 * Modal/Overlay transition timing
 */
export const modalTransition: Transition = {
  duration: 0.2,
  ease: 'easeOut',
};

/**
 * Stagger timing for lists and grids
 */
export const staggerTiming = {
  staggerChildren: 0.1,
  delayChildren: 0.1,
};

/**
 * Hover animation timing
 */
export const hoverTransition: Transition = {
  duration: 0.3,
  ease: 'easeInOut',
};
