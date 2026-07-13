import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Heart } from 'lucide-react';
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
  }
];

export default function CuratedJourneys() {
  const navigate = useNavigate();

  const handleCustomize = (location) => {
    navigate('/plan/new', { state: { initialDestination: location } });
  };

  return (
    <div className="w-full py-16">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h2 className="text-3xl font-medium tracking-tight text-white mb-2">Curated Journeys.</h2>
          <p className="text-[#A3A3A3] font-light">Handcrafted itineraries by our travel editors.</p>
        </div>
        <button 
          onClick={() => navigate('/plan/new')}
          className="text-sm font-medium text-white hover:text-[#A3A3A3] transition-colors flex items-center gap-2"
        >
          View all <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {JOURNEYS.map((journey, idx) => (
          <motion.div
            key={journey.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="group relative h-[400px] rounded-3xl overflow-hidden cursor-pointer"
            onClick={() => handleCustomize(journey.location)}
          >
            {/* Background Image */}
            <ActivityImage
              name={journey.imageQuery}
              destination={journey.location}
              category={journey.category}
              uniqueId={journey.id}
              className="absolute inset-0 w-full h-full transform group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            
            {/* Gradient Overlay for Text Readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>

            {/* Floating Action Pill (Top Right) */}
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-black transition-colors">
                <Heart className="w-4 h-4" strokeWidth={2} />
              </button>
            </div>

            {/* Content (Bottom) */}
            <div className="absolute bottom-0 left-0 w-full p-6 flex flex-col justify-end">
              <div className="flex gap-2 mb-3">
                <span className="glass-pill px-3 py-1 text-[10px] uppercase tracking-widest">{journey.category}</span>
                <span className="glass-pill px-3 py-1 text-[10px] uppercase tracking-widest">{journey.days} Days</span>
              </div>
              <h3 className="text-2xl font-medium text-white tracking-tight mb-1">{journey.title}</h3>
              <p className="text-white/80 text-sm font-light flex items-center gap-2">
                {journey.location}
              </p>
              
              {/* Customize Button (Reveals on Hover) */}
              <div className="overflow-hidden mt-4 h-0 group-hover:h-12 transition-all duration-300">
                <button 
                  className="w-full bg-white text-black py-3 rounded-full text-sm font-medium hover:bg-white/90 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCustomize(journey.location);
                  }}
                >
                  Customize this trip
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
