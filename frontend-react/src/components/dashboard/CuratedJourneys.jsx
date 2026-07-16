import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Heart, X } from 'lucide-react';
import ActivityImage from '../ui/ActivityImage';

const JOURNEYS = [
  {
    id: 'swiss-alps',
    title: 'Alpine Escape',
    location: 'Zermatt, Switzerland',
    imageQuery: 'Zermatt Switzerland Matterhorn',
    days: 5,
    category: 'Nature',
  },
  {
    id: 'kyoto-culture',
    title: 'Ancient Traditions',
    location: 'Kyoto, Japan',
    imageQuery: 'Kyoto Japan temple autumn',
    days: 7,
    category: 'Culture',
  },
  {
    id: 'amalfi-coast',
    title: 'Coastal Romance',
    location: 'Amalfi, Italy',
    imageQuery: 'Amalfi Coast Italy ocean',
    days: 4,
    category: 'Relaxation',
  },
  {
    id: 'maldives-bliss',
    title: 'Tropical Paradise',
    location: 'Maldives',
    imageQuery: 'Maldives overwater bungalow clear water',
    days: 6,
    category: 'Luxury',
  },
  {
    id: 'santorini-sunset',
    title: 'Aegean Dreams',
    location: 'Santorini, Greece',
    imageQuery: 'Santorini Greece sunset caldera',
    days: 5,
    category: 'Romance',
  },
  {
    id: 'serengeti-safari',
    title: 'Wild Encounters',
    location: 'Serengeti, Tanzania',
    imageQuery: 'Serengeti safari wildlife sunset',
    days: 8,
    category: 'Adventure',
  },
  {
    id: 'banff-lakes',
    title: 'Glacial Wonders',
    location: 'Banff, Canada',
    imageQuery: 'Banff National Park Moraine Lake',
    days: 6,
    category: 'Nature',
  },
  {
    id: 'queenstown-thrills',
    title: 'Adrenaline Rush',
    location: 'Queenstown, New Zealand',
    imageQuery: 'Queenstown New Zealand mountains lake',
    days: 7,
    category: 'Adventure',
  },
  {
    id: 'machu-picchu',
    title: 'Inca Trail',
    location: 'Machu Picchu, Peru',
    imageQuery: 'Machu Picchu Peru ancient ruins',
    days: 9,
    category: 'History',
  },
  {
    id: 'petra-jordan',
    title: 'Desert Marvels',
    location: 'Petra, Jordan',
    imageQuery: 'Petra Jordan Treasury',
    days: 5,
    category: 'Culture',
  },
  {
    id: 'iceland-aurora',
    title: 'Northern Lights',
    location: 'Reykjavik, Iceland',
    imageQuery: 'Iceland aurora borealis winter',
    days: 6,
    category: 'Nature',
  },
  {
    id: 'bora-bora',
    title: 'Pacific Pearl',
    location: 'Bora Bora, French Polynesia',
    imageQuery: 'Bora Bora aerial view lagoon',
    days: 7,
    category: 'Relaxation',
  }
];

// Helper Component for rendering individual journey cards
const JourneyCard = ({ journey, onClick }) => (
  <motion.div
    layoutId={`card-${journey.id}`}
    className="group relative h-[420px] rounded-[2rem] overflow-hidden cursor-pointer border border-white/5 hover:border-white/20 transition-all duration-500 shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:shadow-[0_16px_48px_rgba(79,70,229,0.15)] bg-[#0a0a0b]"
    onClick={() => onClick(journey.location)}
  >
    <ActivityImage
      name={journey.imageQuery}
      category={journey.category}
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
          {journey.category}
        </span>
        <span className="px-3 py-1.5 rounded-lg bg-black/40 backdrop-blur-md border border-white/10 text-[10px] uppercase tracking-widest text-[#A3A3A3]">
          {journey.days} Days
        </span>
      </div>
      <motion.h3 layoutId={`title-${journey.id}`} className="text-2xl font-semibold text-white tracking-tight mb-1">{journey.title}</motion.h3>
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
          <h2 className="text-3xl font-semibold tracking-tighter text-white mb-2">Curated Journeys.</h2>
          <p className="text-[#A3A3A3] font-light tracking-tight">Handcrafted itineraries by our travel editors.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="text-sm font-medium text-[#A3A3A3] hover:text-white transition-colors flex items-center gap-2 group"
        >
          View all <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {JOURNEYS.slice(0, 3).map((journey, idx) => (
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
                <h2 className="text-4xl font-semibold tracking-tighter text-white mb-3">All Curated Journeys.</h2>
                <p className="text-[#A3A3A3] font-light text-lg tracking-tight max-w-2xl">
                  Explore our complete collection of handpicked destinations. Every journey is designed to inspire your next great adventure.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {JOURNEYS.map((journey, idx) => (
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
