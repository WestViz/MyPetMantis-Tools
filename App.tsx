import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import CompactLayout from './components/CompactLayout';

// ============================================
// TOOL IMPORTS - Add new tools here
// ============================================
import MantisDietCalculator from './tools/MantisDietCalculator';
import MantisHabitatCalculator from './tools/MantisHabitatCalculator';
import MoltingTracker from './tools/MoltingTracker';
import HealthSymptomChecker from './tools/HealthSymptomChecker';
import SpeciesSelector from './tools/SpeciesSelector';

// ============================================
// DASHBOARD
// ============================================
const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-blue-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMCAwaDQwdjQwSDBWMHptMjAgMjBoMjB2MjBIMjBWMjB6TTAgMjBoMjB2MjBIMFYyMHoyMCAwaDIwdjIwSDIwVjB6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
        <div className="relative max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center p-4 bg-white/10 backdrop-blur-sm rounded-2xl mb-6 shadow-lg ring-1 ring-white/20">
              <span className="text-4xl">🦗</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
              Praying Mantis Tools
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Expert care calculators for your mantis companions
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-slate-50/50 to-transparent"></div>
      </div>

      {/* Tools Grid */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10 pb-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Diet Calculator Card */}
          <Link to="/diet" className="group relative bg-white rounded-3xl shadow-xl ring-1 ring-slate-900/5 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
                  <span className="text-xl">🍽️</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Diet Calculator</h2>
                  <div className="text-xs text-slate-500">Optimal feeding plan</div>
                </div>
              </div>
              <p className="text-sm text-slate-600 mb-4">
                Calculate prey size, feeding frequency, and nutrition recommendations
              </p>
              <div className="flex items-center gap-1.5 text-green-600 font-semibold text-sm group-hover:gap-2 transition-all">
                <span>Start Calculator</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>
          </Link>

          {/* Habitat Calculator Card */}
          <Link to="/habitat" className="group relative bg-white rounded-3xl shadow-xl ring-1 ring-slate-900/5 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
                  <span className="text-xl">🏠</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Habitat Calculator</h2>
                  <div className="text-xs text-slate-500">Perfect enclosure setup</div>
                </div>
              </div>
              <p className="text-sm text-slate-600 mb-4">
                Determine optimal enclosure size, temperature, humidity, and decor
              </p>
              <div className="flex items-center gap-1.5 text-blue-600 font-semibold text-sm group-hover:gap-2 transition-all">
                <span>Start Calculator</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>
          </Link>

          {/* Molting Tracker Card */}
          <Link to="/molting" className="group relative bg-white rounded-3xl shadow-xl ring-1 ring-slate-900/5 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl">
                  <span className="text-xl">🌙</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Molting Tracker</h2>
                  <div className="text-xs text-slate-500">Predict & record molts</div>
                </div>
              </div>
              <p className="text-sm text-slate-600 mb-4">
                Track molt history and predict upcoming sheds with temperature adjustments
              </p>
              <div className="flex items-center gap-1.5 text-purple-600 font-semibold text-sm group-hover:gap-2 transition-all">
                <span>Start Tracker</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>
          </Link>

          {/* Health Checker Card */}
          <Link to="/health" className="group relative bg-white rounded-3xl shadow-xl ring-1 ring-slate-900/5 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl">
                  <span className="text-xl">🩺</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Health Checker</h2>
                  <div className="text-xs text-slate-500">Symptom diagnosis</div>
                </div>
              </div>
              <p className="text-sm text-slate-600 mb-4">
                Identify health issues and get treatment recommendations
              </p>
              <div className="flex items-center gap-1.5 text-red-600 font-semibold text-sm group-hover:gap-2 transition-all">
                <span>Check Symptoms</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>
          </Link>

          {/* Species Selector Card */}
          <Link to="/species" className="group relative bg-white rounded-3xl shadow-xl ring-1 ring-slate-900/5 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 sm:col-span-2 lg:col-span-1">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
                  <span className="text-xl">🏆</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Species Selector</h2>
                  <div className="text-xs text-slate-500">Find your perfect match</div>
                </div>
              </div>
              <p className="text-sm text-slate-600 mb-4">
                Compare species, filter by criteria, and take a quiz to find the right mantis
              </p>
              <div className="flex items-center gap-1.5 text-indigo-600 font-semibold text-sm group-hover:gap-2 transition-all">
                <span>Find Species</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>
          </Link>
        </div>

        {/* Info Section */}
        <div className="mt-12 bg-white rounded-3xl shadow-xl ring-1 ring-slate-900/5 p-6 sm:p-8">
          <h3 className="text-xl font-bold text-slate-900 mb-4">About These Tools</h3>
          <p className="text-slate-600 leading-relaxed">
            These tools are designed for praying mantis enthusiasts, breeders, and pet owners. 
            Select your species and growth stage to get personalized care recommendations for diet, habitat, molting, and health. 
            Use the species selector to find the perfect mantis companion for your experience level and preferences.
            All guidelines are based on species-specific care requirements and best practices.
          </p>
        </div>

        {/* Footer Info */}
        <p className="mt-8 text-center text-slate-500 text-sm">
          Add new tools in the <code className="bg-slate-100 px-2 py-1 rounded">tools/</code> folder and update the imports above.
        </p>
      </div>
    </div>
  );
};

// ============================================
// APP ROUTER
// ============================================
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CompactLayout><Dashboard /></CompactLayout>} />
        <Route path="/diet" element={<CompactLayout><MantisDietCalculator /></CompactLayout>} />
        <Route path="/habitat" element={<CompactLayout><MantisHabitatCalculator /></CompactLayout>} />
        <Route path="/molting" element={<CompactLayout><MoltingTracker /></CompactLayout>} />
        <Route path="/health" element={<CompactLayout><HealthSymptomChecker /></CompactLayout>} />
        <Route path="/species" element={<CompactLayout><SpeciesSelector /></CompactLayout>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
