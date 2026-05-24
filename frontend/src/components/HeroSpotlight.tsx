import { motion } from 'framer-motion';

export function HeroSpotlight() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute -left-16 top-10 h-56 w-56 rounded-full bg-olive/20 blur-3xl"
        animate={{ y: [0, 14, 0], x: [0, 10, 0] }}
        transition={{ duration: 9, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute right-0 top-24 h-72 w-72 rounded-full bg-white/50 blur-3xl"
        animate={{ y: [0, -18, 0], x: [0, -12, 0] }}
        transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-10 left-1/3 h-44 w-44 rounded-full bg-clay/50 blur-3xl"
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
      />
    </div>
  );
}
