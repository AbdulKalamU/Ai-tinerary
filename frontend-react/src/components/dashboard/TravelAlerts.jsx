import { motion } from 'framer-motion';
import { Bell } from 'lucide-react';

const ALERTS = [
  {
    priority: 'high',
    text: 'Rain expected in London on Day 2',
    action: 'Pack a light umbrella',
    time: '2h ago',
  },
  {
    priority: 'medium',
    text: 'Flight prices to Paris dropped by \u20B96,000',
    action: 'Book before Friday',
    time: '5h ago',
  },
  {
    priority: 'low',
    text: 'Passport expires in 8 months',
    action: 'Renew before next trip',
    time: '1d ago',
  },
  {
    priority: 'low',
    text: 'Cherry blossom festival in Tokyo',
    action: 'Plan ahead for crowds',
    time: '2d ago',
  },
];

const PRIORITY_DOT = {
  high: 'bg-white',
  medium: 'bg-[#555]',
  low: 'bg-[#333]',
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
};

export default function TravelAlerts({ plans }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="border border-[#222] bg-black p-6 h-full"
    >
      {/* Section label */}
      <div className="flex items-center gap-2 mb-5">
        <Bell size={14} strokeWidth={1.5} className="text-[#737373]" />
        <span className="text-[11px] font-medium tracking-widest text-[#737373] uppercase">
          Alerts
        </span>
      </div>

      {/* Alert stack */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {ALERTS.map((alert, i) => (
          <motion.div
            key={i}
            variants={itemVariants}
            className={`py-3 ${
              i < ALERTS.length - 1 ? 'border-b border-[#111]' : ''
            }`}
          >
            <div className="flex items-start gap-3">
              {/* Priority dot */}
              <span
                className={`w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5 ${PRIORITY_DOT[alert.priority]}`}
              />

              <div className="min-w-0 flex-1">
                <p
                  className={`text-sm font-light ${
                    alert.priority === 'high' ? 'text-white' : 'text-[#A3A3A3]'
                  }`}
                >
                  {alert.text}
                </p>
                <p className="text-xs text-[#555] mt-0.5">{alert.action}</p>
              </div>

              {/* Timestamp */}
              <span className="text-xs text-[#555] flex-shrink-0 whitespace-nowrap">
                {alert.time}
              </span>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
