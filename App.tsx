import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Layout from './components/Layout';
import CompactLayout from './components/CompactLayout';

// ============================================
// TOOL IMPORTS - Add new tools here
// ============================================
import BeardedDragonDietCalculator from './tools/BeardedDragonDietCalculator';
import BeardedDragonInsectFeedCalculator from './tools/BeardedDragonInsectFeedCalculator';
import BeardedDragonHabitatGuide from './tools/BeardedDragonHabitatGuide';
import AsphaltDrivewayCalculator from './tools/AsphaltDrivewayCalculator';

// ============================================
// DASHBOARD
// ============================================
const Dashboard = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 text-brand-900">Bearded Dragon Tools</h1>

      <ul className="space-y-3">
        <li>
          <Link to="/diet" className="text-brand-600 hover:text-brand-800 hover:underline transition-colors">
            Diet Calculator
          </Link>
          {' - '}<code className="text-sm text-gray-500">/diet</code>
        </li>
        <li>
          <Link to="/insects" className="text-brand-600 hover:text-brand-800 hover:underline transition-colors">
            Insect Feed Calculator
          </Link>
          {' - '}<code className="text-sm text-gray-500">/insects</code>
        </li>
        <li>
          <Link to="/habitat" className="text-brand-600 hover:text-brand-800 hover:underline transition-colors">
            Habitat Guide
          </Link>
          {' - '}<code className="text-sm text-gray-500">/habitat</code>
        </li>
        <li>
          <Link to="/driveway-cost" className="text-brand-600 hover:text-brand-800 hover:underline transition-colors">
            Driveway Cost Calculator
          </Link>
          {' - '}<code className="text-sm text-gray-500">/driveway-cost</code>
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
        <Route path="/diet" element={<CompactLayout><BeardedDragonDietCalculator /></CompactLayout>} />
        <Route path="/insects" element={<CompactLayout><BeardedDragonInsectFeedCalculator /></CompactLayout>} />
        <Route path="/habitat" element={<CompactLayout><BeardedDragonHabitatGuide /></CompactLayout>} />
        <Route path="/driveway-cost" element={<CompactLayout><AsphaltDrivewayCalculator /></CompactLayout>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
