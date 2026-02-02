import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Layout from './components/Layout';
import CompactLayout from './components/CompactLayout';
import { PaintBucket, Hammer, ArrowRight } from 'lucide-react';

// ============================================
// TOOL IMPORTS - Add new tools here
// ============================================
import KitchenCabinetCalculator from './tools/KitchenCabinetCalculator';

import MuriaticAcidDosage from './tools/MuriaticAcidDosage';
import EvaporationCalculator from './tools/EvaporationCalculator';
import ElectricityCostCalculator from './tools/ElectricityCostCalculator';
import PoolCoverCalculator from './tools/PoolCoverCalculator';
import PhAdjustmentCalculator from './tools/PhAdjustmentCalculator';
import PoolShockCalculator from './tools/PoolShockCalculator';
import PoolHeatPumpCalculator from './tools/PoolHeatPumpCalculator';
import PoolSandCalculator from './tools/PoolSandCalculator';
import ChlorineDosageCalculator from './tools/ChlorineDosageCalculator';
import SodiumThiosulfateCalculator from './tools/SodiumThiosulfateCalculator';
import ToolTemplate from './tools/_TEMPLATE';


// ============================================
// DASHBOARD (for your reference/testing only)
// ============================================
const Dashboard = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Available Tools</h1>

      <ul className="space-y-3">
        <li>
          <Link to="/cabinet-estimator" className="text-blue-600 hover:underline">
            Cabinet Estimator
          </Link>
          {' - '}<code className="text-sm text-gray-500">/cabinet-estimator</code>
        </li>

        <li>
          <Link to="/tool-template" className="text-blue-600 hover:underline">
            Template
          </Link>
          {' - '}<code className="text-sm text-gray-500">/tool-template</code>
        </li>

        {/* === ADD NEW TOOL LINKS HERE === */}
        <li>
          <Link to="/acid-dosage" className="text-blue-600 hover:underline">
            Muriatic Acid Calculator
          </Link>
          {' - '}<code className="text-sm text-gray-500">/acid-dosage</code>
        </li>

        <li>
          <Link to="/evaporation" className="text-blue-600 hover:underline">
            Evaporation Loss Calculator
          </Link>
          {' - '}<code className="text-sm text-gray-500">/evaporation</code>
        </li>

        <li>
          <Link to="/electricity-cost" className="text-blue-600 hover:underline">
            Energy Cost Calculator
          </Link>
          {' - '}<code className="text-sm text-gray-500">/electricity-cost</code>
        </li>

        <li>
          <Link to="/cover-size" className="text-blue-600 hover:underline">
            Pool Cover Size
          </Link>
          {' - '}<code className="text-sm text-gray-500">/cover-size</code>
        </li>

        <li>
          <Link to="/ph-adjust" className="text-blue-600 hover:underline">
            pH Adjustment Calculator
          </Link>
          {' - '}<code className="text-sm text-gray-500">/ph-adjust</code>
        </li>

        <li>
          <Link to="/shock-calculator" className="text-blue-600 hover:underline">
            Pool Shock Dosage Calculator
          </Link>
          {' - '}<code className="text-sm text-gray-500">/shock-calculator</code>
        </li>

        <li>
          <Link to="/heat-pump" className="text-blue-600 hover:underline">
            Pool Heat Pump Calculator
          </Link>
          {' - '}<code className="text-sm text-gray-500">/heat-pump</code>
        </li>

        <li>
          <Link to="/sand-filter" className="text-blue-600 hover:underline">
            Pool Sand Amount Calculator
          </Link>
          {' - '}<code className="text-sm text-gray-500">/sand-filter</code>
        </li>

        <li>
          <Link to="/chlorine-dose" className="text-blue-600 hover:underline">
            Chlorine Dosage Calculator
          </Link>
          {' - '}<code className="text-sm text-gray-500">/chlorine-dose</code>
        </li>

        <li>
          <Link to="/thiosulfate" className="text-blue-600 hover:underline">
            Sodium Thiosulfate Calculator
          </Link>
          {' - '}<code className="text-sm text-gray-500">/thiosulfate</code>
        </li>
      </ul>
    </div>
  );
};


// ============================================
// APP ROUTER (SWITCHBOARD)
// ============================================
function App() {
  return (

    <BrowserRouter>
      {/* <Layout> wrapper removed to support per-route layouts */}
      <Routes>
        {/* Dashboard (for internal use) */}
        <Route path="/" element={<Layout><Dashboard /></Layout>} />

        {/* ===================================== */}
        {/* TOOL ROUTES - Add new routes here    */}
        {/* ===================================== */}
        <Route path="/cabinet-estimator" element={<Layout><KitchenCabinetCalculator /></Layout>} />

        <Route path="/acid-dosage" element={<CompactLayout><MuriaticAcidDosage /></CompactLayout>} />
        <Route path="/evaporation" element={<CompactLayout><EvaporationCalculator /></CompactLayout>} />
        <Route path="/electricity-cost" element={<CompactLayout><ElectricityCostCalculator /></CompactLayout>} />
        <Route path="/cover-size" element={<CompactLayout><PoolCoverCalculator /></CompactLayout>} />
        <Route path="/ph-adjust" element={<CompactLayout><PhAdjustmentCalculator /></CompactLayout>} />

        <Route path="/shock-calculator" element={<CompactLayout><PoolShockCalculator /></CompactLayout>} />
        <Route path="/heat-pump" element={<CompactLayout><PoolHeatPumpCalculator /></CompactLayout>} />
        <Route path="/sand-filter" element={<CompactLayout><PoolSandCalculator /></CompactLayout>} />
        <Route path="/chlorine-dose" element={<CompactLayout><ChlorineDosageCalculator /></CompactLayout>} />
        <Route path="/thiosulfate" element={<CompactLayout><SodiumThiosulfateCalculator /></CompactLayout>} />
        <Route path="/tool-template" element={<Layout><ToolTemplate /></Layout>} />

      </Routes>
    </BrowserRouter>

  );
}

export default App;