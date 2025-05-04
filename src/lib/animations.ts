import { Variants } from 'framer-motion';

export const fadeIn = (delay: number, duration: number): Variants => ({
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration,
      delay,
      ease: 'easeOut',
    },
  },
}); 