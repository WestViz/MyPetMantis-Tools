import React, { useMemo, useState } from 'react';
import { Droplets, RotateCcw, Truck, ArrowRightLeft, DollarSign, Plus, Minus, Info } from 'lucide-react';

type Inputs = {
  totalTons: number;
  densityLbFt3: number;
  thicknessIn: number;
  laneWidthFt: number; // Added for "Linear Distance" helpfulness
  pricePerTon: number; // Added for Cost helpfulness
  emulsionRatePct: number;
  emulsionDensityLbGal: number;
};

const AsphaltYieldDensityEmulsionCalculator: React.FC = () => {
  const [inputs, setInputs] = useState<Inputs>({
    totalTons: 20,
    densityLbFt3: 145, // Standard default
    thicknessIn: 2,
    laneWidthFt: 12,   // Standard lane
    pricePerTon: 0,
    emulsionRatePct: 6.0,
    emulsionDensityLbGal: 8.7
  });

  const result = useMemo(() => {
    // 1. Core Yield Math
    const totalLbs = inputs.totalTons * 2000;
    const volumeFt3 = inputs.densityLbFt3 > 0 ? totalLbs / inputs.densityLbFt3 : 0;
    const thicknessFt = inputs.thicknessIn / 12;
    
    // Coverage Area
    const coverageSqFt = thicknessFt > 0 ? volumeFt3 / thicknessFt : 0;
    const coverageSqYd = coverageSqFt / 9;
    
    // Yield per Ton
    const yieldSqFtPerTon = inputs.totalTons > 0 ? coverageSqFt / inputs.totalTons : 0;
    const yieldSqYdPerTon = yieldSqFtPerTon / 9;

    // 2. Linear Distance (New Helpful Feature)
    // If we have coverage area and a width, how long is the road?
    const linearFeet = inputs.laneWidthFt > 0 ? coverageSqFt / inputs.laneWidthFt : 0;

    // 3. Emulsion Math
    const emulsionLbs = totalLbs * (inputs.emulsionRatePct / 100);
    const emulsionGallons = inputs.emulsionDensityLbGal > 0 ? emulsionLbs / inputs.emulsionDensityLbGal : 0;

    // 4. Cost Math
    const totalCost = inputs.totalTons * inputs.pricePerTon;

    return {
      coverageSqFt: Math.round(coverageSqFt * 100) / 100,
      coverageSqYd: Math.round(coverageSqYd * 100) / 100,
      yieldSqFtPerTon: Math.round(yieldSqFtPerTon * 100) / 100,
      yieldSqYdPerTon: Math.round(yieldSqYdPerTon * 100) / 100,
      linearFeet: Math.round(linearFeet * 10) / 10,
      emulsionGallons: Math.round(emulsionGallons * 100) / 100,
      totalCost: Math.round(totalCost * 100) / 100
    };
  }, [inputs]);

  const update = (field: keyof Inputs, value: number) => {
    // Prevent negatives
    if (value < 0) return;
    setInputs((p) => ({ ...p, [field]: value }));
  };

  const adjustValue = (field: keyof Inputs, amount: number) => {
    const current = inputs[field];
    // Fix floating point errors in JS math
    const newVal = parseFloat((current + amount).toFixed(2));
    update(field, Math.max(0, newVal));
  };

  const handleReset = () => {
    setInputs({
      totalTons: 20,
      densityLbFt3: 145,
      thicknessIn: 2,
      laneWidthFt: 12,
      pricePerTon: 0,
      emulsionRatePct: 6.0,
      emulsionDensityLbGal: 8.7
    });
  };

  return (
    <div className="glass-panel text-slate-900 rounded-[2rem] shadow-xl bg-white/95 backdrop-blur-md border border-[#885C09]/20 p-4 md:p-8 relative overflow-hidden max-w-6xl mx-auto">
      <div className="absolute top-0 right-0 -mt-16 -mr-16 w-56 h-56 bg-[#9A690F]/20 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div className="text-center md:text-left">
            <div className="inline-flex items-center gap-2 mb-2 justify-center md:justify-start">
              <span className="p-2 bg-[#9A690F]/10 text-[#885C09] rounded-lg"><Droplets className="w-6 h-6" /></span>
              <span className="text-xs font-bold tracking-widest text-[#885C09] uppercase">Mix & Yield</span>
            </div>
            <h1 className="text-3xl font-black text-[#291901] tracking-tight">Yield & Emulsion Calculator</h1>
            <p className="text-xs text-[#885C09] mt-1">Calculate coverage, linear distance, and liquid requirements</p>
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
            
            {/* Section 1: Mix Parameters */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#885C09]/10">
              <div className="flex items-center gap-2 mb-4 border-b border-[#885C09]/10 pb-2">
                <Truck className="w-4 h-4 text-[#885C09]" />
                <h3 className="text-xs font-black text-[#885C09] uppercase tracking-wider">Asphalt Mix Parameters</h3>
              </div>

              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <InputGroup 
                    label="Total Tons Available"
                    value={inputs.totalTons}
                    unit="Tons"
                    step={1}
                    onChange={(v) => update('totalTons', v)}
                    onAdjust={(v) => adjustValue('totalTons', v)}
                  />
                  
                   {/* Density with Quick Presets */}
                  <div>
                     <div className="flex justify-between items-end mb-2">
                        <label className="text-xs font-bold text-[#885C09] uppercase">Mix Density</label>
                        <div className="flex gap-1">
                          <button onClick={() => update('densityLbFt3', 145)} className="text-[10px] bg-[#fcebd9] text-[#885C09] px-2 py-0.5 rounded font-bold hover:bg-[#885C09] hover:text-white transition-colors">Std (145)</button>
                          <button onClick={() => update('densityLbFt3', 110)} className="text-[10px] bg-[#fcebd9] text-[#885C09] px-2 py-0.5 rounded font-bold hover:bg-[#885C09] hover:text-white transition-colors">Light (110)</button>
                        </div>
                     </div>
                     <InputGroup 
                        label=""
                        value={inputs.densityLbFt3}
                        unit="lb/ft³"
                        noLabel
                        onChange={(v) => update('densityLbFt3', v)}
                        onAdjust={(v) => adjustValue('densityLbFt3', v)}
                      />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <InputGroup 
                    label="Mat Thickness"
                    value={inputs.thicknessIn}
                    unit="Inches"
                    step={0.5}
                    onChange={(v) => update('thicknessIn', v)}
                    onAdjust={(v) => adjustValue('thicknessIn', v)}
                  />
                  <InputGroup 
                    label="Paving Width"
                    value={inputs.laneWidthFt}
                    unit="Feet"
                    step={1}
                    onChange={(v) => update('laneWidthFt', v)}
                    onAdjust={(v) => adjustValue('laneWidthFt', v)}
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Emulsion & Cost */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#885C09]/10">
              <div className="flex items-center gap-2 mb-4 border-b border-[#885C09]/10 pb-2">
                <Droplets className="w-4 h-4 text-[#885C09]" />
                <h3 className="text-xs font-black text-[#885C09] uppercase tracking-wider">Liquid & Cost</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <InputGroup 
                  label="Emulsion Rate"
                  value={inputs.emulsionRatePct}
                  unit="%"
                  step={0.1}
                  onChange={(v) => update('emulsionRatePct', v)}
                  onAdjust={(v) => adjustValue('emulsionRatePct', v)}
                />
                 <InputGroup 
                  label="Emul. Density (lb/gal)"
                  value={inputs.emulsionDensityLbGal}
                  unit="lb/gal"
                  step={0.1}
                  onChange={(v) => update('emulsionDensityLbGal', v)}
                  onAdjust={(v) => adjustValue('emulsionDensityLbGal', v)}
                />
                 <div>
                    <label className="block text-xs font-bold text-[#885C09] uppercase mb-2">Price Per Ton</label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#885C09]/50 font-bold">$</div>
                      <input 
                        type="number" 
                        inputMode="decimal"
                        value={inputs.pricePerTon || ''} 
                        onChange={(e) => update('pricePerTon', parseFloat(e.target.value) || 0)} 
                        className="w-full pl-7 pr-3 py-3 bg-[#ffe0c1]/10 border border-[#885C09]/20 rounded-xl font-bold text-[#291901] focus:outline-none focus:ring-2 focus:ring-[#885C09]/50 text-lg" 
                        placeholder="0.00"
                      />
                    </div>
                 </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: RESULTS */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Primary Result: Coverage */}
            <div className="bg-gradient-to-br from-[#291901] to-[#885C09] text-white p-6 rounded-3xl shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-white/10 transition-all duration-700"></div>
              <div className="relative z-10">
                <p className="text-[#ffe0c1]/70 font-bold uppercase tracking-widest text-xs mb-1">Max Coverage Area</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black">{result.coverageSqFt.toLocaleString()}</span>
                  <span className="text-lg text-[#ffe0c1]/50 font-bold">ft²</span>
                </div>
                
                <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-2 gap-4">
                   <div>
                      <span className="block text-[10px] text-[#ffe0c1]/60 uppercase tracking-wider">Yield / Ton</span>
                      <span className="text-xl font-bold">{result.yieldSqYdPerTon} <span className="text-xs font-normal opacity-70">SY</span></span>
                   </div>
                   <div>
                      <span className="block text-[10px] text-[#ffe0c1]/60 uppercase tracking-wider">Total Area</span>
                      <span className="text-xl font-bold">{result.coverageSqYd.toLocaleString()} <span className="text-xs font-normal opacity-70">SY</span></span>
                   </div>
                </div>
              </div>
            </div>

            {/* Linear Distance Result (The "Helpful" Feature) */}
            <div className="bg-[#291901]/5 p-5 rounded-2xl border border-[#291901]/10 flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <ArrowRightLeft className="w-3 h-3 text-[#885C09]" />
                  <span className="text-xs font-bold text-[#885C09] uppercase tracking-wide">Linear Distance</span>
                </div>
                <p className="text-[10px] text-slate-500 max-w-[150px]">
                  How far you can pave at <strong>{inputs.laneWidthFt}ft</strong> wide with <strong>{inputs.totalTons} tons</strong>.
                </p>
              </div>
              <div className="text-right">
                <span className="block text-3xl font-black text-[#291901]">{result.linearFeet.toLocaleString()}</span>
                <span className="text-xs font-bold text-[#885C09]">Linear Feet</span>
              </div>
            </div>

            {/* Bottom Row: Liquid & Cost */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#885C09]/10">
                 <div className="text-[10px] font-bold text-[#885C09] uppercase tracking-wide mb-2 flex items-center gap-1">
                    <Droplets className="w-3 h-3" /> Emulsion
                 </div>
                 <div className="text-2xl font-black text-slate-800">{result.emulsionGallons}</div>
                 <div className="text-xs text-slate-500">Gallons Total</div>
              </div>
              
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#885C09]/10">
                 <div className="text-[10px] font-bold text-[#047857] uppercase tracking-wide mb-2 flex items-center gap-1">
                    <DollarSign className="w-3 h-3" /> Est. Cost
                 </div>
                 <div className="text-2xl font-black text-[#047857]">
                    {inputs.pricePerTon > 0 ? `$${result.totalCost.toLocaleString()}` : '--'}
                 </div>
                 <div className="text-xs text-slate-500">
                    {inputs.pricePerTon > 0 ? 'Total Material' : 'Enter Price/Ton'}
                 </div>
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

// Reusable Input Component with Mobile Steppers
const InputGroup = ({ 
  label, 
  value, 
  unit, 
  onChange, 
  onAdjust,
  step = 1,
  noLabel = false
}: { 
  label: string; 
  value: number; 
  unit: string; 
  step?: number;
  noLabel?: boolean;
  onChange: (val: number) => void;
  onAdjust: (val: number) => void;
}) => (
  <div>
    {!noLabel && <label className="block text-xs font-bold text-[#885C09] uppercase mb-2">{label}</label>}
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
          className="w-full h-full px-4 bg-[#ffe0c1]/10 border border-[#885C09]/20 rounded-xl font-bold text-[#291901] focus:outline-none focus:ring-2 focus:ring-[#885C09]/50 transition-all text-lg" 
          placeholder="0"
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#885C09]/40 uppercase pointer-events-none">
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

export default AsphaltYieldDensityEmulsionCalculator;