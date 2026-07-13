import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { getRelativeTime } from '../../utils/formatters';

const PENDING_TASKS_POOL = [
  'Review Day 3 itinerary',
  'Add hotel booking',
  'Upload flight ticket',
  'Confirm restaurant reservations',
  'Add travel insurance details',
  'Book airport transfer',
];

function getPseudoRandom(seed) {
  let hash = 0;
  const str = String(seed);
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function getProgress(planId) {
  const base = getPseudoRandom(planId);
  return 60 + (base % 26); // 60-85%
}

function getPendingTasks(planId) {
  const seed = getPseudoRandom(planId);
  const count = 2 + (seed % 2); // 2-3 tasks
  const tasks = [];
  for (let i = 0; i < count; i++) {
    tasks.push(PENDING_TASKS_POOL[(seed + i) % PENDING_TASKS_POOL.length]);
  }
  return tasks;
}

export default function ContinuePlanning({ plans }) {
  if (!plans || plans.length === 0) return null;

  const latestPlan = [...plans].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  )[0];

  const progress = getProgress(latestPlan.id);
  const pendingTasks = getPendingTasks(latestPlan.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="border border-[#222] bg-black p-8 w-full"
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
        {/* Left side — Destination + Progress */}
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-medium tracking-widest text-[#737373] uppercase mb-3">
            Continue Planning
          </p>
          <h2 className="text-2xl font-medium tracking-tight text-white mb-4">
            {latestPlan.destination}
          </h2>

          {/* Progress bar */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-light text-[#A3A3A3]">
                Planning progress
              </span>
              <span className="text-xs font-light text-[#737373]">
                {progress}%
              </span>
            </div>
            <div className="h-1 w-full bg-[#222] rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <p className="text-xs font-light text-[#555]">
            Last edited {getRelativeTime(latestPlan.createdAt)}
          </p>
        </div>

        {/* Right side — Pending tasks + CTA */}
        <div className="flex-shrink-0 md:max-w-xs w-full md:w-auto">
          <p className="text-[11px] font-medium tracking-widest text-[#737373] uppercase mb-3">
            Pending Tasks
          </p>
          <ul className="space-y-2 mb-5">
            {pendingTasks.map((task, i) => (
              <li
                key={i}
                className="flex items-center gap-2 text-sm font-light text-[#A3A3A3]"
              >
                <span className="w-1 h-1 rounded-full bg-[#555] flex-shrink-0" />
                {task}
              </li>
            ))}
          </ul>

          <Link
            to={`/plan/${latestPlan.id}`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-white hover:text-[#A3A3A3] transition-colors duration-200"
          >
            Continue Planning
            <ArrowRight size={14} strokeWidth={1.5} />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
