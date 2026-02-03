import React, { useMemo, useState } from 'react';
import { Mountain, RotateCcw, Truck, Ruler, Calculator, Info, Plus, Minus } from 'lucide-react';

type CalculationMode = 'dimensions' | 'area';

type Inputs = {
  length: number;
  width: number;
  areaSqFt: number; // For manual area input mode
  depthIn: number;
  densityLbFt3: number;
  pricePerTon: number;
  compactionFactorPct: number;
  truckCapacityTons: number; // New feature for logistics
};

const CrushedAsphaltCalculator: React.FC = () => {
  const [mode, setMode] = useState<CalculationMode>('dimensions');
  const [inputs, setInputs] = useState<Inputs>({
    length: 50,
    width: 30,
    areaSqFt: 1500,
    depthIn: 4,
    densityLbFt3: 120, // RAP is usually lighter than hot mix (145)
    pricePerTon: 35,
    compactionFactorPct: 10, // RAP compacts significantly
    truckCapacityTons: 15
  });

  const result = useMemo(() => {
    // 1. Determine Area
    const finalArea = mode === 'dimensions' 
      ? inputs.length * inputs.width 
      : inputs.areaSqFt;

    // 2. Volume & Weight
    const depthFt = inputs.depthIn / 12;
    const volumeFt3 = finalArea * depthFt;
    const weightLbs = volumeFt3 * inputs.densityLbFt3;
    
    // 3. Compaction/Waste Buffer
    // When you roll crushed asphalt, it packs down. You need extra material to maintain grade.
    const wasteLbs = weightLbs * (inputs.compactionFactorPct / 100);
    const totalLbs = weightLbs + wasteLbs;
    
    // 4. Totals
    const tons = totalLbs / 2000;
    const cost = tons * inputs.pricePerTon;
    
    // 5. Logistics
    const trucksNeeded = inputs.truckCapacityTons > 0 ? tons / inputs.truckCapacityTons : 0;

    return {
      area: Math.round(finalArea * 100) / 100,
      tons: Math.round(tons * 100) / 100,
      cost: Math.round(cost * 100) / 100,
      trucks: Math.ceil(trucksNeeded * 10) / 10, // Round up slightly for safety
      baseTons: Math.round((weightLbs / 2000) * 100) / 100 // Tonnage before compaction factor
    };
  }, [inputs, mode]);

  const update = (field: keyof Inputs, value: number) => {
    if (value < 0) return;
    setInputs((p) => ({ ...p, [field]: value }));
  };

  const adjustValue = (field: keyof Inputs, amount: number) => {
    const current = inputs[field];
    const newVal = parseFloat((current + amount).toFixed(2));
    update(field, Math.max(0, newVal));
  };

  const handleReset = () => {
    setInputs({
      length: 50,
      width: 30,
      areaSqFt: 1500,
      depthIn: 4,
      densityLbFt3: 120,
      pricePerTon: 35,
      compactionFactorPct: 10,
      truckCapacityTons: 15
    });
  };

  return (
    <div className="glass-panel text-slate-900 rounded-[2rem] shadow-xl bg-white/95 backdrop-blur-md border border-[#885C09]/20 p-4 md:p-8 relative overflow-hidden max-w-6xl mx-auto">
      {/* Decorative Background */}
      <div className="absolute top-0 right-0 -mt-16 -mr-16 w-56 h-56 bg-[#9A690F]/20 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div className="text-center md:text-left">
            <div className="inline-flex items-center gap-2 mb-2 justify-center md:justify-start">
              <span className="p-2 bg-[#9A690F]/10 text-[#885C09] rounded-lg"><Mountain className="w-6 h-6" /></span>
              <span className="text-xs font-bold tracking-widest text-[#885C09] uppercase">Millings & RAP</span>
            </div>
            <h1 className="text-3xl font-black text-[#291901] tracking-tight">Crushed Asphalt Calculator</h1>
            <p className="text-xs text-[#885C09] mt-1">Estimate material needs including compaction factor</p>
          </div>
          
          <button 
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#fcebd9] text-[#885C09] hover:bg-[#885C09] hover:text-white transition-all text-xs font-bold uppercase tracking-wider shadow-sm"
          >
            <RotateCcw className="w-4 h-4" /> Reset
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: INPUTS */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Project Dimensions Card */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#885C09]/10">
              <div className="flex justify-between items-center mb-4 border-b border-[#885C09]/10 pb-2">
                <div className="flex items-center gap-2">
                  <Ruler className="w-4 h-4 text-[#885C09]" />
                  <h3 className="text-xs font-black text-[#885C09] uppercase tracking-wider">Project Size</h3>
                </div>
                
                {/* Input Mode Toggles */}
                <div className="flex bg-[#f8f5f1] rounded-lg p-1">
                  <button 
                    onClick={() => setMode('dimensions')}
                    className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wide rounded-md transition-all ${mode === 'dimensions' ? 'bg-white text-[#885C09] shadow-sm' : 'text-slate-400'}`}
                  >
                    L x W
                  </button>
                  <button 
                    onClick={() => setMode('area')}
                    className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wide rounded-md transition-all ${mode === 'area' ? 'bg-white text-[#885C09] shadow-sm' : 'text-slate-400'}`}
                  >
                    Total Area
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {mode === 'dimensions' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <InputGroup 
                      label="Length"
                      value={inputs.length}
                      unit="ft"
                      onChange={(v) => update('length', v)}
                      onAdjust={(v) => adjustValue('length', v)}
                    />
                    <InputGroup 
                      label="Width"
                      value={inputs.width}
                      unit="ft"
                      onChange={(v) => update('width', v)}
                      onAdjust={(v) => adjustValue('width', v)}
                    />
                  </div>
                ) : (
                   <InputGroup 
                      label="Total Area"
                      value={inputs.areaSqFt}
                      unit="sq ft"
                      step={10}
                      onChange={(v) => update('areaSqFt', v)}
                      onAdjust={(v) => adjustValue('areaSqFt', v)}
                    />
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <InputGroup 
                      label="Target Depth"
                      value={inputs.depthIn}
                      unit="in"
                      step={0.5}
                      onChange={(v) => update('depthIn', v)}
                      onAdjust={(v) => adjustValue('depthIn', v)}
                    />
                   {/* Info helper for depth */}
                   <div className="hidden md:flex items-center text-xs text-slate-500 bg-[#f8f5f1] rounded-xl px-4 italic">
                     <Info className="w-4 h-4 mr-2 text-[#885C09]" />
                     Recommended depth for driveways is 4-6 inches.
                   </div>
                </div>
              </div>
            </div>

            {/* Material & Cost Card */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#885C09]/10">
               <div className="flex items-center gap-2 mb-4 border-b border-[#885C09]/10 pb-2">
                <Calculator className="w-4 h-4 text-[#885C09]" />
                <h3 className="text-xs font-black text-[#885C09] uppercase tracking-wider">Material & Pricing</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputGroup 
                  label="Density"
                  value={inputs.densityLbFt3}
                  unit="lb/ft³"
                  onChange={(v) => update('densityLbFt3', v)}
                  onAdjust={(v) => adjustValue('densityLbFt3', v)}
                />
                 <InputGroup 
                  label="Compaction %"
                  value={inputs.compactionFactorPct}
                  unit="%"
                  onChange={(v) => update('compactionFactorPct', v)}
                  onAdjust={(v) => adjustValue('compactionFactorPct', v)}
                />
                <div>
                    <label className="block text-xs font-bold text-[#885C09] uppercase mb-2">Cost</label>
                    <div className="relative h-[52px]">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#885C09]/50 font-bold">$</div>
                      <input 
                        type="number" 
                        inputMode="decimal"
                        value={inputs.pricePerTon || ''} 
                        onChange={(e) => update('pricePerTon', parseFloat(e.target.value) || 0)} 
                        className="w-full h-full pl-7 pr-16 bg-[#ffe0c1]/10 border border-[#885C09]/20 rounded-xl font-bold text-[#291901] focus:outline-none focus:ring-2 focus:ring-[#885C09]/50 text-lg" 
                        placeholder="0.00"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#885C09]/40 uppercase pointer-events-none">
                        / Ton
                      </span>
                    </div>
                 </div>
                 <InputGroup 
                  label="Truck Capacity"
                  value={inputs.truckCapacityTons}
                  unit="tons"
                  onChange={(v) => update('truckCapacityTons', v)}
                  onAdjust={(v) => adjustValue('truckCapacityTons', v)}
                />
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: RESULTS */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Primary Result: Cost */}
            <div className="bg-gradient-to-br from-[#291901] to-[#885C09] text-white p-6 rounded-3xl shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-white/10 transition-all duration-700"></div>
              <div className="relative z-10">
                <p className="text-[#ffe0c1]/70 font-bold uppercase tracking-widest text-xs mb-1">Estimated Cost</p>
                <div className="text-5xl font-black mb-1">${result.cost.toLocaleString()}</div>
                <p className="text-xs text-[#ffe0c1]/60">Based on {result.tons} tons @ ${inputs.pricePerTon}/ton</p>

                <div className="mt-6 pt-6 border-t border-white/10">
                   <div className="flex justify-between items-end mb-1">
                      <span className="text-[#ffe0c1]/80 uppercase tracking-wider text-xs font-bold">Required Material</span>
                      <span className="text-3xl font-bold">{result.tons} <span className="text-base font-normal opacity-70">Tons</span></span>
                   </div>
                   <div className="flex justify-between text-[10px] text-[#ffe0c1]/40">
                      <span>Base: {result.baseTons}t</span>
                      <span>+ {inputs.compactionFactorPct}% Compaction</span>
                   </div>
                </div>
              </div>
            </div>

            {/* Logistics Result */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#885C09]/10">
               <div className="flex items-center gap-2 mb-3">
                 <Truck className="w-5 h-5 text-[#885C09]" />
                 <span className="text-xs font-bold text-[#885C09] uppercase tracking-wide">Logistics</span>
               </div>
               <div className="flex items-center justify-between">
                  <div className="text-xs text-slate-500 max-w-[150px]">
                    Approximate truckloads needed based on a <strong className="text-slate-700">{inputs.truckCapacityTons} ton</strong> capacity.
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-black text-[#291901]">{result.trucks}</div>
                    <div className="text-[10px] font-bold text-[#885C09] uppercase">Loads</div>
                  </div>
               </div>
            </div>

            {/* Area Result Summary */}
            <div className="bg-[#291901]/5 p-4 rounded-2xl border border-[#291901]/10 flex justify-between items-center">
               <span className="text-xs font-bold text-[#885C09] uppercase tracking-wide">Total Coverage Area</span>
               <span className="text-xl font-bold text-[#291901]">{result.area.toLocaleString()} <span className="text-xs text-slate-500 font-normal">sq ft</span></span>
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

// Reusable Input Component with Mobile Steppers
const InputGroup = ({ 
  label, 
  value, 
  unit, 
  onChange, 
  onAdjust,
  step = 1
}: { 
  label: string; 
  value: number; 
  unit: string; 
  step?: number;
  onChange: (val: number) => void;
  onAdjust: (val: number) => void;
}) => (
  <div>
    <label className="block text-xs font-bold text-[#885C09] uppercase mb-2">{label}</label>
    <div className="flex items-center gap-2 h-[52px]">
      <button 
        onClick={() => onAdjust(-step)}
        className="hidden md:flex w-10 h-full items-center justify-center rounded-xl bg-[#f8f5f1] text-[#885C09] hover:bg-[#ffe0c1] transition-colors flex-shrink-0"
      >
        <Minus className="w-4 h-4" />
      </button>

      <div className="relative flex-1 h-full group">
        <input 
          type="number" 
          inputMode="decimal"
          value={value || ''} 
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)} 
          className="w-full h-full pl-4 pr-16 bg-[#ffe0c1]/10 border border-[#885C09]/20 rounded-xl font-bold text-[#291901] focus:outline-none focus:ring-2 focus:ring-[#885C09]/50 transition-all text-lg" 
          placeholder="0"
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#885C09]/40 uppercase pointer-events-none text-right min-w-[30px]">
          {unit}
        </span>
      </div>

       <button 
        onClick={() => onAdjust(step)}
        className="hidden md:flex w-10 h-full items-center justify-center rounded-xl bg-[#f8f5f1] text-[#885C09] hover:bg-[#ffe0c1] transition-colors flex-shrink-0"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  </div>
);

export default CrushedAsphaltCalculator;