import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Map, Target, Sparkles, BrainCircuit, Navigation, Wallet, Users, Globe, Zap, ArrowRight } from 'lucide-react';
import GlobeBackground from '../components/ui/GlobeBackground';
import { useAuth } from '../context/AuthContext';

export default function Landing() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const accentColor = "text-[#A3A3A3]"; // A subtle, sophisticated gray/silver accent

  // Scroll animations for the globe
  const { scrollY } = useScroll();
  const globeScale = useTransform(scrollY, [0, 800], [1, 3]);
  const globeOpacity = useTransform(scrollY, [0, 800], [1, 0]);
  const globeY = useTransform(scrollY, [0, 800], [0, 200]);

  return (
    <div className="w-full bg-black min-h-screen text-white font-sans selection:bg-white selection:text-black">
      
      {/* Hero Section */}
      <section className="relative min-h-[95vh] flex flex-col items-center justify-center pt-24 px-6 overflow-hidden">
        
        {/* The 3D Interactive WebGL Globe with Scroll Animation */}
        <motion.div 
          className="absolute inset-0 z-0 pointer-events-auto"
          style={{ scale: globeScale, opacity: globeOpacity, y: globeY }}
        >
          <GlobeBackground />
        </motion.div>

        <div className="relative z-10 text-center max-w-5xl mx-auto flex flex-col items-center w-full pointer-events-none">
          <div className="pointer-events-auto flex flex-col items-center w-full">
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="mb-12"
          >
            <span className="text-[11px] uppercase tracking-[0.2em] text-[#737373] font-medium border border-[#333333] px-4 py-2 rounded-full">
              Intelligent Itineraries
            </span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-6xl sm:text-7xl md:text-9xl font-semibold tracking-tighter leading-[0.95] mb-8 text-white"
          >
            Travel, <br className="md:hidden"/> refined.
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className={`text-xl md:text-2xl ${accentColor} max-w-2xl mb-16 font-light tracking-tight leading-relaxed text-balance`}
          >
            A bespoke travel companion that understands your taste. Architected to design your next journey in seconds.
          </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col sm:flex-row items-center gap-6 w-full sm:w-auto"
            >
              <Link to={isAuthenticated ? "/dashboard" : "/register"} className="group flex items-center gap-3 bg-white text-black px-8 py-4 rounded-full text-sm font-medium hover:scale-[1.02] transition-transform duration-300">
                {isAuthenticated ? "Go to Dashboard" : "Begin Planning"}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a href="#architecture" className={`text-sm ${accentColor} hover:text-white transition-colors tracking-wide`}>
                Explore the Architecture
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Philosophy / How It Works Section */}
      <section id="architecture" className="py-40 bg-black border-t border-[#111]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          
          <div className="mb-24 md:mb-32">
            <h2 className="text-3xl md:text-5xl font-medium tracking-tight mb-6">The Methodology.</h2>
            <p className={`text-xl ${accentColor} max-w-2xl font-light tracking-tight`}>
              A deliberate, three-step framework eliminating the friction of traditional travel planning.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-8">
            {[
              { icon: Map, title: 'Destination', desc: 'Define your coordinates, duration, and companions. The foundation of your journey.' },
              { icon: Target, title: 'Curation', desc: 'Articulate your preferences. From architectural tours to culinary exploration.' },
              { icon: Sparkles, title: 'Synthesis', desc: 'Our engine generates a hyper-personalized, meticulously structured itinerary.' }
            ].map((step, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 1, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col border-t border-[#222] pt-8"
              >
                <div className="mb-8">
                  <step.icon className={`w-8 h-8 ${accentColor}`} strokeWidth={1} />
                </div>
                <h3 className="text-xl font-medium tracking-tight mb-4">{step.title}</h3>
                <p className={`text-sm leading-relaxed ${accentColor} font-light`}>{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-40 bg-[#050505] border-t border-[#111]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          
          <div className="mb-24 md:mb-32">
            <h2 className="text-3xl md:text-5xl font-medium tracking-tight mb-6">Uncompromising Utility.</h2>
            <p className={`text-xl ${accentColor} max-w-2xl font-light tracking-tight`}>
              Every detail considered. Every friction point resolved.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
            {[
              { icon: BrainCircuit, title: 'Contextual Intelligence', desc: 'Itineraries built by LLMs with deep geographical and cultural awareness.' },
              { icon: Navigation, title: 'Spatial Precision', desc: 'Exact coordinates and search optimized locations seamlessly integrated.' },
              { icon: Wallet, title: 'Financial Clarity', desc: 'Transparent tiered budget projections from minimalist to luxury.' },
              { icon: Users, title: 'Dynamic Grouping', desc: 'Schedules adapt based on solo travel, couples, or family dynamics.' },
              { icon: Globe, title: 'Cultural Fluency', desc: 'Essential local phrases and etiquette briefed before arrival.' },
              { icon: Zap, title: 'Instantaneous', desc: 'A comprehensive travel document synthesized in milliseconds.' }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.8, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="group"
              >
                <feature.icon className="w-6 h-6 mb-6 text-white" strokeWidth={1} />
                <h3 className="text-base font-medium tracking-tight mb-3">{feature.title}</h3>
                <p className={`text-sm leading-relaxed ${accentColor} font-light max-w-sm`}>{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-40 bg-black border-t border-[#111]">
        <div className="max-w-4xl mx-auto px-6 text-center flex flex-col items-center">
          <h2 className="text-4xl md:text-6xl font-medium tracking-tighter mb-8 text-white">
            Your journey awaits.
          </h2>
          <p className={`text-xl ${accentColor} mb-12 font-light tracking-tight`}>
            Experience the new standard in travel planning.
          </p>
          <Link to={isAuthenticated ? "/dashboard" : "/register"} className="bg-white text-black px-10 py-4 rounded-full text-sm font-medium hover:scale-[1.02] transition-transform duration-300">
            {isAuthenticated ? "Go to Dashboard" : "Start Free"}
          </Link>
        </div>
      </section>



    </div>
  );
}
