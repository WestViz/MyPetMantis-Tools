import React, { useState, useEffect, useRef } from 'react';
import { useIframeResize } from '../hooks/useIframeResize';
import {
    Maximize,
    Minimize,
    Ruler,
    Layers,
    Info,
    CheckCircle2,
    Minus,
    Plus,
    ArrowRight
} from 'lucide-react';

// ----------------------------------------------------------------------
// TYPES
// ----------------------------------------------------------------------

type PoolShape = 'rectangular' | 'round' | 'oval' | 'kidney';
type CoverType = 'winter_safety' | 'winter_tarp' | 'solar_bubble';

export interface CoverInputs {
    shape: PoolShape;
    length: number; // Major axis
    width: number;  // Minor axis (ignored for Round)
    coverType: CoverType;
    overlapPreference: number; // Inches of overlap PER SIDE
    stepSize: string; // "None", "4x8 Center", "Custom" (Simplified for UI)
}

export interface CoverResult {
    poolAreaSqFt: number;
    coverLength: number; // Order dimensions
    coverWidth: number;
    coverAreaSqFt: number;
    recommendedOrderSize: string;
    notes: string[];
}

// ----------------------------------------------------------------------
// CONSTANTS
// ----------------------------------------------------------------------

const DEFAULTS = {
    winter_safety: { overlap: 12, name: "Safety Mesh/Solid", color: "bg-green-600" }, // 1ft overlap standard
    winter_tarp: { overlap: 24, name: "Winter Tarp", color: "bg-slate-700" }, // 4-5ft overhang recommended usually means 2ft per side? Actually usually 4ft total extra length/width.
    solar_bubble: { overlap: 0, name: "Solar Blanket", color: "bg-blue-400" }, // Exact fit or trim to fit
};

const StepButton = ({ onClick, icon: Icon }: { onClick: () => void, icon: any }) => (
    <button
        onClick={onClick}
        className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 active:scale-95 transition-all touch-manipulation"
    >
        <Icon className="w-5 h-5 md:w-6 md:h-6" />
    </button>
);

const SelectionButton = ({ selected, onClick, label, icon: Icon, subLabel }: { selected: boolean, onClick: () => void, label: string, icon?: any, subLabel?: string }) => (
    <button
        onClick={onClick}
        className={`relative p-3 md:p-4 rounded-xl border-2 text-left transition-all duration-200 w-full touch-manipulation flex flex-col justify-center min-h-[80px]
      ${selected
                ? 'border-indigo-500 bg-indigo-50/50 ring-2 ring-indigo-200 ring-offset-1 z-10'
                : 'border-slate-100 bg-slate-50 hover:bg-slate-100 text-slate-500'}`}
    >
        <div className="flex items-center gap-2 mb-1">
            {Icon && <Icon className={`w-4 h-4 ${selected ? 'text-indigo-600' : 'text-slate-400'}`} />}
            <div className={`font-bold text-sm md:text-base ${selected ? 'text-indigo-900' : 'text-slate-700'}`}>{label}</div>
        </div>
        {subLabel && <div className={`text-xs ${selected ? 'text-indigo-700' : 'text-slate-400'}`}>{subLabel}</div>}
        {selected && <div className="absolute top-2 right-2 text-indigo-500"><CheckCircle2 className="w-4 h-4" /></div>}
    </button>
);

// ----------------------------------------------------------------------
// VISUALIZER COMPONENT
// ----------------------------------------------------------------------
const CoverVisualizer = ({ inputs, result }: { inputs: CoverInputs, result: CoverResult }) => {
    // We render an SVG. 
    // We need to scale the pool + overlap to fit a fixed viewBox 0 0 100 100 (or aspect ratio based)

    // Determine bounding box
    const totalW = result.coverLength;
    const totalH = inputs.shape === 'round' ? result.coverLength : result.coverWidth;

    const maxDim = Math.max(totalW, totalH);
    // Add some padding
    const viewSize = maxDim * 1.2;
    const center = viewSize / 2;

    // Scale factors
    const poolL = inputs.length;
    const poolW = inputs.shape === 'round' ? inputs.length : inputs.width;

    const coverL = result.coverLength;
    const coverW = inputs.shape === 'round' ? result.coverLength : result.coverWidth;

    const renderShape = (w: number, h: number, styleClass: string, isPool: boolean) => {
        const x = center - (w / 2);
        const y = center - (h / 2);

        if (inputs.shape === 'rectangular') {
            return <rect x={x} y={y} width={w} height={h} className={styleClass} rx={isPool ? 1 : 2} />;
        }
        if (inputs.shape === 'round') {
            return <circle cx={center} cy={center} r={w / 2} className={styleClass} />;
        }
        if (inputs.shape === 'oval') {
            return <rect x={x} y={y} width={w} height={h} rx={h / 2} className={styleClass} />;
        }
        if (inputs.shape === 'kidney') {
            // Very rough kidney approximation using path
            // This is purely decorative for this complex shape logic
            return <rect x={x} y={y} width={w} height={h} rx={h / 3} className={styleClass} />;
        }
        return null;
    };

    return (
        <div className="w-full aspect-video bg-indigo-50 rounded-xl relative overflow-hidden border border-indigo-100 shadow-inner flex items-center justify-center">
            {/* Grid Background */}
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', backgroundSize: '10px 10px' }}></div>

            <svg viewBox={`0 0 ${viewSize} ${viewSize}`} className="w-full h-full max-w-[400px]">
                {/* Cover Layer (Bottom) */}
                {renderShape(coverL, coverW, "fill-indigo-900/20 stroke-indigo-500 stroke-dasharray-2", false)}

                {/* Overlap Margin Indicators */}
                {inputs.coverType !== 'solar_bubble' && (
                    <g opacity="0.5">
                        {/* Arrows showing overlap difference */}
                    </g>
                )}

                {/* Pool Layer (Top) */}
                {renderShape(poolL, poolW, "fill-cyan-400 stroke-cyan-600 stroke-2", true)}

                {/* Dimensions Text */}
                <text x={center} y={center} textAnchor="middle" dominantBaseline="middle" className="text-[3px] font-bold fill-white opacity-80 pointer-events-none">
                    POOL
                </text>
            </svg>

            {/* Floating Labels */}
            <div className="absolute bottom-2 left-4 text-xs font-bold text-indigo-900 bg-white/80 px-2 py-1 rounded backdrop-blur-sm border border-indigo-200 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block mr-1"></span> Pool: {inputs.length}' x {inputs.width}'
            </div>
            <div className="absolute bottom-2 right-4 text-xs font-bold text-indigo-900 bg-white/80 px-2 py-1 rounded backdrop-blur-sm border border-indigo-200 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-indigo-200 inline-block mr-1 border border-indigo-500"></span> Cover: {result.recommendedOrderSize}
            </div>
        </div>
    );
};

// ----------------------------------------------------------------------
// MAIN COMPONENT
// ----------------------------------------------------------------------

const PoolCoverCalculator: React.FC = () => {
    useIframeResize();

    const [inputs, setInputs] = useState<CoverInputs>({
        shape: 'rectangular',
        length: 32,
        width: 16,
        coverType: 'winter_safety',
        overlapPreference: 12, // inches default
        stepSize: 'None'
    });

    const [result, setResult] = useState<CoverResult | null>(null);

    // Auto-update default overlap when type changes
    useEffect(() => {
        setInputs(prev => ({ ...prev, overlapPreference: DEFAULTS[prev.coverType].overlap }));
    }, [inputs.coverType]);

    useEffect(() => {
        calculateSize();
    }, [inputs]);

    const calculateSize = () => {
        // Overlap is per side, so total length added = overlap * 2
        // Convert inches to feet for input (overlapPreference is in inches)
        const extraL = (inputs.overlapPreference * 2) / 12;
        const extraW = (inputs.overlapPreference * 2) / 12;

        const coverL = inputs.length + extraL;
        const coverW = (inputs.shape === 'round' ? inputs.length : inputs.width) + extraW;

        const poolArea = inputs.shape === 'round'
            ? Math.PI * Math.pow(inputs.length / 2, 2)
            : inputs.length * inputs.width; // simplified for oval/kidney

        const coverArea = inputs.shape === 'round'
            ? Math.PI * Math.pow(coverL / 2, 2)
            : coverL * coverW;

        const notes = [];
        if (inputs.coverType === 'winter_safety') {
            notes.push("Safety covers require anchor points in concrete deck (approx 3ft perimeter).");
            if (inputs.shape !== 'rectangular') notes.push("Non-rectangular safety covers often require custom measuring forms.");
        }
        if (inputs.coverType === 'winter_tarp') {
            notes.push("Water bags/blocks will sit on the overlap area.");
            notes.push("Order larger if you drop water level significantly (>18 inches).");
        }
        if (inputs.coverType === 'solar_bubble') {
            notes.push("Solar covers float ON the water inside the pool walls.");
            notes.push("Order slightly larger and trim on-site with scissors for perfect fit.");
        }

        setResult({
            poolAreaSqFt: Math.round(poolArea),
            coverLength: coverL,
            coverWidth: coverW,
            coverAreaSqFt: Math.round(coverArea),
            recommendedOrderSize: `${Math.ceil(coverL)}' x ${Math.ceil(coverW)}'`,
            // We ceil for ordering standard sizes usually, or floor? Usually closest standard size is larger.
            notes
        });
    };

    const handleInputUpdate = (key: keyof CoverInputs, value: any) => {
        setInputs(prev => ({ ...prev, [key]: value }));
    };

    return (
        <div className="glass-panel text-slate-900 rounded-[2rem] shadow-xl bg-white/90 backdrop-blur-md border border-slate-200 p-4 md:p-8 relative overflow-hidden max-w-5xl mx-auto">

            {/* Background Decor */}
            <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 w-full">
                {/* Header */}
                <div className="text-center mb-6">

                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Perfect Fit Cover Calculator</h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* === LEFT COLUMN: INPUTS === */}
                    <div className="lg:col-span-7 space-y-6">

                        {/* TYPE SELECTOR */}
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                            <h3 className="font-bold text-slate-700 flex items-center gap-2 mb-4">
                                <Info className="w-5 h-5 text-indigo-500" /> Cover Type
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <SelectionButton
                                    label="Safety (Mesh)"
                                    subLabel="Anchored to deck"
                                    selected={inputs.coverType === 'winter_safety'}
                                    onClick={() => handleInputUpdate('coverType', 'winter_safety')}
                                />
                                <SelectionButton
                                    label="Winter Tarp"
                                    subLabel="Held by water bags"
                                    selected={inputs.coverType === 'winter_tarp'}
                                    onClick={() => handleInputUpdate('coverType', 'winter_tarp')}
                                />
                                <SelectionButton
                                    label="Solar Blanket"
                                    subLabel="Floats on water"
                                    selected={inputs.coverType === 'solar_bubble'}
                                    onClick={() => handleInputUpdate('coverType', 'solar_bubble')}
                                />
                            </div>
                        </div>

                        {/* SHAPE & DIMENSIONS */}
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                            <h3 className="font-bold text-slate-700 flex items-center gap-2 mb-6">
                                <Ruler className="w-5 h-5 text-cyan-500" /> Shape & Size
                            </h3>

                            {/* Shape */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
                                {(['rectangular', 'round', 'oval', 'kidney'] as PoolShape[]).map(s => (
                                    <button
                                        key={s}
                                        onClick={() => handleInputUpdate('shape', s)}
                                        className={`py-2 px-1 rounded-lg text-xs font-bold uppercase transition-all
                                            ${inputs.shape === s ? 'bg-slate-800 text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>

                            {/* Dims */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase">{inputs.shape === 'round' ? 'Diameter' : 'Length'}</label>
                                    <div className="flex items-center gap-2">
                                        <StepButton onClick={() => handleInputUpdate('length', Math.max(1, inputs.length - 1))} icon={Minus} />
                                        <div className="flex-1 relative">
                                            <input
                                                type="number"
                                                value={inputs.length}
                                                onChange={(e) => handleInputUpdate('length', parseFloat(e.target.value) || 0)}
                                                className="w-full bg-transparent text-center font-bold text-xl text-slate-800 border-none focus:ring-0 p-0"
                                            />
                                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-normal pointer-events-none">ft</span>
                                        </div>
                                        <StepButton onClick={() => handleInputUpdate('length', inputs.length + 1)} icon={Plus} />
                                    </div>
                                </div>

                                {inputs.shape !== 'round' && (
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase">Width</label>
                                        <div className="flex items-center gap-2">
                                            <StepButton onClick={() => handleInputUpdate('width', Math.max(1, inputs.width - 1))} icon={Minus} />
                                            <div className="flex-1 relative">
                                                <input
                                                    type="number"
                                                    value={inputs.width}
                                                    onChange={(e) => handleInputUpdate('width', parseFloat(e.target.value) || 0)}
                                                    className="w-full bg-transparent text-center font-bold text-xl text-slate-800 border-none focus:ring-0 p-0"
                                                />
                                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-normal pointer-events-none">ft</span>
                                            </div>
                                            <StepButton onClick={() => handleInputUpdate('width', inputs.width + 1)} icon={Plus} />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Overlap Adjuster */}
                            <div className="mt-6 pt-6 border-t border-slate-100">
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase">Overlap Per Side</label>
                                    <span className="text-sm font-bold text-indigo-600">{inputs.overlapPreference}"</span>
                                </div>
                                <input
                                    type="range"
                                    min="0" max="36" step="6"
                                    value={inputs.overlapPreference}
                                    onChange={(e) => handleInputUpdate('overlapPreference', parseInt(e.target.value))}
                                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                />
                                <p className="text-[10px] text-slate-400 mt-2">
                                    Standard for {DEFAULTS[inputs.coverType].name} is {DEFAULTS[inputs.coverType].overlap}".
                                </p>
                            </div>

                        </div>
                    </div>

                    {/* === RIGHT COLUMN: VISUALS & RESULT === */}
                    <div className="lg:col-span-5 space-y-6">

                        {/* Visualizer */}
                        {result && <CoverVisualizer inputs={inputs} result={result} />}

                        {/* Result Card */}
                        <div className="bg-slate-900 text-white p-5 md:p-6 rounded-3xl shadow-xl border border-slate-800">
                            <div className="mb-4">
                                <p className="text-white/60 font-bold uppercase tracking-widest text-[10px] mb-1">Recommended Order Size</p>
                                <div className="flex items-center gap-3">
                                    <span className="text-4xl font-black tracking-tight text-white">
                                        {result?.recommendedOrderSize}
                                    </span>
                                </div>
                            </div>

                            {result && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-white/5 p-3 rounded-lg border border-white/10">
                                            <p className="text-[10px] text-white/60 uppercase font-bold mb-1">Total Cover Area</p>
                                            <div className="text-lg font-bold">{result.coverAreaSqFt} <span className="text-xs font-normal text-white/40">sq ft</span></div>
                                        </div>
                                        <div className="bg-white/5 p-3 rounded-lg border border-white/10">
                                            <p className="text-[10px] text-white/60 uppercase font-bold mb-1">Overlap Added</p>
                                            <div className="text-lg font-bold">+{inputs.overlapPreference}" <span className="text-xs font-normal text-white/40">/ side</span></div>
                                        </div>
                                    </div>

                                    {result.notes.length > 0 && (
                                        <div className="bg-indigo-900/40 p-3 rounded-xl border border-indigo-500/30">
                                            <h4 className="text-xs font-bold text-indigo-300 uppercase mb-2">Important Notes</h4>
                                            <ul className="space-y-1">
                                                {result.notes.map((note, i) => (
                                                    <li key={i} className="flex items-start gap-2 text-xs text-indigo-100/80 leading-relaxed">
                                                        <span className="mt-1 w-1 h-1 rounded-full bg-indigo-400 flex-shrink-0"></span>
                                                        {note}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default PoolCoverCalculator;
