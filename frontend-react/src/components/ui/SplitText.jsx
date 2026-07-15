import { motion, useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';

const SplitText = ({
  text,
  className = '',
  delay = 50,
  duration = 0.8,
  splitType = 'words',
  tag = 'div',
  loopInterval = 0
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-10%" });
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    if (loopInterval > 0) {
      const interval = setInterval(() => {
        setAnimationKey(prev => prev + 1);
      }, loopInterval);
      return () => clearInterval(interval);
    }
  }, [loopInterval]);
  
  // Split the text based on the specified type
  const elements = splitType === 'chars' 
    ? text.split('') 
    : text.split(' ');
    
  const Tag = motion[tag] || motion.div;

  return (
    <Tag 
      key={animationKey}
      ref={ref}
      className={className} 
      style={{ display: 'block', wordWrap: 'break-word' }}
    >
      {elements.map((element, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{
            duration: duration,
            delay: (index * delay) / 1000,
            ease: [0.16, 1, 0.3, 1]
          }}
          style={{ 
            display: 'inline-block', 
            whiteSpace: element === ' ' ? 'pre' : 'pre-wrap'
          }}
        >
          {element}{splitType === 'words' && index < elements.length - 1 ? ' ' : ''}
        </motion.span>
      ))}
    </Tag>
  );
};

export default SplitText;
