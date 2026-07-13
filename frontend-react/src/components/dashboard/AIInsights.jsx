import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Check } from 'lucide-react';

const REASONS = [
  'Historical architecture',
  'Food experiences',
  'Medium budget',
  'Autumn weather',
];

export default function AIInsights({ plans }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="border border-[#222] bg-black overflow-hidden p-6 h-full"
    >
      {/* Section label */}
      <div className="flex items-center gap-2 mb-5">
        <Sparkles size={14} strokeWidth={1.5} className="text-[#737373]" />
        <span className="text-[11px] font-medium tracking-widest text-[#737373] uppercase">
          AI Insights
        </span>
      </div>

      {/* Recommended destination */}
      <h3 className="text-lg font-medium tracking-tight text-white mb-1">
        Tokyo, Japan
      </h3>

      {/* Match score */}
      <div className="mb-5">
        <span className="text-xs font-light text-[#A3A3A3]">92% Match</span>
        <div className="h-1 w-full bg-[#222] rounded-full overflow-hidden mt-1.5">
          <div className="h-full bg-white rounded-full" style={{ width: '92%' }} />
        </div>
      </div>

      {/* Reasoning */}
      <ul className="space-y-2 mb-5">
        {REASONS.map((reason, i) => (
          <li key={i} className="flex items-center gap-2">
            <Check size={12} strokeWidth={1.5} className="text-[#555] flex-shrink-0" />
            <span className="text-sm font-light text-[#A3A3A3]">{reason}</span>
          </li>
        ))}
      </ul>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-[11px] uppercase tracking-widest text-[#555] mb-1">
            Est. Budget
          </p>
          <p className="text-sm font-medium text-white">{'\u20B9'}1.2L</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-widest text-[#555] mb-1">
            Best Month
          </p>
          <p className="text-sm font-medium text-white">October</p>
        </div>
      </div>

      {/* Flight trend */}
      <p className="text-xs font-light text-[#737373] mb-5">
        Prices dropping {'\u2193'}
      </p>

      {/* CTA */}
      <Link
        to="/plan/new"
        className="inline-flex items-center gap-1 text-sm font-medium text-white hover:text-[#A3A3A3] transition-colors duration-200"
      >
        Create Draft Itinerary {'\u2192'}
      </Link>
    </motion.div>
  );
}
