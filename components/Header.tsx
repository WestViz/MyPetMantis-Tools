import React from 'react';
import { Bug } from 'lucide-react';

const Header: React.FC = () => {
  const handleNav = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-brand-500/40 backdrop-blur-md bg-gradient-to-r from-brand-900 via-brand-800 to-brand-700">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-accent-400 rounded-lg shadow-lg shadow-accent-400/30">
            <Bug className="w-6 h-6 text-brand-900" />
          </div>
          <h1 className="text-xl font-bold text-white">
            <span className="text-accent-300">My Pet</span> Mantis <span className="text-accent-300">Tools</span>
          </h1>
        </div>
        <nav className="flex gap-4">
          <button
            onClick={(e) => handleNav(e, '/')}
            className="px-4 py-2 text-sm font-medium text-white/90 hover:text-accent-300 transition-colors"
          >
            Dashboard
          </button>
          <button
            onClick={(e) => handleNav(e, '/diet')}
            className="px-4 py-2 text-sm font-medium text-white/90 hover:text-accent-300 transition-colors"
          >
            Diet
          </button>
          <button
            onClick={(e) => handleNav(e, '/habitat')}
            className="px-4 py-2 text-sm font-medium text-white/90 hover:text-accent-300 transition-colors"
          >
            Habitat
          </button>
          <button
            onClick={(e) => handleNav(e, '/diagnose')}
            className="px-4 py-2 text-sm font-medium text-white/90 hover:text-accent-300 transition-colors"
          >
            Health
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
