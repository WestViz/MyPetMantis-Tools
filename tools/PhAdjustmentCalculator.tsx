import React, { useState, useEffect } from 'react';
import { useIframeResize } from '../hooks/useIframeResize';
import {
    Beaker,
    ArrowUpCircle,
    ArrowDownCircle,
    CheckCircle2,
    Minus,
    Plus,
    FlaskConical,
    AlertTriangle,
    Thermometer,
    Waves,
    Info,
    Shield
} from 'lucide-react';

// ----------------------------------------------------------------------
// TYPES & INTERFACES
// ----------------------------------------------------------------------

type PoolSurface = 'plaster' | 'vinyl' | 'fiberglass';
type ChemicalType =
    | 'muriatic_31'      // 31.45% HCl
    | 'muriatic_15'      // ~14.5-15% HCl
    | 'dry_acid'         // Sodium Bisulfate
    | 'soda_ash'         // Sodium Carbonate
    | 'borax'            // Sodium Tetraborate
    | 'aeration';        // Air

interface PhInputs {
    poolVolume: number; // gallons
    currentPh: number;
    targetPh: number;
    alkalinity: number; // ppm
    waterTemp: number;  // F
    surfaceType: PoolSurface;
    preferredAcid: ChemicalType; // For lowering
    preferredBase: ChemicalType; // For raising
}

interface PhResult {
    adjustmentType: 'raise' | 'lower' | 'balanced';
    chemicalName: string;
    doseAmount: number;     // Primary unit value
    doseUnit: string;       // "fl oz", "oz weight", "lbs"
    secondaryAmount?: number;
    secondaryUnit?: string;
    alkalinityChange: number; // ppm
    isSplitDose: boolean;
    doses?: number;         // If split, how many
    amountPerDose?: number; // Amount per split dose
    warnings: string[];
    instructions: string[];
    surfaceAdvice?: string; // Specific advice for the surface type
}

// ----------------------------------------------------------------------
// CONSTANTS
// ----------------------------------------------------------------------

const SAFE_PH_MIN = 7.2;
const SAFE_PH_MAX = 7.8;

// ----------------------------------------------------------------------
// COMPONENTS
// ----------------------------------------------------------------------

const StepButton = ({ onClick, icon: Icon, disabled = false }: { onClick: () => void, icon: any, disabled?: boolean }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all touch-manipulation"
    >
        <Icon className="w-5 h-5" />
    </button>
);

const SelectionButton = ({ selected, onClick, label, subLabel }: { selected: boolean, onClick: () => void, label: string, subLabel?: string }) => (
    <button
        onClick={onClick}
        className={`relative p-3 rounded-xl border-2 text-left transition-all duration-200 w-full touch-manipulation flex flex-col justify-center min-h-[70px]
      ${selected
                ? 'border-indigo-500 bg-indigo-50/50 ring-2 ring-indigo-200 ring-offset-1 z-10'
                : 'border-slate-100 bg-slate-50 hover:bg-slate-100 text-slate-500'}`}
    >
        <div className={`font-bold text-sm ${selected ? 'text-indigo-900' : 'text-slate-700'}`}>{label}</div>
        {subLabel && <div className={`text-xs ${selected ? 'text-indigo-700' : 'text-slate-400'}`}>{subLabel}</div>}
        {selected && <div className="absolute top-2 right-2 text-indigo-500"><CheckCircle2 className="w-4 h-4" /></div>}
    </button>
);

// ----------------------------------------------------------------------
// MAIN LOGIC
// ----------------------------------------------------------------------

const calculatePhChange = (inputs: PhInputs): PhResult => {
    const { poolVolume, currentPh, targetPh, alkalinity, preferredAcid, preferredBase, surfaceType } = inputs;
    const deltaPh = targetPh - currentPh;
    const absDelta = Math.abs(deltaPh);
    const volumeFactor = poolVolume / 10000;

    // Safety & Warnings
    const warnings: string[] = [];
    const instructions: string[] = [];
    let surfaceAdvice = "";

    // Surface Advice Logic
    if (surfaceType === 'plaster') {
        if (deltaPh < 0) surfaceAdvice = "Avoid dropping pH below 7.2 to protect plaster finish.";
    } else {
        // Vinyl/Fiberglass
        if (deltaPh < 0) surfaceAdvice = "Acid demand may be lower on vinyl/fiberglass—retest before second dose.";
    }

    if (targetPh < 7.2 || targetPh > 7.8) warnings.push("Target pH is outside the ideal range (7.2 - 7.8).");
    if (alkalinity < 80) warnings.push("Low Alkalinity (<80 ppm) causes rapid pH swings. Adjust Alkalinity first?");
    if (alkalinity > 150) warnings.push("High Alkalinity resists pH change. You may need larger/multiple doses.");

    // Balanced?
    if (absDelta < 0.05) {
        return {
            adjustmentType: 'balanced',
            chemicalName: 'None',
            doseAmount: 0,
            doseUnit: '',
            alkalinityChange: 0,
            isSplitDose: false,
            warnings: [],
            instructions: ["Water is balanced. Maintain circulation."]
        };
    }

    const taRatio = alkalinity / 100; // Normalized to 100ppm standard

    let chemicalName = "";
    let doseAmount = 0;
    let doseUnit = "oz";
    let taChange = 0;

    if (deltaPh < 0) {
        // --- LOWERING pH ---
        instructions.push("Pump must be running.");
        instructions.push("Add to deep end or in front of return jet.");

        let acidOz31 = (absDelta / 0.2) * 12 * taRatio * volumeFactor;

        if (preferredAcid === 'muriatic_31') {
            chemicalName = "Muriatic Acid (Hydrochloric Acid, 31.45%)";
            doseAmount = acidOz31;
            doseUnit = "fl oz";
            // Corrected TA drop estimate: ~50% of previous estimate
            // 1 gallon muriatic drops TA roughly 30ppm in 10k gallons? 
            // 1 gallon = 128oz. Our dose is usually small (e.g. 20oz). 
            // 20/128 * 30ppm = ~5ppm drop. 
            // Previous logic was -(dose / VolFactor) * 1.5. If dose 20, VF=1 -> -30. Too high.
            // New logic: Approximately 2 ppm drop per quart (32oz) per 10k gal? 
            // Better heuristic: 1 fl oz muriatic lowers TA by ~0.5 ppm in 10k gal? 
            // Let's use: doseAmount * 0.6 / VolumeFactor.
            taChange = -(doseAmount * 0.5 / volumeFactor);
            instructions.push("Fumes are corrosive and harmful if inhaled. Stand upwind.");
        } else if (preferredAcid === 'muriatic_15') {
            chemicalName = "Muriatic Acid (15%)";
            doseAmount = acidOz31 * 2;
            doseUnit = "fl oz";
            taChange = -(doseAmount / 2 * 0.5 / volumeFactor);
            instructions.push("Safer than full strength, but still handle with care.");
        } else if (preferredAcid === 'dry_acid') {
            chemicalName = "Dry Acid (Sodium Bisulfate)";
            doseAmount = acidOz31 * 1.6;
            doseUnit = "oz weight";
            // Dry acid impacts TA roughly same as muriatic per acid equivalent
            taChange = -(doseAmount * 0.4 / volumeFactor);
            instructions.push("Pre-dissolve in a bucket of water before adding.");

            if (inputs.surfaceType === 'plaster') {
                warnings.push("Dry acid can etch plaster if allowed to settle. Dissolve completely!");
            }
        }
    } else {
        // --- RAISING pH ---
        instructions.push("Pump must be running.");

        if (preferredBase === 'aeration') {
            return {
                adjustmentType: 'raise',
                chemicalName: "Aeration (Air)",
                doseAmount: 0,
                doseUnit: "Hours",
                alkalinityChange: 0,
                isSplitDose: false,
                warnings: ["Slow process. Takes hours or days."],
                instructions: ["Point return jets up to break surface.", "Turn on waterfalls/spillways.", "Raises pH without increasing TA."],
                surfaceAdvice
            };
        }

        let baseOzStandard = (absDelta / 0.2) * 6 * taRatio * volumeFactor;

        if (preferredBase === 'soda_ash') {
            chemicalName = "Soda Ash (Sodium Carbonate)";
            doseAmount = baseOzStandard;
            doseUnit = "oz weight";
            // Soda Ash raises TA significantly.
            // 1 lb (16oz) raises TA by ~12 ppm in 10k gal.
            // Rate: ~0.8 ppm per oz per 10k.
            taChange = (doseAmount * 0.8 / volumeFactor);
            instructions.push("Pre-dissolve in bucket to avoid clouding.");
        } else if (preferredBase === 'borax') {
            chemicalName = "Borax (20 Mule Team)";
            doseAmount = (absDelta / 0.2) * 20 * taRatio * volumeFactor;
            doseUnit = "oz weight";
            // Borax raises TA very slightly. 
            taChange = (doseAmount * 0.1 / volumeFactor);
            instructions.push("Add through skimmer or pre-dissolve.");
        }
    }

    // Split Dose Logic
    let isSplitDose = false;
    let doses = 1;
    let amountPerDose = doseAmount;

    // Warning Limits (Heuristics)
    const MAX_ACID_OZ = 32 * volumeFactor; // Max 1 quart per 10k gal at a time
    if (chemicalName.includes("Muriatic") && doseAmount > MAX_ACID_OZ) {
        isSplitDose = true;
        doses = Math.ceil(doseAmount / MAX_ACID_OZ);
        amountPerDose = doseAmount / doses;
        // Warnings handled by specific card now
    }

    const MAX_DRY_OZ = 48 * volumeFactor;
    if (doseUnit === "oz weight" && doseAmount > MAX_DRY_OZ) {
        isSplitDose = true;
        doses = Math.ceil(doseAmount / MAX_DRY_OZ);
        amountPerDose = doseAmount / doses;
    }

    // Secondary Units (lbs / gallons)
    let secondaryAmount = undefined;
    let secondaryUnit = undefined;

    if (doseUnit === "oz weight" && doseAmount > 16) {
        secondaryAmount = doseAmount / 16;
        secondaryUnit = "lbs";
    }
    if (doseUnit === "fl oz" && doseAmount > 128) {
        secondaryAmount = doseAmount / 128;
        secondaryUnit = "gallons";
    }

    return {
        adjustmentType: deltaPh < 0 ? 'lower' : 'raise',
        chemicalName,
        doseAmount: Math.round(doseAmount * 10) / 10,
        doseUnit,
        secondaryAmount: secondaryAmount ? Math.round(secondaryAmount * 100) / 100 : undefined,
        secondaryUnit,
        alkalinityChange: Math.round(taChange),
        isSplitDose,
        doses,
        amountPerDose: Math.round(amountPerDose * 10) / 10,
        warnings,
        instructions,
        surfaceAdvice
    };
};


// ----------------------------------------------------------------------
// MAIN REACT COMPONENT
// ----------------------------------------------------------------------

const PhAdjustmentCalculator: React.FC = () => {
    useIframeResize();

    const [inputs, setInputs] = useState<PhInputs>({
        poolVolume: 15000,
        currentPh: 7.8,
        targetPh: 7.4,
        alkalinity: 100,
        waterTemp: 80,
        surfaceType: 'plaster',
        preferredAcid: 'muriatic_31',
        preferredBase: 'borax'
    });

    const [result, setResult] = useState<PhResult | null>(null);

    useEffect(() => {
        setResult(calculatePhChange(inputs));
    }, [inputs]);

    const handleUpdate = (key: keyof PhInputs, val: any) => {
        setInputs(prev => ({ ...prev, [key]: val }));
    };

    const isRaising = inputs.targetPh > inputs.currentPh;
    const isLowering = inputs.targetPh < inputs.currentPh;

    return (
        <div className="glass-panel text-slate-900 rounded-[2rem] shadow-xl bg-white/90 backdrop-blur-md border border-slate-200 p-4 md:p-8 relative overflow-hidden max-w-5xl mx-auto">

            {/* Dynamic Background */}
            <div className={`absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 rounded-full blur-3xl pointer-events-none transition-all duration-1000
                ${result?.adjustmentType === 'lower' ? 'bg-rose-500/10' : result?.adjustmentType === 'raise' ? 'bg-indigo-500/10' : 'bg-emerald-500/10'}`}></div>

            <div className="relative z-10 w-full">
                {/* Header - Compact & Inline */}
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">Precision pH Adjuster</h1>
                        <p className="text-slate-500 text-[10px] font-medium uppercase tracking-wider">Chemical Dosing Engine</p>
                    </div>
                    <div className={`p-2 rounded-xl transition-colors ${result?.adjustmentType === 'lower' ? 'bg-rose-100 text-rose-700' : result?.adjustmentType === 'raise' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {result?.adjustmentType === 'lower' && <ArrowDownCircle className="w-6 h-6 md:w-8 md:h-8" />}
                        {result?.adjustmentType === 'raise' && <ArrowUpCircle className="w-6 h-6 md:w-8 md:h-8" />}
                        {result?.adjustmentType === 'balanced' && <CheckCircle2 className="w-6 h-6 md:w-8 md:h-8" />}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

                    {/* === LEFT COLUMN: INPUTS === */}
                    <div className="lg:col-span-7 space-y-3">

                        {/* 1. CORE INPUTS */}
                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                            <div className="flex items-center gap-2 mb-3">
                                <Waves className="w-4 h-4 text-slate-400" />
                                <h3 className="font-bold text-slate-700 text-sm">Pool Profile</h3>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-3 gap-3">
                                    {/* Volume */}
                                    <div className="col-span-3 sm:col-span-1">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Volume</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                value={inputs.poolVolume}
                                                onChange={(e) => handleUpdate('poolVolume', parseFloat(e.target.value) || 0)}
                                                className="w-full bg-slate-50 rounded-lg text-center font-bold text-lg text-slate-800 border-none focus:ring-2 focus:ring-indigo-100 p-1.5"
                                            />
                                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 pointer-events-none">gal</span>
                                        </div>
                                    </div>

                                    {/* TA */}
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Alkalinity</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                value={inputs.alkalinity}
                                                onChange={(e) => handleUpdate('alkalinity', parseFloat(e.target.value) || 0)}
                                                className="w-full bg-slate-50 rounded-lg text-center font-bold text-lg text-slate-800 border-none focus:ring-2 focus:ring-indigo-100 p-1.5"
                                            />
                                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 pointer-events-none">ppm</span>
                                        </div>
                                    </div>

                                    {/* Temp */}
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Temp</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                value={inputs.waterTemp}
                                                onChange={(e) => handleUpdate('waterTemp', parseFloat(e.target.value) || 0)}
                                                className="w-full bg-slate-50 rounded-lg text-center font-bold text-lg text-slate-800 border-none focus:ring-2 focus:ring-indigo-100 p-1.5"
                                            />
                                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 pointer-events-none">°F</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Pool Surface Selector - Compact */}
                                <div>
                                    <div className="flex bg-slate-100 p-1 rounded-lg">
                                        {(['plaster', 'vinyl', 'fiberglass'] as PoolSurface[]).map(s => (
                                            <button
                                                key={s}
                                                onClick={() => handleUpdate('surfaceType', s)}
                                                className={`flex-1 py-1 rounded-md text-[10px] font-bold capitalize transition-all ${inputs.surfaceType === s ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. CHEMISTRY TARGETS - Compact */}
                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                            <div className="flex items-center gap-2 mb-3">
                                <Beaker className="w-4 h-4 text-slate-400" />
                                <h3 className="font-bold text-slate-700 text-sm">Target pH</h3>
                            </div>

                            <div className="bg-slate-50 rounded-xl p-3 flex gap-2 items-center justify-between">
                                {/* Current Control */}
                                <div className="flex items-center gap-1.5">
                                    <button onClick={() => handleUpdate('currentPh', parseFloat((inputs.currentPh - 0.1).toFixed(1)))} className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-400 active:scale-95 touch-manipulation"><Minus className="w-4 h-4" /></button>
                                    <div className="text-center w-12">
                                        <span className="block text-xl font-black text-slate-700 leading-none">{inputs.currentPh.toFixed(1)}</span>
                                        <span className="text-[9px] font-bold text-slate-400 uppercase">Now</span>
                                    </div>
                                    <button onClick={() => handleUpdate('currentPh', parseFloat((inputs.currentPh + 0.1).toFixed(1)))} className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-400 active:scale-95 touch-manipulation"><Plus className="w-4 h-4" /></button>
                                </div>

                                <div className="flex-1 text-center">
                                    {isRaising && <ArrowUpCircle className="w-5 h-5 text-indigo-400 mx-auto" />}
                                    {isLowering && <ArrowDownCircle className="w-5 h-5 text-rose-400 mx-auto" />}
                                </div>

                                {/* Target Control */}
                                <div className="flex items-center gap-1.5">
                                    <button onClick={() => handleUpdate('targetPh', parseFloat((inputs.targetPh - 0.1).toFixed(1)))} className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-400 active:scale-95 touch-manipulation"><Minus className="w-4 h-4" /></button>
                                    <div className="text-center w-12">
                                        <span className="block text-xl font-black text-indigo-600 leading-none">{inputs.targetPh.toFixed(1)}</span>
                                        <span className="text-[9px] font-bold text-slate-400 uppercase">Goal</span>
                                    </div>
                                    <button onClick={() => handleUpdate('targetPh', parseFloat((inputs.targetPh + 0.1).toFixed(1)))} className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-400 active:scale-95 touch-manipulation"><Plus className="w-4 h-4" /></button>
                                </div>
                            </div>
                        </div>

                        {/* 3. CHEMICAL SELECTION - Compact */}
                        {(isLowering || isRaising) && (
                            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 animate-in fade-in slide-in-from-bottom-2">
                                <div className="flex items-center gap-2 mb-3">
                                    <FlaskConical className="w-4 h-4 text-slate-400" />
                                    <h3 className="font-bold text-slate-700 text-sm">Preferred Chemical</h3>
                                </div>

                                {isLowering && (
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                        <SelectionButton
                                            label="Muriatic Acid" subLabel="31.45%"
                                            selected={inputs.preferredAcid === 'muriatic_31'}
                                            onClick={() => handleUpdate('preferredAcid', 'muriatic_31')}
                                        />
                                        <SelectionButton
                                            label="Muriatic (Low)" subLabel="~15%"
                                            selected={inputs.preferredAcid === 'muriatic_15'}
                                            onClick={() => handleUpdate('preferredAcid', 'muriatic_15')}
                                        />
                                        <SelectionButton
                                            label="Dry Acid" subLabel="Sodium Bisulfate"
                                            selected={inputs.preferredAcid === 'dry_acid'}
                                            onClick={() => handleUpdate('preferredAcid', 'dry_acid')}
                                        />
                                    </div>
                                )}
                                {isRaising && (
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                        <SelectionButton
                                            label="Soda Ash" subLabel="High TA Impact"
                                            selected={inputs.preferredBase === 'soda_ash'}
                                            onClick={() => handleUpdate('preferredBase', 'soda_ash')}
                                        />
                                        <SelectionButton
                                            label="Borax" subLabel="Low TA Impact"
                                            selected={inputs.preferredBase === 'borax'}
                                            onClick={() => handleUpdate('preferredBase', 'borax')}
                                        />
                                        <SelectionButton
                                            label="Aeration" subLabel="Air Only"
                                            selected={inputs.preferredBase === 'aeration'}
                                            onClick={() => handleUpdate('preferredBase', 'aeration')}
                                        />
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="text-center text-[10px] text-slate-300 px-4">
                            Calculation assumes carbonate-based TA. Accuracy ±0.1 pH.
                        </div>

                    </div>

                    {/* === RIGHT COLUMN: RESULTS - Updated Layout === */}
                    <div className="lg:col-span-5 space-y-4">

                        <div className={`p-6 rounded-3xl shadow-xl text-white transition-all duration-500 relative overflow-hidden flex flex-col justify-center min-h-[360px]
                            ${result?.adjustmentType === 'lower' ? 'bg-rose-600' : result?.adjustmentType === 'raise' ? 'bg-indigo-600' : 'bg-emerald-600'}`}>

                            {/* Texture */}
                            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>

                            <div className="relative z-10">
                                {result?.adjustmentType === 'balanced' ? (
                                    <div className="text-center py-10">
                                        <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
                                            <CheckCircle2 className="w-10 h-10 text-white" />
                                        </div>
                                        <h2 className="text-3xl font-black mb-2">Balanced!</h2>
                                        <p className="text-emerald-100">pH is within the target range.</p>
                                    </div>
                                ) : (
                                    <>
                                        {/* Main Dose Display */}
                                        <div className="mb-6">
                                            <p className="text-white/60 font-bold uppercase tracking-widest text-[10px] mb-2">Required Addition</p>
                                            <div className="flex items-baseline gap-2 mb-1">
                                                <span className="text-5xl font-black tracking-tighter shadow-sm">{result?.doseAmount}</span>
                                                <span className="text-lg font-bold text-white/80">{result?.doseUnit}</span>
                                            </div>
                                            <p className="text-base font-medium text-white/90 leading-tight">{result?.chemicalName}</p>

                                            {/* Secondary Unit */}
                                            {result?.secondaryAmount && (
                                                <div className="mt-2 inline-flex gap-2 bg-black/20 px-2 py-0.5 rounded text-xs font-semibold text-white/80">
                                                    <span>or</span>
                                                    <span>{result.secondaryAmount} {result.secondaryUnit}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Dose Plan - Compact */}
                                        <div className="bg-white/10 p-3 rounded-xl border border-white/10 mb-4 backdrop-blur-sm">
                                            <h4 className="flex items-center gap-2 text-[10px] font-bold text-white/80 uppercase mb-2">
                                                <Shield className="w-3 h-3 text-white/60" /> Dose Plan
                                            </h4>

                                            {result?.isSplitDose ? (
                                                <div className="space-y-2">
                                                    <div className="flex gap-2 text-xs text-yellow-100 items-center">
                                                        <span className="w-5 h-5 rounded-full bg-yellow-500/40 text-[10px] font-bold flex items-center justify-center flex-shrink-0">1</span>
                                                        <span>Add <strong>{result.amountPerDose} {result.doseUnit}</strong> now.</span>
                                                    </div>
                                                    <div className="flex gap-2 text-xs text-white/80 items-center">
                                                        <span className="w-5 h-5 rounded-full bg-white/20 text-[10px] font-bold flex items-center justify-center flex-shrink-0">2</span>
                                                        <span>Circulate 2 hrs, re-test.</span>
                                                    </div>
                                                    <div className="flex gap-2 text-xs text-white/60 items-center">
                                                        <span className="w-5 h-5 rounded-full bg-white/10 text-[10px] font-bold flex items-center justify-center flex-shrink-0">3</span>
                                                        <span>Add remainder ONLY if needed.</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-sm font-medium text-white/90">
                                                    Add full dose, circulate 30-60 mins, re-test.
                                                </div>
                                            )}
                                        </div>

                                        {/* Surface & Stats */}
                                        <div className="grid grid-cols-2 gap-2 mb-4">
                                            <div className="bg-black/10 rounded-lg p-2 border border-white/5">
                                                <p className="text-[9px] font-bold text-white/50 uppercase mb-0.5">TA Impact</p>
                                                <p className="font-bold text-sm flex items-center gap-1">
                                                    {result?.alkalinityChange && result?.alkalinityChange > 0 ? '+' : ''}{result?.alkalinityChange}
                                                    <span className="text-[10px] font-normal text-white/50">ppm</span>
                                                </p>
                                            </div>

                                            {result?.surfaceAdvice && (
                                                <div className="col-span-2 bg-indigo-900/40 border border-indigo-500/30 p-2 rounded-lg text-[10px] text-indigo-100 flex gap-2 items-center leading-tight">
                                                    <Info className="w-3 h-3 flex-shrink-0" />
                                                    {result.surfaceAdvice}
                                                </div>
                                            )}
                                        </div>

                                        {/* Instructions List - Compact */}
                                        <div className="space-y-1">
                                            {result?.instructions.map((inst, i) => (
                                                <div key={i} className="flex gap-2 items-start text-[10px] text-white/80 font-medium leading-tight">
                                                    <span className="w-1 h-1 rounded-full bg-white/60 mt-1 flex-shrink-0"></span>
                                                    <span>{inst}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Warnings */}
                                        {result?.warnings.length > 0 && (
                                            <div className="mt-4 pt-4 border-t border-white/10 space-y-1">
                                                {result.warnings.map((warn, i) => (
                                                    <div key={i} className="flex gap-2 text-[10px] text-rose-200 bg-rose-950/20 p-1.5 rounded-lg">
                                                        <AlertTriangle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                                                        {warn}
                                                    </div>
                                                ))}
                                            </div>
                                        )}

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

export default PhAdjustmentCalculator;
