import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { getNavDirection } from '../utils/navDirection';

export default function PageTransition({ children }) {
  const location = useLocation();
  const dir = getNavDirection(); // 1 | -1 | 0

  const DIST = 36;

  const variants = {
    initial: {
      opacity: 0,
      x: dir * DIST,
      filter: dir !== 0 ? 'blur(10px)' : 'blur(0px)',
      scale: dir !== 0 ? 0.97 : 1,
    },
    animate: {
      opacity: 1,
      x: 0,
      filter: 'blur(0px)',
      scale: 1,
    },
    exit: {
      opacity: 0,
      x: dir * -DIST,
      filter: dir !== 0 ? 'blur(10px)' : 'blur(0px)',
      scale: dir !== 0 ? 0.97 : 1,
    },
  };

  const transition = {
    duration: 0.32,
    ease: [0.25, 0.46, 0.45, 0.94],
  };

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={transition}
        style={{ minHeight: '100%', willChange: 'transform, opacity, filter' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
