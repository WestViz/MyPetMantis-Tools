import React, { useState, useEffect } from 'react';
import {
  Beaker,
  Droplets,
  AlertTriangle,
  CheckCircle2,
  Waves,
  Minus,
  Plus,
  Scale
} from 'lucide-react';

// ----------------------------------------------------------------------
// TYPES
// ----------------------------------------------------------------------

type UnitSystem = 'imperial' | 'metric';
type AlkalinityLevel = 'low' | 'normal' | 'high';

export interface AcidInputs {
  poolVolume: number;
  unitSystem: UnitSystem;
  currentPH: number;
  targetPH: number;
  alkalinity: AlkalinityLevel;
  acidStrength: '31.45' | '14.5';
}

export interface AcidResult {
  amountOz: number;
  amountMl: number;
  amountGallons: number;
  amountLiters: number;
  warnings: string[];
}

// ----------------------------------------------------------------------
// CONSTANTS
// ----------------------------------------------------------------------

const BASE_DOSAGE_31_OZ_PER_10K = 32; // oz to lower 10k gal by 0.2 pH
const BASE_DOSAGE_14_OZ_PER_10K = 64;

// ----------------------------------------------------------------------
// HELPER COMPONENTS
// ----------------------------------------------------------------------

const StepButton = ({ onClick, icon: Icon }: { onClick: () => void, icon: any }) => (
  <button
    onClick={onClick}
    className="w-12 h-12 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 active:scale-95 transition-all touch-manipulation"
  >
    <Icon className="w-6 h-6" />
  </button>
);

const SelectionButton = ({ selected, onClick, label, subLabel }: { selected: boolean, onClick: () => void, label: string, subLabel?: string }) => (
  <button
    onClick={onClick}
    className={`relative p-4 rounded-xl border-2 text-left transition-all duration-200 w-full touch-manipulation
      ${selected
        ? 'border-cyan-500 bg-cyan-50/50 ring-2 ring-cyan-200 ring-offset-1 z-10'
        : 'border-slate-100 bg-slate-50 hover:bg-slate-100 text-slate-500'}`}
  >
    <div className={`font-bold ${selected ? 'text-cyan-800' : 'text-slate-700'}`}>{label}</div>
    {subLabel && <div className={`text-xs mt-1 ${selected ? 'text-cyan-600' : 'text-slate-400'}`}>{subLabel}</div>}
    {selected && <div className="absolute top-2 right-2 text-cyan-500"><CheckCircle2 className="w-5 h-5" /></div>}
  </button>
);

// ----------------------------------------------------------------------
// MAIN COMPONENT
// ----------------------------------------------------------------------

const MuriaticAcidDosage: React.FC = () => {
  const [inputs, setInputs] = useState<AcidInputs>({
    poolVolume: 15000,
    unitSystem: 'imperial',
    currentPH: 7.8,
    targetPH: 7.4,
    alkalinity: 'normal',
    acidStrength: '31.45'
  });

  const [result, setResult] = useState<AcidResult | null>(null);

  // Convert volume for display/calculation logic
  const displayVolume = inputs.unitSystem === 'imperial' ? inputs.poolVolume : Math.round(inputs.poolVolume * 3.78541);
  const volumeLabel = inputs.unitSystem === 'imperial' ? 'Gallons' : 'Liters';

  useEffect(() => {
    calculateDosage();
  }, [inputs]);

  const calculateDosage = () => {
    const { poolVolume, unitSystem, currentPH, targetPH, acidStrength, alkalinity } = inputs;

    if (currentPH <= targetPH) {
      setResult(null);
      return;
    }

    // Normalize volume to Gallons for calculation
    const volumeGallons = unitSystem === 'imperial' ? poolVolume : poolVolume * 0.264172;

    const deltaPH = currentPH - targetPH;
    const baseDosage = acidStrength === '31.45' ? BASE_DOSAGE_31_OZ_PER_10K : BASE_DOSAGE_14_OZ_PER_10K;

    // Alkalinity adjustment factor (approximate)
    // High alkalinity buffers acid, requiring more. Low alkalinity crashes easily, requiring less/care.
    let alkalinityFactor = 1.0;
    if (alkalinity === 'high') alkalinityFactor = 1.25; // Need more acid to fight the buffer
    if (alkalinity === 'low') alkalinityFactor = 0.85;  // Need less acid to avoid crash

    // Formula: (Delta / 0.2) * (Volume / 10000) * Base * AlkFactor
    const scalingFactor = (volumeGallons / 10000);
    const amountOz = (deltaPH / 0.2) * scalingFactor * baseDosage * alkalinityFactor;

    const amountMl = amountOz * 29.5735;
    const amountLiters = amountMl / 1000;
    const amountGallons = amountOz / 128;

    const warnings: string[] = [];
    if (alkalinity === 'low') warnings.push("Low Alkalinity (<80 ppm) detected. Add acid in small increments to prevent pH crash.");
    if (alkalinity === 'high') warnings.push("High Alkalinity (>120 ppm) will buffer changes. You may need multiple doses.");
    if (amountOz > 64 && volumeGallons < 10000) warnings.push("Large dose calculated. Do not add more than 1 quart (32oz) per 10,000 gallons at one time. Split the dose.");
    if (amountOz > 128) warnings.push("Dose reflects >1 Gallon. ALWAYS split into multiple applications circulating 4-6 hours in between.");

    setResult({
      amountOz: Math.round(amountOz * 10) / 10,
      amountMl: Math.round(amountMl),
      amountGallons: Math.round(amountGallons * 100) / 100,
      amountLiters: Math.round(amountLiters * 100) / 100,
      warnings
    });
  };

  const updatePH = (type: 'current' | 'target', delta: number) => {
    setInputs(prev => {
      const newVal = Math.round((prev[type === 'current' ? 'currentPH' : 'targetPH'] + delta) * 10) / 10;
      // Clamp values reasonably
      if (newVal < 6.8 || newVal > 9.0) return prev;
      return { ...prev, [type === 'current' ? 'currentPH' : 'targetPH']: newVal };
    });
  };

  const handleVolumeChange = (val: string) => {
    const num = parseFloat(val);
    if (isNaN(num)) return;

    // If user is typing in liters, store as liters (conceptually), but we normalize to the unit system state
    // Actually, let's just update the poolVolume directly. The unit system toggle just interprets the number.
    setInputs(prev => ({ ...prev, poolVolume: num }));
  };

  const toggleUnit = () => {
    setInputs(prev => {
      const newSystem = prev.unitSystem === 'imperial' ? 'metric' : 'imperial';
      // Auto-convert the current number so it doesn't jump wildly
      const newVolume = prev.unitSystem === 'imperial'
        ? prev.poolVolume * 3.78541 // Gal to L
        : prev.poolVolume * 0.264172; // L to Gal
      return {
        ...prev,
        unitSystem: newSystem,
        poolVolume: Math.round(newVolume)
      };
    });
  };

  return (
    <div className="glass-panel text-slate-900 rounded-[2rem] shadow-xl bg-white/90 backdrop-blur-md border border-slate-200 p-4 md:p-8 relative overflow-hidden max-w-5xl mx-auto">

      {/* Background Decor */}
      <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-cyan-400/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <span className="p-2 bg-cyan-100 text-cyan-700 rounded-lg"><Beaker className="w-6 h-6" /></span>
            <span className="text-xs font-bold tracking-widest text-slate-400 uppercase">Pool Tools</span>
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Acid Dosage Calculator</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* === LEFT COLUMN: INPUTS === */}
          <div className="lg:col-span-7 space-y-6">

            {/* CARD 1: POOL VOLUME */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-700 flex items-center gap-2">
                  <Waves className="w-5 h-5 text-cyan-500" /> Pool Volume
                </h3>
                <button onClick={toggleUnit} className="text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1 rounded-full transition-colors">
                  Switch to {inputs.unitSystem === 'imperial' ? 'Metric' : 'US Gallons'}
                </button>
              </div>

              <div className="relative">
                <input
                  type="number"
                  value={inputs.poolVolume}
                  onChange={(e) => handleVolumeChange(e.target.value)}
                  className="w-full pl-4 pr-16 py-4 bg-slate-50 border-0 rounded-xl font-black text-3xl text-slate-800 ring-1 ring-slate-200 focus:ring-2 focus:ring-cyan-500 transition-all text-center"
                />
                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                  {inputs.unitSystem === 'imperial' ? 'GAL' : 'L'}
                </span>
              </div>
            </div>

            {/* CARD 2: PH LEVELS (STEPPERS) */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="font-bold text-slate-700 flex items-center gap-2 mb-6">
                <Droplets className="w-5 h-5 text-indigo-500" /> pH Levels
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {/* Current pH */}
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Current pH</label>
                  <div className="flex items-center justify-between gap-3">
                    <StepButton onClick={() => updatePH('current', -0.1)} icon={Minus} />
                    <div className="bg-slate-50 flex-1 py-3 rounded-xl border border-slate-100 text-center font-black text-2xl text-slate-800">
                      {inputs.currentPH.toFixed(1)}
                    </div>
                    <StepButton onClick={() => updatePH('current', 0.1)} icon={Plus} />
                  </div>
                </div>

                {/* Target pH */}
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Target pH</label>
                  <div className="flex items-center justify-between gap-3">
                    <StepButton onClick={() => updatePH('target', -0.1)} icon={Minus} />
                    <div className="bg-slate-50 flex-1 py-3 rounded-xl border border-slate-100 text-center font-black text-2xl text-indigo-600">
                      {inputs.targetPH.toFixed(1)}
                    </div>
                    <StepButton onClick={() => updatePH('target', 0.1)} icon={Plus} />
                  </div>
                </div>
              </div>
            </div>

            {/* CARD 3: CHEMICAL DETAILS (BUTTONS) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* ALKALINITY */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
                <h3 className="font-bold text-slate-700 flex items-center gap-2 mb-4 text-sm uppercase tracking-wide">
                  <Scale className="w-4 h-4" /> Alkalinity (TA)
                </h3>
                <div className="flex flex-col gap-2 flex-1">
                  <SelectionButton
                    selected={inputs.alkalinity === 'low'}
                    onClick={() => setInputs(p => ({ ...p, alkalinity: 'low' }))}
                    label="Low (< 80)"
                    subLabel="Risk of pH crash"
                  />
                  <SelectionButton
                    selected={inputs.alkalinity === 'normal'}
                    onClick={() => setInputs(p => ({ ...p, alkalinity: 'normal' }))}
                    label="Normal (80-120)"
                    subLabel="Standard buffer"
                  />
                  <SelectionButton
                    selected={inputs.alkalinity === 'high'}
                    onClick={() => setInputs(p => ({ ...p, alkalinity: 'high' }))}
                    label="High (> 120)"
                    subLabel="Needs more acid"
                  />
                </div>
              </div>

              {/* STRENGTH */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
                <h3 className="font-bold text-slate-700 flex items-center gap-2 mb-4 text-sm uppercase tracking-wide">
                  <Beaker className="w-4 h-4" /> Acid Strength
                </h3>
                <div className="flex flex-col gap-2 flex-1">
                  <SelectionButton
                    selected={inputs.acidStrength === '31.45'}
                    onClick={() => setInputs(p => ({ ...p, acidStrength: '31.45' }))}
                    label="Standard (31.45%)"
                    subLabel="20° Baumé"
                  />
                  <SelectionButton
                    selected={inputs.acidStrength === '14.5'}
                    onClick={() => setInputs(p => ({ ...p, acidStrength: '14.5' }))}
                    label="Low Fume (14.5%)"
                    subLabel="Safer / Green"
                  />
                </div>
              </div>

            </div>
          </div>

          {/* === RIGHT COLUMN: RESULTS === */}
          <div className="lg:col-span-5 space-y-6">

            {/* Primary Result Card */}
            <div className="bg-slate-900 text-white p-6 md:p-8 rounded-3xl shadow-2xl relative overflow-hidden h-full flex flex-col justify-center">
              <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <Beaker className="w-64 h-64" />
              </div>

              <div className="relative z-10">
                <div className="mb-8">
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-2">Recommended Dose</p>
                  {result ? (
                    <div>
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-7xl font-black tracking-tighter text-cyan-400">
                          {inputs.unitSystem === 'imperial' ? result.amountOz : result.amountMl}
                        </span>
                        <span className="text-2xl font-bold text-slate-400">
                          {inputs.unitSystem === 'imperial' ? 'oz' : 'ml'}
                        </span>
                      </div>
                      {inputs.unitSystem === 'imperial' && (
                        <p className="text-slate-500 font-medium">
                          ({result.amountMl} ml)
                        </p>
                      )}
                      {inputs.unitSystem === 'metric' && (
                        <p className="text-slate-500 font-medium">
                          ({result.amountOz} oz)
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="text-4xl font-bold text-slate-600">--</div>
                  )}
                </div>

                {result && (
                  <div className="space-y-4">
                    <div className="h-px bg-white/10 w-full mb-6"></div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                        <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Large Volume</p>
                        <div className="text-xl font-bold">
                          {inputs.unitSystem === 'imperial' ? result.amountGallons : result.amountLiters}
                          <span className="text-sm font-normal text-slate-400 ml-1">
                            {inputs.unitSystem === 'imperial' ? 'gal' : 'L'}
                          </span>
                        </div>
                      </div>

                      <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                        <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Kitchen Units</p>
                        <div className="text-xl font-bold">
                          {Math.round((result.amountOz / 8) * 10) / 10}
                          <span className="text-sm font-normal text-slate-400 ml-1">cups</span>
                        </div>
                      </div>
                    </div>

                    {result.warnings.map((w, i) => (
                      <div key={i} className="flex gap-3 text-sm text-amber-300 bg-amber-900/30 p-3 rounded-lg border border-amber-900/50">
                        <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                        <span className="leading-snug">{w}</span>
                      </div>
                    ))}
                  </div>
                )}
                {!result && (
                  <div className="p-4 bg-white/5 rounded-xl text-center text-slate-400 text-sm">
                    Current pH is lower than Target pH. No acid needed.
                  </div>
                )}
              </div>
            </div>

            {/* Safety List */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-sm uppercase tracking-wide">
                <CheckCircle2 className="w-4 h-4 text-green-500" /> Best Practices
              </h4>
              <ul className="space-y-3">
                {[
                  "Always add Acid to Water (never water to acid).",
                  "Wear gloves and eye protection.",
                  "Pour slowly in front of a return jet.",
                  "Wait 4 hours before re-testing pH."
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

export default MuriaticAcidDosage;