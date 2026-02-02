import React, { useState, useEffect } from 'react';
import {
    ThermometerSun,
    Droplets,
    Zap,
    CheckCircle2,
    AlertOctagon,
    Info,
    TrendingUp,
    Minus,
    Plus
} from 'lucide-react';

// ----------------------------------------------------------------------
// TYPES
// ----------------------------------------------------------------------

type UnitSystem = 'imperial' | 'metric';
type UseCase = 'weekend' | 'event' | 'maintain';
type CoverType = 'none' | 'night' | 'fulltime';
type PoolType = 'inground' | 'aboveground';

export interface HeatPumpInputs {
    poolVolume: number;
    unitSystem: UnitSystem;
    currentTemp: number; // °F
    targetTemp: number; // °F
    avgAirTemp: number; // °F - ambient air temperature
    coverType: CoverType;
    poolType: PoolType;
    useCase: UseCase;
}

export interface HeatPumpResult {
    minBTU: number;
    recommendedBTU: number;
    maxBTU: number;
    heatUpTimeHours: number;
    estimatedCOP: number;
    electricalDraw: number; // kW
    kwhPerDay: number;
    warnings: string[];
    notes: string[];
}

// ----------------------------------------------------------------------
// HELPERS
// ----------------------------------------------------------------------

const SelectionButton = ({ selected, onClick, label, subLabel, icon: Icon }: any) => (
    <button
        onClick={onClick}
        className={`relative p-3 rounded-xl border-2 text-left transition-all duration-200 w-full touch-manipulation
      ${selected
                ? 'border-orange-500 bg-orange-50/50 ring-2 ring-orange-200 ring-offset-1 z-10'
                : 'border-slate-100 bg-slate-50 hover:bg-slate-100 text-slate-500'}`}
    >
        <div className="flex justify-between items-start">
            <div className="flex-1">
                <div className={`font-bold text-sm ${selected ? 'text-orange-900' : 'text-slate-700'}`}>{label}</div>
                {subLabel && <div className={`text-xs mt-0.5 ${selected ? 'text-orange-700' : 'text-slate-400'}`}>{subLabel}</div>}
            </div>
            {selected && <CheckCircle2 className="w-5 h-5 text-orange-500 flex-shrink-0 ml-2" />}
        </div>
    </button>
);

// ----------------------------------------------------------------------
// MAIN COMPONENT
// ----------------------------------------------------------------------

const PoolHeatPumpCalculator: React.FC = () => {
    const [inputs, setInputs] = useState<HeatPumpInputs>({
        poolVolume: 15000,
        unitSystem: 'imperial',
        currentTemp: 70,
        targetTemp: 82,
        avgAirTemp: 75,
        coverType: 'night',
        poolType: 'inground',
        useCase: 'maintain'
    });

    const [result, setResult] = useState<HeatPumpResult | null>(null);

    useEffect(() => {
        calculateSize();
    }, [inputs]);

    const calculateSize = () => {
        const { poolVolume, currentTemp, targetTemp, avgAirTemp, coverType, poolType, useCase } = inputs;

        // 1. BASE BTU CALCULATION
        // Standard sizing: 50k BTU per 10k gallons as baseline
        let baseBTU = (poolVolume / 10000) * 50000;

        // 2. USE CASE MODIFIER
        let useCaseMultiplier = 1.0;
        switch (useCase) {
            case 'weekend':
                useCaseMultiplier = 0.85; // Slower, more efficient
                break;
            case 'event':
                useCaseMultiplier = 1.4; // Fast recovery needed
                break;
            case 'maintain':
                useCaseMultiplier = 1.0; // Standard
                break;
        }

        // 3. COVER IMPACT
        let coverMultiplier = 1.0;
        switch (coverType) {
            case 'none':
                coverMultiplier = 1.6; // Massive heat loss, need more power
                break;
            case 'night':
                coverMultiplier = 1.15; // Some protection
                break;
            case 'fulltime':
                coverMultiplier = 0.9; // Excellent retention
                break;
        }

        // 4. POOL TYPE
        let poolTypeMultiplier = 1.0;
        if (poolType === 'aboveground') {
            poolTypeMultiplier = 1.15; // More surface area exposed to air
        }

        // 5. AIR TEMP DERATING
        // Heat pumps lose efficiency below 60°F and above 95°F
        let airTempMultiplier = 1.0;
        if (avgAirTemp < 60) {
            airTempMultiplier = 1.3; // Need larger unit to compensate
        } else if (avgAirTemp < 70) {
            airTempMultiplier = 1.15;
        } else if (avgAirTemp > 90) {
            airTempMultiplier = 1.1; // Slight efficiency loss at very high temps
        }

        // COMBINED CALCULATION
        const calculatedBTU = baseBTU * useCaseMultiplier * coverMultiplier * poolTypeMultiplier * airTempMultiplier;

        // 6. ROUND TO STANDARD SIZES
        const standardSizes = [50000, 65000, 75000, 85000, 95000, 110000, 125000, 140000];

        let recommendedBTU = 85000;
        for (const size of standardSizes) {
            if (size >= calculatedBTU) {
                recommendedBTU = size;
                break;
            }
        }
        if (calculatedBTU > 140000) recommendedBTU = 140000;

        // Create a range
        const minBTU = Math.max(50000, recommendedBTU - 15000);
        const maxBTU = Math.min(140000, recommendedBTU + 15000);

        // 7. HEAT UP TIME CALCULATION
        const deltaTemp = Math.max(0, targetTemp - currentTemp);
        const energyRequired = poolVolume * 8.34 * deltaTemp; // BTUs needed

        // Adjust output based on air temp (COP varies)
        let effectiveOutput = recommendedBTU;
        if (avgAirTemp < 60) effectiveOutput *= 0.7; // Significant loss
        else if (avgAirTemp < 70) effectiveOutput *= 0.85;

        const heatUpTimeHours = energyRequired / effectiveOutput;

        // 8. COP ESTIMATION (Coefficient of Performance)
        // COP varies with air temp. At 80°F air, COP is typically 5.0-6.0
        let estimatedCOP = 5.5;
        if (avgAirTemp < 50) estimatedCOP = 3.0;
        else if (avgAirTemp < 60) estimatedCOP = 4.0;
        else if (avgAirTemp < 70) estimatedCOP = 4.8;
        else if (avgAirTemp > 85) estimatedCOP = 6.0;

        // 9. ELECTRICAL DRAW
        // BTU/hr ÷ 3412 = kW (if COP = 1.0)
        // Actual kW = (BTU/hr ÷ 3412) ÷ COP
        const electricalDraw = (recommendedBTU / 3412) / estimatedCOP;

        // Daily runtime estimate (8-12 hours for maintenance)
        const dailyRuntime = useCase === 'maintain' ? 8 : 12;
        const kwhPerDay = electricalDraw * dailyRuntime;

        // 10. WARNINGS & NOTES
        const warnings: string[] = [];
        const notes: string[] = [];

        if (coverType === 'none') {
            warnings.push("No cover = 50-70% heat loss overnight. Unit may struggle to maintain temp.");
        }
        if (avgAirTemp < 55) {
            warnings.push("Air temp <55°F: Heat pump efficiency drops significantly. Consider gas backup.");
        }
        if (poolVolume > 35000) {
            warnings.push("Large pool (>35k gal): Consider dual units or hybrid gas/electric system.");
        }
        if (poolType === 'aboveground') {
            notes.push("Above-ground pools lose heat faster due to exposed sides.");
        } else {
            notes.push("Inground pools retain heat better than above-ground.");
        }
        if (useCase === 'event') {
            notes.push("Fast heating mode: Expect higher electrical costs during heat-up.");
        }

        notes.push(`Rated @ 80°F air / 80% RH. Actual output varies with conditions.`);
        notes.push("Spring/Fall heating may take 2-3× longer due to lower air temps.");

        if (coverType === 'fulltime') {
            notes.push("Solar cover reduces heat loss by 50-70% (day + night).");
        } else if (coverType === 'night') {
            notes.push("Night cover helps, but daytime evaporation still significant.");
        }

        setResult({
            minBTU,
            recommendedBTU,
            maxBTU,
            heatUpTimeHours: Math.round(heatUpTimeHours * 10) / 10,
            estimatedCOP: Math.round(estimatedCOP * 10) / 10,
            electricalDraw: Math.round(electricalDraw * 10) / 10,
            kwhPerDay: Math.round(kwhPerDay),
            warnings,
            notes
        });
    };

    const toggleUnit = () => {
        setInputs(prev => {
            const newSystem = prev.unitSystem === 'imperial' ? 'metric' : 'imperial';
            const newVolume = prev.unitSystem === 'imperial'
                ? prev.poolVolume * 3.78541
                : prev.poolVolume * 0.264172;
            return {
                ...prev,
                unitSystem: newSystem,
                poolVolume: Math.round(newVolume)
            };
        });
    };

    return (
        <div className="glass-panel text-slate-900 rounded-[2rem] shadow-xl bg-white/90 backdrop-blur-md border border-slate-200 p-4 md:p-8 relative overflow-hidden max-w-6xl mx-auto">
            <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-orange-400/20 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 w-full">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 mb-2">
                        <span className="p-2 bg-orange-100 text-orange-700 rounded-lg"><ThermometerSun className="w-6 h-6" /></span>
                        <span className="text-xs font-bold tracking-widest text-slate-400 uppercase">Pool Tools</span>
                    </div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Heat Pump Sizing Calculator</h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* === LEFT COLUMN: INPUTS === */}
                    <div className="lg:col-span-7 space-y-4">

                        {/* 1. POOL VOLUME */}
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-slate-700 flex items-center gap-2 text-sm uppercase">
                                    <Droplets className="w-4 h-4 text-orange-500" /> Pool Volume
                                </h3>
                                <button onClick={toggleUnit} className="text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1 rounded-full transition-colors">
                                    {inputs.unitSystem === 'imperial' ? 'US Gallons' : 'Metric'}
                                </button>
                            </div>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={inputs.poolVolume}
                                    onChange={(e) => setInputs(p => ({ ...p, poolVolume: parseFloat(e.target.value) || 0 }))}
                                    className="w-full pl-4 pr-16 py-3 bg-slate-50 border-0 rounded-xl font-bold text-2xl text-slate-800 ring-1 ring-slate-200 focus:ring-2 focus:ring-orange-500 transition-all text-center"
                                />
                                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                                    {inputs.unitSystem === 'imperial' ? 'GAL' : 'L'}
                                </span>
                            </div>
                            <input
                                type="range"
                                min="100"
                                max="50000"
                                step="100"
                                value={inputs.poolVolume}
                                onChange={(e) => setInputs(p => ({ ...p, poolVolume: parseFloat(e.target.value) || 0 }))}
                                className="w-full mt-3 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                            />
                        </div>

                        {/* 2. TEMPERATURE SETTINGS */}
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                            <h3 className="font-bold text-slate-700 flex items-center gap-2 mb-4 text-sm uppercase">
                                <ThermometerSun className="w-4 h-4 text-orange-500" /> Temperature Profile
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Current Water Temp</label>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setInputs(p => ({ ...p, currentTemp: Math.max(32, p.currentTemp - 1) }))}
                                            className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 active:scale-95 transition-all"
                                        >
                                            <Minus className="w-5 h-5" />
                                        </button>
                                        <input
                                            type="number"
                                            value={inputs.currentTemp}
                                            onChange={(e) => setInputs(p => ({ ...p, currentTemp: parseFloat(e.target.value) || 0 }))}
                                            className="flex-1 bg-slate-50 rounded-lg p-2 font-bold text-lg text-slate-700 border-none text-center"
                                        />
                                        <button
                                            onClick={() => setInputs(p => ({ ...p, currentTemp: Math.min(100, p.currentTemp + 1) }))}
                                            className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 active:scale-95 transition-all"
                                        >
                                            <Plus className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <span className="text-[10px] text-slate-400 block text-center mt-1">°F</span>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Target Water Temp</label>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setInputs(p => ({ ...p, targetTemp: Math.max(32, p.targetTemp - 1) }))}
                                            className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 active:scale-95 transition-all"
                                        >
                                            <Minus className="w-5 h-5" />
                                        </button>
                                        <input
                                            type="number"
                                            value={inputs.targetTemp}
                                            onChange={(e) => setInputs(p => ({ ...p, targetTemp: parseFloat(e.target.value) || 0 }))}
                                            className="flex-1 bg-slate-50 rounded-lg p-2 font-bold text-lg text-orange-600 border-none text-center"
                                        />
                                        <button
                                            onClick={() => setInputs(p => ({ ...p, targetTemp: Math.min(110, p.targetTemp + 1) }))}
                                            className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 active:scale-95 transition-all"
                                        >
                                            <Plus className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <span className="text-[10px] text-slate-400 block text-center mt-1">°F</span>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Avg Air Temp</label>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setInputs(p => ({ ...p, avgAirTemp: Math.max(30, p.avgAirTemp - 1) }))}
                                            className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 active:scale-95 transition-all"
                                        >
                                            <Minus className="w-5 h-5" />
                                        </button>
                                        <input
                                            type="number"
                                            value={inputs.avgAirTemp}
                                            onChange={(e) => setInputs(p => ({ ...p, avgAirTemp: parseFloat(e.target.value) || 0 }))}
                                            className="flex-1 bg-slate-50 rounded-lg p-2 font-bold text-lg text-slate-700 border-none text-center"
                                        />
                                        <button
                                            onClick={() => setInputs(p => ({ ...p, avgAirTemp: Math.min(120, p.avgAirTemp + 1) }))}
                                            className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 active:scale-95 transition-all"
                                        >
                                            <Plus className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <span className="text-[10px] text-slate-400 block text-center mt-1">°F</span>
                                </div>
                            </div>
                        </div>

                        {/* 3. USE CASE */}
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                            <h3 className="font-bold text-slate-700 flex items-center gap-2 mb-4 text-sm uppercase">
                                <Zap className="w-4 h-4 text-orange-500" /> Heating Goal
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                <SelectionButton
                                    label="Weekend Use" subLabel="Slow & Efficient"
                                    selected={inputs.useCase === 'weekend'}
                                    onClick={() => setInputs(p => ({ ...p, useCase: 'weekend' }))}
                                />
                                <SelectionButton
                                    label="Maintain Temp" subLabel="Standard"
                                    selected={inputs.useCase === 'maintain'}
                                    onClick={() => setInputs(p => ({ ...p, useCase: 'maintain' }))}
                                />
                                <SelectionButton
                                    label="Event Heating" subLabel="Fast Recovery"
                                    selected={inputs.useCase === 'event'}
                                    onClick={() => setInputs(p => ({ ...p, useCase: 'event' }))}
                                />
                            </div>
                        </div>

                        {/* 4. COVER & POOL TYPE */}
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                            <h3 className="font-bold text-slate-700 mb-4 text-sm uppercase">Cover & Pool Type</h3>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">Solar Cover Usage</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        <SelectionButton
                                            label="None" subLabel="No Cover"
                                            selected={inputs.coverType === 'none'}
                                            onClick={() => setInputs(p => ({ ...p, coverType: 'none' }))}
                                        />
                                        <SelectionButton
                                            label="Night Only" subLabel="Partial"
                                            selected={inputs.coverType === 'night'}
                                            onClick={() => setInputs(p => ({ ...p, coverType: 'night' }))}
                                        />
                                        <SelectionButton
                                            label="Full-Time" subLabel="Best"
                                            selected={inputs.coverType === 'fulltime'}
                                            onClick={() => setInputs(p => ({ ...p, coverType: 'fulltime' }))}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">Pool Type</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            onClick={() => setInputs(p => ({ ...p, poolType: 'inground' }))}
                                            className={`p-3 rounded-xl border-2 font-bold text-sm transition-all ${inputs.poolType === 'inground' ? 'bg-orange-50 border-orange-500 text-orange-700' : 'bg-slate-50 border-slate-100 text-slate-500'}`}
                                        >
                                            Inground
                                        </button>
                                        <button
                                            onClick={() => setInputs(p => ({ ...p, poolType: 'aboveground' }))}
                                            className={`p-3 rounded-xl border-2 font-bold text-sm transition-all ${inputs.poolType === 'aboveground' ? 'bg-orange-50 border-orange-500 text-orange-700' : 'bg-slate-50 border-slate-100 text-slate-500'}`}
                                        >
                                            Above Ground
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* === RIGHT COLUMN: RESULTS === */}
                    <div className="lg:col-span-5 space-y-4">
                        <div className="bg-slate-900 text-white p-6 md:p-8 rounded-3xl shadow-2xl relative overflow-hidden">
                            <div className="relative z-10">
                                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-2">Recommended Size Range</p>

                                {result && (
                                    <>
                                        <div className="mb-6">
                                            <div className="flex items-baseline gap-2 mb-1">
                                                <span className="text-5xl font-black tracking-tighter text-orange-400">
                                                    {Math.round(result.recommendedBTU / 1000)}k
                                                </span>
                                                <span className="text-2xl font-bold text-slate-400">BTU</span>
                                            </div>
                                            <div className="text-sm text-slate-400 mt-2">
                                                Range: {Math.round(result.minBTU / 1000)}k - {Math.round(result.maxBTU / 1000)}k BTU
                                            </div>
                                        </div>

                                        {/* Stats Grid */}
                                        <div className="grid grid-cols-2 gap-3 mb-4">
                                            <div className="bg-white/10 p-3 rounded-xl border border-white/5">
                                                <p className="text-[9px] font-bold text-slate-400 uppercase">Heat Up Time</p>
                                                <p className="text-lg font-bold text-white">{result.heatUpTimeHours} <span className="text-xs font-normal opacity-50">hrs</span></p>
                                            </div>
                                            <div className="bg-white/10 p-3 rounded-xl border border-white/5">
                                                <p className="text-[9px] font-bold text-slate-400 uppercase">Est. COP</p>
                                                <p className="text-lg font-bold text-emerald-400">{result.estimatedCOP}</p>
                                            </div>
                                            <div className="bg-white/10 p-3 rounded-xl border border-white/5">
                                                <p className="text-[9px] font-bold text-slate-400 uppercase">Power Draw</p>
                                                <p className="text-lg font-bold text-white">{result.electricalDraw} <span className="text-xs font-normal opacity-50">kW</span></p>
                                            </div>
                                            <div className="bg-white/10 p-3 rounded-xl border border-white/5">
                                                <p className="text-[9px] font-bold text-slate-400 uppercase">Daily kWh</p>
                                                <p className="text-lg font-bold text-amber-300">{result.kwhPerDay}</p>
                                            </div>
                                        </div>

                                        <div className="h-px bg-white/10 w-full my-4"></div>

                                        {/* Warnings */}
                                        {result.warnings.length > 0 && (
                                            <div className="space-y-2 mb-4">
                                                {result.warnings.map((w, i) => (
                                                    <div key={i} className="flex gap-2 text-xs text-rose-200 bg-rose-900/40 p-2 rounded-lg border border-rose-900/50">
                                                        <AlertOctagon className="w-4 h-4 flex-shrink-0" />
                                                        <span className="leading-snug">{w}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Notes */}
                                        <div className="space-y-2">
                                            <h4 className="flex items-center gap-2 text-[10px] font-bold text-orange-400 uppercase mb-2">
                                                <Info className="w-3 h-3" /> Important Notes
                                            </h4>
                                            {result.notes.map((n, i) => (
                                                <div key={i} className="flex gap-2 text-xs text-slate-300 items-start leading-snug">
                                                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-1.5 flex-shrink-0"></div>
                                                    <span>{n}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default PoolHeatPumpCalculator;
