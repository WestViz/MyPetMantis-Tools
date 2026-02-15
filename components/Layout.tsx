import React from 'react';
import Header from './Header';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-brand-50 selection:bg-accent-300/30 selection:text-brand-900 font-sans">
      <Header />
      <main className="flex-grow flex flex-col items-center justify-start pt-8 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-7xl">
          {children}
        </div>
      </main>
      <footer className="py-8 text-center bg-brand-900 border-t border-accent-400">
        <p className="text-accent-200 text-sm">My Pet Mantis Tools</p>
      </footer>
    </div>
  );
};

export default Layout;
