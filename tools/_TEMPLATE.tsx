import React, { useState } from 'react';
import Layout from '../components/Layout';
import { ArrowRight, Calculator } from 'lucide-react';

/**
 * NEW TOOL TEMPLATE
 * 
 * 1. Copy this file to tools/YourToolName/index.tsx
 * 2. Rename the component
 * 3. Add your specific types and logic
 * 4. Register the route in App.tsx
 */

interface ToolState {
  step: 'INPUT' | 'RESULT';
  input: number;
}

const ToolTemplate: React.FC = () => {
  const [state, setState] = useState<ToolState>({ step: 'INPUT', input: 0 });

  const calculate = () => {
    // Perform calculation here
    setState(prev => ({ ...prev, step: 'RESULT' }));
  };

  return (
    <Layout>
      <div className="glass-panel rounded-[2rem] shadow-2xl p-6 sm:p-8 md:p-12 relative overflow-hidden ring-1 ring-slate-900/5 min-h-[600px]">
        
        {/* Title Section */}
        <div className="text-center mb-12 max-w-3xl mx-auto relative z-10">
          <div className="inline-flex items-center justify-center p-3 bg-brand-50 rounded-xl mb-4 text-brand-600">
             <Calculator className="w-8 h-8" />
          </div>
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
            New Calculator Tool
          </h2>
          <p className="text-lg text-slate-500">
            Description of what this tool calculates goes here.
          </p>
        </div>

        {/* INPUT VIEW */}
        {state.step === 'INPUT' && (
          <div className="max-w-xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
               <div>
                 <label className="block text-sm font-medium text-slate-700 mb-2">Input Field</label>
                 <input 
                   type="number" 
                   className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500"
                   onChange={(e) => setState(prev => ({...prev, input: parseInt(e.target.value)}))}
                 />
               </div>
               
               <button
                onClick={calculate}
                className="w-full py-4 bg-slate-900 hover:bg-brand-600 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2"
               >
                 Calculate <ArrowRight className="w-5 h-5" />
               </button>
            </div>
          </div>
        )}

        {/* RESULT VIEW */}
        {state.step === 'RESULT' && (
          <div className="max-w-2xl mx-auto text-center animate-in zoom-in-95 duration-500">
             <h3 className="text-2xl font-bold text-slate-800 mb-4">Results</h3>
             <div className="bg-green-50 text-green-800 p-8 rounded-2xl mb-8">
                Your calculated result is: <strong>{state.input * 2}</strong>
             </div>
             <button 
               onClick={() => setState(prev => ({...prev, step: 'INPUT'}))}
               className="text-slate-500 hover:text-slate-800 font-medium underline"
             >
               Start Over
             </button>
          </div>
        )}

      </div>
    </Layout>
  );
};

export default ToolTemplate;