import React, { useMemo, useState } from 'react';
import { RefreshCw, Wrench, Layers, Calculator, Plus, Minus, CheckCircle, Ruler } from 'lucide-react';

type CalculationMode = 'dimensions' | 'area';

type Inputs = {
  length: number;
  width: number;
  areaSqFt: number;
  overlayThicknessIn: number;
  pricePerSqFt: number;
  repairAllowancePct: number;
  sealcoatPrice: number;
  includeSealcoat: boolean;
};

const DrivewayResurfacingCalculator: React.FC = () => {
  const [mode, setMode] = useState<CalculationMode>('dimensions');
  const [inputs, setInputs] = useState<Inputs>({
    length: 50,
    width: 20,
    areaSqFt: 1000,
    overlayThicknessIn: 1.5, // Standard overlay
    pricePerSqFt: 2.50,
    repairAllowancePct: 5, // Starts at "Good" condition
    sealcoatPrice: 0.45,
    includeSealcoat: true
  });

  const result = useMemo(() => {
    // 1. Calculate Area
    const finalArea = mode === 'dimensions' ? inputs.length * inputs.width : inputs.areaSqFt;

    // 2. Costs
    const baseOverlayCost = finalArea * inputs.pricePerSqFt;
    
    // Repair cost is a percentage of the base job, or a fixed allowable budget
    const repairCost = baseOverlayCost * (inputs.repairAllowancePct / 100);
    
    const sealcoatCost = inputs.includeSealcoat ? (finalArea * inputs.sealcoatPrice) : 0;
    
    const total = baseOverlayCost + repairCost + sealcoatCost;

    // 3. Technical Specs (Tonnage)
    // Even if paying by SqFt, it's helpful to know tons. 
    // Formula: (Area * Thickness/12 * 145lbs) / 2000
    const volumeFt3 = finalArea * (inputs.overlayThicknessIn / 12);
    const tons = (volumeFt3 * 145) / 2000;

    // 4. Analysis
    let thicknessNote = 'Standard Overlay';
    if (inputs.overlayThicknessIn < 1.5) thicknessNote = 'Thin Overlay (Cosmetic)';
    if (inputs.overlayThicknessIn >= 2.5) thicknessNote = 'Structural Overlay (Heavy Duty)';

    return {
      area: Math.round(finalArea * 100) / 100,
      base: Math.round(baseOverlayCost * 100) / 100,
      repairs: Math.round(repairCost * 100) / 100,
      seal: Math.round(sealcoatCost * 100) / 100,
      total: Math.round(total * 100) / 100,
      tons: Math.round(tons * 100) / 100,
      thicknessNote
    };
  }, [inputs, mode]);

  const update = (field: keyof Inputs, value: any) => {
    if (typeof value === 'number' && value < 0) return;
    setInputs((p) => ({ ...p, [field]: value }));
  };

  const adjustValue = (field: keyof Inputs, amount: number) => {
    const current = inputs[field] as number;
    const newVal = parseFloat((current + amount).toFixed(2));
    update(field, Math.max(0, newVal));
  };

  const setCondition = (type: 'good' | 'fair' | 'poor') => {
    let val = 5;
    if (type === 'fair') val = 15;
    if (type === 'poor') val = 30;
    update('repairAllowancePct', val);
  };

  const handleReset = () => {
    setInputs({
      length: 50, width: 20, areaSqFt: 1000,
      overlayThicknessIn: 1.5, pricePerSqFt: 2.50,
      repairAllowancePct: 5, sealcoatPrice: 0.45,
      includeSealcoat: true
    });
    setMode('dimensions');
  };

  return (
    <div className="glass-panel text-slate-900 rounded-[2rem] shadow-xl bg-white/95 backdrop-blur-md border border-[#885C09]/20 p-4 md:p-8 relative overflow-hidden max-w-6xl mx-auto">
      <div className="absolute top-0 right-0 -mt-16 -mr-16 w-56 h-56 bg-[#9A690F]/20 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div className="text-center md:text-left">
            <div className="inline-flex items-center gap-2 mb-2 justify-center md:justify-start">
              <span className="p-2 bg-[#9A690F]/10 text-[#885C09] rounded-lg"><RefreshCw className="w-6 h-6" /></span>
              <span className="text-xs font-bold tracking-widest text-[#885C09] uppercase">Resurfacing Estimator</span>
            </div>
            <h1 className="text-3xl font-black text-[#291901] tracking-tight">Driveway Resurfacing</h1>
            <p className="text-xs text-[#885C09] mt-1">Overlay thickness visualizer & cost estimator</p>
          </div>
          <button onClick={handleReset} className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#fcebd9] text-[#885C09] hover:bg-[#885C09] hover:text-white transition-all text-xs font-bold uppercase tracking-wider">
            <RefreshCw className="w-4 h-4" /> Reset
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT: INPUTS */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Dimensions */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#885C09]/10">
              <div className="flex justify-between items-center mb-4 border-b border-[#885C09]/10 pb-2">
                <div className="flex items-center gap-2">
                  <Ruler className="w-4 h-4 text-[#885C09]" />
                  <h3 className="text-xs font-black text-[#885C09] uppercase tracking-wider">Dimensions</h3>
                </div>
                 <div className="flex bg-[#f8f5f1] rounded-lg p-1">
                  <button onClick={() => setMode('dimensions')} className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wide rounded-md transition-all ${mode === 'dimensions' ? 'bg-white text-[#885C09] shadow-sm' : 'text-slate-400'}`}>L x W</button>
                  <button onClick={() => setMode('area')} className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wide rounded-md transition-all ${mode === 'area' ? 'bg-white text-[#885C09] shadow-sm' : 'text-slate-400'}`}>Total Area</button>
                </div>
              </div>

              {mode === 'dimensions' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputGroup label="Length" value={inputs.length} unit="ft" onChange={(v) => update('length', v)} onAdjust={(v) => adjustValue('length', v)} />
                  <InputGroup label="Width" value={inputs.width} unit="ft" onChange={(v) => update('width', v)} onAdjust={(v) => adjustValue('width', v)} />
                </div>
              ) : (
                 <InputGroup label="Total Area" value={inputs.areaSqFt} unit="sq ft" step={50} onChange={(v) => update('areaSqFt', v)} onAdjust={(v) => adjustValue('areaSqFt', v)} />
              )}
            </div>

            {/* Thickness & Condition */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#885C09]/10">
              <div className="flex items-center gap-2 mb-4 border-b border-[#885C09]/10 pb-2">
                 <Layers className="w-4 h-4 text-[#885C09]" />
                 <h3 className="text-xs font-black text-[#885C09] uppercase tracking-wider">Specs & Condition</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <InputGroup label="New Overlay Thickness" value={inputs.overlayThicknessIn} unit="in" step={0.25} onChange={(v) => update('overlayThicknessIn', v)} onAdjust={(v) => adjustValue('overlayThicknessIn', v)} />
                    <p className="text-[10px] text-slate-400 mt-2 text-right">{result.thicknessNote}</p>
                 </div>

                 <div>
                    <label className="block text-xs font-bold text-[#885C09] uppercase mb-2">Current Condition</label>
                    <div className="flex gap-2 mb-3">
                      {['good', 'fair', 'poor'].map((c) => (
                        <button
                          key={c}
                          onClick={() => setCondition(c as any)}
                          className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase border transition-all ${
                            (c === 'good' && inputs.repairAllowancePct === 5) || 
                            (c === 'fair' && inputs.repairAllowancePct === 15) || 
                            (c === 'poor' && inputs.repairAllowancePct === 30)
                            ? 'bg-[#885C09] text-white border-[#885C09]' 
                            : 'bg-white text-slate-500 border-slate-200 hover:border-[#885C09]'
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                       <span>Repair Allowance:</span>
                       <span className="font-bold">{inputs.repairAllowancePct}%</span>
                    </div>
                 </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#885C09]/10">
               <div className="flex items-center gap-2 mb-4 border-b border-[#885C09]/10 pb-2">
                 <Calculator className="w-4 h-4 text-[#885C09]" />
                 <h3 className="text-xs font-black text-[#885C09] uppercase tracking-wider">Pricing</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputGroup label="Asphalt Price" value={inputs.pricePerSqFt} unit="$/sq ft" step={0.1} onChange={(v) => update('pricePerSqFt', v)} onAdjust={(v) => adjustValue('pricePerSqFt', v)} />
                
                <div className="flex flex-col justify-end">
                   <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-[#885C09] uppercase">Include Sealcoat?</label>
                      <button 
                        onClick={() => update('includeSealcoat', !inputs.includeSealcoat)}
                        className={`relative w-10 h-5 rounded-full transition-colors ${inputs.includeSealcoat ? 'bg-[#885C09]' : 'bg-slate-200'}`}
                      >
                         <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${inputs.includeSealcoat ? 'translate-x-5' : ''}`}></div>
                      </button>
                   </div>
                   <div className={`transition-opacity ${inputs.includeSealcoat ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                      <InputGroup label="Sealcoat Price" value={inputs.sealcoatPrice} unit="$/sq ft" step={0.05} noLabel onChange={(v) => update('sealcoatPrice', v)} onAdjust={(v) => adjustValue('sealcoatPrice', v)} />
                   </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: VISUALS & RESULTS */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* 1. VISUAL CROSS SECTION */}
            <div className="bg-white p-6 rounded-3xl shadow-lg border border-[#885C09]/10 overflow-hidden relative">
               <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xs font-bold text-[#885C09] uppercase tracking-wider flex items-center gap-2">
                    <Layers className="w-4 h-4" /> Cross Section
                  </h3>
                  <span className="text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-500">Live Preview</span>
               </div>

               {/* The Visualization Container */}
               <div className="relative w-full h-48 flex flex-col justify-end items-center bg-[#e5e7eb]/30 rounded-xl border-b-4 border-[#a8a29e] overflow-hidden">
                  
                  {/* Sealcoat Layer */}
                  <div 
                    className={`w-full transition-all duration-500 ease-in-out bg-slate-900 ${inputs.includeSealcoat ? 'h-2 opacity-100' : 'h-0 opacity-0'}`}
                    style={{ boxShadow: '0 0 10px rgba(0,0,0,0.5) inset' }} // Glossy effect
                  ></div>

                  {/* New Asphalt Overlay (Dynamic Height) */}
                  <div 
                    className="w-full bg-[#333] relative transition-all duration-500 ease-out flex items-center justify-center group"
                    style={{ height: `${Math.max(20, inputs.overlayThicknessIn * 20)}px` }} // Scale: 1 inch = 20px
                  >
                     {/* Grain texture using CSS pattern */}
                     <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '4px 4px' }}></div>
                     
                     <span className="relative z-10 text-[10px] font-bold text-white/90 bg-black/40 px-2 py-0.5 rounded backdrop-blur-sm">
                       New Overlay ({inputs.overlayThicknessIn}")
                     </span>

                     {/* Ruler Indicator */}
                     <div className="absolute right-0 top-0 bottom-0 w-8 border-l border-white/20 flex flex-col justify-between py-1 text-[8px] text-white/50 px-1">
                        <span>Top</span>
                        <span>Btm</span>
                     </div>
                  </div>

                  {/* Levelling / Glue Layer */}
                  <div className="w-full h-1 bg-black/50"></div>

                  {/* Existing Base (Static) */}
                  <div className="w-full h-16 bg-[#a8a29e] relative flex items-center justify-center">
                     {/* Cracks visualization */}
                     <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(45deg, transparent 48%, #000 50%, transparent 52%)', backgroundSize: '20px 20px' }}></div>
                     <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Existing Base</span>
                  </div>
               </div>
               
               <div className="flex justify-between mt-4 text-[10px] text-slate-400">
                  <div className="flex items-center gap-1"><div className="w-3 h-3 bg-[#a8a29e] rounded-sm"></div> Old Driveway</div>
                  <div className="flex items-center gap-1"><div className="w-3 h-3 bg-[#333] rounded-sm"></div> New Hot Mix</div>
                  {inputs.includeSealcoat && <div className="flex items-center gap-1"><div className="w-3 h-3 bg-black rounded-sm"></div> Sealcoat</div>}
               </div>
            </div>

            {/* 2. COST RESULT */}
            <div className="bg-gradient-to-br from-[#291901] to-[#885C09] text-white p-6 rounded-3xl shadow-2xl relative overflow-hidden">
               <div className="relative z-10">
                <p className="text-[#ffe0c1]/70 font-bold uppercase tracking-widest text-xs mb-1">Total Estimate</p>
                <div className="text-5xl font-black mb-4">${result.total.toLocaleString()}</div>
                
                <div className="space-y-2 border-t border-white/10 pt-4 text-sm">
                  <div className="flex justify-between text-white/80">
                    <span>Overlay ({result.area.toLocaleString()} sq ft)</span>
                    <span className="font-bold">${result.base.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-white/80">
                    <span>Repairs ({inputs.repairAllowancePct}%)</span>
                    <span className="font-bold">${result.repairs.toLocaleString()}</span>
                  </div>
                  {inputs.includeSealcoat && (
                    <div className="flex justify-between text-[#ffe0c1]">
                      <span>Sealcoat Finish</span>
                      <span className="font-bold">${result.seal.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 3. MATERIAL SPECS */}
            <div className="bg-[#291901]/5 p-5 rounded-2xl border border-[#291901]/10 flex items-center justify-between">
               <div>
                  <h4 className="text-xs font-bold text-[#885C09] uppercase tracking-wide flex items-center gap-1">
                    <Wrench className="w-3 h-3" /> Material Load
                  </h4>
                  <p className="text-[10px] text-slate-500 max-w-[150px] mt-1">
                    Est. Hot Mix needed for {inputs.overlayThicknessIn}" overlay.
                  </p>
               </div>
               <div className="text-right">
                  <div className="text-3xl font-black text-[#291901]">{result.tons}</div>
                  <div className="text-[10px] font-bold text-[#885C09] uppercase">Tons</div>
               </div>
            </div>

          </div>
        </div>
      </div>            <div className="text-center mt-6">
                <p className="text-[#885C09] text-sm">
                    Disclaimer: Always consult with a licensed contractor or engineer for precise project planning. Results are for informational purposes only.
                    <br></br>
                    Powered by <a href="https://asphaltcalculatorusa.com" className="text-[#9A690F] font-bold hover:underline" target="_blank" rel="noopener noreferrer">AsphaltCalculatorUSA.com</a>
                </p>
            </div>
    </div>
  );
};

const InputGroup = ({ label, value, unit, onChange, onAdjust, step = 1, noLabel = false }: { label: string, value: number, unit: string, step?: number, noLabel?: boolean, onChange: (val: number) => void, onAdjust: (val: number) => void }) => (
  <div>
    {!noLabel && <label className="block text-xs font-bold text-[#885C09] uppercase mb-2">{label}</label>}
    <div className="flex items-center gap-2 h-[48px]">
      <button onClick={() => onAdjust(-step)} className="hidden md:flex w-10 h-full items-center justify-center rounded-xl bg-[#f8f5f1] text-[#885C09] hover:bg-[#ffe0c1] transition-colors flex-shrink-0"><Minus className="w-4 h-4" /></button>
      <div className="relative flex-1 h-full group">
        <input type="number" inputMode="decimal" value={value || ''} onChange={(e) => onChange(parseFloat(e.target.value) || 0)} className="w-full h-full pl-4 pr-12 bg-[#ffe0c1]/10 border border-[#885C09]/20 rounded-xl font-bold text-[#291901] focus:outline-none focus:ring-2 focus:ring-[#885C09]/50 transition-all text-lg" placeholder="0" />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#885C09]/40 uppercase pointer-events-none">{unit}</span>
      </div>
      <button onClick={() => onAdjust(step)} className="hidden md:flex w-10 h-full items-center justify-center rounded-xl bg-[#f8f5f1] text-[#885C09] hover:bg-[#ffe0c1] transition-colors flex-shrink-0"><Plus className="w-4 h-4" /></button>
    </div>
  </div>
);

export default DrivewayResurfacingCalculator;