import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Heart, X } from 'lucide-react';
import ActivityImage from '../ui/ActivityImage';
import toast from 'react-hot-toast';

// Helper Component for rendering individual journey cards
const JourneyCard = ({ journey, onClick }) => (
  <motion.div
    layoutId={`card-${journey.id}`}
    className="group relative h-[420px] rounded-[2rem] overflow-hidden cursor-pointer border border-white/5 hover:border-white/20 transition-all duration-500 shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:shadow-[0_16px_48px_rgba(79,70,229,0.15)] bg-[#0a0a0b]"
    onClick={() => onClick(journey.location)}
  >
    <ActivityImage
      name={journey.imageQuery || journey.name}
      category={journey.category || 'city'}
      uniqueId={journey.id}
      className="absolute inset-0 w-full h-full transform group-hover:scale-105 transition-transform duration-700 ease-out"
    />
    
    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-500"></div>

    <div className="absolute top-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-[-10px] group-hover:translate-y-0">
      <button 
        onClick={(e) => e.stopPropagation()}
        className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-black hover:scale-110 transition-all shadow-lg"
      >
        <Heart className="w-4 h-4" strokeWidth={2} />
      </button>
    </div>

    <div className="absolute bottom-0 left-0 w-full p-8 flex flex-col justify-end translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
      <div className="flex gap-2 mb-4">
        <span className="px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-md border border-white/10 text-[10px] uppercase tracking-widest text-white/90 font-medium">
          {journey.category || 'Travel'}
        </span>
        <span className="px-3 py-1.5 rounded-lg bg-black/40 backdrop-blur-md border border-white/10 text-[10px] uppercase tracking-widest text-[#A3A3A3]">
          {journey.days || 5} Days
        </span>
      </div>
      <motion.h3 layoutId={`title-${journey.id}`} className="text-2xl font-semibold text-white tracking-tight mb-1">{journey.name}</motion.h3>
      <motion.p layoutId={`location-${journey.id}`} className="text-[#A3A3A3] text-sm font-light tracking-tight">
        {journey.location}
      </motion.p>
      
      <div className="overflow-hidden mt-6 h-0 group-hover:h-12 transition-all duration-500 opacity-0 group-hover:opacity-100">
        <button 
          className="w-full bg-white text-black py-3.5 rounded-xl text-sm font-medium hover:bg-gray-200 hover:scale-[1.02] transition-all"
          onClick={(e) => {
            e.stopPropagation();
            onClick(journey.location);
          }}
        >
          Customize this trip
        </button>
      </div>
    </div>
  </motion.div>
);

export default function CuratedJourneys() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [journeys, setJourneys] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrendingDestinations();
  }, []);

  const fetchTrendingDestinations = async () => {
    try {
      const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      const res = await fetch(`${backendUrl}/api/v1/discovery/trending`);
      
      if (res.ok) {
        const data = await res.json();
        setJourneys(data);
      } else {
        setJourneys(getFallbackDestinations());
      }
    } catch (err) {
      console.error(err);
      setJourneys(getFallbackDestinations());
    } finally {
      setLoading(false);
    }
  };

  const getFallbackDestinations = () => [
    {
      id: 'swiss-alps',
      name: 'Alpine Escape',
      location: 'Zermatt, Switzerland',
      imageQuery: 'Zermatt Switzerland',
      days: 5,
      category: 'Nature',
    },
    {
      id: 'kyoto-culture',
      name: 'Ancient Traditions',
      location: 'Kyoto, Japan',
      imageQuery: 'Kyoto Japan',
      days: 7,
      category: 'Culture',
    },
    {
      id: 'amalfi-coast',
      name: 'Coastal Romance',
      location: 'Amalfi, Italy',
      imageQuery: 'Amalfi Coast Italy',
      days: 4,
      category: 'Relaxation',
    }
  ];

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);

  const handleCustomize = (location) => {
    navigate('/plan/new', { state: { initialDestination: location } });
    if (isModalOpen) setIsModalOpen(false);
  };

  return (
    <div className="w-full py-16">
      <div className="flex justify-between items-end mb-12">
        <div>
          <h2 className="text-3xl font-semibold tracking-tighter text-white mb-2 flex items-center gap-2">
            Trending Destinations 
            <div className="px-2 py-1 bg-primary-500/20 rounded-md border border-primary-500/30">
              <span className="text-xs text-primary-400 font-medium uppercase tracking-widest">AI Curated</span>
            </div>
          </h2>
          <p className="text-[#A3A3A3] font-light tracking-tight">Real-time global travel trends powered by AI.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="text-sm font-medium text-[#A3A3A3] hover:text-white transition-colors flex items-center gap-2 group"
        >
          View all <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1,2,3].map(i => (
             <div key={i} className="h-[420px] bg-white/5 animate-pulse rounded-[2rem]"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {journeys.slice(0, 3).map((journey, idx) => (
            <motion.div
              key={journey.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
               <JourneyCard journey={journey} onClick={handleCustomize} />
            </motion.div>
          ))}
        </div>
      )}

      {/* Expanded Modal View */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl p-4 sm:p-8 overflow-y-auto"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-7xl min-h-[80vh] bg-[#0a0a0b] border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-8 right-8 w-12 h-12 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-colors z-10"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-12">
                <h2 className="text-4xl font-semibold tracking-tighter text-white mb-3">Trending Global Destinations.</h2>
                <p className="text-[#A3A3A3] font-light text-lg tracking-tight max-w-2xl">
                  Explore real-time trending travel destinations powered by AI. These locations are dynamically chosen based on current global travel trends.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {journeys.map((journey, idx) => (
                  <motion.div
                    key={journey.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                     <JourneyCard journey={journey} onClick={handleCustomize} />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
