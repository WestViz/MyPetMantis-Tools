import React, { useState, useEffect } from 'react';
import { 
    Home, Thermometer, Droplets, Sun, Moon, 
    CheckCircle2, AlertTriangle, Layers, 
    Shield, MapPin, Plus, Minus
} from 'lucide-react';

type GeckoSpecies = 'leopard' | 'crested' | 'gargoyle' | 'other';
type GeckoAge = 'hatchling' | 'juvenile' | 'adult';
type EnclosureType = 'glass' | 'plastic' | 'wooden' | 'bioactive';
type SubstrateType = 'paper' | 'tile' | 'sand' | 'coco_fiber' | 'bioactive';

interface HabitatInputs {
    species: GeckoSpecies;
    age: GeckoAge;
    enclosureSize: number; // in gallons
    enclosureType: EnclosureType;
    substrateType: SubstrateType;
    multipleGeckos: boolean;
    geckoCount: number;
}

interface HabitatResult {
    minTankSize: number;
    recommendedTankSize: number;
    temperature: {
        hotSpot: { f: string; c: string };
        coolEnd: { f: string; c: string };
        night: { f: string; c: string };
    };
    humidity: {
        min: number;
        max: number;
        description: string;
    };
    lighting: {
        uvbType: string;
        uvbStrength: string;
        schedule: string;
        distance: string;
    };
    heating: {
        primary: string;
        backup: string;
        thermostat: string;
    };
    substrate: {
        safe: boolean;
        recommendation: string;
        warnings: string[];
    };
    hides: {
        warm: string;
        cool: string;
        humid: string;
        climbing: boolean;
    };
    warnings: string[];
    tips: string[];
    checklist: string[];
}

const SPECIES_CONFIG = {
    leopard: {
        name: 'Leopard Gecko',
        terrestrial: true,
        climbing: false,
        minSize: { hatchling: 10, juvenile: 20, adult: 20 },
        recommendedSize: { hatchling: 20, juvenile: 30, adult: 40 },
        temp: { hotSpot: { f: '94-96', c: '34-36' }, coolEnd: { f: '75-82', c: '24-28' }, night: { f: '70-75', c: '21-24' } },
        humidity: { min: 30, max: 40, description: '30-40%, higher (50%) during shedding' },
        uvb: { type: 'T5', strength: '10.0', schedule: '10-12 hours', distance: '8-12 inches' },
        heating: { primary: 'Under Tank Heater (UTH)', backup: 'Ceramic Heat Emitter' }
    },
    crested: {
        name: 'Crested Gecko',
        terrestrial: false,
        climbing: true,
        minSize: { hatchling: 5, juvenile: 10, adult: 12 },
        recommendedSize: { hatchling: 10, juvenile: 18, adult: 20 },
        temp: { hotSpot: { f: '78-82', c: '26-28' }, coolEnd: { f: '72-78', c: '22-26' }, night: { f: '65-72', c: '18-22' } },
        humidity: { min: 60, max: 80, description: '60-80%, misting 1-2x daily' },
        uvb: { type: 'T5', strength: '5.0', schedule: '12 hours', distance: '12-18 inches' },
        heating: { primary: 'Room temperature (72-78°F)', backup: 'Low wattage CHE' }
    },
    gargoyle: {
        name: 'Gargoyle Gecko',
        terrestrial: false,
        climbing: true,
        minSize: { hatchling: 5, juvenile: 10, adult: 15 },
        recommendedSize: { hatchling: 10, juvenile: 18, adult: 20 },
        temp: { hotSpot: { f: '78-82', c: '26-28' }, coolEnd: { f: '72-78', c: '22-26' }, night: { f: '65-72', c: '18-22' } },
        humidity: { min: 50, max: 70, description: '50-70%, misting daily' },
        uvb: { type: 'T5', strength: '5.0', schedule: '12 hours', distance: '12-18 inches' },
        heating: { primary: 'Room temperature (72-78°F)', backup: 'Low wattage CHE' }
    },
    other: {
        name: 'Other Gecko',
        terrestrial: true,
        climbing: false,
        minSize: { hatchling: 10, juvenile: 15, adult: 20 },
        recommendedSize: { hatchling: 15, juvenile: 20, adult: 30 },
        temp: { hotSpot: { f: '88-92', c: '31-33' }, coolEnd: { f: '75-82', c: '24-28' }, night: { f: '68-75', c: '20-24' } },
        humidity: { min: 40, max: 60, description: '40-60%' },
        uvb: { type: 'T5', strength: '5.0-10.0', schedule: '10-12 hours', distance: '8-14 inches' },
        heating: { primary: 'UTH or CHE', backup: 'Ceramic Heat Emitter' }
    }
};

const ENCLOSURE_TYPES = {
    glass: { label: 'Glass Tank', desc: 'Standard aquarium', pros: 'Great visibility', cons: 'Poor insulation' },
    plastic: { label: 'Plastic Tub', desc: 'Sterilite/RUB', pros: 'Lightweight, cheap', cons: 'Less attractive' },
    wooden: { label: 'Wooden Viv', desc: 'Melamine/MDF', pros: 'Good insulation', cons: 'Heavy' },
    bioactive: { label: 'Bioactive', desc: 'Living ecosystem', pros: 'Self-cleaning', cons: 'More setup' }
};

const SUBSTRATE_TYPES = {
    paper: { label: 'Paper', desc: 'Paper towels/newspaper', safeFor: ['hatchling', 'juvenile'], dangerousFor: [] },
    tile: { label: 'Slate Tile', desc: 'Ceramic/slate', safeFor: ['hatchling', 'juvenile', 'adult'], dangerousFor: [] },
    sand: { label: 'Sand', desc: 'Calcium sand/play sand', safeFor: ['adult'], dangerousFor: ['hatchling', 'juvenile'] },
    coco_fiber: { label: 'Coco Fiber', desc: 'Eco earth/coconut husk', safeFor: ['adult'], dangerousFor: ['hatchling', 'juvenile'] },
    bioactive: { label: 'Bioactive Mix', desc: 'ABG mix + isopods', safeFor: ['adult'], dangerousFor: ['hatchling', 'juvenile'] }
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
const SizeSlider = ({ label, value, min, max, step, unit, onChange }: any) => (
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

const GeckoHabitatCalculator: React.FC = () => {
    const [inputs, setInputs] = useState<HabitatInputs>({
        species: 'leopard',
        age: 'adult',
        enclosureSize: 20,
        enclosureType: 'glass',
        substrateType: 'tile',
        multipleGeckos: false,
        geckoCount: 1
    });

    const [result, setResult] = useState<HabitatResult | null>(null);

    useEffect(() => {
        calculateHabitat();
    }, [inputs.species, inputs.age, inputs.enclosureSize, inputs.enclosureType, inputs.substrateType, inputs.multipleGeckos, inputs.geckoCount]);

    const calculateHabitat = () => {
        const { species, age, enclosureSize, enclosureType, substrateType, multipleGeckos, geckoCount } = inputs;
        const speciesConfig = SPECIES_CONFIG[species];

        // Tank size calculations
        let recommendedTankSize = speciesConfig.recommendedSize[age];
        let minTankSize = speciesConfig.minSize[age];

        if (multipleGeckos && geckoCount > 1) {
            recommendedTankSize = recommendedTankSize + (geckoCount - 1) * 10;
            minTankSize = minTankSize + (geckoCount - 1) * 10;
        }

        // Temperature ranges
        const temperature = {
            hotSpot: speciesConfig.temp.hotSpot,
            coolEnd: speciesConfig.temp.coolEnd,
            night: speciesConfig.temp.night
        };

        // Humidity
        const humidity = speciesConfig.humidity;

        // Lighting
        const lighting = {
            uvbType: speciesConfig.uvb.type,
            uvbStrength: speciesConfig.uvb.strength,
            schedule: speciesConfig.uvb.schedule,
            distance: species === 'leopard' ? speciesConfig.uvb.distance : '12-18 inches'
        };

        // Heating
        const heating = {
            primary: speciesConfig.heating.primary,
            backup: speciesConfig.heating.backup,
            thermostat: 'Required - use thermostat for safety'
        };

        // Substrate safety
        const substrateConfig = SUBSTRATE_TYPES[substrateType];
        const isSafe = !substrateConfig.dangerousFor.includes(age);
        const substrate = {
            safe: isSafe,
            recommendation: isSafe ? substrateConfig.label + ' is safe for ' + age : '⚠️ ' + substrateConfig.label + ' is dangerous for ' + age,
            warnings: isSafe ? [] : ['Impaction risk - switch to paper towels or tile']
        };

        // Hides and decorations
        const hides = {
            warm: age === 'hatchling' ? 'Small hide on hot side' : 'Hide on hot side',
            cool: age === 'hatchling' ? 'Small hide on cool side' : 'Hide on cool side',
            humid: species === 'leopard' ? 'Humid hide with damp moss' : 'Plastic hide with moist paper towel',
            climbing: speciesConfig.climbing
        };

        // Warnings
        const warnings: string[] = [];
        if (enclosureSize < minTankSize) {
            warnings.push(`⚠️ Current enclosure (${enclosureSize}g) is too small. Minimum: ${minTankSize}g.`);
        }
        if (multipleGeckos && species === 'leopard' && geckoCount > 1) {
            warnings.push('⚠️ Leopard geckos are solitary - house separately to avoid aggression.');
        }
        if (species === 'leopard' && enclosureType === 'bioactive') {
            warnings.push('⚠️ Bioactive setups are challenging for leopard geckos due to low humidity needs.');
        }
        if (species === 'crested' || species === 'gargoyle') {
            if (enclosureType === 'glass' && !speciesConfig.climbing) {
                warnings.push('⚠️ Add vertical climbing structures for arboreal geckos.');
            }
        }
        if (enclosureType === 'wooden' && species === 'crested') {
            warnings.push('⚠️ Ensure adequate ventilation for high humidity species.');
        }

        // Tips
        const tips: string[] = [];
        if (species === 'leopard') {
            tips.push('Use an under-tank heater controlled by a thermostat.');
            tips.push('Create a temperature gradient with hot and cool zones.');
            tips.push('Provide a humid hide during shedding to prevent stuck skin.');
        } else if (species === 'crested') {
            tips.push('Provide vertical climbing structures and plants.');
            tips.push('Mist the enclosure 1-2 times daily to maintain humidity.');
            tips.push('Use a hygrometer to monitor humidity levels.');
        } else if (species === 'gargoyle') {
            tips.push('Gargoyles are heavier than cresteds - provide sturdy branches.');
            tips.push('They may be territorial - monitor closely if housing multiple.');
        }

        if (age === 'hatchling') {
            tips.push('Keep hatchlings in smaller enclosures for easier feeding and monitoring.');
            tips.push('Use paper towels as substrate to prevent impaction.');
        }

        // Setup checklist
        const checklist: string[] = [
            'Thermostat for heat source',
            'Digital thermometer with probes',
            'Hygrometer for humidity',
            'UVB bulb (replace every 6-12 months)',
            'At least 3 hides (warm, cool, humid)',
            'Water dish',
            'Calcium dish (for leopard geckos)'
        ];

        if (species === 'crested' || species === 'gargoyle') {
            checklist.push('Climbing branches',
                           'Live or fake plants for cover',
                           'Misting bottle');
        }

        setResult({
            minTankSize,
            recommendedTankSize,
            temperature,
            humidity,
            lighting,
            heating,
            substrate,
            hides,
            warnings,
            tips,
            checklist
        });
    };

    return (
        <div className="glass-panel text-slate-900 rounded-[2rem] shadow-xl bg-white/95 backdrop-blur-md border border-brand-700/20 p-0 md:p-8 relative overflow-hidden max-w-6xl mx-auto font-sans">
            
            {/* Sticky Mobile Header Result */}
            <div className="lg:hidden sticky top-0 z-40 bg-brand-900 text-brand-100 p-4 shadow-lg flex justify-between items-center border-b border-brand-800/30">
                <div>
                    <div className="text-[10px] uppercase tracking-wider opacity-70">Tank Size</div>
                    <div className="text-2xl font-black text-white leading-none">
                        {result ? result.recommendedTankSize : 20}g
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-[10px] uppercase tracking-wider opacity-70">Hot Spot</div>
                    <div className="font-bold text-white text-sm">{result?.temperature.hotSpot.f}°F</div>
                </div>
            </div>

            <div className="p-4 md:p-0 relative z-10 w-full">
                <div className="text-center mb-6 md:mb-8 pt-4 md:pt-0">
                    <div className="inline-flex items-center gap-2 mb-2">
                        <span className="p-1.5 bg-brand-100 text-brand-700 rounded-lg"><Home className="w-5 h-5" /></span>
                        <span className="text-[10px] font-bold tracking-widest text-brand-700 uppercase">2026 Calculator</span>
                    </div>
                    <h1 className="text-2xl md:text-4xl font-black text-brand-900 tracking-tight">Gecko Habitat Calculator</h1>
                    <p className="text-xs text-brand-700 mt-1">Design the Perfect Home for Your Gecko</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* INPUTS COLUMN */}
                    <div className="lg:col-span-7 space-y-5">

                        {/* Species Selection */}
                        <div className="bg-white p-5 rounded-3xl shadow-sm border border-brand-700/10">
                            <h3 className="font-bold text-brand-900 text-sm uppercase tracking-wide mb-3 flex items-center gap-2">
                                <Layers className="w-4 h-4 text-brand-600" /> Gecko Species
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {Object.entries(SPECIES_CONFIG).map(([key, data]) => (
                                    <SelectionButton 
                                        key={key}
                                        selected={inputs.species === key} 
                                        onClick={() => setInputs(p => ({ ...p, species: key as GeckoSpecies }))} 
                                        label={data.name} 
                                        subLabel={data.terrestrial ? 'Terrestrial' : 'Arboreal'}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Age & Enclosure Size */}
                        <div className="bg-white p-5 rounded-3xl shadow-sm border border-brand-700/10">
                            <h3 className="font-bold text-brand-900 text-sm uppercase tracking-wide mb-3 flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-brand-600" /> Age & Enclosure Size
                            </h3>

                            <div className="grid grid-cols-3 gap-3 mb-6">
                                {[
                                    { key: 'hatchling', label: 'Hatchling', sub: '0-3 months' },
                                    { key: 'juvenile', label: 'Juvenile', sub: '3-12 months' },
                                    { key: 'adult', label: 'Adult', sub: '12+ months' }
                                ].map(({ key, label, sub }) => (
                                    <button 
                                        key={key}
                                        onClick={() => setInputs(p => ({ ...p, age: key as GeckoAge }))}
                                        className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all text-center h-full group ${
                                            inputs.age === key 
                                                ? 'bg-brand-50 border-brand-600 text-brand-900' 
                                                : 'bg-slate-50 border-slate-200 hover:border-brand-400 hover:bg-brand-50/30 text-slate-700'
                                        }`}
                                    >
                                        <div className="text-xs font-bold leading-tight">{label}</div>
                                        <div className="text-[10px] text-slate-400 mt-1">{sub}</div>
                                    </button>
                                ))}
                            </div>

                            <SizeSlider 
                                label="Enclosure Size" 
                                value={inputs.enclosureSize} 
                                min={5} 
                                max={60} 
                                step={1} 
                                unit="gallons" 
                                onChange={(v: number) => setInputs(p => ({...p, enclosureSize: v}))} 
                            />
                        </div>

                        {/* Multiple Geckos */}
                        <div className="bg-white p-5 rounded-3xl shadow-sm border border-brand-700/10">
                            <h3 className="font-bold text-brand-900 text-sm uppercase tracking-wide mb-3 flex items-center gap-2">
                                <Plus className="w-4 h-4 text-brand-600" /> Multiple Geckos?
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setInputs(p => ({ ...p, multipleGeckos: false }))}
                                    className={`py-4 px-3 rounded-xl text-center transition-all ${!inputs.multipleGeckos ? 'bg-brand-600 text-white shadow-lg scale-105' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                                >
                                    <div className="text-xs font-bold uppercase mb-1">Single Gecko</div>
                                    <div className="text-[10px] opacity-70">Recommended</div>
                                </button>
                                <button
                                    onClick={() => setInputs(p => ({ ...p, multipleGeckos: true }))}
                                    className={`py-4 px-3 rounded-xl text-center transition-all ${inputs.multipleGeckos ? 'bg-brand-600 text-white shadow-lg scale-105' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                                >
                                    <div className="text-xs font-bold uppercase mb-1">Multiple</div>
                                    <div className="text-[10px] opacity-70">Not for leopard geckos</div>
                                </button>
                            </div>

                            {inputs.multipleGeckos && (
                                <div className="mt-4 p-4 bg-slate-50 rounded-xl">
                                    <label className="text-xs font-bold text-slate-700 uppercase mb-2 block">Number of Geckos</label>
                                    <div className="flex items-center gap-3">
                                        <button 
                                            onClick={() => setInputs(p => ({...p, geckoCount: Math.max(1, p.geckoCount - 1)}))}
                                            className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center hover:bg-brand-50 transition-colors"
                                        >
                                            <Minus className="w-4 h-4 text-slate-600" />
                                        </button>
                                        <span className="text-2xl font-bold text-slate-900 w-12 text-center">{inputs.geckoCount}</span>
                                        <button 
                                            onClick={() => setInputs(p => ({...p, geckoCount: p.geckoCount + 1}))}
                                            className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center hover:bg-brand-50 transition-colors"
                                        >
                                            <Plus className="w-4 h-4 text-slate-600" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Enclosure Type */}
                        <div className="bg-white p-5 rounded-3xl shadow-sm border border-brand-700/10">
                            <h3 className="font-bold text-brand-900 text-sm uppercase tracking-wide mb-3 flex items-center gap-2">
                                <Home className="w-4 h-4 text-brand-600" /> Enclosure Type
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {Object.entries(ENCLOSURE_TYPES).map(([key, data]) => (
                                    <SelectionButton 
                                        key={key}
                                        selected={inputs.enclosureType === key} 
                                        onClick={() => setInputs(p => ({ ...p, enclosureType: key as EnclosureType }))} 
                                        label={data.label} 
                                        subLabel={data.desc}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Substrate Type */}
                        <div className="bg-white p-5 rounded-3xl shadow-sm border border-brand-700/10">
                            <h3 className="font-bold text-brand-900 text-sm uppercase tracking-wide mb-3 flex items-center gap-2">
                                <Layers className="w-4 h-4 text-brand-600" /> Substrate Type
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                                {Object.entries(SUBSTRATE_TYPES).map(([key, data]) => (
                                    <SelectionButton 
                                        key={key}
                                        selected={inputs.substrateType === key} 
                                        onClick={() => setInputs(p => ({ ...p, substrateType: key as SubstrateType }))} 
                                        label={data.label} 
                                        subLabel={data.desc}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* RESULTS COLUMN */}
                    <div className="lg:col-span-5 space-y-4">
                        {/* Tank Size Result */}
                        <div className="bg-gradient-to-br from-brand-900 to-brand-800 text-white p-6 md:p-8 rounded-[2rem] shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none"><Home className="w-48 h-48" /></div>
                            
                            <div className="relative z-10">
                                <p className="text-brand-100/70 font-bold uppercase tracking-widest text-[10px] mb-2">Recommended Tank Size</p>
                                {result && (
                                    <>
                                        <div className="flex items-baseline gap-2 mb-4">
                                            <div className="text-5xl md:text-6xl font-black tracking-tighter text-white drop-shadow-xl">
                                                {result.recommendedTankSize}
                                            </div>
                                            <span className="text-2xl font-bold text-brand-200">gallons</span>
                                        </div>
                                        
                                        <div className="bg-black/20 p-3 rounded-xl mb-4">
                                            <div className="flex justify-between items-center">
                                                <span className="text-brand-100 text-xs">Minimum size:</span>
                                                <span className="font-bold text-white">{result.minTankSize} gallons</span>
                                            </div>
                                        </div>

                                        {inputs.enclosureSize < result.minTankSize && (
                                            <div className="bg-red-500/30 p-3 rounded-xl border border-red-400/50">
                                                <div className="flex gap-2 items-center text-amber-100 text-xs">
                                                    <AlertTriangle className="w-4 h-4" />
                                                    <span>Current enclosure is too small</span>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Temperature Zones */}
                        {result && (
                            <div className="bg-gradient-to-br from-accent-50 to-orange-50 p-5 rounded-3xl border border-accent-200">
                                <h4 className="font-bold text-accent-900 mb-4 flex items-center gap-2 text-xs uppercase tracking-wide">
                                    <Thermometer className="w-4 h-4 text-accent-600" /> Temperature Zones
                                </h4>
                                <div className="space-y-3">
                                    <div className="bg-white p-3 rounded-xl">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <span className="text-xs font-bold text-accent-700">Hot Spot</span>
                                                <span className="block text-[10px] text-slate-400">Basking area</span>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold text-accent-900">{result.temperature.hotSpot.f}°F</div>
                                                <div className="text-[10px] text-slate-500">{result.temperature.hotSpot.c}°C</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-white p-3 rounded-xl">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <span className="text-xs font-bold text-accent-700">Cool End</span>
                                                <span className="block text-[10px] text-slate-400">Resting area</span>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold text-accent-900">{result.temperature.coolEnd.f}°F</div>
                                                <div className="text-[10px] text-slate-500">{result.temperature.coolEnd.c}°C</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-white p-3 rounded-xl">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <span className="text-xs font-bold text-accent-700">Night</span>
                                                <span className="block text-[10px] text-slate-400">Lights off</span>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold text-accent-900">{result.temperature.night.f}°F</div>
                                                <div className="text-[10px] text-slate-500">{result.temperature.night.c}°C</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Humidity & Lighting */}
                        {result && (
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-gradient-to-br from-highlight-50 to-lime-50 p-4 rounded-3xl border border-highlight-200">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Droplets className="w-4 h-4 text-highlight-600" />
                                        <span className="text-xs font-bold text-highlight-900 uppercase">Humidity</span>
                                    </div>
                                    <div className="font-bold text-highlight-900">{result.humidity.min}-{result.humidity.max}%</div>
                                    <div className="text-[10px] text-highlight-700 mt-1">{result.humidity.description}</div>
                                </div>

                                <div className="bg-gradient-to-br from-brand-50 to-emerald-50 p-4 rounded-3xl border border-brand-200">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Sun className="w-4 h-4 text-brand-600" />
                                        <span className="text-xs font-bold text-brand-900 uppercase">Lighting</span>
                                    </div>
                                    <div className="font-bold text-brand-900 text-sm">{result.lighting.uvbType} {result.lighting.uvbStrength}</div>
                                    <div className="text-[10px] text-brand-700 mt-1">{result.lighting.schedule}</div>
                                </div>
                            </div>
                        )}

                        {/* Warnings */}
                        {result && result.warnings.length > 0 && (
                            <div className="bg-red-50 p-5 rounded-3xl border border-red-200">
                                <h4 className="font-bold text-red-900 mb-3 flex items-center gap-2 text-xs uppercase tracking-wide">
                                    <AlertTriangle className="w-4 h-4 text-red-600" /> Warnings
                                </h4>
                                <div className="space-y-2">
                                    {result.warnings.map((w, i) => (
                                        <div key={i} className="text-xs text-red-800 flex items-start gap-2">
                                            <span className="text-red-500">⚠️</span>
                                            {w}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Setup Checklist */}
                        {result && (
                            <div className="bg-brand-50 p-5 rounded-3xl border border-brand-200">
                                <h4 className="font-bold text-brand-900 mb-3 flex items-center gap-2 text-xs uppercase tracking-wide">
                                    <CheckCircle2 className="w-4 h-4 text-green-600" /> Setup Checklist
                                </h4>
                                <div className="space-y-2">
                                    {result.checklist.map((item, i) => (
                                        <div key={i} className="flex items-start gap-2 text-xs text-slate-600">
                                            <div className="w-4 h-4 rounded border-2 border-brand-300 flex items-center justify-center mt-0.5 shrink-0">
                                                <div className="w-2 h-2 rounded-full bg-brand-400"></div>
                                            </div>
                                            {item}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="text-center mt-6">
                <p className="text-brand-700 text-sm">
                    Disclaimer: Always consult with a reptile veterinarian for specific habitat needs. 
                    Individual geckos may have unique requirements.
                </p>
            </div>
        </div>
    );
};

export default GeckoHabitatCalculator;
