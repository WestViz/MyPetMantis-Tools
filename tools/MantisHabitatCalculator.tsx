import React, { useState, useEffect } from 'react';
import { 
    Home, Thermometer, Droplets, Sun, Moon, 
    CheckCircle2, AlertTriangle, Layers, 
    Shield, MapPin, Plus, Minus, Wind,
    Sparkles, Zap, Leaf, TreePine
} from 'lucide-react';

type MantisSpecies = 'chinese' | 'carolina' | 'european' | 'orchid' | 'flower' | 'other';
type InstarStage = 'L1-L3' | 'L4-L6' | 'L7-L8' | 'adult';
type EnclosureType = 'mesh' | 'plastic' | 'glass' | 'bioactive';
type SubstrateType = 'paper' | 'coco_fiber' | 'sphagnum' | 'soil' | 'none';

interface HabitatInputs {
    species: MantisSpecies;
    instarStage: InstarStage;
    enclosureType: EnclosureType;
    enclosureHeight: number; // in cm
    substrateType: SubstrateType;
    multipleMantises: boolean;
    mantisCount: number;
}

interface HabitatResult {
    minEnclosureHeight: number;
    recommendedEnclosureHeight: number;
    temperature: {
        day: { f: string; c: string };
        night: { f: string; c: string };
        gradient: string;
    };
    humidity: {
        min: number;
        max: number;
        description: string;
        misting: string;
    };
    lighting: {
        dayLength: string;
        intensity: string;
        uvb: boolean;
        recommendations: string[];
    };
    ventilation: {
        type: string;
        recommendations: string[];
    };
    substrate: {
        safe: boolean;
        recommendation: string;
        depth: string;
        warnings: string[];
    };
    decor: {
        climbing: string[];
        hiding: string[];
        foliage: string[];
    };
    water: {
        method: string;
        frequency: string;
    };
    warnings: string[];
    tips: string[];
    checklist: string[];
}

const SPECIES_CONFIG = {
    chinese: {
        name: 'Chinese Mantis',
        scientific: 'Tenodera sinensis',
        emoji: '🦗',
        temperament: 'aggressive',
        arboreal: true,
        minInstars: 8,
        gradient: 'from-amber-500 to-orange-600',
        enclosureNeeds: {
            minHeight: { 'L1-L3': 15, 'L4-L6': 25, 'L7-L8': 30, adult: 35 },
            recommendedHeight: { 'L1-L3': 20, 'L4-L6': 30, 'L7-L8': 40, adult: 50 }
        },
        temp: { day: { f: '75-85', c: '24-29' }, night: { f: '65-75', c: '18-24' }, gradient: '85°F warm end, 75°F cool end' },
        humidity: { min: 40, max: 60, description: '40-60%', misting: 'Mist lightly 2-3x weekly' },
        ventilation: 'moderate'
    },
    carolina: {
        name: 'Carolina Mantis',
        scientific: 'Stagmomantis carolina',
        emoji: '🍃',
        temperament: 'moderate',
        arboreal: true,
        minInstars: 7,
        gradient: 'from-emerald-500 to-teal-600',
        enclosureNeeds: {
            minHeight: { 'L1-L3': 12, 'L4-L6': 20, 'L7-L8': 25, adult: 30 },
            recommendedHeight: { 'L1-L3': 15, 'L4-L6': 25, 'L7-L8': 35, adult: 40 }
        },
        temp: { day: { f: '75-82', c: '24-28' }, night: { f: '65-72', c: '18-22' }, gradient: '82°F warm end, 75°F cool end' },
        humidity: { min: 50, max: 70, description: '50-70%', misting: 'Mist daily or every other day' },
        ventilation: 'high'
    },
    european: {
        name: 'European Mantis',
        scientific: 'Mantis religiosa',
        emoji: '🌿',
        temperament: 'moderate',
        arboreal: true,
        minInstars: 7,
        gradient: 'from-blue-500 to-indigo-600',
        enclosureNeeds: {
            minHeight: { 'L1-L3': 12, 'L4-L6': 20, 'L7-L8': 25, adult: 30 },
            recommendedHeight: { 'L1-L3': 15, 'L4-L6': 25, 'L7-L8': 35, adult: 40 }
        },
        temp: { day: { f: '75-85', c: '24-29' }, night: { f: '65-75', c: '18-24' }, gradient: '85°F warm end, 75°F cool end' },
        humidity: { min: 40, max: 60, description: '40-60%', misting: 'Mist lightly 2-3x weekly' },
        ventilation: 'moderate'
    },
    orchid: {
        name: 'Orchid Mantis',
        scientific: 'Hymenopus coronatus',
        emoji: '🌸',
        temperament: 'passive',
        arboreal: true,
        minInstars: 6,
        gradient: 'from-pink-500 to-rose-600',
        enclosureNeeds: {
            minHeight: { 'L1-L3': 15, 'L4-L6': 25, 'L7-L8': 30, adult: 35 },
            recommendedHeight: { 'L1-L3': 20, 'L4-L6': 30, 'L7-L8': 40, adult: 45 }
        },
        temp: { day: { f: '78-85', c: '26-29' }, night: { f: '70-78', c: '21-26' }, gradient: '85°F warm end, 78°F cool end' },
        humidity: { min: 60, max: 80, description: '60-80%', misting: 'Mist daily, twice if dry' },
        ventilation: 'low'
    },
    flower: {
        name: 'Flower Mantis',
        scientific: 'Pseudocreobotra wahlbergii',
        emoji: '🌺',
        temperament: 'moderate',
        arboreal: true,
        minInstars: 6,
        gradient: 'from-fuchsia-500 to-pink-600',
        enclosureNeeds: {
            minHeight: { 'L1-L3': 12, 'L4-L6': 20, 'L7-L8': 25, adult: 30 },
            recommendedHeight: { 'L1-L3': 15, 'L4-L6': 25, 'L7-L8': 35, adult: 40 }
        },
        temp: { day: { f: '75-85', c: '24-29' }, night: { f: '68-75', c: '20-24' }, gradient: '85°F warm end, 75°F cool end' },
        humidity: { min: 50, max: 70, description: '50-70%', misting: 'Mist daily or every other day' },
        ventilation: 'moderate'
    },
    other: {
        name: 'Other Species',
        scientific: 'Various',
        emoji: '🦎',
        temperament: 'variable',
        arboreal: true,
        minInstars: 7,
        gradient: 'from-slate-500 to-gray-600',
        enclosureNeeds: {
            minHeight: { 'L1-L3': 12, 'L4-L6': 20, 'L7-L8': 25, adult: 30 },
            recommendedHeight: { 'L1-L3': 15, 'L4-L6': 25, 'L7-L8': 35, adult: 40 }
        },
        temp: { day: { f: '75-82', c: '24-28' }, night: { f: '68-75', c: '20-24' }, gradient: '82°F warm end, 75°F cool end' },
        humidity: { min: 40, max: 60, description: '40-60%', misting: 'Mist lightly 2-3x weekly' },
        ventilation: 'moderate'
    }
};

const INSTAR_CONFIG = {
    'L1-L3': { label: 'L1-L3', desc: 'Early Nymphs', color: 'from-emerald-500 to-green-600' },
    'L4-L6': { label: 'L4-L6', desc: 'Growing', color: 'from-blue-500 to-cyan-600' },
    'L7-L8': { label: 'L7-L8', desc: 'Sub-Adult', color: 'from-purple-500 to-violet-600' },
    'adult': { label: 'Adult', desc: 'Fully Grown', color: 'from-pink-500 to-rose-600' }
};

const ENCLOSURE_TYPES = {
    mesh: { label: 'Mesh Net', desc: 'Breathable', emoji: '🔲', color: 'from-green-500 to-emerald-600' },
    plastic: { label: 'Plastic', desc: 'Easy clean', emoji: '📦', color: 'from-blue-500 to-cyan-600' },
    glass: { label: 'Glass', desc: 'Display', emoji: '🔲', color: 'from-purple-500 to-violet-600' },
    bioactive: { label: 'Bioactive', desc: 'Self-maintain', emoji: '🌱', color: 'from-emerald-500 to-teal-600' }
};

const SUBSTRATE_TYPES = {
    paper: { label: 'Paper Towel', desc: 'Clean & Simple', color: 'from-slate-500 to-gray-600' },
    coco_fiber: { label: 'Coco Fiber', desc: 'Natural', color: 'from-amber-500 to-orange-600' },
    sphagnum: { label: 'Sphagnum', desc: 'Moisture', color: 'from-green-500 to-emerald-600' },
    soil: { label: 'Potting Soil', desc: 'Natural', color: 'from-brown-500 to-amber-600' },
    none: { label: 'None', desc: 'Bare floor', color: 'from-slate-400 to-gray-500' }
};

const MantisHabitatCalculator: React.FC = () => {
    const [inputs, setInputs] = useState<HabitatInputs>({
        species: 'chinese',
        instarStage: 'L4-L6',
        enclosureType: 'mesh',
        enclosureHeight: 30,
        substrateType: 'paper',
        multipleMantises: false,
        mantisCount: 1
    });

    const [result, setResult] = useState<HabitatResult | null>(null);

    useEffect(() => {
        calculateHabitat();
    }, [inputs.species, inputs.instarStage, inputs.enclosureType, inputs.enclosureHeight, inputs.substrateType, inputs.multipleMantises, inputs.mantisCount]);

    const calculateHabitat = () => {
        const { species, instarStage, enclosureType, enclosureHeight, substrateType, multipleMantises, mantisCount } = inputs;
        const speciesConfig = SPECIES_CONFIG[species];
        const instarConfig = INSTAR_CONFIG[instarStage];
        
        // Fixed: Access the nested structure correctly
        const minHeight = speciesConfig.enclosureNeeds.minHeight[instarStage as keyof typeof speciesConfig.enclosureNeeds.minHeight] || speciesConfig.enclosureNeeds.minHeight['adult'];
        const recommendedHeight = speciesConfig.enclosureNeeds.recommendedHeight[instarStage as keyof typeof speciesConfig.enclosureNeeds.recommendedHeight] || speciesConfig.enclosureNeeds.recommendedHeight['adult'];
        
        const enclosureConfig = ENCLOSURE_TYPES[enclosureType];
        const substrateConfig = SUBSTRATE_TYPES[substrateType];

        const warnings: string[] = [];
        const tips: string[] = [];
        const checklist: string[] = [];

        if (enclosureHeight < minHeight) {
            warnings.push(`📏 Enclosure too short! Minimum ${minHeight}cm needed for ${speciesConfig.name} at this stage.`);
        } else if (enclosureHeight < recommendedHeight) {
            tips.push(`📏 Enclosure meets minimum but ${recommendedHeight}cm+ recommended for optimal space.`);
        }

        if (enclosureType === 'glass' && speciesConfig.humidity) {
            warnings.push("💧 Glass tanks have poor airflow - monitor humidity closely to prevent mold.");
        }

        if (enclosureType === 'plastic' && speciesConfig.ventilation === 'high') {
            warnings.push("💨 Plastic containers have limited ventilation - drill more holes or use mesh lid.");
        }

        if (substrateType === 'soil' && instarStage === 'L1-L3') {
            warnings.push("⚠️ Soil is NOT recommended for L1-L3 stage - risk of impaction/entrapment.");
        }

        if (multipleMantises && mantisCount > 1) {
            warnings.push("⚠️ Mantises are CANNIBALISTIC! Do NOT house together unless you want them to eat each other.");
            warnings.push("🚫 Only one mantis per enclosure is recommended, especially adults.");
        }

        if (instarStage === 'L1-L3') {
            tips.push("Nymphs escape easily - use fine mesh (0.5mm holes) or secure lid.");
            tips.push("Provide very thin climbing surfaces - toothpicks work well.");
        }

        if (species === 'orchid') {
            tips.push("Orchid mantises need high humidity - maintain 60-80%");
            tips.push("They prefer flower-like perches - use artificial flowers");
        }

        if (species === 'chinese') {
            tips.push("Chinese mantises need space - larger is better for this active species.");
            tips.push("Provide sturdy climbing branches - they can be clumsy.");
        }

        checklist.push(`Enclosure height: ${enclosureHeight}cm (min: ${minHeight}cm, recommended: ${recommendedHeight}cm)`);
        checklist.push(`Temperature gradient: ${speciesConfig.temp.gradient}`);
        checklist.push(`Humidity: ${speciesConfig.humidity.description}`);
        checklist.push(`Substrate: ${substrateConfig.label} (depth: ${substrateType === 'none' ? 'N/A' : substrateType === 'paper' ? '1-2 layers' : '1-2 inches'})`);
        checklist.push(`Misting: ${speciesConfig.humidity.misting}`);

        const climbingDecor = ['Bamboo sticks', 'Popsicle sticks', 'Natural branches', 'Artificial vines'];
        const hidingDecor = ['Leaves', 'Small plants', 'Moss patches'];
        const foliageDecor = ['Artificial flowers', 'Dried leaves', 'Small branches'];

        if (instarStage === 'L1-L3') {
            climbingDecor.push('Toothpicks', 'Thin twigs');
        }

        let ventilationRecommendations: string[] = [];
        switch (speciesConfig.ventilation) {
            case 'high':
                ventilationRecommendations = [
                    'Mesh top or sides essential',
                    'Multiple ventilation holes recommended',
                    'Avoid glass tanks'
                ];
                break;
            case 'moderate':
                ventilationRecommendations = [
                    'Good airflow from mesh top',
                    'Some side ventilation beneficial',
                    'Can use mesh or plastic with holes'
                ];
                break;
            case 'low':
                ventilationRecommendations = [
                    'Still need some airflow',
                    'Mesh top with smaller holes',
                    'Enclosed sides okay'
                ];
                break;
        }

        const lightingRecommendations = [
            'Natural indirect sunlight works well',
            'Bright indirect artificial light (LED/fluorescent)',
            'Avoid direct hot sunlight (overheating risk)',
            '12-14 hours light / 10-12 hours dark cycle'
        ];

        let waterMethod = 'Misting';
        let waterFrequency = speciesConfig.humidity.misting;
        if (species === 'orchid' || species === 'flower') {
            waterMethod = 'Misting + Droplets';
            waterFrequency = 'Daily misting, twice if dry';
        }

        setResult({
            minEnclosureHeight: minHeight,
            recommendedEnclosureHeight: recommendedHeight,
            temperature: speciesConfig.temp,
            humidity: speciesConfig.humidity,
            lighting: {
                dayLength: '12-14 hours',
                intensity: 'Bright indirect',
                uvb: false,
                recommendations: lightingRecommendations
            },
            ventilation: {
                type: speciesConfig.ventilation,
                recommendations: ventilationRecommendations
            },
            substrate: {
                safe: !(substrateType === 'soil' && instarStage === 'L1-L3'),
                recommendation: substrateConfig.label,
                depth: substrateType === 'none' ? 'N/A' : substrateType === 'paper' ? '1-2 layers' : '1-2 inches',
                warnings: substrateType === 'soil' && instarStage === 'L1-L3' 
                    ? ['Soil not recommended for L1-L3'] 
                    : []
            },
            decor: {
                climbing: climbingDecor,
                hiding: hidingDecor,
                foliage: foliageDecor
            },
            water: {
                method: waterMethod,
                frequency: waterFrequency
            },
            warnings,
            tips,
            checklist
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-blue-50 font-sans">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMCAwaDQwdjQwSDBWMHptMjAgMjBoMjB2MjBIMjBWMjB6TTAgMjBoMjB2MjBIMFYyMHoyMCAwaDIwdjIwSDIwVjB6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
                <div className="relative max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center p-4 bg-white/10 backdrop-blur-sm rounded-2xl mb-6 shadow-lg ring-1 ring-white/20">
                            <Home className="w-12 h-12" />
                        </div>
                        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
                            Mantis Habitat Calculator
                        </h1>
                        <p className="text-xl text-white/90 max-w-2xl mx-auto">
                            Calculate optimal enclosure setup and environmental conditions for your praying mantis
                        </p>
                    </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-slate-50/50 to-transparent"></div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10 pb-16">
                <div className="space-y-6">
                    
                    {/* Species Selection */}
                    <div className="bg-white rounded-3xl shadow-xl ring-1 ring-slate-900/5 overflow-hidden">
                        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-4 border-b border-emerald-100">
                            <h2 className="text-lg font-bold text-emerald-900 flex items-center gap-2">
                                <span className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center text-white text-sm font-bold">1</span>
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

                    {/* Instar Stage */}
                    <div className="bg-white rounded-3xl shadow-xl ring-1 ring-slate-900/5 overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-blue-100">
                            <h2 className="text-lg font-bold text-blue-900 flex items-center gap-2">
                                <span className="w-7 h-7 rounded-lg bg-blue-500 flex items-center justify-center text-white text-sm font-bold">2</span>
                                Growth Stage
                            </h2>
                        </div>
                        <div className="p-4 sm:p-6">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {Object.entries(INSTAR_CONFIG).map(([key, config]) => (
                                    <button
                                        key={key}
                                        onClick={() => setInputs(prev => ({ ...prev, instarStage: key as InstarStage }))}
                                        className={`group relative p-4 rounded-2xl border-2 transition-all duration-300 text-center
                                            ${inputs.instarStage === key
                                                ? 'border-transparent bg-gradient-to-br ' + config.color + ' text-white shadow-lg scale-105'
                                                : 'border-slate-200 bg-white hover:border-brand-300 hover:shadow-md'}`}
                                    >
                                        <div className={`font-bold text-lg sm:text-xl ${inputs.instarStage === key ? 'text-white' : 'text-slate-900'}`}>
                                            {config.label}
                                        </div>
                                        <div className={`text-xs mt-1 ${inputs.instarStage === key ? 'text-white/80' : 'text-slate-500'}`}>
                                            {config.desc}
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

                    {/* Enclosure Type */}
                    <div className="bg-white rounded-3xl shadow-xl ring-1 ring-slate-900/5 overflow-hidden">
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-purple-100">
                            <h2 className="text-lg font-bold text-purple-900 flex items-center gap-2">
                                <span className="w-7 h-7 rounded-lg bg-purple-500 flex items-center justify-center text-white text-sm font-bold">3</span>
                                Enclosure Type
                            </h2>
                        </div>
                        <div className="p-4 sm:p-6">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {Object.entries(ENCLOSURE_TYPES).map(([key, config]) => (
                                    <button
                                        key={key}
                                        onClick={() => setInputs(prev => ({ ...prev, enclosureType: key as EnclosureType }))}
                                        className={`group relative p-4 rounded-2xl border-2 transition-all duration-300 text-center
                                            ${inputs.enclosureType === key
                                                ? 'border-transparent bg-gradient-to-br ' + config.color + ' text-white shadow-lg scale-105'
                                                : 'border-slate-200 bg-white hover:border-brand-300 hover:shadow-md'}`}
                                    >
                                        <div className={`text-2xl mb-2 ${inputs.enclosureType === key ? 'text-white/90' : 'text-slate-600'}`}>
                                            {config.emoji}
                                        </div>
                                        <div className={`font-bold text-sm ${inputs.enclosureType === key ? 'text-white' : 'text-slate-900'}`}>
                                            {config.label}
                                        </div>
                                        <div className={`text-xs mt-1 ${inputs.enclosureType === key ? 'text-white/80' : 'text-slate-500'}`}>
                                            {config.desc}
                                        </div>
                                        {inputs.enclosureType === key && (
                                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg">
                                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Height Slider */}
                    <div className="bg-white rounded-3xl shadow-xl ring-1 ring-slate-900/5 overflow-hidden">
                        <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-6 py-4 border-b border-amber-100">
                            <h2 className="text-lg font-bold text-amber-900 flex items-center gap-2">
                                <span className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center text-white text-sm font-bold">4</span>
                                Enclosure Height
                            </h2>
                        </div>
                        <div className="p-6">
                            <div className="mb-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-slate-500">Adjust height:</span>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="range"
                                            min="10"
                                            max="80"
                                            step="5"
                                            value={inputs.enclosureHeight}
                                            onChange={(e) => setInputs(prev => ({ ...prev, enclosureHeight: parseInt(e.target.value) }))}
                                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                                        />
                                        <span className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-bold text-lg min-w-[80px] text-center">
                                            {inputs.enclosureHeight}cm
                                        </span>
                                    </div>
                                </div>
                                <div className="flex justify-between text-xs text-slate-400 mt-2">
                                    <span>10cm</span>
                                    <span>80cm</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                                    <div className="text-xs text-red-600 font-bold uppercase mb-1">Minimum Required</div>
                                    <div className="text-2xl font-bold text-red-900">{result?.minEnclosureHeight || 0}cm</div>
                                </div>
                                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                                    <div className="text-xs text-green-600 font-bold uppercase mb-1">Recommended</div>
                                    <div className="text-2xl font-bold text-green-900">{result?.recommendedEnclosureHeight || 0}cm</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Substrate */}
                    <div className="bg-white rounded-3xl shadow-xl ring-1 ring-slate-900/5 overflow-hidden">
                        <div className="bg-gradient-to-r from-teal-50 to-cyan-50 px-6 py-4 border-b border-teal-100">
                            <h2 className="text-lg font-bold text-teal-900 flex items-center gap-2">
                                <span className="w-7 h-7 rounded-lg bg-teal-500 flex items-center justify-center text-white text-sm font-bold">5</span>
                                Substrate
                            </h2>
                        </div>
                        <div className="p-4 sm:p-6">
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                                {Object.entries(SUBSTRATE_TYPES).map(([key, config]) => (
                                    <button
                                        key={key}
                                        onClick={() => setInputs(prev => ({ ...prev, substrateType: key as SubstrateType }))}
                                        className={`group relative p-3 rounded-2xl border-2 transition-all duration-300 text-center
                                            ${inputs.substrateType === key
                                                ? 'border-transparent bg-gradient-to-br ' + config.color + ' text-white shadow-lg scale-105'
                                                : 'border-slate-200 bg-white hover:border-brand-300 hover:shadow-md'}`}
                                    >
                                        <div className={`font-bold text-sm ${inputs.substrateType === key ? 'text-white' : 'text-slate-900'}`}>
                                            {config.label}
                                        </div>
                                        <div className={`text-xs mt-1 ${inputs.substrateType === key ? 'text-white/80' : 'text-slate-500'}`}>
                                            {config.desc}
                                        </div>
                                        {inputs.substrateType === key && (
                                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg">
                                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Multiple Mantises Warning */}
                    <label className="flex items-center gap-4 p-6 bg-white rounded-3xl shadow-xl ring-1 ring-slate-900/5 cursor-pointer hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-red-200">
                        <input
                            type="checkbox"
                            checked={inputs.multipleMantises}
                            onChange={(e) => setInputs(prev => ({ ...prev, multipleMantises: e.target.checked }))}
                            className="w-6 h-6 rounded-lg border-red-300 text-red-600 focus:ring-red-500"
                        />
                        <div className="flex-1">
                            <div className="font-bold text-slate-900 flex items-center gap-2">
                                <Zap className="w-5 h-5 text-red-600" />
                                Multiple Mantises
                            </div>
                            <div className="text-sm text-slate-500 mt-1">⚠️ Mantises are cannibalistic!</div>
                        </div>
                    </label>

                    {/* Results Section */}
                    {result && (
                        <div className="space-y-6 animate-in zoom-in-95 duration-500">
                            {/* Critical Warnings */}
                            {result.warnings.length > 0 && (
                                <div className="bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200 rounded-3xl p-6 shadow-lg">
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-red-500 rounded-xl">
                                            <AlertTriangle className="w-8 h-8 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-bold text-red-900 text-xl mb-4">Critical Warnings</div>
                                            <ul className="space-y-3">
                                                {result.warnings.map((warning, idx) => (
                                                    <li key={idx} className="text-base text-red-800 leading-relaxed">{warning}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Environment Grid */}
                            <div className="grid sm:grid-cols-2 gap-4">
                                {/* Temperature */}
                                <div className="bg-white rounded-3xl shadow-xl ring-1 ring-slate-900/5 overflow-hidden">
                                    <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4">
                                        <div className="flex items-center gap-2">
                                            <Thermometer className="w-6 h-6" />
                                            <span className="font-bold">Temperature</span>
                                        </div>
                                    </div>
                                    <div className="p-5 space-y-4">
                                        <div className="bg-orange-50 rounded-xl p-4">
                                            <div className="text-xs text-orange-600 font-bold uppercase mb-1">Daytime</div>
                                            <div className="text-2xl font-bold text-orange-900">{result.temperature.day.f}°F</div>
                                            <div className="text-sm text-orange-700">{result.temperature.day.c}°C</div>
                                        </div>
                                        <div className="bg-blue-50 rounded-xl p-4">
                                            <div className="text-xs text-blue-600 font-bold uppercase mb-1">Nighttime</div>
                                            <div className="text-2xl font-bold text-blue-900">{result.temperature.night.f}°F</div>
                                            <div className="text-sm text-blue-700">{result.temperature.night.c}°C</div>
                                        </div>
                                        <div className="bg-slate-50 rounded-xl p-3">
                                            <div className="text-xs text-slate-500 uppercase font-semibold">Gradient</div>
                                            <div className="text-sm font-bold text-slate-900 mt-1">{result.temperature.gradient}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Humidity */}
                                <div className="bg-white rounded-3xl shadow-xl ring-1 ring-slate-900/5 overflow-hidden">
                                    <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-4">
                                        <div className="flex items-center gap-2">
                                            <Droplets className="w-6 h-6" />
                                            <span className="font-bold">Humidity</span>
                                        </div>
                                    </div>
                                    <div className="p-5">
                                        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-2xl p-6 mb-4">
                                            <div className="text-4xl font-extrabold mb-2">{result.humidity.min}-{result.humidity.max}%</div>
                                            <div className="text-white/90">{result.humidity.description}</div>
                                        </div>
                                        <div className="bg-blue-50 rounded-xl p-4">
                                            <div className="text-xs text-blue-600 font-bold uppercase mb-1">Misting Schedule</div>
                                            <div className="font-bold text-blue-900">{result.humidity.misting}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Lighting & Ventilation */}
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="bg-white rounded-3xl shadow-xl ring-1 ring-slate-900/5 overflow-hidden">
                                    <div className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white p-4">
                                        <div className="flex items-center gap-2">
                                            <Sun className="w-6 h-6" />
                                            <span className="font-bold">Lighting</span>
                                        </div>
                                    </div>
                                    <div className="p-5">
                                        <ul className="space-y-3">
                                            {result.lighting.recommendations.map((rec, idx) => (
                                                <li key={idx} className="text-sm text-slate-700 flex items-start gap-3">
                                                    <span className="w-2 h-2 rounded-full bg-yellow-500 mt-2 flex-shrink-0"></span>
                                                    {rec}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                <div className="bg-white rounded-3xl shadow-xl ring-1 ring-slate-900/5 overflow-hidden">
                                    <div className="bg-gradient-to-r from-slate-500 to-gray-600 text-white p-4">
                                        <div className="flex items-center gap-2">
                                            <Wind className="w-6 h-6" />
                                            <span className="font-bold">Ventilation</span>
                                        </div>
                                    </div>
                                    <div className="p-5">
                                        <div className="mb-4">
                                            <span className="text-xs text-slate-500 uppercase">Type: </span>
                                            <span className="font-bold text-slate-900 capitalize">{result.ventilation.type}</span>
                                        </div>
                                        <ul className="space-y-3">
                                            {result.ventilation.recommendations.map((rec, idx) => (
                                                <li key={idx} className="text-sm text-slate-700 flex items-start gap-3">
                                                    <span className="w-2 h-2 rounded-full bg-slate-500 mt-2 flex-shrink-0"></span>
                                                    {rec}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Decor */}
                            <div className="bg-white rounded-3xl shadow-xl ring-1 ring-slate-900/5 overflow-hidden">
                                <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4">
                                    <div className="flex items-center gap-2">
                                        <TreePine className="w-6 h-6" />
                                        <span className="font-bold">Enclosure Decor</span>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <div className="grid sm:grid-cols-3 gap-4">
                                        <div className="bg-purple-50 rounded-2xl p-4">
                                            <div className="flex items-center gap-2 mb-3">
                                                <TreePine className="w-5 h-5 text-purple-600" />
                                                <div className="text-xs font-bold text-purple-600 uppercase">Climbing</div>
                                            </div>
                                            <ul className="space-y-2">
                                                {result.decor.climbing.map((item, idx) => (
                                                    <li key={idx} className="text-sm text-purple-900">• {item}</li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div className="bg-pink-50 rounded-2xl p-4">
                                            <div className="flex items-center gap-2 mb-3">
                                                <Shield className="w-5 h-5 text-pink-600" />
                                                <div className="text-xs font-bold text-pink-600 uppercase">Hiding</div>
                                            </div>
                                            <ul className="space-y-2">
                                                {result.decor.hiding.map((item, idx) => (
                                                    <li key={idx} className="text-sm text-pink-900">• {item}</li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div className="bg-fuchsia-50 rounded-2xl p-4">
                                            <div className="flex items-center gap-2 mb-3">
                                                <Leaf className="w-5 h-5 text-fuchsia-600" />
                                                <div className="text-xs font-bold text-fuchsia-600 uppercase">Foliage</div>
                                            </div>
                                            <ul className="space-y-2">
                                                {result.decor.foliage.map((item, idx) => (
                                                    <li key={idx} className="text-sm text-fuchsia-900">• {item}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Tips */}
                            {result.tips.length > 0 && (
                                <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-3xl p-6 shadow-lg">
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-amber-500 rounded-xl">
                                            <Sparkles className="w-8 h-8 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-bold text-amber-900 text-xl mb-4">Pro Tips</div>
                                            <ul className="space-y-3">
                                                {result.tips.map((tip, idx) => (
                                                    <li key={idx} className="text-base text-amber-800 leading-relaxed">{tip}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Checklist */}
                            <div className="bg-white rounded-3xl shadow-xl ring-1 ring-slate-900/5 overflow-hidden">
                                <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-4">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="w-6 h-6" />
                                        <span className="font-bold">Setup Checklist</span>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <ul className="space-y-3">
                                        {result.checklist.map((item, idx) => (
                                            <li key={idx} className="text-base text-slate-700 flex items-start gap-3">
                                                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                    <CheckCircle2 className="w-4 h-4 text-white" />
                                                </div>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className="py-8 text-center text-slate-500 text-sm">
                <p>Mantis Habitat Calculator • Perfect homes for your mantis</p>
            </div>
        </div>
    );
};

export default MantisHabitatCalculator;
