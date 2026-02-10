import React, { useState, useEffect } from 'react';
import { 
    Scale, Calendar, Info, CheckCircle2, 
    ThermometerSun, AlertTriangle, Leaf, Bug, UtensilsCrossed
} from 'lucide-react';

type AgeGroup = 'hatchling' | 'juvenile' | 'adult';
type ActivityLevel = 'normal' | 'brumation' | 'breeding' | 'sick';
type GeckoSpecies = 'leopard' | 'crested' | 'gargoyle' | 'other';

interface DietInputs {
    weight: number;
    species: GeckoSpecies;
    ageGroup: AgeGroup;
    activityLevel: ActivityLevel;
    includeGreens: boolean;
    includeInsects: boolean;
    supplements: boolean;
    fruitFrequency: 'never' | 'occasional' | 'weekly';
}

interface DietResult {
    dailyInsects: number;
    dailyGreens: number;
    feedingFrequency: number;
    proteinRatio: number;
    vegRatio: number;
    fruitAmount: string;
    supplementsPerWeek: number;
    calciumSchedule: string;
    vitaminSchedule: string;
    warnings: string[];
    tips: string[];
}

const AGE_PRESETS = {
    hatchling: { w: 5, label: 'Hatchling (0-3 mo)', freq: 2 },
    juvenile: { w: 25, label: 'Juvenile (3-12 mo)', freq: 1 },
    adult: { w: 50, label: 'Adult (12+ mo)', freq: 1 },
};

const SPECIES_CONFIG = {
    leopard: { name: 'Leopard Gecko', insectRatio: 1.0, fruitRatio: 0, maxWeight: 120 },
    crested: { name: 'Crested Gecko', insectRatio: 0.3, fruitRatio: 1.0, maxWeight: 60 },
    gargoyle: { name: 'Gargoyle Gecko', insectRatio: 0.4, fruitRatio: 0.8, maxWeight: 80 },
    other: { name: 'Other Gecko', insectRatio: 0.6, fruitRatio: 0.3, maxWeight: 100 },
};

const ACTIVITY_PRESETS = {
    normal: { label: 'Normal', multiplier: 1.0, desc: 'Active & Healthy' },
    brumation: { label: 'Brumation', multiplier: 0.3, desc: 'Winter Sleep' },
    breeding: { label: 'Breeding', multiplier: 1.3, desc: 'Breeding Season' },
    sick: { label: 'Recovery', multiplier: 0.7, desc: 'Illness/Recovery' },
};

const FRUIT_CONFIG = {
    never: { label: 'Never', desc: 'No fruit' },
    occasional: { label: 'Occasional', desc: '1-2x/month' },
    weekly: { label: 'Weekly', desc: '1x/week' },
};

// Selection Button Component
const SelectionButton = ({ selected, onClick, label, subLabel, icon: Icon }: any) => (
    <button 
        onClick={onClick} 
        className={`relative p-2 md:p-3 rounded-xl border transition-all duration-200 w-full touch-manipulation flex flex-col justify-center items-center text-center h-full
        ${selected 
            ? 'border-brand-600 bg-brand-50 ring-1 ring-brand-500' 
            : 'border-brand-200 bg-white hover:bg-brand-50/50 text-slate-500'}`}
    >
        {Icon && <Icon className={`w-5 h-5 mb-1 ${selected ? 'text-brand-600' : 'text-slate-400'}`} />}
        <div className={`font-bold text-xs md:text-sm ${selected ? 'text-brand-900' : 'text-slate-700'}`}>{label}</div>
        {subLabel && <div className={`text-[10px] mt-0.5 leading-tight ${selected ? 'text-brand-700' : 'text-slate-400'}`}>{subLabel}</div>}
        {selected && <div className="absolute top-1 right-1 text-brand-600"><CheckCircle2 className="w-3 h-3" /></div>}
    </button>
);

// Slider Input Component
const WeightSlider = ({ label, value, min, max, step, unit, onChange }: any) => (
    <div className="bg-brand-50/50 p-3 rounded-xl border border-brand-200/50">
        <div className="flex justify-between mb-2">
            <span className="text-xs font-bold text-brand-700 uppercase">{label}</span>
            <span className="text-xs font-bold text-brand-900 bg-white px-2 py-0.5 rounded-md shadow-sm border border-brand-200">
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
            className="w-full h-2 bg-brand-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
        />
    </div>
);

const GeckoDietCalculator: React.FC = () => {
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [inputs, setInputs] = useState<DietInputs>({
        weight: 50,
        species: 'leopard',
        ageGroup: 'adult',
        activityLevel: 'normal',
        includeGreens: true,
        includeInsects: true,
        supplements: true,
        fruitFrequency: 'never'
    });

    const [result, setResult] = useState<DietResult | null>(null);

    useEffect(() => {
        calculateDiet();
    }, [inputs.weight, inputs.species, inputs.ageGroup, inputs.activityLevel, inputs.includeGreens, inputs.includeInsects, inputs.supplements, inputs.fruitFrequency]);

    const calculateDiet = () => {
        const { weight, species, ageGroup, activityLevel, includeGreens, includeInsects, supplements, fruitFrequency } = inputs;
        const speciesConfig = SPECIES_CONFIG[species];

        // Base calculations by age and species
        let baseInsects = 0;
        let baseGreens = 0;
        let feedingFreq = 1;

        const activityMultiplier = ACTIVITY_PRESETS[activityLevel].multiplier;

        switch (ageGroup) {
            case 'hatchling':
                baseInsects = Math.round((weight * 0.2) * speciesConfig.insectRatio);
                baseGreens = Math.round((weight * 0.02) * speciesConfig.fruitRatio);
                feedingFreq = species === 'leopard' ? 2 : 1;
                break;
            case 'juvenile':
                baseInsects = Math.round((weight * 0.15) * speciesConfig.insectRatio);
                baseGreens = Math.round((weight * 0.05) * speciesConfig.fruitRatio);
                feedingFreq = 1;
                break;
            case 'adult':
                baseInsects = Math.round((weight * 0.1) * speciesConfig.insectRatio);
                baseGreens = Math.round((weight * 0.08) * speciesConfig.fruitRatio);
                feedingFreq = 1;
                break;
        }

        // Apply activity multiplier
        const adjustedInsects = Math.round(baseInsects * activityMultiplier);
        const adjustedGreens = Math.round(baseGreens * activityMultiplier);

        // Calculate ratios
        const totalFood = adjustedInsects + adjustedGreens;
        const proteinRatio = totalFood > 0 ? Math.round((adjustedInsects / totalFood) * 100) : 0;
        const vegRatio = totalFood > 0 ? Math.round((adjustedGreens / totalFood) * 100) : 0;

        // Fruit amount
        const fruitAmounts = {
            never: 'No fruit recommended',
            occasional: 'Treat only - max 1-2x monthly',
            weekly: 'Small portion - 1x weekly max'
        };

        // Supplements based on species and age
        let supplementsPerWeek = 0;
        let calciumSchedule = '';
        let vitaminSchedule = '';

        if (supplements) {
            if (species === 'leopard') {
                if (ageGroup === 'hatchling') {
                    supplementsPerWeek = 7;
                    calciumSchedule = 'Every feeding';
                    vitaminSchedule = '1-2x/week';
                } else if (ageGroup === 'juvenile') {
                    supplementsPerWeek = 5;
                    calciumSchedule = '4-5x/week';
                    vitaminSchedule = '1-2x/week';
                } else {
                    supplementsPerWeek = 3;
                    calciumSchedule = '3x/week';
                    vitaminSchedule = '1x/week';
                }
            } else if (species === 'crested' || species === 'gargoyle') {
                supplementsPerWeek = 2;
                calciumSchedule = '2x/week';
                vitaminSchedule = '1x/week (in CGD)';
            } else {
                supplementsPerWeek = 4;
                calciumSchedule = '3-4x/week';
                vitaminSchedule = '1-2x/week';
            }
        }

        // Warnings
        const warnings: string[] = [];
        if (weight < 2) warnings.push("⚠️ Very small gecko - consult a vet for feeding guidance.");
        if (weight > speciesConfig.maxWeight) warnings.push(`🦎 Exceeds typical max weight for ${speciesConfig.name} - monitor closely.`);
        if (ageGroup === 'adult' && proteinRatio > 30 && species === 'leopard') warnings.push("📏 Adult leopard geckos should have lower protein to prevent obesity.");
        if (activityLevel === 'brumation' && adjustedInsects > 0) warnings.push("💤 During brumation, food should be minimal or stopped.");
        if (species === 'crested' && fruitFrequency === 'never') warnings.push("🍎 Crested geckos benefit from fruit - consider occasional treats.");
        if (species === 'leopard' && fruitFrequency === 'weekly') warnings.push("⚠️ Leopard geckos should rarely eat fruit - switch to occasional treats only.");

        // Tips
        const tips: string[] = [];
        if (species === 'leopard') {
            if (ageGroup === 'hatchling') {
                tips.push("Dust all insects with calcium powder at every feeding.");
                tips.push("Feed crickets or dubia roises sized no larger than the space between eyes.");
            } else if (ageGroup === 'adult') {
                tips.push("Adults need fewer insects - focus on proper gut-loading.");
                tips.push("Waxworms are high-fat treats only - feed sparingly.");
            }
        } else if (species === 'crested') {
            tips.push("Use commercial crested gecko diet (CGD) as staple.");
            tips.push("Insects are occasional treats - roaches and crickets work well.");
            tips.push("Mist enclosure daily - crested geckos drink water droplets.");
        } else if (species === 'gargoyle') {
            tips.push("Gargoyles are more insectivorous than crested geckos.");
            tips.push("Provide climbing branches - they are active climbers.");
        }

        if (activityLevel === 'breeding') {
            tips.push("Breeding geckos need extra calcium - supplement more frequently.");
        }

        setResult({
            dailyInsects: includeInsects ? adjustedInsects : 0,
            dailyGreens: includeGreens ? adjustedGreens : 0,
            feedingFrequency: feedingFreq,
            proteinRatio,
            vegRatio,
            fruitAmount: fruitAmounts[fruitFrequency],
            supplementsPerWeek,
            calciumSchedule,
            vitaminSchedule,
            warnings,
            tips
        });
    };

    const applyPreset = (key: keyof typeof AGE_PRESETS) => {
        const p = AGE_PRESETS[key];
        setInputs(prev => ({
            ...prev,
            weight: p.w,
            ageGroup: key
        }));
    };

    return (
        <div className="glass-panel text-slate-900 rounded-[2rem] shadow-xl bg-white/95 backdrop-blur-md border border-brand-700/20 p-0 md:p-8 relative overflow-hidden max-w-6xl mx-auto font-sans">
            
            {/* Sticky Mobile Header Result */}
            <div className="lg:hidden sticky top-0 z-40 bg-brand-900 text-brand-100 p-4 shadow-lg flex justify-between items-center border-b border-brand-800/30">
                <div>
                    <div className="text-[10px] uppercase tracking-wider opacity-70">Daily Food</div>
                    <div className="text-2xl font-black text-white leading-none">
                        {result ? result.dailyInsects + result.dailyGreens : 0}g
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-[10px] uppercase tracking-wider opacity-70">Feedings</div>
                    <div className="font-bold text-white text-sm">{result?.feedingFrequency}x/day</div>
                </div>
            </div>

            <div className="p-4 md:p-0 relative z-10 w-full">
                <div className="text-center mb-6 md:mb-8 pt-4 md:pt-0">
                    <div className="inline-flex items-center gap-2 mb-2">
                        <span className="p-1.5 bg-brand-100 text-brand-700 rounded-lg"><UtensilsCrossed className="w-5 h-5" /></span>
                        <span className="text-[10px] font-bold tracking-widest text-brand-700 uppercase">2026 Calculator</span>
                    </div>
                    <h1 className="text-2xl md:text-4xl font-black text-brand-900 tracking-tight">Gecko Diet Calculator</h1>
                    <p className="text-xs text-brand-700 mt-1">Personalized Nutrition for Every Gecko Species</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* INPUTS COLUMN */}
                    <div className="lg:col-span-7 space-y-5">

                        {/* Species Selection */}
                        <div className="bg-white p-5 rounded-3xl shadow-sm border border-brand-700/10">
                            <h3 className="font-bold text-brand-900 text-sm uppercase tracking-wide mb-3 flex items-center gap-2">
                                <Scale className="w-4 h-4 text-brand-600" /> Gecko Species
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {Object.entries(SPECIES_CONFIG).map(([key, data]) => (
                                    <SelectionButton 
                                        key={key}
                                        selected={inputs.species === key} 
                                        onClick={() => setInputs(p => ({ ...p, species: key as GeckoSpecies }))} 
                                        label={data.name} 
                                        subLabel={`Max ${data.maxWeight}g`}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Age Presets & Weight */}
                        <div className="bg-white p-5 rounded-3xl shadow-sm border border-brand-700/10">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-brand-900 text-sm uppercase tracking-wide flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-brand-600" /> Age & Weight
                                </h3>
                            </div>

                            <div className="grid grid-cols-3 gap-3 mb-6">
                                {Object.entries(AGE_PRESETS).map(([key, data]) => (
                                    <button 
                                        key={key}
                                        onClick={() => applyPreset(key as keyof typeof AGE_PRESETS)}
                                        className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all text-center h-full group ${
                                            inputs.ageGroup === key 
                                                ? 'bg-brand-50 border-brand-600 text-brand-900' 
                                                : 'bg-slate-50 border-slate-200 hover:border-brand-400 hover:bg-brand-50/30 text-slate-700'
                                        }`}
                                    >
                                        <div className="text-xs font-bold leading-tight">{data.label}</div>
                                        <div className="text-[10px] text-slate-400 mt-1">~{data.w}g</div>
                                    </button>
                                ))}
                            </div>

                            <div className="space-y-4">
                                <WeightSlider 
                                    label="Current Weight" 
                                    value={inputs.weight} 
                                    min={2} 
                                    max={150} 
                                    step={1} 
                                    unit="g" 
                                    onChange={(v: number) => setInputs(p => ({...p, weight: v}))} 
                                />
                            </div>
                        </div>

                        {/* Activity Level */}
                        <div className="bg-white p-5 rounded-3xl shadow-sm border border-brand-700/10">
                            <h3 className="font-bold text-brand-900 text-sm uppercase tracking-wide mb-3 flex items-center gap-2">
                                <ThermometerSun className="w-4 h-4 text-brand-600" /> Activity Level
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {Object.entries(ACTIVITY_PRESETS).map(([key, data]) => (
                                    <SelectionButton 
                                        key={key}
                                        selected={inputs.activityLevel === key} 
                                        onClick={() => setInputs(p => ({ ...p, activityLevel: key as ActivityLevel }))} 
                                        label={data.label} 
                                        subLabel={data.desc}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Food Types */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white p-5 rounded-3xl shadow-sm border border-brand-700/10">
                                <h3 className="font-bold text-brand-900 text-sm uppercase tracking-wide mb-3 flex items-center gap-2">
                                    <Bug className="w-4 h-4 text-brand-600" /> Protein
                                </h3>
                                <div className="grid grid-cols-2 gap-2 h-24">
                                    <SelectionButton 
                                        selected={inputs.includeInsects} 
                                        onClick={() => setInputs(p => ({ ...p, includeInsects: true }))} 
                                        label="Include" 
                                        subLabel="Insects" 
                                        icon={Bug}
                                    />
                                    <SelectionButton 
                                        selected={!inputs.includeInsects} 
                                        onClick={() => setInputs(p => ({ ...p, includeInsects: false }))} 
                                        label="Skip" 
                                        subLabel="No insects" 
                                    />
                                </div>
                            </div>

                            <div className="bg-white p-5 rounded-3xl shadow-sm border border-brand-700/10">
                                <h3 className="font-bold text-brand-900 text-sm uppercase tracking-wide mb-3 flex items-center gap-2">
                                    <Leaf className="w-4 h-4 text-brand-600" /> Vegetables
                                </h3>
                                <div className="grid grid-cols-2 gap-2 h-24">
                                    <SelectionButton 
                                        selected={inputs.includeGreens} 
                                        onClick={() => setInputs(p => ({ ...p, includeGreens: true }))} 
                                        label="Include" 
                                        subLabel="Greens & Veg" 
                                        icon={Leaf}
                                    />
                                    <SelectionButton 
                                        selected={!inputs.includeGreens} 
                                        onClick={() => setInputs(p => ({ ...p, includeGreens: false }))} 
                                        label="Skip" 
                                        subLabel="No greens" 
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Fruit Frequency */}
                        <div className="bg-white p-5 rounded-3xl shadow-sm border border-brand-700/10">
                            <h3 className="font-bold text-brand-900 text-sm uppercase tracking-wide mb-3 flex items-center gap-2">
                                <Leaf className="w-4 h-4 text-brand-600" /> Fruit Treats
                            </h3>
                            <div className="grid grid-cols-3 gap-2">
                                {Object.entries(FRUIT_CONFIG).map(([key, data]) => (
                                    <SelectionButton 
                                        key={key}
                                        selected={inputs.fruitFrequency === key} 
                                        onClick={() => setInputs(p => ({ ...p, fruitFrequency: key as any }))} 
                                        label={data.label} 
                                        subLabel={data.desc}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Supplements */}
                        <div className="bg-white p-5 rounded-3xl shadow-sm border border-brand-700/10">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-brand-900 text-sm uppercase tracking-wide flex items-center gap-2">
                                    <Info className="w-4 h-4 text-brand-600" /> Supplements
                                </h3>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setInputs(p => ({ ...p, supplements: true }))}
                                    className={`py-4 px-3 rounded-xl text-center transition-all ${inputs.supplements ? 'bg-brand-600 text-white shadow-lg scale-105' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                                >
                                    <div className="text-xs font-bold uppercase mb-1">With Supplements</div>
                                    <div className="text-[10px] opacity-70">Calcium + Vitamins</div>
                                </button>
                                <button
                                    onClick={() => setInputs(p => ({ ...p, supplements: false }))}
                                    className={`py-4 px-3 rounded-xl text-center transition-all ${!inputs.supplements ? 'bg-brand-600 text-white shadow-lg scale-105' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                                >
                                    <div className="text-xs font-bold uppercase mb-1">Without</div>
                                    <div className="text-[10px] opacity-70">Natural only</div>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* RESULTS COLUMN */}
                    <div className="lg:col-span-5 space-y-4">
                        <div className="bg-gradient-to-br from-brand-900 to-brand-800 text-white p-6 md:p-8 rounded-[2rem] shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none"><UtensilsCrossed className="w-48 h-48" /></div>
                            
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <p className="text-brand-100/70 font-bold uppercase tracking-widest text-[10px] mb-2">Daily Food Target</p>
                                        {result ? (
                                            <div className="text-5xl md:text-6xl font-black tracking-tighter text-white drop-shadow-xl">
                                                {result.dailyInsects + result.dailyGreens}g
                                            </div>
                                        ) : <div className="text-4xl font-bold text-brand-100/40">--</div>}
                                    </div>
                                    <div className="text-right">
                                        <div className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10 inline-block">
                                            <div className="text-2xl font-bold">{result?.feedingFrequency}x</div>
                                            <div className="text-[10px] uppercase text-brand-100/80">Feedings</div>
                                        </div>
                                    </div>
                                </div>

                                {result && (
                                    <>
                                        <div className="space-y-3 mb-6">
                                            <div className="bg-black/20 p-3 rounded-xl">
                                                <div className="flex justify-between text-xs mb-1">
                                                    <span className="text-brand-100 flex items-center gap-1"><Bug className="w-3 h-3" /> Insects (Protein)</span>
                                                    <span className="font-bold">{result.dailyInsects}g</span>
                                                </div>
                                                <div className="w-full bg-white/10 rounded-full h-1.5">
                                                    <div className="bg-brand-400 h-1.5 rounded-full" style={{ width: `${result.proteinRatio}%` }}></div>
                                                </div>
                                            </div>
                                            
                                            <div className="bg-black/20 p-3 rounded-xl">
                                                <div className="flex justify-between text-xs mb-1">
                                                    <span className="text-brand-100 flex items-center gap-1"><Leaf className="w-3 h-3" /> Greens & Fruit</span>
                                                    <span className="font-bold">{result.dailyGreens}g</span>
                                                </div>
                                                <div className="w-full bg-white/10 rounded-full h-1.5">
                                                    <div className="bg-green-400 h-1.5 rounded-full" style={{ width: `${result.vegRatio}%` }}></div>
                                                </div>
                                            </div>

                                            <div className="flex gap-2">
                                                <div className="flex-1 bg-black/20 p-2 rounded-xl text-center">
                                                    <div className="text-[10px] text-brand-100/60 uppercase">Protein %</div>
                                                    <div className="font-bold text-sm">{result.proteinRatio}%</div>
                                                </div>
                                                <div className="flex-1 bg-black/20 p-2 rounded-xl text-center">
                                                    <div className="text-[10px] text-brand-100/60 uppercase">Veg %</div>
                                                    <div className="font-bold text-sm">{result.vegRatio}%</div>
                                                </div>
                                                {result.supplementsPerWeek > 0 && (
                                                    <div className="flex-1 bg-black/20 p-2 rounded-xl text-center">
                                                        <div className="text-[10px] text-brand-100/60 uppercase">Supp/wk</div>
                                                        <div className="font-bold text-sm">{result.supplementsPerWeek}x</div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {result.warnings.length > 0 && (
                                            <div className="space-y-2">
                                                {result.warnings.map((w, i) => (
                                                    <div key={i} className="flex gap-2 items-center text-[11px] text-amber-100 bg-amber-500/20 px-3 py-2 rounded-lg border border-amber-500/30">
                                                        <AlertTriangle className="w-3 h-3 min-w-[12px]" />
                                                        <span className="font-medium">{w}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Supplement Schedule */}
                        {result && result.supplementsPerWeek > 0 && (
                            <div className="bg-gradient-to-br from-accent-50 to-highlight-50 p-5 rounded-3xl border border-accent-200">
                                <h4 className="font-bold text-accent-900 mb-3 flex items-center gap-2 text-xs uppercase tracking-wide">
                                    <Info className="w-4 h-4 text-accent-600" /> Supplement Schedule
                                </h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-accent-700">Calcium</span>
                                        <span className="text-xs font-bold text-accent-900">{result.calciumSchedule}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-accent-700">Vitamins</span>
                                        <span className="text-xs font-bold text-accent-900">{result.vitaminSchedule}</span>
                                    </div>
                                    {result.fruitAmount !== 'No fruit recommended' && (
                                        <div className="flex justify-between items-center border-t border-accent-200 pt-2 mt-2">
                                            <span className="text-xs text-accent-700">Fruit Treats</span>
                                            <span className="text-xs font-bold text-accent-900">{result.fruitAmount}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="bg-brand-50 p-5 rounded-3xl border border-brand-200">
                            <h4 className="font-bold text-brand-900 mb-3 flex items-center gap-2 text-xs uppercase tracking-wide">
                                <CheckCircle2 className="w-4 h-4 text-green-600" /> Feeding Tips
                            </h4>
                            <ul className="space-y-2">
                                {result?.tips.map((item, i) => (
                                    <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                                        <div className="w-1.5 h-1.5 rounded-full bg-brand-600 mt-1 shrink-0"></div>
                                        {item}
                                    </li>
                                )) || (
                                    <li className="flex items-start gap-2 text-xs text-slate-600">
                                        <div className="w-1.5 h-1.5 rounded-full bg-brand-600 mt-1 shrink-0"></div>
                                        Select species, age and weight to see personalized tips.
                                    </li>
                                )}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <div className="text-center mt-6">
                <p className="text-brand-700 text-sm">
                    Disclaimer: Always consult with a reptile veterinarian for specific dietary needs. 
                    Individual geckos may have unique requirements.
                </p>
            </div>
        </div>
    );
};

export default GeckoDietCalculator;
