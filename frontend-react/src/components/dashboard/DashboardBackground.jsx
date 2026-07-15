import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// High Quality Free Images (Mixed vibes: Ocean, Mountains, Nightlife, Culture, History)
const DESTINATION_IMAGES = [
  'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?q=90&w=1920&auto=format&fit=crop', // Maldives / Ocean
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=90&w=1920&auto=format&fit=crop', // Swiss Alps / Mountains
  'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=90&w=1920&auto=format&fit=crop', // Tokyo / Nightlife
  'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=90&w=1920&auto=format&fit=crop', // Kyoto / Culture
  'https://images.unsplash.com/photo-1552832230-c0197dd311b5?q=90&w=1920&auto=format&fit=crop', // Rome Colosseum / History
  'https://images.unsplash.com/photo-1509316785289-025f5b846b35?q=90&w=1920&auto=format&fit=crop', // Desert / Adventure
  'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=90&w=1920&auto=format&fit=crop', // NYC / Mixed
  'https://images.unsplash.com/photo-1539667468225-eebb663053e6?q=90&w=1920&auto=format&fit=crop'  // Pyramids / History
];

export default function DashboardBackground() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    console.log("DashboardBackground mounted, starting interval...");
    const interval = setInterval(() => {
      setIndex((prev) => {
        const next = (prev + 1) % DESTINATION_IMAGES.length;
        console.log("Slideshow moving to image index:", next);
        return next;
      });
    }, 2500); // Super fast 2.5 seconds for maximum spontaneity

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-[#030303]">
      
      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-black/40 z-10" />
      
      {/* Bottom gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-transparent to-transparent z-10" />

      {/* Render ALL images to DOM and just animate opacity to prevent mount/unmount freezing */}
      {DESTINATION_IMAGES.map((src, i) => (
        <motion.img
          key={src}
          src={src}
          alt={`Destination ${i}`}
          initial={false}
          animate={{ 
            opacity: i === index ? 1 : 0, 
            scale: i === index ? 1.05 : 1,
            zIndex: i === index ? 1 : 0
          }}
          transition={{
            opacity: { duration: 1.0, ease: "easeInOut" },
            scale: { duration: 10, ease: "linear" }
          }}
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
      ))}
    </div>
  );
}
