import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Sparkles } from 'lucide-react';
import TextType from '../ui/TextType';

const SUGGESTIONS = [
  { id: 'paris', label: 'Paris, France', query: 'Paris, France' },
  { id: 'tokyo', label: 'Tokyo, Japan', query: 'Tokyo, Japan' },
  { id: 'rome', label: 'Rome, Italy', query: 'Rome, Italy' },
  { id: 'bali', label: 'Bali, Indonesia', query: 'Bali, Indonesia' }
];

export default function HeroSearch() {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query.length > 2 && showSuggestions) {
        fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`)
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
  }, [query, showSuggestions]);

  // Handle clicking outside the dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    // In a real app, this might pass the query as state to the /plan/new page
    navigate('/plan/new', { state: { initialDestination: query } });
  };

  const handleSuggestionClick = (suggestionQuery) => {
    navigate('/plan/new', { state: { initialDestination: suggestionQuery } });
  };

  return (
    <div className="w-full flex flex-col items-center justify-center py-20 px-4 relative">
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12 z-10"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[#A3A3A3] hover:text-white transition-colors text-xs font-medium mb-8 backdrop-blur-md shadow-[0_0_20px_rgba(255,255,255,0.05)] cursor-default">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>AI-Powered Travel Intelligence</span>
        </div>
        <TextType
          text={["Where are we going?", "What's your dream destination?", "Let's plan your next adventure."]}
          as="h1"
          typingSpeed={60}
          pauseDuration={2000}
          deletingSpeed={30}
          showCursor={true}
          cursorCharacter="|"
          className="text-5xl md:text-7xl font-semibold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 mb-6 pb-2 drop-shadow-sm"
        />
        <p className="text-[#A3A3A3] text-lg md:text-xl font-light tracking-tight max-w-2xl mx-auto text-balance">
          Describe your dream destination or vibe, and we'll craft a bespoke itinerary in seconds.
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="w-full max-w-3xl z-10"
      >
        <div className="relative" ref={dropdownRef}>
          <form 
            onSubmit={handleSearch}
            className={`relative flex items-center bg-black/60 backdrop-blur-2xl border ${isFocused ? 'border-indigo-500/50 ring-4 ring-indigo-500/10' : 'border-white/10 hover:border-white/20'} rounded-2xl p-2 transition-all duration-300 shadow-[0_8px_32px_rgba(0,0,0,0.8)] z-20`}
          >
            <div className="pl-5 text-[#555]">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Try 'A romantic weekend in Kyoto' or 'Kyoto, Japan'"
              className="input-ghost flex-1 px-4 py-4 text-base md:text-lg bg-transparent border-none focus:ring-0 focus:outline-none text-white placeholder:text-[#555] font-light tracking-tight"
            />
            <button 
              type="submit"
              disabled={!query.trim()}
              className="bg-white text-black px-8 py-3 rounded-xl text-sm font-medium hover:scale-[1.02] hover:bg-gray-100 transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
            >
              Design Trip
            </button>
          </form>

          {/* Autocomplete Dropdown */}
          <AnimatePresence>
            {showSuggestions && suggestions.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 4 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full left-0 right-0 w-full bg-[#0a0a0b]/95 backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden z-50 shadow-[0_20px_60px_rgba(0,0,0,0.8)]"
              >
                {suggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      const parts = suggestion.split(', ');
                      const cleanName = parts.length >= 2 ? `${parts[0]}, ${parts[parts.length - 1]}` : suggestion;
                      setQuery(cleanName);
                      setShowSuggestions(false);
                      handleSuggestionClick(cleanName);
                    }}
                    className="w-full text-left px-6 py-4 hover:bg-white/5 border-b border-white/5 last:border-0 text-white/90 font-light tracking-tight transition-colors flex items-center gap-3 group"
                  >
                    <MapPin className="w-4 h-4 text-[#555] group-hover:text-indigo-400 transition-colors shrink-0" />
                    <span className="truncate">{suggestion}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <span className="text-[10px] text-[#555] uppercase tracking-widest mr-2 font-medium">Trending:</span>
          {SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion.id}
              onClick={() => handleSuggestionClick(suggestion.query)}
              className="px-4 py-2 flex items-center gap-2 text-sm bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/5 hover:border-white/20 rounded-xl transition-all duration-300 text-white/80 hover:text-white shadow-[0_4px_12px_rgba(0,0,0,0.2)]"
            >
              <span className="opacity-80"><MapPin className="w-3.5 h-3.5 text-[#555]" /></span>
              <span className="font-light tracking-tight">{suggestion.label}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Decorative background gradients (removed for new mesh) */}
    </div>
  );
}
