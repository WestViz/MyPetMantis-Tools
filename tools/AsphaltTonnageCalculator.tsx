import React, { useState, useEffect } from 'react';
import {
    Truck,
    Ruler,
    AlertTriangle,
    CheckCircle2,
    Calculator,
    Minus,
    Plus,
    Layers,
    Info,
    Clock,
    TrendingUp
} from 'lucide-react';

// ----------------------------------------------------------------------
// TYPES
// ----------------------------------------------------------------------

type UnitSystem = 'imperial' | 'metric';
type AsphaltType = 'standard' | 'heavy-duty' | 'porous';
type UseCase = 'residential' | 'commercial' | 'heavy-traffic';

export interface AsphaltInputs {
    length: number;
    width: number;
    depth: number;
    unitSystem: UnitSystem;
    asphaltType: AsphaltType;
    useCase: UseCase;
    wasteFactor: number;
    customDensity: number | null;
}

export interface AsphaltResult {
    tonnage: number;
    tonnageWithWaste: number;
    cubicYards: number;
    cubicMeters: number;
    squareFeet: number;
    squareMeters: number;
    estimatedCost: number;
    baseGravelTons: number;
    lifespanYears: number;
    warnings: string[];
    densityUsed: number;
}

// ----------------------------------------------------------------------
// CONSTANTS
// ----------------------------------------------------------------------

// Asphalt density in pounds per cubic yard (standard hot mix)
const ASPHALT_DENSITY_LBS_PER_CY = 2700; // Standard hot mix asphalt (ASTM D2041)
const HEAVY_DUTY_DENSITY_LBS_PER_CY = 2850; // Heavy-duty mix
const POROUS_DENSITY_LBS_PER_CY = 2400; // Porous/pervious asphalt

// Base gravel density
const GRAVEL_DENSITY_LBS_PER_CY = 2700;

// Cost estimates per ton (approximate, varies by region)
const COST_PER_TON_MIN = 100;
const COST_PER_TON_MAX = 150;

// Recommended thickness by use case (inches)
const THICKNESS_RECOMMENDATIONS = {
    residential: { min: 2, recommended: 3, max: 4 },
    commercial: { min: 3, recommended: 4, max: 5 },
    'heavy-traffic': { min: 4, recommended: 5, max: 6 }
};

// ----------------------------------------------------------------------
// HELPER COMPONENTS
// ----------------------------------------------------------------------

const StepButton = ({ onClick, icon: Icon }: { onClick: () => void, icon: any }) => (
    <button
        onClick={onClick}
        className="w-12 h-12 flex items-center justify-center rounded-xl bg-[#ffe0c1] hover:bg-[#9A690F]/20 text-[#885C09] active:scale-95 transition-all touch-manipulation"
    >
        <Icon className="w-6 h-6" />
    </button>
);

const SelectionButton = ({ selected, onClick, label, subLabel }: { selected: boolean, onClick: () => void, label: string, subLabel?: string }) => (
    <button
        onClick={onClick}
        className={`relative p-4 rounded-xl border-2 text-left transition-all duration-200 w-full touch-manipulation
      ${selected
                ? 'border-[#9A690F] bg-[#9A690F]/10 ring-2 ring-[#9A690F]/30 ring-offset-1 z-10'
                : 'border-[#ffe0c1] bg-white hover:bg-[#ffe0c1]/50 text-slate-500'}`}
    >
        <div className={`font-bold ${selected ? 'text-[#291901]' : 'text-slate-700'}`}>{label}</div>
        {subLabel && <div className={`text-xs mt-1 ${selected ? 'text-[#885C09]' : 'text-slate-400'}`}>{subLabel}</div>}
        {selected && <div className="absolute top-2 right-2 text-[#9A690F]"><CheckCircle2 className="w-5 h-5" /></div>}
    </button>
);

const Tooltip = ({ text }: { text: string }) => (
    <div className="group relative inline-block">
        <Info className="w-4 h-4 text-[#9A690F]/60 hover:text-[#9A690F] cursor-help" />
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-64 p-3 bg-[#291901] text-[#ffe0c1] text-xs rounded-lg shadow-xl z-50">
            {text}
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-[#291901]"></div>
        </div>
    </div>
);

// ----------------------------------------------------------------------
// MAIN COMPONENT
// ----------------------------------------------------------------------

const AsphaltTonnageCalculator: React.FC = () => {
    const [inputs, setInputs] = useState<AsphaltInputs>({
        length: 50,
        width: 12,
        depth: 3,
        unitSystem: 'imperial',
        asphaltType: 'standard',
        useCase: 'residential',
        wasteFactor: 5,
        customDensity: null
    });

    const [result, setResult] = useState<AsphaltResult | null>(null);

    useEffect(() => {
        calculateTonnage();
    }, [inputs]);

    const calculateTonnage = () => {
        const { length, width, depth, unitSystem, asphaltType, useCase, wasteFactor, customDensity } = inputs;

        // Convert to feet and inches for calculation
        let lengthFt = length;
        let widthFt = width;
        let depthInches = depth;

        if (unitSystem === 'metric') {
            lengthFt = length * 3.28084;
            widthFt = width * 3.28084;
            depthInches = depth * 0.393701;
        }

        // Calculate volume in cubic feet
        const volumeCubicFeet = lengthFt * widthFt * (depthInches / 12);

        // Convert to cubic yards (27 cubic feet = 1 cubic yard)
        const cubicYards = volumeCubicFeet / 27;

        // Convert to cubic meters
        const cubicMeters = cubicYards * 0.764555;

        // Select density based on asphalt type or custom
        let density = customDensity || ASPHALT_DENSITY_LBS_PER_CY;
        if (!customDensity) {
            if (asphaltType === 'heavy-duty') density = HEAVY_DUTY_DENSITY_LBS_PER_CY;
            if (asphaltType === 'porous') density = POROUS_DENSITY_LBS_PER_CY;
        }

        // Calculate tonnage (2000 lbs = 1 ton)
        const tonnage = (cubicYards * density) / 2000;
        const tonnageWithWaste = tonnage * (1 + wasteFactor / 100);

        // Calculate area
        const squareFeet = lengthFt * widthFt;
        const squareMeters = squareFeet * 0.092903;

        // Estimate cost
        const avgCost = (COST_PER_TON_MIN + COST_PER_TON_MAX) / 2;
        const estimatedCost = tonnageWithWaste * avgCost;

        // Calculate base gravel (typically 4-6 inches, using 4 inches)
        const baseDepthInches = 4;
        const baseVolumeCubicFeet = lengthFt * widthFt * (baseDepthInches / 12);
        const baseCubicYards = baseVolumeCubicFeet / 27;
        const baseGravelTons = (baseCubicYards * GRAVEL_DENSITY_LBS_PER_CY) / 2000;

        // Estimate lifespan based on thickness and use case
        let lifespanYears = 15; // Base lifespan
        if (depthInches >= 4) lifespanYears += 5;
        if (depthInches >= 5) lifespanYears += 5;
        if (useCase === 'residential') lifespanYears += 5;
        if (useCase === 'heavy-traffic') lifespanYears -= 5;

        // Generate warnings
        const warnings: string[] = [];
        const recommended = THICKNESS_RECOMMENDATIONS[useCase];

        if (depthInches < recommended.min) {
            warnings.push(`⚠️ Thickness below ${recommended.min}" minimum for ${useCase} use. Risk of premature failure.`);
        }

        if (depthInches < recommended.recommended) {
            warnings.push(`💡 Recommended thickness for ${useCase}: ${recommended.recommended}" (current: ${depthInches.toFixed(1)}")`);
        }

        if (depthInches > 6) {
            warnings.push("📏 Depth over 6 inches is unusually thick. Verify your measurements.");
        }

        if (tonnageWithWaste > 50) {
            warnings.push("🚛 Large project detected. Consider ordering in multiple deliveries for better workability.");
        }

        if (asphaltType === 'porous') {
            warnings.push("🌧️ Porous asphalt requires proper drainage substrate and specialized installation per ASTM D7064.");
        }

        if (wasteFactor < 5) {
            warnings.push("⚠️ Low waste factor may result in material shortage. Industry standard is 5-10%.");
        }

        // Common mistakes
        if (depthInches < 2) {
            warnings.push("❌ CRITICAL: Base preparation must include proper compaction. Minimum 4\" gravel base required (DOT standards).");
        }

        setResult({
            tonnage: Math.round(tonnage * 100) / 100,
            tonnageWithWaste: Math.round(tonnageWithWaste * 100) / 100,
            cubicYards: Math.round(cubicYards * 100) / 100,
            cubicMeters: Math.round(cubicMeters * 100) / 100,
            squareFeet: Math.round(squareFeet),
            squareMeters: Math.round(squareMeters * 10) / 10,
            estimatedCost: Math.round(estimatedCost),
            baseGravelTons: Math.round(baseGravelTons * 100) / 100,
            lifespanYears,
            warnings,
            densityUsed: density
        });
    };

    const updateDimension = (field: 'length' | 'width' | 'depth', delta: number) => {
        setInputs(prev => {
            const newVal = Math.round((prev[field] + delta) * 10) / 10;
            if (newVal < 0.1) return prev;
            return { ...prev, [field]: newVal };
        });
    };

    const handleInputChange = (field: 'length' | 'width' | 'depth', val: string) => {
        const num = parseFloat(val);
        if (isNaN(num)) return;
        setInputs(prev => ({ ...prev, [field]: num }));
    };

    const toggleUnit = () => {
        setInputs(prev => {
            const newSystem = prev.unitSystem === 'imperial' ? 'metric' : 'imperial';

            let newLength, newWidth, newDepth;

            if (prev.unitSystem === 'imperial') {
                newLength = Math.round(prev.length * 0.3048 * 10) / 10;
                newWidth = Math.round(prev.width * 0.3048 * 10) / 10;
                newDepth = Math.round(prev.depth * 2.54 * 10) / 10;
            } else {
                newLength = Math.round(prev.length * 3.28084 * 10) / 10;
                newWidth = Math.round(prev.width * 3.28084 * 10) / 10;
                newDepth = Math.round(prev.depth * 0.393701 * 10) / 10;
            }

            return {
                ...prev,
                unitSystem: newSystem,
                length: newLength,
                width: newWidth,
                depth: newDepth
            };
        });
    };

    const lengthLabel = inputs.unitSystem === 'imperial' ? 'ft' : 'm';
    const widthLabel = inputs.unitSystem === 'imperial' ? 'ft' : 'm';
    const depthLabel = inputs.unitSystem === 'imperial' ? 'in' : 'cm';

    const recommendedThickness = THICKNESS_RECOMMENDATIONS[inputs.useCase];

    return (
        <div className="glass-panel text-slate-900 rounded-[2rem] shadow-xl bg-white/90 backdrop-blur-md border border-[#885C09]/20 p-4 md:p-8 relative overflow-hidden max-w-6xl mx-auto">

            {/* Background Decor */}
            <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-[#9A690F]/20 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 w-full">
                {/* Header */}
                <div className="text-center mb-6">
                    <div className="inline-flex items-center gap-2 mb-2">
                        <span className="p-2 bg-[#9A690F]/10 text-[#885C09] rounded-lg"><Truck className="w-6 h-6" /></span>
                        <span className="text-xs font-bold tracking-widest text-[#885C09] uppercase">Professional Asphalt Tools</span>
                    </div>
                    <h1 className="text-3xl font-black text-[#291901] tracking-tight">Asphalt Tonnage Calculator</h1>
                    <p className="text-xs text-[#885C09] mt-1">Compliant with ASTM D2041 & DOT Standards</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* === LEFT COLUMN: INPUTS === */}
                    <div className="lg:col-span-7 space-y-4">

                        {/* CARD 1: USE CASE */}
                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#885C09]/10">
                            <div className="flex items-center gap-2 mb-3">
                                <h3 className="font-bold text-[#291901] text-sm uppercase tracking-wide flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-[#9A690F]" /> Project Type
                                </h3>
                                <Tooltip text="Select your project type to get recommended thickness and lifespan estimates based on industry standards." />
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <SelectionButton
                                    selected={inputs.useCase === 'residential'}
                                    onClick={() => setInputs(p => ({ ...p, useCase: 'residential' }))}
                                    label="Residential"
                                    subLabel={`${recommendedThickness.recommended}" thick`}
                                />
                                <SelectionButton
                                    selected={inputs.useCase === 'commercial'}
                                    onClick={() => setInputs(p => ({ ...p, useCase: 'commercial' }))}
                                    label="Commercial"
                                    subLabel={`${THICKNESS_RECOMMENDATIONS.commercial.recommended}" thick`}
                                />
                                <SelectionButton
                                    selected={inputs.useCase === 'heavy-traffic'}
                                    onClick={() => setInputs(p => ({ ...p, useCase: 'heavy-traffic' }))}
                                    label="Heavy Traffic"
                                    subLabel={`${THICKNESS_RECOMMENDATIONS['heavy-traffic'].recommended}" thick`}
                                />
                            </div>
                        </div>

                        {/* CARD 2: DIMENSIONS */}
                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#885C09]/10">
                            <div className="flex justify-between items-center mb-3">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-bold text-[#291901] text-sm uppercase tracking-wide flex items-center gap-2">
                                        <Ruler className="w-4 h-4 text-[#9A690F]" /> Dimensions
                                    </h3>
                                </div>
                                <button onClick={toggleUnit} className="text-xs font-bold bg-[#ffe0c1] hover:bg-[#9A690F]/20 text-[#885C09] px-3 py-1 rounded-full transition-colors">
                                    Switch to {inputs.unitSystem === 'imperial' ? 'Metric' : 'Imperial'}
                                </button>
                            </div>

                            <div className="space-y-3">
                                {/* Length */}
                                <div className="space-y-1">
                                    <label className="block text-xs font-bold text-[#885C09] uppercase tracking-wider">Length</label>
                                    <div className="flex items-center gap-2">
                                        <StepButton onClick={() => updateDimension('length', -1)} icon={Minus} />
                                        <div className="relative flex-1">
                                            <input
                                                type="number"
                                                value={inputs.length}
                                                onChange={(e) => handleInputChange('length', e.target.value)}
                                                className="w-full pl-4 pr-12 py-2.5 bg-[#ffe0c1]/30 border-0 rounded-xl font-bold text-lg text-[#291901] ring-1 ring-[#885C09]/20 focus:ring-2 focus:ring-[#9A690F] transition-all text-center"
                                            />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#885C09] font-bold text-sm">
                                                {lengthLabel}
                                            </span>
                                        </div>
                                        <StepButton onClick={() => updateDimension('length', 1)} icon={Plus} />
                                    </div>
                                </div>

                                {/* Width */}
                                <div className="space-y-1">
                                    <label className="block text-xs font-bold text-[#885C09] uppercase tracking-wider">Width</label>
                                    <div className="flex items-center gap-2">
                                        <StepButton onClick={() => updateDimension('width', -1)} icon={Minus} />
                                        <div className="relative flex-1">
                                            <input
                                                type="number"
                                                value={inputs.width}
                                                onChange={(e) => handleInputChange('width', e.target.value)}
                                                className="w-full pl-4 pr-12 py-2.5 bg-[#ffe0c1]/30 border-0 rounded-xl font-bold text-lg text-[#291901] ring-1 ring-[#885C09]/20 focus:ring-2 focus:ring-[#9A690F] transition-all text-center"
                                            />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#885C09] font-bold text-sm">
                                                {widthLabel}
                                            </span>
                                        </div>
                                        <StepButton onClick={() => updateDimension('width', 1)} icon={Plus} />
                                    </div>
                                </div>

                                {/* Depth */}
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <label className="block text-xs font-bold text-[#885C09] uppercase tracking-wider">Depth/Thickness</label>
                                        <Tooltip text={`Recommended: ${recommendedThickness.recommended}" for ${inputs.useCase} use. Minimum: ${recommendedThickness.min}", Maximum: ${recommendedThickness.max}"`} />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <StepButton onClick={() => updateDimension('depth', -0.5)} icon={Minus} />
                                        <div className="relative flex-1">
                                            <input
                                                type="number"
                                                value={inputs.depth}
                                                onChange={(e) => handleInputChange('depth', e.target.value)}
                                                className="w-full pl-4 pr-12 py-2.5 bg-[#ffe0c1]/30 border-0 rounded-xl font-bold text-lg text-[#291901] ring-1 ring-[#885C09]/20 focus:ring-2 focus:ring-[#9A690F] transition-all text-center"
                                            />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#885C09] font-bold text-sm">
                                                {depthLabel}
                                            </span>
                                        </div>
                                        <StepButton onClick={() => updateDimension('depth', 0.5)} icon={Plus} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* CARD 3: ASPHALT TYPE & DENSITY */}
                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#885C09]/10">
                            <div className="flex items-center gap-2 mb-3">
                                <h3 className="font-bold text-[#291901] text-sm uppercase tracking-wide flex items-center gap-2">
                                    <Layers className="w-4 h-4 text-[#9A690F]" /> Mix Type & Density
                                </h3>
                                <Tooltip text="Standard: 2700 lbs/yd³ (ASTM D2041). Heavy-Duty: 2850 lbs/yd³. Porous: 2400 lbs/yd³. Override for regional variations." />
                            </div>
                            <div className="grid grid-cols-3 gap-2 mb-3">
                                <SelectionButton
                                    selected={inputs.asphaltType === 'standard'}
                                    onClick={() => setInputs(p => ({ ...p, asphaltType: 'standard', customDensity: null }))}
                                    label="Standard"
                                    subLabel="2700 lbs/yd³"
                                />
                                <SelectionButton
                                    selected={inputs.asphaltType === 'heavy-duty'}
                                    onClick={() => setInputs(p => ({ ...p, asphaltType: 'heavy-duty', customDensity: null }))}
                                    label="Heavy-Duty"
                                    subLabel="2850 lbs/yd³"
                                />
                                <SelectionButton
                                    selected={inputs.asphaltType === 'porous'}
                                    onClick={() => setInputs(p => ({ ...p, asphaltType: 'porous', customDensity: null }))}
                                    label="Porous"
                                    subLabel="2400 lbs/yd³"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="block text-xs font-bold text-[#885C09] uppercase tracking-wider">Custom Density (optional)</label>
                                <input
                                    type="number"
                                    placeholder="e.g., 2750"
                                    value={inputs.customDensity || ''}
                                    onChange={(e) => setInputs(p => ({ ...p, customDensity: e.target.value ? parseFloat(e.target.value) : null }))}
                                    className="w-full px-4 py-2 bg-[#ffe0c1]/30 border-0 rounded-xl font-bold text-sm text-[#291901] ring-1 ring-[#885C09]/20 focus:ring-2 focus:ring-[#9A690F] transition-all"
                                />
                            </div>
                        </div>

                        {/* CARD 4: WASTE FACTOR */}
                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#885C09]/10">
                            <div className="flex items-center gap-2 mb-3">
                                <h3 className="font-bold text-[#291901] text-sm uppercase tracking-wide flex items-center gap-2">
                                    <Calculator className="w-4 h-4 text-[#9A690F]" /> Waste Factor
                                </h3>
                                <Tooltip text="Industry standard: 5-10%. Accounts for spillage, compaction loss, and irregular edges. Higher for complex shapes." />
                            </div>
                            <div className="flex items-center gap-4">
                                <input
                                    type="range"
                                    min="0"
                                    max="15"
                                    step="1"
                                    value={inputs.wasteFactor}
                                    onChange={(e) => setInputs(p => ({ ...p, wasteFactor: parseFloat(e.target.value) }))}
                                    className="flex-1 h-2 bg-[#ffe0c1] rounded-lg appearance-none cursor-pointer accent-[#9A690F]"
                                />
                                <div className="text-2xl font-black text-[#291901] min-w-[60px] text-center">
                                    {inputs.wasteFactor}%
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* === RIGHT COLUMN: RESULTS === */}
                    <div className="lg:col-span-5 space-y-4">

                        {/* Primary Result Card */}
                        <div className="bg-gradient-to-br from-[#291901] to-[#885C09] text-white p-5 rounded-3xl shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                                <Truck className="w-48 h-48" />
                            </div>

                            <div className="relative z-10">
                                {/* Main Tonnage Result */}
                                <div className="mb-3">
                                    <p className="text-[#ffe0c1]/70 font-bold uppercase tracking-widest text-xs mb-1">Required Tonnage (with {inputs.wasteFactor}% waste)</p>
                                    {result ? (
                                        <div className="flex items-baseline gap-3">
                                            <span className="text-6xl font-black tracking-tight text-white drop-shadow-lg">
                                                {result.tonnageWithWaste}
                                            </span>
                                            <span className="text-xl font-bold text-white/80">
                                                tons
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="text-4xl font-bold text-[#ffe0c1]/40">--</div>
                                    )}
                                    {result && (
                                        <p className="text-[#ffe0c1]/60 text-xs mt-1">
                                            Base: {result.tonnage} tons | Density: {result.densityUsed} lbs/yd³
                                        </p>
                                    )}
                                </div>

                                {result && (
                                    <>
                                        {/* Secondary Metrics */}
                                        <div className="grid grid-cols-3 gap-2 mb-3">
                                            <div className="bg-white/10 backdrop-blur-sm p-2.5 rounded-xl border border-white/20">
                                                <p className="text-[9px] text-[#ffe0c1]/70 uppercase font-bold mb-0.5">Volume</p>
                                                <div className="text-base font-black text-white">
                                                    {result.cubicYards}
                                                    <span className="text-xs font-normal text-white/70 ml-1">yd³</span>
                                                </div>
                                            </div>

                                            <div className="bg-white/10 backdrop-blur-sm p-2.5 rounded-xl border border-white/20">
                                                <p className="text-[9px] text-[#ffe0c1]/70 uppercase font-bold mb-0.5">Area</p>
                                                <div className="text-base font-black text-white">
                                                    {inputs.unitSystem === 'imperial' ? result.squareFeet.toLocaleString() : result.squareMeters}
                                                    <span className="text-xs font-normal text-white/70 ml-1">
                                                        {inputs.unitSystem === 'imperial' ? 'ft²' : 'm²'}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="bg-white/10 backdrop-blur-sm p-2.5 rounded-xl border border-white/20">
                                                <p className="text-[9px] text-[#ffe0c1]/70 uppercase font-bold mb-0.5">Est. Cost</p>
                                                <div className="text-base font-black text-white">
                                                    ${(result.estimatedCost / 1000).toFixed(1)}k
                                                </div>
                                            </div>
                                        </div>

                                        {/* Additional Info */}
                                        <div className="grid grid-cols-2 gap-2 mb-3">
                                            <div className="bg-white/5 p-2.5 rounded-xl border border-white/10">
                                                <p className="text-[9px] text-[#ffe0c1]/70 uppercase font-bold mb-0.5 flex items-center gap-1">
                                                    <Layers className="w-3 h-3" /> Base Gravel
                                                </p>
                                                <div className="text-sm font-bold text-white">
                                                    {result.baseGravelTons} tons
                                                    <span className="text-xs font-normal text-white/60 ml-1">(4" depth)</span>
                                                </div>
                                            </div>

                                            <div className="bg-white/5 p-2.5 rounded-xl border border-white/10">
                                                <p className="text-[9px] text-[#ffe0c1]/70 uppercase font-bold mb-0.5 flex items-center gap-1">
                                                    <Clock className="w-3 h-3" /> Est. Lifespan
                                                </p>
                                                <div className="text-sm font-bold text-white">
                                                    {result.lifespanYears} years
                                                    <span className="text-xs font-normal text-white/60 ml-1">typical</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Warnings */}
                                        {result.warnings.length > 0 && (
                                            <div className="space-y-1.5">
                                                {result.warnings.map((w, i) => (
                                                    <div key={i} className="flex gap-2 text-xs text-amber-200 bg-amber-900/40 p-2 rounded-lg border border-amber-700/50">
                                                        <span className="leading-snug">{w}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Best Practices */}
                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#885C09]/10">
                            <h4 className="font-bold text-[#291901] mb-2 flex items-center gap-2 text-xs uppercase tracking-wide">
                                <CheckCircle2 className="w-4 h-4 text-green-500" /> Installation Best Practices
                            </h4>
                            <ul className="space-y-1.5">
                                {[
                                    "Compact gravel base to 95% density (DOT spec).",
                                    "Lay asphalt at 275-300°F for proper bonding.",
                                    "Compact within 5-10 min before cooling.",
                                    "Allow 24-48 hrs cure before heavy traffic.",
                                    "Seal coat after 6-12 months for longevity."
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#9A690F] mt-1"></div>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                    </div>
                </div>
            </div>

            {/* Website Link */}
            <div className="text-center mt-6">
                <p className="text-[#885C09] text-sm">
                    Disclaimer: Always consult with a licensed contractor or engineer for precise project planning. Results are for informational purposes only.
                    <br></br>
                    Powered by <a href="https://asphaltcalculatorusa.com" className="text-[#9A690F] font-bold hover:underline" target="_blank" rel="noopener noreferrer">AsphaltCalculatorUSA.com</a>
                </p>
            </div>
        </div>
    );
};

export default AsphaltTonnageCalculator;
