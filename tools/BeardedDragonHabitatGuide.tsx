import React, { useState } from 'react';
import { 
    Home, ThermometerSun, Droplets, Lightbulb, 
    Ruler, CheckCircle2, AlertTriangle, Info,
    Wind, ShieldAlert, Calendar, Leaf
} from 'lucide-react';

type AgeGroup = 'baby' | 'juvenile' | 'adult';
type EnclosureType = 'glass' | 'pvc' | 'wood';
type SubstrateType = 'reptile_carpet' | 'tile' | 'paper_towel' | 'loose_substrate' | 'bioactive';

interface HabitatInputs {
    ageGroup: AgeGroup;
    enclosureType: EnclosureType;
    substrate: SubstrateType;
}

interface Requirement {
    category: string;
    item: string;
    recommendation: string;
    ideal: string;
    acceptable: string;
    warning?: string;
}

const AGE_PROFILES = {
    baby: {
        minTankSize: 20,
        recommendedTankSize: 40,
        baskingTemp: '100-110°F',
        coolTemp: '75-85°F',
        nightTemp: '70-75°F',
        humidity: '30-40%',
        uvbType: 'T5 10.0 or T8 10.0',
        uvbDistance: '6-8 inches',
        feedingZone: 'Shallow dish only',
        hideSpots: 2,
        notes: 'Babies are clumsy - avoid loose substrate'
    },
    juvenile: {
        minTankSize: 40,
        recommendedTankSize: 75,
        baskingTemp: '95-105°F',
        coolTemp: '75-85°F',
        nightTemp: '65-75°F',
        humidity: '30-40%',
        uvbType: 'T5 10.0',
        uvbDistance: '8-10 inches',
        feedingZone: 'Dish or hand feeding',
        hideSpots: 2,
        notes: 'Growing fast - needs space to roam'
    },
    adult: {
        minTankSize: 75,
        recommendedTankSize: 120,
        baskingTemp: '95-100°F',
        coolTemp: '75-80°F',
        nightTemp: '60-75°F',
        humidity: '30-40%',
        uvbType: 'T5 10.0 or 12%',
        uvbDistance: '10-12 inches',
        feedingZone: 'Free roam feeding',
        hideSpots: 2,
        notes: 'Minimum 4x2x2 feet for adults (120 gal)'
    }
};

const SUBSTRATE_RATINGS: Record<SubstrateType, { safety: 'safe' | 'caution' | 'unsafe', notes: string, ages: string[] }> = {
    reptile_carpet: { 
        safety: 'safe', 
        notes: 'Easy to clean, no impaction risk. Watch for claws getting stuck.',
        ages: ['baby', 'juvenile', 'adult']
    },
    tile: { 
        safety: 'safe', 
        notes: 'Easy to clean, keeps nails filed. Add texture for grip.',
        ages: ['juvenile', 'adult']
    },
    paper_towel: { 
        safety: 'safe', 
        notes: 'Best for babies and quarantine. Easy to replace.',
        ages: ['baby']
    },
    loose_substrate: { 
        safety: 'caution', 
        notes: 'Sand, bark, etc. Impaction risk if ingested. Only for healthy adults.',
        ages: ['adult']
    },
    bioactive: { 
        safety: 'safe', 
        notes: 'Self-cleaning with cleanup crew. Advanced setup.',
        ages: ['juvenile', 'adult']
    }
};

const LIGHTING_SCHEDULE = [
    { season: 'Spring/Summer', onTime: '7:00 AM', offTime: '9:00 PM', duration: '14 hours' },
    { season: 'Fall/Winter', onTime: '8:00 AM', offTime: '7:00 PM', duration: '11 hours' },
    { season: 'Brumation', onTime: '9:00 AM', offTime: '5:00 PM', duration: '8 hours' }
];

const CLEANING_SCHEDULE = [
    { task: 'Spot clean poop', frequency: 'Daily', time: '5 min' },
    { task: 'Fresh water', frequency: 'Daily', time: '2 min' },
    { task: 'Clean food dish', frequency: 'Daily', time: '3 min' },
    { task: 'Wipe glass', frequency: 'Weekly', time: '10 min' },
    { task: 'Deep clean substrate', frequency: 'Monthly', time: '30 min' },
    { task: 'Replace UVB bulb', frequency: 'Every 6-12 months', time: '5 min' },
    { task: 'Full disinfect', frequency: 'Quarterly', time: '1 hour' }
];

const COMMON_MISTAKES = [
    { mistake: 'Red heat lights 24/7', why: 'Disrupts sleep cycle. Dragons need darkness at night.', fix: 'Use ceramic heat emitter if night heat needed.' },
    { mistake: 'Coil/compact UVB bulbs', why: 'Uneven coverage, causes eye problems and MBD.', fix: 'Use linear T5 or T8 tube UVB only.' },
    { mistake: 'Heat rocks', why: 'Can cause severe burns. Dragons don\'t sense belly heat well.', fix: 'Use overhead basking bulb with proper temps.' },
    { mistake: 'Sand for babies', why: 'High impaction risk. Babies are clumsy hunters.', fix: 'Use paper towel, reptile carpet, or tile.' },
    { mistake: 'Tank too small', why: 'Causes stress, aggression, poor thermoregulation.', fix: 'Minimum 40 gal for babies, 120 gal for adults.' },
    { mistake: 'No temperature gradient', why: 'Can\'t regulate body temp. Leads to digestion issues.', fix: 'Hot side 95-110°F, cool side 75-85°F.' },
    { mistake: 'No hiding spots', why: 'Causes chronic stress. Dragons need security.', fix: 'Provide at least 2 hides (hot and cool side).' }
];

// Components
const SectionCard = ({ title, icon: Icon, children }: { title: string, icon: any, children: React.ReactNode }) => (
    <div className="bg-white p-5 rounded-3xl shadow-sm border border-brand-700/10">
        <h3 className="font-bold text-brand-900 text-sm uppercase tracking-wide mb-4 flex items-center gap-2">
            <Icon className="w-4 h-4 text-brand-600" /> {title}
        </h3>
        {children}
    </div>
);

const TempGauge = ({ label, temp, color = 'brand' }: { label: string, temp: string, color?: 'brand' | 'amber' | 'blue' }) => {
    const colors = {
        brand: 'from-brand-500 to-brand-700',
        amber: 'from-amber-400 to-orange-600',
        blue: 'from-blue-400 to-blue-600'
    };
    return (
        <div className="bg-gradient-to-br rounded-2xl p-4 text-white shadow-lg" style={{ background: color === 'brand' ? 'linear-gradient(135deg, #E67E22, #CC7722)' : color === 'amber' ? 'linear-gradient(135deg, #FFB366, #E67E22)' : 'linear-gradient(135deg, #7fcef0, #20ace9)' }}>
            <div className="text-[10px] uppercase tracking-wider opacity-80 mb-1">{label}</div>
            <div className="text-2xl font-black">{temp}</div>
        </div>
    );
};

const BeardedDragonHabitatGuide: React.FC = () => {
    const [inputs, setInputs] = useState<HabitatInputs>({
        ageGroup: 'adult',
        enclosureType: 'pvc',
        substrate: 'tile'
    });

    const profile = AGE_PROFILES[inputs.ageGroup];
    const substrateInfo = SUBSTRATE_RATINGS[inputs.substrate];

    return (
        <div className="glass-panel text-slate-900 rounded-[2rem] shadow-xl bg-white/95 backdrop-blur-md border border-brand-700/20 p-0 md:p-8 relative overflow-hidden max-w-6xl mx-auto font-sans">
            
            <div className="p-4 md:p-0 relative z-10 w-full">
                <div className="text-center mb-6 md:mb-8 pt-4 md:pt-0">
                    <div className="inline-flex items-center gap-2 mb-2">
                        <span className="p-1.5 bg-brand-100 text-brand-700 rounded-lg"><Home className="w-5 h-5" /></span>
                        <span className="text-[10px] font-bold tracking-widest text-brand-700 uppercase">Setup Guide</span>
                    </div>
                    <h1 className="text-2xl md:text-4xl font-black text-brand-900 tracking-tight">Bearded Dragon Habitat Guide</h1>
                    <p className="text-xs text-brand-700 mt-1">Create the perfect environment for your dragon</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* INPUTS COLUMN */}
                    <div className="lg:col-span-4 space-y-5">
                        
                        {/* Profile Selection */}
                        <SectionCard title="Dragon Profile" icon={Ruler}>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-brand-700 uppercase mb-2 block">Age Group</label>
                                    <div className="grid grid-cols-3 gap-2">
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
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-brand-700 uppercase mb-2 block">Enclosure Type</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {([
                                            { id: 'glass', label: 'Glass', icon: '🪟' },
                                            { id: 'pvc', label: 'PVC', icon: '📦' },
                                            { id: 'wood', label: 'Wood', icon: '🪵' }
                                        ] as const).map(type => (
                                            <button
                                                key={type.id}
                                                onClick={() => setInputs(p => ({ ...p, enclosureType: type.id }))}
                                                className={`py-3 px-2 rounded-xl text-center transition-all ${
                                                    inputs.enclosureType === type.id 
                                                        ? 'bg-brand-600 text-white shadow-lg' 
                                                        : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                                                }`}
                                            >
                                                <div className="text-lg mb-1">{type.icon}</div>
                                                <div className="text-xs font-bold">{type.label}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-brand-700 uppercase mb-2 block">Substrate</label>
                                    <select 
                                        value={inputs.substrate}
                                        onChange={(e) => setInputs(p => ({ ...p, substrate: e.target.value as SubstrateType }))}
                                        className="w-full p-3 bg-brand-50 border border-brand-200 rounded-xl text-sm font-bold text-brand-900"
                                    >
                                        <option value="reptile_carpet">Reptile Carpet</option>
                                        <option value="tile">Ceramic Tile</option>
                                        <option value="paper_towel">Paper Towel</option>
                                        <option value="loose_substrate">Loose Substrate (Sand/etc)</option>
                                        <option value="bioactive">Bioactive</option>
                                    </select>
                                    <div className={`mt-2 p-2 rounded-lg text-xs ${
                                        substrateInfo.safety === 'safe' ? 'bg-green-100 text-green-800' :
                                        substrateInfo.safety === 'caution' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-red-100 text-red-800'
                                    }`}>
                                        <div className="font-bold uppercase mb-1">
                                            {substrateInfo.safety === 'safe' ? '✓ Safe' : substrateInfo.safety === 'caution' ? '⚠ Use Caution' : '✗ Unsafe'}
                                        </div>
                                        <div>{substrateInfo.notes}</div>
                                        {!substrateInfo.ages.includes(inputs.ageGroup) && (
                                            <div className="mt-1 font-bold text-red-600">
                                                Not recommended for {inputs.ageGroup}s!
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </SectionCard>

                        {/* Quick Stats */}
                        <SectionCard title="Quick Reference" icon={Info}>
                            <div className="p-3 bg-brand-50 rounded-xl border border-brand-200">
                                <div className="text-xs text-brand-700 font-bold uppercase mb-2">Tank Size</div>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm text-slate-600">Minimum:</span>
                                    <span className="font-bold text-brand-900">{profile.minTankSize} gal</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-slate-600">Recommended:</span>
                                    <span className="font-bold text-green-700">{profile.recommendedTankSize} gal</span>
                                </div>
                            </div>
                            <div className="mt-3 text-xs text-brand-700 bg-brand-100 p-3 rounded-xl">
                                <Info className="w-4 h-4 inline mr-1" />
                                {profile.notes}
                            </div>
                        </SectionCard>
                    </div>

                    {/* RESULTS COLUMN */}
                    <div className="lg:col-span-8 space-y-5">
                        
                        {/* Temperature Section */}
                        <SectionCard title="Temperature Gradient" icon={ThermometerSun}>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <TempGauge label="Basking Spot" temp={profile.baskingTemp} color="amber" />
                                <TempGauge label="Cool Side" temp={profile.coolTemp} color="brand" />
                                <TempGauge label="Night Low" temp={profile.nightTemp} color="blue" />
                            </div>
                            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                                <div className="flex items-start gap-2">
                                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                    <div className="text-xs text-amber-800">
                                        <span className="font-bold">Important:</span> Always use a thermometer gun or probe thermometers. 
                                        Stick-on dial thermometers are inaccurate and dangerous!
                                    </div>
                                </div>
                            </div>
                        </SectionCard>

                        {/* UVB & Lighting */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <SectionCard title="UVB Lighting" icon={Lightbulb}>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center p-2 bg-brand-50 rounded-lg">
                                        <span className="text-xs font-bold text-brand-700">Bulb Type</span>
                                        <span className="text-sm font-bold text-brand-900">{profile.uvbType}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-2 bg-brand-50 rounded-lg">
                                        <span className="text-xs font-bold text-brand-700">Distance</span>
                                        <span className="text-sm font-bold text-brand-900">{profile.uvbDistance}</span>
                                    </div>
                                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
                                        <div className="text-[10px] text-yellow-800 uppercase font-bold mb-1">⚠ Critical</div>
                                        <div className="text-xs text-yellow-900">
                                            UVB bulbs must be replaced every 6-12 months even if still lit. 
                                            UV output degrades over time.
                                        </div>
                                    </div>
                                </div>
                            </SectionCard>

                            <SectionCard title="Humidity" icon={Droplets}>
                                <div className="text-center p-4 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl text-white">
                                    <div className="text-[10px] uppercase tracking-wider opacity-80">Target Humidity</div>
                                    <div className="text-4xl font-black">{profile.humidity}</div>
                                </div>
                                <div className="mt-3 space-y-2">
                                    <div className="flex items-center gap-2 text-xs text-slate-600">
                                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                                        <span>Use digital hygrometer</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-slate-600">
                                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                                        <span>Water dish away from basking spot</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-slate-600">
                                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                                        <span>Mist 1-2x daily if too dry</span>
                                    </div>
                                </div>
                            </SectionCard>
                        </div>

                        {/* Lighting Schedule */}
                        <SectionCard title="Lighting Schedule" icon={Calendar}>
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs">
                                    <thead>
                                        <tr className="border-b border-brand-200">
                                            <th className="text-left py-2 px-3 font-bold text-brand-700">Season</th>
                                            <th className="text-center py-2 px-3 font-bold text-brand-700">Lights On</th>
                                            <th className="text-center py-2 px-3 font-bold text-brand-700">Lights Off</th>
                                            <th className="text-center py-2 px-3 font-bold text-brand-700">Duration</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {LIGHTING_SCHEDULE.map((schedule, i) => (
                                            <tr key={i} className="border-b border-slate-100">
                                                <td className="py-2 px-3 font-medium">{schedule.season}</td>
                                                <td className="text-center py-2 px-3 text-slate-600">{schedule.onTime}</td>
                                                <td className="text-center py-2 px-3 text-slate-600">{schedule.offTime}</td>
                                                <td className="text-center py-2 px-3">
                                                    <span className="bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full font-bold">
                                                        {schedule.duration}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </SectionCard>

                        {/* Cleaning Schedule */}
                        <SectionCard title="Maintenance Schedule" icon={Calendar}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {CLEANING_SCHEDULE.map((task, i) => (
                                    <div key={i} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${
                                                task.frequency === 'Daily' ? 'bg-green-500' :
                                                task.frequency === 'Weekly' ? 'bg-blue-500' :
                                                task.frequency === 'Monthly' ? 'bg-purple-500' :
                                                'bg-orange-500'
                                            }`} />
                                            <span className="text-xs font-medium">{task.task}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full font-bold">
                                                {task.frequency}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </SectionCard>

                        {/* Common Mistakes */}
                        <div className="bg-gradient-to-br from-red-900 to-red-800 text-white p-5 rounded-[2rem] shadow-xl">
                            <div className="flex items-center gap-2 mb-4">
                                <ShieldAlert className="w-5 h-5 text-red-300" />
                                <h3 className="font-bold text-sm uppercase tracking-wide text-red-100">Common Mistakes to Avoid</h3>
                            </div>
                            <div className="space-y-3">
                                {COMMON_MISTAKES.map((item, i) => (
                                    <div key={i} className="bg-white/10 p-3 rounded-xl border border-white/20">
                                        <div className="flex items-start gap-2">
                                            <AlertTriangle className="w-4 h-4 text-red-300 shrink-0 mt-0.5" />
                                            <div>
                                                <div className="font-bold text-sm">{item.mistake}</div>
                                                <div className="text-xs text-red-200/80 mt-1">{item.why}</div>
                                                <div className="text-xs text-green-300 mt-1 flex items-center gap-1">
                                                    <CheckCircle2 className="w-3 h-3" />
                                                    {item.fix}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="text-center mt-6 p-4">
                <p className="text-brand-700 text-sm">
                    <Info className="w-4 h-4 inline mr-1" />
                    This guide provides general recommendations. Always research specific products and consult experienced keepers or veterinarians.
                </p>
            </div>
        </div>
    );
};

export default BeardedDragonHabitatGuide;