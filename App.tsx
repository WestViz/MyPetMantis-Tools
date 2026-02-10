import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Layout from './components/Layout';
import CompactLayout from './components/CompactLayout';

// ============================================
// TOOL IMPORTS - Add new tools here
// ============================================
import GeckoDietCalculator from './tools/GeckoDietCalculator';
import GeckoHabitatCalculator from './tools/GeckoHabitatCalculator';
import GeckoCommonIssuesDiagnoseCalculator from './tools/GeckoCommonIssuesDiagnoseCalculator';

// ============================================
// DASHBOARD
// ============================================
const Dashboard = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 text-brand-900">Gecko Tools</h1>

      <ul className="space-y-3">
        <li>
          <Link to="/diet" className="text-brand-600 hover:text-brand-800 hover:underline transition-colors">
            Diet Calculator
          </Link>
          {' - '}<code className="text-sm text-gray-500">/diet</code>
        </li>
        <li>
          <Link to="/habitat" className="text-brand-600 hover:text-brand-800 hover:underline transition-colors">
            Habitat Calculator
          </Link>
          {' - '}<code className="text-sm text-gray-500">/habitat</code>
        </li>
        <li>
          <Link to="/diagnose" className="text-brand-600 hover:text-brand-800 hover:underline transition-colors">
            Health Diagnosis
          </Link>
          {' - '}<code className="text-sm text-gray-500">/diagnose</code>
        </li>
      </ul>

      <p className="mt-8 text-gray-600 text-sm">
        Add new tools in the <code className="bg-gray-100 px-1 rounded">tools/</code> folder and update the imports above.
      </p>
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
        <Route path="/" element={<Layout><Dashboard /></Layout>} />
        <Route path="/diet" element={<CompactLayout><GeckoDietCalculator /></CompactLayout>} />
        <Route path="/habitat" element={<CompactLayout><GeckoHabitatCalculator /></CompactLayout>} />
        <Route path="/diagnose" element={<CompactLayout><GeckoCommonIssuesDiagnoseCalculator /></CompactLayout>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
