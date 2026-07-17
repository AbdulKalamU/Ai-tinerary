import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, X, Heart, Plane, RefreshCw, Sparkles } from 'lucide-react';
import ActivityImage from '../components/ui/ActivityImage';
import toast from 'react-hot-toast';

export default function SwipeDiscovery() {
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchTrendingDestinations();
  }, []);

  const fetchTrendingDestinations = async () => {
    setLoading(true);
    try {
      const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      const res = await fetch(`${backendUrl}/api/v1/discovery/trending`);
      
      if (res.ok) {
        const data = await res.json();
        setCards(data);
      } else {
        toast.error('Failed to load dynamic destinations. Using defaults.');
        setCards(getFallbackDestinations());
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to connect to Discovery service.');
      setCards(getFallbackDestinations());
    } finally {
      setLoading(false);
    }
  };

  const getFallbackDestinations = () => [
    {
      id: 'kyoto-japan',
      name: 'Kyoto, Japan',
      imageQuery: 'Kyoto Japan',
      category: 'Culture',
      description: 'Ancient traditions and stunning autumn leaves.',
      tags: ['Culture', 'History']
    }
  ];

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
    fetchTrendingDestinations();
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
        <h1 className="text-4xl md:text-5xl font-medium tracking-tight text-foreground mb-4 flex items-center justify-center gap-3">
          Discover <Sparkles className="w-6 h-6 text-primary-400" />
        </h1>
        <p className="text-muted-foreground text-lg font-light max-w-md mx-auto">
          Swipe right on your dream destination to start planning, or left to skip. Powered by real-time trending data.
        </p>
      </div>

      <div className="relative w-full max-w-sm h-[500px] flex items-center justify-center z-10 perspective-1000">
        {loading ? (
           <motion.div 
             initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
             className="flex flex-col items-center justify-center gap-4 text-center"
           >
             <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
             <p className="text-muted-foreground">Finding trending destinations...</p>
           </motion.div>
        ) : (
          <AnimatePresence>
            {cards.length > 0 ? (
              cards.map((dest, index) => {
                const isTop = index === cards.length - 1;
                return (
                  <motion.div
                    key={dest.id}
                    className="absolute w-full h-full rounded-[2rem] shadow-2xl overflow-hidden cursor-grab active:cursor-grabbing border-4 border-foreground/5 bg-[#0a0a0b]"
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
                      x: 500,
                      opacity: 0,
                      transition: { duration: 0.3 }
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <ActivityImage 
                      name={dest.imageQuery || dest.name}
                      category={dest.category || 'city'}
                      uniqueId={dest.id}
                      className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                    />
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10 pointer-events-none" />
                    
                    <div className="absolute bottom-0 left-0 w-full p-6 z-20 text-white pointer-events-none">
                      <h2 className="text-3xl font-medium mb-2 flex items-center gap-2">
                        {dest.name}
                      </h2>
                      <p className="text-white/80 text-sm mb-4 font-light leading-relaxed">
                        {dest.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {dest.tags && dest.tags.map(tag => (
                          <span key={tag} className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-medium border border-white/20">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Swipe Indicators */}
                    <div className="absolute inset-0 flex justify-between items-center px-4 pointer-events-none opacity-0 hover:opacity-100 transition-opacity z-30">
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
        )}
      </div>
      
      {!loading && cards.length > 0 && (
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
      )}
    </div>
  );
}
