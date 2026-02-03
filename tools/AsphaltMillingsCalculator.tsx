import React, { useState, useEffect } from 'react';
import { Truck, Ruler, Info, CheckCircle2, Minus, Plus, Layers, Hammer } from 'lucide-react';

type UnitSystem = 'imperial' | 'metric';

interface MillingsInputs {
    length: number;
    width: number;
    depth: number;
    unitSystem: UnitSystem;
    wasteFactor: number;
    costPerTon: number;
}

interface MillingsResult {
    tonnage: number;
    tonnageWithWaste: number;
    cubicYards: number;
    squareFeet: number;
    totalCost: number;
    truckLoads: number;
    warnings: string[];
}

const MILLINGS_DENSITY_LBS_PER_CY = 2400; // Typical loose asphalt millings
const TRUCK_CAPACITY_TONS = 15; // Typical dump truck

const StepButton = ({ onClick, icon: Icon }: { onClick: () => void, icon: any }) => (
    <button
        onClick={onClick}
        className="w-12 h-12 flex items-center justify-center rounded-xl bg-[#ffe0c1] hover:bg-[#9A690F]/20 text-[#885C09] active:scale-95 transition-all touch-manipulation"
    >
        <Icon className="w-6 h-6" />
    </button>
);

const Tooltip = ({ text }: { text: string }) => (
    <div className="group relative inline-block ml-1">
        <Info className="w-4 h-4 text-[#9A690F]/60 hover:text-[#9A690F] cursor-help" />
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-64 p-3 bg-[#291901] text-[#ffe0c1] text-xs rounded-lg shadow-xl z-50">
            {text}
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-[#291901]"></div>
        </div>
    </div>
);

const AsphaltMillingsCalculator: React.FC = () => {
    const [inputs, setInputs] = useState<MillingsInputs>({
        length: 100,
        width: 12,
        depth: 4,
        unitSystem: 'imperial',
        wasteFactor: 10,
        costPerTon: 25
    });

    const [result, setResult] = useState<MillingsResult | null>(null);

    useEffect(() => {
        calculateMillings();
    }, [inputs]);

    const calculateMillings = () => {
        const { length, width, depth, unitSystem, wasteFactor, costPerTon } = inputs;

        let lengthFt = length;
        let widthFt = width;
        let depthInches = depth;

        if (unitSystem === 'metric') {
            lengthFt = length * 3.28084;
            widthFt = width * 3.28084;
            depthInches = depth * 0.393701;
        }

        const squareFeet = lengthFt * widthFt;
        const volumeCubicFeet = lengthFt * widthFt * (depthInches / 12);
        const cubicYards = volumeCubicFeet / 27;

        // Millings are lighter than hot mix
        const tonnage = (cubicYards * MILLINGS_DENSITY_LBS_PER_CY) / 2000;
        const tonnageWithWaste = tonnage * (1 + wasteFactor / 100);
        const totalCost = tonnageWithWaste * costPerTon;
        const truckLoads = Math.ceil(tonnageWithWaste / TRUCK_CAPACITY_TONS);

        const warnings: string[] = [];
        if (depthInches < 3) warnings.push("⚠️ 3 inches is the absolute minimum depth for millings to bond properly.");
        if (depthInches > 6) warnings.push("📏 For depths over 6\", install and compact in 3\" lifts.");
        if (wasteFactor < 10) warnings.push("💡 Millings have high variation; 10-15% waste factor is recommended.");

        setResult({
            tonnage: Math.round(tonnage * 100) / 100,
            tonnageWithWaste: Math.round(tonnageWithWaste * 100) / 100,
            cubicYards: Math.round(cubicYards * 100) / 100,
            squareFeet: Math.round(squareFeet),
            totalCost: Math.round(totalCost),
            truckLoads,
            warnings
        });
    };

    const updateValue = (field: keyof MillingsInputs, delta: number) => {
        setInputs(prev => {
            const val = typeof prev[field] === 'number' ? (prev[field] as number) : 0;
            const newVal = Math.max(0, Math.round((val + delta) * 10) / 10);
            return { ...prev, [field]: newVal };
        });
    };

    return (
        <div className="glass-panel text-slate-900 rounded-[2rem] shadow-xl bg-white/90 backdrop-blur-md border border-[#885C09]/20 p-4 md:p-8 relative overflow-hidden max-w-6xl mx-auto">
            <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-[#9A690F]/20 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 w-full">
                <div className="text-center mb-6">
                    <div className="inline-flex items-center gap-2 mb-2">
                        <span className="p-2 bg-[#9A690F]/10 text-[#885C09] rounded-lg"><Hammer className="w-6 h-6" /></span>
                        <span className="text-xs font-bold tracking-widest text-[#885C09] uppercase">Recycled Asphalt Tool</span>
                    </div>
                    <h1 className="text-3xl font-black text-[#291901] tracking-tight">Asphalt Millings Calculator</h1>
                    <p className="text-xs text-[#885C09] mt-1">Estimate Recycled Asphalt Product (RAP) for Driveways & Paths</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-7 space-y-4">
                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#885C09]/10">
                            <h3 className="font-bold text-[#291901] text-sm uppercase tracking-wide flex items-center gap-2 mb-3">
                                <Ruler className="w-4 h-4 text-[#9A690F]" /> Dimensions
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-[#885C09] uppercase mb-1">Length ({inputs.unitSystem === 'imperial' ? 'ft' : 'm'})</label>
                                    <div className="flex items-center gap-2">
                                        <StepButton onClick={() => updateValue('length', -5)} icon={Minus} />
                                        <input type="number" value={inputs.length} onChange={(e) => setInputs(p => ({ ...p, length: parseFloat(e.target.value) || 0 }))} className="flex-1 px-4 py-2.5 bg-[#ffe0c1]/30 border-0 rounded-xl font-bold text-lg text-[#291901] text-center" />
                                        <StepButton onClick={() => updateValue('length', 5)} icon={Plus} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-[#885C09] uppercase mb-1">Width ({inputs.unitSystem === 'imperial' ? 'ft' : 'm'})</label>
                                    <div className="flex items-center gap-2">
                                        <StepButton onClick={() => updateValue('width', -1)} icon={Minus} />
                                        <input type="number" value={inputs.width} onChange={(e) => setInputs(p => ({ ...p, width: parseFloat(e.target.value) || 0 }))} className="flex-1 px-4 py-2.5 bg-[#ffe0c1]/30 border-0 rounded-xl font-bold text-lg text-[#291901] text-center" />
                                        <StepButton onClick={() => updateValue('width', 1)} icon={Plus} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-[#885C09] uppercase mb-1">Depth ({inputs.unitSystem === 'imperial' ? 'in' : 'cm'})</label>
                                    <div className="flex items-center gap-2">
                                        <StepButton onClick={() => updateValue('depth', -1)} icon={Minus} />
                                        <input type="number" value={inputs.depth} onChange={(e) => setInputs(p => ({ ...p, depth: parseFloat(e.target.value) || 0 }))} className="flex-1 px-4 py-2.5 bg-[#ffe0c1]/30 border-0 rounded-xl font-bold text-lg text-[#291901] text-center" />
                                        <StepButton onClick={() => updateValue('depth', 1)} icon={Plus} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#885C09]/10">
                            <h3 className="font-bold text-[#291901] text-sm uppercase mb-3">Material & Cost</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-[#885C09] mb-1 uppercase">Cost Per Ton ($)</label>
                                    <input type="number" value={inputs.costPerTon} onChange={(e) => setInputs(p => ({ ...p, costPerTon: parseFloat(e.target.value) || 0 }))} className="w-full px-4 py-2.5 bg-[#ffe0c1]/30 border-0 rounded-xl font-bold text-[#291901]" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-[#885C09] mb-1 uppercase">Waste Factor (%)</label>
                                    <input type="number" value={inputs.wasteFactor} onChange={(e) => setInputs(p => ({ ...p, wasteFactor: parseFloat(e.target.value) || 0 }))} className="w-full px-4 py-2.5 bg-[#ffe0c1]/30 border-0 rounded-xl font-bold text-[#291901]" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-5 space-y-4">
                        <div className="bg-gradient-to-br from-[#291901] to-[#885C09] text-white p-6 rounded-3xl shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none"><Truck className="w-48 h-48" /></div>
                            <div className="relative z-10">
                                <p className="text-[#ffe0c1]/70 font-bold uppercase tracking-widest text-xs mb-1">Total Millings Needed</p>
                                {result ? (
                                    <div className="space-y-4">
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-6xl font-black text-white">{result.tonnageWithWaste}</span>
                                            <span className="text-xl font-bold text-[#ffe0c1]/70">tons</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="bg-white/10 p-3 rounded-xl border border-white/20 text-center">
                                                <p className="text-[10px] uppercase font-bold text-[#ffe0c1]/70">Trucks</p>
                                                <p className="text-xl font-black">~{result.truckLoads}</p>
                                            </div>
                                            <div className="bg-white/10 p-3 rounded-xl border border-white/20 text-center">
                                                <p className="text-[10px] uppercase font-bold text-[#ffe0c1]/70">Total Cost</p>
                                                <p className="text-xl font-black">${result.totalCost.toLocaleString()}</p>
                                            </div>
                                        </div>
                                        <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                                            <div className="flex justify-between text-xs mb-1">
                                                <span>Base Tonnage:</span>
                                                <span className="font-bold">{result.tonnage} tons</span>
                                            </div>
                                            <div className="flex justify-between text-xs">
                                                <span>Total Area:</span>
                                                <span className="font-bold">{result.squareFeet.toLocaleString()} sq ft</span>
                                            </div>
                                        </div>
                                    </div>
                                ) : <div className="text-4xl font-bold text-[#ffe0c1]/40">--</div>}

                                {result?.warnings && result.warnings.length > 0 && (
                                    <div className="mt-4 space-y-2">
                                        {result.warnings.map((w, i) => (
                                            <div key={i} className="text-[10px] leading-tight text-amber-200 bg-amber-900/40 p-2 rounded-lg border border-amber-700/50">
                                                {w}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#885C09]/10">
                            <h4 className="font-bold text-[#291901] mb-3 flex items-center gap-2 text-xs uppercase">
                                <CheckCircle2 className="w-4 h-4 text-green-500" /> Working with Millings
                            </h4>
                            <ul className="space-y-2">
                                {[
                                    "Heat activation: Compact on a hot day for better bonding.",
                                    "Use a vibra-plate or steam roller for best results.",
                                    "Dampen slightly before rolling to reduce dust.",
                                    "A thin layer of stone dust helps fill voids."
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-2 text-[11px] text-slate-600">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#9A690F] mt-1 shrink-0"></div>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <div className="text-center mt-6">
                <p className="text-[#885C09] text-sm">
                    Disclaimer: Results are estimates. Material density can vary by recycler.
                    <br />
                    Powered by <a href="https://asphaltcalculatorusa.com" className="text-[#9A690F] font-bold hover:underline" target="_blank" rel="noopener noreferrer">AsphaltCalculatorUSA.com</a>
                </p>
            </div>
        </div>
    );
};

export default AsphaltMillingsCalculator;
