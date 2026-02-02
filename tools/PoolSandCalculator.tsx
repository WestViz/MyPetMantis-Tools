import React, { useState, useEffect } from 'react';
import {
    Package,
    Droplets,
    CheckCircle2,
    AlertTriangle,
    Info,
    Beaker
} from 'lucide-react';

// ----------------------------------------------------------------------
// DATA
// ----------------------------------------------------------------------

const SAND_CAPACITY_TABLE = [
    { diam: 16, sand: 100 },
    { diam: 18, sand: 150 },
    { diam: 19, sand: 150 },
    { diam: 20, sand: 200 },
    { diam: 21, sand: 200 },
    { diam: 22, sand: 250 },
    { diam: 23, sand: 250 },
    { diam: 24, sand: 300 },
    { diam: 26, sand: 400 },
    { diam: 28, sand: 500 },
    { diam: 30, sand: 550 },
    { diam: 32, sand: 700 },
    { diam: 36, sand: 900 }
];

// ----------------------------------------------------------------------
// TYPES
// ----------------------------------------------------------------------

type MediaType = 'silica' | 'glass' | 'zeolite';

interface Result {
    weightLbs: number;
    bags: number;
    cubicFeet: number;
    warnings: string[];
}

// ----------------------------------------------------------------------
// HELPERS
// ----------------------------------------------------------------------

const SelectionButton = ({ selected, onClick, label, subLabel }: { selected: boolean, onClick: () => void, label: string, subLabel?: string }) => (
    <button
        onClick={onClick}
        className={`relative p-3 rounded-xl border-2 text-left transition-all duration-200 w-full touch-manipulation
      ${selected
                ? 'border-amber-500 bg-amber-50/50 ring-2 ring-amber-200 ring-offset-1 z-10'
                : 'border-slate-100 bg-slate-50 hover:bg-slate-100 text-slate-500'}`}
    >
        <div className="flex justify-between items-start">
            <div>
                <div className={`font-bold text-sm ${selected ? 'text-amber-900' : 'text-slate-700'}`}>{label}</div>
                {subLabel && <div className={`text-xs mt-0.5 ${selected ? 'text-amber-700' : 'text-slate-400'}`}>{subLabel}</div>}
            </div>
            {selected && <CheckCircle2 className="w-5 h-5 text-amber-500 flex-shrink-0 ml-2" />}
        </div>
    </button>
);

// ----------------------------------------------------------------------
// COMPONENT
// ----------------------------------------------------------------------

const PoolSandCalculator: React.FC = () => {
    const [diameter, setDiameter] = useState<number>(24);
    const [mediaType, setMediaType] = useState<MediaType>('silica');
    const [filterModel, setFilterModel] = useState<string>('');
    const [result, setResult] = useState<Result>({
        weightLbs: 300,
        bags: 6,
        cubicFeet: 4,
        warnings: []
    });

    useEffect(() => {
        calculateMedia();
    }, [diameter, mediaType]);

    const calculateMedia = () => {
        // 1. Find base sand weight
        const exact = SAND_CAPACITY_TABLE.find(r => r.diam === diameter);
        let baseSand = 0;

        if (exact) {
            baseSand = exact.sand;
        } else {
            // Find nearest
            let closest = SAND_CAPACITY_TABLE[0];
            let minDiff = Math.abs(diameter - closest.diam);

            for (const r of SAND_CAPACITY_TABLE) {
                const diff = Math.abs(diameter - r.diam);
                if (diff < minDiff) {
                    minDiff = diff;
                    closest = r;
                }
            }

            if (diameter > 36) {
                baseSand = Math.round(diameter * diameter * 0.7);
            } else {
                baseSand = closest.sand;
            }
        }

        // 2. Adjust for media type
        let weightLbs = baseSand;
        let mediaMultiplier = 1.0;

        switch (mediaType) {
            case 'silica':
                mediaMultiplier = 1.0;
                break;
            case 'glass':
                mediaMultiplier = 0.80; // 20% less weight
                break;
            case 'zeolite':
                mediaMultiplier = 0.85; // 15% less weight
                break;
        }

        weightLbs = Math.round(baseSand * mediaMultiplier);

        // 3. Calculate bags and cubic feet
        const bags = Math.ceil(weightLbs / 50);

        // Silica sand density: ~100 lbs/cubic foot
        // Glass media: ~85 lbs/cubic foot
        // Zeolite: ~60 lbs/cubic foot
        let density = 100;
        if (mediaType === 'glass') density = 85;
        if (mediaType === 'zeolite') density = 60;

        const cubicFeet = Math.round((weightLbs / density) * 10) / 10;

        // 4. Warnings
        const warnings: string[] = [];

        if (diameter === 24 && (baseSand < 250 || baseSand > 325)) {
            warnings.push("Some 24\" filters vary (250-325 lbs). Check your tank label.");
        }
        if (diameter > 36) {
            warnings.push("Large commercial filter. Verify specs with manufacturer.");
        }
        if (mediaType === 'glass' || mediaType === 'zeolite') {
            warnings.push("Alternative media requires proper backwash flow rate adjustment.");
        }

        setResult({
            weightLbs,
            bags,
            cubicFeet,
            warnings
        });
    };

    return (
        <div className="glass-panel text-slate-900 rounded-[2rem] shadow-xl bg-white/90 backdrop-blur-md border border-slate-200 p-4 md:p-8 relative overflow-hidden max-w-6xl mx-auto">

            {/* Background Decor */}
            <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-amber-400/20 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 w-full">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 mb-2">
                        <span className="p-2 bg-amber-100 text-amber-700 rounded-lg"><Package className="w-6 h-6" /></span>
                        <span className="text-xs font-bold tracking-widest text-slate-400 uppercase">Filter Maintenance</span>
                    </div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Sand Filter Media Calculator</h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* === LEFT COLUMN: INPUTS === */}
                    <div className="lg:col-span-7 space-y-4">

                        {/* 1. TANK DIAMETER */}
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                            <label className="block text-slate-700 font-bold uppercase tracking-wider text-xs mb-4">
                                Tank Diameter
                            </label>

                            <div className="flex items-center justify-center gap-4 mb-4">
                                <button
                                    onClick={() => setDiameter(Math.max(12, diameter - 1))}
                                    className="w-12 h-12 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center font-bold text-xl active:scale-95 transition-all"
                                >-</button>

                                <div className="w-32 text-center">
                                    <span className="text-6xl font-black text-slate-800 tracking-tighter">{diameter}</span>
                                    <span className="block text-slate-400 font-bold text-sm">Inches</span>
                                </div>

                                <button
                                    onClick={() => setDiameter(Math.min(60, diameter + 1))}
                                    className="w-12 h-12 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center font-bold text-xl active:scale-95 transition-all"
                                >+</button>
                            </div>

                            <div className="text-center">
                                <p className="text-xs text-slate-400 mb-2">Common Sizes</p>
                                <div className="flex flex-wrap gap-2 justify-center">
                                    {[16, 19, 24, 30].map(s => (
                                        <button
                                            key={s}
                                            onClick={() => setDiameter(s)}
                                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${diameter === s ? 'bg-amber-100 text-amber-700' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                                        >
                                            {s}"
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* 2. MEDIA TYPE */}
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                            <h3 className="font-bold text-slate-700 flex items-center gap-2 mb-4 text-sm uppercase">
                                <Beaker className="w-4 h-4 text-amber-500" /> Filter Media Type
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                <SelectionButton
                                    selected={mediaType === 'silica'}
                                    onClick={() => setMediaType('silica')}
                                    label="#20 Silica Sand"
                                    subLabel="0.45-0.55mm"
                                />
                                <SelectionButton
                                    selected={mediaType === 'glass'}
                                    onClick={() => setMediaType('glass')}
                                    label="Glass Media"
                                    subLabel="20% lighter"
                                />
                                <SelectionButton
                                    selected={mediaType === 'zeolite'}
                                    onClick={() => setMediaType('zeolite')}
                                    label="Zeolite"
                                    subLabel="15% lighter"
                                />
                            </div>
                        </div>

                        {/* 3. OPTIONAL FILTER MODEL */}
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                            <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">
                                Filter Model (Optional)
                            </label>
                            <input
                                type="text"
                                value={filterModel}
                                onChange={(e) => setFilterModel(e.target.value)}
                                placeholder="e.g., Hayward S244T, Pentair TR60"
                                className="w-full bg-slate-50 border-0 rounded-xl p-3 font-medium text-slate-700 ring-1 ring-slate-200 focus:ring-2 focus:ring-amber-500 transition-all"
                            />
                            <p className="text-xs text-slate-400 mt-2">
                                If known, enter your filter model to cross-check capacity.
                            </p>
                        </div>

                    </div>

                    {/* === RIGHT COLUMN: RESULTS === */}
                    <div className="lg:col-span-5 space-y-4">
                        <div className="bg-slate-900 text-white p-6 md:p-8 rounded-3xl shadow-2xl relative overflow-hidden">
                            <div className="relative z-10">
                                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-4">Required Media</p>

                                <div className="mb-6">
                                    <span className="text-6xl font-black text-amber-400 tracking-tighter">{result.weightLbs}</span>
                                    <span className="text-2xl font-bold text-slate-500 ml-2">lbs</span>
                                </div>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-2 gap-3 mb-4">
                                    <div className="bg-white/10 p-3 rounded-xl border border-white/5">
                                        <p className="text-[9px] font-bold text-slate-400 uppercase">Bags (50lb)</p>
                                        <p className="text-2xl font-bold text-white">{result.bags}</p>
                                    </div>
                                    <div className="bg-white/10 p-3 rounded-xl border border-white/5">
                                        <p className="text-[9px] font-bold text-slate-400 uppercase">Volume</p>
                                        <p className="text-2xl font-bold text-white">{result.cubicFeet} <span className="text-sm font-normal opacity-50">ft³</span></p>
                                    </div>
                                </div>

                                <div className="h-px bg-white/10 w-full my-4"></div>

                                {/* Warnings */}
                                {result.warnings.length > 0 && (
                                    <div className="space-y-2 mb-4">
                                        {result.warnings.map((w, i) => (
                                            <div key={i} className="flex gap-2 text-xs text-amber-200 bg-amber-900/30 p-2 rounded-lg border border-amber-900/50">
                                                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                                                <span className="leading-snug">{w}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Installation Instructions */}
                                <div className="space-y-2">
                                    <h4 className="flex items-center gap-2 text-[10px] font-bold text-amber-400 uppercase mb-2">
                                        <Info className="w-3 h-3" /> Installation Guide
                                    </h4>
                                    <div className="space-y-1.5">
                                        {[
                                            "Fill tank halfway with water before adding media (prevents lateral damage).",
                                            "Fill tank to ⅔ full. Leave 6-8 inches of freeboard.",
                                            "Do NOT overfill—laterals must stay submerged but not buried.",
                                            "Backwash until water runs clear after installation."
                                        ].map((step, i) => (
                                            <div key={i} className="flex gap-2 text-xs text-slate-300 items-start leading-snug">
                                                <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5 flex-shrink-0"></div>
                                                <span>{step}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* Media Spec Card */}
                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                            <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2 text-xs uppercase tracking-wide">
                                <Droplets className="w-4 h-4 text-amber-500" /> Media Specifications
                            </h4>
                            <div className="space-y-2 text-xs text-slate-600">
                                {mediaType === 'silica' && (
                                    <>
                                        <p><strong>Grade:</strong> #20 Silica Sand (0.45-0.55mm)</p>
                                        <p><strong>Density:</strong> ~100 lbs/ft³</p>
                                        <p className="text-rose-600 font-semibold">⚠️ Do NOT use play sand or masonry sand</p>
                                    </>
                                )}
                                {mediaType === 'glass' && (
                                    <>
                                        <p><strong>Type:</strong> Recycled Glass Filter Media</p>
                                        <p><strong>Density:</strong> ~85 lbs/ft³</p>
                                        <p><strong>Benefit:</strong> Finer filtration, less backwash water</p>
                                    </>
                                )}
                                {mediaType === 'zeolite' && (
                                    <>
                                        <p><strong>Type:</strong> Natural Zeolite Media</p>
                                        <p><strong>Density:</strong> ~60 lbs/ft³</p>
                                        <p><strong>Benefit:</strong> Removes ammonia, reduces chlorine demand</p>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default PoolSandCalculator;
