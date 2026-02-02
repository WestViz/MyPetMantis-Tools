import React, { useState, useEffect } from 'react';
import {
    Droplets,
    Beaker,
    AlertTriangle,
    Info,
    CheckCircle2,
    Minus,
    Plus
} from 'lucide-react';

// ----------------------------------------------------------------------
// TYPES
// ----------------------------------------------------------------------

type UnitSystem = 'imperial' | 'metric';
type ChlorineSource = 'liquid-12' | 'liquid-10' | 'liquid-aged' | 'bleach-6' | 'trichlor-tab' | 'cal-hypo' | 'dichlor';

interface Inputs {
    volume: number;
    unit: UnitSystem;
    currentFc: number;
    targetFc: number;
    currentCYA: number;
    source: ChlorineSource;
}

interface Result {
    amount: number;
    unit: string;
    amountSecondary?: number;
    unitSecondary?: string;
    notes: string[];
    warnings: string[];
}

// ----------------------------------------------------------------------
// HELPERS
// ----------------------------------------------------------------------

const SelectionButton = ({ selected, onClick, label, subLabel }: { selected: boolean, onClick: () => void, label: string, subLabel?: string }) => (
    <button
        onClick={onClick}
        className={`relative p-3 rounded-xl border-2 text-left transition-all duration-200 w-full touch-manipulation
      ${selected
                ? 'border-cyan-500 bg-cyan-50/50 ring-2 ring-cyan-200 ring-offset-1 z-10'
                : 'border-slate-100 bg-slate-50 hover:bg-slate-100 text-slate-500'}`}
    >
        <div className="flex justify-between items-start">
            <div>
                <div className={`font-bold text-sm ${selected ? 'text-cyan-900' : 'text-slate-700'}`}>{label}</div>
                {subLabel && <div className={`text-xs mt-0.5 ${selected ? 'text-cyan-700' : 'text-slate-400'}`}>{subLabel}</div>}
            </div>
            {selected && <CheckCircle2 className="w-5 h-5 text-cyan-500 flex-shrink-0 ml-2" />}
        </div>
    </button>
);

// ----------------------------------------------------------------------
// COMPONENT
// ----------------------------------------------------------------------

const ChlorineDosageCalculator: React.FC = () => {
    const [inputs, setInputs] = useState<Inputs>({
        volume: 15000,
        unit: 'imperial',
        currentFc: 1.5,
        targetFc: 4.0,
        currentCYA: 30,
        source: 'liquid-12'
    });

    const [result, setResult] = useState<Result | null>(null);

    useEffect(() => {
        calculate();
    }, [inputs]);

    const calculate = () => {
        const { volume, unit, currentFc, targetFc, currentCYA, source } = inputs;

        // Normalize volume
        const volGal = unit === 'imperial' ? volume : volume * 0.264172;
        const delta = Math.max(0, targetFc - currentFc);

        if (delta === 0) {
            setResult(null);
            return;
        }

        const volFactor = volGal / 10000;
        let amount = 0;
        let amountUnit = '';
        let notes: string[] = [];
        let warnings: string[] = [];

        // Factor: Amount to raise 10k gal by 1 ppm
        switch (source) {
            case 'liquid-12':
                amount = 10.7 * delta * volFactor; // fl oz
                amountUnit = 'fl oz';
                break;
            case 'liquid-10':
                amount = 13.0 * delta * volFactor; // fl oz
                amountUnit = 'fl oz';
                break;
            case 'liquid-aged':
                amount = 14.5 * delta * volFactor; // fl oz (derated ~8%)
                amountUnit = 'fl oz';
                warnings.push("Aged chlorine loses strength. Test and adjust if needed.");
                break;
            case 'bleach-6':
                amount = 21.0 * delta * volFactor; // fl oz
                amountUnit = 'fl oz';
                warnings.push("Household bleach degrades quickly. Use fresh product.");
                break;
            case 'cal-hypo':
                amount = 2.0 * delta * volFactor; // oz wt
                amountUnit = 'oz weight';
                notes.push("Pre-dissolve in bucket of water before adding.");
                warnings.push("Adds calcium hardness (~0.7 ppm per 1 ppm FC).");
                break;
            case 'dichlor':
                amount = 2.4 * delta * volFactor; // oz wt
                amountUnit = 'oz weight';
                warnings.push("Adds Stabilizer (CYA) ~0.9 ppm per 1 ppm FC.");
                break;
            case 'trichlor-tab':
                const ppmPerTab = 5.5 / volFactor;
                amount = delta / ppmPerTab; // number of tabs
                amountUnit = 'Tabs (8oz)';
                warnings.push("Tabs dissolve slowly. Do not use for immediate increase.");
                warnings.push("Tabs significantly raise CYA and lower pH.");
                break;
        }

        // CYA Context Warnings
        const recommendedFC = Math.round(currentCYA * 0.075); // ~7.5% of CYA
        if (targetFc < recommendedFC && currentCYA >= 30) {
            warnings.push(`With CYA at ${currentCYA} ppm, target FC should be ~${recommendedFC} ppm (FC/CYA method).`);
        }
        if (currentCYA < 20 && source !== 'dichlor') {
            notes.push("Low CYA (<20). Chlorine will degrade rapidly in sunlight.");
        }

        // Max Daily Increase Warning
        if (delta > 4) {
            warnings.push("Daily increases >4-5 ppm should be split or treated as shocking.");
        }

        // Convert secondary units
        let amountSecondary = undefined;
        let unitSecondary = undefined;

        if (amountUnit === 'fl oz' && amount > 32) {
            if (amount >= 128) {
                amountSecondary = amount / 128;
                unitSecondary = 'gallons';
            } else {
                amountSecondary = amount / 32;
                unitSecondary = 'quarts';
            }
        }
        if (amountUnit === 'oz weight' && amount > 16) {
            amountSecondary = amount / 16;
            unitSecondary = 'lbs';
        }

        // Convert metric if needed
        let displayAmount = amount;
        let displayUnit = amountUnit;

        if (unit === 'metric') {
            if (amountUnit === 'fl oz') {
                displayAmount = amount * 29.57;
                displayUnit = 'ml';
                if (displayAmount > 1000) {
                    amountSecondary = displayAmount / 1000;
                    unitSecondary = 'L';
                }
            } else if (amountUnit === 'oz weight') {
                displayAmount = amount * 28.35;
                displayUnit = 'grams';
                if (displayAmount > 1000) {
                    amountSecondary = displayAmount / 1000;
                    unitSecondary = 'kg';
                }
            }
        }

        // Dosing Guidance
        notes.push("Run pump 30-60 minutes after dosing for even distribution.");
        notes.push("Dose in evening for best retention (less UV degradation).");

        setResult({
            amount: Math.round(displayAmount * 10) / 10,
            unit: displayUnit,
            amountSecondary: amountSecondary ? Math.round(amountSecondary * 100) / 100 : undefined,
            unitSecondary,
            notes,
            warnings
        });
    };

    const toggleUnit = () => {
        setInputs(prev => {
            const newSystem = prev.unit === 'imperial' ? 'metric' : 'imperial';
            const newVolume = prev.unit === 'imperial'
                ? prev.volume * 3.78541
                : prev.volume * 0.264172;
            return {
                ...prev,
                unit: newSystem,
                volume: Math.round(newVolume)
            };
        });
    };

    return (
        <div className="glass-panel text-slate-900 rounded-[2rem] shadow-xl bg-white/90 backdrop-blur-md border border-slate-200 p-4 md:p-8 relative overflow-hidden max-w-6xl mx-auto">
            <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-cyan-400/20 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 w-full">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 mb-2">
                        <span className="p-2 bg-cyan-100 text-cyan-700 rounded-lg"><Beaker className="w-6 h-6" /></span>
                        <span className="text-xs font-bold tracking-widest text-slate-400 uppercase">Daily Maintenance</span>
                    </div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Daily Chlorine Calculator</h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* === LEFT COLUMN: INPUTS === */}
                    <div className="lg:col-span-7 space-y-4">

                        {/* 1. POOL VOLUME */}
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-slate-700 flex items-center gap-2 text-sm uppercase">
                                    <Droplets className="w-4 h-4 text-cyan-500" /> Pool Volume
                                </h3>
                                <button onClick={toggleUnit} className="text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1 rounded-full transition-colors">
                                    {inputs.unit === 'imperial' ? 'US Gallons' : 'Metric'}
                                </button>
                            </div>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={inputs.volume}
                                    onChange={(e) => setInputs(p => ({ ...p, volume: parseFloat(e.target.value) || 0 }))}
                                    className="w-full pl-4 pr-16 py-3 bg-slate-50 border-0 rounded-xl font-bold text-2xl text-slate-800 ring-1 ring-slate-200 focus:ring-2 focus:ring-cyan-500 transition-all text-center"
                                />
                                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                                    {inputs.unit === 'imperial' ? 'GAL' : 'L'}
                                </span>
                            </div>
                            <input
                                type="range"
                                min="100"
                                max="50000"
                                step="100"
                                value={inputs.volume}
                                onChange={(e) => setInputs(p => ({ ...p, volume: parseFloat(e.target.value) || 0 }))}
                                className="w-full mt-3 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                            />
                        </div>

                        {/* 2. CHLORINE LEVELS */}
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                            <h3 className="font-bold text-slate-700 flex items-center gap-2 mb-4 text-sm uppercase">
                                <Beaker className="w-4 h-4 text-cyan-500" /> Free Chlorine (FC) Levels
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Current FC (ppm)</label>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setInputs(p => ({ ...p, currentFc: Math.max(0, p.currentFc - 0.5) }))}
                                            className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 active:scale-95 transition-all"
                                        >
                                            <Minus className="w-5 h-5" />
                                        </button>
                                        <input
                                            type="number"
                                            step="0.5"
                                            value={inputs.currentFc}
                                            onChange={(e) => setInputs(p => ({ ...p, currentFc: parseFloat(e.target.value) || 0 }))}
                                            className="flex-1 min-w-0 bg-slate-50 rounded-lg p-2 font-bold text-lg text-slate-700 border-none text-center"
                                        />
                                        <button
                                            onClick={() => setInputs(p => ({ ...p, currentFc: Math.min(20, p.currentFc + 0.5) }))}
                                            className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 active:scale-95 transition-all"
                                        >
                                            <Plus className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Target FC (ppm)</label>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setInputs(p => ({ ...p, targetFc: Math.max(0, p.targetFc - 0.5) }))}
                                            className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 active:scale-95 transition-all"
                                        >
                                            <Minus className="w-5 h-5" />
                                        </button>
                                        <input
                                            type="number"
                                            step="0.5"
                                            value={inputs.targetFc}
                                            onChange={(e) => setInputs(p => ({ ...p, targetFc: parseFloat(e.target.value) || 0 }))}
                                            className="flex-1 min-w-0 bg-slate-50 rounded-lg p-2 font-bold text-lg text-cyan-600 border-none text-center"
                                        />
                                        <button
                                            onClick={() => setInputs(p => ({ ...p, targetFc: Math.min(20, p.targetFc + 0.5) }))}
                                            className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 active:scale-95 transition-all"
                                        >
                                            <Plus className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Current CYA (ppm)</label>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setInputs(p => ({ ...p, currentCYA: Math.max(0, p.currentCYA - 5) }))}
                                            className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 active:scale-95 transition-all"
                                        >
                                            <Minus className="w-5 h-5" />
                                        </button>
                                        <input
                                            type="number"
                                            step="5"
                                            value={inputs.currentCYA}
                                            onChange={(e) => setInputs(p => ({ ...p, currentCYA: parseFloat(e.target.value) || 0 }))}
                                            className="flex-1 min-w-0 bg-slate-50 rounded-lg p-2 font-bold text-lg text-slate-700 border-none text-center"
                                        />
                                        <button
                                            onClick={() => setInputs(p => ({ ...p, currentCYA: Math.min(150, p.currentCYA + 5) }))}
                                            className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 active:scale-95 transition-all"
                                        >
                                            <Plus className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 3. CHLORINE SOURCE */}
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                            <h3 className="font-bold text-slate-700 mb-4 text-sm uppercase">Chlorine Source</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <SelectionButton
                                    selected={inputs.source === 'liquid-12'}
                                    onClick={() => setInputs(p => ({ ...p, source: 'liquid-12' }))}
                                    label="Liquid Chlorine"
                                    subLabel="12.5% Strength"
                                />
                                <SelectionButton
                                    selected={inputs.source === 'liquid-10'}
                                    onClick={() => setInputs(p => ({ ...p, source: 'liquid-10' }))}
                                    label="Pool Chlorinator"
                                    subLabel="10% Strength"
                                />
                                <SelectionButton
                                    selected={inputs.source === 'liquid-aged'}
                                    onClick={() => setInputs(p => ({ ...p, source: 'liquid-aged' }))}
                                    label="Aged/Unknown"
                                    subLabel="Derated ~8%"
                                />
                                <SelectionButton
                                    selected={inputs.source === 'bleach-6'}
                                    onClick={() => setInputs(p => ({ ...p, source: 'bleach-6' }))}
                                    label="Household Bleach"
                                    subLabel="6% Strength"
                                />
                                <SelectionButton
                                    selected={inputs.source === 'cal-hypo'}
                                    onClick={() => setInputs(p => ({ ...p, source: 'cal-hypo' }))}
                                    label="Cal-Hypo"
                                    subLabel="65% Granular"
                                />
                                <SelectionButton
                                    selected={inputs.source === 'dichlor'}
                                    onClick={() => setInputs(p => ({ ...p, source: 'dichlor' }))}
                                    label="Dichlor"
                                    subLabel="56% Granular"
                                />
                            </div>
                        </div>

                    </div>

                    {/* === RIGHT COLUMN: RESULTS === */}
                    <div className="lg:col-span-5 space-y-4">
                        <div className="bg-slate-900 text-white p-6 md:p-8 rounded-3xl shadow-2xl relative overflow-hidden">
                            <div className="relative z-10">
                                {result ? (
                                    <>
                                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-4">Add the Following</p>

                                        <div className="mb-6">
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

                                        <div className="h-px bg-white/10 w-full my-4"></div>

                                        {/* Warnings */}
                                        {result.warnings.length > 0 && (
                                            <div className="space-y-2 mb-4">
                                                {result.warnings.map((w, i) => (
                                                    <div key={i} className="flex gap-2 text-xs text-rose-200 bg-rose-900/40 p-2 rounded-lg border border-rose-900/50">
                                                        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                                                        <span className="leading-snug">{w}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Notes */}
                                        <div className="space-y-2">
                                            <h4 className="flex items-center gap-2 text-[10px] font-bold text-cyan-400 uppercase mb-2">
                                                <Info className="w-3 h-3" /> Dosing Instructions
                                            </h4>
                                            {result.notes.map((n, i) => (
                                                <div key={i} className="flex gap-2 text-xs text-slate-300 items-start leading-snug">
                                                    <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full mt-1.5 flex-shrink-0"></div>
                                                    <span>{n}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center text-slate-500 py-8">
                                        Set Target FC higher than Current FC.
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

export default ChlorineDosageCalculator;
