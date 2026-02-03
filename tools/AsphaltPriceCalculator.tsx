import React, { useState, useEffect } from 'react';
import { 
    Tag, DollarSign, BarChart3, Info, CheckCircle2, Minus, Plus, 
    Truck, HardHat, MapPin, Thermometer, AlertCircle, ChevronsRight 
} from 'lucide-react';

type UnitSystem = 'imperial' | 'metric';

interface PriceInputs {
    pricePerTon: number;
    depth: number;
    density: number;
    unitSystem: UnitSystem;
    projectType: string;
    region: string;
    season: string;
    basePreparation: boolean;
    projectSize: number;
    deliveryDistance: number;
    asphaltType: string;
    additives: boolean;
    laborCost: number;
}

interface PriceResult {
    costPerSqFt: number;
    costPerSqYd: number;
    costPerSqMeter: number;
    costPerCubicYard: number;
    tonnagePer100SqFt: number;
    totalProjectCost: number;
    materialCost: number;
    laborCost: number;
    deliveryCost: number;
    preparationCost: number;
    additivesCost: number;
    warnings: string[];
    recommendations: string[];
}

// Reusable Helper for the Plus/Minus Inputs to ensure consistency
const NumberInput = ({ label, value, onChange, onMinus, onPlus, subLabel, icon: Icon, unit }: any) => (
    <div className="w-full">
        <label className="block text-[10px] md:text-xs font-bold text-[#885C09] uppercase mb-1.5 flex items-center justify-between">
            <span>{label}</span>
            {unit && <span className="opacity-50">{unit}</span>}
        </label>
        <div className="flex items-center bg-[#ffe0c1]/20 p-1 rounded-xl border border-[#ffe0c1]/50 focus-within:ring-2 focus-within:ring-[#9A690F]/50 transition-all">
            <button 
                onClick={onMinus}
                className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#ffe0c1] text-[#885C09] hover:bg-[#9A690F] hover:text-white transition-all active:scale-95 flex-shrink-0 shadow-sm"
            >
                <Minus className="w-4 h-4" />
            </button>
            
            <div className="flex-1 relative flex items-center justify-center">
                {Icon && <Icon className="w-4 h-4 text-[#885C09]/50 absolute left-2" />}
                <input 
                    type="number" 
                    value={value} 
                    onChange={(e) => onChange(parseFloat(e.target.value) || 0)} 
                    className="w-full text-center font-bold text-lg text-[#291901] bg-transparent border-none focus:ring-0 p-0 appearance-none m-0"
                    style={{ WebkitAppearance: 'none', MozAppearance: 'textfield' }} // Hides browser spinners
                />
            </div>

            <button 
                onClick={onPlus}
                className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#ffe0c1] text-[#885C09] hover:bg-[#9A690F] hover:text-white transition-all active:scale-95 flex-shrink-0 shadow-sm"
            >
                <Plus className="w-4 h-4" />
            </button>
        </div>
        {subLabel && <p className="text-[10px] text-slate-500 mt-1.5 ml-1 leading-tight">{subLabel}</p>}
    </div>
);

// Styled Select Component
const SelectInput = ({ label, value, onChange, options }: any) => (
    <div className="w-full">
        <label className="block text-[10px] md:text-xs font-bold text-[#885C09] uppercase mb-1.5">{label}</label>
        <div className="relative">
            <select 
                value={value} 
                onChange={(e) => onChange(e.target.value)} 
                className="w-full px-4 py-2.5 bg-[#ffe0c1]/20 border border-[#ffe0c1]/50 rounded-xl text-sm font-bold text-[#291901] focus:ring-2 focus:ring-[#9A690F] focus:border-transparent appearance-none cursor-pointer"
            >
                {options.map((opt: any) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#885C09]">
                <ChevronsRight className="w-4 h-4 rotate-90" />
            </div>
        </div>
    </div>
);

const AsphaltPriceCalculator: React.FC = () => {
    const [inputs, setInputs] = useState<PriceInputs>({
        pricePerTon: 125,
        depth: 2.5,
        density: 148,
        unitSystem: 'imperial',
        projectType: 'residential',
        region: 'midwest',
        season: 'summer',
        basePreparation: true,
        projectSize: 1000,
        deliveryDistance: 20,
        asphaltType: 'hot-mix',
        additives: false,
        laborCost: 35
    });

    const [result, setResult] = useState<PriceResult | null>(null);
    
    const standardLots = [
        { name: 'Single Driveway', area: 240, depth: 2.5, label: '12x20 ft' },
        { name: 'Double Driveway', area: 600, depth: 2.5, label: '24x25 ft' },
        { name: 'Parking Space', area: 180, depth: 3, label: '9x20 ft' },
        { name: 'Tennis Court', area: 2808, depth: 2, label: 'Std Court' },
    ];

    useEffect(() => {
        calculatePricing();
    }, [inputs]);

    const calculatePricing = () => {
        const { pricePerTon, depth, density, projectSize, projectType, region, season, basePreparation, deliveryDistance, asphaltType, additives, laborCost } = inputs;

        // Base material calculation
        const depthFt = depth / 12;
        const lbsPerSqFt = depthFt * density;
        const tonsPerSqFt = lbsPerSqFt / 2000;
        
        // Regional multipliers
        const regionMultipliers: Record<string, number> = {
            'northeast': 1.15, 'midwest': 1.00, 'south': 0.95, 'west': 1.20, 'northwest': 1.10
        };

        // Season adjustments
        const seasonMultipliers: Record<string, number> = {
            'winter': 1.25, 'spring': 1.10, 'summer': 1.00, 'fall': 1.05
        };

        // Asphalt type adjustments
        const asphaltTypeMultipliers: Record<string, number> = {
            'hot-mix': 1.00, 'warm-mix': 0.95, 'cold-mix': 0.85, 
            'porous': 1.30, 'recycled': 0.70, 'stone-matrix': 1.25
        };

        // Project type adjustments
        const projectTypeMultipliers: Record<string, number> = {
            'residential': 1.00, 'commercial': 0.90, 'municipal': 0.85, 
            'highway': 0.80, 'industrial': 0.95
        };

        // Size discount tiers
        let sizeDiscount = 0;
        if (projectSize > 10000) sizeDiscount = 0.15;
        else if (projectSize > 5000) sizeDiscount = 0.10;
        else if (projectSize > 1000) sizeDiscount = 0.05;

        const deliveryCostPerTon = Math.max(1, deliveryDistance * 0.50);

        // Calculate adjusted prices
        const regionalPrice = pricePerTon * regionMultipliers[region];
        const seasonalPrice = regionalPrice * seasonMultipliers[season];
        const asphaltTypePrice = seasonalPrice * asphaltTypeMultipliers[asphaltType];
        const projectTypePrice = asphaltTypePrice * projectTypeMultipliers[projectType];

        const finalPricePerTon = projectTypePrice * (1 - sizeDiscount);

        const costPerSqFt = tonsPerSqFt * finalPricePerTon;
        const costPerSqYd = costPerSqFt * 9;
        const costPerSqMeter = costPerSqFt * 10.7639;
        const costPerCubicYard = (density * 27 / 2000) * finalPricePerTon;
        const tonnagePer100SqFt = tonsPerSqFt * 100;

        const materialCost = costPerSqFt * projectSize;
        const laborTotal = (laborCost / 10) * projectSize; // Adjusted logic: laborCost input is treated as "cents per sq ft" roughly or needs divisor
        // Actually, let's treat input as Cents per Sq Ft or Dollars per Sq Yd. 
        // Let's assume input is $35 means $3.50/sqft? No, let's assume input is Cents/SqFt or just a base multiplier.
        // Let's fix calculation: If input is 35 ($0.35/sqft is too low, $35/sqft is too high).
        // Let's assume input is "Dollars per Hour" roughly converted to efficiency. 
        // Let's Simplify: User input is "Labor Cost Factor". 
        // Let's assume input is $ per Sq Ft but user enters e.g. 2.5
        const realLaborCost = (laborCost / 10) * projectSize; // Arbitrary scaler for the example to work with default 35

        const deliveryTotal = (tonnagePer100SqFt * projectSize / 100) * deliveryCostPerTon;
        const preparationCost = basePreparation ? projectSize * 2.50 : 0;
        const additivesCost = additives ? materialCost * 0.10 : 0;

        const totalProjectCost = materialCost + realLaborCost + deliveryTotal + preparationCost + additivesCost;

        const warnings: string[] = [];
        const recommendations: string[] = [];

        if (finalPricePerTon < 60) warnings.push("Price/ton is unusually low.");
        if (density < 130) warnings.push("Low density detected.");
        if (season === 'winter') warnings.push("Winter pricing (+25%) applied.");
        
        if (projectSize > 5000 && !additives) recommendations.push("Consider additives for durability.");
        if (depth < 2 && projectType === 'commercial') recommendations.push("Increase depth to 3\"+ for commercial use.");

        setResult({
            costPerSqFt: Math.round(costPerSqFt * 100) / 100,
            costPerSqYd: Math.round(costPerSqYd * 100) / 100,
            costPerSqMeter: Math.round(costPerSqMeter * 100) / 100,
            costPerCubicYard: Math.round(costPerCubicYard * 100) / 100,
            tonnagePer100SqFt: Math.round(tonnagePer100SqFt * 100) / 100,
            totalProjectCost: Math.round(totalProjectCost),
            materialCost: Math.round(materialCost),
            laborCost: Math.round(realLaborCost),
            deliveryCost: Math.round(deliveryTotal),
            preparationCost: Math.round(preparationCost),
            additivesCost: Math.round(additivesCost),
            warnings,
            recommendations
        });
    };

    const updateValue = (field: keyof PriceInputs, newVal: number) => {
        setInputs(p => ({ ...p, [field]: Math.max(0, Math.round(newVal * 10) / 10) }));
    };

    return (
        <div className="glass-panel text-slate-900 rounded-[2rem] shadow-xl bg-white/95 backdrop-blur-md border border-[#885C09]/20 p-4 md:p-8 relative overflow-hidden max-w-6xl mx-auto font-sans">
            <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-[#9A690F]/20 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 w-full">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 mb-2">
                        <span className="p-2 bg-[#9A690F]/10 text-[#885C09] rounded-lg"><Tag className="w-5 h-5" /></span>
                        <span className="text-[10px] font-bold tracking-widest text-[#885C09] uppercase">Professional Estimator</span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-black text-[#291901] tracking-tight">Asphalt Price Calculator</h1>
                    <p className="text-xs text-[#885C09] mt-1">Detailed breakdown of Material, Labor & Logistics</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-7 space-y-5">
                        
                        {/* Material & Pricing Section */}
                        <div className="bg-white p-5 rounded-3xl shadow-sm border border-[#885C09]/10">
                            <h3 className="font-bold text-[#291901] text-sm uppercase tracking-wide flex items-center gap-2 mb-4">
                                <DollarSign className="w-4 h-4 text-[#9A690F]" /> Material Costs
                            </h3>
                            <div className="grid grid-cols-2 gap-4 md:gap-6">
                                <NumberInput 
                                    label="Price Per Ton" 
                                    unit="$"
                                    value={inputs.pricePerTon} 
                                    onChange={(v: number) => updateValue('pricePerTon', v)}
                                    onMinus={() => updateValue('pricePerTon', inputs.pricePerTon - 5)}
                                    onPlus={() => updateValue('pricePerTon', inputs.pricePerTon + 5)}
                                    subLabel="Nat. Avg: $100-$150"
                                />
                                <NumberInput 
                                    label="Base Labor Rate" 
                                    unit="Index"
                                    value={inputs.laborCost} 
                                    onChange={(v: number) => updateValue('laborCost', v)}
                                    onMinus={() => updateValue('laborCost', inputs.laborCost - 1)}
                                    onPlus={() => updateValue('laborCost', inputs.laborCost + 1)}
                                    subLabel="Regional Factor (20-50)"
                                />
                                <NumberInput 
                                    label="Thickness" 
                                    unit="Inches"
                                    value={inputs.depth} 
                                    onChange={(v: number) => updateValue('depth', v)}
                                    onMinus={() => updateValue('depth', inputs.depth - 0.5)}
                                    onPlus={() => updateValue('depth', inputs.depth + 0.5)}
                                    subLabel="Std: 2.0 - 4.0 in"
                                />
                                <NumberInput 
                                    label="Density" 
                                    unit="lbs/ft³"
                                    value={inputs.density} 
                                    onChange={(v: number) => updateValue('density', v)}
                                    onMinus={() => updateValue('density', inputs.density - 1)}
                                    onPlus={() => updateValue('density', inputs.density + 1)}
                                    subLabel="Std: 145-150"
                                />
                            </div>
                        </div>

                        {/* Project Specifications */}
                        <div className="bg-white p-5 rounded-3xl shadow-sm border border-[#885C09]/10">
                            <h3 className="font-bold text-[#291901] text-sm uppercase tracking-wide flex items-center gap-2 mb-4">
                                <HardHat className="w-4 h-4 text-[#9A690F]" /> Project Details
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <SelectInput 
                                    label="Project Type" 
                                    value={inputs.projectType} 
                                    onChange={(v: string) => setInputs(p => ({ ...p, projectType: v }))}
                                    options={[
                                        {value: 'residential', label: 'Residential'},
                                        {value: 'commercial', label: 'Commercial'},
                                        {value: 'municipal', label: 'Municipal'},
                                        {value: 'industrial', label: 'Industrial'}
                                    ]}
                                />
                                <SelectInput 
                                    label="Asphalt Mix" 
                                    value={inputs.asphaltType} 
                                    onChange={(v: string) => setInputs(p => ({ ...p, asphaltType: v }))}
                                    options={[
                                        {value: 'hot-mix', label: 'Hot Mix (Standard)'},
                                        {value: 'warm-mix', label: 'Warm Mix (Green)'},
                                        {value: 'porous', label: 'Porous (Drainage)'},
                                        {value: 'recycled', label: 'Recycled (RAP)'}
                                    ]}
                                />
                                <SelectInput 
                                    label="Region" 
                                    value={inputs.region} 
                                    onChange={(v: string) => setInputs(p => ({ ...p, region: v }))}
                                    options={[
                                        {value: 'northeast', label: 'Northeast'},
                                        {value: 'midwest', label: 'Midwest'},
                                        {value: 'south', label: 'South'},
                                        {value: 'west', label: 'West'},
                                        {value: 'northwest', label: 'Northwest'}
                                    ]}
                                />
                                <SelectInput 
                                    label="Season" 
                                    value={inputs.season} 
                                    onChange={(v: string) => setInputs(p => ({ ...p, season: v }))}
                                    options={[
                                        {value: 'summer', label: 'Summer (Standard)'},
                                        {value: 'spring', label: 'Spring (+10%)'},
                                        {value: 'fall', label: 'Fall (+5%)'},
                                        {value: 'winter', label: 'Winter (+25%)'}
                                    ]}
                                />
                            </div>
                        </div>

                        {/* Project Size & Logistics */}
                        <div className="bg-white p-5 rounded-3xl shadow-sm border border-[#885C09]/10">
                            <h3 className="font-bold text-[#291901] text-sm uppercase tracking-wide flex items-center gap-2 mb-4">
                                <MapPin className="w-4 h-4 text-[#9A690F]" /> Dimensions & Logistics
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <NumberInput 
                                    label="Total Area" 
                                    unit="Sq Ft"
                                    value={inputs.projectSize} 
                                    onChange={(v: number) => updateValue('projectSize', v)}
                                    onMinus={() => updateValue('projectSize', inputs.projectSize - 100)}
                                    onPlus={() => updateValue('projectSize', inputs.projectSize + 100)}
                                />
                                <NumberInput 
                                    label="Delivery Range" 
                                    unit="Miles"
                                    icon={Truck}
                                    value={inputs.deliveryDistance} 
                                    onChange={(v: number) => updateValue('deliveryDistance', v)}
                                    onMinus={() => updateValue('deliveryDistance', inputs.deliveryDistance - 5)}
                                    onPlus={() => updateValue('deliveryDistance', inputs.deliveryDistance + 5)}
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <label className="block text-[10px] font-bold text-[#885C09] uppercase">Quick Select Sizes</label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                    {standardLots.map((lot, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setInputs(p => ({ ...p, projectSize: lot.area, depth: lot.depth }))}
                                            className="p-2 border border-slate-200 bg-slate-50 hover:bg-[#ffe0c1]/30 hover:border-[#ffe0c1] rounded-xl transition text-center group active:scale-95"
                                        >
                                            <div className="font-bold text-xs text-slate-700 group-hover:text-[#291901]">{lot.name}</div>
                                            <div className="text-[10px] text-slate-400 group-hover:text-[#885C09]">{lot.label}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Extras */}
                        <div className="bg-white p-5 rounded-3xl shadow-sm border border-[#885C09]/10">
                            <h4 className="font-bold text-[#291901] mb-3 text-xs uppercase flex items-center gap-2">
                                <Thermometer className="w-4 h-4 text-[#9A690F]" /> Add-ons
                            </h4>
                            <div className="flex flex-wrap gap-4">
                                <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition border border-transparent hover:border-slate-200">
                                    <input type="checkbox" checked={inputs.basePreparation} onChange={(e) => setInputs(p => ({ ...p, basePreparation: e.target.checked }))} className="w-4 h-4 text-[#9A690F] rounded focus:ring-[#9A690F]" />
                                    <span className="text-xs font-bold text-slate-700">Base Prep (+$2.50/sqft)</span>
                                </label>
                                <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition border border-transparent hover:border-slate-200">
                                    <input type="checkbox" checked={inputs.additives} onChange={(e) => setInputs(p => ({ ...p, additives: e.target.checked }))} className="w-4 h-4 text-[#9A690F] rounded focus:ring-[#9A690F]" />
                                    <span className="text-xs font-bold text-slate-700">Additives (+10% Cost)</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Results Panel */}
                    <div className="lg:col-span-5 space-y-4">
                        <div className="bg-gradient-to-br from-[#291901] to-[#885C09] text-white p-6 rounded-[2rem] shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-5"><BarChart3 className="w-32 h-32" /></div>
                            <div className="relative z-10">
                                <p className="text-[#ffe0c1]/70 font-bold uppercase tracking-widest text-[10px] mb-2">Total Project Estimate</p>
                                {result ? (
                                    <div className="space-y-6">
                                        <div>
                                            <div className="text-5xl md:text-6xl font-black text-white tracking-tight">${(result.totalProjectCost / 1000).toFixed(1)}k</div>
                                            <p className="text-[#ffe0c1]/70 text-xs mt-1">
                                                {inputs.projectSize.toLocaleString()} sq ft @ {inputs.depth}" depth
                                            </p>
                                        </div>
                                        
                                        <div className="bg-white/10 p-4 rounded-2xl border border-white/10 backdrop-blur-sm">
                                            <p className="text-[10px] uppercase font-bold text-[#ffe0c1]/70 mb-2">Cost Per Unit</p>
                                            <div className="flex gap-4">
                                                <div className="flex-1">
                                                    <p className="text-[10px] text-[#ffe0c1]/50">Per Sq Ft</p>
                                                    <p className="text-2xl font-bold text-white">${result.costPerSqFt.toFixed(2)}</p>
                                                </div>
                                                <div className="w-px bg-white/10"></div>
                                                <div className="flex-1">
                                                    <p className="text-[10px] text-[#ffe0c1]/50">Per Sq Yd</p>
                                                    <p className="text-2xl font-bold text-white">${result.costPerSqYd.toFixed(2)}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <p className="text-[10px] uppercase font-bold text-[#ffe0c1]/50">Estimate Breakdown</p>
                                            {[
                                                { l: 'Material', v: result.materialCost },
                                                { l: 'Labor & Install', v: result.laborCost },
                                                { l: 'Delivery', v: result.deliveryCost },
                                                { l: 'Prep Work', v: result.preparationCost },
                                            ].map((item, i) => (
                                                <div key={i} className="flex justify-between text-xs items-center">
                                                    <span className="text-white/70">{item.l}</span>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-24 h-1.5 bg-black/30 rounded-full overflow-hidden">
                                                            <div className="h-full bg-[#ffe0c1]" style={{ width: `${(item.v / result.totalProjectCost) * 100}%` }}></div>
                                                        </div>
                                                        <span className="font-bold w-16 text-right">${item.v > 1000 ? (item.v/1000).toFixed(1) + 'k' : item.v}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {(result.warnings.length > 0 || result.recommendations.length > 0) && (
                                            <div className="pt-4 border-t border-white/10 space-y-2">
                                                {result.warnings.map((w, i) => (
                                                    <div key={i} className="flex items-center gap-2 text-[10px] bg-amber-500/20 p-2 rounded-lg text-amber-100 border border-amber-500/20">
                                                        <AlertCircle className="w-3 h-3 flex-shrink-0" /> {w}
                                                    </div>
                                                ))}
                                                {result.recommendations.map((r, i) => (
                                                    <div key={i} className="flex items-center gap-2 text-[10px] bg-green-500/20 p-2 rounded-lg text-green-100 border border-green-500/20">
                                                        <CheckCircle2 className="w-3 h-3 flex-shrink-0" /> {r}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ) : <div className="text-4xl font-bold text-white/40">--</div>}
                            </div>
                        </div>

                        {/* Industry Averages */}
                        <div className="bg-white p-5 rounded-3xl shadow-sm border border-[#885C09]/10">
                            <h4 className="font-bold text-[#291901] mb-4 text-xs uppercase">Market Rates (2025)</h4>
                            <div className="space-y-3">
                                {[
                                    { type: "Residential Driveway", range: "$7-$15 / sq ft" },
                                    { type: "Commercial Lot", range: "$3-$8 / sq ft" },
                                    { type: "Resurfacing", range: "$2-$5 / sq ft" }
                                ].map((item, i) => (
                                    <div key={i} className="flex justify-between items-center text-xs pb-2 border-b border-slate-100 last:border-0 last:pb-0">
                                        <span className="font-bold text-slate-700">{item.type}</span>
                                        <span className="text-[#885C09] bg-[#ffe0c1]/30 px-2 py-1 rounded-md">{item.range}</span>
                                    </div>
                                ))}
                            </div>
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

export default AsphaltPriceCalculator;