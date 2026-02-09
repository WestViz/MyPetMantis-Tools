import React, { useState, useEffect } from 'react';
import { 
    Bug, AlertTriangle, CheckCircle2, Info, 
    Clock, Scale, XCircle, Star, ShieldAlert
} from 'lucide-react';

type AgeGroup = 'baby' | 'juvenile' | 'adult';
type DragonSize = 'small' | 'medium' | 'large';

interface FeedInputs {
    weight: number;
    ageGroup: AgeGroup;
    dragonSize: DragonSize;
    selectedInsects: string[];
}

interface InsectData {
    id: string;
    name: string;
    category: 'staple' | 'treat' | 'occasional' | 'avoid';
    protein: number;
    fat: number;
    calcium: number;
    phosphorus: number;
    caPRatio: number;
    size: 'tiny' | 'small' | 'medium' | 'large';
    description: string;
    warnings?: string[];
}

interface FeedResult {
    insect: InsectData;
    recommended: boolean;
    quantity: number;
    frequency: string;
    notes: string;
}

const INSECT_DATABASE: InsectData[] = [
    {
        id: 'dubia',
        name: 'Dubia Roaches',
        category: 'staple',
        protein: 36,
        fat: 7,
        calcium: 20,
        phosphorus: 320,
        caPRatio: 0.06,
        size: 'medium',
        description: 'Best overall feeder. High protein, low fat, easy to digest.',
    },
    {
        id: 'cricket',
        name: 'Crickets',
        category: 'staple',
        protein: 20,
        fat: 7,
        calcium: 14,
        phosphorus: 320,
        caPRatio: 0.04,
        size: 'medium',
        description: 'Common staple. Must be dusted with calcium powder.',
        warnings: ['Can bite if left uneaten', 'Remove uneaten crickets']
    },
    {
        id: 'bsf_larvae',
        name: 'Black Soldier Fly Larvae',
        category: 'staple',
        protein: 17,
        fat: 14,
        calcium: 810,
        phosphorus: 520,
        caPRatio: 1.56,
        size: 'small',
        description: 'Excellent calcium source! No dusting needed.',
    },
    {
        id: 'silkworm',
        name: 'Silkworms',
        category: 'staple',
        protein: 64,
        fat: 10,
        calcium: 34,
        phosphorus: 560,
        caPRatio: 0.06,
        size: 'small',
        description: 'Super high protein. Soft-bodied, easy to digest.',
    },
    {
        id: 'superworm',
        name: 'Superworms',
        category: 'treat',
        protein: 19,
        fat: 16,
        calcium: 13,
        phosphorus: 340,
        caPRatio: 0.04,
        size: 'medium',
        description: 'High in fat. Good for treats or underweight dragons.',
        warnings: ['High fat - limit for adults', 'Can bite']
    },
    {
        id: 'mealworm',
        name: 'Mealworms',
        category: 'occasional',
        protein: 19,
        fat: 13,
        calcium: 14,
        phosphorus: 330,
        caPRatio: 0.04,
        size: 'small',
        description: 'Hard exoskeleton. Better for juveniles and adults.',
        warnings: ['Choking hazard for babies', 'Hard shells can cause impaction']
    },
    {
        id: 'waxworm',
        name: 'Waxworms',
        category: 'treat',
        protein: 15,
        fat: 24,
        calcium: 13,
        phosphorus: 280,
        caPRatio: 0.05,
        size: 'tiny',
        description: 'Very high fat. Dragon candy! Use sparingly.',
        warnings: ['Very high fat', 'Can cause obesity', 'Addiction risk']
    },
    {
        id: 'hornworm',
        name: 'Hornworms',
        category: 'treat',
        protein: 10,
        fat: 3,
        calcium: 47,
        phosphorus: 130,
        caPRatio: 0.36,
        size: 'large',
        description: 'High moisture, great for hydration. Large size.',
        warnings: ['Grows very fast', 'Buy small ones', 'Very large when mature']
    },
    {
        id: 'butterworm',
        name: 'Butterworms',
        category: 'treat',
        protein: 16,
        fat: 17,
        calcium: 43,
        phosphorus: 360,
        caPRatio: 0.12,
        size: 'small',
        description: 'High fat treat. Dragons love the taste!',
        warnings: ['High fat content', 'Use sparingly']
    },
    {
        id: 'phoenix_worm',
        name: 'Phoenix Worms (Calci-Worms)',
        category: 'staple',
        protein: 18,
        fat: 11,
        calcium: 750,
        phosphorus: 480,
        caPRatio: 1.56,
        size: 'tiny',
        description: 'Same as BSFL. Excellent calcium, perfect for babies.',
    },
    {
        id: 'locust',
        name: 'Locusts',
        category: 'staple',
        protein: 20,
        fat: 6,
        calcium: 18,
        phosphorus: 280,
        caPRatio: 0.06,
        size: 'medium',
        description: 'Great staple feeder. Active movement stimulates hunting.',
    },
    {
        id: 'grasshopper',
        name: 'Grasshoppers',
        category: 'staple',
        protein: 20,
        fat: 6,
        calcium: 20,
        phosphorus: 300,
        caPRatio: 0.07,
        size: 'medium',
        description: 'Natural wild food. Remove legs to prevent jumping.',
        warnings: ['Remove jumping legs', 'Wild-caught risk parasites']
    },
    {
        id: 'earthworm',
        name: 'Earthworms',
        category: 'occasional',
        protein: 10,
        fat: 2,
        calcium: 44,
        phosphorus: 140,
        caPRatio: 0.31,
        size: 'medium',
        description: 'Good moisture content. Most dragons love them.',
        warnings: ['Must be store-bought', 'Wild worms carry parasites']
    },
    {
        id: 'phoenix_moth',
        name: 'Wax Moths (Adult)',
        category: 'treat',
        protein: 13,
        fat: 20,
        calcium: 15,
        phosphorus: 290,
        caPRatio: 0.05,
        size: 'small',
        description: 'Adult form of waxworm. Occasional enrichment.',
        warnings: ['High fat', 'Rare treat only']
    },
    {
        id: 'beetle',
        name: 'Mealworm Beetles',
        category: 'occasional',
        protein: 18,
        fat: 5,
        calcium: 20,
        phosphorus: 310,
        caPRatio: 0.06,
        size: 'small',
        description: 'Adult mealworms. Hard shell, occasional only.',
        warnings: ['Hard exoskeleton', 'Difficult to digest']
    },
];

const AGE_GUIDELINES = {
    baby: {
        maxInsectsPerMeal: 20,
        dailyMeals: 3,
        maxSize: 'small',
        notes: 'Babies need 80% protein diet'
    },
    juvenile: {
        maxInsectsPerMeal: 15,
        dailyMeals: 2,
        maxSize: 'medium',
        notes: 'Juveniles need 60% protein diet'
    },
    adult: {
        maxInsectsPerMeal: 10,
        dailyMeals: 1,
        maxSize: 'large',
        notes: 'Adults need 20% protein diet (mostly veggies!)'
    }
};

const SIZE_QUANTITIES: Record<DragonSize, Record<string, number>> = {
    small: { tiny: 10, small: 5, medium: 2, large: 1 },
    medium: { tiny: 15, small: 10, medium: 5, large: 2 },
    large: { tiny: 20, small: 15, medium: 8, large: 4 }
};

// Category Badge Component
const CategoryBadge = ({ category }: { category: string }) => {
    const styles = {
        staple: 'bg-green-100 text-green-800 border-green-300',
        treat: 'bg-orange-100 text-orange-800 border-orange-300',
        occasional: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        avoid: 'bg-red-100 text-red-800 border-red-300'
    };
    const labels = {
        staple: '★ Staple',
        treat: '✦ Treat',
        occasional: '◈ Occasional',
        avoid: '✕ Avoid'
    };
    return (
        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${styles[category as keyof typeof styles]}`}>
            {labels[category as keyof typeof labels]}
        </span>
    );
};

// Selection Button Component
const SelectionButton = ({ selected, onClick, label, subLabel, icon: Icon, disabled = false }: any) => (
    <button 
        onClick={onClick} 
        disabled={disabled}
        className={`relative p-2 md:p-3 rounded-xl border transition-all duration-200 w-full touch-manipulation flex flex-col justify-center items-center text-center h-full
        ${disabled 
            ? 'opacity-40 cursor-not-allowed border-gray-200 bg-gray-50' 
            : selected 
                ? 'border-brand-600 bg-brand-50 ring-1 ring-brand-500' 
                : 'border-brand-200 bg-white hover:bg-brand-50/50 text-slate-500'}`}
    >
        {Icon && <Icon className={`w-5 h-5 mb-1 ${selected ? 'text-brand-600' : 'text-slate-400'}`} />}
        <div className={`font-bold text-xs md:text-sm ${selected ? 'text-brand-900' : 'text-slate-700'}`}>{label}</div>
        {subLabel && <div className={`text-[10px] mt-0.5 leading-tight ${selected ? 'text-brand-700' : 'text-slate-400'}`}>{subLabel}</div>}
        {selected && <div className="absolute top-1 right-1 text-brand-600"><CheckCircle2 className="w-3 h-3" /></div>}
    </button>
);

// Slider Component
const WeightSlider = ({ value, min, max, step, onChange }: any) => (
    <div className="bg-brand-50/50 p-3 rounded-xl border border-brand-200/50">
        <div className="flex justify-between mb-2">
            <span className="text-xs font-bold text-brand-700 uppercase">Dragon Weight</span>
            <span className="text-xs font-bold text-brand-900 bg-white px-2 py-0.5 rounded-md shadow-sm border border-brand-200">
                {value}g
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
        <div className="flex justify-between text-[10px] text-slate-400 mt-1">
            <span>5g</span>
            <span>800g</span>
        </div>
    </div>
);

const BeardedDragonInsectFeedCalculator: React.FC = () => {
    const [inputs, setInputs] = useState<FeedInputs>({
        weight: 400,
        ageGroup: 'adult',
        dragonSize: 'large',
        selectedInsects: ['dubia', 'bsf_larvae', 'cricket']
    });
    const [results, setResults] = useState<FeedResult[]>([]);

    useEffect(() => {
        calculateFeed();
    }, [inputs.weight, inputs.ageGroup, inputs.dragonSize, inputs.selectedInsects]);

    // Auto-update dragon size based on weight
    useEffect(() => {
        let size: DragonSize = 'small';
        if (inputs.weight >= 200 && inputs.weight < 500) size = 'medium';
        if (inputs.weight >= 500) size = 'large';
        setInputs(prev => ({ ...prev, dragonSize: size }));
    }, [inputs.weight]);

    const calculateFeed = () => {
        const guidelines = AGE_GUIDELINES[inputs.ageGroup];
        const calculated = inputs.selectedInsects.map(insectId => {
            const insect = INSECT_DATABASE.find(i => i.id === insectId)!;
            
            // Determine recommendation
            let recommended = true;
            let notes = '';
            let quantity = SIZE_QUANTITIES[inputs.dragonSize][insect.size];
            let frequency = '';

            // Category-based logic
            switch (insect.category) {
                case 'staple':
                    frequency = inputs.ageGroup === 'baby' ? 'Daily' : '2-3x per week';
                    notes = 'Primary feeder - excellent nutrition';
                    break;
                case 'treat':
                    frequency = '1-2x per week';
                    notes = 'High value treat - use sparingly';
                    quantity = Math.max(1, Math.floor(quantity * 0.5));
                    break;
                case 'occasional':
                    frequency = '1x per week';
                    notes = 'Supplemental variety only';
                    quantity = Math.max(1, Math.floor(quantity * 0.3));
                    break;
                case 'avoid':
                    recommended = false;
                    frequency = 'Not recommended';
                    notes = 'Potential health risk';
                    quantity = 0;
                    break;
            }

            // Age-based restrictions
            if (inputs.ageGroup === 'baby' && insect.size === 'large') {
                recommended = false;
                notes = 'Too large for babies - choking hazard';
                quantity = 0;
            }

            if (inputs.ageGroup === 'baby' && insect.id === 'mealworm') {
                recommended = false;
                notes = 'Hard shell can cause impaction in babies';
                quantity = 0;
            }

            // Adult diet restriction
            if (inputs.ageGroup === 'adult' && insect.category === 'staple') {
                frequency = '2-3x per week only';
                notes += ' | Adults need mostly veggies!';
                quantity = Math.max(1, Math.floor(quantity * 0.5));
            }

            // Ca:P Ratio warnings
            if (insect.caPRatio < 1.0 && insect.category !== 'avoid') {
                notes += ' | Dust with calcium powder';
            }

            return { insect, recommended, quantity, frequency, notes };
        });

        // Sort by recommended first, then by category
        calculated.sort((a, b) => {
            if (a.recommended !== b.recommended) return b.recommended ? 1 : -1;
            const catOrder = { staple: 0, treat: 1, occasional: 2, avoid: 3 };
            return catOrder[a.insect.category] - catOrder[b.insect.category];
        });

        setResults(calculated);
    };

    const toggleInsect = (id: string) => {
        setInputs(prev => ({
            ...prev,
            selectedInsects: prev.selectedInsects.includes(id)
                ? prev.selectedInsects.filter(i => i !== id)
                : [...prev.selectedInsects, id]
        }));
    };

    const selectAllStaples = () => {
        const staples = INSECT_DATABASE.filter(i => i.category === 'staple').map(i => i.id);
        setInputs(prev => ({ ...prev, selectedInsects: staples }));
    };

    const clearAll = () => {
        setInputs(prev => ({ ...prev, selectedInsects: [] }));
    };

    return (
        <div className="glass-panel text-slate-900 rounded-[2rem] shadow-xl bg-white/95 backdrop-blur-md border border-brand-700/20 p-0 md:p-8 relative overflow-hidden max-w-6xl mx-auto font-sans">
            
            {/* Mobile Summary */}
            <div className="lg:hidden sticky top-0 z-40 bg-brand-900 text-brand-100 p-4 shadow-lg border-b border-brand-800/30">
                <div className="flex justify-between items-center">
                    <div>
                        <div className="text-[10px] uppercase tracking-wider opacity-70">Selected</div>
                        <div className="text-xl font-black text-white">{inputs.selectedInsects.length} insects</div>
                    </div>
                    <div className="text-right">
                        <div className="text-[10px] uppercase tracking-wider opacity-70">Age</div>
                        <div className="font-bold text-sm capitalize">{inputs.ageGroup}</div>
                    </div>
                </div>
            </div>

            <div className="p-4 md:p-0 relative z-10 w-full">
                <div className="text-center mb-6 md:mb-8 pt-4 md:pt-0">
                    <div className="inline-flex items-center gap-2 mb-2">
                        <span className="p-1.5 bg-brand-100 text-brand-700 rounded-lg"><Bug className="w-5 h-5" /></span>
                        <span className="text-[10px] font-bold tracking-widest text-brand-700 uppercase">2026 Calculator</span>
                    </div>
                    <h1 className="text-2xl md:text-4xl font-black text-brand-900 tracking-tight">Insect Feed Calculator</h1>
                    <p className="text-xs text-brand-700 mt-1">Choose the best feeders for your dragon</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* INPUTS COLUMN */}
                    <div className="lg:col-span-5 space-y-5">
                        
                        {/* Age Selection */}
                        <div className="bg-white p-5 rounded-3xl shadow-sm border border-brand-700/10">
                            <h3 className="font-bold text-brand-900 text-sm uppercase tracking-wide mb-3 flex items-center gap-2">
                                <Scale className="w-4 h-4 text-brand-600" /> Dragon Profile
                            </h3>
                            
                            <div className="grid grid-cols-3 gap-2 mb-4">
                                {(['baby', 'juvenile', 'adult'] as AgeGroup[]).map(age => (
                                    <button
                                        key={age}
                                        onClick={() => setInputs(p => ({ ...p, ageGroup: age }))}
                                        className={`py-3 px-2 rounded-xl text-center transition-all ${
                                            inputs.ageGroup === age 
                                                ? 'bg-brand-600 text-white shadow-lg scale-105' 
                                                : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                                        }`}
                                    >
                                        <div className="text-xs font-bold uppercase">{age}</div>
                                    </button>
                                ))}
                            </div>

                            <WeightSlider 
                                value={inputs.weight}
                                min={5}
                                max={800}
                                step={5}
                                onChange={(v: number) => setInputs(p => ({...p, weight: v}))}
                            />

                            <div className="mt-4 p-3 bg-brand-50 rounded-xl border border-brand-200">
                                <div className="text-[10px] text-brand-700 uppercase font-bold mb-1">Guideline</div>
                                <div className="text-xs text-brand-900">{AGE_GUIDELINES[inputs.ageGroup].notes}</div>
                                <div className="text-[10px] text-brand-600 mt-1">
                                    {AGE_GUIDELINES[inputs.ageGroup].dailyMeals} meals/day • 
                                    Max {AGE_GUIDELINES[inputs.ageGroup].maxInsectsPerMeal} insects/meal
                                </div>
                            </div>
                        </div>

                        {/* Quick Select */}
                        <div className="bg-white p-5 rounded-3xl shadow-sm border border-brand-700/10">
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="font-bold text-brand-900 text-sm uppercase tracking-wide flex items-center gap-2">
                                    <Star className="w-4 h-4 text-brand-600" /> Quick Select
                                </h3>
                                <div className="flex gap-2">
                                    <button onClick={selectAllStaples} className="text-[10px] bg-brand-100 text-brand-700 px-2 py-1 rounded font-bold hover:bg-brand-200">
                                        Staples
                                    </button>
                                    <button onClick={clearAll} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded font-bold hover:bg-slate-200">
                                        Clear
                                    </button>
                                </div>
                            </div>
                            <p className="text-xs text-slate-500">Click insects below to add/remove from your selection</p>
                        </div>

                        {/* Legend */}
                        <div className="bg-brand-50 p-4 rounded-2xl border border-brand-200">
                            <h4 className="text-[10px] font-bold text-brand-700 uppercase mb-2">Category Guide</h4>
                            <div className="flex flex-wrap gap-2">
                                <CategoryBadge category="staple" />
                                <CategoryBadge category="treat" />
                                <CategoryBadge category="occasional" />
                                <CategoryBadge category="avoid" />
                            </div>
                        </div>
                    </div>

                    {/* INSECT GRID & RESULTS */}
                    <div className="lg:col-span-7 space-y-4">
                        
                        {/* Insect Selection Grid */}
                        <div className="bg-white p-5 rounded-3xl shadow-sm border border-brand-700/10">
                            <h3 className="font-bold text-brand-900 text-sm uppercase tracking-wide mb-4 flex items-center gap-2">
                                <Bug className="w-4 h-4 text-brand-600" /> Select Feeders ({inputs.selectedInsects.length} selected)
                            </h3>
                            
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-[300px] overflow-y-auto pr-2">
                                {INSECT_DATABASE.map(insect => {
                                    const selected = inputs.selectedInsects.includes(insect.id);
                                    const disabled = inputs.ageGroup === 'baby' && insect.size === 'large';
                                    
                                    return (
                                        <button
                                            key={insect.id}
                                            onClick={() => !disabled && toggleInsect(insect.id)}
                                            disabled={disabled}
                                            className={`p-3 rounded-xl border text-left transition-all ${
                                                disabled 
                                                    ? 'opacity-30 cursor-not-allowed border-gray-200 bg-gray-50' 
                                                    : selected 
                                                        ? 'border-brand-600 bg-brand-50 ring-1 ring-brand-500' 
                                                        : 'border-brand-100 bg-white hover:border-brand-300'
                                            }`}
                                        >
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="font-bold text-xs text-brand-900 leading-tight">{insect.name}</span>
                                                {selected && <CheckCircle2 className="w-3 h-3 text-brand-600 shrink-0" />}
                                            </div>
                                            <CategoryBadge category={insect.category} />
                                            {disabled && <div className="text-[9px] text-red-500 mt-1">Too large for babies</div>}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Results Panel */}
                        {results.length > 0 && (
                            <div className="bg-gradient-to-br from-brand-900 to-brand-800 text-white p-5 md:p-6 rounded-[2rem] shadow-2xl">
                                <div className="flex items-center gap-2 mb-4">
                                    <CheckCircle2 className="w-5 h-5 text-brand-300" />
                                    <h3 className="font-bold text-sm uppercase tracking-wide text-brand-100">Feeding Plan</h3>
                                </div>

                                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                                    {results.map((result, idx) => (
                                        <div 
                                            key={idx} 
                                            className={`p-4 rounded-xl ${
                                                result.recommended 
                                                    ? 'bg-white/10 border border-white/20' 
                                                    : 'bg-red-500/20 border border-red-400/30'
                                            }`}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <div className="font-bold text-sm">{result.insect.name}</div>
                                                    <CategoryBadge category={result.insect.category} />
                                                </div>
                                                <div className="text-right">
                                                    {result.recommended ? (
                                                        <div className="text-2xl font-black text-brand-300">{result.quantity}</div>
                                                    ) : (
                                                        <XCircle className="w-6 h-6 text-red-400" />
                                                    )}
                                                    <div className="text-[10px] text-brand-200/70">
                                                        {result.recommended ? 'per feeding' : 'Not recommended'}
                                                    </div>
                                                </div>
                                            </div>

                                            {result.recommended && (
                                                <div className="grid grid-cols-2 gap-2 mt-3 text-[10px]">
                                                    <div className="bg-black/20 p-2 rounded-lg">
                                                        <div className="flex items-center gap-1 text-brand-200 mb-1">
                                                            <Clock className="w-3 h-3" /> Frequency
                                                        </div>
                                                        <div className="font-bold">{result.frequency}</div>
                                                    </div>
                                                    <div className="bg-black/20 p-2 rounded-lg">
                                                        <div className="flex items-center gap-1 text-brand-200 mb-1">
                                                            <Info className="w-3 h-3" /> Nutrition
                                                        </div>
                                                        <div className="font-bold">{result.insect.protein}g protein</div>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="mt-2 text-[11px] text-brand-200/90 flex items-start gap-1">
                                                <Info className="w-3 h-3 shrink-0 mt-0.5" />
                                                <span>{result.insect.description}</span>
                                            </div>

                                            {result.notes && (
                                                <div className="mt-2 text-[10px] text-amber-200 bg-amber-500/20 px-2 py-1 rounded">
                                                    {result.notes}
                                                </div>
                                            )}

                                            {result.insect.warnings && (
                                                <div className="mt-2 space-y-1">
                                                    {result.insect.warnings.map((w, i) => (
                                                        <div key={i} className="flex items-center gap-1 text-[10px] text-red-200">
                                                            <ShieldAlert className="w-3 h-3" />
                                                            {w}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {results.length === 0 && (
                            <div className="bg-brand-50 p-8 rounded-3xl border border-brand-200 text-center">
                                <Bug className="w-12 h-12 text-brand-300 mx-auto mb-3" />
                                <p className="text-brand-700 font-medium">Select insects above to see your feeding plan</p>
                                <p className="text-xs text-brand-500 mt-1">Click the insects your dragon eats or might eat</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="text-center mt-6 p-4">
                <p className="text-brand-700 text-sm">
                    <AlertTriangle className="w-4 h-4 inline mr-1" />
                    Never feed wild-caught insects. Always dust low-calcium feeders with calcium powder.
                    <br />
                    Consult a reptile vet for specific dietary needs.
                </p>
            </div>
        </div>
    );
};

export default BeardedDragonInsectFeedCalculator;