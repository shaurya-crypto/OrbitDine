import { Variants, Transition } from "framer-motion";

// --- MOTION DURATIONS & EASINGS ---
export const EASINGS = {
  smooth: [0.25, 0.1, 0.25, 1] as const,
  snappy: [0.175, 0.885, 0.32, 1.275] as const, // slight overshoot
  premium: [0.22, 1, 0.36, 1] as const, // apple-like smooth ease out
};

export const DURATIONS = {
  fast: 0.2,
  base: 0.4,
  slow: 0.8,
  orchestrated: 1.2,
};

// --- PRESET TRANSITIONS ---
export const transitionPremium: Transition = {
  duration: DURATIONS.slow,
  ease: EASINGS.premium,
};

export const transitionSnappy: Transition = {
  duration: DURATIONS.base,
  ease: EASINGS.snappy,
};

export const transitionSpring: Transition = {
  type: "spring",
  stiffness: 150,
  damping: 20,
  mass: 1,
};

// --- ANIMATION VARIANTS ---

/**
 * Standard scroll reveal: Fades in and slides up subtly.
 */
export const fadeUpVariant: Variants = {
  hidden: { opacity: 0, y: 30, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: transitionPremium,
  },
};

/**
 * Staggered container for revealing children sequentially.
 */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

/**
 * Floating animation for continuous 3D depth movement.
 * Best applied via `animate="animate"` with no trigger.
 */
export const floatingVariant: Variants = {
  animate: {
    y: ["-3%", "3%"],
    rotate: [-1, 1],
    transition: {
      y: {
        duration: 4,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut",
      },
      rotate: {
        duration: 5,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut",
      },
    },
  },
};

/**
 * Subtle pulse for glowing elements.
 */
export const glowPulseVariant: Variants = {
  animate: {
    scale: [1, 1.05, 1],
    opacity: [0.5, 0.8, 0.5],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

/**
 * Scale reveal (used for cards entering view).
 */
export const scaleRevealVariant: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: transitionPremium,
  },
};

// --- UTILITY TYPES ---
export type MotionMode = "full" | "reduced";

// Helper to determine if we should animate based on low end mode
export const getSafeVariant = (
  variant: Variants,
  isLowEnd: boolean
): Variants => {
  if (isLowEnd) {
    return {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { duration: 0.3 } },
      animate: {}, // Disable continuous loops
    };
  }
  return variant;
};
