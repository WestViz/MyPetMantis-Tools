import React, { useState, useEffect } from 'react';
import { useIframeResize } from '../hooks/useIframeResize';
import {
    Sun,
    Wind,
    Thermometer,
    Waves,
    Ruler,
    Droplets,
    ArrowRight,
    CloudRain,
    CheckCircle2,
    Minus,
    Plus
} from 'lucide-react';

// ----------------------------------------------------------------------
// TYPES
// ----------------------------------------------------------------------

type UnitSystem = 'imperial' | 'metric';
type WindLevel = 'calm' | 'breezy' | 'windy';
type PoolShape = 'rectangular' | 'round' | 'custom';
type CoverStatus = 'uncovered' | 'covered';

export interface EvaporationInputs {
    unitSystem: UnitSystem;

    shape: PoolShape;
    length: number; // or diameter
    width: number;
    surfaceArea: number; // calculated manually if custom
    waterTemp: number; // F or C
    airTemp: number;   // F or C
    humidity: number;  // %
    windCondition: WindLevel;
    usageHours: number; // Hours per day uncovered/active
    isCoveredAtNight: boolean;
}

export interface EvaporationResult {
    dailyLossGallons: number;
    dailyLossLiters: number;
    dailyDropInches: number;
    weeklyLossGallons: number;
    weeklyLossLiters: number;
    weeklyDropInches: number;
    costEstimate: number; // Optional simplified cost
    severity: 'low' | 'moderate' | 'high' | 'critical';
}

// ----------------------------------------------------------------------
// CONSTANTS & HELPERS
// ----------------------------------------------------------------------

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
                ? 'border-cyan-500 bg-cyan-50/50 ring-2 ring-cyan-200 ring-offset-1 z-10'
                : 'border-slate-100 bg-slate-50 hover:bg-slate-100 text-slate-500'}`}
    >
        <div className="flex items-center gap-2 mb-1">
            {Icon && <Icon className={`w-4 h-4 ${selected ? 'text-cyan-600' : 'text-slate-400'}`} />}
            <div className={`font-bold text-sm md:text-base ${selected ? 'text-cyan-900' : 'text-slate-700'}`}>{label}</div>
        </div>
        {subLabel && <div className={`text-xs ${selected ? 'text-cyan-700' : 'text-slate-400'}`}>{subLabel}</div>}
        {selected && <div className="absolute top-2 right-2 text-cyan-500"><CheckCircle2 className="w-4 h-4" /></div>}
    </button>
);

// ----------------------------------------------------------------------
// MAIN COMPONENT
// ----------------------------------------------------------------------

const EvaporationCalculator: React.FC = () => {
    useIframeResize();
    const [inputs, setInputs] = useState<EvaporationInputs>({
        unitSystem: 'imperial',
        shape: 'rectangular',
        length: 30,
        width: 15,
        surfaceArea: 450,
        waterTemp: 80,
        airTemp: 85,
        humidity: 50,
        windCondition: 'calm',
        usageHours: 24, // Assuming uncovered 24h by default for worst case
        isCoveredAtNight: false
    });

    const [result, setResult] = useState<EvaporationResult | null>(null);

    // Auto-calculate surface area when dims change

    useEffect(() => {
        let area = 0;
        if (inputs.shape === 'rectangular') {
            area = inputs.length * inputs.width;
        } else if (inputs.shape === 'round') {
            // inputs.length acts as diameter
            const radius = inputs.length / 2;
            area = Math.PI * radius * radius;
        }
        // Only update if shape is not custom (where user sets area manually)
        if (inputs.shape !== 'custom') {
            setInputs(prev => ({ ...prev, surfaceArea: Math.round(area) }));
        }
    }, [inputs.length, inputs.width, inputs.shape]);

    useEffect(() => {
        calculateEvaporation();
    }, [inputs]);

    const calculateEvaporation = () => {
        // Simplified ASHRAE formula adaptation for pools
        // Evap (Gallons/hr) = (0.048 * Area * (Pw - Pa) * (0.089 + 0.0782 * V)) * ActivityFactor ??
        // Using a more standard pool industry heuristic:
        // Rate ~ 0.1 to 0.5 inches per week is normal.
        // Let's use a physics-based approximation.

        // 1. Convert everything to freedom units (Imperial) for calculation standard
        const tempWaterF = inputs.unitSystem === 'metric' ? (inputs.waterTemp * 9 / 5) + 32 : inputs.waterTemp;
        const tempAirF = inputs.unitSystem === 'metric' ? (inputs.airTemp * 9 / 5) + 32 : inputs.airTemp;

        // 2. Saturation Vapor Pressures (in inches of Mercury inHg)
        // Antoine Equation approx
        const getSatVaporPressure = (tempF: number) => {
            // Approximation for T in Fahrenheit
            const tempC = (tempF - 32) * 5 / 9;
            return 0.6108 * Math.exp((17.27 * tempC) / (tempC + 237.3)) * 0.02953; // to inHg
        };

        const Pw = getSatVaporPressure(tempWaterF);
        const Pa = getSatVaporPressure(tempAirF) * (inputs.humidity / 100);

        // 3. Wind Velocity Factor (mph)
        // calm ~ 1mph, breeze ~ 5mph, windy ~ 10mph
        let windSpeed = 1;
        if (inputs.windCondition === 'breezy') windSpeed = 5;
        if (inputs.windCondition === 'windy') windSpeed = 10;

        // 4. Evaporation Rate Calculation (Gallons per Hour per SqFt is usually the raw physics output, but simplified:)
        // E = (0.097 + 0.038 * V) * (Pw - Pa)   <-- classic Box formula variant for lbs/sqft/hr
        // Let's use:
        // Rate (lbs/hr/ft2) = (0.05 + 0.04 * V) * (Pw - Pa) (Approximation)
        const evaporationMassRate = Math.max(0, (0.09 + 0.05 * windSpeed) * (Pw - Pa)); // lbs / hr / sqft

        // Total lbs per hour
        let hourlyLossLbs = evaporationMassRate * inputs.surfaceArea;

        // Adjust for cover
        if (inputs.isCoveredAtNight) {
            // Assume 12 hours covered -> 90% reduction during night
            // Rough calc: average rate * 12 + (average rate * 0.1 * 12)
            hourlyLossLbs = (hourlyLossLbs * 12 + hourlyLossLbs * 0.1 * 12) / 24;
        }

        // Convert to Gallons (8.34 lbs/gal)
        const dailyLossGallons = (hourlyLossLbs * 24) / 8.34;

        // Calculate inch drop:
        // Volume = Area * Drop
        // Drop (ft) = Volume (ft3) / Area
        // Gal to ft3 = Gal / 7.48
        const dailyVolumeFt3 = dailyLossGallons / 7.48;
        const dailyDropFt = dailyVolumeFt3 / inputs.surfaceArea;
        const dailyDropInches = dailyDropFt * 12;

        const weeklyLossGallons = dailyLossGallons * 7;
        const weeklyDropInches = dailyDropInches * 7;

        // Severity
        let severity: EvaporationResult['severity'] = 'low';
        if (weeklyDropInches > 0.5) severity = 'moderate';
        if (weeklyDropInches > 1.5) severity = 'high';
        if (weeklyDropInches > 2.5) severity = 'critical';

        // Metric Conversion
        const dailyLossLiters = dailyLossGallons * 3.78541;
        const weeklyLossLiters = weeklyLossGallons * 3.78541;

        setResult({
            dailyLossGallons: Math.round(dailyLossGallons * 10) / 10,
            dailyLossLiters: Math.round(dailyLossLiters * 10) / 10,
            dailyDropInches: Math.round(dailyDropInches * 100) / 100,
            weeklyLossGallons: Math.round(weeklyLossGallons),
            weeklyLossLiters: Math.round(weeklyLossLiters),
            weeklyDropInches: Math.round(weeklyDropInches * 100) / 100,
            costEstimate: weeklyLossGallons * 0.005, // rough assumed water cost
            severity
        });
    };

    const handleInputUpdate = (key: keyof EvaporationInputs, value: any) => {
        setInputs(prev => ({ ...prev, [key]: value }));
    };

    const toggleUnit = () => {
        setInputs(prev => {
            const isImp = prev.unitSystem === 'imperial';
            return {
                ...prev,
                unitSystem: isImp ? 'metric' : 'imperial',
                // Auto convert standard values roughly for UX
                length: isImp ? Math.round(prev.length * 0.3048) : Math.round(prev.length * 3.28084),
                width: isImp ? Math.round(prev.width * 0.3048) : Math.round(prev.width * 3.28084),
                waterTemp: isImp ? Math.round((prev.waterTemp - 32) * 5 / 9) : Math.round((prev.waterTemp * 9 / 5) + 32),
                airTemp: isImp ? Math.round((prev.airTemp - 32) * 5 / 9) : Math.round((prev.airTemp * 9 / 5) + 32),
            };
        });
    };

    return (
        <div className="glass-panel text-slate-900 rounded-[2rem] shadow-xl bg-white/90 backdrop-blur-md border border-slate-200 p-4 md:p-8 relative overflow-hidden max-w-5xl mx-auto">

            {/* Background Decor */}
            <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-orange-400/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 w-full">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 mb-2">
                        <span className="p-2 bg-orange-100 text-orange-700 rounded-lg"><Sun className="w-6 h-6" /></span>
                        <span className="text-xs font-bold tracking-widest text-slate-400 uppercase">Pool Tools</span>
                    </div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Evaporation Calculator</h1>
                    <p className="text-slate-500 text-sm mt-2 max-w-md mx-auto">Estimate water loss based on local weather conditions and pool specs.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* === LEFT COLUMN: INPUTS === */}
                    <div className="lg:col-span-7 space-y-6">

                        {/* CARD 1: POOL DIMENSIONS */}
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-slate-700 flex items-center gap-2">
                                    <Ruler className="w-5 h-5 text-blue-500" /> Pool Size
                                </h3>
                                <button onClick={toggleUnit} className="text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1 rounded-full transition-colors">
                                    Scale: {inputs.unitSystem === 'imperial' ? 'Ft / °F' : 'M / °C'}
                                </button>
                            </div>

                            {/* Shape Selector */}
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <SelectionButton
                                    label="Rectangle"
                                    selected={inputs.shape === 'rectangular'}
                                    onClick={() => handleInputUpdate('shape', 'rectangular')}
                                />
                                <SelectionButton
                                    label="Round"
                                    selected={inputs.shape === 'round'}
                                    onClick={() => handleInputUpdate('shape', 'round')}
                                />
                            </div>

                            {/* Dimensions Inputs */}
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
                                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-normal pointer-events-none">{inputs.unitSystem === 'imperial' ? 'ft' : 'm'}</span>
                                        </div>
                                        <StepButton onClick={() => handleInputUpdate('length', inputs.length + 1)} icon={Plus} />
                                    </div>
                                </div>

                                {inputs.shape === 'rectangular' && (
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
                                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-normal pointer-events-none">{inputs.unitSystem === 'imperial' ? 'ft' : 'm'}</span>
                                            </div>
                                            <StepButton onClick={() => handleInputUpdate('width', inputs.width + 1)} icon={Plus} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* CARD 2: WEATHER CONDITIONS */}
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                            <h3 className="font-bold text-slate-700 flex items-center gap-2 mb-6">
                                <Thermometer className="w-5 h-5 text-orange-500" /> Weather & Conditions
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-6">
                                {/* Water Temp */}
                                <div className="space-y-3">
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Water Temp</label>
                                    <div className="flex items-center justify-between gap-3">
                                        <StepButton onClick={() => handleInputUpdate('waterTemp', inputs.waterTemp - 1)} icon={Minus} />
                                        <div className="bg-blue-50 flex-1 py-1 rounded-xl border border-blue-100 flex items-center justify-center relative">
                                            <input
                                                type="number"
                                                value={inputs.waterTemp}
                                                onChange={(e) => handleInputUpdate('waterTemp', parseFloat(e.target.value) || 0)}
                                                className="w-full bg-transparent text-center font-black text-xl text-blue-900 border-none focus:ring-0 p-1"
                                            />
                                            <span className="absolute right-4 text-blue-300 font-bold pointer-events-none">°</span>
                                        </div>
                                        <StepButton onClick={() => handleInputUpdate('waterTemp', inputs.waterTemp + 1)} icon={Plus} />
                                    </div>
                                </div>

                                {/* Air Temp */}
                                <div className="space-y-3">
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Air Temp</label>
                                    <div className="flex items-center justify-between gap-3">
                                        <StepButton onClick={() => handleInputUpdate('airTemp', inputs.airTemp - 1)} icon={Minus} />
                                        <div className="bg-orange-50 flex-1 py-1 rounded-xl border border-orange-100 flex items-center justify-center relative">
                                            <input
                                                type="number"
                                                value={inputs.airTemp}
                                                onChange={(e) => handleInputUpdate('airTemp', parseFloat(e.target.value) || 0)}
                                                className="w-full bg-transparent text-center font-black text-xl text-orange-900 border-none focus:ring-0 p-1"
                                            />
                                            <span className="absolute right-4 text-orange-300 font-bold pointer-events-none">°</span>
                                        </div>
                                        <StepButton onClick={() => handleInputUpdate('airTemp', inputs.airTemp + 1)} icon={Plus} />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {/* Humidity Slider */}
                                <div>
                                    <div className="flex justify-between text-xs font-bold text-slate-400 uppercase mb-2">
                                        <span>Humidity</span>
                                        <span>{inputs.humidity}%</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0" max="100"
                                        value={inputs.humidity}
                                        onChange={(e) => handleInputUpdate('humidity', parseInt(e.target.value))}
                                        className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                                    />
                                    <div className="flex justify-between text-[10px] text-slate-300 mt-1">
                                        <span>Dry (Desert)</span>
                                        <span>Muggy (Swamp)</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* CARD 3: WIND & COVER */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
                                <h3 className="font-bold text-slate-700 flex items-center gap-2 mb-3 text-sm uppercase">
                                    <Wind className="w-4 h-4" /> Wind
                                </h3>
                                <div className="flex flex-col gap-2 flex-1">
                                    {(['calm', 'breezy', 'windy'] as WindLevel[]).map(level => (
                                        <button
                                            key={level}
                                            onClick={() => handleInputUpdate('windCondition', level)}
                                            className={`py-2 px-3 rounded-lg text-sm font-bold text-left transition-colors border ${inputs.windCondition === level ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}
                                        >
                                            {level.charAt(0).toUpperCase() + level.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
                                <h3 className="font-bold text-slate-700 flex items-center gap-2 mb-3 text-sm uppercase">
                                    <CloudRain className="w-4 h-4" /> Night Cover?
                                </h3>
                                <div className="flex flex-col gap-2 flex-1">
                                    <button
                                        onClick={() => handleInputUpdate('isCoveredAtNight', false)}
                                        className={`py-2 px-3 rounded-lg text-sm font-bold text-left transition-colors border ${!inputs.isCoveredAtNight ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}
                                    >
                                        No, Always Open
                                    </button>
                                    <button
                                        onClick={() => handleInputUpdate('isCoveredAtNight', true)}
                                        className={`py-2 px-3 rounded-lg text-sm font-bold text-left transition-colors border ${inputs.isCoveredAtNight ? 'bg-cyan-600 text-white border-cyan-600' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}
                                    >
                                        Yes, Covered at Night
                                    </button>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* === RIGHT COLUMN: RESULTS === */}
                    <div className="lg:col-span-5 space-y-6">

                        {/* Primary Result Card */}
                        <div className={`text-white p-5 md:p-8 rounded-3xl shadow-2xl relative overflow-hidden h-full flex flex-col justify-center transition-colors duration-500
              ${result?.severity === 'critical' ? 'bg-red-900' : result?.severity === 'high' ? 'bg-orange-800' : 'bg-slate-900'}`}>

                            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                                <Sun className="w-64 h-64" />
                            </div>

                            <div className="relative z-10">
                                <div className="mb-6">
                                    <p className="text-white/60 font-bold uppercase tracking-widest text-[10px] md:text-xs mb-1">Estimated Weekly Loss</p>
                                    {result ? (
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <ArrowRight className="w-8 h-8 text-white/40" />
                                                <span className="text-5xl md:text-6xl font-black tracking-tighter text-white">
                                                    {inputs.unitSystem === 'imperial' ? result.weeklyDropInches : (result.weeklyDropInches * 2.54).toFixed(1)}
                                                </span>
                                                <span className="text-lg md:text-xl font-bold text-white/60">
                                                    {inputs.unitSystem === 'imperial' ? 'inches' : 'cm'}
                                                </span>
                                            </div>
                                            <p className="text-white/50 text-xs md:text-sm font-medium pl-1">
                                                Water level drop per week
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="text-4xl font-bold text-slate-600">--</div>
                                    )}
                                </div>

                                {result && (
                                    <div className="space-y-4">
                                        <div className="h-px bg-white/10 w-full mb-4 md:mb-6"></div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-black/20 p-4 rounded-xl border border-white/5 backdrop-blur-sm">
                                                <p className="text-[10px] text-white/60 uppercase font-bold mb-1">Weekly Volume</p>
                                                <div className="text-xl font-bold">
                                                    {inputs.unitSystem === 'imperial' ? result.weeklyLossGallons.toLocaleString() : result.weeklyLossLiters.toLocaleString()}
                                                    <span className="text-sm font-normal text-white/60 ml-1">
                                                        {inputs.unitSystem === 'imperial' ? 'gal' : 'L'}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="bg-black/20 p-4 rounded-xl border border-white/5 backdrop-blur-sm">
                                                <p className="text-[10px] text-white/60 uppercase font-bold mb-1">Daily Drop</p>
                                                <div className="text-xl font-bold">
                                                    {inputs.unitSystem === 'imperial' ? result.dailyDropInches : (result.dailyDropInches * 2.54).toFixed(2)}
                                                    <span className="text-sm font-normal text-white/60 ml-1">{inputs.unitSystem === 'imperial' ? 'in' : 'cm'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {(result.severity === 'high' || result.severity === 'critical') && (
                                            <div className="flex gap-3 text-sm text-red-200 bg-red-950/40 p-3 rounded-lg border border-red-500/20">
                                                <Droplets className="w-5 h-5 flex-shrink-0" />
                                                <span className="leading-snug">High evaporation detected! Consider using a solar cover to reduce loss by up to 95%.</span>
                                            </div>
                                        )}

                                        {result.severity === 'low' && (
                                            <div className="flex gap-3 text-sm text-green-200 bg-green-900/30 p-3 rounded-lg border border-green-500/20">
                                                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                                                <span className="leading-snug">Evaporation is minimal. Standard top-offs should suffice.</span>
                                            </div>
                                        )}

                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Recommendations */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                            <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-sm uppercase tracking-wide">
                                <CheckCircle2 className="w-4 h-4 text-green-500" /> Tips to Reduce Loss
                            </h4>
                            <ul className="space-y-3">
                                {[
                                    "Use a Solar Cover at night (saves ~90%)",
                                    "Reduce water temperature if possible",
                                    "Install windbreaks (fences/shrubs) to reduce airflow",
                                    "Limit splash-out from heavy activity"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5"></div>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default EvaporationCalculator;
