import React, { useState, useEffect } from 'react';
import { 
    Activity, AlertTriangle, CheckCircle2, XCircle, 
    Stethoscope, ThermometerSun, Droplets, 
    Bone, Shield, Skull, FileText
} from 'lucide-react';

type SeverityLevel = 'none' | 'mild' | 'moderate' | 'severe';

interface SymptomCategory {
    name: string;
    icon: any;
    symptoms: {
        id: string;
        label: string;
        description: string;
        critical: boolean;
    }[];
}

interface DiagnosisResult {
    severity: SeverityLevel;
    confidence: number;
    conditions: {
        name: string;
        likelihood: number;
        description: string;
        urgency: 'immediate' | 'urgent' | 'soon' | 'monitor';
    }[];
    immediateActions: string[];
    vetVisit: {
        needed: boolean;
        urgency: string;
        reason: string;
    };
    nextSteps: string[];
    resources: string[];
}

const SYMPTOM_CATEGORIES: SymptomCategory[] = [
    {
        name: 'General Behavior',
        icon: Activity,
        symptoms: [
            { id: 'lethargic', label: 'Lethargic / Inactive', description: 'Not moving much, sleeping more than usual', critical: false },
            { id: 'aggressive', label: 'Aggressive / Defensive', description: 'Unusually aggressive, biting, hissing', critical: false },
            { id: 'hide_excessively', label: 'Hiding Excessively', description: 'Spending all time in hide, not coming out', critical: false },
            { id: 'nocturnal_only', label: 'Nocturnal Only', description: 'Only active at night (unusual for species)', critical: false },
        ]
    },
    {
        name: 'Eating Issues',
        icon: CheckCircle2,
        symptoms: [
            { id: 'not_eating', label: 'Not Eating', description: 'Refusing food for more than 1 week', critical: true },
            { id: 'decreased_appetite', label: 'Decreased Appetite', description: 'Eating less than usual', critical: false },
            { id: 'weight_loss', label: 'Weight Loss', description: 'Noticeable weight loss over time', critical: true },
            { id: 'regurgitation', label: 'Regurgitation', description: 'Vomiting food after eating', critical: true },
        ]
    },
    {
        name: 'Physical Appearance',
        icon: Stethoscope,
        symptoms: [
            { id: 'swollen_limbs', label: 'Swollen Limbs/Joints', description: 'Puffy or swollen legs, tail, or body', critical: true },
            { id: 'soft_jaw', label: 'Soft/Rubbery Jaw', description: 'Jaw feels soft or rubbery to touch', critical: true },
            { id: 'deformed_tail', label: 'Deformed Tail', description: 'Tail looks bent, kinked, or abnormal', critical: false },
            { id: 'skin_lesions', label: 'Skin Lesions/Bumps', description: 'Unusual bumps, sores, or lesions', critical: true },
        ]
    },
    {
        name: 'Shedding Issues',
        icon: Shield,
        symptoms: [
            { id: 'stuck_skin', label: 'Stuck Shed Skin', description: 'Skin not shedding properly, especially toes/tail', critical: false },
            { id: 'difficult_shed', label: 'Difficult Shedding', description: 'Shedding takes very long or incomplete', critical: false },
            { id: 'no_shedding', label: 'Not Shedding', description: 'Not shedding at expected intervals', critical: false },
        ]
    },
    {
        name: 'Hydration Signs',
        icon: Droplets,
        symptoms: [
            { id: 'sunken_eyes', label: 'Sunken Eyes', description: 'Eyes appear sunken or hollow', critical: true },
            { id: 'wrinkled_skin', label: 'Wrinkled Skin', description: 'Skin looks loose, wrinkled, or dry', critical: true },
            { id: 'sticky_mouth', label: 'Sticky Mouth', description: 'Mouth appears sticky or has excess saliva', critical: true },
        ]
    },
    {
        name: 'Digestive Issues',
        icon: XCircle,
        symptoms: [
            { id: 'diarrhea', label: 'Diarrhea', description: 'Loose, watery, or frequent stool', critical: true },
            { id: 'blood_in_stool', label: 'Blood in Stool', description: 'Visible blood in feces', critical: true },
            { id: 'constipation', label: 'Constipation', description: 'Not defecating for extended period', critical: true },
            { id: 'abnormal_color', label: 'Abnormal Stool Color', description: 'Unusual stool color or consistency', critical: false },
        ]
    },
    {
        name: 'Respiratory Issues',
        icon: ThermometerSun,
        symptoms: [
            { id: 'mouth_open', label: 'Mouth Breathing', description: 'Holding mouth open, gasping for air', critical: true },
            { id: 'wheezing', label: 'Wheezing/Crackling', description: 'Wheezing or crackling sounds when breathing', critical: true },
            { id: 'bubbles_mouth', label: 'Bubbles in Mouth', description: 'Excessive bubbles or foam around mouth', critical: true },
            { id: 'nasal_discharge', label: 'Nasal Discharge', description: 'Discharge or bubbles from nostrils', critical: true },
        ]
    },
    {
        name: 'Other Critical Signs',
        icon: Skull,
        symptoms: [
            { id: 'seizures', label: 'Seizures/Tremors', description: 'Uncontrolled shaking or twitching', critical: true },
            { id: 'unconscious', label: 'Unconscious/Limp', description: 'Not responsive, limp body', critical: true },
            { id: 'bleeding', label: 'Active Bleeding', description: 'Bleeding from any part of body', critical: true },
            { id: 'unable_to_move', label: 'Unable to Move', description: 'Paralysis or complete lack of movement', critical: true },
        ]
    }
];

// Selection Button Component
const SelectionButton = ({ selected, onClick, label, icon: Icon, critical }: any) => (
    <button 
        onClick={onClick} 
        className={`relative p-3 rounded-xl border transition-all duration-200 w-full touch-manipulation flex items-center gap-3 text-left
        ${selected 
            ? critical 
                ? 'border-red-600 bg-red-50 ring-1 ring-red-500' 
                : 'border-brand-600 bg-brand-50 ring-1 ring-brand-500'
            : critical 
                ? 'border-red-200 bg-white hover:bg-red-50/50 text-slate-500' 
                : 'border-brand-200 bg-white hover:bg-brand-50/50 text-slate-500'
        }`}
    >
        {Icon && <Icon className={`w-4 h-4 flex-shrink-0 ${selected 
            ? critical ? 'text-red-600' : 'text-brand-600' 
            : critical ? 'text-red-400' : 'text-slate-400'
        }`} />}
        <div className="flex-1 min-w-0">
            <div className={`font-bold text-xs ${selected 
                ? critical ? 'text-red-900' : 'text-brand-900' 
                : 'text-slate-700'
            }`}>{label}</div>
            {critical && <div className="text-[10px] text-red-500 font-medium uppercase tracking-wide mt-0.5">Critical</div>}
        </div>
        {selected && <div className={`text-lg ${critical ? 'text-red-600' : 'text-brand-600'}`}>✓</div>}
    </button>
);

const GeckoCommonIssuesDiagnoseCalculator: React.FC = () => {
    const [selectedSymptoms, setSelectedSymptoms] = useState<Set<string>>(new Set());
    const [result, setResult] = useState<DiagnosisResult | null>(null);

    useEffect(() => {
        diagnose();
    }, [selectedSymptoms]);

    const toggleSymptom = (symptomId: string) => {
        const newSelected = new Set(selectedSymptoms);
        if (newSelected.has(symptomId)) {
            newSelected.delete(symptomId);
        } else {
            newSelected.add(symptomId);
        }
        setSelectedSymptoms(newSelected);
    };

    const diagnose = () => {
        if (selectedSymptoms.size === 0) {
            setResult(null);
            return;
        }

        const conditions: DiagnosisResult['conditions'] = [];
        const immediateActions: string[] = [];
        const nextSteps: string[] = [];
        const resources: string[] = [];
        let severity: SeverityLevel = 'none';
        let vetNeeded = false;
        let vetUrgency = '';
        let vetReason = '';

        // Check for critical symptoms first
        const criticalSymptoms = SYMPTOM_CATEGORIES
            .flatMap(cat => cat.symptoms)
            .filter(s => selectedSymptoms.has(s.id) && s.critical);

        if (criticalSymptoms.length >= 2) {
            severity = 'severe';
            vetNeeded = true;
            vetUrgency = 'IMMEDIATE - Emergency vet visit required';
            vetReason = `${criticalSymptoms.length} critical symptoms detected`;
            immediateActions.push('🚨 Seek emergency veterinary care immediately');
            immediateActions.push('🏥 Contact emergency exotic animal vet NOW');
        } else if (criticalSymptoms.length === 1) {
            severity = 'severe';
            vetNeeded = true;
            vetUrgency = 'URGENT - Vet visit within 24 hours';
            vetReason = 'One critical symptom detected';
            immediateActions.push('🏥 Schedule vet appointment as soon as possible');
        }

        // MBD (Metabolic Bone Disease)
        if (selectedSymptoms.has('swollen_limbs') || selectedSymptoms.has('soft_jaw') || selectedSymptoms.has('deformed_tail')) {
            conditions.push({
                name: 'Metabolic Bone Disease (MBD)',
                likelihood: 85,
                description: 'Nutritional calcium deficiency affecting bone density and structure. Caused by lack of UVB, calcium, or proper gut-loading of insects.',
                urgency: selectedSymptoms.has('soft_jaw') ? 'immediate' : 'urgent'
            });
            if (severity === 'none') severity = 'severe';
            vetNeeded = true;
            immediateActions.push('☀️ Check UVB bulb - replace if older than 6 months');
            immediateActions.push('💊 Increase calcium supplementation immediately');
            immediateActions.push('🌡️ Verify basking temperatures (85-95°F)');
            nextSteps.push('Review feeding and supplement schedule');
            nextSteps.push('Ensure proper gut-loading of insects');
        }

        // Dehydration
        if (selectedSymptoms.has('sunken_eyes') || selectedSymptoms.has('wrinkled_skin') || selectedSymptoms.has('sticky_mouth') || selectedSymptoms.has('not_eating')) {
            conditions.push({
                name: 'Dehydration',
                likelihood: selectedSymptoms.has('sunken_eyes') ? 90 : 75,
                description: 'Insufficient water intake or excessive water loss. Can lead to serious health complications if untreated.',
                urgency: selectedSymptoms.has('sticky_mouth') ? 'urgent' : 'soon'
            });
            if (severity === 'none') severity = 'moderate';
            immediateActions.push('💧 Increase misting frequency to 2-3x daily');
            immediateActions.push('🛁 Provide warm shallow water soaks (10-15 minutes)');
            immediateActions.push('💧 Ensure fresh water is always available');
            nextSteps.push('Monitor humidity levels (30-60% depending on species)');
            nextSteps.push('Check for proper hydration methods for species');
        }

        // Impaction
        if (selectedSymptoms.has('constipation') || selectedSymptoms.has('not_eating') || selectedSymptoms.has('decreased_appetite')) {
            conditions.push({
                name: 'Impaction / Digestive Blockage',
                likelihood: selectedSymptoms.has('constipation') ? 80 : 60,
                description: 'Blockage in digestive tract, often caused by loose substrate or oversized food items.',
                urgency: selectedSymptoms.has('regurgitation') ? 'urgent' : 'soon'
            });
            if (severity === 'none') severity = 'moderate';
            immediateActions.push('🪨 Check and potentially replace substrate with paper towels');
            immediateActions.push('🦎 Ensure insect size is no larger than space between eyes');
            immediateActions.push('🛁 Try warm soaks to encourage bowel movement');
            nextSteps.push('Review substrate choice for age/size of gecko');
            nextSteps.push('Monitor stool frequency and appearance');
        }

        // Parasites
        if (selectedSymptoms.has('diarrhea') || selectedSymptoms.has('blood_in_stool') || selectedSymptoms.has('weight_loss')) {
            conditions.push({
                name: 'Parasites or Internal Infection',
                likelihood: selectedSymptoms.has('blood_in_stool') ? 85 : 65,
                description: 'Internal parasites, worms, or bacterial infections affecting digestion and health.',
                urgency: selectedSymptoms.has('blood_in_stool') ? 'urgent' : 'soon'
            });
            if (severity === 'none') severity = 'severe';
            vetNeeded = true;
            immediateActions.push('🧪 Collect fresh stool sample for vet analysis');
            immediateActions.push('🔒 Quarantine gecko if housing multiple');
            nextSteps.push('Maintain excellent hygiene during feeding');
            nextSteps.push('Review source of feeder insects');
        }

        // Respiratory Infection
        if (selectedSymptoms.has('mouth_open') || selectedSymptoms.has('wheezing') || selectedSymptoms.has('bubbles_mouth') || selectedSymptoms.has('nasal_discharge')) {
            conditions.push({
                name: 'Respiratory Infection',
                likelihood: 90,
                description: 'Bacterial or fungal infection of respiratory system. Often caused by improper temperatures or humidity.',
                urgency: 'immediate'
            });
            severity = 'severe';
            vetNeeded = true;
            immediateActions.push('🌡️ Immediately check all temperatures');
            immediateActions.push('💧 Adjust humidity to appropriate levels');
            immediateActions.push('🏥 VET VISIT REQUIRED - respiratory infections worsen quickly');
            nextSteps.push('Review temperature gradient setup');
            nextSteps.push('Ensure proper ventilation in enclosure');
        }

        // Shedding Issues
        if (selectedSymptoms.has('stuck_skin') || selectedSymptoms.has('difficult_shed')) {
            conditions.push({
                name: 'Shedding Difficulties',
                likelihood: 70,
                description: 'Incomplete or difficult shedding, often due to low humidity or dehydration.',
                urgency: 'monitor'
            });
            if (severity === 'none') severity = 'mild';
            immediateActions.push('💧 Increase humidity to 50-60% during shedding');
            immediateActions.push('🛁 Provide warm soaks to loosen stuck skin');
            immediateActions.push('🤲 Gently assist stuck shed with damp cotton swab (be careful!)');
            nextSteps.push('Identify areas with stuck skin (toes, tail tip critical)');
            nextSteps.push('Review humidity levels and misting schedule');
        }

        // Stress / Environmental Issues
        if (selectedSymptoms.has('lethargic') || selectedSymptoms.has('hide_excessively') || selectedSymptoms.has('aggressive')) {
            conditions.push({
                name: 'Stress or Environmental Issues',
                likelihood: 60,
                description: 'Stress from improper temperatures, handling, or enclosure setup can cause behavioral changes.',
                urgency: 'monitor'
            });
            if (severity === 'none') severity = 'mild';
            immediateActions.push('🌡️ Verify temperature gradient is correct');
            immediateActions.push('🏠 Ensure adequate hiding places');
            immediateActions.push('🤚 Reduce handling and disturbance');
            nextSteps.push('Review all habitat parameters');
            nextSteps.push('Check for any recent changes in environment');
        }

        // Eating Issues (general)
        if (selectedSymptoms.has('not_eating') && !selectedSymptoms.has('constipation') && !selectedSymptoms.has('regurgitation')) {
            if (conditions.filter(c => c.name.includes('Dehydration') || c.name.includes('MBD')).length === 0) {
                conditions.push({
                    name: 'Appetite Loss / Anorexia',
                    likelihood: 50,
                    description: 'Decreased or absent appetite can indicate various issues from stress to illness.',
                    urgency: 'monitor'
                });
                if (severity === 'none') severity = 'mild';
                immediateActions.push('🌡️ Check basking temperatures are adequate');
                immediateActions.push('🦎 Try offering different insect varieties');
                immediateActions.push('⏰ Note: Geckos can go 1-2 weeks without eating');
                nextSteps.push('Monitor for other symptoms');
                nextSteps.push('Consider recent stressors or changes');
            }
        }

        // Calculate confidence based on symptom count and criticality
        const criticalCount = criticalSymptoms.length;
        const totalCount = selectedSymptoms.size;
        const confidence = Math.min(95, 60 + (criticalCount * 15) + (totalCount - criticalCount) * 5);

        // Resources
        resources.push('Find a reptile vet: arav.org (Association of Reptile and Amphibian Veterinarians)');
        resources.push('Emergency exotic animal vet directory: reptilescanada.com/vets');
        resources.push('Keep a daily log of symptoms, eating, and behavior for vet visit');

        setResult({
            severity,
            confidence,
            conditions: conditions.sort((a, b) => b.likelihood - a.likelihood),
            immediateActions,
            vetVisit: {
                needed: vetNeeded,
                urgency: vetUrgency,
                reason: vetReason
            },
            nextSteps,
            resources
        });
    };

    const getSeverityColor = (sev: SeverityLevel) => {
        switch (sev) {
            case 'severe': return 'red';
            case 'moderate': return 'orange';
            case 'mild': return 'yellow';
            default: return 'green';
        }
    };

    const getSeverityLabel = (sev: SeverityLevel) => {
        switch (sev) {
            case 'severe': return 'SEVERE';
            case 'moderate': return 'MODERATE';
            case 'mild': return 'MILD';
            default: return 'NONE';
        }
    };

    return (
        <div className="glass-panel text-slate-900 rounded-[2rem] shadow-xl bg-white/95 backdrop-blur-md border border-brand-700/20 p-0 md:p-8 relative overflow-hidden max-w-6xl mx-auto font-sans">
            
            {/* Sticky Mobile Header */}
            <div className="lg:hidden sticky top-0 z-40 bg-brand-900 text-brand-100 p-4 shadow-lg border-b border-brand-800/30">
                <div className="flex justify-between items-center">
                    <div>
                        <div className="text-[10px] uppercase tracking-wider opacity-70">Symptoms Selected</div>
                        <div className="text-2xl font-black text-white leading-none">
                            {selectedSymptoms.size}
                        </div>
                    </div>
                    {result && (
                        <div className={`text-right ${result.severity === 'severe' ? 'bg-red-500/30' : ''} px-3 py-1 rounded-lg`}>
                            <div className="text-[10px] uppercase tracking-wider opacity-70">Severity</div>
                            <div className={`font-bold text-sm text-${getSeverityColor(result.severity)}-200`}>
                                {getSeverityLabel(result.severity)}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="p-4 md:p-0 relative z-10 w-full">
                <div className="text-center mb-6 md:mb-8 pt-4 md:pt-0">
                    <div className="inline-flex items-center gap-2 mb-2">
                        <span className="p-1.5 bg-brand-100 text-brand-700 rounded-lg"><Stethoscope className="w-5 h-5" /></span>
                        <span className="text-[10px] font-bold tracking-widest text-brand-700 uppercase">2026 Health Tool</span>
                    </div>
                    <h1 className="text-2xl md:text-4xl font-black text-brand-900 tracking-tight">Gecko Health Diagnosis</h1>
                    <p className="text-xs text-brand-700 mt-1">Identify Potential Health Issues & Get Care Guidance</p>
                    <p className="text-xs text-orange-600 font-medium mt-2">
                        ⚠️ This tool provides guidance only. Always consult a reptile veterinarian for serious concerns.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* SYMPTOMS COLUMN */}
                    <div className="lg:col-span-7 space-y-4">
                        {SYMPTOM_CATEGORIES.map((category, catIdx) => (
                            <div key={catIdx} className="bg-white p-5 rounded-3xl shadow-sm border border-brand-700/10">
                                <h3 className="font-bold text-brand-900 text-sm uppercase tracking-wide mb-4 flex items-center gap-2">
                                    <category.icon className={`w-4 h-4 ${category.symptoms.some(s => s.critical && selectedSymptoms.has(s.id)) ? 'text-red-600' : 'text-brand-600'}`} />
                                    {category.name}
                                    {category.symptoms.some(s => s.critical) && (
                                        <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
                                            {category.symptoms.filter(s => s.critical).length} Critical
                                        </span>
                                    )}
                                </h3>
                                <div className="space-y-2">
                                    {category.symptoms.map((symptom) => (
                                        <SelectionButton
                                            key={symptom.id}
                                            selected={selectedSymptoms.has(symptom.id)}
                                            onClick={() => toggleSymptom(symptom.id)}
                                            label={symptom.label}
                                            critical={symptom.critical}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}

                        {selectedSymptoms.size === 0 && (
                            <div className="bg-brand-50 p-6 rounded-3xl text-center border border-brand-200">
                                <Activity className="w-12 h-12 text-brand-300 mx-auto mb-3" />
                                <p className="text-brand-700 text-sm">
                                    Select symptoms above to begin diagnosis. The more specific you are, the more accurate the results.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* RESULTS COLUMN */}
                    <div className="lg:col-span-5 space-y-4">
                        {result && (
                            <>
                                {/* Severity Card */}
                                <div className={`bg-gradient-to-br from-${getSeverityColor(result.severity)}-600 to-${getSeverityColor(result.severity)}-800 text-white p-6 md:p-8 rounded-[2rem] shadow-2xl relative overflow-hidden`}>
                                    <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                                        {result.severity === 'severe' ? <XCircle className="w-48 h-48" /> : 
                                         result.severity === 'moderate' ? <AlertTriangle className="w-48 h-48" /> :
                                         <CheckCircle2 className="w-48 h-48" />}
                                    </div>
                                    
                                    <div className="relative z-10">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <p className="text-white/70 font-bold uppercase tracking-widest text-[10px] mb-2">Severity Level</p>
                                                <div className="text-4xl md:text-5xl font-black tracking-tighter text-white drop-shadow-xl">
                                                    {getSeverityLabel(result.severity)}
                                                </div>
                                            </div>
                                            <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10">
                                                <div className="text-sm font-bold">{result.confidence}%</div>
                                                <div className="text-[10px] uppercase text-white/80">Confidence</div>
                                            </div>
                                        </div>

                                        <div className="bg-white/10 p-3 rounded-xl">
                                            <div className="text-xs text-white/90">
                                                {selectedSymptoms.size} symptom{selectedSymptoms.size > 1 ? 's' : ''} selected
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Vet Visit Alert */}
                                {result.vetVisit.needed && (
                                    <div className={`bg-${getSeverityColor(result.severity) === 'red' ? 'red' : 'orange'}-50 border-2 border-${getSeverityColor(result.severity) === 'red' ? 'red' : 'orange'}-300 p-6 rounded-3xl`}>
                                        <div className="flex items-center gap-3 mb-3">
                                            {getSeverityColor(result.severity) === 'red' ? (
                                                <XCircle className="w-8 h-8 text-red-600" />
                                            ) : (
                                                <AlertTriangle className="w-8 h-8 text-orange-600" />
                                            )}
                                            <div>
                                                <div className="font-bold text-lg text-red-900">Vet Visit Required</div>
                                                <div className={`text-sm text-${getSeverityColor(result.severity) === 'red' ? 'red' : 'orange'}-700`}>
                                                    {result.vetVisit.urgency}
                                                </div>
                                            </div>
                                        </div>
                                        <p className={`text-sm text-${getSeverityColor(result.severity) === 'red' ? 'red' : 'orange'}-800`}>
                                            {result.vetVisit.reason}
                                        </p>
                                    </div>
                                )}

                                {/* Conditions */}
                                {result.conditions.length > 0 && (
                                    <div className="bg-white p-5 rounded-3xl shadow-sm border border-brand-700/10">
                                        <h4 className="font-bold text-brand-900 mb-4 flex items-center gap-2 text-xs uppercase tracking-wide">
                                            <FileText className="w-4 h-4 text-brand-600" /> Potential Conditions
                                        </h4>
                                        <div className="space-y-3">
                                            {result.conditions.map((condition, idx) => (
                                                <div key={idx} className={`p-4 rounded-xl border ${
                                                    condition.urgency === 'immediate' ? 'border-red-300 bg-red-50' :
                                                    condition.urgency === 'urgent' ? 'border-orange-300 bg-orange-50' :
                                                    condition.urgency === 'soon' ? 'border-yellow-300 bg-yellow-50' :
                                                    'border-slate-200 bg-slate-50'
                                                }`}>
                                                    <div className="flex justify-between items-start mb-2">
                                                        <span className={`font-bold text-sm ${
                                                            condition.urgency === 'immediate' ? 'text-red-900' :
                                                            condition.urgency === 'urgent' ? 'text-orange-900' :
                                                            condition.urgency === 'soon' ? 'text-yellow-900' :
                                                            'text-slate-900'
                                                        }`}>{condition.name}</span>
                                                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                                            condition.urgency === 'immediate' ? 'bg-red-200 text-red-800' :
                                                            condition.urgency === 'urgent' ? 'bg-orange-200 text-orange-800' :
                                                            condition.urgency === 'soon' ? 'bg-yellow-200 text-yellow-800' :
                                                            'bg-slate-200 text-slate-700'
                                                        }`}>
                                                            {condition.likelihood}%
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-slate-600 leading-relaxed">{condition.description}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Immediate Actions */}
                                {result.immediateActions.length > 0 && (
                                    <div className="bg-gradient-to-br from-highlight-50 to-lime-50 p-5 rounded-3xl border border-highlight-200">
                                        <h4 className="font-bold text-highlight-900 mb-3 flex items-center gap-2 text-xs uppercase tracking-wide">
                                            <Shield className="w-4 h-4 text-highlight-600" /> Immediate Actions
                                        </h4>
                                        <div className="space-y-2">
                                            {result.immediateActions.map((action, idx) => (
                                                <div key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                                                    <span className="text-highlight-600 font-bold">•</span>
                                                    <span>{action}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Next Steps */}
                                {result.nextSteps.length > 0 && (
                                    <div className="bg-brand-50 p-5 rounded-3xl border border-brand-200">
                                        <h4 className="font-bold text-brand-900 mb-3 flex items-center gap-2 text-xs uppercase tracking-wide">
                                            <CheckCircle2 className="w-4 h-4 text-brand-600" /> Next Steps
                                        </h4>
                                        <div className="space-y-2">
                                            {result.nextSteps.map((step, idx) => (
                                                <div key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                                                    <div className="w-5 h-5 rounded-full border-2 border-brand-300 flex items-center justify-center mt-0.5 shrink-0 text-[10px] font-bold text-brand-600">
                                                        {idx + 1}
                                                    </div>
                                                    <span>{step}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Resources */}
                                <div className="bg-slate-100 p-5 rounded-3xl border border-slate-200">
                                    <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2 text-xs uppercase tracking-wide">
                                        <FileText className="w-4 h-4 text-slate-600" /> Resources
                                    </h4>
                                    <div className="space-y-2">
                                        {result.resources.map((resource, idx) => (
                                            <div key={idx} className="text-xs text-slate-600">
                                                {resource}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="text-center mt-6">
                <p className="text-brand-700 text-sm">
                    Disclaimer: This tool provides educational guidance only and is not a substitute for professional veterinary care. 
                    Always consult a qualified reptile veterinarian for diagnosis and treatment.
                </p>
            </div>
        </div>
    );
};

export default GeckoCommonIssuesDiagnoseCalculator;
