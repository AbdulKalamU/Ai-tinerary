import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, MapPin, Star, Plus } from 'lucide-react';
import ActivityImage from './ActivityImage';

const MOCK_RESULTS = {
  'For you': [
    { id: 1, name: 'Louvre Museum', category: 'Attraction', rating: 4.8, mentions: 111, query: 'Louvre Museum Paris' },
    { id: 2, name: 'Arc de Triomphe', category: 'Attraction', rating: 4.6, mentions: 86, query: 'Arc de Triomphe Paris' },
    { id: 3, name: 'Eiffel Tower', category: 'Attraction', rating: 4.9, mentions: 245, query: 'Eiffel Tower Paris' }
  ],
  'Restaurants': [
    { id: 4, name: 'Le Jules Verne', category: 'Fine Dining', rating: 4.7, mentions: 42, query: 'Le Jules Verne restaurant Paris' },
    { id: 5, name: 'Café de Flore', category: 'Cafe', rating: 4.4, mentions: 156, query: 'Cafe de Flore Paris' }
  ]
};

export default function LocationPickerModal({ isOpen, onClose, destination, onAdd }) {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('For you');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    const delayDebounceFn = setTimeout(() => {
      setIsSearching(true);
      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ' ' + destination)}&limit=9`)
        .then(res => res.json())
        .then(data => {
          const formatted = data.map((item, idx) => ({
            id: `search-${Date.now()}-${idx}`,
            name: item.name || item.display_name.split(',')[0],
            category: item.type || 'Location',
            rating: 4.5 + (Math.random() * 0.5), // Mock rating
            query: item.display_name,
            location: {
              lat: parseFloat(item.lat),
              lng: parseFloat(item.lon)
            }
          }));
          setSearchResults(formatted);
          setIsSearching(false);
        })
        .catch(err => {
          console.error(err);
          setIsSearching(false);
        });
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query, destination]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  if (!isOpen) return null;

  const baseResults = MOCK_RESULTS[activeTab] || MOCK_RESULTS['For you'];
  const results = query.trim() ? searchResults : baseResults;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl max-h-[90vh] bg-[#0A0A0B] border border-[#222] rounded-3xl overflow-hidden shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[#1a1a1a]">
            <h2 className="text-xl font-medium text-white">Add to trip</h2>
            <button 
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-[#A3A3A3] hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto hide-scrollbar flex-1">
            {/* Search Bar */}
            <div className="mb-6 flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#555]" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={`Search places in ${destination}...`}
                  className="w-full bg-[#111] border border-[#222] text-white pl-12 pr-4 py-4 rounded-2xl focus:outline-none focus:border-white/30 transition-colors"
                />
              </div>
              <button className="px-6 py-4 rounded-2xl border border-[#222] text-white hover:bg-white/5 transition-colors font-medium">
                Filters
              </button>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 mb-8 overflow-x-auto hide-scrollbar pb-2">
              {['For you', 'Things to do', 'Restaurants', 'Events', 'Stays', 'Locations'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    activeTab === tab 
                      ? 'bg-white text-black' 
                      : 'bg-transparent text-[#A3A3A3] hover:text-white hover:bg-white/5'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Grid */}
            <h3 className="text-lg font-medium text-white mb-4">
              {query.trim() ? (isSearching ? 'Searching...' : 'Search Results') : activeTab}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {results.map((item) => (
                <div key={item.id} className="group relative">
                  <div className="h-48 rounded-2xl overflow-hidden relative mb-3">
                    <ActivityImage 
                      name={item.query}
                      destination={destination}
                      category={item.category}
                      uniqueId={item.id}
                      className="w-full h-full transform group-hover:scale-105 transition-transform duration-700"
                    />
                    <button 
                      onClick={() => {
                        onAdd(item);
                        onClose();
                      }}
                      className="absolute top-3 right-3 glass-pill px-3 py-1.5 flex items-center gap-1 hover:bg-white hover:text-black transition-colors"
                    >
                      <Plus className="w-3 h-3" strokeWidth={2.5} />
                      <span className="text-xs font-medium tracking-wide">Add</span>
                    </button>
                  </div>
                  <div>
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="text-white font-medium truncate pr-2">{item.name}</h4>
                      <div className="flex items-center gap-1 text-[#A3A3A3] text-sm shrink-0">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>{item.rating?.toFixed(1) || '4.5'}</span>
                      </div>
                    </div>
                    <div className="text-[#737373] text-sm flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {item.category}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
