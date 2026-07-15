import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MapPin, X, Heart, Plane, RefreshCw, ArrowLeft } from 'lucide-react';

const SWIPE_DESTINATIONS = [
  {
    id: 1,
    name: 'Kyoto, Japan',
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=90&w=1920&auto=format&fit=crop',
    tags: ['Culture', 'History', 'Nature'],
    description: 'Ancient temples, beautiful gardens, and traditional geisha districts.'
  },
  {
    id: 2,
    name: 'Maldives',
    image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?q=90&w=1920&auto=format&fit=crop',
    tags: ['Relaxation', 'Beach', 'Luxury'],
    description: 'Crystal clear waters and overwater bungalows for ultimate relaxation.'
  },
  {
    id: 3,
    name: 'Swiss Alps, Switzerland',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=90&w=1920&auto=format&fit=crop',
    tags: ['Adventure', 'Nature', 'Mountains'],
    description: 'Breathtaking peaks, skiing, and cozy alpine villages.'
  },
  {
    id: 4,
    name: 'Tokyo, Japan',
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=90&w=1920&auto=format&fit=crop',
    tags: ['Nightlife', 'Food', 'City'],
    description: 'Neon-lit streets, incredible food, and futuristic vibes.'
  },
  {
    id: 5,
    name: 'Rome, Italy',
    image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?q=90&w=1920&auto=format&fit=crop',
    tags: ['History', 'Food', 'Culture'],
    description: 'The eternal city, home to the Colosseum and incredible pasta.'
  }
];

export default function SwipeDiscovery() {
  const navigate = useNavigate();
  const [cards, setCards] = useState(SWIPE_DESTINATIONS);
  
  const handleDragEnd = (event, info, destination) => {
    const swipeThreshold = 100;
    
    if (info.offset.x > swipeThreshold) {
      // Swiped Right (Like)
      removeCard(destination.id, 'right');
      setTimeout(() => {
        navigate('/plan/new', { state: { initialDestination: destination.name } });
      }, 500);
    } else if (info.offset.x < -swipeThreshold) {
      // Swiped Left (Pass)
      removeCard(destination.id, 'left');
    }
  };

  const removeCard = (id, direction) => {
    setCards((prev) => prev.filter(card => card.id !== id));
  };

  const resetCards = () => {
    setCards(SWIPE_DESTINATIONS);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col pt-24 pb-20 px-4 items-center relative overflow-hidden">
      <button 
        onClick={() => navigate('/dashboard')}
        className="absolute top-24 left-4 md:left-8 z-50 glass-pill px-4 py-2 flex items-center gap-2 hover:scale-105 transition-transform"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="text-center mb-10 z-10">
        <h1 className="text-4xl md:text-5xl font-medium tracking-tight text-foreground mb-4">
          Discover
        </h1>
        <p className="text-muted-foreground text-lg font-light max-w-md mx-auto">
          Swipe right on your dream destination to start planning, or left to skip.
        </p>
      </div>

      <div className="relative w-full max-w-sm h-[500px] flex items-center justify-center z-10 perspective-1000">
        <AnimatePresence>
          {cards.length > 0 ? (
            cards.map((dest, index) => {
              const isTop = index === cards.length - 1;
              return (
                <motion.div
                  key={dest.id}
                  className="absolute w-full h-full rounded-[2rem] shadow-2xl overflow-hidden cursor-grab active:cursor-grabbing border-4 border-foreground/5 bg-card"
                  style={{
                    zIndex: index,
                  }}
                  drag={isTop ? "x" : false}
                  dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                  dragElastic={0.8}
                  onDragEnd={(e, info) => handleDragEnd(e, info, dest)}
                  initial={{ scale: 0.95, opacity: 0, y: 20 }}
                  animate={{ 
                    scale: isTop ? 1 : 0.95 - (cards.length - 1 - index) * 0.05,
                    opacity: 1,
                    y: isTop ? 0 : (cards.length - 1 - index) * 15,
                  }}
                  exit={{ 
                    x: 500, // Default exit direction, overridden by state in a real complex app but this handles the unmount
                    opacity: 0,
                    transition: { duration: 0.3 }
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10 pointer-events-none" />
                  <img 
                    src={dest.image} 
                    alt={dest.name} 
                    className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                  />
                  
                  <div className="absolute bottom-0 left-0 w-full p-6 z-20 text-white pointer-events-none">
                    <h2 className="text-3xl font-medium mb-2 flex items-center gap-2">
                      {dest.name}
                    </h2>
                    <p className="text-white/80 text-sm mb-4 font-light leading-relaxed">
                      {dest.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {dest.tags.map(tag => (
                        <span key={tag} className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-medium border border-white/20">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Swipe Indicators (Optional UI polish: would require useMotionValue to tie opacity to drag position, but static styling works too) */}
                  <div className="absolute inset-0 flex justify-between items-center px-4 pointer-events-none opacity-0 hover:opacity-100 transition-opacity">
                    <div className="w-16 h-16 rounded-full bg-red-500/20 backdrop-blur-sm border border-red-500/50 flex items-center justify-center">
                      <X className="w-8 h-8 text-red-500" />
                    </div>
                    <div className="w-16 h-16 rounded-full bg-green-500/20 backdrop-blur-sm border border-green-500/50 flex items-center justify-center">
                      <Heart className="w-8 h-8 text-green-500" />
                    </div>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="w-24 h-24 bg-foreground/5 rounded-full flex items-center justify-center mx-auto mb-6">
                <Plane className="w-10 h-10 text-foreground/40" />
              </div>
              <h3 className="text-2xl font-medium text-foreground mb-2">You've seen it all!</h3>
              <p className="text-muted-foreground mb-8">Check back later for more destinations.</p>
              <button 
                onClick={resetCards}
                className="btn-primary flex items-center gap-2 mx-auto"
              >
                <RefreshCw className="w-4 h-4" /> Start Over
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <div className="mt-12 flex gap-6 z-10 opacity-70 hover:opacity-100 transition-opacity">
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-full bg-card border border-border flex items-center justify-center shadow-lg">
            <ArrowLeft className="w-5 h-5 text-red-500" />
          </div>
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Pass</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-full bg-card border border-border flex items-center justify-center shadow-lg">
            <ArrowLeft className="w-5 h-5 text-green-500 rotate-180" />
          </div>
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Plan Trip</span>
        </div>
      </div>
    </div>
  );
}
