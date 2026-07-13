import { Link } from 'react-router-dom';
import { Plus, Upload, Search, FileText } from 'lucide-react';

const actions = [
  { icon: Plus, label: 'New Trip', path: '/plan/new', shortcut: '⌘N' },
  { icon: Upload, label: 'Upload', path: null, shortcut: '⌘U' },
  { icon: Search, label: 'Search', path: null, shortcut: '⌘K', isCommandPalette: true },
  { icon: FileText, label: 'Packing List', path: null, shortcut: null },
];

const baseStyles =
  'border border-[#222] hover:border-[#444] px-4 py-2 flex items-center gap-2 text-xs text-[#A3A3A3] hover:text-white transition-colors';

export default function QuickActions() {
  const handleCommandPalette = () => {
    document.dispatchEvent(new CustomEvent('open-command-palette'));
  };

  return (
    <div className="flex flex-wrap gap-3">
      {actions.map((action) => {
        const Icon = action.icon;

        const content = (
          <>
            <Icon className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>{action.label}</span>
            {action.shortcut && (
              <span className="text-[10px] text-[#555] ml-auto">
                {action.shortcut}
              </span>
            )}
          </>
        );

        if (action.path) {
          return (
            <Link key={action.label} to={action.path} className={baseStyles}>
              {content}
            </Link>
          );
        }

        if (action.isCommandPalette) {
          return (
            <button
              key={action.label}
              onClick={handleCommandPalette}
              className={baseStyles}
            >
              {content}
            </button>
          );
        }

        return (
          <button
            key={action.label}
            disabled
            className={`${baseStyles} opacity-50 cursor-not-allowed hover:border-[#222] hover:text-[#A3A3A3]`}
          >
            {content}
          </button>
        );
      })}
    </div>
  );
}
