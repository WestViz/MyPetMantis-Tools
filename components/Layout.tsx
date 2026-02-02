import React from 'react';
import Header from './Header';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 selection:bg-brand-200 selection:text-brand-900 font-sans">
      <Header />

      <main className="flex-grow flex flex-col items-center justify-start pt-8 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-7xl">
          {children}
        </div>
      </main>

      <footer className="py-8 text-center bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-slate-400 text-sm">
            &copy; {new Date().getFullYear()} <a href="https://www.mypoolcalc.com" className="text-brand-600 font-semibold hover:underline">MyPoolCalc.com</a>. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;