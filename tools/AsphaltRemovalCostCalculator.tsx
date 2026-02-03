import React, { useMemo, useState } from 'react';
import { Trash2, Truck, Info, DollarSign, HardHat, Clock, MapPin, Recycle, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';

type RemovalMethod = 'mill' | 'full-depth';
type ProjectComplexity = 'simple' | 'moderate' | 'complex';
type Region = 'northeast' | 'midwest' | 'south' | 'west' | 'custom';

type Inputs = {
  areaSqFt: number;
  thicknessIn: number;
  method: RemovalMethod;
  baseRateSqFt: number;
  disposalPerTon: number;
  haulPerTon: number;
  densityLbFt3: number;
  laborCostFactor: number;
  equipmentCostFactor: number;
  permitsAndFees: number;
  trafficControl: number;
  recyclingSavings: number;
  projectComplexity: ProjectComplexity;
  region: Region;
  regionalMultiplier: number;
  siteAccessibility: number;
  weatherFactor: number;
};

const AsphaltRemovalCostCalculator: React.FC = () => {
  const [inputs, setInputs] = useState<Inputs>({
    areaSqFt: 1200,
    thicknessIn: 3,
    method: 'mill',
    baseRateSqFt: 1.75,
    disposalPerTon: 28,
    haulPerTon: 12,
    densityLbFt3: 145,
    laborCostFactor: 35,
    equipmentCostFactor: 25,
    permitsAndFees: 500,
    trafficControl: 300,
    recyclingSavings: 15,
    projectComplexity: 'moderate',
    region: 'midwest',
    regionalMultiplier: 1.0,
    siteAccessibility: 1.0,
    weatherFactor: 1.0
  });

  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const result = useMemo(() => {
    const thicknessFt = inputs.thicknessIn / 12;
    const volumeFt3 = inputs.areaSqFt * thicknessFt;
    const tons = (volumeFt3 * inputs.densityLbFt3) / 2000;
    const baseCost = inputs.areaSqFt * inputs.baseRateSqFt;
    const disposal = tons * inputs.disposalPerTon;
    const haul = tons * inputs.haulPerTon;
    const methodMultiplier = inputs.method === 'full-depth' ? 1.25 : 1;
    
    // Additional cost calculations
    const laborCost = (baseCost * inputs.laborCostFactor) / 100;
    const equipmentCost = (baseCost * inputs.equipmentCostFactor) / 100;
    const permitsAndFees = inputs.permitsAndFees;
    const trafficControl = inputs.trafficControl;
    
    // Complexity multiplier
    const complexityMultiplier = {
      'simple': 0.9,
      'moderate': 1.0,
      'complex': 1.3
    }[inputs.projectComplexity];
    
    // Total before adjustments
    const subtotal = (baseCost + disposal + haul + laborCost + equipmentCost + permitsAndFees + trafficControl) * methodMultiplier;
    
    // Apply regional and other multipliers
    const regionalAdjusted = subtotal * inputs.regionalMultiplier;
    const accessibilityAdjusted = regionalAdjusted * inputs.siteAccessibility;
    const weatherAdjusted = accessibilityAdjusted * inputs.weatherFactor;
    const complexityAdjusted = weatherAdjusted * complexityMultiplier;
    
    // Recycling savings
    const recyclingSavings = tons * inputs.recyclingSavings;
    const finalTotal = Math.max(0, complexityAdjusted - recyclingSavings);

    return {
      tons: Math.round(tons * 100) / 100,
      baseCost: Math.round(baseCost * 100) / 100,
      disposal: Math.round(disposal * 100) / 100,
      haul: Math.round(haul * 100) / 100,
      laborCost: Math.round(laborCost * 100) / 100,
      equipmentCost: Math.round(equipmentCost * 100) / 100,
      permitsAndFees: Math.round(permitsAndFees * 100) / 100,
      trafficControl: Math.round(trafficControl * 100) / 100,
      recyclingSavings: Math.round(recyclingSavings * 100) / 100,
      subtotal: Math.round(subtotal * 100) / 100,
      regionalAdjusted: Math.round(regionalAdjusted * 100) / 100,
      complexityAdjusted: Math.round(complexityAdjusted * 100) / 100,
      finalTotal: Math.round(finalTotal * 100) / 100,
      volumeYards3: Math.round((volumeFt3 / 27) * 100) / 100,
      complexityMultiplier,
      methodMultiplier
    };
  }, [inputs]);

  const update = (field: keyof Inputs, value: number | RemovalMethod | ProjectComplexity | Region) => {
    setInputs((p) => ({ ...p, [field]: value }));
  };

  const updateRegionalMultiplier = (region: Region) => {
    const multipliers = {
      'northeast': 1.15,
      'midwest': 1.0,
      'south': 0.95,
      'west': 1.1,
      'custom': inputs.regionalMultiplier
    };
    update('region', region);
    update('regionalMultiplier', multipliers[region]);
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="glass-panel text-slate-900 rounded-[1.5rem] md:rounded-[2rem] shadow-xl bg-white/90 backdrop-blur-md border border-[#885C09]/20 p-3 md:p-8 relative overflow-hidden max-w-6xl mx-auto">
      <div className="absolute top-0 right-0 -mt-12 -mr-12 md:-mt-16 md:-mr-16 w-40 h-40 md:w-56 md:h-56 bg-[#9A690F]/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="relative z-10">
        <div className="text-center mb-4 md:mb-6">
          <div className="inline-flex items-center gap-2 mb-1 md:mb-2">
            <span className="p-1.5 md:p-2 bg-[#9A690F]/10 text-[#885C09] rounded-lg"><Trash2 className="w-5 h-5 md:w-6 md:h-6" /></span>
            <span className="text-[10px] md:text-xs font-bold tracking-widest text-[#885C09] uppercase">Comprehensive Removal Estimator</span>
          </div>
          <h1 className="text-xl md:text-3xl font-black text-[#291901] tracking-tight">Asphalt Removal Cost Calculator</h1>
          <p className="text-[10px] md:text-xs text-[#885C09] mt-0.5 md:mt-1">Detailed estimate for milling or full-depth removal with comprehensive cost breakdown</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
          {/* Left Column - Inputs */}
          <div className="lg:col-span-7 space-y-4">
            {/* Basic Parameters */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#885C09]/10">
              <button 
                onClick={() => toggleSection('basic')}
                className="w-full flex items-center justify-between text-left mb-4"
              >
                <h3 className="font-bold text-[#291901] text-sm uppercase tracking-wide flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-[#9A690F]" /> Basic Parameters
                </h3>
                {expandedSection === 'basic' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              
              <div className={`space-y-4 ${expandedSection === 'basic' ? 'block' : 'hidden md:block'}`}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#885C09] uppercase mb-1">Removal Method</label>
                    <select value={inputs.method} onChange={(e) => update('method', e.target.value as RemovalMethod)} className="w-full px-4 py-2 bg-[#ffe0c1]/20 rounded-xl font-bold text-sm">
                      <option value="mill">Milling (Surface Removal)</option>
                      <option value="full-depth">Full-Depth Removal</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#885C09] uppercase mb-1">Project Complexity</label>
                    <select value={inputs.projectComplexity} onChange={(e) => update('projectComplexity', e.target.value as ProjectComplexity)} className="w-full px-4 py-2 bg-[#ffe0c1]/20 rounded-xl font-bold text-sm">
                      <option value="simple">Simple (Easy Access)</option>
                      <option value="moderate">Moderate (Standard)</option>
                      <option value="complex">Complex (Tight Access)</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#885C09] uppercase mb-1">Area (sq ft)</label>
                    <input type="number" value={inputs.areaSqFt} onChange={(e) => update('areaSqFt', parseFloat(e.target.value) || 0)} className="w-full px-4 py-2 bg-[#ffe0c1]/20 rounded-xl font-bold text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#885C09] uppercase mb-1">Thickness (inches)</label>
                    <input type="number" value={inputs.thicknessIn} onChange={(e) => update('thicknessIn', parseFloat(e.target.value) || 0)} className="w-full px-4 py-2 bg-[#ffe0c1]/20 rounded-xl font-bold text-sm" />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#885C09] uppercase mb-1">Base Rate ($/sq ft)</label>
                    <input type="number" step="0.01" value={inputs.baseRateSqFt} onChange={(e) => update('baseRateSqFt', parseFloat(e.target.value) || 0)} className="w-full px-4 py-2 bg-[#ffe0c1]/20 rounded-xl font-bold text-sm" />
                    <p className="text-[10px] text-slate-500 mt-1">Typical: $1.50 - $2.50</p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#885C09] uppercase mb-1">Density (lb/ft³)</label>
                    <input type="number" value={inputs.densityLbFt3} onChange={(e) => update('densityLbFt3', parseFloat(e.target.value) || 0)} className="w-full px-4 py-2 bg-[#ffe0c1]/20 rounded-xl font-bold text-sm" />
                    <p className="text-[10px] text-slate-500 mt-1">Typical: 140-150</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Cost Factors */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#885C09]/10">
              <button 
                onClick={() => toggleSection('costs')}
                className="w-full flex items-center justify-between text-left mb-4"
              >
                <h3 className="font-bold text-[#291901] text-sm uppercase tracking-wide flex items-center gap-2">
                  <HardHat className="w-4 h-4 text-[#9A690F]" /> Cost Factors
                </h3>
                {expandedSection === 'costs' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              
              <div className={`space-y-4 ${expandedSection === 'costs' ? 'block' : 'hidden md:block'}`}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#885C09] uppercase mb-1">Disposal Cost ($/ton)</label>
                    <input type="number" value={inputs.disposalPerTon} onChange={(e) => update('disposalPerTon', parseFloat(e.target.value) || 0)} className="w-full px-4 py-2 bg-[#ffe0c1]/20 rounded-xl font-bold text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#885C09] uppercase mb-1">Haul Cost ($/ton)</label>
                    <input type="number" value={inputs.haulPerTon} onChange={(e) => update('haulPerTon', parseFloat(e.target.value) || 0)} className="w-full px-4 py-2 bg-[#ffe0c1]/20 rounded-xl font-bold text-sm" />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#885C09] uppercase mb-1">Labor Cost (%)</label>
                    <input type="number" value={inputs.laborCostFactor} onChange={(e) => update('laborCostFactor', parseFloat(e.target.value) || 0)} className="w-full px-4 py-2 bg-[#ffe0c1]/20 rounded-xl font-bold text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#885C09] uppercase mb-1">Equipment Cost (%)</label>
                    <input type="number" value={inputs.equipmentCostFactor} onChange={(e) => update('equipmentCostFactor', parseFloat(e.target.value) || 0)} className="w-full px-4 py-2 bg-[#ffe0c1]/20 rounded-xl font-bold text-sm" />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#885C09] uppercase mb-1">Permits & Fees ($)</label>
                    <input type="number" value={inputs.permitsAndFees} onChange={(e) => update('permitsAndFees', parseFloat(e.target.value) || 0)} className="w-full px-4 py-2 bg-[#ffe0c1]/20 rounded-xl font-bold text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#885C09] uppercase mb-1">Traffic Control ($)</label>
                    <input type="number" value={inputs.trafficControl} onChange={(e) => update('trafficControl', parseFloat(e.target.value) || 0)} className="w-full px-4 py-2 bg-[#ffe0c1]/20 rounded-xl font-bold text-sm" />
                  </div>
                </div>
              </div>
            </div>

            {/* Regional & Environmental */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#885C09]/10">
              <button 
                onClick={() => toggleSection('regional')}
                className="w-full flex items-center justify-between text-left mb-4"
              >
                <h3 className="font-bold text-[#291901] text-sm uppercase tracking-wide flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#9A690F]" /> Regional & Environmental
                </h3>
                {expandedSection === 'regional' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              
              <div className={`space-y-4 ${expandedSection === 'regional' ? 'block' : 'hidden md:block'}`}>
                <div>
                  <label className="block text-xs font-bold text-[#885C09] uppercase mb-1">Region</label>
                  <select value={inputs.region} onChange={(e) => updateRegionalMultiplier(e.target.value as Region)} className="w-full px-4 py-2 bg-[#ffe0c1]/20 rounded-xl font-bold text-sm">
                    <option value="northeast">Northeast (+15%)</option>
                    <option value="midwest">Midwest (Baseline)</option>
                    <option value="south">South (-5%)</option>
                    <option value="west">West (+10%)</option>
                    <option value="custom">Custom Multiplier</option>
                  </select>
                </div>
                
                {inputs.region === 'custom' && (
                  <div>
                    <label className="block text-xs font-bold text-[#885C09] uppercase mb-1">Custom Regional Multiplier</label>
                    <input type="number" step="0.01" value={inputs.regionalMultiplier} onChange={(e) => update('regionalMultiplier', parseFloat(e.target.value) || 1)} className="w-full px-4 py-2 bg-[#ffe0c1]/20 rounded-xl font-bold text-sm" />
                  </div>
                )}
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#885C09] uppercase mb-1">Site Accessibility Factor</label>
                    <input type="number" step="0.1" min="0.5" max="2.0" value={inputs.siteAccessibility} onChange={(e) => update('siteAccessibility', parseFloat(e.target.value) || 1)} className="w-full px-4 py-2 bg-[#ffe0c1]/20 rounded-xl font-bold text-sm" />
                    <p className="text-[10px] text-slate-500 mt-1">0.5 (Easy) - 2.0 (Difficult)</p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#885C09] uppercase mb-1">Weather Factor</label>
                    <input type="number" step="0.1" min="0.8" max="1.5" value={inputs.weatherFactor} onChange={(e) => update('weatherFactor', parseFloat(e.target.value) || 1)} className="w-full px-4 py-2 bg-[#ffe0c1]/20 rounded-xl font-bold text-sm" />
                    <p className="text-[10px] text-slate-500 mt-1">0.8 (Good) - 1.5 (Bad)</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-[#885C09] uppercase mb-1">Recycling Savings ($/ton)</label>
                  <input type="number" value={inputs.recyclingSavings} onChange={(e) => update('recyclingSavings', parseFloat(e.target.value) || 0)} className="w-full px-4 py-2 bg-[#ffe0c1]/20 rounded-xl font-bold text-sm" />
                  <p className="text-[10px] text-slate-500 mt-1">Savings when asphalt is recycled</p>
                </div>
              </div>
            </div>

            {/* Info Panel */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#885C09]/10 text-xs text-slate-600">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-[#9A690F] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-bold text-[#291901] mb-1">Calculation Notes:</p>
                  <ul className="space-y-1">
                    <li>• Full-depth removal uses a 1.25x multiplier for added labor and disposal complexity.</li>
                    <li>• Regional multipliers adjust for local labor and material costs.</li>
                    <li>• Recycling savings reduce total cost when material is repurposed.</li>
                    <li>• Site accessibility and weather factors account for project-specific challenges.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Results */}
          <div className="lg:col-span-5 space-y-4">
            {/* Total Cost Card */}
            <div className="bg-gradient-to-br from-[#291901] to-[#885C09] text-white p-6 rounded-3xl shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10"><Truck className="w-28 h-28" /></div>
              <div className="relative z-10">
                <p className="text-[#ffe0c1]/70 font-bold uppercase tracking-widest text-xs mb-1">Final Estimated Cost</p>
                <div className="text-5xl font-black text-[#10B981]">${result.finalTotal}</div>
                <div className="mt-4 space-y-3 text-xs">
                  <div className="flex justify-between items-center">
                    <span>Material Volume</span>
                    <span className="font-bold">{result.volumeYards3} yd³ ({result.tons} tons)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Removal Method</span>
                    <span className="font-bold">{inputs.method === 'mill' ? 'Milling' : 'Full-Depth'} (x{result.methodMultiplier})</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Complexity Factor</span>
                    <span className="font-bold">{inputs.projectComplexity} (x{result.complexityMultiplier})</span>
                  </div>
                  <div className="pt-2 border-t border-white/20">
                    <div className="flex justify-between items-center text-[#10B981]">
                      <span className="font-bold">Total Project Cost</span>
                      <span className="font-bold text-lg">${result.finalTotal}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Breakdown */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#885C09]/10">
              <h3 className="font-bold text-[#291901] text-sm uppercase tracking-wide flex items-center gap-2 mb-4">
                <AlertTriangle className="w-4 h-4 text-[#9A690F]" /> Detailed Cost Breakdown
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <span className="text-xs font-medium">Base Removal Cost</span>
                  <span className="font-bold text-[#10B981]">${result.baseCost}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs">Disposal ({result.tons} tons)</span>
                  <span className="font-bold text-[#10B981]">${result.disposal}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs">Haul ({result.tons} tons)</span>
                  <span className="font-bold text-[#10B981]">${result.haul}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs">Labor Costs</span>
                  <span className="font-bold text-[#10B981]">${result.laborCost}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs">Equipment Costs</span>
                  <span className="font-bold text-[#10B981]">${result.equipmentCost}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs">Permits & Fees</span>
                  <span className="font-bold text-[#10B981]">${result.permitsAndFees}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs">Traffic Control</span>
                  <span className="font-bold text-[#10B981]">${result.trafficControl}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                  <span className="text-xs font-medium">Subtotal</span>
                  <span className="font-bold text-[#10B981]">${result.subtotal}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs">Regional Adjustment (x{inputs.regionalMultiplier})</span>
                  <span className="font-bold text-[#10B981]">${result.regionalAdjusted}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs">Recycling Savings</span>
                  <span className="font-bold text-[#10B981]">-${result.recyclingSavings}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                  <span className="text-sm font-bold">Final Total</span>
                  <span className="text-lg font-black text-[#10B981]">${result.finalTotal}</span>
                </div>
              </div>
            </div>

            {/* Timeline Estimate */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#885C09]/10">
              <h3 className="font-bold text-[#291901] text-sm uppercase tracking-wide flex items-center gap-2 mb-4">
                <Clock className="w-4 h-4 text-[#9A690F]" /> Project Timeline
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs">Estimated Duration</span>
                  <span className="font-bold text-[#10B981]">{Math.max(1, Math.ceil(inputs.areaSqFt / 1000))} days</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs">Crew Size</span>
                  <span className="font-bold text-[#10B981]">3-5 workers</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs">Equipment Needed</span>
                  <span className="font-bold text-[#10B981]">{inputs.method === 'mill' ? 'Milling Machine' : 'Excavator + Loader'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs">Truckloads</span>
                  <span className="font-bold text-[#10B981]">{Math.ceil(result.tons / 20)} loads</span>
                </div>
              </div>
              
              <div className="mt-4 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <Recycle className="w-4 h-4 text-[#10B981]" />
                  <span className="text-xs text-slate-600">
                    Recycling {result.tons} tons saves ${result.recyclingSavings} and reduces landfill impact
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>            <div className="text-center mt-6">
                <p className="text-[#885C09] text-sm">
                    Disclaimer: Always consult with a licensed contractor or engineer for precise project planning. Results are for informational purposes only.
                    <br></br>
                    Powered by <a href="https://asphaltcalculatorusa.com" className="text-[#9A690F] font-bold hover:underline" target="_blank" rel="noopener noreferrer">AsphaltCalculatorUSA.com</a>
                </p>
            </div>
    </div>
  );
};

export default AsphaltRemovalCostCalculator;
