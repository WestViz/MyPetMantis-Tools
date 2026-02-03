import React, { useMemo, useState } from 'react';
import { Flame, RotateCcw, Truck, Ruler, Calculator, AlertTriangle, Plus, Minus, Layers } from 'lucide-react';

type CalculationMode = 'dimensions' | 'area';

type Inputs = {
  lengthFt: number;
  widthFt: number;
  areaSqFt: number;
  thicknessIn: number;
  pricePerTon: number;
  densityLbFt3: number;
  wastePct: number;
  truckCapacityTons: number;
};

const HotAsphaltCalculator: React.FC = () => {
  const [mode, setMode] = useState<CalculationMode>('dimensions');
  const [inputs, setInputs] = useState<Inputs>({
    lengthFt: 50,
    widthFt: 12,
    areaSqFt: 600,
    thicknessIn: 2.5,
    pricePerTon: 135,
    densityLbFt3: 145, // Default Standard Surface
    wastePct: 5,
    truckCapacityTons: 20
  });

  const result = useMemo(() => {
    // 1. Determine Area
    const finalArea = mode === 'dimensions' 
      ? inputs.lengthFt * inputs.widthFt 
      : inputs.areaSqFt;

    // 2. Volume & Base Weight
    const thicknessFt = inputs.thicknessIn / 12;
    const volumeFt3 = finalArea * thicknessFt;
    const baseLbs = volumeFt3 * inputs.densityLbFt3;
    
    // 3. Waste Calculation (Safety Margin)
    const wasteLbs = baseLbs * (inputs.wastePct / 100);
    const totalLbs = baseLbs + wasteLbs;
    
    // 4. Final Conversions
    const exactTons = totalLbs / 2000;
    // Plants usually round up to nearest half or whole ton, but for "Recommended" we'll ceil to nearest ton
    const recommendedTons = Math.ceil(exactTons); 
    
    const cost = exactTons * inputs.pricePerTon;
    
    // 5. Logistics
    const trucks = inputs.truckCapacityTons > 0 ? exactTons / inputs.truckCapacityTons : 0;

    return {
      area: Math.round(finalArea * 100) / 100,
      exactTons: Math.round(exactTons * 100) / 100,
      recommendedTons: recommendedTons,
      baseTons: Math.round((baseLbs / 2000) * 100) / 100,
      cost: Math.round(cost * 100) / 100,
      trucks: Math.ceil(trucks * 10) / 10,
      wasteTons: Math.round((wasteLbs / 2000) * 100) / 100
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
      lengthFt: 50,
      widthFt: 12,
      areaSqFt: 600,
      thicknessIn: 2.5,
      pricePerTon: 135,
      densityLbFt3: 145,
      wastePct: 5,
      truckCapacityTons: 20
    });
    setMode('dimensions');
  };

  return (
    <div className="glass-panel text-slate-900 rounded-[2rem] shadow-xl bg-white/95 backdrop-blur-md border border-[#885C09]/20 p-4 md:p-8 relative overflow-hidden max-w-6xl mx-auto">
      <div className="absolute top-0 right-0 -mt-16 -mr-16 w-56 h-56 bg-[#9A690F]/20 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div className="text-center md:text-left">
            <div className="inline-flex items-center gap-2 mb-2 justify-center md:justify-start">
              <span className="p-2 bg-[#9A690F]/10 text-[#885C09] rounded-lg"><Flame className="w-6 h-6" /></span>
              <span className="text-xs font-bold tracking-widest text-[#885C09] uppercase">Hot Mix Estimator</span>
            </div>
            <h1 className="text-3xl font-black text-[#291901] tracking-tight">Hot Asphalt Calculator</h1>
            <p className="text-xs text-[#885C09] mt-1">Estimate tonnage, waste factors & truckloads</p>
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
                      label="Length" value={inputs.lengthFt} unit="ft"
                      onChange={(v) => update('lengthFt', v)} onAdjust={(v) => adjustValue('lengthFt', v)}
                    />
                    <InputGroup 
                      label="Width" value={inputs.widthFt} unit="ft"
                      onChange={(v) => update('widthFt', v)} onAdjust={(v) => adjustValue('widthFt', v)}
                    />
                  </div>
                ) : (
                   <InputGroup 
                      label="Total Area" value={inputs.areaSqFt} unit="sq ft" step={10}
                      onChange={(v) => update('areaSqFt', v)} onAdjust={(v) => adjustValue('areaSqFt', v)}
                    />
                )}
                 <InputGroup 
                    label="Thickness" value={inputs.thicknessIn} unit="in" step={0.5}
                    onChange={(v) => update('thicknessIn', v)} onAdjust={(v) => adjustValue('thicknessIn', v)}
                  />
              </div>
            </div>

            {/* Mix, Pricing & Logistics Card */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#885C09]/10">
               <div className="flex items-center gap-2 mb-4 border-b border-[#885C09]/10 pb-2">
                <Calculator className="w-4 h-4 text-[#885C09]" />
                <h3 className="text-xs font-black text-[#885C09] uppercase tracking-wider">Mix & Pricing</h3>
              </div>

              <div className="space-y-4">
                {/* MIX TYPE SELECTOR - The "Useful" Feature */}
                <div>
                   <label className="flex items-center gap-2 text-xs font-bold text-[#885C09] uppercase mb-2">
                     <Layers className="w-3 h-3" /> Mix Type (Affects Density)
                   </label>
                   <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
                      {[
                        { label: 'Standard Surface', val: 145 },
                        { label: 'Binder / Base', val: 150 },
                        { label: 'Porous', val: 135 }
                      ].map((type) => (
                        <button
                          key={type.label}
                          onClick={() => update('densityLbFt3', type.val)}
                          className={`px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wide border whitespace-nowrap transition-all ${
                            inputs.densityLbFt3 === type.val 
                            ? 'bg-[#885C09] text-white border-[#885C09]' 
                            : 'bg-white text-slate-500 border-slate-200 hover:border-[#885C09]'
                          }`}
                        >
                          {type.label}
                        </button>
                      ))}
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputGroup 
                      label="Density" value={inputs.densityLbFt3} unit="lb/ft³"
                      onChange={(v) => update('densityLbFt3', v)} onAdjust={(v) => adjustValue('densityLbFt3', v)}
                    />
                    <InputGroup 
                      label="Waste / Safety" value={inputs.wastePct} unit="%"
                      onChange={(v) => update('wastePct', v)} onAdjust={(v) => adjustValue('wastePct', v)}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    label="Truck Cap." value={inputs.truckCapacityTons} unit="tons"
                    onChange={(v) => update('truckCapacityTons', v)} onAdjust={(v) => adjustValue('truckCapacityTons', v)}
                  />
                </div>
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
                <p className="text-xs text-[#ffe0c1]/80">Based on {result.exactTons} tons @ ${inputs.pricePerTon}/ton</p>

                <div className="mt-6 pt-6 border-t border-white/20">
                   <div className="flex justify-between items-end mb-2">
                      <span className="text-[#ffe0c1] uppercase tracking-wider text-xs font-bold">Total Tonnage</span>
                      <span className="text-3xl font-bold">{result.exactTons} <span className="text-base font-normal opacity-70">Tons</span></span>
                   </div>
                   {/* High Contrast / Larger Text Fix */}
                   <div className="flex flex-col gap-1 bg-black/20 p-3 rounded-lg border border-white/10">
                      <div className="flex justify-between text-sm font-medium text-white/90">
                         <span>Raw Need:</span>
                         <span>{result.baseTons} tons</span>
                      </div>
                      <div className="flex justify-between text-sm font-medium text-[#ffe0c1]">
                         <span>+ {inputs.wastePct}% Safety:</span>
                         <span>+{result.wasteTons} tons</span>
                      </div>
                   </div>
                </div>
              </div>
            </div>
            
            {/* Recommended Order Pill */}
            <div className="bg-[#291901] text-white p-4 rounded-2xl shadow-lg flex justify-between items-center">
                <div>
                   <div className="text-[10px] font-bold text-[#ffe0c1] uppercase tracking-wide">Recommended Order</div>
                   <div className="text-[10px] text-white/60">Rounded up to nearest ton</div>
                </div>
                <div className="text-2xl font-black">{result.recommendedTons} <span className="text-sm font-normal text-[#ffe0c1]">Tons</span></div>
            </div>

            {/* Logistics & Waste Summary */}
            <div className="grid grid-cols-2 gap-4">
               <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#885C09]/10">
                 <div className="flex items-center gap-1 mb-2">
                    <Truck className="w-3 h-3 text-[#885C09]" />
                    <span className="text-[10px] font-bold text-[#885C09] uppercase tracking-wide">Truckloads</span>
                 </div>
                 <div className="text-2xl font-black text-[#291901]">{result.trucks}</div>
                 <div className="text-[10px] text-slate-400">@{inputs.truckCapacityTons}t capacity</div>
               </div>

               <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#885C09]/10">
                 <div className="flex items-center gap-1 mb-2">
                    <Ruler className="w-3 h-3 text-[#885C09]" />
                    <span className="text-[10px] font-bold text-[#885C09] uppercase tracking-wide">Total Area</span>
                 </div>
                 <div className="text-2xl font-black text-[#291901]">{result.area.toLocaleString()}</div>
                 <div className="text-[10px] text-slate-400">Square Feet</div>
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

export default HotAsphaltCalculator;