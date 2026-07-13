import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Command,
  Plus,
  Search,
  Upload,
  CheckSquare,
  LayoutDashboard,
  Settings,
} from 'lucide-react';

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();

  const commands = useMemo(
    () => [
      {
        section: 'Trips',
        items: [
          {
            icon: Plus,
            label: 'Create New Trip',
            shortcut: '⌘N',
            action: () => {
              navigate('/plan/new');
              setIsOpen(false);
            },
          },
          {
            icon: Search,
            label: 'Search Destinations',
            action: () => setIsOpen(false),
          },
        ],
      },
      {
        section: 'Tools',
        items: [
          {
            icon: Upload,
            label: 'Upload Documents',
            action: () => setIsOpen(false),
          },
          {
            icon: CheckSquare,
            label: 'Generate Packing List',
            action: () => setIsOpen(false),
          },
        ],
      },
      {
        section: 'Navigation',
        items: [
          {
            icon: LayoutDashboard,
            label: 'Dashboard',
            action: () => {
              navigate('/dashboard');
              setIsOpen(false);
            },
          },
          {
            icon: Settings,
            label: 'Settings',
            action: () => setIsOpen(false),
          },
        ],
      },
    ],
    [navigate]
  );

  // Flatten all items for filtering and keyboard navigation
  const allItems = useMemo(
    () => commands.flatMap((group) => group.items),
    [commands]
  );

  const filteredItems = useMemo(() => {
    if (!query.trim()) return allItems;
    const q = query.toLowerCase();
    return allItems.filter((item) => item.label.toLowerCase().includes(q));
  }, [query, allItems]);

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Clamp selectedIndex when filtered results change
  useEffect(() => {
    if (selectedIndex >= filteredItems.length) {
      setSelectedIndex(Math.max(0, filteredItems.length - 1));
    }
  }, [filteredItems.length, selectedIndex]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
        return;
      }

      if (e.key === 'Escape') {
        setIsOpen(false);
        return;
      }

      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) =>
          filteredItems.length === 0 ? 0 : (prev + 1) % filteredItems.length
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) =>
          filteredItems.length === 0
            ? 0
            : (prev - 1 + filteredItems.length) % filteredItems.length
        );
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          filteredItems[selectedIndex].action();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex]);

  // Listen for custom event from QuickActions
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    document.addEventListener('open-command-palette', handleOpen);
    return () => document.removeEventListener('open-command-palette', handleOpen);
  }, []);

  const executeItem = useCallback(
    (item) => {
      item.action();
    },
    []
  );

  if (!isOpen) return null;

  // Build grouped view for empty query
  const renderGrouped = () => {
    let flatIndex = 0;
    return commands.map((group) => (
      <div key={group.section}>
        <div className="px-5 py-2 text-[10px] text-[#555] uppercase tracking-widest">
          {group.section}
        </div>
        {group.items.map((item) => {
          const Icon = item.icon;
          const currentIndex = flatIndex;
          flatIndex += 1;
          const isSelected = currentIndex === selectedIndex;

          return (
            <button
              key={item.label}
              onClick={() => executeItem(item)}
              onMouseEnter={() => setSelectedIndex(currentIndex)}
              className={`w-full px-5 py-3 flex items-center gap-3 cursor-pointer transition-colors text-left ${
                isSelected
                  ? 'bg-[#111] text-white'
                  : 'text-[#A3A3A3] hover:bg-[#0a0a0a] hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" strokeWidth={1.5} />
              <span className="text-sm">{item.label}</span>
              {item.shortcut && (
                <span className="text-[10px] text-[#555] ml-auto">
                  {item.shortcut}
                </span>
              )}
            </button>
          );
        })}
      </div>
    ));
  };

  // Build flat filtered view
  const renderFiltered = () =>
    filteredItems.map((item, index) => {
      const Icon = item.icon;
      const isSelected = index === selectedIndex;

      return (
        <button
          key={item.label}
          onClick={() => executeItem(item)}
          onMouseEnter={() => setSelectedIndex(index)}
          className={`w-full px-5 py-3 flex items-center gap-3 cursor-pointer transition-colors text-left ${
            isSelected
              ? 'bg-[#111] text-white'
              : 'text-[#A3A3A3] hover:bg-[#0a0a0a] hover:text-white'
          }`}
        >
          <Icon className="w-4 h-4 shrink-0" strokeWidth={1.5} />
          <span className="text-sm">{item.label}</span>
          {item.shortcut && (
            <span className="text-[10px] text-[#555] ml-auto">
              {item.shortcut}
            </span>
          )}
        </button>
      );
    });

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setIsOpen(false)}
      />

      {/* Modal */}
      <motion.div
        className="fixed top-[20vh] left-1/2 -translate-x-1/2 w-full max-w-lg z-50 border border-[#222] bg-black shadow-2xl overflow-hidden"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
      >
        {/* Search row */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[#222]">
          <Command className="w-4 h-4 text-[#555] shrink-0" strokeWidth={1.5} />
          <input
            type="text"
            className="flex-1 bg-transparent text-white text-sm focus:outline-none placeholder:text-[#555]"
            placeholder="Type a command..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            autoFocus
          />
          <span className="text-[10px] text-[#555] border border-[#333] px-1.5 py-0.5 shrink-0">
            ESC
          </span>
        </div>

        {/* Results */}
        <div className="max-h-[300px] overflow-y-auto py-2">
          {filteredItems.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-[#555]">
              No commands found
            </div>
          ) : query.trim() ? (
            renderFiltered()
          ) : (
            renderGrouped()
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
