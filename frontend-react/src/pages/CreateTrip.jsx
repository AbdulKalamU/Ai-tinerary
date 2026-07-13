import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Calendar as CalendarIcon, Users, Sparkles, Loader2, ArrowRight, ArrowLeft, User, Heart, Users as UsersIcon, PartyPopper, Camera, Utensils, Moon, ShoppingBag, Music, Palette, Tent, Waves, Mountain } from 'lucide-react';
import { generatePlan } from '../api/plans';
import { ACTIVITIES, GROUP_TYPES, POPULAR_DESTINATIONS } from '../utils/constants';
import { formatDateRange, calculateDuration } from '../utils/formatters';
import toast from 'react-hot-toast';

const GROUP_ICONS = {
  'Solo': User,
  'Couple': Heart,
  'Family': UsersIcon,
  'Friends': PartyPopper
};

const ACTIVITY_ICONS = {
  'sightseeing': Camera,
  'adventure': Mountain,
  'cultural': Music,
  'historical': MapPin,
  'relaxation': Heart,
  'shopping': ShoppingBag,
  'nightlife': Moon,
  'food': Utensils,
  'photography': Camera,
  'beach': Waves,
  'hiking': Tent,
  'art': Palette
};

export default function CreateTrip() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const initialDestination = location.state?.initialDestination || '';
  
  const [step, setStep] = useState(initialDestination ? 2 : 1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState({
    destination: initialDestination,
    startDate: '',
    endDate: '',
    groupType: '',
    activities: []
  });

  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (formData.destination.length > 2 && showSuggestions) {
        fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(formData.destination)}&limit=5`)
          .then(res => res.json())
          .then(data => {
            setSuggestions(data.map(item => item.display_name));
          })
          .catch(err => console.error(err));
      } else {
        setSuggestions([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [formData.destination, showSuggestions]);

  const duration = calculateDuration(formData.startDate, formData.endDate);

  const nextStep = () => {
    if (step === 1 && !formData.destination) {
      toast.error('Please enter a destination');
      return;
    }
    if (step === 2) {
      if (!formData.startDate || !formData.endDate) {
        toast.error('Please select both dates');
        return;
      }
      if (new Date(formData.endDate) <= new Date(formData.startDate)) {
        toast.error('End date must be after start date');
        return;
      }
    }
    if (step === 3) {
      if (!formData.groupType) {
        toast.error('Please select who you are traveling with');
        return;
      }
      if (formData.activities.length === 0) {
        toast.error('Please select at least one activity');
        return;
      }
    }
    setStep((s) => Math.min(s + 1, 4));
  };

  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const toggleActivity = (id) => {
    setFormData(prev => ({
      ...prev,
      activities: prev.activities.includes(id)
        ? prev.activities.filter(a => a !== id)
        : [...prev.activities, id]
    }));
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const mappedActivities = formData.activities.map(id => 
        ACTIVITIES.find(a => a.id === id)?.label || id
      );

      const request = {
        destination: formData.destination,
        startDate: formData.startDate,
        endDate: formData.endDate,
        groupType: formData.groupType,
        activities: mappedActivities
      };

      const response = await generatePlan(request);
      toast.success('Your itinerary is ready.');
      navigate(`/plan/${response.id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate plan. Please try again.');
      setIsGenerating(false);
    }
  };

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? '10%' : '-10%',
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      x: direction < 0 ? '10%' : '-10%',
      opacity: 0
    })
  };

  if (isGenerating) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center relative bg-[#030303]">
        <div className="relative z-10 flex flex-col items-center">
          <Loader2 className="w-12 h-12 animate-spin text-white mb-8" strokeWidth={1.5} />
          <h2 className="text-4xl md:text-5xl font-medium tracking-tight text-white mb-4 text-center">
            Designing itinerary.
          </h2>
          <p className="text-[#A3A3A3] mb-8 text-center max-w-md font-light text-lg">
            Curating experiences and optimizing travel routes for {formData.destination}.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#030303] flex items-center justify-center pt-24 px-4 pb-20 relative overflow-hidden">
      {/* Premium background depth */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-white/5 blur-[120px] rounded-full pointer-events-none z-0"></div>

      <div className="flex-1 w-full max-w-4xl mx-auto relative z-10">
        {/* Progress Indicator */}
        <div className="mb-20">
          <div className="flex justify-between relative items-center">
            <div className="absolute left-0 w-full h-[1px] bg-white/10" />
            <div 
              className="absolute left-0 h-[1px] bg-white transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]" 
              style={{ width: `${((step - 1) / 3) * 100}%` }} 
            />
            
            {[1, 2, 3, 4].map((i) => (
              <div 
                key={i}
                className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-500
                  ${step >= i ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.3)]' : 'bg-[#0a0a0a] text-[#555] border border-[#222]'}`}
              >
                {i}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-6 px-1">
            <span className={`text-[10px] uppercase tracking-widest font-medium hidden sm:block ${step >= 1 ? 'text-white' : 'text-[#555]'}`}>Destination</span>
            <span className={`text-[10px] uppercase tracking-widest font-medium hidden sm:block ${step >= 2 ? 'text-white' : 'text-[#555]'}`}>Dates</span>
            <span className={`text-[10px] uppercase tracking-widest font-medium hidden sm:block ${step >= 3 ? 'text-white' : 'text-[#555]'}`}>Preferences</span>
            <span className={`text-[10px] uppercase tracking-widest font-medium hidden sm:block ${step >= 4 ? 'text-white' : 'text-[#555]'}`}>Review</span>
          </div>
        </div>

        {/* Form Content Wrapper */}
        <div className="relative min-h-[450px]">
          <AnimatePresence mode="wait" custom={1}>
            
            {/* STEP 1 */}
            {step === 1 && (
              <motion.div
                key="step1"
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-0"
              >
                <h2 className="text-5xl md:text-6xl font-medium tracking-tighter text-white mb-6">
                  Where are you heading?
                </h2>
                <p className="text-[#A3A3A3] mb-12 font-light text-xl">Enter a city, region, or country.</p>
                
                <div className="relative mb-16">
                  <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-[#555]" strokeWidth={1.5} />
                  <input
                    type="text"
                    value={formData.destination}
                    onChange={(e) => {
                      setFormData({...formData, destination: e.target.value});
                      setShowSuggestions(true);
                    }}
                    placeholder="e.g. Tokyo, Japan"
                    className="w-full bg-[#0a0a0a] border border-[#222] focus:border-white/40 focus:ring-4 focus:ring-white/5 rounded-3xl pl-16 pr-6 py-6 text-2xl text-white transition-all shadow-inner focus:outline-none font-light placeholder:text-[#333]"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setShowSuggestions(false);
                        nextStep();
                      }
                    }}
                  />
                  
                  <AnimatePresence>
                    {showSuggestions && suggestions.length > 0 && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute w-full mt-4 bg-[#0a0a0a] border border-[#222] rounded-2xl overflow-hidden z-50 shadow-[0_10px_40px_rgba(0,0,0,0.8)]"
                      >
                        {suggestions.map((suggestion, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              // Get just the main parts of the location for a cleaner input
                              const parts = suggestion.split(', ');
                              const cleanName = parts.length >= 2 ? `${parts[0]}, ${parts[parts.length - 1]}` : suggestion;
                              setFormData({...formData, destination: cleanName});
                              setShowSuggestions(false);
                            }}
                            className="w-full text-left px-6 py-4 hover:bg-white/5 border-b border-[#222] last:border-0 text-white font-light transition-colors flex items-center gap-3"
                          >
                            <MapPin className="w-4 h-4 text-[#737373] shrink-0" />
                            <span className="truncate">{suggestion}</span>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div>
                  <h3 className="text-xs font-medium text-[#737373] mb-6 uppercase tracking-widest">Popular Destinations</h3>
                  <div className="flex flex-wrap gap-4">
                    {POPULAR_DESTINATIONS.map((dest) => (
                      <button
                         key={dest.name}
                        onClick={() => {
                          setFormData({...formData, destination: `${dest.name}, ${dest.country}`});
                          setTimeout(() => setStep(2), 300);
                        }}
                        className="glass-pill glass-pill-hover px-6 py-3 flex items-center gap-2"
                      >
                        <span className="text-white font-medium">{dest.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <motion.div
                key="step2"
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-0"
              >
                <h2 className="text-5xl md:text-6xl font-medium tracking-tighter text-white mb-6">
                  When are you going?
                </h2>
                <p className="text-[#A3A3A3] mb-12 font-light text-xl">Define your dates of travel for {formData.destination}.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                  <div className="bg-[#0a0a0a] border border-[#222] rounded-3xl p-6">
                    <label className="text-xs font-medium text-[#737373] mb-4 uppercase tracking-widest flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-[#555]" strokeWidth={1.5} /> Start Date
                    </label>
                    <input
                      type="date"
                      value={formData.startDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                      style={{ colorScheme: 'dark' }}
                      className="w-full bg-transparent text-2xl font-light text-white focus:outline-none [&::-webkit-calendar-picker-indicator]:invert cursor-pointer"
                    />
                  </div>
                  
                  <div className="bg-[#0a0a0a] border border-[#222] rounded-3xl p-6">
                    <label className="text-xs font-medium text-[#737373] mb-4 uppercase tracking-widest flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-[#555]" strokeWidth={1.5} /> End Date
                    </label>
                    <input
                      type="date"
                      value={formData.endDate}
                      min={formData.startDate || new Date().toISOString().split('T')[0]}
                      onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                      style={{ colorScheme: 'dark' }}
                      className="w-full bg-transparent text-2xl font-light text-white focus:outline-none [&::-webkit-calendar-picker-indicator]:invert cursor-pointer"
                    />
                  </div>
                </div>
                
                {duration > 0 && (
                  <motion.div initial={{opacity:0}} animate={{opacity:1}} className="text-left">
                    <span className="glass-pill px-6 py-3">
                      Duration: {duration} days
                    </span>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <motion.div
                key="step3"
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-0"
              >
                <h2 className="text-5xl md:text-6xl font-medium tracking-tighter text-white mb-6">
                  What's your vibe?
                </h2>
                <p className="text-[#A3A3A3] mb-12 font-light text-xl">Help us tailor the experience.</p>
                
                <div className="mb-12">
                  <label className="block text-xs font-medium text-[#737373] mb-6 uppercase tracking-widest">Who's going?</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {GROUP_TYPES.map((group) => {
                      const Icon = GROUP_ICONS[group.label] || User;
                      return (
                        <button
                          key={group.id}
                          onClick={() => setFormData({...formData, groupType: group.label})}
                          className={`p-6 rounded-3xl flex flex-col items-center justify-center text-center transition-all duration-300 border ${
                            formData.groupType === group.label 
                              ? 'border-white bg-white/10 text-white shadow-[0_0_20px_rgba(255,255,255,0.1)]' 
                              : 'border-[#222] bg-[#0a0a0a] text-[#A3A3A3] hover:border-white/50'
                          }`}
                        >
                          <Icon className={`w-8 h-8 mb-4 ${formData.groupType === group.label ? 'text-white' : 'text-[#737373]'}`} strokeWidth={1.5} />
                          <span className="font-medium mb-1">{group.label}</span>
                          <span className="text-[10px] font-light opacity-60">{group.description}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#737373] mb-6 uppercase tracking-widest">Interests</label>
                  <div className="flex flex-wrap gap-3">
                    {ACTIVITIES.map((act) => {
                      const isSelected = formData.activities.includes(act.id);
                      const Icon = ACTIVITY_ICONS[act.id] || Sparkles;
                      return (
                        <button
                          key={act.id}
                          onClick={() => toggleActivity(act.id)}
                          className={`glass-pill px-6 py-3 transition-all duration-300 flex items-center gap-2 ${
                            isSelected
                              ? 'bg-white text-black border-white'
                              : 'hover:bg-white/10'
                          }`}
                        >
                          <Icon className="w-4 h-4" strokeWidth={isSelected ? 2 : 1.5} />
                          <span>{act.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 4 */}
            {step === 4 && (
              <motion.div
                key="step4"
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-0"
              >
                <h2 className="text-5xl md:text-6xl font-medium tracking-tighter text-white mb-12">
                  Ready to fly.
                </h2>
                
                <div className="bg-[#0a0a0a] border border-[#222] rounded-3xl p-10 mb-12 grid grid-cols-1 md:grid-cols-2 gap-12 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary-900/10 blur-[80px] rounded-full pointer-events-none"></div>

                  <div>
                    <p className="text-[#737373] text-xs font-medium mb-3 uppercase tracking-widest">Destination</p>
                    <p className="text-3xl font-medium text-white flex items-center gap-3 tracking-tight">
                      <MapPin className="text-white/50 w-6 h-6" /> {formData.destination}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-[#737373] text-xs font-medium mb-3 uppercase tracking-widest">Timeframe</p>
                    <p className="text-2xl font-light text-white mb-1">
                      {formatDateRange(formData.startDate, formData.endDate)}
                    </p>
                    <p className="text-white/50 text-sm font-medium">{duration} days</p>
                  </div>
                  
                  <div>
                    <p className="text-[#737373] text-xs font-medium mb-3 uppercase tracking-widest">Travelers</p>
                    <p className="text-2xl font-light text-white flex items-center gap-3">
                      <Users className="text-white/50 w-6 h-6" /> {formData.groupType}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-[#737373] text-xs font-medium mb-4 uppercase tracking-widest">Interests</p>
                    <div className="flex flex-wrap gap-2">
                      {formData.activities.map(actId => {
                        const act = ACTIVITIES.find(a => a.id === actId);
                        return (
                          <span key={actId} className="glass-pill px-3 py-1.5 text-xs font-light">
                            {act?.label}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
                
                <div className="text-left mt-16">
                  <button
                    onClick={handleGenerate}
                    className="btn-primary text-lg px-12 py-5 inline-flex items-center gap-3"
                  >
                    <Sparkles className="w-5 h-5" strokeWidth={2} />
                    Compile Itinerary
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation Buttons (Bottom) */}
        <div className="mt-24 pt-8 border-t border-white/5 flex justify-between items-center relative z-20">
          {step > 1 ? (
            <button
              onClick={prevStep}
              className="glass-pill px-6 py-3 hover:bg-white/10 flex items-center gap-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Previous
            </button>
          ) : (
            <div />
          )}
          
          {step < 4 && (
            <button
              onClick={nextStep}
              className="btn-primary px-8 py-3 flex items-center gap-2 transition-colors"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
