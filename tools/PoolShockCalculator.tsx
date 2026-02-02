import React, { useState, useEffect } from 'react';
import {
    Zap,
    Droplets,
    Scale,
    AlertTriangle,
    Beaker,
    Waves,
    Info,
    ThermometerSun,
    CheckCircle2
} from 'lucide-react';

// ----------------------------------------------------------------------
// TYPES
// ----------------------------------------------------------------------

type UnitSystem = 'imperial' | 'metric';
type ShockType = 'liquid-12' | 'liquid-10' | 'cal-hypo-65' | 'cal-hypo-48' | 'dichlor' | 'mps';
type ShockMethod = 'maintenance' | 'slam' | 'breakpoint' | 'custom';

export interface ShockInputs {
    poolVolume: number;
    unitSystem: UnitSystem;
    currentFC: number; // Free Chlorine
    currentCC: number; // Combined Chlorine
    currentCYA: number; // Cyanuric Acid
    targetFC: number;  // Desired Shock Level
    shockType: ShockType;
    shockMethod: ShockMethod;
}

export interface ShockResult {
    amount: number;
    unit: string;
    amountSecondary?: number;
    unitSecondary?: string;
    chIncrease?: number; // Calcium Hardness increase
    cyaIncrease?: number; // Stabilizer increase
    notes: string[];
    warnings: string[];
}

// ----------------------------------------------------------------------
// CONSTANTS & HELPERS
// ----------------------------------------------------------------------

const SelectionButton = ({ selected, onClick, label, subLabel, badge }: { selected: boolean, onClick: () => void, label: string, subLabel?: string, badge?: string }) => (
    <button
        onClick={onClick}
        className={`relative p-3 rounded-xl border-2 text-left transition-all duration-200 w-full touch-manipulation
      ${selected
                ? 'border-cyan-500 bg-cyan-50/50 ring-2 ring-cyan-200 ring-offset-1 z-10'
                : 'border-slate-100 bg-slate-50 hover:bg-slate-100 text-slate-500'}`}
    >
        <div className="flex justify-between items-start">
            <div>
                <div className={`font-bold ${selected ? 'text-cyan-800' : 'text-slate-700'}`}>{label}</div>
                {subLabel && <div className={`text-xs mt-0.5 ${selected ? 'text-cyan-600' : 'text-slate-400'}`}>{subLabel}</div>}
            </div>
            {selected && <CheckCircle2 className="w-5 h-5 text-cyan-500 flex-shrink-0 ml-2" />}
        </div>
        {badge && (
            <span className={`absolute top-2 right-2 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded
            ${selected ? 'bg-cyan-200 text-cyan-800' : 'bg-slate-200 text-slate-500'}`}>
                {badge}
            </span>
        )}
    </button>
);

// ----------------------------------------------------------------------
// MAIN COMPONENT
// ----------------------------------------------------------------------

const PoolShockCalculator: React.FC = () => {
    const [inputs, setInputs] = useState<ShockInputs>({
        poolVolume: 15000,
        unitSystem: 'imperial',
        currentFC: 1.0,
        currentCC: 0.0,
        currentCYA: 30,
        targetFC: 12.0,
        shockType: 'liquid-12',
        shockMethod: 'maintenance'
    });

    const [result, setResult] = useState<ShockResult | null>(null);

    // 1. AUTO-CALCULATE TARGET FC BASED ON METHOD + CYA
    useEffect(() => {
        let newTarget = inputs.targetFC;
        const { currentFC, currentCC, currentCYA, shockMethod } = inputs;

        switch (shockMethod) {
            case 'maintenance':
                // Standard weekly shock: +5 to +7 ppm, or minimum 5-10 range
                newTarget = Math.max(currentFC + 5, 5);
                break;
            case 'slam':
                // SLAM (Shock Level and Maintain) = 40% of CYA
                // Min SLAM level usually 10-12
                newTarget = Math.max(10, Math.round(currentCYA * 0.4));
                break;
            case 'breakpoint':
                // Breakpoint = 10x CC + Current FC
                // We need to ADD 10xCC. So Target = Current + 10xCC.
                newTarget = currentFC + (Math.max(currentCC, 0.2) * 10);
                break;
            case 'custom':
                // Do not auto-update target
                return;
        }

        // Only update if different to avoid infinite loops or jitter
        if (Math.abs(newTarget - inputs.targetFC) > 0.1) {
            setInputs(p => ({ ...p, targetFC: Math.round(newTarget * 10) / 10 }));
        }

    }, [inputs.shockMethod, inputs.currentCYA, inputs.currentCC, inputs.currentFC]); // Dependencies that drive target

    // 2. CALCULATE DOSAGE
    useEffect(() => {
        calculateShock();
    }, [inputs]);

    const calculateShock = () => {
        const { poolVolume, unitSystem, currentFC, targetFC, shockType, currentCYA } = inputs;

        const deltaFC = Math.max(0, targetFC - currentFC);

        if (deltaFC <= 0) {
            setResult(null);
            return;
        }

        // Volume normalization
        const volGal = unitSystem === 'imperial' ? poolVolume : poolVolume * 0.264172;
        const volFactor = volGal / 10000;

        // FACTORS per 10k gallons to raise 1 ppm FC
        // Liquid 12.5%: ~10.7 fl oz
        // Liquid 10%:   ~13.0 fl oz
        // Cal-Hypo 65%: ~2.0 oz wt
        // Cal-Hypo 48%: ~2.7 oz wt
        // Dichlor 56%:  ~2.4 oz wt

        let factor = 0;
        let unit = 'oz weight';
        let liquid = false;

        // Side Effects
        let cyaRatio = 0; // ppm CYA added per ppm FC
        let chRatio = 0;  // ppm CH added per ppm FC

        switch (shockType) {
            case 'liquid-12':
                factor = 10.7; unit = 'fl oz'; liquid = true;
                break;
            case 'liquid-10':
                factor = 13.0; unit = 'fl oz'; liquid = true;
                break;
            case 'cal-hypo-65':
                factor = 2.0; unit = 'oz weight';
                chRatio = 0.7; // For every 1 ppm FC, adds ~0.7 ppm CH
                break;
            case 'cal-hypo-48':
                factor = 2.7; unit = 'oz weight';
                chRatio = 0.6; // Slightly less efficient
                break;
            case 'dichlor':
                factor = 2.4; unit = 'oz weight';
                cyaRatio = 0.9; // For every 1 ppm FC, adds ~0.9 ppm CYA !! High
                break;
            case 'mps':
                // Treated separately
                break;
        }

        let amount = 0;
        if (shockType === 'mps') {
            // MPS Dose: 1 lb per 10k gallons usually implies a standard oxidative shock
            amount = 16 * volFactor;
            unit = 'oz weight';
        } else {
            amount = factor * deltaFC * volFactor;
        }

        // Side Effect Calculations
        const cyaIncrease = deltaFC * cyaRatio;
        const chIncrease = deltaFC * chRatio;

        // Convert secondary units
        let amountSecondary = undefined;
        let unitSecondary = undefined;

        if (!liquid && amount > 16) {
            amountSecondary = amount / 16;
            unitSecondary = 'lbs';
        }
        if (liquid && amount > 128) {
            amountSecondary = amount / 128;
            unitSecondary = 'gallons';
        }

        // Warnings & Notes
        const warnings: string[] = [];
        const notes: string[] = [];

        // CYA Context Warnings
        if (currentCYA < 30 && shockType !== 'dichlor' && shockType !== 'mps') {
            notes.push("CYA is low (<30). Sunlight will degrade chlorine rapidly.");
        }
        if (currentCYA > 60 && inputs.shockMethod === 'slam') {
            warnings.push(`High CYA (${currentCYA}) requires very high shock levels (${Math.round(currentCYA * 0.4)} ppm).`);
        }

        // Dichlor Warnings
        if (shockType === 'dichlor') {
            warnings.push(`Adds +${Math.round(cyaIncrease)} ppm Stabilizer (CYA). Continuous use causes CYA lock.`);
            if (currentCYA + cyaIncrease > 50) warnings.push("Resulting CYA may exceed recommended range (30-50 ppm).");
        }

        // Cal-Hypo Warnings
        if (shockType.includes('cal-hypo')) {
            notes.push(`Adds +${Math.round(chIncrease)} ppm Calcium Hardness.`);
            warnings.push("Pre-dissolve or broadcast carefully. Can cloud water or scale.");
            if (unitSystem === 'imperial' && poolVolume > 5000) notes.push("Risk of bleaching vinyl liners if granules settle.");
        }

        // Max Dose logic
        if (liquid && amountSecondary && amountSecondary > 4) {
            warnings.push("Large dose (> 4 gallons). Add half, circulate 2 hours, then add remainder.");
        }
        if (!liquid && amountSecondary && amountSecondary > 5) {
            warnings.push("Large granular dose. MUST dissolve/broadcast in batches to avoid clouding.");
        }

        notes.push("Run pump 24/7 during shock process.");
        notes.push("Do not enter pool until FC drops below 10 ppm."); // General safety

        if (unitSystem === 'metric') {
            // Conversions
            if (liquid) {
                amount = amount * 29.57; unit = 'ml';
                if (amount > 1000) { amountSecondary = amount / 1000; unitSecondary = 'L'; }
            } else {
                amount = amount * 28.35; unit = 'grams';
                if (amount > 1000) { amountSecondary = amount / 1000; unitSecondary = 'kg'; }
            }
        }

        setResult({
            amount: Math.round(amount * 10) / 10,
            unit,
            amountSecondary: amountSecondary ? Math.round(amountSecondary * 100) / 100 : undefined,
            unitSecondary,
            chIncrease: chIncrease > 0.5 ? Math.round(chIncrease) : undefined,
            cyaIncrease: cyaIncrease > 0.5 ? Math.round(cyaIncrease) : undefined,
            notes,
            warnings
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

            {/* Background Decor */}
            <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-cyan-400/20 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 w-full">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 mb-2">
                        <span className="p-2 bg-cyan-100 text-cyan-700 rounded-lg"><Zap className="w-6 h-6" /></span>
                        <span className="text-xs font-bold tracking-widest text-slate-400 uppercase">Pool Tools</span>
                    </div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Precision Shock Calculator</h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* === LEFT COLUMN: INPUTS === */}
                    <div className="lg:col-span-7 space-y-5">

                        {/* 1. POOL PROFILE */}
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-slate-700 flex items-center gap-2 text-sm uppercase">
                                    <Waves className="w-4 h-4 text-cyan-500" /> Pool Profile
                                </h3>
                                <button onClick={toggleUnit} className="text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1 rounded-full transition-colors">
                                    {inputs.unitSystem === 'imperial' ? 'US Gallons' : 'Metric'}
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Volume</label>
                                    <input
                                        type="number"
                                        value={inputs.poolVolume}
                                        onChange={(e) => setInputs(p => ({ ...p, poolVolume: parseFloat(e.target.value) || 0 }))}
                                        className="w-full pl-3 py-2 bg-slate-50 border-0 rounded-lg font-bold text-xl text-slate-800 ring-1 ring-slate-200 focus:ring-2 focus:ring-cyan-500 transition-all"
                                    />
                                    <input
                                        type="range"
                                        min="100"
                                        max="50000"
                                        step="100"
                                        value={inputs.poolVolume}
                                        onChange={(e) => setInputs(p => ({ ...p, poolVolume: parseFloat(e.target.value) || 0 }))}
                                        className="w-full mt-3 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Current CYA (Stabilizer)</label>
                                    <input
                                        type="number"
                                        value={inputs.currentCYA}
                                        onChange={(e) => setInputs(p => ({ ...p, currentCYA: parseFloat(e.target.value) || 0 }))}
                                        className={`w-full pl-3 py-2 bg-slate-50 border-0 rounded-lg font-bold text-xl ring-1 ring-slate-200 focus:ring-2 transition-all
                            ${inputs.currentCYA > 60 ? 'text-amber-600 focus:ring-amber-500' : 'text-slate-800 focus:ring-cyan-500'}`}
                                    />
                                    <input
                                        type="range"
                                        min="0"
                                        max="150"
                                        step="5"
                                        value={inputs.currentCYA}
                                        onChange={(e) => setInputs(p => ({ ...p, currentCYA: parseFloat(e.target.value) || 0 }))}
                                        className={`w-full mt-3 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer 
                                            ${inputs.currentCYA > 60 ? 'accent-amber-500' : 'accent-cyan-500'}`}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 2. METHOD SELECTION */}
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                            <h3 className="font-bold text-slate-700 flex items-center gap-2 mb-4 text-sm uppercase">
                                <Droplets className="w-4 h-4 text-indigo-500" /> Shock Strategy
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                                <SelectionButton
                                    selected={inputs.shockMethod === 'maintenance'}
                                    onClick={() => setInputs(p => ({ ...p, shockMethod: 'maintenance' }))}
                                    label="Maintenance"
                                    subLabel="+5 ppm Boost"
                                />
                                <SelectionButton
                                    selected={inputs.shockMethod === 'slam'}
                                    onClick={() => setInputs(p => ({ ...p, shockMethod: 'slam' }))}
                                    label="SLAM / Algae"
                                    subLabel="40% of CYA"
                                    badge="Green Pool"
                                />
                                <SelectionButton
                                    selected={inputs.shockMethod === 'breakpoint'}
                                    onClick={() => setInputs(p => ({ ...p, shockMethod: 'breakpoint' }))}
                                    label="Breakpoint"
                                    subLabel="Kill Chloramines"
                                />
                                <SelectionButton
                                    selected={inputs.shockMethod === 'custom'}
                                    onClick={() => setInputs(p => ({ ...p, shockMethod: 'custom' }))}
                                    label="Custom Target"
                                    subLabel="Manual Entry"
                                />
                            </div>

                            {/* Levels Display */}
                            <div className="bg-slate-50 rounded-xl p-4 grid grid-cols-3 gap-4 border border-slate-100">
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Current FC</label>
                                    <input
                                        type="number" step="0.5"
                                        value={inputs.currentFC}
                                        onChange={(e) => setInputs(p => ({ ...p, currentFC: parseFloat(e.target.value) || 0 }))}
                                        className="w-full bg-white rounded-lg p-2 font-bold text-lg text-slate-700 border border-slate-200 text-center"
                                    />
                                </div>
                                {inputs.shockMethod === 'breakpoint' ? (
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Combined CC</label>
                                        <input
                                            type="number" step="0.1"
                                            value={inputs.currentCC}
                                            onChange={(e) => setInputs(p => ({ ...p, currentCC: parseFloat(e.target.value) || 0 }))}
                                            className="w-full bg-white rounded-lg p-2 font-bold text-lg text-rose-600 border border-slate-200 text-center"
                                        />
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center pt-3 opacity-20">
                                        <ArrowRightIcon className="w-6 h-6 text-slate-400" />
                                    </div>
                                )}
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Target FC</label>
                                    <input
                                        type="number" step="0.5"
                                        value={inputs.targetFC}
                                        readOnly={inputs.shockMethod !== 'custom'}
                                        onChange={(e) => setInputs(p => ({ ...p, targetFC: parseFloat(e.target.value) || 0 }))}
                                        className={`w-full rounded-lg p-2 font-black text-xl text-center border
                                ${inputs.shockMethod === 'custom' ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-100 border-transparent text-slate-500'}`}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 3. CHEMICAL TYPE */}
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                            <h3 className="font-bold text-slate-700 flex items-center gap-2 mb-4 text-sm uppercase">
                                <Scale className="w-4 h-4 text-emerald-500" /> Chemical Source
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <SelectionButton
                                    selected={inputs.shockType === 'liquid-12'}
                                    onClick={() => setInputs(p => ({ ...p, shockType: 'liquid-12' }))}
                                    label="Liquid Chlorine" subLabel="12.5% Strength"
                                    badge="Recommended"
                                />
                                <SelectionButton
                                    selected={inputs.shockType === 'liquid-10'}
                                    onClick={() => setInputs(p => ({ ...p, shockType: 'liquid-10' }))}
                                    label="Pool Chlorinator" subLabel="10% Strength"
                                />
                                <SelectionButton
                                    selected={inputs.shockType === 'cal-hypo-65'}
                                    onClick={() => setInputs(p => ({ ...p, shockType: 'cal-hypo-65' }))}
                                    label="Cal Hypo" subLabel="65% Granular"
                                />
                                <SelectionButton
                                    selected={inputs.shockType === 'dichlor'}
                                    onClick={() => setInputs(p => ({ ...p, shockType: 'dichlor' }))}
                                    label="Dichlor" subLabel="56% Granular"
                                />
                            </div>
                        </div>

                    </div>

                    {/* === RIGHT COLUMN: RESULTS === */}
                    <div className="lg:col-span-5 space-y-6">
                        <div className="bg-slate-900 text-white p-6 md:p-8 rounded-3xl shadow-2xl relative overflow-hidden h-full flex flex-col justify-center">
                            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                                <Zap className="w-64 h-64" />
                            </div>

                            <div className="relative z-10">
                                <div className="mb-6">
                                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-2">Total Amount to Add</p>
                                    {result ? (
                                        <div>
                                            <div className="flex items-baseline gap-2 mb-2">
                                                <span className="text-6xl font-black tracking-tighter text-cyan-400">{result.amount}</span>
                                                <span className="text-2xl font-bold text-slate-400">{result.unit}</span>
                                            </div>

                                            {result.amountSecondary && (
                                                <div className="inline-block bg-white/10 px-3 py-1 rounded-lg border border-white/5">
                                                    <span className="text-sm font-semibold text-white/90">
                                                        or approx. {result.amountSecondary} {result.unitSecondary}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-3xl font-bold text-slate-600">--</div>
                                    )}
                                </div>

                                {result && (
                                    <div className="space-y-4">
                                        {/* Side Effects Panel */}
                                        {(result.chIncrease || result.cyaIncrease) && (
                                            <div className="grid grid-cols-2 gap-3 mb-2">
                                                {result.chIncrease && (
                                                    <div className="bg-white/10 p-3 rounded-xl border border-white/5">
                                                        <p className="text-[9px] font-bold text-slate-400 uppercase">CH Increase</p>
                                                        <p className="text-lg font-bold text-white">+{result.chIncrease} <span className="text-xs font-normal opacity-50">ppm</span></p>
                                                    </div>
                                                )}
                                                {result.cyaIncrease && (
                                                    <div className="bg-white/10 p-3 rounded-xl border border-white/5">
                                                        <p className="text-[9px] font-bold text-slate-400 uppercase">CYA Increase</p>
                                                        <p className="text-lg font-bold text-amber-300">+{result.cyaIncrease} <span className="text-xs font-normal opacity-50">ppm</span></p>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <div className="h-px bg-white/10 w-full my-2"></div>

                                        {/* Warnings */}
                                        <div className="space-y-2">
                                            {result.warnings.map((w, i) => (
                                                <div key={i} className="flex gap-3 text-xs text-rose-200 bg-rose-900/40 p-3 rounded-lg border border-rose-900/50">
                                                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                                                    <span className="leading-snug">{w}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Steps */}
                                        <div className="space-y-2 mt-4">
                                            <h4 className="flex items-center gap-2 text-[10px] font-bold text-cyan-400 uppercase mb-2">
                                                <Info className="w-3 h-3" /> Instructions
                                            </h4>
                                            {result.notes.map((n, i) => (
                                                <div key={i} className="flex gap-2 text-xs text-slate-300 items-start leading-snug">
                                                    <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full mt-1.5 flex-shrink-0"></div>
                                                    <span>{n}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

// Helper Icon
const ArrowRightIcon = ({ className }: { className: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
)

export default PoolShockCalculator;
