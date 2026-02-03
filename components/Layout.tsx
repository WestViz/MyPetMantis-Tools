import React from 'react';
import Header from './Header';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#ffe0c1] selection:bg-[#9A690F]/20 selection:text-[#291901] font-sans">
      <Header />

      <main className="flex-grow flex flex-col items-center justify-start pt-8 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-7xl">
          {children}
        </div>
      </main>

      <footer className="py-8 text-center bg-[#291901] border-t border-[#885C09]">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-[#ffe0c1]/60 text-sm">
            &copy; {new Date().getFullYear()} <a href="https://asphaltcalculatorusa.com" className="text-[#9A690F] font-semibold hover:underline">AsphaltCalculatorUSA.com</a>. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;