import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Sparkles } from 'lucide-react';

const SUGGESTIONS = [
  { id: 'paris', label: 'Paris, France', icon: '🥐', query: 'Paris, France' },
  { id: 'tokyo', label: 'Tokyo, Japan', icon: '🍣', query: 'Tokyo, Japan' },
  { id: 'rome', label: 'Rome, Italy', icon: '🏛️', query: 'Rome, Italy' },
  { id: 'bali', label: 'Bali, Indonesia', icon: '🌴', query: 'Bali, Indonesia' }
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
        className="text-center mb-10 z-10"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/70 text-xs font-medium mb-6">
          <Sparkles className="w-3.5 h-3.5 text-primary-400" />
          <span>AI-Powered Travel Intelligence</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-medium tracking-tighter text-white mb-6">
          Where are we going?
        </h1>
        <p className="text-[#A3A3A3] text-lg md:text-xl font-light max-w-2xl mx-auto text-balance">
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
            className={`relative flex items-center bg-[#0a0a0a] border ${isFocused ? 'border-white/40 ring-4 ring-white/5' : 'border-[#222]'} rounded-full p-2 transition-all duration-300 shadow-2xl z-20`}
          >
            <div className="pl-6 text-[#555]">
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
              className="input-ghost flex-1 px-4 py-4 text-base md:text-lg bg-transparent border-none focus:ring-0 focus:outline-none"
            />
            <button 
              type="submit"
              disabled={!query.trim()}
              className="bg-white text-black px-8 py-4 rounded-full font-medium hover:scale-105 transition-transform duration-300 disabled:opacity-50 disabled:hover:scale-100"
            >
              Design Trip
            </button>
          </form>

          {/* Autocomplete Dropdown */}
          <AnimatePresence>
            {showSuggestions && suggestions.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 right-0 w-full mt-4 bg-[#0a0a0a] border border-[#222] rounded-2xl overflow-hidden z-50 shadow-[0_20px_40px_rgba(0,0,0,0.9)]"
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

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <span className="text-xs text-[#555] uppercase tracking-widest mr-2 font-medium">Trending:</span>
          {SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion.id}
              onClick={() => handleSuggestionClick(suggestion.query)}
              className="glass-pill glass-pill-hover px-5 py-2 flex items-center gap-2 text-sm"
            >
              <span>{suggestion.icon}</span>
              <span className="font-light">{suggestion.label}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Decorative background gradients */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary-900/20 blur-[120px] rounded-full pointer-events-none z-0"></div>
    </div>
  );
}
