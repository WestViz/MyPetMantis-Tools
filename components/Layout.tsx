import React from 'react';
import Header from './Header';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-brand-100 selection:bg-brand-500/20 selection:text-brand-950 font-sans">
      <Header />

      <main className="flex-grow flex flex-col items-center justify-start pt-8 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-7xl">
          {children}
        </div>
      </main>

      <footer className="py-8 text-center bg-brand-950 border-t border-brand-700">

      </footer>
    </div>
  );
};

export default Layout;
