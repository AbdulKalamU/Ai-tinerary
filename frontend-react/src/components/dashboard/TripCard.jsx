import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Trash2, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDateRange, calculateDuration } from '../../utils/formatters';
import ActivityImage from '../ui/ActivityImage';

export default function TripCard({ plan, onDelete }) {
  const navigate = useNavigate();
  
  // Calculate duration
  const days = calculateDuration(plan.startDate, plan.endDate);

  const handleClick = () => {
    navigate(`/plan/${plan.id}`);
  };

  return (
    <motion.div
      layout
      whileHover={{ y: -4 }}
      onClick={handleClick}
      className="group relative h-[320px] rounded-3xl overflow-hidden cursor-pointer shadow-2xl"
    >
      {/* Background Image */}
      <ActivityImage 
        name={plan.destination} 
        destination={plan.destination}
        category="city"
        uniqueId={plan.id || 1}
        className="absolute inset-0 w-full h-full transform group-hover:scale-105 transition-transform duration-700 ease-out"
      />
      
      {/* Dark gradient overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/10 transition-opacity duration-300 group-hover:opacity-90"></div>
      
      {/* Top Floating Elements */}
      <div className="absolute top-4 w-full px-4 flex justify-between items-start">
        <div className="glass-pill px-3 py-1.5 flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-white/70" />
          <span className="text-xs font-light">{formatDateRange(plan.startDate, plan.endDate)}</span>
        </div>
        
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(plan.id); }}
          className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/70 hover:bg-red-500/80 hover:text-white hover:border-red-500 transition-colors"
          title="Delete Trip"
        >
          <Trash2 className="w-3.5 h-3.5" strokeWidth={2} />
        </button>
      </div>

      {/* Bottom Content Area */}
      <div className="absolute bottom-0 left-0 w-full p-6 flex flex-col justify-end">
        <div className="flex flex-wrap gap-2 mb-3">
          {plan.groupType && (
            <span className="glass-pill px-3 py-1 text-[10px] uppercase tracking-widest">{plan.groupType}</span>
          )}
          <span className="glass-pill px-3 py-1 text-[10px] uppercase tracking-widest">{days} Days</span>
        </div>
        
        <h3 className="text-3xl font-medium tracking-tight text-white leading-tight mb-2">
          {plan.destination}
        </h3>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-white/70 text-sm font-light">
            <MapPin className="w-4 h-4" />
            <span>AI-Generated Itinerary</span>
          </div>
          
          <div className="opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
            <span className="text-white text-sm font-medium">View Plan &rarr;</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
