import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Thermometer, Cloud } from 'lucide-react';

export default function WeatherIntelligence({ plans = [] }) {
  const destination = useMemo(() => {
    if (plans.length === 0) return null;

    // Find the most recent plan by createdAt
    const sorted = [...plans].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return sorted[0].destination;
  }, [plans]);

  if (!destination) return null;

  return (
    <motion.div
      className="border border-[#222] bg-black p-8"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {/* Section Label */}
      <div className="flex items-center gap-2 mb-6">
        <Thermometer className="w-3.5 h-3.5 text-[#737373]" strokeWidth={1.5} />
        <span className="text-[11px] font-medium tracking-widest text-[#737373] uppercase">
          Weather Intelligence
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-col sm:flex-row gap-8">
        {/* Left side — Weather data */}
        <div className="flex-1">
          <p className="text-lg font-medium text-white tracking-tight mb-1">
            {destination}
          </p>
          <p className="text-3xl font-light text-white mb-1">22°C</p>
          <div className="flex items-center gap-2 mt-2">
            <Cloud className="w-5 h-5 text-[#555]" strokeWidth={1.5} />
            <span className="text-sm text-[#737373]">Partly Cloudy</span>
          </div>
        </div>

        {/* Right side — AI Recommendation */}
        <div className="flex-1 sm:border-l sm:border-[#222] sm:pl-8">
          <p className="text-[10px] text-[#555] uppercase tracking-widest mb-3">
            AI Recommendation
          </p>
          <p className="text-sm font-light text-[#A3A3A3] leading-relaxed">
            Schedule outdoor activities before 2 PM. Light jacket recommended for
            evening walks.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
