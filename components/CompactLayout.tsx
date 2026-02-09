import React from 'react';

interface LayoutProps {
    children: React.ReactNode;
}

const CompactLayout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen flex flex-col bg-brand-100 selection:bg-brand-500/20 selection:text-brand-950 font-sans">
            {/* Reduced padding container - centered but minimal waste */}
            <main className="flex-grow flex flex-col items-center justify-start py-4 px-2 sm:px-4">
                <div className="w-full max-w-5xl">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default CompactLayout;
