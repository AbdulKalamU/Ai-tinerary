import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Activity, Sparkles, CloudRain, MapPin } from 'lucide-react';
import { getRelativeTime } from '../../utils/formatters';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
};

export default function ActivityTimeline({ plans = [] }) {
  const events = useMemo(() => {
    const planEvents = plans.map((plan) => ({
      id: `plan-${plan.id}`,
      icon: Sparkles,
      text: `Generated ${plan.destination} itinerary`,
      time: getRelativeTime(plan.createdAt),
      timestamp: new Date(plan.createdAt).getTime(),
      isReal: true,
    }));

    // Sort plan events by most recent first
    planEvents.sort((a, b) => b.timestamp - a.timestamp);

    const simulatedEvents = [
      {
        id: 'sim-weather',
        icon: CloudRain,
        text: 'Weather intelligence updated',
        time: '1h ago',
        timestamp: 0,
        isReal: false,
      },
      {
        id: 'sim-route',
        icon: MapPin,
        text: 'Route optimization complete',
        time: '3h ago',
        timestamp: 0,
        isReal: false,
      },
    ];

    return [...planEvents, ...simulatedEvents].slice(0, 6);
  }, [plans]);

  return (
    <div className="border border-[#222] bg-black p-6">
      {/* Section Label */}
      <div className="flex items-center gap-2 mb-5">
        <Activity className="w-3.5 h-3.5 text-[#737373]" strokeWidth={1.5} />
        <span className="text-[11px] font-medium tracking-widest text-[#737373] uppercase">
          Activity
        </span>
      </div>

      {/* Timeline */}
      <motion.div
        className="relative"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {events.map((event, index) => {
          const Icon = event.icon;
          const isFirst = index === 0;
          const isLast = index === events.length - 1;

          return (
            <motion.div
              key={event.id}
              variants={itemVariants}
              className="flex gap-4 relative"
            >
              {/* Timeline column */}
              <div className="flex flex-col items-center relative" style={{ width: '8px' }}>
                {/* Dot */}
                <div
                  className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                    isFirst ? 'bg-white' : 'bg-[#555]'
                  }`}
                />
                {/* Connecting line */}
                {!isLast && (
                  <div className="w-px bg-[#222] flex-1 min-h-[16px]" />
                )}
              </div>

              {/* Content */}
              <div className="flex items-start gap-3 pb-5 flex-1 min-w-0">
                <Icon
                  className="w-4 h-4 text-[#555] shrink-0 mt-0.5"
                  strokeWidth={1.5}
                />
                <span
                  className={`text-sm font-light flex-1 ${
                    isFirst ? 'text-white' : 'text-[#A3A3A3]'
                  }`}
                >
                  {event.text}
                </span>
                <span className="text-xs text-[#555] shrink-0 mt-0.5">
                  {event.time}
                </span>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
