import React, { useMemo, useState } from 'react';
import { 
  Sliders, Activity, Layers, Thermometer, 
  Truck, Shield, ArrowRight, Construction,
  Microscope, Scale
} from 'lucide-react';

// --- Configuration Types ---
type TrafficLoad = 1 | 2 | 3 | 4 | 5; // 1=Driveway, 5=Heavy Industrial
type ClimateZone = 'northern' | 'central' | 'southern';
type ProjectType = 'new' | 'overlay';
type SoilCondition = 'stable' | 'soft';

// --- Output Type ---
type MixSpec = {
  title: string;
  badge: string;
  binder: string;
  surfaceMix: string;
  baseMix: string | null;
  totalThickness: number;
  lifespan: string;
  pros: string[];
};

const AsphaltTypeSelector: React.FC = () => {
  // --- Inputs ---
  const [traffic, setTraffic] = useState<TrafficLoad>(3);
  const [climate, setClimate] = useState<ClimateZone>('central');
  const [projectType, setProjectType] = useState<ProjectType>('new');
  const [soil, setSoil] = useState<SoilCondition>('stable');

  // --- Engineering Logic ---
  const results = useMemo<{ standard: MixSpec; premium: MixSpec }>(() => {
    
    // 1. Determine Binder Grade (PG) based on Climate
    // PG (Performance Grade) logic: PG 64-22 is standard, Polymers (70+, 76+) add cost/life
    let standardBinder = 'PG 64-22';
    let premiumBinder = 'PG 70-22 (Polymer)';
    
    if (climate === 'northern') {
      standardBinder = 'PG 58-28';
      premiumBinder = 'PG 64-28 (Polymer)';
    } else if (climate === 'southern') {
      standardBinder = 'PG 67-22';
      premiumBinder = 'PG 76-22 (Polymer)';
    }

    // 2. Determine Structure based on Traffic & Project Type
    let surfaceThickness = 2.0;
    let baseThickness = 0;
    let surfaceAgg = '9.5mm (Fine)';
    let baseAgg = '19.0mm (Coarse)';

    // Adjust for Heavy Traffic
    if (traffic >= 4) {
      surfaceAgg = '12.5mm (Structural)';
      baseAgg = '25.0mm (Heavy Base)';
      surfaceThickness = 2.5; // Thicker top lift for heavy loads
    }

    // Structure Logic
    if (projectType === 'new') {
      // New construction needs a base layer
      baseThickness = traffic >= 3 ? 3.0 : 2.0; 
      if (soil === 'soft') baseThickness += 1.0; // Add structure for soft soil
    } else {
      // Overlay usually doesn't get a base course unless specified
      baseThickness = 0;
      surfaceThickness = traffic >= 4 ? 2.0 : 1.5;
    }

    // 3. Construct Options
    const standard: MixSpec = {
      title: 'Standard Specification',
      badge: 'Cost Efficient',
      binder: standardBinder,
      surfaceMix: `Superpave ${surfaceAgg}`,
      baseMix: baseThickness > 0 ? `Binder Course ${baseAgg}` : null,
      totalThickness: surfaceThickness + baseThickness,
      lifespan: '15-18 Years',
      pros: ['Lower Material Cost', 'Standard Availability', 'Easier to Work Hand-Tools']
    };

    const premium: MixSpec = {
      title: 'High-Performance Spec',
      badge: 'Max Durability',
      binder: premiumBinder, // Polymer modified
      surfaceMix: traffic >= 4 ? 'Stone Mastic Asphalt (SMA)' : `Superpave ${surfaceAgg} High-Air`,
      baseMix: baseThickness > 0 ? `Binder Course ${baseAgg}` : null,
      totalThickness: surfaceThickness + baseThickness, // Thickness stays same, chemistry changes
      lifespan: '20-25+ Years',
      pros: ['Resists Rutting (Heavy Loads)', 'Resists Thermal Cracking', 'Higher Resale Value']
    };

    return { standard, premium };
  }, [traffic, climate, projectType, soil]);

  return (
    <div className="glass-panel text-slate-900 rounded-[2rem] shadow-xl bg-white/95 backdrop-blur-md border border-[#885C09]/20 p-4 md:p-8 relative overflow-hidden max-w-7xl mx-auto">
      {/* Tech Background Elements */}
      <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-[#9A690F]/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'linear-gradient(#885C09 1px, transparent 1px), linear-gradient(90deg, #885C09 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
      </div>

      <div className="relative z-10 w-full">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 border-b-2 border-[#885C09]/10 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 mb-2">
              <span className="p-2 bg-[#9A690F]/10 text-[#885C09] rounded-lg"><Microscope className="w-6 h-6" /></span>
              <span className="text-sm font-bold tracking-widest text-[#885C09] uppercase">Engineering Tool</span>
            </div>
            <h1 className="text-4xl font-black text-[#291901] tracking-tight">Mix Design Selector</h1>
            <p className="text-sm text-slate-600 mt-2 max-w-xl">
              Calculate the optimal asphalt pavement structure and chemical binder grade based on environmental and load factors.
            </p>
          </div>
          <div className="hidden md:block text-right">
             <div className="text-xs font-mono text-[#885C09] uppercase mb-1">System Status</div>
             <div className="flex items-center gap-2 text-green-600 font-bold bg-green-50 px-3 py-1 rounded-full border border-green-200">
               <Activity className="w-4 h-4" /> Calculations Ready
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT: CONTROL PANEL (The "Calculator") */}
          <div className="lg:col-span-5 space-y-8 bg-[#f8f5f1] p-6 rounded-3xl border border-[#885C09]/10">
            
            <div className="flex items-center gap-2 mb-2">
               <Sliders className="w-5 h-5 text-[#885C09]" />
               <h3 className="text-sm font-black text-[#885C09] uppercase tracking-wider">Project Inputs</h3>
            </div>

            {/* Input 1: Traffic Slider */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-[#885C09]/10">
              <div className="flex justify-between mb-4">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#885C09]" /> Traffic Load
                </label>
                <span className="text-xs font-mono font-bold bg-[#ffe0c1] text-[#885C09] px-2 py-1 rounded">
                  Level {traffic}
                </span>
              </div>
              <input 
                type="range" min={1} max={5} step={1} value={traffic}
                onChange={(e) => setTraffic(parseInt(e.target.value) as TrafficLoad)}
                className="w-full accent-[#885C09] h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="mt-3 text-xs font-medium text-slate-500 flex justify-between">
                <span>Residential</span>
                <span>Commercial</span>
                <span>Industrial</span>
              </div>
            </div>

            {/* Input 2: Project Type Toggle */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-[#885C09]/10">
               <label className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                  <Construction className="w-4 h-4 text-[#885C09]" /> Project Scope
               </label>
               <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => setProjectType('new')}
                    className={`py-3 px-4 rounded-lg text-sm font-bold transition-all border-2 ${projectType === 'new' ? 'border-[#885C09] bg-[#ffe0c1]/20 text-[#885C09]' : 'border-transparent bg-slate-50 text-slate-500'}`}
                  >
                    New Install
                  </button>
                  <button 
                    onClick={() => setProjectType('overlay')}
                    className={`py-3 px-4 rounded-lg text-sm font-bold transition-all border-2 ${projectType === 'overlay' ? 'border-[#885C09] bg-[#ffe0c1]/20 text-[#885C09]' : 'border-transparent bg-slate-50 text-slate-500'}`}
                  >
                    Resurface
                  </button>
               </div>
            </div>

            {/* Input 3: Climate & Soil Grid */}
            <div className="grid grid-cols-2 gap-4">
               <div className="bg-white p-4 rounded-xl shadow-sm border border-[#885C09]/10">
                  <label className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1">
                    <Thermometer className="w-3 h-3 text-[#885C09]" /> Climate
                  </label>
                  <select 
                    value={climate}
                    onChange={(e) => setClimate(e.target.value as ClimateZone)}
                    className="w-full bg-slate-50 border border-slate-200 text-sm font-bold text-slate-700 rounded-lg p-2.5 focus:border-[#885C09] outline-none"
                  >
                    <option value="northern">Cold/North</option>
                    <option value="central">Central</option>
                    <option value="southern">Hot/South</option>
                  </select>
               </div>
               <div className="bg-white p-4 rounded-xl shadow-sm border border-[#885C09]/10">
                  <label className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1">
                    <Layers className="w-3 h-3 text-[#885C09]" /> Subgrade
                  </label>
                  <select 
                    value={soil}
                    onChange={(e) => setSoil(e.target.value as SoilCondition)}
                    className="w-full bg-slate-50 border border-slate-200 text-sm font-bold text-slate-700 rounded-lg p-2.5 focus:border-[#885C09] outline-none"
                  >
                    <option value="stable">Stable/Rock</option>
                    <option value="soft">Soft/Clay</option>
                  </select>
               </div>
            </div>

          </div>

          {/* RIGHT: DATA OUTPUT (The "Results") */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Option 1: Standard */}
            <ResultCard 
              type="standard"
              data={results.standard}
            />

            {/* Option 2: Premium */}
            <ResultCard 
              type="premium"
              data={results.premium}
            />

          </div>
        </div>
      </div>
    </div>
  );
};

// --- Sub-Component: Technical Result Card ---
const ResultCard = ({ type, data }: { type: 'standard' | 'premium', data: MixSpec }) => {
  const isPremium = type === 'premium';
  
  return (
    <div className={`relative overflow-hidden rounded-2xl border-2 transition-all ${
      isPremium 
        ? 'border-[#885C09] bg-gradient-to-br from-[#291901] to-[#5c3d05] text-white shadow-xl' 
        : 'border-slate-200 bg-white text-slate-800 shadow-sm'
    }`}>
      
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-opacity-10 border-current bg-black/5">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isPremium ? 'bg-[#ffe0c1] text-[#291901]' : 'bg-[#291901] text-white'}`}>
             {isPremium ? <Shield className="w-5 h-5" /> : <Scale className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="text-lg font-black uppercase tracking-tight leading-none">{data.title}</h3>
            <span className={`text-xs font-medium ${isPremium ? 'text-[#ffe0c1]' : 'text-slate-500'}`}>Recommended for: {data.badge}</span>
          </div>
        </div>
        <div className="text-right">
           <div className="text-2xl font-black">{data.totalThickness}"</div>
           <div className={`text-[10px] font-bold uppercase tracking-wider ${isPremium ? 'text-white/60' : 'text-slate-400'}`}>Total Depth</div>
        </div>
      </div>

      {/* Tech Specs Grid */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
         
         {/* Left: Materials */}
         <div className="space-y-4">
            <h4 className={`text-xs font-bold uppercase tracking-widest mb-3 ${isPremium ? 'text-[#ffe0c1]/50' : 'text-slate-400'}`}>Material Specs</h4>
            
            <SpecRow 
              label="Binder Grade (PG)" 
              val={data.binder} 
              light={!isPremium}
            />
            <SpecRow 
              label="Surface Course" 
              val={data.surfaceMix} 
              light={!isPremium}
            />
            {data.baseMix && (
              <SpecRow 
                label="Base Course" 
                val={data.baseMix} 
                light={!isPremium}
              />
            )}
         </div>

         {/* Right: Performance */}
         <div className="space-y-4">
             <h4 className={`text-xs font-bold uppercase tracking-widest mb-3 ${isPremium ? 'text-[#ffe0c1]/50' : 'text-slate-400'}`}>Performance Profile</h4>
             
             <div className="flex justify-between items-center py-2 border-b border-current border-opacity-10">
                <span className={`text-sm ${isPremium ? 'text-white/70' : 'text-slate-600'}`}>Est. Lifespan</span>
                <span className={`font-mono font-bold ${isPremium ? 'text-[#ffe0c1]' : 'text-[#885C09]'}`}>{data.lifespan}</span>
             </div>

             <div className="mt-4">
               {data.pros.map((pro, i) => (
                 <div key={i} className="flex items-start gap-2 mb-1.5">
                   <ArrowRight className={`w-3 h-3 mt-1 ${isPremium ? 'text-[#ffe0c1]' : 'text-green-600'}`} />
                   <span className={`text-xs font-medium ${isPremium ? 'text-white/80' : 'text-slate-600'}`}>{pro}</span>
                 </div>
               ))}
             </div>
         </div>

      </div>
    </div>
  );
};

// Helper for data rows
const SpecRow = ({ label, val, light }: { label: string, val: string, light: boolean }) => (
  <div>
    <span className={`block text-[10px] uppercase mb-0.5 ${light ? 'text-slate-400' : 'text-white/50'}`}>{label}</span>
    <span className={`font-mono text-sm font-bold ${light ? 'text-slate-800' : 'text-white'}`}>{val}</span>
  </div>
);

export default AsphaltTypeSelector;