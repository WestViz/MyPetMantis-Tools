import React, { useState, useMemo } from 'react';
import { 
    CheckCircle2, XCircle, Star, Award, 
    MapPin, ThermometerSun, Droplets, Shield,
    Zap, AlertTriangle, Info, ArrowRight, Filter
} from 'lucide-react';

type CareLevel = 'beginner' | 'intermediate' | 'advanced';
type Temperament = 'passive' | 'moderate' | 'aggressive';
type Climate = 'tropical' | 'temperate' | 'subtropical';

interface Species {
    id: string;
    name: string;
    scientific: string;
    emoji: string;
    careLevel: CareLevel;
    temperament: Temperament;
    adultSize: string;
    lifespan: string;
    temperature: string;
    humidity: string;
    enclosure: string;
    difficultyScore: number;
    priceRange: string;
    availability: 'common' | 'uncommon' | 'rare';
    features: string[];
    colorGradient: string;
}

const SPECIES: Species[] = [
    {
        id: 'chinese',
        name: 'Chinese Mantis',
        scientific: 'Tenodera sinensis',
        emoji: '🦗',
        careLevel: 'beginner',
        temperament: 'aggressive',
        adultSize: '8-10 cm',
        lifespan: '8-12 months',
        temperature: '75-85°F (24-29°C)',
        humidity: '40-60%',
        enclosure: '30-50cm height',
        difficultyScore: 3,
        priceRange: '$10-20',
        availability: 'common',
        features: [
            'Large and active',
            'Aggressive feeder',
            'Hardy and resilient',
            'Easy to breed',
            'Widely available'
        ],
        colorGradient: 'from-amber-500 to-orange-600'
    },
    {
        id: 'carolina',
        name: 'Carolina Mantis',
        scientific: 'Stagmomantis carolina',
        emoji: '🍃',
        careLevel: 'intermediate',
        temperament: 'moderate',
        adultSize: '5-7 cm',
        lifespan: '6-10 months',
        temperature: '75-82°F (24-28°C)',
        humidity: '50-70%',
        enclosure: '25-40cm height',
        difficultyScore: 5,
        priceRange: '$15-30',
        availability: 'uncommon',
        features: [
            'Native to North America',
            'Compact size',
            'Moderate temperament',
            'Good climber',
            'Unique appearance'
        ],
        colorGradient: 'from-emerald-500 to-teal-600'
    },
    {
        id: 'european',
        name: 'European Mantis',
        scientific: 'Mantis religiosa',
        emoji: '🌿',
        careLevel: 'beginner',
        temperament: 'moderate',
        adultSize: '6-8 cm',
        lifespan: '6-10 months',
        temperature: '75-85°F (24-29°C)',
        humidity: '40-60%',
        enclosure: '25-40cm height',
        difficultyScore: 4,
        priceRange: '$12-25',
        availability: 'common',
        features: [
            'Iconic species',
            'Distinctive spot',
            'Easy care',
            'Moderate size',
            'Widely available'
        ],
        colorGradient: 'from-blue-500 to-indigo-600'
    },
    {
        id: 'orchid',
        name: 'Orchid Mantis',
        scientific: 'Hymenopus coronatus',
        emoji: '🌸',
        careLevel: 'advanced',
        temperament: 'passive',
        adultSize: '5-7 cm',
        lifespan: '6-8 months',
        temperature: '78-85°F (26-29°C)',
        humidity: '60-80%',
        enclosure: '30-45cm height',
        difficultyScore: 8,
        priceRange: '$40-80',
        availability: 'uncommon',
        features: [
            'Stunning appearance',
            'Flower mimicry',
            'High humidity needs',
            'Passive hunter',
            'Exotic pet status'
        ],
        colorGradient: 'from-pink-500 to-rose-600'
    },
    {
        id: 'flower',
        name: 'Flower Mantis',
        scientific: 'Pseudocreobotra wahlbergii',
        emoji: '🌺',
        careLevel: 'intermediate',
        temperament: 'moderate',
        adultSize: '4-6 cm',
        lifespan: '6-9 months',
        temperature: '75-85°F (24-29°C)',
        humidity: '50-70%',
        enclosure: '25-35cm height',
        difficultyScore: 6,
        priceRange: '$30-60',
        availability: 'uncommon',
        features: [
            'Colorful patterns',
            'Helical display',
            'Moderate care',
            'Flower-like',
            'Active hunter'
        ],
        colorGradient: 'from-fuchsia-500 to-pink-600'
    },
    {
        id: 'giant_african',
        name: 'Giant African Mantis',
        scientific: 'Sphodromantis lineola',
        emoji: '🦁',
        careLevel: 'beginner',
        temperament: 'aggressive',
        adultSize: '8-10 cm',
        lifespan: '10-14 months',
        temperature: '75-85°F (24-29°C)',
        humidity: '40-60%',
        enclosure: '35-50cm height',
        difficultyScore: 2,
        priceRange: '$15-35',
        availability: 'common',
        features: [
            'Very large',
            'Aggressive feeder',
            'Hardy',
            'Long lifespan',
            'Easy to breed'
        ],
        colorGradient: 'from-orange-500 to-red-600'
    },
    {
        id: 'dead_leaf',
        name: 'Dead Leaf Mantis',
        scientific: 'Deroplatys desiccata',
        emoji: '🍂',
        careLevel: 'advanced',
        temperament: 'passive',
        adultSize: '7-9 cm',
        lifespan: '6-9 months',
        temperature: '75-82°F (24-28°C)',
        humidity: '60-70%',
        enclosure: '30-40cm height',
        difficultyScore: 7,
        priceRange: '$35-70',
        availability: 'rare',
        features: [
            'Perfect camouflage',
            'Leaf mimicry',
            'High humidity needs',
            'Passive hunter',
            'Unique appearance'
        ],
        colorGradient: 'from-amber-600 to-yellow-700'
    },
    {
        id: 'budwing',
        name: 'Budwing Mantis',
        scientific: 'Parasphendale agrionina',
        emoji: '🦋',
        careLevel: 'intermediate',
        temperament: 'aggressive',
        adultSize: '5-6 cm',
        lifespan: '8-11 months',
        temperature: '75-85°F (24-29°C)',
        humidity: '40-60%',
        enclosure: '25-35cm height',
        difficultyScore: 4,
        priceRange: '$20-40',
        availability: 'uncommon',
        features: [
            'Colorful wings',
            'Aggressive',
            'Moderate care',
            'Good starter',
            'Active hunter'
        ],
        colorGradient: 'from-purple-500 to-violet-600'
    }
];

const SpeciesSelector: React.FC = () => {
    const [view, setView] = useState<'explore' | 'compare' | 'quiz'>('explore');
    const [selectedSpecies, setSelectedSpecies] = useState<string[]>([]);
    const [filters, setFilters] = useState<{
        careLevel: CareLevel | 'all';
        temperament: Temperament | 'all';
        maxSize: string;
    }>({
        careLevel: 'all',
        temperament: 'all',
        maxSize: 'all'
    });

    const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
    const [quizComplete, setQuizComplete] = useState(false);

    const filteredSpecies = useMemo(() => {
        return SPECIES.filter(species => {
            if (filters.careLevel !== 'all' && species.careLevel !== filters.careLevel) return false;
            if (filters.temperament !== 'all' && species.temperament !== filters.temperament) return false;
            if (filters.maxSize !== 'all') {
                const size = parseInt(species.adultSize.split('-')[0]);
                if (filters.maxSize === 'small' && size > 7) return false;
                if (filters.maxSize === 'medium' && (size <= 5 || size > 9)) return false;
                if (filters.maxSize === 'large' && size <= 7) return false;
            }
            return true;
        });
    }, [filters]);

    const toggleSpecies = (id: string) => {
        const newSelected = [...selectedSpecies];
        if (newSelected.includes(id)) {
            setSelectedSpecies(newSelected.filter(s => s !== id));
        } else if (newSelected.length < 3) {
            setSelectedSpecies([...newSelected, id]);
        }
    };

    const getQuizRecommendations = () => {
        const answers = quizAnswers;
        
        if (Object.keys(answers).length < 4) return [];
        
        return SPECIES.filter(species => {
            // Care level match
            if (answers[1] === 'beginner' && species.careLevel !== 'beginner') return false;
            if (answers[1] === 'intermediate' && species.careLevel === 'advanced') return false;
            
            // Temperament match
            if (answers[2] === 'passive' && species.temperament !== 'passive') return false;
            if (answers[2] === 'aggressive' && species.temperament !== 'aggressive') return false;
            
            return true;
        }).sort((a, b) => a.difficultyScore - b.difficultyScore);
    };

    const recommendations = getQuizRecommendations();

    const quizQuestions = [
        {
            id: 0,
            question: "What's your experience level with exotic pets?",
            options: [
                { value: 'none', label: 'Complete beginner' },
                { value: 'some', label: 'Some experience' },
                { value: 'experienced', label: 'Very experienced' }
            ]
        },
        {
            id: 1,
            question: "What care level are you comfortable with?",
            options: [
                { value: 'beginner', label: 'Easy, low maintenance' },
                { value: 'intermediate', label: 'Moderate care' },
                { value: 'advanced', label: 'Advanced, specific needs' }
            ]
        },
        {
            id: 2,
            question: "What temperament do you prefer?",
            options: [
                { value: 'passive', label: 'Passive and calm' },
                { value: 'moderate', label: 'Moderate temperament' },
                { value: 'aggressive', label: 'Active and bold' }
            ]
        },
        {
            id: 3,
            question: "How much space do you have?",
            options: [
                { value: 'small', label: 'Limited space (small enclosure)' },
                { value: 'medium', label: 'Medium space' },
                { value: 'large', label: 'Plenty of space' }
            ]
        }
    ];

    const getCareLevelBadge = (level: CareLevel) => {
        switch (level) {
            case 'beginner': return 'bg-green-100 text-green-800';
            case 'intermediate': return 'bg-yellow-100 text-yellow-800';
            case 'advanced': return 'bg-red-100 text-red-800';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 font-sans">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMCAwaDQwdjQwSDBWMHptMjAgMjBoMjB2MjBIMjBWMjB6TTAgMjBoMjB2MjBIMFYyMHoyMCAwaDIwdjIwSDIwVjB6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
                <div className="relative max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center p-4 bg-white/10 backdrop-blur-sm rounded-2xl mb-6 shadow-lg ring-1 ring-white/20">
                            <Award className="w-12 h-12" />
                        </div>
                        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
                            Species Selector
                        </h1>
                        <p className="text-xl text-white/90 max-w-2xl mx-auto">
                            Find the perfect praying mantis species for you
                        </p>
                    </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-slate-50/50 to-transparent"></div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10 pb-16 space-y-6">
                
                {/* View Toggle */}
                <div className="bg-white rounded-3xl shadow-xl ring-1 ring-slate-900/5 p-2">
                    <div className="grid grid-cols-3 gap-2">
                        <button
                            onClick={() => setView('explore')}
                            className={`p-3 rounded-2xl font-bold transition-all ${
                                view === 'explore' 
                                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white' 
                                    : 'text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                            Explore
                        </button>
                        <button
                            onClick={() => setView('compare')}
                            className={`p-3 rounded-2xl font-bold transition-all ${
                                view === 'compare' 
                                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white' 
                                    : 'text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                            Compare
                        </button>
                        <button
                            onClick={() => setView('quiz')}
                            className={`p-3 rounded-2xl font-bold transition-all ${
                                view === 'quiz' 
                                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white' 
                                    : 'text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                            Find Your Match
                        </button>
                    </div>
                </div>

                {/* Explore View */}
                {view === 'explore' && (
                    <div className="space-y-6">
                        {/* Filters */}
                        <div className="bg-white rounded-3xl shadow-xl ring-1 ring-slate-900/5 p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <Filter className="w-5 h-5 text-indigo-600" />
                                <h3 className="text-lg font-bold text-slate-900">Filter Species</h3>
                            </div>
                            <div className="grid sm:grid-cols-3 gap-4">
                                <div>
                                    <label className="text-sm text-slate-500 font-semibold uppercase mb-2 block">Care Level</label>
                                    <select
                                        value={filters.careLevel}
                                        onChange={(e) => setFilters({ ...filters, careLevel: e.target.value as any })}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="all">All Levels</option>
                                        <option value="beginner">Beginner</option>
                                        <option value="intermediate">Intermediate</option>
                                        <option value="advanced">Advanced</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm text-slate-500 font-semibold uppercase mb-2 block">Temperament</label>
                                    <select
                                        value={filters.temperament}
                                        onChange={(e) => setFilters({ ...filters, temperament: e.target.value as any })}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="all">All Temperaments</option>
                                        <option value="passive">Passive</option>
                                        <option value="moderate">Moderate</option>
                                        <option value="aggressive">Aggressive</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm text-slate-500 font-semibold uppercase mb-2 block">Size</label>
                                    <select
                                        value={filters.maxSize}
                                        onChange={(e) => setFilters({ ...filters, maxSize: e.target.value as any })}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="all">All Sizes</option>
                                        <option value="small">Small (&lt;7cm)</option>
                                        <option value="medium">Medium (5-9cm)</option>
                                        <option value="large">Large (&gt;7cm)</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Species Grid */}
                        <div className="grid sm:grid-cols-2 gap-4">
                            {filteredSpecies.map(species => (
                                <div key={species.id} className="bg-white rounded-3xl shadow-xl ring-1 ring-slate-900/5 overflow-hidden hover:shadow-2xl transition-all">
                                    <div className={`bg-gradient-to-r ${species.colorGradient} text-white p-4`}>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <span className="text-4xl">{species.emoji}</span>
                                                <div>
                                                    <div className="font-bold">{species.name}</div>
                                                    <div className="text-sm text-white/80">{species.scientific}</div>
                                                </div>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${getCareLevelBadge(species.careLevel)}`}>
                                                {species.careLevel}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <div className="grid grid-cols-2 gap-3 mb-4">
                                            <div className="bg-slate-50 p-3 rounded-xl">
                                                <div className="text-xs text-slate-500 uppercase">Size</div>
                                                <div className="font-semibold text-slate-900">{species.adultSize}</div>
                                            </div>
                                            <div className="bg-slate-50 p-3 rounded-xl">
                                                <div className="text-xs text-slate-500 uppercase">Lifespan</div>
                                                <div className="font-semibold text-slate-900">{species.lifespan}</div>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3 mb-4">
                                            <div className="bg-indigo-50 p-3 rounded-xl">
                                                <ThermometerSun className="w-4 h-4 text-indigo-600 mb-1" />
                                                <div className="font-semibold text-slate-900 text-sm">{species.temperature}</div>
                                            </div>
                                            <div className="bg-blue-50 p-3 rounded-xl">
                                                <Droplets className="w-4 h-4 text-blue-600 mb-1" />
                                                <div className="font-semibold text-slate-900 text-sm">{species.humidity}</div>
                                            </div>
                                        </div>
                                        <div className="mb-4">
                                            <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                                                <Shield className="w-4 h-4" />
                                                Key Features
                                            </div>
                                            <div className="space-y-1">
                                                {species.features.slice(0, 3).map((feature, idx) => (
                                                    <div key={idx} className="text-sm text-slate-700 flex items-center gap-2">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                                                        {feature}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                                            <div className="text-sm text-slate-600">
                                                <span className="font-bold text-slate-900">{species.priceRange}</span>
                                                <span className="ml-2 text-xs bg-slate-100 px-2 py-1 rounded-full">{species.availability}</span>
                                            </div>
                                            <button
                                                onClick={() => toggleSpecies(species.id)}
                                                className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                                                    selectedSpecies.includes(species.id)
                                                        ? 'bg-indigo-500 text-white'
                                                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                                }`}
                                            >
                                                {selectedSpecies.includes(species.id) ? 'Selected' : 'Compare'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Compare View */}
                {view === 'compare' && (
                    <div className="space-y-6">
                        {selectedSpecies.length === 0 ? (
                            <div className="bg-white rounded-3xl shadow-xl ring-1 ring-slate-900/5 p-12 text-center">
                                <Star className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-slate-900 mb-2">No Species Selected</h3>
                                <p className="text-slate-500 mb-6">
                                    Go to Explore view and select 2-3 species to compare
                                </p>
                                <button
                                    onClick={() => setView('explore')}
                                    className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all"
                                >
                                    <Filter className="w-5 h-5" />
                                    Browse Species
                                </button>
                            </div>
                        ) : (
                            <div className="bg-white rounded-3xl shadow-xl ring-1 ring-slate-900/5 overflow-hidden">
                                <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white p-4">
                                    <h3 className="text-lg font-bold">Side-by-Side Comparison</h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <div className={`grid ${selectedSpecies.length === 2 ? 'grid-cols-2' : 'grid-cols-3'} min-w-[600px]`}>
                                        {selectedSpecies.map(id => {
                                            const species = SPECIES.find(s => s.id === id);
                                            if (!species) return null;
                                            return (
                                                <div key={id} className="p-6 border-b border-r border-slate-200">
                                                    <div className={`bg-gradient-to-r ${species.colorGradient} text-white rounded-2xl p-4 mb-4`}>
                                                        <div className="text-4xl mb-2">{species.emoji}</div>
                                                        <div className="font-bold">{species.name}</div>
                                                        <div className="text-sm text-white/80">{species.scientific}</div>
                                                    </div>
                                                    <div className="space-y-3">
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-sm text-slate-500">Care Level</span>
                                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${getCareLevelBadge(species.careLevel)}`}>{species.careLevel}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-sm text-slate-500">Temperament</span>
                                                            <span className="font-semibold text-slate-900 capitalize">{species.temperament}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-sm text-slate-500">Size</span>
                                                            <span className="font-semibold text-slate-900">{species.adultSize}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-sm text-slate-500">Lifespan</span>
                                                            <span className="font-semibold text-slate-900">{species.lifespan}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-sm text-slate-500">Price</span>
                                                            <span className="font-bold text-indigo-600">{species.priceRange}</span>
                                                        </div>
                                                        <div className="pt-2 border-t border-slate-200">
                                                            <div className="text-xs text-slate-500 uppercase mb-2">Key Features</div>
                                                            <ul className="space-y-1">
                                                                {species.features.map((feature, idx) => (
                                                                    <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                                                                        <CheckCircle2 className="w-3 h-3 text-green-500 mt-1 flex-shrink-0" />
                                                                        {feature}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Quiz View */}
                {view === 'quiz' && (
                    <div className="space-y-6">
                        {!quizComplete ? (
                            <>
                                {quizQuestions.map((question, qIdx) => (
                                    <div key={question.id} className="bg-white rounded-3xl shadow-xl ring-1 ring-slate-900/5 overflow-hidden">
                                        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white p-4">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-lg font-bold">
                                                    Question {qIdx + 1} of {quizQuestions.length}
                                                </h3>
                                                {quizAnswers[question.id] && (
                                                    <CheckCircle2 className="w-6 h-6" />
                                                )}
                                            </div>
                                        </div>
                                        <div className="p-6">
                                            <p className="text-lg font-semibold text-slate-900 mb-4">{question.question}</p>
                                            <div className="space-y-3">
                                                {question.options.map(option => (
                                                    <button
                                                        key={option.value}
                                                        onClick={() => setQuizAnswers({ ...quizAnswers, [question.id]: option.value })}
                                                        className={`w-full text-left p-4 rounded-2xl border-2 transition-all
                                                            ${quizAnswers[question.id] === option.value
                                                                ? 'border-indigo-500 bg-indigo-50'
                                                                : 'border-slate-200 hover:border-indigo-300'}`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center
                                                                ${quizAnswers[question.id] === option.value
                                                                    ? 'border-indigo-500 bg-indigo-500'
                                                                    : 'border-slate-300'}`}>
                                                                {quizAnswers[question.id] === option.value && (
                                                                    <CheckCircle2 className="w-4 h-4 text-white" />
                                                                )}
                                                            </div>
                                                            <span className="font-semibold text-slate-900">{option.label}</span>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {Object.keys(quizAnswers).length === quizQuestions.length && (
                                    <button
                                        onClick={() => setQuizComplete(true)}
                                        className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white p-4 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-3"
                                    >
                                        <Star className="w-5 h-5" />
                                        <span className="font-bold">See Your Recommendations</span>
                                        <ArrowRight className="w-5 h-5" />
                                    </button>
                                )}
                            </>
                        ) : (
                            <div className="space-y-6">
                                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-3xl p-6">
                                    <div className="flex items-center gap-3">
                                        <Award className="w-8 h-8" />
                                        <div>
                                            <div className="text-sm text-white/80">Your Perfect Match</div>
                                            <div className="text-2xl font-extrabold">
                                                {recommendations.length} Recommended Species
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {recommendations.length > 0 ? (
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        {recommendations.map(species => (
                                            <div key={species.id} className="bg-white rounded-3xl shadow-xl ring-1 ring-slate-900/5 overflow-hidden">
                                                <div className={`bg-gradient-to-r ${species.colorGradient} text-white p-4`}>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-4xl">{species.emoji}</span>
                                                        <div>
                                                            <div className="font-bold">{species.name}</div>
                                                            <div className="text-sm text-white/80">{species.scientific}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="p-4">
                                                    <div className="space-y-2 mb-4">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-sm text-slate-500">Care Level</span>
                                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${getCareLevelBadge(species.careLevel)}`}>{species.careLevel}</span>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-sm text-slate-500">Temperament</span>
                                                            <span className="font-semibold text-slate-900 capitalize">{species.temperament}</span>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-sm text-slate-500">Price</span>
                                                            <span className="font-bold text-indigo-600">{species.priceRange}</span>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => { toggleSpecies(species.id); setView('compare'); }}
                                                        className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all"
                                                    >
                                                        Compare With Others
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="bg-white rounded-3xl shadow-xl ring-1 ring-slate-900/5 p-12 text-center">
                                        <Info className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                                        <h3 className="text-xl font-bold text-slate-900 mb-2">No Perfect Match</h3>
                                        <p className="text-slate-500 mb-6">
                                            Your preferences didn't match any species exactly. Try adjusting your answers or explore all species to find a good compromise.
                                        </p>
                                        <button
                                            onClick={() => { setQuizComplete(false); setQuizAnswers({}); }}
                                            className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all"
                                        >
                                            <Filter className="w-5 h-5" />
                                            Retake Quiz
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="py-8 text-center text-slate-500 text-sm">
                <p>Species Selector • Find your perfect mantis companion</p>
            </div>
        </div>
    );
};

export default SpeciesSelector;
