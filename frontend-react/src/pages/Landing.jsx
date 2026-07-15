import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Map, Target, Sparkles, BrainCircuit, Navigation, Wallet, Users, Globe, Zap, ArrowRight } from 'lucide-react';
import GlobeBackground from '../components/ui/GlobeBackground';
import Hyperspeed from '../components/ui/Hyperspeed';
import { useAuth } from '../context/AuthContext';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from '@studio-freight/lenis';
import * as THREE from 'three';

gsap.registerPlugin(ScrollTrigger);

const hyperspeedOptions = {
  distortion: 'turbulentDistortion',
  length: 400,
  roadWidth: 10,
  islandWidth: 2,
  lanesPerRoad: 3,
  fov: 90,
  fovSpeedUp: 150,
  speedUp: 2,
  carLightsFade: 0.4,
  totalSideLightSticks: 20,
  lightPairsPerRoadWay: 40,
  shoulderLinesWidthPercentage: 0.05,
  brokenLinesWidthPercentage: 0.1,
  brokenLinesLengthPercentage: 0.5,
  lightStickWidth: [0.12, 0.5],
  lightStickHeight: [1.3, 1.7],
  movingAwaySpeed: [60, 80],
  movingCloserSpeed: [-120, -160],
  carLightsLength: [12, 80],
  carLightsRadius: [0.05, 0.14],
  carWidthPercentage: [0.3, 0.5],
  carShiftX: [-0.8, 0.8],
  carFloorSeparation: [0, 5],
  colors: {
    roadColor: 0x080808,
    islandColor: 0x0a0a0a,
    background: 0x000000,
    shoulderLines: 0x131313,
    brokenLines: 0x131313,
    leftCars: [0xd856bf, 0x6750a2, 0xc247ac],
    rightCars: [0x03b3c3, 0x0e5ea5, 0x324555],
    sticks: 0x03b3c3,
  }
};

export default function Landing() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const accentColor = "text-[#A3A3A3]";

  const cursorRef = useRef(null);
  const containerRef = useRef(null);
  
  // Section Refs
  const heroSectionRef = useRef(null);
  const stickyHeroRef = useRef(null);
  const globeContainerRef = useRef(null);
  const heroContentRef = useRef(null);
  const methodologyContentRef = useRef(null);
  const horizontalSectionRef = useRef(null);
  const horizontalTrackRef = useRef(null);
  
  // Background transition refs
  const heroBgRef = useRef(null);
  const heroOrbsRef = useRef(null);
  const heroStarsRef = useRef(null);

  // Magnetic Button Refs
  const btnRefs = useRef([]);

  useEffect(() => {
    // 1. Initialize Lenis for Smooth Scrolling
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Sync GSAP ScrollTrigger with Lenis
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0, 0);

    // Magnetic Button Effect
    const handleMagneticMove = (e, btn) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      gsap.to(btn, { x: x * 0.3, y: y * 0.3, duration: 0.3, ease: "power2.out" });
    };
    const handleMagneticLeave = (btn) => {
      gsap.to(btn, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.3)" });
    };

    btnRefs.current.forEach(btn => {
      if(btn) {
        btn.addEventListener('mousemove', (e) => handleMagneticMove(e, btn));
        btn.addEventListener('mouseleave', () => handleMagneticLeave(btn));
      }
    });

    // --- ANIMATIONS ---
    let ctx = gsap.context(() => {
      
      // 1. Hero Sticky Animation (Globe Shrinks, Background Dissolves, Methodology Enters)
      const heroTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: heroSectionRef.current,
          start: "top top",
          end: "+=150vh",
          pin: stickyHeroRef.current,
          scrub: 1,
          anticipatePin: 1
        }
      });

      // Scale globe down and move it right
      heroTimeline.to(globeContainerRef.current, {
        scale: 0.35,
        x: "25vw",
        duration: 2,
        ease: "power1.inOut"
      }, 0);

      // Fade out the main hero text
      heroTimeline.to(heroContentRef.current, {
        opacity: 0,
        y: -50,
        duration: 1,
        ease: "power2.out"
      }, 0);

      // Fade in Methodology on the left
      heroTimeline.to(methodologyContentRef.current, {
        opacity: 1,
        x: 0,
        duration: 1.5,
        ease: "power2.out"
      }, 0.5);

      // Dissolve the Hero backgrounds to seamlessly reveal Hyperspeed underneath
      heroTimeline.to([heroBgRef.current, heroOrbsRef.current, heroStarsRef.current], {
        opacity: 0,
        duration: 1,
        ease: "power2.inOut"
      }, 1.0);


      // 2. Horizontal Scroll Track for Features
      const trackWidth = horizontalTrackRef.current.scrollWidth;
      const viewportWidth = window.innerWidth;
      
      gsap.to(horizontalTrackRef.current, {
        x: -(trackWidth - viewportWidth),
        ease: "none",
        scrollTrigger: {
          trigger: horizontalSectionRef.current,
          start: "top top",
          end: () => `+=${trackWidth}`,
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true
        }
      });

    }, containerRef);

    return () => {
      ctx.revert();
      lenis.destroy();
      btnRefs.current.forEach(btn => {
        if(btn) {
          btn.removeEventListener('mousemove', handleMagneticMove);
          btn.removeEventListener('mouseleave', handleMagneticLeave);
        }
      });
    };
  }, []);

  return (
    <div ref={containerRef} className="w-full overflow-x-hidden bg-transparent min-h-screen text-white font-sans selection:bg-purple-500/30 selection:text-white cursor-auto md:cursor-none">
      
      {/* Global Fixed Hyperspeed Background */}
      <div className="fixed inset-0 z-0 opacity-80 pointer-events-none">
        <Hyperspeed effectOptions={hyperspeedOptions} />
      </div>

      {/* Sticky Hero & Methodology Section */}
      <section ref={heroSectionRef} className="relative z-10 bg-transparent">
        
        <div ref={stickyHeroRef} className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">
          
          {/* Hero Solid Background */}
          <div ref={heroBgRef} className="absolute inset-0 bg-[#030303] z-[-2]"></div>

          {/* Ambient "Deep Space" Background Orbs (Scoped to Hero) */}
          <div ref={heroOrbsRef} className="absolute inset-0 z-[-1] pointer-events-none opacity-[0.12] mix-blend-screen overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#3b0764] blur-[150px]"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-[#082f49] blur-[150px]"></div>
          </div>
          
          {/* Unsplash Stars Overlay (Scoped to Hero) */}
          <div 
            ref={heroStarsRef}
            className="absolute inset-0 z-[-1] bg-cover bg-center opacity-30 mix-blend-screen pointer-events-none"
            style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?q=80&w=2070&auto=format&fit=crop")' }}
          />
          
          {/* Globe */}
          <div ref={globeContainerRef} className="absolute inset-0 z-0 pointer-events-auto origin-center">
            <GlobeBackground />
          </div>

          {/* Initial Hero Content (Center) */}
          <div 
            ref={heroContentRef} 
            className="relative z-10 flex flex-col items-center text-center max-w-5xl px-6 pointer-events-none"
          >
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-5xl sm:text-7xl md:text-8xl font-semibold tracking-tighter leading-[0.95] mb-8 text-white drop-shadow-2xl"
            >
              Go Anywhere.
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className={`text-lg md:text-2xl ${accentColor} max-w-2xl mx-auto mb-12 font-light tracking-tight leading-relaxed text-balance drop-shadow-md`}
            >
              Your personal AI travel guide. We build perfect trips tailored just for you, instantly.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="flex justify-center"
            >
              <Link 
                to={isAuthenticated ? "/dashboard" : "/register"} 
                ref={el => btnRefs.current[0] = el}
                className="group flex items-center gap-3 bg-white text-black px-10 py-5 rounded-full text-base font-medium hover:bg-gray-200 transition-colors duration-300 pointer-events-auto shadow-[0_0_40px_rgba(255,255,255,0.2)] cursor-pointer"
              >
                {isAuthenticated ? "Go to Dashboard" : "Begin Planning"}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>

          {/* Methodology Content (Reveals on Left during Scroll) */}
          <div 
            ref={methodologyContentRef}
            className="absolute left-0 top-0 h-full w-full md:w-[60vw] flex flex-col justify-center px-6 md:px-12 lg:px-24 opacity-0 pointer-events-none -translate-x-12 z-20"
          >
            <div className="max-w-xl">
              <h2 className="text-5xl md:text-7xl font-semibold tracking-tighter mb-6 text-white drop-shadow-2xl">
                Fast planning. Perfect trips.
              </h2>
              <p className={`text-xl md:text-2xl ${accentColor} mb-16 font-light tracking-tight drop-shadow-md`}>
                Skip the hours of research. Our AI builds your dream trip in three simple steps.
              </p>
              
              <div className="space-y-12">
                {[
                  { icon: Globe, title: 'Tell Us Where', desc: 'Pick your destination, dates, and who is traveling with you.' },
                  { icon: Target, title: 'Share Your Style', desc: 'Love food? Hate museums? Tell us exactly what you enjoy doing.' },
                  { icon: Zap, title: 'Get Your Plan', desc: 'Our AI instantly creates a day-by-day guide just for you.' }
                ].map((step, i) => (
                  <div key={i} className="flex gap-6 group">
                    <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-white/10 group-hover:scale-110 transition-all duration-300 backdrop-blur-md">
                      <step.icon className="w-6 h-6 text-white" strokeWidth={1.5} />
                    </div>
                    <div>
                      <h3 className="text-xl font-medium tracking-tight mb-2 text-white">{step.title}</h3>
                      <p className={`text-base leading-relaxed ${accentColor} font-light`}>{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Horizontal Scroll Features Section */}
      <section ref={horizontalSectionRef} className="relative z-10 bg-transparent border-t border-white/5 overflow-hidden">
        <div className="sticky top-0 h-screen flex flex-col justify-center pl-6 md:pl-12 lg:pl-24">
          
          <div className="mb-16">
            <h2 className="text-4xl md:text-6xl font-medium tracking-tighter mb-4 text-white drop-shadow-xl">Travel smart. No stress.</h2>
            <p className={`text-xl md:text-2xl ${accentColor} max-w-2xl font-light tracking-tight drop-shadow-md`}>
              Everything you need for a perfect trip, right in your pocket.
            </p>
          </div>

          <div 
            ref={horizontalTrackRef}
            className="flex gap-8 w-[max-content] pb-12 pr-24"
          >
            {[
              { icon: BrainCircuit, title: 'Local Secrets', desc: 'Find the best hidden spots that only locals know about.' },
              { icon: Navigation, title: 'Easy Maps', desc: 'Exact locations and routes so you never get lost.' },
              { icon: Wallet, title: 'Stay on Budget', desc: 'Clear cost estimates to help you track your spending.' },
              { icon: Users, title: 'Group Friendly', desc: 'Plans that work for solo trips, couples, or big families.' },
              { icon: Globe, title: 'Culture Guide', desc: 'Learn basic local phrases and customs before you arrive.' },
              { icon: Zap, title: 'Ready to Go', desc: 'Download your full itinerary instantly and start packing.' }
            ].map((feature, i) => (
              <div 
                key={i}
                className="w-[300px] md:w-[400px] h-[350px] shrink-0 bg-black/40 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 flex flex-col justify-between group hover:bg-black/60 hover:border-white/20 transition-colors duration-500 shadow-2xl"
              >
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                  <feature.icon className="w-8 h-8 text-white" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="text-2xl font-medium tracking-tight mb-3 text-white">{feature.title}</h3>
                  <p className={`text-base leading-relaxed ${accentColor} font-light`}>{feature.desc}</p>
                </div>
                <div className="mt-8 w-full h-[1px] bg-gradient-to-r from-white/10 to-transparent group-hover:from-purple-500/50 transition-colors duration-500"></div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* CTA Section */}
      <section className="py-40 relative z-10 overflow-hidden border-t border-white/5 bg-transparent">
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-transparent to-black/50 opacity-80" />
        <div className="max-w-4xl mx-auto px-6 text-center flex flex-col items-center relative z-10">
          <h2 className="text-5xl md:text-7xl font-semibold tracking-tighter mb-8 text-white drop-shadow-xl">
            Ready to explore?
          </h2>
          <p className={`text-xl md:text-2xl ${accentColor} mb-12 font-light tracking-tight drop-shadow-lg`}>
            Start planning your next adventure today.
          </p>
          <Link 
            to={isAuthenticated ? "/dashboard" : "/register"} 
            ref={el => btnRefs.current[1] = el}
            className="group inline-flex items-center gap-3 bg-white text-black px-12 py-5 rounded-full text-base font-medium hover:bg-gray-200 transition-colors duration-300 pointer-events-auto cursor-pointer"
          >
            {isAuthenticated ? "Go to Dashboard" : "Start Free"}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

    </div>
  );
}
