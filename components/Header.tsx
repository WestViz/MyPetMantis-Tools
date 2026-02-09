import React from 'react';
import { Layers } from 'lucide-react';

const Header: React.FC = () => {
  const handleNav = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-brand-600/30 backdrop-blur-md bg-gradient-to-r from-brand-950 to-brand-800">

    </header>
  );
};

export default Header;
