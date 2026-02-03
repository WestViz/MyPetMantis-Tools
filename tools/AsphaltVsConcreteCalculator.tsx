import React, { useState, useEffect } from 'react';
import { Scale, DollarSign, Info, CheckCircle2, TrendingDown, Clock, HardHat, MapPin, Home } from 'lucide-react';

const REGION_CONFIG = {
  midwest: {
    label: 'Midwest',
    multiplier: 1.0,
    asphaltLifeMod: 0,
    concreteLifeMod: 0,
    desc: 'Standard freeze-thaw cycles'
  },
  northeast: {
    label: 'Northeast',
    multiplier: 1.15,
    asphaltLifeMod: -2,
    concreteLifeMod: -5,
    desc: 'Harsh winters, salt usage'
  },
  south: {
    label: 'South / Central',
    multiplier: 0.95,
    asphaltLifeMod: 2,
    concreteLifeMod: 2,
    desc: 'Warmer climate, less freeze'
  },
  west: {
    label: 'West / Mountain',
    multiplier: 1.1,
    asphaltLifeMod: 0,
    concreteLifeMod: 0,
    desc: 'Dry climate, variable temps'
  },
  florida: {
    label: 'Florida / Coastal',
    multiplier: 1.05,
    asphaltLifeMod: -3,
    concreteLifeMod: -10,
    desc: 'High humidity, salt air'
  }
};

const DRIVEWAY_PRESETS = [
  { label: 'Single Car', sqft: 200, desc: '10x20 ft' },
  { label: 'Standard 2-Car', sqft: 600, desc: '20x30 ft' },
  { label: 'Large 2-Car', sqft: 800, desc: '24x34 ft' },
  { label: '3-Car Wide', sqft: 1000, desc: '30x34 ft' },
  { label: 'Circular', sqft: 1200, desc: 'Approx. 40ft dia' }
];

const PROJECTION_YEARS = 20;

export default function AsphaltVsConcreteCalculator() {
  const [inputs, setInputs] = useState({
    squareFeet: 600,
    asphaltCostPerSqFt: 5.0,
    concreteCostPerSqFt: 8.5,
    region: 'midwest'
  });

  const [result, setResult] = useState(null);

  useEffect(() => {
    calculateComparison();
  }, [inputs]);

  const calculateComparison = () => {
    const { squareFeet, asphaltCostPerSqFt, concreteCostPerSqFt, region } = inputs;
    const regionData = REGION_CONFIG[region];

    // --- Regional price adjustments ---
    const adjustedAsphaltCost = asphaltCostPerSqFt * regionData.multiplier;
    const adjustedConcreteCost = concreteCostPerSqFt * regionData.multiplier;

    // --- Initial installation costs ---
    const asphaltInitial = squareFeet * adjustedAsphaltCost;
    const concreteInitial = squareFeet * adjustedConcreteCost;

    // --- Lifespan with regional modifiers ---
    const BASE_ASPHALT_LIFE = 20; // years
    const BASE_CONCRETE_LIFE = 40; // years

    const asphaltLifespan = BASE_ASPHALT_LIFE + regionData.asphaltLifeMod;
    const concreteLifespan = BASE_CONCRETE_LIFE + regionData.concreteLifeMod;

    // --- Annual maintenance costs (region-adjusted) ---
    // Asphalt: sealing, crack fill, patching — ~$0.25–0.40/sqft/yr
    const asphaltMaintenanceRate = region === 'northeast' ? 0.48 : 0.40; // $/sqft/yr
    const asphaltMaintenancePerYear = squareFeet * asphaltMaintenanceRate;

    // Concrete: occasional sealing, minor repair — ~$0.10/sqft/yr
    const concreteMaintenanceRate = region === 'florida' ? 0.15 : 0.10; // $/sqft/yr
    const concreteMaintenancePerYear = squareFeet * concreteMaintenanceRate;

    // --- 20-year total cost projection (FIX: includes replacement if lifespan < 20) ---
    // Number of full replacements needed within the projection window
    // e.g. asphalt life = 18 yrs → 1 replacement at year 18; life = 20 → 0 replacements
    const asphaltReplacements = Math.floor(PROJECTION_YEARS / asphaltLifespan); 
    // Concrete life is 30–40 yrs, so 0 replacements in 20 yrs
    const concreteReplacements = Math.floor(PROJECTION_YEARS / concreteLifespan);

    const asphaltTotal20Year =
      asphaltInitial +                                    // first install
      (asphaltReplacements * asphaltInitial) +            // any full replacements
      (asphaltMaintenancePerYear * PROJECTION_YEARS);     // cumulative maintenance

    const concreteTotal20Year =
      concreteInitial +
      (concreteReplacements * concreteInitial) +
      (concreteMaintenancePerYear * PROJECTION_YEARS);

    // --- Upfront savings (concrete premium over asphalt) ---
    const upfrontPremium = concreteInitial - asphaltInitial; // positive = concrete costs more upfront

    // --- Recommendation ---
    const diff20 = asphaltTotal20Year - concreteTotal20Year;
    const diffPct = Math.abs(diff20) / Math.max(asphaltTotal20Year, concreteTotal20Year);
    let recommendation = '';

    if (diff20 > 0 && diffPct > 0.05) {
      recommendation = `In ${regionData.label}, Concrete is the better long-term investment — it saves ${formatCurrency(diff20)} over ${PROJECTION_YEARS} years despite the higher upfront cost.`;
    } else if (diff20 < 0 && diffPct > 0.05) {
      recommendation = `In ${regionData.label}, Asphalt is more cost-effective over ${PROJECTION_YEARS} years, saving ${formatCurrency(Math.abs(diff20))} compared to concrete.`;
    } else {
      recommendation = `In ${regionData.label}, both options come out to roughly the same total cost over ${PROJECTION_YEARS} years. Choose based on appearance and personal preference.`;
    }

    setResult({
      asphaltInitial: Math.round(asphaltInitial),
      concreteInitial: Math.round(concreteInitial),
      upfrontPremium: Math.round(upfrontPremium),
      asphaltLifespan,
      concreteLifespan,
      asphaltMaintenancePerYear: Math.round(asphaltMaintenancePerYear),
      concreteMaintenancePerYear: Math.round(concreteMaintenancePerYear),
      asphaltReplacements,
      concreteReplacements,
      asphaltTotal20Year: Math.round(asphaltTotal20Year),
      concreteTotal20Year: Math.round(concreteTotal20Year),
      recommendation
    });
  };

  const handlePresetClick = (sqft) => {
    setInputs(prev => ({ ...prev, squareFeet: sqft }));
  };

  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  // Shared bar-width helper: returns percentage relative to the larger of two values
  const barWidth = (value, otherValue) =>
    Math.min(100, (value / Math.max(value, otherValue)) * 100);

  return (
    <div className="min-h-screen bg-[#fcf9f4] p-4 md:p-8 font-sans text-slate-800">
      <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#e5e7eb]">

        {/* Header */}
        <div className="bg-gradient-to-r from-[#2c241b] to-[#5c4d3c] p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 opacity-10 transform translate-x-10 -translate-y-10">
            <HardHat size={200} />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2 text-[#fbbf24]">
                <Scale className="w-5 h-5" />
                <span className="text-xs font-bold tracking-widest uppercase">Paving Cost Estimator</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight">Asphalt vs. Concrete</h1>
              <p className="text-slate-300 mt-2 text-sm max-w-md">
                Region-specific pricing and lifespan estimates for accurate driveway budgeting.
              </p>
            </div>
            <div className="hidden md:block text-right">
              <div className="text-4xl font-black text-[#fbbf24]">VS</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">

          {/* ── Inputs Column ── */}
          <div className="lg:col-span-5 p-6 md:p-8 bg-slate-50 border-r border-slate-100 space-y-8">

            {/* Region Selector */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Select Region
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {Object.entries(REGION_CONFIG).map(([key, data]) => (
                  <button
                    key={key}
                    onClick={() => setInputs(p => ({ ...p, region: key }))}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all text-left ${
                      inputs.region === key
                        ? 'bg-[#9A690F] border-[#9A690F] text-white shadow-md'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-[#9A690F]/50'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-sm">{data.label}</div>
                      <div className={`text-xs ${inputs.region === key ? 'text-white/80' : 'text-slate-400'}`}>
                        {data.desc}
                      </div>
                    </div>
                    {inputs.region === key && <CheckCircle2 className="w-5 h-5 text-white" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Driveway Size + Presets */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Home className="w-4 h-4" /> Driveway Size
              </h3>
              <div className="flex flex-wrap gap-2 mb-3">
                {DRIVEWAY_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => handlePresetClick(preset.sqft)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                      inputs.squareFeet === preset.sqft
                        ? 'bg-slate-800 text-white border-slate-800'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                    }`}
                    title={`${preset.label}: ${preset.desc}`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Total Square Footage</label>
                <div className="relative">
                  <input
                    type="number"
                    value={inputs.squareFeet}
                    onChange={(e) => setInputs(p => ({ ...p, squareFeet: Math.max(0, parseFloat(e.target.value) || 0) }))}
                    className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-lg font-bold text-lg text-slate-800 focus:ring-2 focus:ring-[#9A690F] focus:border-transparent outline-none transition-all"
                  />
                  <span className="absolute right-4 top-3.5 text-slate-400 font-medium text-sm">sq ft</span>
                </div>
              </div>
            </div>

            {/* Asphalt Price Input */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 rounded-full bg-slate-800"></div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Base Asphalt Price</h3>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Cost per Square Foot</label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-slate-400 font-bold">$</span>
                  <input
                    type="number"
                    step="0.5"
                    value={inputs.asphaltCostPerSqFt}
                    onChange={(e) => setInputs(p => ({ ...p, asphaltCostPerSqFt: parseFloat(e.target.value) || 0 }))}
                    className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-800 focus:ring-2 focus:ring-[#9A690F] outline-none"
                  />
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  Region-adjusted: ~{formatCurrency(inputs.asphaltCostPerSqFt * REGION_CONFIG[inputs.region].multiplier)}/sqft
                </p>
              </div>
            </div>

            {/* Concrete Price Input */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 rounded-full bg-[#9A690F]"></div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Base Concrete Price</h3>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Cost per Square Foot</label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-slate-400 font-bold">$</span>
                  <input
                    type="number"
                    step="0.5"
                    value={inputs.concreteCostPerSqFt}
                    onChange={(e) => setInputs(p => ({ ...p, concreteCostPerSqFt: parseFloat(e.target.value) || 0 }))}
                    className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-800 focus:ring-2 focus:ring-[#9A690F] outline-none"
                  />
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  Region-adjusted: ~{formatCurrency(inputs.concreteCostPerSqFt * REGION_CONFIG[inputs.region].multiplier)}/sqft
                </p>
              </div>
            </div>
          </div>

          {/* ── Results Column ── */}
          <div className="lg:col-span-7 p-6 md:p-8 bg-white">
            {result && (
              <div className="h-full flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-[#9A690F]" /> Cost Analysis
                  </h2>
                  <div className="px-3 py-1 bg-slate-100 rounded-full text-xs font-bold text-slate-500 uppercase tracking-wide">
                    {REGION_CONFIG[inputs.region].label} Region
                  </div>
                </div>

                {/* ── Comparison Bars ── */}
                <div className="mb-8 space-y-6">

                  {/* Initial Cost */}
                  <div>
                    <div className="flex justify-between text-sm font-bold mb-2">
                      <span className="text-slate-600">Initial Installation</span>
                      <span className="text-slate-400 text-xs font-normal">Lower is better</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="w-16 text-xs font-bold text-slate-500 text-right">Asphalt</span>
                        <div className="flex-1 h-8 bg-slate-100 rounded-lg overflow-hidden">
                          <div
                            className="h-full bg-slate-700 flex items-center justify-end px-2 transition-all duration-500"
                            style={{ width: `${barWidth(result.asphaltInitial, result.concreteInitial)}%` }}
                          >
                            <span className="text-white text-xs font-bold whitespace-nowrap">{formatCurrency(result.asphaltInitial)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="w-16 text-xs font-bold text-[#9A690F] text-right">Concrete</span>
                        <div className="flex-1 h-8 bg-slate-100 rounded-lg overflow-hidden">
                          <div
                            className="h-full bg-[#9A690F] flex items-center justify-end px-2 transition-all duration-500"
                            style={{ width: `${barWidth(result.concreteInitial, result.asphaltInitial)}%` }}
                          >
                            <span className="text-white text-xs font-bold whitespace-nowrap">{formatCurrency(result.concreteInitial)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 20-Year Total Cost */}
                  <div>
                    <div className="flex justify-between text-sm font-bold mb-2">
                      <span className="text-slate-600">{PROJECTION_YEARS}-Year Total Cost (Est.)</span>
                      <span className="text-slate-400 text-xs font-normal">Includes maintenance + replacements</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="w-16 text-xs font-bold text-slate-500 text-right">Asphalt</span>
                        <div className="flex-1 h-8 bg-slate-100 rounded-lg overflow-hidden">
                          <div
                            className="h-full bg-slate-700 flex items-center justify-end px-2 transition-all duration-500"
                            style={{ width: `${barWidth(result.asphaltTotal20Year, result.concreteTotal20Year)}%` }}
                          >
                            <span className="text-white text-xs font-bold whitespace-nowrap">{formatCurrency(result.asphaltTotal20Year)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="w-16 text-xs font-bold text-[#9A690F] text-right">Concrete</span>
                        <div className="flex-1 h-8 bg-slate-100 rounded-lg overflow-hidden">
                          <div
                            className="h-full bg-[#9A690F] flex items-center justify-end px-2 transition-all duration-500"
                            style={{ width: `${barWidth(result.concreteTotal20Year, result.asphaltTotal20Year)}%` }}
                          >
                            <span className="text-white text-xs font-bold whitespace-nowrap">{formatCurrency(result.concreteTotal20Year)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recommendation Card */}
                <div className="bg-[#f0fdf4] border border-[#86efac] rounded-2xl p-5 mb-6 flex items-start gap-4">
                  <div className="bg-white p-2 rounded-full shadow-sm text-green-600 mt-1">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-green-800 text-lg">Recommendation</h4>
                    <p className="text-green-700 text-sm mt-1 leading-relaxed">{result.recommendation}</p>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 mt-auto">
                  {/* Lifespan */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-2 text-slate-500 mb-2">
                      <Clock className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase">Expected Lifespan</span>
                    </div>
                    <div className="flex justify-between items-end">
                      <div className="text-center">
                        <div className="text-xs text-slate-400 mb-1">Asphalt</div>
                        <div className="font-bold text-slate-700">{result.asphaltLifespan} yrs</div>
                      </div>
                      <div className="h-8 w-px bg-slate-200"></div>
                      <div className="text-center">
                        <div className="text-xs text-slate-400 mb-1">Concrete</div>
                        <div className="font-bold text-[#9A690F]">{result.concreteLifespan} yrs</div>
                      </div>
                    </div>
                  </div>

                  {/* Maintenance / Year */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-2 text-slate-500 mb-2">
                      <TrendingDown className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase">Maintenance / Yr</span>
                    </div>
                    <div className="flex justify-between items-end">
                      <div className="text-center">
                        <div className="text-xs text-slate-400 mb-1">Asphalt</div>
                        <div className="font-bold text-slate-700">{formatCurrency(result.asphaltMaintenancePerYear)}</div>
                      </div>
                      <div className="h-8 w-px bg-slate-200"></div>
                      <div className="text-center">
                        <div className="text-xs text-slate-400 mb-1">Concrete</div>
                        <div className="font-bold text-[#9A690F]">{formatCurrency(result.concreteMaintenancePerYear)}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Replacement note (only shown if asphalt needs replacing in window) */}
                {result.asphaltReplacements > 0 && (
                  <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                    <p className="text-xs text-amber-700 font-semibold">
                      ⚠️ Note: Asphalt (lifespan {result.asphaltLifespan} yrs) requires {result.asphaltReplacements} full replacement(s) within the {PROJECTION_YEARS}-year window. This cost is included in the total above.
                    </p>
                  </div>
                )}

                {/* Footer disclaimer */}
                <div className="mt-6 pt-6 border-t border-slate-100 text-center">
                  <p className="text-xs text-slate-400 flex items-center justify-center gap-1">
                    <Info className="w-3 h-3" /> Estimates include regional adjustments & replacement cycles. Actual costs vary by contractor.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
                <div className="text-center mt-6">
                <p className="text-[#885C09] text-sm">
                    Disclaimer: Always consult with a licensed contractor or engineer for precise project planning. Results are for informational purposes only.
                    <br></br>
                    Powered by <a href="https://asphaltcalculatorusa.com" className="text-[#9A690F] font-bold hover:underline" target="_blank" rel="noopener noreferrer">AsphaltCalculatorUSA.com</a>
                </p>
            </div>  </div>
    </div>
  );
}