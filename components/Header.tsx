import React from 'react';
import { Layers } from 'lucide-react';

const Header: React.FC = () => {
  const handleNav = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  return (<br></br>
    /*<header className="sticky top-0 z-50 w-full glass-panel border-b border-brand-100/50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-center sm:justify-between">
        <a href="/" onClick={(e) => handleNav(e, '/')} className="flex items-center gap-3 group cursor-pointer select-none">
          <div className="bg-gradient-to-br from-brand-600 to-brand-700 p-2.5 rounded-xl shadow-lg shadow-brand-500/20 transition-all duration-300 transform group-hover:scale-105">
            <Layers className="w-6 h-6 text-white" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold text-slate-900 leading-none tracking-tight">My Pool Calc</h1>
            <span className="text-xs text-brand-600 font-medium tracking-wide">Professional Pool Calculators and Estimators</span>
          </div>
        </a>
      </div>
    </header>*/
  );
};

export default Header;
