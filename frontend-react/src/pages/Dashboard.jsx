import { useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { getAllPlans, deletePlan } from '../api/plans';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

// New Immersive Components
import HeroSearch from '../components/dashboard/HeroSearch';
import CuratedJourneys from '../components/dashboard/CuratedJourneys';
import TripCard from '../components/dashboard/TripCard';
import EmptyState from '../components/dashboard/EmptyState';
import DashboardBackground from '../components/dashboard/DashboardBackground';

export default function Dashboard() {
  const { user } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlans();
  }, []);

  // Mouse parallax setup for subtle background depth
  const mouseX = useMotionValue(typeof window !== 'undefined' ? window.innerWidth / 2 : 0);
  const mouseY = useMotionValue(typeof window !== 'undefined' ? window.innerHeight / 2 : 0);
  const smoothX = useSpring(mouseX, { damping: 50, stiffness: 200 });
  const smoothY = useSpring(mouseY, { damping: 50, stiffness: 200 });
  const bgX = useTransform(smoothX, [0, typeof window !== 'undefined' ? window.innerWidth : 1000], [-15, 15]);
  const bgY = useTransform(smoothY, [0, typeof window !== 'undefined' ? window.innerHeight : 1000], [-15, 15]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  const fetchPlans = async () => {
    try {
      const data = await getAllPlans();
      if (data && data.plans) {
        setPlans(data.plans);
      } else if (Array.isArray(data)) {
        setPlans(data);
      }
    } catch (err) {
      toast.error('Failed to load your trips');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this trip?')) return;
    try {
      await deletePlan(id);
      setPlans(plans.filter(p => p.id !== id));
      toast.success('Trip deleted');
    } catch (err) {
      toast.error('Failed to delete trip');
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-transparent">
      <DashboardBackground />
      
      {/* Subtle Depth Background */}
      <motion.div 
        className="fixed inset-[-50px] z-0 pointer-events-none opacity-40"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='1' fill='%23ffffff' opacity='0.15'/%3E%3C/svg%3E")`,
          x: bgX,
          y: bgY
        }}
      />
      
      <motion.div 
        className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32"
        initial="hidden"
        animate="show"
        variants={{
          hidden: { opacity: 0 },
          show: {
            opacity: 1,
            transition: { staggerChildren: 0.15, delayChildren: 0.1 }
          }
        }}
      >
        
        {/* The Conversational Hero */}
        <motion.div variants={{ hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { type: 'spring', damping: 20 } } }}>
          <HeroSearch />
          
          <div className="mt-8 flex justify-center">
            <Link 
              to="/discover"
              className="glass-pill px-8 py-4 flex items-center gap-3 hover:scale-105 transition-all group"
            >
              <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary-400 group-hover:animate-spin" />
              </div>
              <span className="font-medium text-foreground">Not sure where to go? Start Swiping</span>
            </Link>
          </div>
        </motion.div>

        {/* Curated Inspirational Journeys */}
        <motion.div 
          className="mt-10 border-t border-white/5 pt-10"
          variants={{ hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { type: 'spring', damping: 20 } } }}
        >
          <CuratedJourneys />
        </motion.div>

        {/* Your Workspaces / Itineraries */}
        <motion.div 
          className="mt-20 border-t border-white/5 pt-16"
          variants={{ hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { type: 'spring', damping: 20 } } }}
        >
          <div className="mb-10">
            <h2 className="text-3xl font-medium tracking-tight text-white mb-2">Your Workspaces.</h2>
            <p className="text-[#A3A3A3] font-light">Continue planning your upcoming adventures.</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-[320px] bg-[#0a0a0a] rounded-3xl animate-pulse border border-[#1a1a1a]" />
              ))}
            </div>
          ) : plans.length === 0 ? (
            <div className="py-20 border border-white/5 rounded-3xl bg-black/40 backdrop-blur-md">
              <EmptyState />
            </div>
          ) : (
            <motion.div 
              initial="hidden"
              animate="show"
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: { staggerChildren: 0.1 }
                }
              }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {plans.map((plan) => (
                <motion.div key={plan.id} variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
                  <TripCard plan={plan} onDelete={handleDelete} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
