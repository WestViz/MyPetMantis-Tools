import React, { useState } from 'react';
import { 
    AlertTriangle, Stethoscope, Activity, Heart, 
    Droplets, ThermometerSun, Bug, HelpCircle,
    CheckCircle2, XCircle, ExternalLink, Info,
    Clock, Shield
} from 'lucide-react';

type Symptom = string;
type Severity = 'low' | 'moderate' | 'high' | 'critical';
type DiagnosisCategory = 'nutritional' | 'environmental' | 'parasitic' | 'injury' | 'behavioral' | 'molt-related';

interface SymptomGroup {
    category: string;
    icon: any;
    symptoms: {
        id: string;
        label: string;
        description: string;
    }[];
}

interface Diagnosis {
    id: string;
    condition: string;
    category: DiagnosisCategory;
    confidence: number;
    severity: Severity;
    symptoms: string[];
    description: string;
    treatments: string[];
    urgency: string;
    prevention: string[];
}

const SYMPTOM_GROUPS: SymptomGroup[] = [
    {
        category: 'Feeding',
        icon: Bug,
        symptoms: [
            { id: 'not_eating', label: 'Not eating', description: 'Refusing food for several days' },
            { id: 'regurgitating', label: 'Regurgitating', description: 'Bringing food back up' },
            { id: 'underweight', label: 'Underweight', description: 'Visible ribs, thin appearance' },
            { id: 'overweight', label: 'Overweight', description: 'Bulging abdomen, difficulty moving' },
            { id: 'difficulty_catching', label: 'Difficulty catching prey', description: 'Misses prey strikes repeatedly' },
        ]
    },
    {
        category: 'Appearance',
        icon: Activity,
        symptoms: [
            { id: 'discolored', label: 'Discolored', description: 'Unusual color changes' },
            { id: 'dark_spots', label: 'Dark spots', description: 'Black or dark patches on body' },
            { id: 'swollen', label: 'Swollen', description: 'Swollen abdomen or limbs' },
            { id: 'deformed', label: 'Deformed', description: 'Misshapen body parts' },
            { id: 'missing_limbs', label: 'Missing limbs', description: 'Lost legs or antennae' },
        ]
    },
    {
        category: 'Movement',
        icon: Heart,
        symptoms: [
            { id: 'lethargic', label: 'Lethargic', description: 'Inactive, slow movements' },
            { id: 'uncoordinated', label: 'Uncoordinated', description: 'Clumsy, falls often' },
            { id: 'trembling', label: 'Trembling', description: 'Shaking or vibrating' },
            { id: 'lying_down', label: 'Lying down', description: 'Frequently on back or side' },
            { id: 'unable_climb', label: 'Unable to climb', description: 'Difficulty climbing surfaces' },
        ]
    },
    {
        category: 'Environmental',
        icon: ThermometerSun,
        symptoms: [
            { id: 'too_hot', label: 'Heat stress', description: 'Trying to escape heat, panting' },
            { id: 'too_cold', label: 'Cold stress', description: 'Slow, seeking warmth' },
            { id: 'dry', label: 'Dry environment', description: 'Skin looks dried out, wrinkled' },
            { id: 'too_humid', label: 'Excess humidity', description: 'Mold growth, wet appearance' },
        ]
    },
    {
        category: 'Molting Issues',
        icon: HelpCircle,
        symptoms: [
            { id: 'stuck_molt', label: 'Stuck in old skin', description: 'Unable to complete molt' },
            { id: 'partial_molt', label: 'Partial molt', description: 'Some parts didn\'t shed' },
            { id: 'deformed_after_molt', label: 'Deformed after molt', description: 'Crippled or misshapen post-molt' },
            { id: 'not_molting', label: 'Not molting', description: 'Overdue for molt' },
        ]
    },
    {
        category: 'Other',
        icon: AlertTriangle,
        symptoms: [
            { id: 'wounds', label: 'Visible wounds', description: 'Open cuts or injuries' },
            { id: 'unusual_behavior', label: 'Unusual behavior', description: 'Strange or erratic actions' },
            { id: 'abdomen_hard', label: 'Hard abdomen', description: 'Abnormally firm or distended' },
        ]
    }
];

const DIAGNOSES: Diagnosis[] = [
    {
        id: 'dehydration',
        condition: 'Dehydration',
        category: 'environmental',
        confidence: 85,
        severity: 'moderate',
        symptoms: ['dry', 'discolored', 'lethargic', 'not_eating'],
        description: 'Your mantis is dehydrated, which can be fatal if not addressed quickly.',
        treatments: [
            'Increase humidity to 60-70%',
            'Mist enclosure 2-3 times daily',
            'Offer water droplets via misting or shallow dish',
            'Check temperature isn\'t too high (accelerates dehydration)',
        ],
        urgency: 'Treat within 24 hours',
        prevention: [
            'Maintain proper humidity for species',
            'Mist regularly',
            'Monitor water consumption',
        ]
    },
    {
        id: 'nutritional_deficiency',
        condition: 'Nutritional Deficiency',
        category: 'nutritional',
        confidence: 75,
        severity: 'moderate',
        symptoms: ['underweight', 'discolored', 'lethargic', 'difficulty_catching'],
        description: 'Your mantis may be lacking essential nutrients from their diet.',
        treatments: [
            'Improve gut loading of prey',
            'Diversify prey types (crickets, flies, moths)',
            'Consider calcium supplements for adults',
            'Ensure prey is fresh and healthy',
        ],
        urgency: 'Address within 1 week',
        prevention: [
            'Feed varied diet',
            'Gut load prey properly',
            'Use quality feeder insects',
        ]
    },
    {
        id: 'impaction',
        condition: 'Impaction',
        category: 'nutritional',
        confidence: 70,
        severity: 'critical',
        symptoms: ['not_eating', 'abdomen_hard', 'lethargic', 'swollen'],
        description: 'Your mantis has eaten something indigestible or too large, causing blockage.',
        treatments: [
            'Increase humidity to help with digestion',
            'Stop feeding immediately',
            'Gently massage abdomen (risky, may stress mantis)',
            'Consult vet immediately if no improvement in 12-24 hours',
        ],
        urgency: 'VET NOW - Critical condition',
        prevention: [
            'Feed appropriately sized prey',
            'Avoid hard-shelled insects for young mantises',
            'Monitor feeding carefully',
        ]
    },
    {
        id: 'molt_complication',
        condition: 'Molt Complication',
        category: 'molt-related',
        confidence: 80,
        severity: 'high',
        symptoms: ['stuck_molt', 'partial_molt', 'deformed_after_molt', 'not_molting'],
        description: 'Your mantis is having difficulty with molting, which is a critical life stage.',
        treatments: [
            'Increase humidity to 70-80%',
            'Provide vertical climbing surface',
            'Gently assist ONLY if mantis is completely stuck (last resort)',
            'Do not disturb during molt',
            'Remove uneaten prey to prevent injury',
        ],
        urgency: 'Critical - Act immediately',
        prevention: [
            'Maintain proper humidity',
            'Provide adequate climbing space',
            'Don\'t disturb during molt',
        ]
    },
    {
        id: 'thermal_stress',
        condition: 'Temperature Stress',
        category: 'environmental',
        confidence: 75,
        severity: 'moderate',
        symptoms: ['too_hot', 'too_cold', 'lethargic', 'uncoordinated'],
        description: 'Environmental temperatures are outside the mantis\'s comfort range.',
        treatments: [
            'Adjust enclosure temperature to species requirements (75-85°F day)',
            'Use heat lamps or cooling methods as needed',
            'Monitor with reliable thermometer',
            'Ensure proper temperature gradient',
        ],
        urgency: 'Correct within 24 hours',
        prevention: [
            'Use thermostat-controlled heating',
            'Monitor temperature daily',
            'Provide temperature gradient',
        ]
    },
    {
        id: 'parasitic_infection',
        condition: 'Parasitic Infection',
        category: 'parasitic',
        confidence: 65,
        severity: 'high',
        symptoms: ['lethargic', 'swollen', 'dark_spots', 'not_eating'],
        description: 'Your mantis may have internal or external parasites.',
        treatments: [
            'Isolate from other mantises',
            'Clean enclosure thoroughly',
            'Consult exotic pet vet for proper medication',
            'Monitor closely for worsening symptoms',
        ],
        urgency: 'Veterinary care recommended',
        prevention: [
            'Quarantine new mantises',
            'Keep enclosure clean',
            'Use clean feeder insects',
        ]
    },
    {
        id: 'injury_trauma',
        condition: 'Injury/Trauma',
        category: 'injury',
        confidence: 70,
        severity: 'moderate',
        symptoms: ['wounds', 'missing_limbs', 'uncoordinated', 'unusual_behavior'],
        description: 'Your mantis has sustained physical injury.',
        treatments: [
            'Clean wounds with distilled water',
            'Keep humidity moderate to aid healing',
            'Isolate to prevent further injury',
            'Most mantises can adapt to lost limbs',
            'Consult vet for severe injuries',
        ],
        urgency: 'Treat within 48 hours',
        prevention: [
            'Remove aggressive prey',
            'Provide proper enclosure size',
            'Handle carefully and infrequently',
        ]
    },
    {
        id: 'obesity',
        condition: 'Obesity',
        category: 'nutritional',
        confidence: 85,
        severity: 'low',
        symptoms: ['overweight', 'lethargic', 'difficulty_catching'],
        description: 'Your mantis is overweight, which can reduce lifespan and activity.',
        treatments: [
            'Reduce feeding frequency',
            'Feed smaller prey items',
            'Increase opportunities for exercise',
            'Monitor weight over time',
        ],
        urgency: 'Adjust within 1-2 weeks',
        prevention: [
            'Feed appropriate portions',
            'Don\'t overfeed adults',
            'Monitor body condition',
        ]
    }
];

const HealthSymptomChecker: React.FC = () => {
    const [selectedSymptoms, setSelectedSymptoms] = useState<Set<Symptom>>(new Set());
    const [showResults, setShowResults] = useState(false);

    const toggleSymptom = (symptomId: string) => {
        const newSelected = new Set(selectedSymptoms);
        if (newSelected.has(symptomId)) {
            newSelected.delete(symptomId);
        } else {
            newSelected.add(symptomId);
        }
        setSelectedSymptoms(newSelected);
        setShowResults(false);
    };

    const getDiagnoses = (): Diagnosis[] => {
        const diagnoses = DIAGNOSES.map(diagnosis => {
            const matchingSymptoms = diagnosis.symptoms.filter(s => selectedSymptoms.has(s));
            const confidence = matchingSymptoms.length > 0 
                ? Math.min(95, (matchingSymptoms.length / diagnosis.symptoms.length) * 100)
                : 0;
            return { ...diagnosis, confidence };
        }).filter(d => d.confidence > 20).sort((a, b) => b.confidence - a.confidence);

        return diagnoses.slice(0, 5);
    };

    const diagnoses = getDiagnoses();

    const getSeverityColor = (severity: Severity): string => {
        switch (severity) {
            case 'low': return 'from-green-500 to-emerald-600';
            case 'moderate': return 'from-yellow-500 to-amber-600';
            case 'high': return 'from-orange-500 to-red-500';
            case 'critical': return 'from-red-600 to-rose-700';
        }
    };

    const getSeverityBadge = (severity: Severity): string => {
        switch (severity) {
            case 'low': return 'bg-green-100 text-green-800';
            case 'moderate': return 'bg-yellow-100 text-yellow-800';
            case 'high': return 'bg-orange-100 text-orange-800';
            case 'critical': return 'bg-red-100 text-red-800';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-orange-50 font-sans">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 text-white">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMCAwaDQwdjQwSDBWMHptMjAgMjBoMjB2MjBIMjBWMjB6TTAgMjBoMjB2MjBIMFYyMHoyMCAwaDIwdjIwSDIwVjB6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
                <div className="relative max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center p-4 bg-white/10 backdrop-blur-sm rounded-2xl mb-6 shadow-lg ring-1 ring-white/20">
                            <Stethoscope className="w-12 h-12" />
                        </div>
                        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
                            Health Symptom Checker
                        </h1>
                        <p className="text-xl text-white/90 max-w-2xl mx-auto">
                            Identify health issues and get treatment recommendations for your mantis
                        </p>
                    </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-slate-50/50 to-transparent"></div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10 pb-16 space-y-6">
                
                {/* Disclaimer */}
                <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-3xl p-4">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-red-800">
                            <strong>Disclaimer:</strong> This tool provides general guidance only. For serious or worsening symptoms, consult an exotic pet veterinarian. This is not a substitute for professional veterinary care.
                        </div>
                    </div>
                </div>

                {/* Symptom Selection */}
                {SYMPTOM_GROUPS.map((group, groupIdx) => (
                    <div key={groupIdx} className="bg-white rounded-3xl shadow-xl ring-1 ring-slate-900/5 overflow-hidden">
                        <div className={`bg-gradient-to-r ${
                            groupIdx % 2 === 0 ? 'from-red-500 to-orange-500' : 'from-orange-500 to-amber-500'
                        } text-white p-4 flex items-center gap-3`}>
                            <group.icon className="w-6 h-6" />
                            <h3 className="text-lg font-bold">{group.category}</h3>
                        </div>
                        <div className="p-4 sm:p-6">
                            <div className="grid gap-3">
                                {group.symptoms.map(symptom => (
                                    <button
                                        key={symptom.id}
                                        onClick={() => toggleSymptom(symptom.id)}
                                        className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-300 group
                                            ${selectedSymptoms.has(symptom.id)
                                                ? 'border-red-500 bg-red-50 shadow-lg'
                                                : 'border-slate-200 hover:border-orange-300 hover:shadow-md'}`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5
                                                ${selectedSymptoms.has(symptom.id)
                                                    ? 'border-red-500 bg-red-500'
                                                    : 'border-slate-300'}`}>
                                                {selectedSymptoms.has(symptom.id) && (
                                                    <CheckCircle2 className="w-4 h-4 text-white" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className={`font-bold ${selectedSymptoms.has(symptom.id) ? 'text-red-900' : 'text-slate-900'}`}>
                                                    {symptom.label}
                                                </div>
                                                <div className={`text-sm mt-1 ${selectedSymptoms.has(symptom.id) ? 'text-red-700' : 'text-slate-500'}`}>
                                                    {symptom.description}
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}

                {/* Action Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowResults(!showResults)}
                        disabled={selectedSymptoms.size === 0}
                        className={`flex-1 py-4 rounded-3xl font-bold text-white transition-all duration-300 flex items-center justify-center gap-2
                            ${selectedSymptoms.size === 0 
                                ? 'bg-slate-300 cursor-not-allowed'
                                : 'bg-gradient-to-r from-red-500 to-orange-500 hover:shadow-xl hover:scale-105'}`}
                    >
                        <Activity className="w-5 h-5" />
                        {showResults ? 'Refresh Results' : 'Check Symptoms'} ({selectedSymptoms.size} selected)
                    </button>
                    <button
                        onClick={() => { setSelectedSymptoms(new Set()); setShowResults(false); }}
                        disabled={selectedSymptoms.size === 0}
                        className="px-6 py-4 bg-white rounded-3xl font-bold text-slate-700 border-2 border-slate-200 hover:border-red-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Clear All
                    </button>
                </div>

                {/* Results */}
                {showResults && diagnoses.length > 0 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-gradient-to-r from-red-600 to-orange-500 text-white rounded-3xl p-6">
                            <div className="flex items-center gap-3">
                                <Stethoscope className="w-8 h-8" />
                                <div>
                                    <div className="text-sm text-white/80">Analysis Complete</div>
                                    <div className="text-2xl font-extrabold">{diagnoses.length} Possible Conditions</div>
                                </div>
                            </div>
                        </div>

                        {diagnoses.map((diagnosis, idx) => (
                            <div key={diagnosis.id} className="bg-white rounded-3xl shadow-xl ring-1 ring-slate-900/5 overflow-hidden">
                                <div className={`bg-gradient-to-r ${getSeverityColor(diagnosis.severity)} text-white p-6`}>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className={`px-3 py-1 rounded-full text-xs font-bold ${getSeverityBadge(diagnosis.severity)}`}>
                                                    {diagnosis.severity.toUpperCase()}
                                                </div>
                                                <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold">
                                                    {Math.round(diagnosis.confidence)}% Match
                                                </div>
                                            </div>
                                            <div className="text-2xl font-extrabold">{diagnosis.condition}</div>
                                            <div className="text-white/90 mt-2">{diagnosis.description}</div>
                                        </div>
                                        <div className="text-4xl font-bold opacity-30 ml-4">
                                            #{idx + 1}
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 space-y-4">
                                    {/* Urgency */}
                                    <div className={`p-4 rounded-2xl ${
                                        diagnosis.severity === 'critical' ? 'bg-red-50 border border-red-200' :
                                        diagnosis.severity === 'high' ? 'bg-orange-50 border border-orange-200' :
                                        diagnosis.severity === 'moderate' ? 'bg-yellow-50 border border-yellow-200' :
                                        'bg-green-50 border border-green-200'
                                    }`}>
                                        <div className="flex items-center gap-2 font-bold text-slate-900">
                                            <Clock className="w-5 h-5" />
                                            Urgency: {diagnosis.urgency}
                                        </div>
                                    </div>

                                    {/* Treatments */}
                                    <div>
                                        <div className="text-sm font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4" />
                                            Recommended Treatments
                                        </div>
                                        <ul className="space-y-2">
                                            {diagnosis.treatments.map((treatment, tIdx) => (
                                                <li key={tIdx} className="flex items-start gap-3 text-slate-700 bg-slate-50 p-3 rounded-xl">
                                                    <span className="w-2 h-2 rounded-full bg-orange-500 mt-2 flex-shrink-0"></span>
                                                    {treatment}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Prevention */}
                                    <div>
                                        <div className="text-sm font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                                            <Shield className="w-4 h-4" />
                                            Prevention Tips
                                        </div>
                                        <ul className="space-y-2">
                                            {diagnosis.prevention.map((tip, tIdx) => (
                                                <li key={tIdx} className="flex items-start gap-3 text-slate-700 bg-slate-50 p-3 rounded-xl">
                                                    <span className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0"></span>
                                                    {tip}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Consult Vet for critical */}
                                    {diagnosis.severity === 'critical' && (
                                        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4">
                                            <div className="flex items-start gap-3">
                                                <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                                                <div>
                                                    <div className="font-bold text-red-900 mb-1">Critical Condition</div>
                                                    <div className="text-sm text-red-800">
                                                        This requires immediate veterinary attention. If you cannot see a vet, consider contacting exotic pet specialists or online reptile/insect vet services.
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* No Results */}
                {showResults && diagnoses.length === 0 && (
                    <div className="bg-white rounded-3xl shadow-xl ring-1 ring-slate-900/5 p-12 text-center">
                        <HelpCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-slate-900 mb-2">No Matching Conditions</h3>
                        <p className="text-slate-500 mb-6">
                            Try selecting different symptoms or consult an exotic pet veterinarian for a proper diagnosis.
                        </p>
                        <button
                            onClick={() => setShowResults(false)}
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-red-500 to-orange-500 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all"
                        >
                            <CheckCircle2 className="w-5 h-5" />
                            Select Different Symptoms
                        </button>
                    </div>
                )}

                {/* Empty State */}
                {selectedSymptoms.size === 0 && (
                    <div className="bg-white rounded-3xl shadow-xl ring-1 ring-slate-900/5 p-12 text-center">
                        <Heart className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Select Symptoms</h3>
                        <p className="text-slate-500">
                            Choose all symptoms you're observing to get diagnosis recommendations
                        </p>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="py-8 text-center text-slate-500 text-sm">
                <p>Health Symptom Checker • Identify issues, get treatments, save lives</p>
            </div>
        </div>
    );
};

export default HealthSymptomChecker;
