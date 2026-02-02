import React, { useState, useEffect, useRef, useCallback } from 'react';
import Layout from '../components/Layout';
import {
  ArrowRight, Check, Grid, Ruler, BoxSelect, PaintRoller, Activity,
  CheckCircle2, DollarSign, PaintBucket, Layers, Droplets, ListChecks
} from 'lucide-react';

// ----------------------------------------------------------------------
// TYPES
// ----------------------------------------------------------------------

export type InputMode = 'ITEM_COUNT' | 'LINEAR_FEET';

export enum CabinetCondition {
  RAW_WOOD = "Raw Wood (Unfinished)",
  PREVIOUSLY_PAINTED = "Previously Painted",
  OAK_GRAIN = "Oak / Open Grain (Needs Fill)",
  LAMINATE = "Laminate / Thermofoil (Slick)"
}

export enum FinishQuality {
  DIY_KIT = "DIY Brush/Roll Kit",
  PRO_SPRAY = "Professional Spray Finish"
}

export interface CabinetInputs {
  mode: InputMode;
  uppers: number;
  lowers: number;
  drawers: number;
  pantries: number;
  island: boolean;
  linearFeet: number;
  condition: CabinetCondition;
  finishQuality: FinishQuality;
  cabinetColor: string;
}

export interface CalculationResult {
  totalSurfaceAreaSqFt: number;
  totalDoorCount: number;
  totalDrawerCount: number;
  gallonsPrimer: number;
  gallonsPaint: number;
  materialCost: { min: number; max: number };
  laborCost: { min: number; max: number };
  totalCost: { min: number; max: number };
  prepDifficulty: 'Low' | 'Medium' | 'High';
}

// ----------------------------------------------------------------------
// CONSTANTS
// ----------------------------------------------------------------------

const AREA_PER_UPPER_DOOR = 12; // sq ft (includes box frame)
const AREA_PER_LOWER_DOOR = 14; // sq ft
const AREA_PER_DRAWER = 4;      // sq ft
const AREA_PER_PANTRY = 35;     // sq ft
const AREA_PER_LINEAR_FOOT = 20; // Average upper + lower combo per foot
const ISLAND_SQFT = 40;

const PAINT_COVERAGE = 350; // sq ft per gallon
const PRIMER_COVERAGE = 300; // sq ft per gallon

const PRICE_GALLON_CABINET_PAINT = 85; // High end enamel
const PRICE_GALLON_PRIMER = 60; // Bonding primer
const DIY_SUPPLIES_COST = 120; // Tape, plastic, sandpaper, rollers

const PRO_LABOR_PER_OPENING = 120; // Average pro cost per door/drawer
const PRO_LABOR_PER_LIN_FT = 250;

const PREP_FACTOR: Record<CabinetCondition, number> = {
  [CabinetCondition.RAW_WOOD]: 1.0,
  [CabinetCondition.PREVIOUSLY_PAINTED]: 1.2,
  [CabinetCondition.OAK_GRAIN]: 1.5,
  [CabinetCondition.LAMINATE]: 1.3
};

const CABINET_COLORS = [
  '#ffffff', '#1e293b', '#4a5d4e', '#3f3f46',
  '#71717a', '#f1f5f9', '#451a03', '#0f172a',
];

// ----------------------------------------------------------------------
// COMPONENT: KitchenVisualizer
// ----------------------------------------------------------------------

interface KitchenVisualizerProps {
  color: string;
  uppers: number;
  lowers: number;
  drawers: number;
  island: boolean;
  pantries: number;
}

const KitchenVisualizer: React.FC<KitchenVisualizerProps> = ({
  color, uppers, lowers, drawers, island, pantries
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  const CAP = 50;
  const safeUppers = Math.min(Math.max(0, uppers), CAP);
  const safeLowers = Math.min(Math.max(0, lowers), CAP);
  const safeDrawers = Math.min(Math.max(0, drawers), CAP);
  const safePantries = Math.min(Math.max(0, pantries), 10);

  const numDrawerStacks = Math.ceil(safeDrawers / 3);

  useEffect(() => {
    const calculateScale = () => {
      if (containerRef.current && contentRef.current) {
        const parentWidth = containerRef.current.clientWidth;
        const availableWidth = parentWidth - 64;
        const contentWidth = contentRef.current.scrollWidth;
        const newScale = contentWidth > availableWidth ? availableWidth / contentWidth : 1;
        setScale(newScale);
      }
    };
    calculateScale();
    window.addEventListener('resize', calculateScale);
    return () => window.removeEventListener('resize', calculateScale);
  }, [safeUppers, safeLowers, safeDrawers, safePantries, island]);

  const cabinetStyle = { backgroundColor: color, borderColor: 'rgba(0,0,0,0.1)' };
  const handleStyle = { backgroundColor: '#cbd5e1' };

  return (
    <div className="w-full h-80 flex flex-col bg-slate-50 rounded-xl border border-slate-200 relative overflow-hidden shadow-inner group">
      <div className="absolute inset-0 bg-slate-100 opacity-50 z-0"></div>
      <div className="absolute bottom-0 w-full h-1/4 bg-gradient-to-t from-slate-200 to-transparent opacity-50 z-0"></div>
      <div ref={containerRef} className="absolute inset-0 flex items-center justify-center z-10 overflow-hidden">
        <div ref={contentRef} className="flex flex-col gap-0 items-center transition-transform duration-300 origin-center" style={{ transform: `scale(${scale})` }}>
          <div className="flex flex-col gap-0 min-w-max px-4">
            <div className="flex items-start gap-1 h-32 pt-4 pl-0.5 justify-center">
              {Array.from({ length: safePantries }).map((_, i) => (
                <div key={`pantry-space-${i}`} className="w-16 h-full"></div>
              ))}
              {Array.from({ length: safeUppers }).map((_, i) => (
                <div key={`upper-${i}`} className="w-12 h-20 bg-slate-200 border border-black/10 shadow-sm relative rounded-sm shrink-0" style={cabinetStyle}>
                  <div className="absolute bottom-3 right-2 w-1 h-4 rounded-full shadow-sm" style={handleStyle}></div>
                  <div className="absolute inset-2 border border-black/5 opacity-50"></div>
                </div>
              ))}
              {safeUppers === 0 && safePantries === 0 && (
                <div className="h-20 w-48 border-b-2 border-slate-200 opacity-50 flex items-center justify-center text-xs text-slate-300">No Uppers</div>
              )}
            </div>
            <div className="flex items-start gap-1 h-32 -mt-4 pl-0.5 justify-center">
              {Array.from({ length: safePantries }).map((_, i) => (
                <div key={`pantry-${i}`} className="w-16 h-52 -mt-24 bg-slate-200 border border-black/10 shadow-sm relative rounded-sm shrink-0 z-20 flex flex-col justify-center items-end pr-2" style={cabinetStyle}>
                  <div className="w-1 h-8 rounded-full shadow-sm" style={handleStyle}></div>
                  <div className="absolute inset-3 border border-black/5 opacity-50"></div>
                </div>
              ))}
              {Array.from({ length: numDrawerStacks }).map((_, stackIndex) => {
                const isLastStack = stackIndex === numDrawerStacks - 1;
                const remainder = safeDrawers % 3;
                const countInStack = (isLastStack && remainder !== 0) ? remainder : 3;
                return (
                  <div key={`drawer-stack-${stackIndex}`} className="w-12 h-24 flex flex-col gap-0.5 shrink-0">
                    {Array.from({ length: countInStack }).map((_, dIndex) => (
                      <div key={dIndex} className="flex-1 border border-black/10 shadow-sm relative rounded-sm" style={cabinetStyle}>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-1 rounded-full shadow-sm" style={handleStyle}></div>
                      </div>
                    ))}
                    {countInStack < 3 && <div className="flex-grow"></div>}
                  </div>
                );
              })}
              {Array.from({ length: safeLowers }).map((_, i) => (
                <div key={`lower-${i}`} className="w-12 h-24 bg-slate-200 border border-black/10 shadow-sm relative rounded-sm shrink-0" style={cabinetStyle}>
                  <div className="absolute top-3 right-2 w-1 h-4 rounded-full shadow-sm" style={handleStyle}></div>
                  <div className="absolute inset-2 border border-black/5 opacity-50"></div>
                </div>
              ))}
            </div>
          </div>
          {island && (
            <div className="mt-4 w-48 h-16 bg-white border-t-8 border-slate-300 shadow-2xl flex items-center justify-center rounded-t-lg z-30" style={{ backgroundColor: color }}>
              <div className="w-full h-full opacity-20 bg-black/10"></div>
              <span className="absolute -top-6 text-[10px] uppercase font-bold text-slate-500 bg-white/60 px-2 py-0.5 rounded backdrop-blur-md shadow-sm border border-white/50">Island</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------
// COMPONENT: ResultsCard
// ----------------------------------------------------------------------

interface ResultsCardProps {
  results: CalculationResult;
  inputs: CabinetInputs;
  onReset: () => void;
}

const ResultsCard: React.FC<ResultsCardProps> = ({ results, inputs, onReset }) => {
  const isDIY = inputs.finishQuality === FinishQuality.DIY_KIT;

  const getPrepSteps = (condition: CabinetCondition) => {
    switch (condition) {
      case CabinetCondition.RAW_WOOD:
        return [
          "Clean surfaces to remove dust and debris.",
          "Lightly sand with 220-grit sandpaper to knock down raised grain.",
          "Apply 1 full coat of high-quality wood primer.",
          "Lightly sand primer smooth, then apply 2 coats of cabinet enamel."
        ];
      case CabinetCondition.OAK_GRAIN:
        return [
          "Deep clean and degrease thoroughly (TSP substitute).",
          "Scuff sand with 180-grit sandpaper.",
          "Apply grain filler (paste) to fill deep oak pores. Sand smooth.",
          "Apply high-build bonding primer to seal remaining texture.",
          "Apply 2 coats of self-leveling cabinet paint."
        ];
      case CabinetCondition.LAMINATE:
        return [
          "Clean with TSP substitute to remove all oils/waxes.",
          "Scuff sand to dull the sheen (careful not to peel the laminate).",
          "CRITICAL: Apply a bonding primer (e.g., STIX or BIN Shellac).",
          "Apply 2 coats of durable enamel paint (satin or semi-gloss)."
        ];
      case CabinetCondition.PREVIOUSLY_PAINTED:
      default:
        return [
          "Clean thoroughly with degreaser.",
          "Scuff sand existing paint or use a liquid deglosser.",
          "Repair chips/dents with wood filler and spot prime.",
          "Apply 2 coats of cabinet enamel."
        ];
    }
  };

  const prepSteps = getPrepSteps(inputs.condition);

  return (
    <div className="animate-in slide-in-from-bottom-8 duration-700 space-y-8">
      <div className="text-center space-y-2 mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-100 text-green-700 text-xs font-bold uppercase tracking-widest">
          <CheckCircle2 className="w-4 h-4" /> Estimate Complete
        </div>
        <h2 className="text-4xl font-black text-slate-900">Your Project Plan</h2>
        <p className="text-slate-500">
          {inputs.condition} cabinets finishing with {inputs.finishQuality}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Paint Gallons */}
        <div className="bg-brand-600 rounded-2xl p-6 text-white shadow-xl shadow-brand-500/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <PaintBucket className="w-24 h-24" />
          </div>
          <div className="relative z-10">
            <p className="text-brand-100 text-xs font-bold uppercase tracking-wider mb-1">Cabinet Paint</p>
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-black">{results.gallonsPaint}</span>
              <span className="text-lg font-medium opacity-80">gal</span>
            </div>
            <p className="text-xs text-brand-200 mt-2">Based on 2 coats coverage</p>
          </div>
        </div>
        {/* Primer Gallons */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden group hover:border-brand-200 transition-colors">
          <div className="absolute top-0 right-0 p-4 text-slate-100 group-hover:text-brand-50 transition-colors">
            <Droplets className="w-24 h-24" />
          </div>
          <div className="relative z-10">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Bonding Primer</p>
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-black text-slate-800">{results.gallonsPrimer}</span>
              <span className="text-lg font-medium text-slate-400">gal</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">1 coat needed for adhesion</p>
          </div>
        </div>
        {/* Surface Area */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden group hover:border-brand-200 transition-colors">
          <div className="absolute top-0 right-0 p-4 text-slate-100 group-hover:text-blue-50 transition-colors">
            <Ruler className="w-24 h-24" />
          </div>
          <div className="relative z-10">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Total Surface</p>
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-black text-slate-800">{results.totalSurfaceAreaSqFt}</span>
              <span className="text-lg font-medium text-slate-400">sq ft</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">Includes doors, drawers & frames</p>
          </div>
        </div>
        {/* Total Cost Range */}
        <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-brand-500 rounded-full blur-3xl opacity-30"></div>
          <div className="relative z-10">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Estimated Cost</p>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-white">${results.totalCost.min}</span>
              <span className="text-xl text-slate-500">-</span>
              <span className="text-3xl font-black text-white">${results.totalCost.max}</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">Materials {isDIY ? '& Supplies' : '+ Pro Labor'}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-6 text-lg">
            <ListChecks className="w-6 h-6 text-brand-500" /> Recommended Prep Process
          </h3>
          <div className="space-y-4">
            {prepSteps.map((step, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-50 text-brand-600 font-bold flex items-center justify-center text-sm border border-brand-100">
                  {index + 1}
                </div>
                <p className="text-slate-600 pt-1 leading-relaxed font-medium">{step}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 bg-yellow-50 p-4 rounded-xl border border-yellow-100 text-sm text-yellow-800">
            <strong>Pro Tip:</strong> 80% of a good paint job is in the prep. Do not skip the sanding or cleaning steps!
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <h4 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
              <Layers className="w-4 h-4 text-slate-400" /> Item Counts
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-slate-50">
                <span className="text-slate-500 text-sm">Doors</span>
                <span className="font-bold text-slate-900">{results.totalDoorCount}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-50">
                <span className="text-slate-500 text-sm">Drawers</span>
                <span className="font-bold text-slate-900">{results.totalDrawerCount}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-slate-500 text-sm">Total Pieces</span>
                <span className="font-bold text-brand-600 text-lg">{results.totalDoorCount + results.totalDrawerCount}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <h4 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
              <DollarSign className="w-4 h-4 text-slate-400" /> Cost Details
            </h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Materials</span>
                <span className="font-semibold text-slate-900">${results.materialCost.min} - ${results.materialCost.max}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Labor ({isDIY ? 'Savings' : 'Est.'})</span>
                <span className={`font-semibold ${isDIY ? 'text-green-600' : 'text-slate-900'}`}>
                  {isDIY ? `-$${results.laborCost.min}` : `$${results.laborCost.min} - ${results.laborCost.max}`}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4">
        <button onClick={onReset} className="w-full bg-slate-900 hover:bg-brand-600 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-slate-900/10">
          Start New Estimate <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------
// COMPONENT: CalculatorForm
// ----------------------------------------------------------------------

interface CalculatorFormProps {
  onAnalyze: (data: CabinetInputs) => void;
}

const CalculatorForm: React.FC<CalculatorFormProps> = ({ onAnalyze }) => {
  const [formData, setFormData] = useState<CabinetInputs>({
    mode: 'ITEM_COUNT',
    uppers: 10,
    lowers: 8,
    drawers: 6,
    pantries: 0,
    island: false,
    linearFeet: 20,
    condition: CabinetCondition.PREVIOUSLY_PAINTED,
    finishQuality: FinishQuality.DIY_KIT,
    cabinetColor: '#4a5d4e'
  });

  useEffect(() => {
    if (formData.mode === 'ITEM_COUNT') {
      const approxLinear = Math.ceil((formData.uppers * 1.5 + formData.lowers * 2 + formData.drawers * 1.5 + formData.pantries * 3) / 2);
      setFormData(prev => ({ ...prev, linearFeet: approxLinear }));
    }
  }, [formData.uppers, formData.lowers, formData.drawers, formData.pantries, formData.mode]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const isFormValid = formData.mode === 'LINEAR_FEET'
    ? formData.linearFeet > 0
    : (formData.uppers + formData.lowers + formData.drawers + formData.pantries) > 0;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-slate-100 p-1 rounded-xl flex shadow-inner">
        <button
          onClick={() => setFormData(prev => ({ ...prev, mode: 'ITEM_COUNT' }))}
          className={`flex-1 py-3 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${formData.mode === 'ITEM_COUNT' ? 'bg-white text-brand-600 shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <Grid className="w-4 h-4" /> By Cabinet Count
        </button>
        <button
          onClick={() => setFormData(prev => ({ ...prev, mode: 'LINEAR_FEET' }))}
          className={`flex-1 py-3 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${formData.mode === 'LINEAR_FEET' ? 'bg-white text-brand-600 shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <Ruler className="w-4 h-4" /> By Dimensions
        </button>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-8">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center text-brand-600">
            <BoxSelect className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-800">Kitchen Layout</h3>
            <p className="text-xs text-slate-500">Input your cabinet counts to generate a preview.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {formData.mode === 'LINEAR_FEET' ? (
            <div className="sm:col-span-2 space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Linear Feet of Cabinets</label>
              <div className="relative">
                <input
                  type="number" name="linearFeet" value={formData.linearFeet} onChange={handleInputChange}
                  className="w-full pl-4 pr-12 py-3 bg-slate-50 border-0 rounded-xl font-medium ring-1 ring-slate-200 focus:ring-2 focus:ring-brand-500 transition-all text-lg"
                />
                <span className="absolute right-4 top-3.5 text-slate-400 text-sm font-medium">ft</span>
              </div>
              <p className="text-xs text-slate-400 mt-2">Measure the wall length where cabinets are installed. Include both upper and lower runs.</p>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Upper Doors</label>
                <input type="number" name="uppers" value={formData.uppers} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border-0 rounded-xl font-medium ring-1 ring-slate-200 focus:ring-2 focus:ring-brand-500 transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Lower Doors</label>
                <input type="number" name="lowers" value={formData.lowers} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border-0 rounded-xl font-medium ring-1 ring-slate-200 focus:ring-2 focus:ring-brand-500 transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Drawers</label>
                <input type="number" name="drawers" value={formData.drawers} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border-0 rounded-xl font-medium ring-1 ring-slate-200 focus:ring-2 focus:ring-brand-500 transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Tall Pantries</label>
                <input type="number" name="pantries" value={formData.pantries} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border-0 rounded-xl font-medium ring-1 ring-slate-200 focus:ring-2 focus:ring-brand-500 transition-all" />
              </div>
            </>
          )}

          <div className="sm:col-span-2 flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => setFormData(prev => ({ ...prev, island: !prev.island }))}>
            <div className={`w-6 h-6 rounded-md border flex items-center justify-center transition-colors ${formData.island ? 'bg-brand-500 border-brand-500 text-white' : 'bg-white border-slate-300'}`}>
              {formData.island && <Check className="w-4 h-4" />}
            </div>
            <span className="font-medium text-slate-700">Include Kitchen Island?</span>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-50">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-brand-500" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Live Preview</span>
          </div>

          <KitchenVisualizer
            color={formData.cabinetColor}
            uppers={formData.mode === 'LINEAR_FEET' ? Math.floor(formData.linearFeet / 2.5) : formData.uppers}
            lowers={formData.mode === 'LINEAR_FEET' ? Math.floor(formData.linearFeet / 2.5) : formData.lowers}
            drawers={formData.mode === 'LINEAR_FEET' ? 4 : formData.drawers}
            island={formData.island}
            pantries={formData.pantries}
          />
          <p className="text-xs text-center text-slate-400 mt-2">Preview updates automatically. Cabinets scale to fit screen.</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
            <PaintRoller className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-800">Project Specifics</h3>
            <p className="text-xs text-slate-500">Condition and Finish affect cost significantly.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Current Condition</label>
              <select name="condition" value={formData.condition} onChange={handleInputChange}
                className="w-full px-4 py-3 bg-slate-50 border-0 rounded-xl font-medium ring-1 ring-slate-200 focus:ring-2 focus:ring-purple-500 transition-all cursor-pointer">
                {Object.values(CabinetCondition).map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Desired Finish Level</label>
              <select name="finishQuality" value={formData.finishQuality} onChange={handleInputChange}
                className="w-full px-4 py-3 bg-slate-50 border-0 rounded-xl font-medium ring-1 ring-slate-200 focus:ring-2 focus:ring-purple-500 transition-all cursor-pointer">
                {Object.values(FinishQuality).map((q) => (
                  <option key={q} value={q}>{q}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Cabinet Color</label>
            <div className="flex flex-wrap gap-3">
              {CABINET_COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setFormData(prev => ({ ...prev, cabinetColor: c }))}
                  className={`w-12 h-12 rounded-full border-2 shadow-sm transition-transform hover:scale-110 flex items-center justify-center
                        ${formData.cabinetColor === c ? 'border-brand-500 scale-110 ring-2 ring-brand-200' : 'border-slate-200'}`}
                  style={{ backgroundColor: c }}
                >
                  {formData.cabinetColor === c && <Check className={`w-5 h-5 ${c === '#ffffff' || c === '#f1f5f9' ? 'text-slate-800' : 'text-white'} opacity-80`} />}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-4">Select the closest match to your desired finish color.</p>
          </div>
        </div>
      </div>

      <div className="pt-4">
        <button
          onClick={() => onAnalyze(formData)}
          disabled={!isFormValid}
          className={`w-full py-5 px-6 rounded-xl font-bold text-xl shadow-xl transition-all duration-300 flex items-center justify-center gap-3
            ${isFormValid
              ? 'bg-slate-900 hover:bg-brand-600 text-white transform hover:-translate-y-1 shadow-slate-900/20'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
        >
          Calculate Paint Cost <ArrowRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------
// COMPONENT: MAIN (KitchenCabinetCalculator)
// ----------------------------------------------------------------------

const KitchenCabinetCalculator: React.FC = () => {
  const [appState, setAppState] = useState<'INPUT' | 'RESULT'>('INPUT');
  const [currentInputs, setCurrentInputs] = useState<CabinetInputs | null>(null);
  const [result, setResult] = useState<CalculationResult | null>(null);

  const calculate = useCallback((inputs: CabinetInputs): CalculationResult => {
    let totalSqFt = 0;
    let doorCount = 0;
    let drawerCount = 0;

    if (inputs.mode === 'LINEAR_FEET') {
      totalSqFt = inputs.linearFeet * AREA_PER_LINEAR_FOOT;
      doorCount = Math.ceil(inputs.linearFeet / 1.5);
      drawerCount = Math.ceil(inputs.linearFeet / 4);
    } else {
      totalSqFt = (inputs.uppers * AREA_PER_UPPER_DOOR) +
        (inputs.lowers * AREA_PER_LOWER_DOOR) +
        (inputs.drawers * AREA_PER_DRAWER) +
        (inputs.pantries * AREA_PER_PANTRY);
      doorCount = inputs.uppers + inputs.lowers + (inputs.pantries * 2);
      drawerCount = inputs.drawers;
    }

    if (inputs.island) {
      totalSqFt += ISLAND_SQFT;
      doorCount += 2;
      drawerCount += 2;
    }

    const paintNeeded = (totalSqFt * 2) / PAINT_COVERAGE;
    const primerNeeded = totalSqFt / PRIMER_COVERAGE;
    const gallonsPaint = Math.ceil(paintNeeded * 10) / 10;
    const gallonsPrimer = Math.ceil(primerNeeded * 10) / 10;
    const prepMult = PREP_FACTOR[inputs.condition];
    const paintCost = gallonsPaint * PRICE_GALLON_CABINET_PAINT;
    const primerCost = gallonsPrimer * PRICE_GALLON_PRIMER;
    const supplies = DIY_SUPPLIES_COST * prepMult;
    const matMin = Math.round(paintCost + primerCost + supplies);
    const matMax = Math.round(matMin * 1.2);

    let laborBase = 0;
    if (inputs.mode === 'LINEAR_FEET') {
      laborBase = inputs.linearFeet * PRO_LABOR_PER_LIN_FT;
    } else {
      laborBase = (doorCount + drawerCount) * PRO_LABOR_PER_OPENING;
    }

    const laborMin = Math.round(laborBase * prepMult);
    const laborMax = Math.round(laborMin * 1.3);
    const isDIY = inputs.finishQuality === FinishQuality.DIY_KIT;
    const finalLaborMin = isDIY ? 0 : laborMin;
    const finalLaborMax = isDIY ? 0 : laborMax;
    let difficulty: 'Low' | 'Medium' | 'High' = 'Medium';
    if (inputs.condition === CabinetCondition.RAW_WOOD) difficulty = 'Low';
    if (inputs.condition === CabinetCondition.OAK_GRAIN || inputs.condition === CabinetCondition.PREVIOUSLY_PAINTED) difficulty = 'High';

    return {
      totalSurfaceAreaSqFt: Math.round(totalSqFt),
      totalDoorCount: Math.round(doorCount),
      totalDrawerCount: Math.round(drawerCount),
      gallonsPaint,
      gallonsPrimer,
      materialCost: { min: matMin, max: matMax },
      laborCost: { min: laborMin, max: laborMax },
      totalCost: { min: matMin + finalLaborMin, max: matMax + finalLaborMax },
      prepDifficulty: difficulty
    };
  }, []);

  const handleStartAnalysis = (inputs: CabinetInputs) => {
    const calculatedResult = calculate(inputs);
    setCurrentInputs(inputs);
    setResult(calculatedResult);
    setAppState('RESULT');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReset = () => {
    setAppState('INPUT');
    setCurrentInputs(null);
    setResult(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (

    <div className="glass-panel rounded-[2rem] shadow-2xl p-6 sm:p-8 md:p-12 relative overflow-hidden ring-1 ring-slate-900/5 min-h-[600px]">
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 -mt-40 -mr-40 w-[500px] h-[500px] bg-brand-500/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 -mb-40 -ml-40 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      {appState === 'INPUT' && (
        <div className="relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
          <div className="text-center mb-12 max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
              Kitchen Cabinet Paint Estimator
            </h2>
            <p className="text-lg text-slate-500">
              Calculate accurate material needs and costs for transforming your kitchen cabinets.
            </p>
          </div>
          <CalculatorForm onAnalyze={handleStartAnalysis} />
        </div>
      )}

      {appState === 'RESULT' && result && currentInputs && (
        <ResultsCard results={result} inputs={currentInputs} onReset={handleReset} />
      )}
    </div>

  );
}

export default KitchenCabinetCalculator;