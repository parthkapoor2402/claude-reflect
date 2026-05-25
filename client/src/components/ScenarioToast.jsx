import { motion, AnimatePresence } from 'framer-motion';

export default function ScenarioToast({ message, visible }) {
  return (
    <AnimatePresence>
      {visible && message && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.2 }}
          className="pointer-events-none fixed bottom-28 left-1/2 z-50 -translate-x-1/2 rounded-full border border-reflect-border bg-reflect-card px-4 py-2 text-xs text-reflect-text shadow-lg"
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
