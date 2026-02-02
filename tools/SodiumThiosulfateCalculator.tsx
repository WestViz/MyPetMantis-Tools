import React, { useState, useEffect } from 'react';
import {
    Eraser,
    Beaker,
    AlertOctagon,
    Droplets,
    Info,
    CheckCircle2,
    Minus,
    Plus
} from 'lucide-react';

// ----------------------------------------------------------------------
// TYPES
// ----------------------------------------------------------------------

type UnitSystem = 'imperial' | 'metric';
type ThiosulfateType = 'anhydrous' | 'pentahydrate';

interface Inputs {
    volume: number;
    unit: UnitSystem;
    currentFc: number;
    targetFc: number;
    thiosulfateType: ThiosulfateType;
}

interface Result {
    minAmount: number;
    recommendedAmount: number;
    maxAmount: number;
    unit: string;
    drop: number;
    warnings: string[];
    notes: string[];
}

// ----------------------------------------------------------------------
// HELPERS
// ----------------------------------------------------------------------

const SelectionButton = ({ selected, onClick, label, subLabel }: { selected: boolean, onClick: () => void, label: string, subLabel?: string }) => (
    <button
        onClick={onClick}
        className={`relative p-3 rounded-xl border-2 text-left transition-all duration-200 w-full touch-manipulation
      ${selected
                ? 'border-purple-500 bg-purple-50/50 ring-2 ring-purple-200 ring-offset-1 z-10'
                : 'border-slate-100 bg-slate-50 hover:bg-slate-100 text-slate-500'}`}
    >
        <div className="flex justify-between items-start">
            <div>
                <div className={`font-bold text-sm ${selected ? 'text-purple-900' : 'text-slate-700'}`}>{label}</div>
                {subLabel && <div className={`text-xs mt-0.5 ${selected ? 'text-purple-700' : 'text-slate-400'}`}>{subLabel}</div>}
            </div>
            {selected && <CheckCircle2 className="w-5 h-5 text-purple-500 flex-shrink-0 ml-2" />}
        </div>
    </button>
);

// ----------------------------------------------------------------------
// COMPONENT
// ----------------------------------------------------------------------

const SodiumThiosulfateCalculator: React.FC = () => {
    const [inputs, setInputs] = useState<Inputs>({
        volume: 15000,
        unit: 'imperial',
        currentFc: 10.0,
        targetFc: 4.0,
        thiosulfateType: 'pentahydrate'
    });

    const [result, setResult] = useState<Result | null>(null);

    useEffect(() => {
        calculate();
    }, [inputs]);

    const calculate = () => {
        const { volume, unit, currentFc, targetFc, thiosulfateType } = inputs;
        const volGal = unit === 'imperial' ? volume : volume * 0.264172;

        // We only calculate if we need to LOWER chlorine
        const delta = currentFc - targetFc;

        if (delta <= 0) {
            setResult(null);
            return;
        }

        // DOSING FACTORS (oz per 10k gal to reduce 1 ppm FC)
        // Anhydrous (100%): ~1.4 oz per 10k gal per 1 ppm
        // Pentahydrate (most common): ~2.0 oz per 10k gal per 1 ppm

        let baseFactor = 2.0;
        if (thiosulfateType === 'anhydrous') {
            baseFactor = 1.4;
        }

        const volFactor = volGal / 10000;
        const baseAmount = baseFactor * delta * volFactor;

        // Create a range (±15% for product variability)
        const minAmount = baseAmount * 0.85;
        const recommendedAmount = baseAmount;
        const maxAmount = baseAmount * 1.15;

        let displayUnit = 'oz weight';

        // Convert to metric if needed
        let displayMin = minAmount;
        let displayRec = recommendedAmount;
        let displayMax = maxAmount;

        if (unit === 'metric') {
            displayMin = minAmount * 28.35;
            displayRec = recommendedAmount * 28.35;
            displayMax = maxAmount * 28.35;
            displayUnit = 'grams';
        }

        // WARNINGS & NOTES
        const warnings: string[] = [];
        const notes: string[] = [];

        // Critical framing
        warnings.push("⚠️ EMERGENCY USE ONLY: For accidental overdose or swimmer safety.");
        warnings.push("NOT recommended for routine FC reduction. Use sunlight/time instead.");

        // Chloramine warning
        warnings.push("May temporarily increase combined chlorine (CC). Expect FC rebound or demand spike.");

        // Large dose warning
        if (delta > 5) {
            warnings.push("Large reduction (>5 ppm). Start with 50% dose, re-test after 2 hours.");
        }

        // Stability expectation
        notes.push("Chlorine readings may fluctuate for 24-72 hours after treatment.");

        // Pump guidance
        notes.push("Run pump continuously during treatment for even distribution.");
        notes.push("Avoid adding near skimmer. Broadcast evenly across pool surface.");

        // Alternative recommendation
        notes.push("If time allows, sunlight and aeration are safer methods.");

        setResult({
            minAmount: Math.round(displayMin * 10) / 10,
            recommendedAmount: Math.round(displayRec * 10) / 10,
            maxAmount: Math.round(displayMax * 10) / 10,
            unit: displayUnit,
            drop: Math.round(delta * 10) / 10,
            warnings,
            notes
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
            <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 w-full">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 mb-2">
                        <span className="p-2 bg-purple-100 text-purple-700 rounded-lg"><Eraser className="w-6 h-6" /></span>
                        <span className="text-xs font-bold tracking-widest text-slate-400 uppercase">Emergency Neutralizer</span>
                    </div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Chlorine Reduction Calculator</h1>
                    <p className="text-sm text-rose-600 font-semibold mt-2">⚠️ For Emergency Use Only</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* === LEFT COLUMN: INPUTS === */}
                    <div className="lg:col-span-7 space-y-4">

                        {/* 1. POOL VOLUME */}
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-slate-700 flex items-center gap-2 text-sm uppercase">
                                    <Droplets className="w-4 h-4 text-purple-500" /> Pool Volume
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
                                    className="w-full pl-4 pr-16 py-3 bg-slate-50 border-0 rounded-xl font-bold text-2xl text-slate-800 ring-1 ring-slate-200 focus:ring-2 focus:ring-purple-500 transition-all text-center"
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
                                className="w-full mt-3 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
                            />
                        </div>

                        {/* 2. CHLORINE LEVELS */}
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                            <h3 className="font-bold text-slate-700 flex items-center gap-2 mb-4 text-sm uppercase">
                                <Beaker className="w-4 h-4 text-purple-500" /> Free Chlorine (FC) Levels
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                            onClick={() => setInputs(p => ({ ...p, currentFc: Math.min(50, p.currentFc + 0.5) }))}
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
                                            className="flex-1 min-w-0 bg-slate-50 rounded-lg p-2 font-bold text-lg text-purple-600 border-none text-center"
                                        />
                                        <button
                                            onClick={() => setInputs(p => ({ ...p, targetFc: Math.min(20, p.targetFc + 0.5) }))}
                                            className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 active:scale-95 transition-all"
                                        >
                                            <Plus className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 3. THIOSULFATE TYPE */}
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                            <h3 className="font-bold text-slate-700 mb-4 text-sm uppercase">Sodium Thiosulfate Type</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <SelectionButton
                                    selected={inputs.thiosulfateType === 'pentahydrate'}
                                    onClick={() => setInputs(p => ({ ...p, thiosulfateType: 'pentahydrate' }))}
                                    label="Pentahydrate"
                                    subLabel="Most Common"
                                />
                                <SelectionButton
                                    selected={inputs.thiosulfateType === 'anhydrous'}
                                    onClick={() => setInputs(p => ({ ...p, thiosulfateType: 'anhydrous' }))}
                                    label="Anhydrous (100%)"
                                    subLabel="Higher Strength"
                                />
                            </div>
                            <p className="text-xs text-slate-500 mt-3">
                                Check product label. Most pool neutralizers are pentahydrate form.
                            </p>
                        </div>

                    </div>

                    {/* === RIGHT COLUMN: RESULTS === */}
                    <div className="lg:col-span-5 space-y-4">
                        <div className="bg-slate-900 text-white p-6 md:p-8 rounded-3xl shadow-2xl relative overflow-hidden">
                            <div className="relative z-10">
                                {result ? (
                                    <>
                                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-4">Estimated Dose Range</p>

                                        <div className="mb-6">
                                            <div className="flex items-baseline gap-2 mb-2">
                                                <span className="text-6xl font-black tracking-tighter text-purple-400">{result.recommendedAmount}</span>
                                                <span className="text-2xl font-bold text-slate-400">{result.unit}</span>
                                            </div>
                                            <div className="text-sm text-slate-400">
                                                Range: {result.minAmount} - {result.maxAmount} {result.unit}
                                            </div>
                                            <div className="inline-block bg-white/10 px-3 py-1 rounded-lg border border-white/5 mt-2">
                                                <span className="text-xs font-semibold text-white/90">
                                                    Reduces FC by ~{result.drop} ppm
                                                </span>
                                            </div>
                                        </div>

                                        <div className="h-px bg-white/10 w-full my-4"></div>

                                        {/* Warnings */}
                                        <div className="space-y-2 mb-4">
                                            {result.warnings.map((w, i) => (
                                                <div key={i} className="flex gap-2 text-xs text-rose-200 bg-rose-900/40 p-2 rounded-lg border border-rose-900/50">
                                                    <AlertOctagon className="w-4 h-4 flex-shrink-0" />
                                                    <span className="leading-snug">{w}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Notes */}
                                        <div className="space-y-2">
                                            <h4 className="flex items-center gap-2 text-[10px] font-bold text-purple-400 uppercase mb-2">
                                                <Info className="w-3 h-3" /> Critical Instructions
                                            </h4>
                                            {result.notes.map((n, i) => (
                                                <div key={i} className="flex gap-2 text-xs text-slate-300 items-start leading-snug">
                                                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-1.5 flex-shrink-0"></div>
                                                    <span>{n}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center text-slate-500 py-8">
                                        Current FC is lower than Target. No neutralizer needed.
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

export default SodiumThiosulfateCalculator;
