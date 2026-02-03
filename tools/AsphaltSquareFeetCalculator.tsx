import React, { useMemo, useState } from 'react';
import { Square, RotateCcw, Plus, Minus, Calculator, Circle, LayoutDashboard, Car, Footprints } from 'lucide-react';

type UnitSystem = 'imperial' | 'metric';
type Shape = 'rectangle' | 'l-shape' | 'circle';

type Inputs = {
  length: number;
  width: number;
  length2: number; // For L-shape
  width2: number;  // For L-shape
  diameter: number; // For Circle
  depth: number;
  pricePerSqFt: number;
  unitSystem: UnitSystem;
  shape: Shape;
};

const AsphaltSquareFeetCalculator: React.FC = () => {
  const [inputs, setInputs] = useState<Inputs>({
    length: 40,
    width: 20,
    length2: 10,
    width2: 10,
    diameter: 20,
    depth: 3,
    pricePerSqFt: 0,
    unitSystem: 'imperial',
    shape: 'rectangle'
  });

  const result = useMemo(() => {
    // 1. Calculate Area based on Shape
    let sqFt = 0;
    
    if (inputs.unitSystem === 'metric') {
      // Convert metric inputs to feet for calculation base
      const l1 = inputs.length * 3.28084;
      const w1 = inputs.width * 3.28084;
      
      if (inputs.shape === 'rectangle') {
        sqFt = l1 * w1;
      } else if (inputs.shape === 'l-shape') {
        const l2 = inputs.length2 * 3.28084;
        const w2 = inputs.width2 * 3.28084;
        sqFt = (l1 * w1) + (l2 * w2);
      } else if (inputs.shape === 'circle') {
        const d = inputs.diameter * 3.28084;
        const r = d / 2;
        sqFt = Math.PI * r * r;
      }
    } else {
      // Imperial
      if (inputs.shape === 'rectangle') {
        sqFt = inputs.length * inputs.width;
      } else if (inputs.shape === 'l-shape') {
        sqFt = (inputs.length * inputs.width) + (inputs.length2 * inputs.width2);
      } else if (inputs.shape === 'circle') {
        const r = inputs.diameter / 2;
        sqFt = Math.PI * r * r;
      }
    }

    // 2. Secondary Units
    const sqYd = sqFt / 9;
    const sqM = sqFt * 0.092903;
    const acres = sqFt / 43560;

    // 3. Volume & Tonnage
    // Depth is always inches in UI for imperial, or cm for metric
    const depthFt = inputs.unitSystem === 'metric' 
      ? (inputs.depth / 100) * 3.28084 // cm to feet
      : inputs.depth / 12; // inches to feet

    const cubicFeet = sqFt * depthFt;
    const weightLbs = cubicFeet * 145; // Standard 145lb density
    const tons = weightLbs / 2000;

    // 4. Cost
    const totalCost = inputs.pricePerSqFt * sqFt;

    return {
      sqFt: Math.round(sqFt * 100) / 100,
      sqYd: Math.round(sqYd * 100) / 100,
      sqM: Math.round(sqM * 100) / 100,
      acres: acres < 0.01 ? '< 0.01' : Math.round(acres * 1000) / 1000,
      tons: Math.round(tons * 100) / 100,
      totalCost: Math.round(totalCost * 100) / 100
    };
  }, [inputs]);

  const update = (field: keyof Inputs, value: any) => {
    if (typeof value === 'number' && value < 0) return;
    setInputs((p) => ({ ...p, [field]: value }));
  };

  const adjustValue = (field: keyof Inputs, amount: number) => {
    const currentValue = inputs[field] as number;
    update(field, Math.max(0, parseFloat((currentValue + amount).toFixed(2))));
  };

  const handlePreset = (type: string) => {
    const base = { ...inputs, unitSystem: 'imperial' as UnitSystem, shape: 'rectangle' as Shape };
    switch(type) {
      case '1car': setInputs({ ...base, length: 20, width: 10 }); break;
      case '2car': setInputs({ ...base, length: 20, width: 20 }); break;
      case 'tennis': setInputs({ ...base, length: 78, width: 36 }); break;
      case 'bball': setInputs({ ...base, length: 94, width: 50 }); break;
    }
  };

  const handleReset = () => {
    setInputs({
      length: 0, width: 0, length2: 0, width2: 0, diameter: 0,
      depth: inputs.unitSystem === 'imperial' ? 3 : 7.5,
      pricePerSqFt: 0,
      unitSystem: inputs.unitSystem,
      shape: 'rectangle'
    });
  };

  return (
    <div className="glass-panel text-slate-900 rounded-[2rem] shadow-xl bg-white/95 backdrop-blur-md border border-[#885C09]/20 p-4 md:p-8 relative overflow-hidden max-w-6xl mx-auto">
      <div className="absolute top-0 right-0 -mt-16 -mr-16 w-56 h-56 bg-[#9A690F]/20 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div className="text-center md:text-left">
            <div className="inline-flex items-center gap-2 mb-2 justify-center md:justify-start">
              <span className="p-2 bg-[#9A690F]/10 text-[#885C09] rounded-lg"><Square className="w-6 h-6" /></span>
              <span className="text-xs font-bold tracking-widest text-[#885C09] uppercase">Area Master</span>
            </div>
            <h1 className="text-3xl font-black text-[#291901] tracking-tight">Asphalt Footage Calculator</h1>
            <p className="text-xs text-[#885C09] mt-1">Calculate complex areas, tonnage, and pricing</p>
          </div>
          <button onClick={handleReset} className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#fcebd9] text-[#885C09] hover:bg-[#885C09] hover:text-white transition-all text-xs font-bold uppercase tracking-wider">
            <RotateCcw className="w-4 h-4" /> Reset
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT: Inputs */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Shape Selectors */}
            <div className="bg-[#f8f5f1] p-1.5 rounded-xl flex gap-1">
               {[
                 { id: 'rectangle', icon: Square, label: 'Standard' },
                 { id: 'l-shape', icon: LayoutDashboard, label: 'L-Shape' },
                 { id: 'circle', icon: Circle, label: 'Round' }
               ].map((item) => (
                 <button
                    key={item.id}
                    onClick={() => update('shape', item.id)}
                    className={`flex-1 flex flex-col items-center justify-center py-2 rounded-lg transition-all ${inputs.shape === item.id ? 'bg-white text-[#885C09] shadow-md' : 'text-slate-400 hover:text-[#885C09]'}`}
                 >
                   <item.icon className="w-5 h-5 mb-1" />
                   <span className="text-[10px] font-bold uppercase">{item.label}</span>
                 </button>
               ))}
            </div>

            {/* Smart Presets (Only visible in Rectangle mode) */}
            {inputs.shape === 'rectangle' && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                <PresetButton label="1-Car Drive" onClick={() => handlePreset('1car')} />
                <PresetButton label="2-Car Drive" onClick={() => handlePreset('2car')} />
                <PresetButton label="Tennis Ct." onClick={() => handlePreset('tennis')} />
                <PresetButton label="Basketball Ct." onClick={() => handlePreset('bball')} />
              </div>
            )}

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#885C09]/10 space-y-6">
              
              {/* Dynamic Inputs based on Shape */}
              {inputs.shape === 'rectangle' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputGroup label="Length" value={inputs.length} unit={inputs.unitSystem === 'imperial' ? 'ft' : 'm'} onChange={(v) => update('length', v)} onAdjust={(v) => adjustValue('length', v)} />
                  <InputGroup label="Width" value={inputs.width} unit={inputs.unitSystem === 'imperial' ? 'ft' : 'm'} onChange={(v) => update('width', v)} onAdjust={(v) => adjustValue('width', v)} />
                </div>
              )}

              {inputs.shape === 'l-shape' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputGroup label="Main Length" value={inputs.length} unit={inputs.unitSystem === 'imperial' ? 'ft' : 'm'} onChange={(v) => update('length', v)} onAdjust={(v) => adjustValue('length', v)} />
                    <InputGroup label="Main Width" value={inputs.width} unit={inputs.unitSystem === 'imperial' ? 'ft' : 'm'} onChange={(v) => update('width', v)} onAdjust={(v) => adjustValue('width', v)} />
                  </div>
                  <div className="pt-4 border-t border-[#885C09]/10 grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-white px-2 text-[10px] text-[#885C09]/50 font-bold uppercase">Section 2</span>
                    <InputGroup label="Ext. Length" value={inputs.length2} unit={inputs.unitSystem === 'imperial' ? 'ft' : 'm'} onChange={(v) => update('length2', v)} onAdjust={(v) => adjustValue('length2', v)} />
                    <InputGroup label="Ext. Width" value={inputs.width2} unit={inputs.unitSystem === 'imperial' ? 'ft' : 'm'} onChange={(v) => update('width2', v)} onAdjust={(v) => adjustValue('width2', v)} />
                  </div>
                </div>
              )}

              {inputs.shape === 'circle' && (
                 <InputGroup label="Diameter" value={inputs.diameter} unit={inputs.unitSystem === 'imperial' ? 'ft' : 'm'} onChange={(v) => update('diameter', v)} onAdjust={(v) => adjustValue('diameter', v)} />
              )}

              {/* Common Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[#885C09]/10">
                <InputGroup label="Depth" value={inputs.depth} unit={inputs.unitSystem === 'imperial' ? 'in' : 'cm'} step={0.5} onChange={(v) => update('depth', v)} onAdjust={(v) => adjustValue('depth', v)} />
                 <div>
                  <label className="block text-xs font-bold text-[#885C09] uppercase mb-2">Price / Sq Ft</label>
                  <div className="relative h-[52px]">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#885C09]/50 font-bold">$</div>
                    <input 
                      type="number" 
                      inputMode="decimal"
                      value={inputs.pricePerSqFt || ''} 
                      onChange={(e) => update('pricePerSqFt', parseFloat(e.target.value) || 0)} 
                      placeholder="0.00"
                      className="w-full h-full pl-8 pr-4 bg-[#ffe0c1]/10 border border-[#885C09]/20 rounded-xl font-bold text-[#291901] focus:outline-none focus:ring-2 focus:ring-[#885C09]/50 transition-all text-lg" 
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Unit Toggle */}
            <div className="flex justify-center">
              <button 
                onClick={() => update('unitSystem', inputs.unitSystem === 'imperial' ? 'metric' : 'imperial')}
                className="text-xs text-[#885C09]/60 underline decoration-dotted hover:text-[#885C09]"
              >
                Switch to {inputs.unitSystem === 'imperial' ? 'Metric' : 'Imperial'} Units
              </button>
            </div>
          </div>

          {/* RIGHT: Results */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Hero Result: Square Footage */}
            <div className="bg-gradient-to-br from-[#291901] to-[#6d4a07] text-white p-8 rounded-3xl shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-white/10 transition-all duration-700"></div>
              
              <div className="relative z-10 flex flex-col items-center text-center">
                <p className="text-[#ffe0c1]/70 font-bold uppercase tracking-widest text-xs mb-2">Total Project Area</p>
                <div className="text-6xl md:text-7xl font-black tracking-tighter mb-2 leading-none">
                  {result.sqFt.toLocaleString()}
                </div>
                <div className="text-xl text-[#ffe0c1] font-bold">Square Feet</div>
                
                <div className="grid grid-cols-3 gap-2 w-full mt-8 pt-6 border-t border-white/10">
                  <div className="text-center">
                    <div className="text-lg font-bold">{result.sqYd.toLocaleString()}</div>
                    <div className="text-[9px] text-[#ffe0c1]/60 uppercase tracking-wider">Sq Yards</div>
                  </div>
                  <div className="text-center border-l border-white/10">
                    <div className="text-lg font-bold">{result.sqM.toLocaleString()}</div>
                    <div className="text-[9px] text-[#ffe0c1]/60 uppercase tracking-wider">Sq Meters</div>
                  </div>
                  <div className="text-center border-l border-white/10">
                    <div className="text-lg font-bold">{result.acres}</div>
                    <div className="text-[9px] text-[#ffe0c1]/60 uppercase tracking-wider">Acres</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Material & Cost Summary */}
            <div className="bg-white border border-[#885C09]/10 p-6 rounded-3xl shadow-lg">
               <h3 className="text-[#885C09] font-bold text-xs uppercase tracking-wider mb-4 flex items-center gap-2">
                 <Footprints className="w-4 h-4" /> Material Requirements
               </h3>
               
               <div className="space-y-4">
                 <div className="flex justify-between items-center bg-[#f8f5f1] p-3 rounded-xl">
                    <div className="text-xs text-slate-500">Required Asphalt</div>
                    <div className="text-xl font-black text-[#291901]">{result.tons.toLocaleString()} <span className="text-xs font-bold text-[#885C09] uppercase">Tons</span></div>
                 </div>

                 <div className="flex justify-between items-center p-3 rounded-xl border-2 border-dashed border-[#885C09]/10">
                    <div className="text-xs text-slate-500">Estimated Cost</div>
                    <div className="text-2xl font-black text-[#047857]">
                       {inputs.pricePerSqFt > 0 ? `$${result.totalCost.toLocaleString()}` : <span className="text-slate-300">--</span>}
                    </div>
                 </div>
                 {inputs.pricePerSqFt === 0 && <p className="text-[10px] text-center text-slate-400 italic">Enter price per Sq Ft to see total cost</p>}
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

const PresetButton = ({ label, onClick }: { label: string, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className="px-3 py-1.5 rounded-lg bg-white border border-[#885C09]/20 text-[#885C09] text-[10px] font-bold uppercase tracking-wide whitespace-nowrap hover:bg-[#885C09] hover:text-white transition-colors"
  >
    {label}
  </button>
);

const InputGroup = ({ label, value, unit, onChange, onAdjust, step = 1 }: { label: string, value: number, unit: string, step?: number, onChange: (val: number) => void, onAdjust: (val: number) => void }) => (
  <div>
    <label className="block text-xs font-bold text-[#885C09] uppercase mb-2">{label}</label>
    <div className="flex items-center gap-2 h-[52px]">
      <button onClick={() => onAdjust(-step)} className="hidden md:flex w-10 h-full items-center justify-center rounded-xl bg-[#f8f5f1] text-[#885C09] hover:bg-[#ffe0c1] transition-colors flex-shrink-0"><Minus className="w-4 h-4" /></button>
      <div className="relative flex-1 h-full group">
        <input type="number" inputMode="decimal" value={value || ''} onChange={(e) => onChange(parseFloat(e.target.value) || 0)} className="w-full h-full pl-4 pr-12 bg-[#ffe0c1]/10 border border-[#885C09]/20 rounded-xl font-bold text-[#291901] focus:outline-none focus:ring-2 focus:ring-[#885C09]/50 transition-all text-lg" placeholder="0" />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#885C09]/40 uppercase pointer-events-none">{unit}</span>
      </div>
      <button onClick={() => onAdjust(step)} className="hidden md:flex w-10 h-full items-center justify-center rounded-xl bg-[#f8f5f1] text-[#885C09] hover:bg-[#ffe0c1] transition-colors flex-shrink-0"><Plus className="w-4 h-4" /></button>
    </div>
  </div>
);

export default AsphaltSquareFeetCalculator;