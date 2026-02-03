import React, { useState, useEffect } from 'react';
import { 
    DollarSign, Ruler, Home, TrendingUp, Info, 
    CheckCircle2, MapPin, Settings, CarFront 
} from 'lucide-react';

type UnitSystem = 'imperial' | 'metric';
type DrivewaySurface = 'new' | 'overlay';
type DrivewayCurve = 'straight' | 'curved' | 'complex';
type CostTier = 'economy' | 'average' | 'premium';

interface DrivewayInputs {
    length: number;
    width: number;
    depth: number;
    unitSystem: UnitSystem;
    surfaceType: DrivewaySurface;
    curveComplexity: DrivewayCurve;
    laborRate: number;
    materialCostPerTon: number;
    costTier: CostTier;
}

interface DrivewayResult {
    tonnage: number;
    materialCost: number;
    laborCost: number;
    equipmentCost: number;
    baseCost: number;
    totalCost: number;
    costPerSqFt: number;
    squareFeet: number;
    warnings: string[];
}

const PRESETS = {
    single: { w: 10, l: 20, label: 'Single Pad' },
    double: { w: 20, l: 20, label: 'Double Pad' },
    suburban: { w: 12, l: 40, label: 'Suburban' },
    estate: { w: 12, l: 100, label: 'Long Estate' },
};

const COST_TIERS = {
    economy: { mat: 100, labor: 40, label: 'Rural / Low' },
    average: { mat: 135, labor: 55, label: 'National Avg' },
    premium: { mat: 175, labor: 80, label: 'Urban / High' }
};

const LABOR_HOURS_PER_SQ_FT = 0.015;
const EQUIPMENT_COST_BASE = 500;
const BASE_GRAVEL_COST_PER_TON = 25;

// Selection Button Component
const SelectionButton = ({ selected, onClick, label, subLabel, icon: Icon }: any) => (
    <button 
        onClick={onClick} 
        className={`relative p-2 md:p-3 rounded-xl border transition-all duration-200 w-full touch-manipulation flex flex-col justify-center items-center text-center h-full
        ${selected 
            ? 'border-[#9A690F] bg-[#9A690F]/10 ring-1 ring-[#9A690F]' 
            : 'border-[#ffe0c1] bg-white hover:bg-[#ffe0c1]/50 text-slate-500'}`}
    >
        {Icon && <Icon className={`w-5 h-5 mb-1 ${selected ? 'text-[#9A690F]' : 'text-slate-400'}`} />}
        <div className={`font-bold text-xs md:text-sm ${selected ? 'text-[#291901]' : 'text-slate-700'}`}>{label}</div>
        {subLabel && <div className={`text-[10px] mt-0.5 leading-tight ${selected ? 'text-[#885C09]' : 'text-slate-400'}`}>{subLabel}</div>}
        {selected && <div className="absolute top-1 right-1 text-[#9A690F]"><CheckCircle2 className="w-3 h-3" /></div>}
    </button>
);

// Slider Input Component
const DimensionSlider = ({ label, value, min, max, step, unit, onChange }: any) => (
    <div className="bg-[#ffe0c1]/20 p-3 rounded-xl border border-[#ffe0c1]/50">
        <div className="flex justify-between mb-2">
            <span className="text-xs font-bold text-[#885C09] uppercase">{label}</span>
            <span className="text-xs font-bold text-[#291901] bg-white px-2 py-0.5 rounded-md shadow-sm border border-[#ffe0c1]">
                {value} {unit}
            </span>
        </div>
        <input 
            type="range" 
            min={min} 
            max={max} 
            step={step} 
            value={value} 
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-[#ffe0c1] rounded-lg appearance-none cursor-pointer accent-[#9A690F]"
        />
    </div>
);

const AsphaltDrivewayCalculator: React.FC = () => {
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [inputs, setInputs] = useState<DrivewayInputs>({
        length: 40,
        width: 12,
        depth: 3,
        unitSystem: 'imperial',
        surfaceType: 'new',
        curveComplexity: 'straight',
        laborRate: 55,
        materialCostPerTon: 135,
        costTier: 'average'
    });

    const [result, setResult] = useState<DrivewayResult | null>(null);

    useEffect(() => {
        const tier = COST_TIERS[inputs.costTier];
        setInputs(prev => ({
            ...prev,
            laborRate: tier.labor,
            materialCostPerTon: tier.mat
        }));
    }, [inputs.costTier]);

    useEffect(() => {
        calculateCost();
    }, [inputs.length, inputs.width, inputs.depth, inputs.surfaceType, inputs.curveComplexity, inputs.laborRate, inputs.materialCostPerTon, inputs.unitSystem]);

    const calculateCost = () => {
        const { length, width, depth, unitSystem, surfaceType, curveComplexity, laborRate, materialCostPerTon } = inputs;

        let lengthFt = length;
        let widthFt = width;
        let depthInches = depth;

        if (unitSystem === 'metric') {
            lengthFt = length * 3.28084;
            widthFt = width * 3.28084;
            depthInches = depth * 0.393701;
        }

        const squareFeet = lengthFt * widthFt;
        const volumeCubicFeet = lengthFt * widthFt * (depthInches / 12);
        
        // 145 lbs/cu ft is standard asphalt density
        const tonnage = (volumeCubicFeet * 145) / 2000;

        // Labor multiplier based on shape
        let laborMultiplier = 1.0;
        if (curveComplexity === 'curved') laborMultiplier = 1.3;
        if (curveComplexity === 'complex') laborMultiplier = 1.6;
        
        const laborHours = squareFeet * LABOR_HOURS_PER_SQ_FT * laborMultiplier;
        const laborCost = laborHours * laborRate;
        const materialCost = tonnage * materialCostPerTon;
        const equipmentCost = EQUIPMENT_COST_BASE + (squareFeet * 0.35);

        let baseCost = 0;
        if (surfaceType === 'new') {
            const baseDepthInches = 6;
            const baseVolumeCubicFeet = lengthFt * widthFt * (baseDepthInches / 12);
            const baseTonnage = (baseVolumeCubicFeet * 110) / 2000; // Gravel is ~110 lbs/cu ft loose
            baseCost = baseTonnage * BASE_GRAVEL_COST_PER_TON;
        }

        const totalCost = materialCost + laborCost + equipmentCost + baseCost;
        const costPerSqFt = totalCost / (squareFeet || 1);

        const warnings: string[] = [];
        if (depthInches < 2) warnings.push("⚠️ Depth < 2\" risks cracking.");
        if (squareFeet > 2000) warnings.push("🚛 Commercial size project.");
        if (surfaceType === 'overlay' && depthInches > 2) warnings.push("📏 Overlays are typically 1.5-2\".");

        setResult({
            tonnage: Math.round(tonnage * 10) / 10,
            materialCost: Math.round(materialCost),
            laborCost: Math.round(laborCost),
            equipmentCost: Math.round(equipmentCost),
            baseCost: Math.round(baseCost),
            totalCost: Math.round(totalCost),
            costPerSqFt: Math.round(costPerSqFt * 100) / 100,
            squareFeet: Math.round(squareFeet),
            warnings
        });
    };

    const applyPreset = (key: keyof typeof PRESETS) => {
        const p = PRESETS[key];
        const isMetric = inputs.unitSystem === 'metric';
        setInputs(prev => ({
            ...prev,
            width: isMetric ? Math.round(p.w * 0.3048) : p.w,
            length: isMetric ? Math.round(p.l * 0.3048) : p.l
        }));
    };

    const toggleUnit = () => {
        setInputs(prev => {
            const isImp = prev.unitSystem === 'imperial';
            return {
                ...prev,
                unitSystem: isImp ? 'metric' : 'imperial',
                length: Math.round(prev.length * (isImp ? 0.3048 : 3.28084)),
                width: Math.round(prev.width * (isImp ? 0.3048 : 3.28084)),
                depth: Math.round(prev.depth * (isImp ? 2.54 : 0.393701) * 10) / 10
            };
        });
    };

    const u = {
        l: inputs.unitSystem === 'imperial' ? 'ft' : 'm',
        d: inputs.unitSystem === 'imperial' ? 'in' : 'cm'
    };

    return (
        <div className="glass-panel text-slate-900 rounded-[2rem] shadow-xl bg-white/95 backdrop-blur-md border border-[#885C09]/20 p-0 md:p-8 relative overflow-hidden max-w-6xl mx-auto font-sans">
            
            {/* Sticky Mobile Header Result */}
            <div className="lg:hidden sticky top-0 z-40 bg-[#291901] text-[#ffe0c1] p-4 shadow-lg flex justify-between items-center border-b border-[#885C09]/30">
                <div>
                    <div className="text-[10px] uppercase tracking-wider opacity-70">Estimated Cost</div>
                    <div className="text-2xl font-black text-white leading-none">
                        ${result ? (result.totalCost / 1000).toFixed(1) : 0}k
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-[10px] uppercase tracking-wider opacity-70">Area</div>
                    <div className="font-bold text-white text-sm">{result?.squareFeet.toLocaleString()} sq ft</div>
                </div>
            </div>

            <div className="p-4 md:p-0 relative z-10 w-full">
                <div className="text-center mb-6 md:mb-8 pt-4 md:pt-0">
                    <div className="inline-flex items-center gap-2 mb-2">
                        <span className="p-1.5 bg-[#9A690F]/10 text-[#885C09] rounded-lg"><Home className="w-5 h-5" /></span>
                        <span className="text-[10px] font-bold tracking-widest text-[#885C09] uppercase">2025 Calculator</span>
                    </div>
                    <h1 className="text-2xl md:text-4xl font-black text-[#291901] tracking-tight">Asphalt Paving Estimator</h1>
                    <p className="text-xs text-[#885C09] mt-1">Instant Quote for Materials & Installation</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* INPUTS COLUMN */}
                    <div className="lg:col-span-7 space-y-5">

                        {/* Presets & Dimensions */}
                        <div className="bg-white p-5 rounded-3xl shadow-sm border border-[#885C09]/10">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-[#291901] text-sm uppercase tracking-wide flex items-center gap-2">
                                    <Ruler className="w-4 h-4 text-[#9A690F]" /> Dimensions
                                </h3>
                                <button onClick={toggleUnit} className="text-[10px] font-bold bg-[#ffe0c1] hover:bg-[#9A690F]/20 text-[#885C09] px-3 py-1.5 rounded-full transition-colors uppercase">
                                    {inputs.unitSystem === 'imperial' ? 'To Metric' : 'To Imperial'}
                                </button>
                            </div>

                            {/* FIX: Grid layout allows reflow (wrapping) on mobile, no scrolling */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                                {Object.entries(PRESETS).map(([key, data]) => (
                                    <button 
                                        key={key}
                                        onClick={() => applyPreset(key as keyof typeof PRESETS)}
                                        className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-[#9A690F] hover:bg-[#9A690F]/5 active:scale-95 transition-all text-center h-full group"
                                    >
                                        <CarFront className="w-5 h-5 text-slate-400 group-hover:text-[#9A690F] mb-1.5" />
                                        <div className="text-xs font-bold text-slate-700 leading-tight">{data.label}</div>
                                        <div className="text-[10px] text-slate-400 mt-1">{data.w}x{data.l} {u.l}</div>
                                    </button>
                                ))}
                            </div>

                            <div className="space-y-4">
                                <DimensionSlider label="Width" value={inputs.width} min={4} max={100} step={1} unit={u.l} onChange={(v: number) => setInputs(p => ({...p, width: v}))} />
                                <DimensionSlider label="Length" value={inputs.length} min={10} max={500} step={1} unit={u.l} onChange={(v: number) => setInputs(p => ({...p, length: v}))} />
                                <DimensionSlider label="Thickness" value={inputs.depth} min={1} max={6} step={0.5} unit={u.d} onChange={(v: number) => setInputs(p => ({...p, depth: v}))} />
                            </div>
                        </div>

                        {/* Project Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white p-5 rounded-3xl shadow-sm border border-[#885C09]/10">
                                <h3 className="font-bold text-[#291901] text-sm uppercase tracking-wide mb-3 flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-[#9A690F]" /> Type
                                </h3>
                                <div className="grid grid-cols-2 gap-2 h-24">
                                    <SelectionButton selected={inputs.surfaceType === 'new'} onClick={() => setInputs(p => ({ ...p, surfaceType: 'new' }))} label="New Install" subLabel="Inc. Base" />
                                    <SelectionButton selected={inputs.surfaceType === 'overlay'} onClick={() => setInputs(p => ({ ...p, surfaceType: 'overlay' }))} label="Resurface" subLabel="Top Only" />
                                </div>
                            </div>

                            <div className="bg-white p-5 rounded-3xl shadow-sm border border-[#885C09]/10">
                                <h3 className="font-bold text-[#291901] text-sm uppercase tracking-wide mb-3 flex items-center gap-2">
                                    <Settings className="w-4 h-4 text-[#9A690F]" /> Shape
                                </h3>
                                <div className="grid grid-cols-3 gap-2 h-24">
                                    <SelectionButton selected={inputs.curveComplexity === 'straight'} onClick={() => setInputs(p => ({ ...p, curveComplexity: 'straight' }))} label="Straight" subLabel="Std" />
                                    <SelectionButton selected={inputs.curveComplexity === 'curved'} onClick={() => setInputs(p => ({ ...p, curveComplexity: 'curved' }))} label="Curved" subLabel="+30%" />
                                    <SelectionButton selected={inputs.curveComplexity === 'complex'} onClick={() => setInputs(p => ({ ...p, curveComplexity: 'complex' }))} label="Custom" subLabel="+60%" />
                                </div>
                            </div>
                        </div>

                        {/* Location / Cost Tiers */}
                        <div className="bg-white p-5 rounded-3xl shadow-sm border border-[#885C09]/10">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-[#291901] text-sm uppercase tracking-wide flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-[#9A690F]" /> Regional Prices
                                </h3>
                                <button 
                                    onClick={() => setShowAdvanced(!showAdvanced)}
                                    className="text-[10px] flex items-center gap-1 font-bold text-slate-400 hover:text-[#9A690F] uppercase transition-colors"
                                >
                                    <Settings className="w-3 h-3" /> {showAdvanced ? 'Hide' : 'Edit'}
                                </button>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-2 mb-4">
                                {(Object.keys(COST_TIERS) as CostTier[]).map((tier) => (
                                    <button
                                        key={tier}
                                        onClick={() => setInputs(p => ({ ...p, costTier: tier }))}
                                        className={`py-3 px-2 rounded-xl text-center transition-all ${inputs.costTier === tier ? 'bg-[#291901] text-[#ffe0c1] shadow-lg scale-105' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                                    >
                                        <div className="text-xs font-bold uppercase mb-1">{COST_TIERS[tier].label}</div>
                                        <div className="text-[10px] opacity-70">
                                            {tier === 'economy' ? '$' : tier === 'average' ? '$$' : '$$$'}
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {/* Advanced Manual Inputs */}
                            {showAdvanced && (
                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 animate-in fade-in slide-in-from-top-2">
                                    <div>
                                        <label className="block text-[10px] font-bold text-[#885C09] uppercase mb-1">Material ($/Ton)</label>
                                        <input type="number" value={inputs.materialCostPerTon} onChange={(e) => setInputs(p => ({ ...p, materialCostPerTon: parseFloat(e.target.value) || 0 }))} className="w-full px-3 py-2 bg-[#ffe0c1]/20 border border-[#ffe0c1] rounded-lg font-bold text-sm text-[#291901]" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-[#885C09] uppercase mb-1">Labor ($/Hr)</label>
                                        <input type="number" value={inputs.laborRate} onChange={(e) => setInputs(p => ({ ...p, laborRate: parseFloat(e.target.value) || 0 }))} className="w-full px-3 py-2 bg-[#ffe0c1]/20 border border-[#ffe0c1] rounded-lg font-bold text-sm text-[#291901]" />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RESULTS COLUMN */}
                    <div className="lg:col-span-5 space-y-4">
                        <div className="bg-gradient-to-br from-[#291901] to-[#5c3d05] text-white p-6 md:p-8 rounded-[2rem] shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none"><DollarSign className="w-48 h-48" /></div>
                            
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <p className="text-[#ffe0c1]/70 font-bold uppercase tracking-widest text-[10px] mb-2">Total Project Estimate</p>
                                        {result ? (
                                            <div className="text-5xl md:text-6xl font-black tracking-tighter text-white drop-shadow-xl">
                                                ${(result.totalCost / 1000).toFixed(1)}k
                                            </div>
                                        ) : <div className="text-4xl font-bold text-[#ffe0c1]/40">--</div>}
                                    </div>
                                    <div className="text-right">
                                        <div className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10 inline-block">
                                            <div className="text-2xl font-bold">{result?.squareFeet.toLocaleString()}</div>
                                            <div className="text-[10px] uppercase text-[#ffe0c1]/80">Sq. Ft.</div>
                                        </div>
                                    </div>
                                </div>

                                {result && (
                                    <>
                                        <div className="space-y-3 mb-6">
                                            <div className="bg-black/20 p-3 rounded-xl">
                                                <div className="flex justify-between text-xs mb-1">
                                                    <span className="text-[#ffe0c1]">Materials ({result.tonnage} Tons)</span>
                                                    <span className="font-bold">${result.materialCost.toLocaleString()}</span>
                                                </div>
                                                <div className="w-full bg-white/10 rounded-full h-1.5">
                                                    <div className="bg-[#ffe0c1] h-1.5 rounded-full" style={{ width: `${(result.materialCost / result.totalCost) * 100}%` }}></div>
                                                </div>
                                            </div>
                                            
                                            <div className="bg-black/20 p-3 rounded-xl">
                                                <div className="flex justify-between text-xs mb-1">
                                                    <span className="text-[#ffe0c1]">Labor & Install</span>
                                                    <span className="font-bold">${result.laborCost.toLocaleString()}</span>
                                                </div>
                                                <div className="w-full bg-white/10 rounded-full h-1.5">
                                                    <div className="bg-[#fbbf24] h-1.5 rounded-full" style={{ width: `${(result.laborCost / result.totalCost) * 100}%` }}></div>
                                                </div>
                                            </div>

                                            <div className="flex gap-2">
                                                <div className="flex-1 bg-black/20 p-2 rounded-xl text-center">
                                                    <div className="text-[10px] text-[#ffe0c1]/60 uppercase">Equipment</div>
                                                    <div className="font-bold text-sm">${result.equipmentCost}</div>
                                                </div>
                                                {result.baseCost > 0 && (
                                                    <div className="flex-1 bg-black/20 p-2 rounded-xl text-center">
                                                        <div className="text-[10px] text-[#ffe0c1]/60 uppercase">Gravel Base</div>
                                                        <div className="font-bold text-sm">${result.baseCost}</div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {result.warnings.length > 0 && (
                                            <div className="space-y-2">
                                                {result.warnings.map((w, i) => (
                                                    <div key={i} className="flex gap-2 items-center text-[11px] text-amber-100 bg-amber-500/20 px-3 py-2 rounded-lg border border-amber-500/30">
                                                        <Info className="w-3 h-3 min-w-[12px]" />
                                                        <span className="font-medium">{w}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="bg-[#fff8f0] p-5 rounded-3xl border border-[#ffe0c1]">
                            <h4 className="font-bold text-[#291901] mb-3 flex items-center gap-2 text-xs uppercase tracking-wide">
                                <CheckCircle2 className="w-4 h-4 text-green-600" /> Money Saving Tips
                            </h4>
                            <ul className="space-y-2">
                                {["Schedule in late fall for potential discounts.", "Recycled asphalt millings cost 50% less.", "Ensure proper drainage to double lifespan."].map((item, i) => (
                                    <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#9A690F] mt-1 shrink-0"></div>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <div className="text-center mt-6">
                <p className="text-[#885C09] text-sm">
                    Disclaimer: Always consult with a licensed contractor or engineer for precise project planning. Results are for informational purposes only.
                    <br></br>
                    Powered by <a href="https://asphaltcalculatorusa.com" className="text-[#9A690F] font-bold hover:underline" target="_blank" rel="noopener noreferrer">AsphaltCalculatorUSA.com</a>
                </p>
            </div>
        </div>
    );
};

export default AsphaltDrivewayCalculator;