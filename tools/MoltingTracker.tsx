import React, { useState, useEffect } from 'react';
import {
    Calendar, Clock, AlertTriangle, CheckCircle2,
    TrendingUp, Camera, Plus, Info, Trash2,
    Moon, Sun, Flame, Droplets, XCircle
} from 'lucide-react';
import { IframeHeightReporter } from '../components/IframeHeightReporter';

type MantisSpecies = 'chinese' | 'carolina' | 'european' | 'orchid' | 'flower' | 'other';
type InstarStage = 'L1' | 'L2' | 'L3' | 'L4' | 'L5' | 'L6' | 'L7' | 'L8' | 'adult';

interface MoltRecord {
    id: string;
    date: string;
    instarStage: InstarStage;
    previousStage: InstarStage | null;
    temperature: number;
    humidity: number;
    success: boolean;
    notes?: string;
    photoUrl?: string;
}

interface MoltPrediction {
    nextStage: InstarStage | 'adult';
    estimatedDaysMin: number;
    estimatedDaysMax: number;
    estimatedDateMin: Date;
    estimatedDateMax: Date;
    temperatureFactor: number;
}

const SPECIES_CONFIG = {
    chinese: { name: 'Chinese Mantis', totalInstars: 8, moltIntervalDays: [10, 14] as [number, number] },
    carolina: { name: 'Carolina Mantis', totalInstars: 7, moltIntervalDays: [12, 16] as [number, number] },
    european: { name: 'European Mantis', totalInstars: 7, moltIntervalDays: [12, 16] as [number, number] },
    orchid: { name: 'Orchid Mantis', totalInstars: 6, moltIntervalDays: [14, 18] as [number, number] },
    flower: { name: 'Flower Mantis', totalInstars: 6, moltIntervalDays: [14, 18] as [number, number] },
    other: { name: 'Other Species', totalInstars: 7, moltIntervalDays: [12, 16] as [number, number] },
};

const INSTAR_ORDER: InstarStage[] = ['L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7', 'L8', 'adult'];

const MoltingTracker: React.FC = () => {
    const [species, setSpecies] = useState<MantisSpecies>('chinese');
    const [currentStage, setCurrentStage] = useState<InstarStage>('L4');
    const [currentTemp, setCurrentTemp] = useState<number>(26);
    const [molts, setMolts] = useState<MoltRecord[]>([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newMolt, setNewMolt] = useState<Partial<MoltRecord>>({
        date: new Date().toISOString().split('T')[0],
        instarStage: 'L1',
        previousStage: null,
        temperature: 26,
        humidity: 50,
        success: true,
        notes: ''
    });

    // Calculate next molt prediction
    const predictNextMolt = (): MoltPrediction | null => {
        if (currentStage === 'adult') return null;
        
        const config = SPECIES_CONFIG[species];
        const currentIndex = INSTAR_ORDER.indexOf(currentStage);
        
        if (currentIndex === -1 || currentIndex >= INSTAR_ORDER.length - 1) return null;
        
        const nextStage = INSTAR_ORDER[currentIndex + 1];
        const [baseDaysMin, baseDaysMax] = config.moltIntervalDays;
        
        // Temperature adjustment: higher temp = faster molt
        const tempFactor = (30 - currentTemp) * 0.1; // ~1 day per 1°C deviation from optimal
        const adjustedMin = Math.max(5, Math.round(baseDaysMin + tempFactor));
        const adjustedMax = Math.max(8, Math.round(baseDaysMax + tempFactor));
        
        const lastMolt = molts.find(m => m.instarStage === currentStage);
        const referenceDate = lastMolt ? new Date(lastMolt.date) : new Date();
        
        return {
            nextStage,
            estimatedDaysMin: adjustedMin,
            estimatedDaysMax: adjustedMax,
            estimatedDateMin: new Date(referenceDate.getTime() + adjustedMin * 24 * 60 * 60 * 1000),
            estimatedDateMax: new Date(referenceDate.getTime() + adjustedMax * 24 * 60 * 60 * 1000),
            temperatureFactor: tempFactor
        };
    };

    const prediction = predictNextMolt();
    const lastMolt = molts.length > 0 ? molts[0] : null;

    const formatDate = (date: Date): string => {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const getDaysUntil = (date: Date): number => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const target = new Date(date);
        target.setHours(0, 0, 0, 0);
        return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    };

    const addMolt = () => {
        if (!newMolt.date || !newMolt.instarStage) return;
        
        const molt: MoltRecord = {
            id: Date.now().toString(),
            date: newMolt.date!,
            instarStage: newMolt.instarStage!,
            previousStage: newMolt.previousStage,
            temperature: newMolt.temperature || 26,
            humidity: newMolt.humidity || 50,
            success: newMolt.success !== false,
            notes: newMolt.notes,
            photoUrl: newMolt.photoUrl
        };
        
        setMolts([molt, ...molts]);
        setShowAddForm(false);
        setNewMolt({
            date: new Date().toISOString().split('T')[0],
            instarStage: 'L1',
            previousStage: null,
            temperature: 26,
            humidity: 50,
            success: true,
            notes: ''
        });
        
        // Update current stage to latest
        setCurrentStage(molt.instarStage);
    };

    const deleteMolt = (id: string) => {
        setMolts(molts.filter(m => m.id !== id));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 font-sans">
            <IframeHeightReporter />
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 text-white">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMCAwaDQwdjQwSDBWMHptMjAgMjBoMjB2MjBIMjBWMjB6TTAgMjBoMjB2MjBIMFYyMHoyMCAwaDIwdjIwSDIwVjB6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
                <div className="relative max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center p-4 bg-white/10 backdrop-blur-sm rounded-2xl mb-6 shadow-lg ring-1 ring-white/20">
                            <Moon className="w-12 h-12" />
                        </div>
                        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
                            Molting Tracker
                        </h1>
                        <p className="text-xl text-white/90 max-w-2xl mx-auto">
                            Track molts and predict upcoming sheds for your mantis
                        </p>
                    </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-slate-50/50 to-transparent"></div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10 pb-16 space-y-6">
                
                {/* Current Status Card */}
                <div className="bg-white rounded-3xl shadow-xl ring-1 ring-slate-900/5 overflow-hidden">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm text-white/80 mb-1">Current Status</div>
                                <div className="text-3xl font-extrabold">{currentStage}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm text-white/80 mb-1">Species</div>
                                <div className="text-xl font-bold">{SPECIES_CONFIG[species].name}</div>
                            </div>
                        </div>
                    </div>
                    <div className="p-6">
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm text-slate-500 font-semibold uppercase mb-2 block">Species</label>
                                <select
                                    value={species}
                                    onChange={(e) => setSpecies(e.target.value as MantisSpecies)}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 font-semibold"
                                >
                                    {Object.entries(SPECIES_CONFIG).map(([key, config]) => (
                                        <option key={key} value={key}>{config.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-sm text-slate-500 font-semibold uppercase mb-2 block">Current Stage</label>
                                <select
                                    value={currentStage}
                                    onChange={(e) => setCurrentStage(e.target.value as InstarStage)}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 font-semibold"
                                >
                                    {INSTAR_ORDER.map(stage => (
                                        <option key={stage} value={stage}>{stage}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        
                        <div className="mt-4">
                            <label className="text-sm text-slate-500 font-semibold uppercase mb-2 block">
                                Current Temperature ({currentTemp}°C)
                            </label>
                            <input
                                type="range"
                                min="20"
                                max="35"
                                step="1"
                                value={currentTemp}
                                onChange={(e) => setCurrentTemp(parseInt(e.target.value))}
                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                            />
                            <div className="flex justify-between text-xs text-slate-400 mt-1">
                                <span>20°C (slow)</span>
                                <span>35°C (fast)</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Next Molt Prediction */}
                {prediction && (
                    <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl shadow-2xl overflow-hidden">
                        <div className="text-white p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-white/20 rounded-lg">
                                    <TrendingUp className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="text-sm text-white/80">Next Molt Prediction</div>
                                    <div className="text-2xl font-extrabold">{currentStage} → {prediction.nextStage}</div>
                                </div>
                            </div>
                            
                            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6">
                                <div className="grid sm:grid-cols-2 gap-6">
                                    <div>
                                        <div className="text-sm text-white/80 mb-2">Estimated Date</div>
                                        <div className="text-3xl font-extrabold">
                                            {formatDate(prediction.estimatedDateMin)} - {formatDate(prediction.estimatedDateMax)}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-white/80 mb-2">Days Until</div>
                                        <div className="text-3xl font-extrabold">
                                            {getDaysUntil(prediction.estimatedDateMin)}-{getDaysUntil(prediction.estimatedDateMax)}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="mt-4 pt-4 border-t border-white/20">
                                    <div className="text-sm text-white/90">
                                        💡 Based on {SPECIES_CONFIG[species].name} development rate at {currentTemp}°C
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Pre-Molt Alerts */}
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-3xl p-6">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-amber-500 rounded-xl flex-shrink-0">
                            <AlertTriangle className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <div className="font-bold text-amber-900 text-lg mb-3">Pre-Molt Checklist</div>
                            <ul className="space-y-2 text-amber-800">
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                    <span>Stop feeding 1-2 days before molt (mantis will refuse food)</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                    <span>Increase humidity to 60-70% during molt</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                    <span>Remove uneaten prey immediately (prey can injure molting mantis)</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                    <span>Provide vertical climbing space for successful molt</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Add Molt Button */}
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white p-4 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-3 group"
                >
                    <Plus className="w-5 h-5" />
                    <span className="font-bold">Record New Molt</span>
                </button>

                {/* Add Molt Form */}
                {showAddForm && (
                    <div className="bg-white rounded-3xl shadow-xl ring-1 ring-slate-900/5 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4">
                            <h3 className="text-lg font-bold">Record Molt</h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm text-slate-500 font-semibold uppercase mb-2 block">Molt Date</label>
                                    <input
                                        type="date"
                                        value={newMolt.date}
                                        onChange={(e) => setNewMolt({ ...newMolt, date: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-slate-500 font-semibold uppercase mb-2 block">Stage After Molt</label>
                                    <select
                                        value={newMolt.instarStage}
                                        onChange={(e) => setNewMolt({ ...newMolt, instarStage: e.target.value as InstarStage })}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                                    >
                                        {INSTAR_ORDER.map(stage => (
                                            <option key={stage} value={stage}>{stage}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm text-slate-500 font-semibold uppercase mb-2 block">Temperature (°C)</label>
                                    <input
                                        type="number"
                                        value={newMolt.temperature}
                                        onChange={(e) => setNewMolt({ ...newMolt, temperature: parseInt(e.target.value) })}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-slate-500 font-semibold uppercase mb-2 block">Humidity (%)</label>
                                    <input
                                        type="number"
                                        value={newMolt.humidity}
                                        onChange={(e) => setNewMolt({ ...newMolt, humidity: parseInt(e.target.value) })}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-sm text-slate-500 font-semibold uppercase mb-2 block">Notes</label>
                                <textarea
                                    value={newMolt.notes}
                                    onChange={(e) => setNewMolt({ ...newMolt, notes: e.target.value })}
                                    placeholder="Any issues or observations during molt..."
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 resize-none"
                                    rows={3}
                                />
                            </div>

                            <label className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-200 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={newMolt.success}
                                    onChange={(e) => setNewMolt({ ...newMolt, success: e.target.checked })}
                                    className="w-5 h-5 rounded border-green-300 text-green-600 focus:ring-green-500"
                                />
                                <div>
                                    <div className="font-semibold text-green-900">Molt Successful</div>
                                    <div className="text-sm text-green-700">Uncheck if there were complications</div>
                                </div>
                            </label>

                            <div className="flex gap-3">
                                <button
                                    onClick={addMolt}
                                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all"
                                >
                                    Save Molt
                                </button>
                                <button
                                    onClick={() => setShowAddForm(false)}
                                    className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Molt History */}
                {molts.length > 0 && (
                    <div className="bg-white rounded-3xl shadow-xl ring-1 ring-slate-900/5 overflow-hidden">
                        <div className="bg-gradient-to-r from-slate-500 to-gray-600 text-white p-4 flex items-center justify-between">
                            <h3 className="text-lg font-bold">Molt History</h3>
                            <span className="text-sm text-white/80">{molts.length} records</span>
                        </div>
                        <div className="p-4">
                            {molts.map((molt, index) => (
                                <div key={molt.id} className="p-4 bg-slate-50 rounded-2xl mb-3 last:mb-0 relative group">
                                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => deleteMolt(molt.id)}
                                            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className={`p-2 rounded-lg ${molt.success ? 'bg-green-100' : 'bg-red-100'}`}>
                                            {molt.success ? <CheckCircle2 className="w-5 h-5 text-green-600" /> : <XCircle className="w-5 h-5 text-red-600" />}
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-900">{molt.instarStage} molt</div>
                                            <div className="text-sm text-slate-500">{formatDate(new Date(molt.date))}</div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 mt-3 text-sm">
                                        <div className="bg-white p-2 rounded-lg">
                                            <div className="text-xs text-slate-500">Temp</div>
                                            <div className="font-semibold text-slate-900">{molt.temperature}°C</div>
                                        </div>
                                        <div className="bg-white p-2 rounded-lg">
                                            <div className="text-xs text-slate-500">Humidity</div>
                                            <div className="font-semibold text-slate-900">{molt.humidity}%</div>
                                        </div>
                                        <div className="bg-white p-2 rounded-lg">
                                            <div className="text-xs text-slate-500">From</div>
                                            <div className="font-semibold text-slate-900">{molt.previousStage || 'N/A'}</div>
                                        </div>
                                    </div>
                                    {molt.notes && (
                                        <div className="mt-2 text-sm text-slate-600 bg-white p-2 rounded-lg">
                                            <Info className="w-4 h-4 inline mr-1" />
                                            {molt.notes}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {molts.length === 0 && (
                    <div className="bg-white rounded-3xl shadow-xl ring-1 ring-slate-900/5 p-12 text-center">
                        <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-slate-900 mb-2">No Molt Records Yet</h3>
                        <p className="text-slate-500 mb-6">Start tracking your mantis's growth by recording their first molt</p>
                        <button
                            onClick={() => setShowAddForm(true)}
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all"
                        >
                            <Plus className="w-5 h-5" />
                            Record First Molt
                        </button>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="py-8 text-center text-slate-500 text-sm">
                <p>Molting Tracker • Track growth, predict sheds, prevent failures</p>
            </div>
        </div>
    );
};

export default MoltingTracker;
