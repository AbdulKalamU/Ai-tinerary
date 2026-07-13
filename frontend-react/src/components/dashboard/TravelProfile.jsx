import { motion } from 'framer-motion';
import { User } from 'lucide-react';

function getMostCommon(arr) {
  if (!arr || arr.length === 0) return null;
  const counts = {};
  arr.forEach((item) => {
    const key = item.trim();
    if (key) counts[key] = (counts[key] || 0) + 1;
  });
  let max = 0;
  let result = null;
  Object.entries(counts).forEach(([key, count]) => {
    if (count > max) {
      max = count;
      result = key;
    }
  });
  return result;
}

function deriveStyle(plans) {
  if (!plans || plans.length === 0) return 'Explorer';
  const types = plans.map((p) => p.groupType).filter(Boolean);
  return getMostCommon(types) || 'Explorer';
}

function deriveCategory(plans) {
  if (!plans || plans.length === 0) return 'Sightseeing';
  const tags = plans
    .map((p) => p.activities)
    .filter(Boolean)
    .flatMap((a) => a.split(','));
  return getMostCommon(tags) || 'Sightseeing';
}

function calcAvgDuration(plans) {
  if (!plans || plans.length === 0) return '0d';
  const durations = plans
    .map((p) => {
      const start = new Date(p.startDate);
      const end = new Date(p.endDate);
      const diff = (end - start) / (1000 * 60 * 60 * 24);
      return Math.max(Math.round(diff), 0);
    })
    .filter((d) => d > 0);

  if (durations.length === 0) return '0d';
  const avg = Math.round(durations.reduce((a, b) => a + b, 0) / durations.length);
  return `${avg}d`;
}

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

export default function TravelProfile({ plans, totalDays, uniqueDestinations }) {
  const style = deriveStyle(plans);
  const category = deriveCategory(plans);
  const avgTrip = calcAvgDuration(plans);

  const stats = [
    { label: 'Cities', value: uniqueDestinations ?? 0 },
    { label: 'Trips', value: plans?.length ?? 0 },
    { label: 'Days', value: totalDays ?? 0 },
    { label: 'Style', value: style },
    { label: 'Category', value: category },
    { label: 'Avg Trip', value: avgTrip },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="border border-[#222] bg-black p-6"
    >
      {/* Section label */}
      <div className="flex items-center gap-2 mb-5">
        <User size={14} strokeWidth={1.5} className="text-[#737373]" />
        <span className="text-[11px] font-medium tracking-widest text-[#737373] uppercase">
          Travel Profile
        </span>
      </div>

      {/* Stats grid */}
      <motion.div
        className="grid grid-cols-3 gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {stats.map((stat) => (
          <motion.div key={stat.label} variants={itemVariants}>
            <p className="text-[11px] uppercase tracking-widest text-[#555] mb-1">
              {stat.label}
            </p>
            <p className="text-lg font-medium text-white">{stat.value}</p>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
