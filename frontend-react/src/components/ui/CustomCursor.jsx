import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export default function CustomCursor() {
  const [isHovering, setIsHovering] = useState(false);

  // useMotionValue avoids React renders on every mouse move (zero lag)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // useSpring gives smooth physics directly in the DOM
  const springConfigInner = { damping: 40, stiffness: 1500, mass: 0.05 };
  const springConfigOuter = { damping: 25, stiffness: 400, mass: 0.1 };

  const cursorXInner = useSpring(mouseX, springConfigInner);
  const cursorYInner = useSpring(mouseY, springConfigInner);
  const cursorXOuter = useSpring(mouseX, springConfigOuter);
  const cursorYOuter = useSpring(mouseY, springConfigOuter);

  useEffect(() => {
    const updateMousePosition = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    const handleMouseOver = (e) => {
      if (
        e.target.tagName.toLowerCase() === 'button' ||
        e.target.tagName.toLowerCase() === 'a' ||
        e.target.closest('button') ||
        e.target.closest('a')
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener('mousemove', updateMousePosition);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, [mouseX, mouseY]);

  return (
    <>
      <motion.div
        className="fixed top-0 left-0 w-4 h-4 bg-primary-500 rounded-full pointer-events-none z-[9999] mix-blend-screen"
        style={{
          x: cursorXInner,
          y: cursorYInner,
          translateX: "-50%",
          translateY: "-50%"
        }}
        animate={{
          scale: isHovering ? 2 : 1,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      />
      <motion.div
        className="fixed top-0 left-0 w-12 h-12 border-2 border-primary-500/50 rounded-full pointer-events-none z-[9998]"
        style={{
          x: cursorXOuter,
          y: cursorYOuter,
          translateX: "-50%",
          translateY: "-50%"
        }}
        animate={{
          scale: isHovering ? 1.5 : 1,
          borderColor: isHovering ? 'rgba(16, 185, 129, 0.8)' : 'rgba(16, 185, 129, 0.3)'
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      />
    </>
  );
}
