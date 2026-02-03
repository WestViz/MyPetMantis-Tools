import React, { useMemo, useState } from 'react';
import { ThermometerSun, Snowflake, ShoppingBag, Scale, RotateCcw, Info, Plus, Minus, Ruler } from 'lucide-react';

type CalculationMode = 'dimensions' | 'area';

type Inputs = {
  length: number;
  width: number;
  areaSqFt: number;
  thicknessIn: number;
  
  // Hot Mix Params
  hotPricePerTon: number;
  hotDensityLbFt3: number;
  
  // Cold Mix Params
  coldPricePerBag: number; // Changed to per bag for better UX
  coldBagWeight: number; // usually 50lbs
  coldDensityLbFt3: number;
};

const HotColdMixCalculator: React.FC = () => {
  const [mode, setMode] = useState<CalculationMode>('dimensions');
  const [inputs, setInputs] = useState<Inputs>({
    length: 10,
    width: 10,
    areaSqFt: 100,
    thicknessIn: 2,
    
    hotPricePerTon: 135,
    hotDensityLbFt3: 145,
    
    coldPricePerBag: 18, // Avg price for 50lb bag
    coldBagWeight: 50,
    coldDensityLbFt3: 130 // Cold mix is looser
  });

  const result = useMemo(() => {
    // 1. Geometry
    const finalArea = mode === 'dimensions' ? inputs.length * inputs.width : inputs.areaSqFt;
    const thicknessFt = inputs.thicknessIn / 12;
    const volumeFt3 = finalArea * thicknessFt;

    // 2. Hot Mix Calculations
    const hotLbs = volumeFt3 * inputs.hotDensityLbFt3;
    const hotTons = hotLbs / 2000;
    // Plant minimum logic: Plants rarely sell less than 1 ton, but we calculate exact first
    const hotCost = hotTons * inputs.hotPricePerTon;

    // 3. Cold Mix Calculations
    const coldLbs = volumeFt3 * inputs.coldDensityLbFt3;
    const coldBags = Math.ceil(coldLbs / inputs.coldBagWeight); // Must buy whole bags
    const coldCost = coldBags * inputs.coldPricePerBag;

    // 4. Recommendation Logic
    let recommendation = '';
    if (finalArea < 15) recommendation = 'COLD PATCH (Too small for hot mix)';
    else if (finalArea > 200) recommendation = 'HOT MIX (Bags will be too expensive)';
    else recommendation = 'COMPARE (Check prices below)';

    return {
      area: Math.round(finalArea * 100) / 100,
      hotTons: Math.round(hotTons * 100) / 100,
      hotCost: Math.round(hotCost * 100) / 100,
      coldBags: coldBags,
      coldTotalWeight: Math.round(coldLbs),
      coldCost: Math.round(coldCost * 100) / 100,
      recommendation
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
      length: 10, width: 10, areaSqFt: 100, thicknessIn: 2,
      hotPricePerTon: 135, hotDensityLbFt3: 145,
      coldPricePerBag: 18, coldBagWeight: 50, coldDensityLbFt3: 130
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
              <span className="p-2 bg-[#9A690F]/10 text-[#885C09] rounded-lg"><Scale className="w-6 h-6" /></span>
              <span className="text-xs font-bold tracking-widest text-[#885C09] uppercase">Product Comparison</span>
            </div>
            <h1 className="text-3xl font-black text-[#291901] tracking-tight">Hot vs. Cold Mix Calculator</h1>
            <p className="text-xs text-[#885C09] mt-1">Compare Bulk Hot Asphalt vs. Bagged Cold Patch</p>
          </div>
          <button onClick={handleReset} className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#fcebd9] text-[#885C09] hover:bg-[#885C09] hover:text-white transition-all text-xs font-bold uppercase tracking-wider">
            <RotateCcw className="w-4 h-4" /> Reset
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT: INPUTS */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* 1. Dimensions */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#885C09]/10">
              <div className="flex justify-between items-center mb-4 border-b border-[#885C09]/10 pb-2">
                <div className="flex items-center gap-2">
                  <Ruler className="w-4 h-4 text-[#885C09]" />
                  <h3 className="text-xs font-black text-[#885C09] uppercase tracking-wider">Patch Size</h3>
                </div>
                 <div className="flex bg-[#f8f5f1] rounded-lg p-1">
                  <button onClick={() => setMode('dimensions')} className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wide rounded-md transition-all ${mode === 'dimensions' ? 'bg-white text-[#885C09] shadow-sm' : 'text-slate-400'}`}>L x W</button>
                  <button onClick={() => setMode('area')} className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wide rounded-md transition-all ${mode === 'area' ? 'bg-white text-[#885C09] shadow-sm' : 'text-slate-400'}`}>Total Area</button>
                </div>
              </div>

              <div className="space-y-4">
                 {mode === 'dimensions' ? (
                  <div className="grid grid-cols-2 gap-4">
                    <InputGroup label="Length" value={inputs.length} unit="ft" onChange={(v) => update('length', v)} onAdjust={(v) => adjustValue('length', v)} />
                    <InputGroup label="Width" value={inputs.width} unit="ft" onChange={(v) => update('width', v)} onAdjust={(v) => adjustValue('width', v)} />
                  </div>
                ) : (
                   <InputGroup label="Total Area" value={inputs.areaSqFt} unit="sq ft" step={10} onChange={(v) => update('areaSqFt', v)} onAdjust={(v) => adjustValue('areaSqFt', v)} />
                )}
                 <InputGroup label="Thickness" value={inputs.thicknessIn} unit="in" step={0.5} onChange={(v) => update('thicknessIn', v)} onAdjust={(v) => adjustValue('thicknessIn', v)} />
              </div>
            </div>

            {/* 2. Price Settings */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#885C09]/10">
               <h3 className="text-xs font-black text-[#885C09] uppercase tracking-wider mb-4">Price Settings</h3>
               
               <div className="space-y-5">
                 {/* Hot Settings */}
                 <div>
                    <div className="flex items-center gap-2 mb-2 text-[#d97706]">
                       <ThermometerSun className="w-4 h-4" />
                       <span className="text-[10px] font-bold uppercase">Hot Mix (Bulk)</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <InputGroup label="Price/Ton" value={inputs.hotPricePerTon} unit="$" onChange={(v) => update('hotPricePerTon', v)} onAdjust={(v) => adjustValue('hotPricePerTon', v)} />
                       <InputGroup label="Density" value={inputs.hotDensityLbFt3} unit="lb/ft³" onChange={(v) => update('hotDensityLbFt3', v)} onAdjust={(v) => adjustValue('hotDensityLbFt3', v)} />
                    </div>
                 </div>

                 <div className="h-px bg-[#885C09]/10"></div>

                 {/* Cold Settings */}
                 <div>
                    <div className="flex items-center gap-2 mb-2 text-[#3b82f6]">
                       <Snowflake className="w-4 h-4" />
                       <span className="text-[10px] font-bold uppercase">Cold Patch (Bagged)</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <InputGroup label="Price/Bag" value={inputs.coldPricePerBag} unit="$" step={0.5} onChange={(v) => update('coldPricePerBag', v)} onAdjust={(v) => adjustValue('coldPricePerBag', v)} />
                       <InputGroup label="Bag Wgt" value={inputs.coldBagWeight} unit="lbs" step={5} onChange={(v) => update('coldBagWeight', v)} onAdjust={(v) => adjustValue('coldBagWeight', v)} />
                    </div>
                 </div>
               </div>
            </div>
          </div>

          {/* RIGHT: RESULTS COMPARISON */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Recommendation Banner */}
            <div className="bg-slate-900 text-white p-4 rounded-2xl flex items-center justify-between">
               <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wide font-bold">Recommendation</span>
                  <div className="text-lg font-bold">{result.recommendation}</div>
               </div>
               <Info className="w-5 h-5 text-slate-500" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               
               {/* HOT MIX CARD */}
               <div className="relative overflow-hidden rounded-3xl border border-[#d97706]/20 bg-gradient-to-br from-[#fff7ed] to-[#fff] p-6 shadow-sm group hover:shadow-md transition-all">
                  <div className="absolute top-0 right-0 -mt-8 -mr-8 w-24 h-24 bg-[#d97706]/10 rounded-full blur-xl group-hover:bg-[#d97706]/20 transition-all"></div>
                  
                  <div className="relative z-10">
                     <div className="flex items-center gap-2 mb-4">
                        <span className="p-2 bg-[#d97706]/10 text-[#d97706] rounded-lg"><ThermometerSun className="w-5 h-5" /></span>
                        <div>
                           <h3 className="text-sm font-black text-slate-800 uppercase">Hot Mix</h3>
                           <p className="text-[10px] text-[#d97706] font-bold">Best for Permanent / Summer</p>
                        </div>
                     </div>

                     <div className="mb-4">
                        <div className="text-4xl font-black text-slate-900">${result.hotCost.toLocaleString()}</div>
                        <div className="text-xs text-slate-500">Estimated Material Cost</div>
                     </div>

                     <div className="space-y-2 pt-4 border-t border-[#d97706]/10">
                        <div className="flex justify-between text-sm">
                           <span className="text-slate-600">Req. Tons</span>
                           <span className="font-bold text-slate-900">{result.hotTons} tons</span>
                        </div>
                        {result.hotTons < 1 && (
                           <div className="flex items-start gap-1 text-[10px] text-[#d97706] bg-[#d97706]/5 p-2 rounded-lg">
                              <Info className="w-3 h-3 flex-shrink-0 mt-0.5" />
                              <span>Warning: Most plants have a 1-ton minimum charge ($100-$150).</span>
                           </div>
                        )}
                     </div>
                  </div>
               </div>

               {/* COLD MIX CARD */}
               <div className="relative overflow-hidden rounded-3xl border border-[#3b82f6]/20 bg-gradient-to-br from-[#eff6ff] to-[#fff] p-6 shadow-sm group hover:shadow-md transition-all">
                  <div className="absolute top-0 right-0 -mt-8 -mr-8 w-24 h-24 bg-[#3b82f6]/10 rounded-full blur-xl group-hover:bg-[#3b82f6]/20 transition-all"></div>
                  
                  <div className="relative z-10">
                     <div className="flex items-center gap-2 mb-4">
                        <span className="p-2 bg-[#3b82f6]/10 text-[#3b82f6] rounded-lg"><Snowflake className="w-5 h-5" /></span>
                        <div>
                           <h3 className="text-sm font-black text-slate-800 uppercase">Cold Patch</h3>
                           <p className="text-[10px] text-[#3b82f6] font-bold">Best for DIY / Winter</p>
                        </div>
                     </div>

                     <div className="mb-4">
                        <div className="text-4xl font-black text-slate-900">${result.coldCost.toLocaleString()}</div>
                        <div className="text-xs text-slate-500">Estimated Bag Cost</div>
                     </div>

                     <div className="space-y-2 pt-4 border-t border-[#3b82f6]/10">
                        <div className="flex justify-between text-sm">
                           <span className="text-slate-600 flex items-center gap-1"><ShoppingBag className="w-3 h-3" /> Bags Needed</span>
                           <span className="font-bold text-slate-900">{result.coldBags} bags</span>
                        </div>
                        <div className="flex justify-between text-xs text-slate-400">
                           <span>Total Weight</span>
                           <span>{result.coldTotalWeight} lbs</span>
                        </div>
                     </div>
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

const InputGroup = ({ label, value, unit, onChange, onAdjust, step = 1 }: { label: string, value: number, unit: string, step?: number, onChange: (val: number) => void, onAdjust: (val: number) => void }) => (
  <div>
    <label className="block text-xs font-bold text-[#885C09] uppercase mb-2">{label}</label>
    <div className="flex items-center gap-2 h-[42px]">
      <button onClick={() => onAdjust(-step)} className="hidden md:flex w-8 h-full items-center justify-center rounded-lg bg-[#f8f5f1] text-[#885C09] hover:bg-[#ffe0c1] transition-colors flex-shrink-0"><Minus className="w-3 h-3" /></button>
      <div className="relative flex-1 h-full group">
        <input type="number" inputMode="decimal" value={value || ''} onChange={(e) => onChange(parseFloat(e.target.value) || 0)} className="w-full h-full pl-3 pr-10 bg-[#ffe0c1]/10 border border-[#885C09]/20 rounded-lg font-bold text-[#291901] focus:outline-none focus:ring-2 focus:ring-[#885C09]/50 transition-all text-sm" placeholder="0" />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#885C09]/40 uppercase pointer-events-none">{unit}</span>
      </div>
      <button onClick={() => onAdjust(step)} className="hidden md:flex w-8 h-full items-center justify-center rounded-lg bg-[#f8f5f1] text-[#885C09] hover:bg-[#ffe0c1] transition-colors flex-shrink-0"><Plus className="w-3 h-3" /></button>
    </div>
  </div>
);

export default HotColdMixCalculator;