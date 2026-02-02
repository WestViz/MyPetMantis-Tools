import React, { useState, useEffect } from 'react';
import { useIframeResize } from '../hooks/useIframeResize';
import {
    Zap,
    Clock,
    DollarSign,
    CheckCircle2,
    Minus,
    Plus,
    Gauge,
    Lightbulb,
    ArrowRight
} from 'lucide-react';

// ----------------------------------------------------------------------
// TYPES
// ----------------------------------------------------------------------

type PumpType = 'single_speed' | 'variable_speed';

export interface ElectricityInputs {
    pumpType: PumpType;
    horsepower: number; // For Single Speed
    averageWatts: number; // For Variable Speed (simplified entry) or Custom
    hoursPerDay: number;
    kwhRate: number; // $ per kWh
    daysPerSeason: number; // 365 or less
}

export interface ElectricityResult {
    dailyCost: number;
    monthlyCost: number;
    seasonalCost: number;
    kwhDaily: number;
    isVariableSpeed: boolean;
    moneyBurn: 'low' | 'medium' | 'high';
}

// ----------------------------------------------------------------------
// CONSTANTS & HELPERS
// ----------------------------------------------------------------------

// Estimate Watts based on HP for single speed pumps (inefficient induction motors)
// 1 HP output ~ 0.746 kW, but input power is higher due to efficiency (~60-70% for old pumps)
// Rough approximation: Input Watts = HP * 1200 (conservative estimate for service factor + inefficiency)
const ESTIMATED_WATTS_PER_HP = 1300;

const StepButton = ({ onClick, icon: Icon }: { onClick: () => void, icon: any }) => (
    <button
        onClick={onClick}
        className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 active:scale-95 transition-all touch-manipulation"
    >
        <Icon className="w-5 h-5 md:w-6 md:h-6" />
    </button>
);

const SelectionButton = ({ selected, onClick, label, icon: Icon, subLabel }: { selected: boolean, onClick: () => void, label: string, icon?: any, subLabel?: string }) => (
    <button
        onClick={onClick}
        className={`relative p-3 md:p-4 rounded-xl border-2 text-left transition-all duration-200 w-full touch-manipulation flex flex-col justify-center min-h-[80px]
      ${selected
                ? 'border-yellow-400 bg-yellow-50/50 ring-2 ring-yellow-200 ring-offset-1 z-10'
                : 'border-slate-100 bg-slate-50 hover:bg-slate-100 text-slate-500'}`}
    >
        <div className="flex items-center gap-2 mb-1">
            {Icon && <Icon className={`w-4 h-4 ${selected ? 'text-yellow-600' : 'text-slate-400'}`} />}
            <div className={`font-bold text-sm md:text-base ${selected ? 'text-yellow-900' : 'text-slate-700'}`}>{label}</div>
        </div>
        {subLabel && <div className={`text-xs ${selected ? 'text-yellow-700' : 'text-slate-400'}`}>{subLabel}</div>}
        {selected && <div className="absolute top-2 right-2 text-yellow-500"><CheckCircle2 className="w-4 h-4" /></div>}
    </button>
);

// ----------------------------------------------------------------------
// MAIN COMPONENT
// ----------------------------------------------------------------------

const ElectricityCostCalculator: React.FC = () => {
    useIframeResize();

    const [inputs, setInputs] = useState<ElectricityInputs>({
        pumpType: 'single_speed',
        horsepower: 1.5,
        averageWatts: 300, // typical low speed variable
        hoursPerDay: 8,
        kwhRate: 0.16, // National avg roughly
        daysPerSeason: 365,
    });

    const [result, setResult] = useState<ElectricityResult | null>(null);

    useEffect(() => {
        calculateCost();
    }, [inputs]);

    const calculateCost = () => {
        let watts = 0;

        if (inputs.pumpType === 'single_speed') {
            watts = inputs.horsepower * ESTIMATED_WATTS_PER_HP;
        } else {
            // For variable speed, user enters avg watts. 
            // Often they run 20h @ 150w and 4h @ 2000w. 
            // Logic would be complex, so we stick to "Average Wattage" input for VSP 
            // or provide presets. Let's use the 'averageWatts' state directly.
            watts = inputs.averageWatts;
        }

        const kW = watts / 1000;
        const kwhDaily = kW * inputs.hoursPerDay;
        const dailyCost = kwhDaily * inputs.kwhRate;
        const monthlyCost = dailyCost * 30.4;
        const seasonalCost = dailyCost * inputs.daysPerSeason;

        // Determine burn rate
        let moneyBurn: ElectricityResult['moneyBurn'] = 'low';
        if (monthlyCost > 50) moneyBurn = 'medium';
        if (monthlyCost > 120) moneyBurn = 'high';

        setResult({
            dailyCost,
            monthlyCost,
            seasonalCost,
            kwhDaily,
            isVariableSpeed: inputs.pumpType === 'variable_speed',
            moneyBurn
        });
    };

    const handleInputUpdate = (key: keyof ElectricityInputs, value: any) => {
        setInputs(prev => ({ ...prev, [key]: value }));
    };

    return (
        <div className="glass-panel text-slate-900 rounded-[2rem] shadow-xl bg-white/90 backdrop-blur-md border border-slate-200 p-4 md:p-8 relative overflow-hidden max-w-5xl mx-auto">

            {/* Background Decor */}
            <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-yellow-400/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 w-full">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 mb-2">
                        <span className="p-2 bg-yellow-100 text-yellow-700 rounded-lg"><Zap className="w-6 h-6" /></span>
                        <span className="text-xs font-bold tracking-widest text-slate-400 uppercase">Pool Tools</span>
                    </div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Pump Energy Cost</h1>
                    <p className="text-slate-500 text-sm mt-2 max-w-md mx-auto">See how much your pool pump costs to run and find savings.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* === LEFT COLUMN: INPUTS === */}
                    <div className="lg:col-span-7 space-y-6">

                        {/* CARD 1: PUMP CONFIG */}
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                            <h3 className="font-bold text-slate-700 flex items-center gap-2 mb-4">
                                <Gauge className="w-5 h-5 text-yellow-500" /> Pump Configuration
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                                <SelectionButton
                                    label="Single Speed"
                                    subLabel="Traditional / Standard"
                                    selected={inputs.pumpType === 'single_speed'}
                                    onClick={() => handleInputUpdate('pumpType', 'single_speed')}
                                />
                                <SelectionButton
                                    label="Variable Speed"
                                    subLabel="Modern / Efficient"
                                    selected={inputs.pumpType === 'variable_speed'}
                                    onClick={() => handleInputUpdate('pumpType', 'variable_speed')}
                                />
                            </div>

                            {/* Dynamic Input based on Pump Type */}
                            {inputs.pumpType === 'single_speed' ? (
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase">Pump Horsepower (HP)</label>
                                    <div className="flex items-center gap-2">
                                        <StepButton onClick={() => handleInputUpdate('horsepower', Math.max(0.5, inputs.horsepower - 0.25))} icon={Minus} />
                                        <div className="flex-1 text-center font-bold text-xl text-slate-800">
                                            {inputs.horsepower.toFixed(2)} <span className="text-xs text-slate-400 font-normal">HP</span>
                                        </div>
                                        <StepButton onClick={() => handleInputUpdate('horsepower', inputs.horsepower + 0.25)} icon={Plus} />
                                    </div>
                                    <p className="text-[10px] text-center text-slate-300">Est. Power Draft: {Math.round(inputs.horsepower * ESTIMATED_WATTS_PER_HP)} Watts</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase">Average Running Watts</label>
                                    <div className="flex items-center gap-2">
                                        <StepButton onClick={() => handleInputUpdate('averageWatts', Math.max(50, inputs.averageWatts - 50))} icon={Minus} />
                                        <div className="flex-1 relative">
                                            <input
                                                type="number"
                                                value={inputs.averageWatts}
                                                onChange={(e) => handleInputUpdate('averageWatts', parseFloat(e.target.value) || 0)}
                                                className="w-full bg-transparent text-center font-bold text-xl text-slate-800 border-none focus:ring-0 p-0"
                                            />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-normal pointer-events-none">W</span>
                                        </div>
                                        <StepButton onClick={() => handleInputUpdate('averageWatts', inputs.averageWatts + 50)} icon={Plus} />
                                    </div>
                                    <p className="text-[10px] text-center text-slate-400 mt-1">Check your VSP display for current watts (e.g., 300W on low)</p>
                                </div>
                            )}
                        </div>

                        {/* CARD 2: SCHEDULE & RATES */}
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                            <h3 className="font-bold text-slate-700 flex items-center gap-2 mb-6">
                                <Clock className="w-5 h-5 text-blue-500" /> Schedule & Rates
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase">Hours Per Day</label>
                                    <div className="flex items-center gap-2">
                                        <StepButton onClick={() => handleInputUpdate('hoursPerDay', Math.max(1, inputs.hoursPerDay - 1))} icon={Minus} />
                                        <div className="flex-1 text-center font-bold text-xl text-slate-800">
                                            {inputs.hoursPerDay} <span className="text-xs text-slate-400 font-normal">hrs</span>
                                        </div>
                                        <StepButton onClick={() => handleInputUpdate('hoursPerDay', Math.min(24, inputs.hoursPerDay + 1))} icon={Plus} />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase">Rate ($/kWh)</label>
                                    <div className="flex items-center gap-2">
                                        <StepButton onClick={() => handleInputUpdate('kwhRate', Math.max(0.01, parseFloat((inputs.kwhRate - 0.01).toFixed(2))))} icon={Minus} />
                                        <div className="flex-1 relative">
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={inputs.kwhRate}
                                                onChange={(e) => handleInputUpdate('kwhRate', parseFloat(e.target.value) || 0)}
                                                className="w-full bg-transparent text-center font-bold text-xl text-slate-800 border-none focus:ring-0 p-0"
                                            />
                                            <span className="absolute left-8 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-bold pointer-events-none">$</span>
                                        </div>
                                        <StepButton onClick={() => handleInputUpdate('kwhRate', parseFloat((inputs.kwhRate + 0.01).toFixed(2)))} icon={Plus} />
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* === RIGHT COLUMN: RESULTS === */}
                    <div className="lg:col-span-5 space-y-6">

                        {/* Result Card */}
                        <div className={`text-white p-5 md:p-8 rounded-3xl shadow-2xl relative overflow-hidden h-full flex flex-col justify-center transition-colors duration-500
                            ${result?.moneyBurn === 'high' ? 'bg-rose-900' : result?.moneyBurn === 'medium' ? 'bg-yellow-700' : 'bg-slate-900'}`}>

                            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                                <DollarSign className="w-64 h-64" />
                            </div>

                            <div className="relative z-10">
                                <div className="mb-6">
                                    <p className="text-white/60 font-bold uppercase tracking-widest text-[10px] md:text-xs mb-1">Estimated Monthly Cost</p>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-2xl font-bold text-white/60">$</span>
                                        <span className="text-6xl font-black tracking-tighter text-white">
                                            {result?.monthlyCost.toFixed(0)}
                                        </span>
                                        <span className="text-xl font-bold text-white/60">.{(result?.monthlyCost % 1).toFixed(2).substring(2)}</span>
                                    </div>
                                    <p className="text-white/50 text-xs md:text-sm font-medium mt-1">
                                        Based on {inputs.hoursPerDay} hours/day
                                    </p>
                                </div>

                                {result && (
                                    <div className="space-y-4">
                                        <div className="h-px bg-white/10 w-full mb-4 md:mb-6"></div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-black/20 p-4 rounded-xl border border-white/5 backdrop-blur-sm">
                                                <p className="text-[10px] text-white/60 uppercase font-bold mb-1">Daily Cost</p>
                                                <div className="text-xl font-bold">
                                                    ${result.dailyCost.toFixed(2)}
                                                </div>
                                            </div>

                                            <div className="bg-black/20 p-4 rounded-xl border border-white/5 backdrop-blur-sm">
                                                <p className="text-[10px] text-white/60 uppercase font-bold mb-1">Yearly Cost</p>
                                                <div className="text-xl font-bold">
                                                    ${result.seasonalCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                                </div>
                                            </div>
                                        </div>

                                        {!result.isVariableSpeed && result.moneyBurn !== 'low' && (
                                            <div className="flex gap-3 text-sm text-yellow-200 bg-yellow-950/40 p-3 rounded-lg border border-yellow-500/20">
                                                <Lightbulb className="w-5 h-5 flex-shrink-0" />
                                                <span className="leading-snug">
                                                    <strong>Pro Tip:</strong> A Variable Speed Pump running at low RPM could save you ${(result.monthlyCost * 0.7).toFixed(0)}/mo.
                                                </span>
                                            </div>
                                        )}
                                        {result.isVariableSpeed && (
                                            <div className="flex gap-3 text-sm text-green-200 bg-green-950/40 p-3 rounded-lg border border-green-500/20">
                                                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                                                <span className="leading-snug">
                                                    Excellent! Variable speed pumps are the most efficient way to circulate water.
                                                </span>
                                            </div>
                                        )}
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

export default ElectricityCostCalculator;
