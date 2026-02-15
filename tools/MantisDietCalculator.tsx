import React, { useState, useEffect } from 'react';
import { 
    Scale, Calendar, Info, CheckCircle2, 
    ThermometerSun, AlertTriangle, Bug, UtensilsCrossed,
    Sparkles, ArrowRight, Zap, Droplets, Flame
} from 'lucide-react';

type InstarStage = 'L1' | 'L2' | 'L3' | 'L4' | 'L5' | 'L6' | 'L7' | 'L8' | 'adult';
type MantisSpecies = 'chinese' | 'carolina' | 'european' | 'orchid' | 'flower' | 'other';
type FeedingFrequency = 'daily' | 'everyOther' | 'every2-3' | 'weekly';

interface DietInputs {
    species: MantisSpecies;
    instarStage: InstarStage;
    feedingFrequency: FeedingFrequency;
    activeHunting: boolean;
    moltingSoon: boolean;
    showAdvanced: boolean;
}

interface DietResult {
    preySize: string;
    preyOptions: string[];
    recommendedPrey: string;
    feedingSchedule: string;
    feedingInterval: string;
    dailyAmount: number;
    feedingTimes: string[];
    gutLoad: string;
    waterSupplements: boolean;
    warnings: string[];
    tips: string[];
    instarInfo: string;
}

const INSTAR_PRESETS = {
    L1: { label: 'L1', age: '0-1 week', size: 'Tiny', frequency: 'daily', color: 'from-emerald-500 to-green-600' },
    L2: { label: 'L2', age: '1-2 weeks', size: 'XS', frequency: 'daily', color: 'from-teal-500 to-emerald-600' },
    L3: { label: 'L3', age: '2-3 weeks', size: 'Small', frequency: 'daily', color: 'from-cyan-500 to-teal-600' },
    L4: { label: 'L4', age: '3-4 weeks', size: 'Small-M', frequency: 'daily', color: 'from-blue-500 to-cyan-600' },
    L5: { label: 'L5', age: '4-5 weeks', size: 'Medium', frequency: 'everyOther', color: 'from-indigo-500 to-blue-600' },
    L6: { label: 'L6', age: '5-7 weeks', size: 'Med-Lg', frequency: 'everyOther', color: 'from-violet-500 to-indigo-600' },
    L7: { label: 'L7', age: '7-9 weeks', size: 'Large', frequency: 'every2-3', color: 'from-purple-500 to-violet-600' },
    L8: { label: 'L8', age: '9-11 weeks', size: 'XL', frequency: 'every2-3', color: 'from-fuchsia-500 to-purple-600' },
    adult: { label: 'Adult', age: '11+ weeks', size: 'Adult', frequency: 'weekly', color: 'from-pink-500 to-rose-600' },
};

const SPECIES_CONFIG = {
    chinese: { 
        name: 'Chinese Mantis', 
        scientific: 'Tenodera sinensis',
        emoji: '🦗',
        temperament: 'aggressive',
        preyPreference: 'crickets, moths',
        maxInstars: 8,
        dietVariety: 'high',
        gradient: 'from-amber-500 to-orange-600'
    },
    carolina: { 
        name: 'Carolina Mantis', 
        scientific: 'Stagmomantis carolina',
        emoji: '🍃',
        temperament: 'moderate',
        preyPreference: 'flies, small insects',
        maxInstars: 7,
        dietVariety: 'medium',
        gradient: 'from-emerald-500 to-teal-600'
    },
    european: { 
        name: 'European Mantis', 
        scientific: 'Mantis religiosa',
        emoji: '🌿',
        temperament: 'moderate',
        preyPreference: 'crickets, flies',
        maxInstars: 7,
        dietVariety: 'medium',
        gradient: 'from-blue-500 to-indigo-600'
    },
    orchid: { 
        name: 'Orchid Mantis', 
        scientific: 'Hymenopus coronatus',
        emoji: '🌸',
        temperament: 'passive',
        preyPreference: 'flies, moths',
        maxInstars: 6,
        dietVariety: 'high',
        gradient: 'from-pink-500 to-rose-600'
    },
    flower: { 
        name: 'Flower Mantis', 
        scientific: 'Pseudocreobotra wahlbergii',
        emoji: '🌺',
        temperament: 'moderate',
        preyPreference: 'flies, butterflies',
        maxInstars: 6,
        dietVariety: 'high',
        gradient: 'from-fuchsia-500 to-pink-600'
    },
    other: { 
        name: 'Other Species', 
        scientific: 'Various',
        emoji: '🦎',
        temperament: 'variable',
        preyPreference: 'varied insects',
        maxInstars: 7,
        dietVariety: 'medium',
        gradient: 'from-slate-500 to-gray-600'
    },
};

const PREY_SIZE_GUIDE = {
    L1: { 
        size: 'Micro', 
        options: ['Wingless fruit flies (Drosophila melanogaster)', 'Springtails (tiny)'],
        recommended: 'Drosophila melanogaster (2-3 per feeding)'
    },
    L2: { 
        size: 'Extra Small', 
        options: ['Hydei fruit flies', 'Small pinhead crickets', 'Aphids'],
        recommended: 'Drosophila hydei (3-5 per feeding)'
    },
    L3: { 
        size: 'Small', 
        options: ['Pinhead crickets', 'Small fruit flies', 'Small moths'],
        recommended: 'Pinhead crickets (3-5) or fruit flies (8-10)'
    },
    L4: { 
        size: 'Small-Medium', 
        options: ['Small crickets', 'Blue bottle flies', 'Small mealworms'],
        recommended: 'Small crickets (3-4) or blue bottle flies (4-6)'
    },
    L5: { 
        size: 'Medium', 
        options: ['Medium crickets', 'House flies', 'Mealworms'],
        recommended: 'Medium crickets (2-3) or house flies (3-5)'
    },
    L6: { 
        size: 'Medium-Large', 
        options: ['Large crickets', 'Moths', 'Large mealworms'],
        recommended: 'Large crickets (2-3) or moths (2-4)'
    },
    L7: { 
        size: 'Large', 
        options: ['XL crickets', 'Grasshoppers', 'Butterflies'],
        recommended: 'XL crickets (2-3) or grasshoppers (1-2)'
    },
    L8: { 
        size: 'Extra Large', 
        options: ['Adult crickets', 'Large moths', 'Wax moths'],
        recommended: 'Adult crickets (2) or large moths (2-3)'
    },
    adult: { 
        size: 'Adult', 
        options: ['Adult crickets', 'Large moths', 'Roaches', 'Grasshoppers'],
        recommended: 'Adult crickets (2-3) or roaches (1-2) per feeding'
    },
};

const FEEDING_SCHEDULE = {
    daily: { label: 'Daily', interval: 'Every 1 day', description: 'Best for young nymphs', color: 'from-green-500 to-emerald-600' },
    everyOther: { label: 'Every Other', interval: 'Every 2 days', description: 'For L5-L7 nymphs', color: 'from-blue-500 to-cyan-600' },
    'every2-3': { label: 'Every 2-3 Days', interval: 'Every 2-3 days', description: 'For L8 and large nymphs', color: 'from-purple-500 to-violet-600' },
    weekly: { label: 'Weekly', interval: 'Every 7 days', description: 'Adult maintenance', color: 'from-pink-500 to-rose-600' },
};

const MantisDietCalculator: React.FC = () => {
    const [inputs, setInputs] = useState<DietInputs>({
        species: 'chinese',
        instarStage: 'L4',
        feedingFrequency: 'daily',
        activeHunting: true,
        moltingSoon: false,
        showAdvanced: false
    });

    const [result, setResult] = useState<DietResult | null>(null);

    useEffect(() => {
        calculateDiet();
    }, [inputs.species, inputs.instarStage, inputs.feedingFrequency, inputs.activeHunting, inputs.moltingSoon]);

    const calculateDiet = () => {
        const { species, instarStage, feedingFrequency, activeHunting, moltingSoon } = inputs;
        const speciesConfig = SPECIES_CONFIG[species];
        const instarPreset = INSTAR_PRESETS[instarStage];
        const preyGuide = PREY_SIZE_GUIDE[instarStage];
        const feedingSchedule = FEEDING_SCHEDULE[feedingFrequency];

        let adjustedInterval = feedingSchedule.interval;
        let dailyAmount = 1;

        if (activeHunting) {
            if (feedingFrequency === 'weekly') {
                dailyAmount = 1.5;
            } else if (feedingFrequency === 'every2-3') {
                dailyAmount = 1.2;
            }
        }

        const warnings: string[] = [];
        const tips: string[] = [];
        let waterSupplements = true;

        if (moltingSoon) {
            warnings.push("🛑 MANTIS MOLTING SOON - Reduce or stop feeding until molt complete");
            warnings.push("⚠️ Prey can injure molting mantis - remove any uneaten prey immediately");
            tips.push("Mantises typically stop eating 1-2 days before molting");
            tips.push("Ensure humidity is elevated during molt (60-70%)");
            waterSupplements = false;
        }

        if (instarStage === 'L1' || instarStage === 'L2') {
            tips.push("Nymphs dry out quickly - mist lightly 1-2x daily");
            tips.push("Provide very small climbing surfaces for tiny nymphs");
            waterSupplements = false;
        }

        if (instarStage === 'adult') {
            tips.push("Adults are less active - watch for obesity");
            tips.push("Females may eat more frequently if breeding");
            if (species === 'chinese') {
                tips.push("Chinese mantis adults can handle larger prey like small roaches");
            }
        }

        if (activeHunting) {
            tips.push("Active hunters benefit from variety - rotate prey types weekly");
        }

        if (species === 'orchid' || species === 'flower') {
            tips.push("Flower mantises prefer flying insects - offer moths and flies");
            tips.push("These species can be picky - ensure prey is active and visible");
        }

        if (species === 'chinese') {
            tips.push("Chinese mantises are aggressive feeders - can handle slightly larger prey");
            tips.push("They're opportunistic - will eat almost anything that fits");
        }

        const instarInfo = `${instarPreset.label} (${instarPreset.age}) - ${speciesConfig.name}`;
        const feedingTimes = feedingFrequency === 'daily' ? ['Morning', 'Evening'] : feedingFrequency === 'everyOther' ? ['Day 1', 'Day 2'] : feedingFrequency === 'every2-3' ? ['Day 1', 'Day 2-3'] : ['Weekly'];

        setResult({
            preySize: preyGuide.size,
            preyOptions: preyGuide.options,
            recommendedPrey: preyGuide.recommended,
            feedingSchedule: feedingSchedule.description,
            feedingInterval: adjustedInterval,
            dailyAmount,
            feedingTimes,
            gutLoad: 'Feed prey nutrient-rich foods 24h before feeding',
            waterSupplements,
            warnings,
            tips,
            instarInfo
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 font-sans">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMCAwaDQwdjQwSDBWMHptMjAgMjBoMjB2MjBIMjBWMjB6TTAgMjBoMjB2MjBIMFYyMHoyMCAwaDIwdjIwSDIwVjB6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
                <div className="relative max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center p-4 bg-white/10 backdrop-blur-sm rounded-2xl mb-6 shadow-lg ring-1 ring-white/20">
                            <Bug className="w-12 h-12" />
                        </div>
                        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
                            Mantis Diet Calculator
                        </h1>
                        <p className="text-xl text-white/90 max-w-2xl mx-auto">
                            Calculate optimal prey size and feeding schedule for your praying mantis
                        </p>
                    </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-slate-50/50 to-transparent"></div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
                <div className="space-y-6">
                    
                    {/* Species Selection Card */}
                    <div className="bg-white rounded-3xl shadow-xl ring-1 ring-slate-900/5 overflow-hidden">
                        <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-6 py-4 border-b border-amber-100">
                            <h2 className="text-lg font-bold text-amber-900 flex items-center gap-2">
                                <span className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center text-white text-sm font-bold">1</span>
                                Select Species
                            </h2>
                        </div>
                        <div className="p-4 sm:p-6">
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {Object.entries(SPECIES_CONFIG).map(([key, config]) => (
                                    <button
                                        key={key}
                                        onClick={() => setInputs(prev => ({ ...prev, species: key as MantisSpecies }))}
                                        className={`group relative p-4 rounded-2xl border-2 transition-all duration-300 text-center
                                            ${inputs.species === key
                                                ? 'border-transparent bg-gradient-to-br ' + config.gradient + ' text-white shadow-lg scale-105'
                                                : 'border-slate-200 bg-white hover:border-brand-300 hover:shadow-md'}`}
                                    >
                                        <div className={`text-3xl mb-2 ${inputs.species === key ? 'text-white/90' : 'text-slate-600'}`}>
                                            {config.emoji}
                                        </div>
                                        <div className={`font-bold text-sm sm:text-base ${inputs.species === key ? 'text-white' : 'text-slate-900'}`}>
                                            {config.name}
                                        </div>
                                        <div className={`text-xs mt-1 ${inputs.species === key ? 'text-white/80' : 'text-slate-500'}`}>
                                            {config.scientific}
                                        </div>
                                        {inputs.species === key && (
                                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg">
                                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Instar Stage Card */}
                    <div className="bg-white rounded-3xl shadow-xl ring-1 ring-slate-900/5 overflow-hidden">
                        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-4 border-b border-indigo-100">
                            <h2 className="text-lg font-bold text-indigo-900 flex items-center gap-2">
                                <span className="w-7 h-7 rounded-lg bg-indigo-500 flex items-center justify-center text-white text-sm font-bold">2</span>
                                Growth Stage
                            </h2>
                        </div>
                        <div className="p-4 sm:p-6">
                            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3">
                                {Object.entries(INSTAR_PRESETS).map(([key, preset]) => (
                                    <button
                                        key={key}
                                        onClick={() => setInputs(prev => ({ ...prev, instarStage: key as InstarStage }))}
                                        className={`group relative p-3 sm:p-4 rounded-2xl border-2 transition-all duration-300 text-center
                                            ${inputs.instarStage === key
                                                ? 'border-transparent bg-gradient-to-br ' + preset.color + ' text-white shadow-lg scale-105'
                                                : 'border-slate-200 bg-white hover:border-brand-300 hover:shadow-md'}`}
                                    >
                                        <div className={`font-bold text-lg sm:text-xl ${inputs.instarStage === key ? 'text-white' : 'text-slate-900'}`}>
                                            {preset.label}
                                        </div>
                                        <div className={`text-xs mt-1 ${inputs.instarStage === key ? 'text-white/80' : 'text-slate-500'}`}>
                                            {preset.age}
                                        </div>
                                        {inputs.instarStage === key && (
                                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg">
                                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Feeding Frequency Card */}
                    <div className="bg-white rounded-3xl shadow-xl ring-1 ring-slate-900/5 overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-6 py-4 border-b border-blue-100">
                            <h2 className="text-lg font-bold text-blue-900 flex items-center gap-2">
                                <span className="w-7 h-7 rounded-lg bg-blue-500 flex items-center justify-center text-white text-sm font-bold">3</span>
                                Feeding Frequency
                            </h2>
                        </div>
                        <div className="p-4 sm:p-6">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {Object.entries(FEEDING_SCHEDULE).map(([key, schedule]) => (
                                    <button
                                        key={key}
                                        onClick={() => setInputs(prev => ({ ...prev, feedingFrequency: key as FeedingFrequency }))}
                                        className={`group relative p-4 rounded-2xl border-2 transition-all duration-300 text-center
                                            ${inputs.feedingFrequency === key
                                                ? 'border-transparent bg-gradient-to-br ' + schedule.color + ' text-white shadow-lg scale-105'
                                                : 'border-slate-200 bg-white hover:border-brand-300 hover:shadow-md'}`}
                                    >
                                        <div className={`font-bold text-sm sm:text-base ${inputs.feedingFrequency === key ? 'text-white' : 'text-slate-900'}`}>
                                            {schedule.label}
                                        </div>
                                        <div className={`text-xs mt-1 ${inputs.feedingFrequency === key ? 'text-white/80' : 'text-slate-500'}`}>
                                            {schedule.description}
                                        </div>
                                        {inputs.feedingFrequency === key && (
                                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg">
                                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Advanced Options Toggle */}
                    <button
                        onClick={() => setInputs(prev => ({ ...prev, showAdvanced: !prev.showAdvanced }))}
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white p-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-between group"
                    >
                        <div className="flex items-center gap-3">
                            <Sparkles className="w-5 h-5" />
                            <span className="font-semibold">Advanced Options</span>
                        </div>
                        <ArrowRight className={`w-5 h-5 transition-transform duration-300 ${inputs.showAdvanced ? 'rotate-90' : ''}`} />
                    </button>

                    {/* Advanced Options Panel */}
                    {inputs.showAdvanced && (
                        <div className="bg-white rounded-3xl shadow-xl ring-1 ring-slate-900/5 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                            <div className="p-4 sm:p-6 space-y-4">
                                <label className="flex items-center gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl cursor-pointer hover:from-green-100 hover:to-emerald-100 transition-colors border border-green-200">
                                    <input
                                        type="checkbox"
                                        checked={inputs.activeHunting}
                                        onChange={(e) => setInputs(prev => ({ ...prev, activeHunting: e.target.checked }))}
                                        className="w-6 h-6 rounded-lg border-green-300 text-green-600 focus:ring-green-500"
                                    />
                                    <div className="flex-1">
                                        <div className="font-bold text-slate-900 flex items-center gap-2">
                                            <Zap className="w-4 h-4 text-green-600" />
                                            Active Hunter
                                        </div>
                                        <div className="text-sm text-slate-600 mt-1">Increase feeding for active hunting behavior</div>
                                    </div>
                                </label>

                                <label className="flex items-center gap-4 p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl cursor-pointer hover:from-red-100 hover:to-orange-100 transition-colors border border-red-200">
                                    <input
                                        type="checkbox"
                                        checked={inputs.moltingSoon}
                                        onChange={(e) => setInputs(prev => ({ ...prev, moltingSoon: e.target.checked }))}
                                        className="w-6 h-6 rounded-lg border-red-300 text-red-600 focus:ring-red-500"
                                    />
                                    <div className="flex-1">
                                        <div className="font-bold text-slate-900 flex items-center gap-2">
                                            <Flame className="w-4 h-4 text-red-600" />
                                            Molting Soon
                                        </div>
                                        <div className="text-sm text-slate-600 mt-1">Reduce/stop feeding before molt</div>
                                    </div>
                                </label>
                            </div>
                        </div>
                    )}

                    {/* Results Section */}
                    {result && (
                        <div className="space-y-6 animate-in zoom-in-95 duration-500">
                            {/* Main Result Card */}
                            <div className="bg-white rounded-3xl shadow-2xl ring-1 ring-slate-900/5 overflow-hidden">
                                <div className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 text-white p-6 sm:p-8">
                                    <div className="text-sm text-white/80 mb-2">{result.instarInfo}</div>
                                    <div className="text-2xl sm:text-3xl font-extrabold mb-2">Recommended Prey</div>
                                    <div className="flex items-center gap-3">
                                        <div className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl font-bold text-lg sm:text-xl">
                                            {result.preySize} Size
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 sm:p-8">
                                    {/* Primary Recommendation */}
                                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-5 mb-6">
                                        <div className="text-xs text-green-600 font-bold uppercase tracking-wider mb-2">Primary Recommendation</div>
                                        <div className="text-lg sm:text-xl font-bold text-green-900">{result.recommendedPrey}</div>
                                    </div>

                                    {/* Info Grid */}
                                    <div className="grid sm:grid-cols-2 gap-4 mb-6">
                                        <div className="bg-slate-50 rounded-2xl p-4">
                                            <div className="text-xs text-slate-500 font-bold uppercase mb-2">Feeding Schedule</div>
                                            <div className="font-bold text-slate-900">{result.feedingInterval}</div>
                                            <div className="text-sm text-slate-600 mt-1">{result.feedingSchedule}</div>
                                        </div>

                                        <div className="bg-slate-50 rounded-2xl p-4">
                                            <div className="text-xs text-slate-500 font-bold uppercase mb-2">Prey Options</div>
                                            <ul className="space-y-1">
                                                {result.preyOptions.slice(0, 3).map((option, idx) => (
                                                    <li key={idx} className="text-sm text-slate-700">• {option}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>

                                    {/* Gut Load */}
                                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-5 mb-6">
                                        <div className="flex items-start gap-3">
                                            <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <div className="font-bold text-blue-900 mb-2">Gut Loading</div>
                                                <div className="text-sm text-blue-800">{result.gutLoad}</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Warnings */}
                                    {result.warnings.length > 0 && (
                                        <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-2xl p-5 mb-6">
                                            <div className="flex items-start gap-3">
                                                <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                                                <div className="flex-1">
                                                    <div className="font-bold text-red-900 mb-3">Critical Warnings</div>
                                                    <ul className="space-y-2">
                                                        {result.warnings.map((warning, idx) => (
                                                            <li key={idx} className="text-sm text-red-800">{warning}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Tips */}
                                    {result.tips.length > 0 && (
                                        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl p-5">
                                            <div className="flex items-start gap-3">
                                                <Sparkles className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                                                <div className="flex-1">
                                                    <div className="font-bold text-amber-900 mb-3">Pro Tips</div>
                                                    <ul className="space-y-2">
                                                        {result.tips.map((tip, idx) => (
                                                            <li key={idx} className="text-sm text-amber-800">{tip}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className="mt-16 py-8 text-center text-slate-500 text-sm">
                <p>Mantis Diet Calculator • Optimized for all growth stages</p>
            </div>
        </div>
    );
};

export default MantisDietCalculator;
