import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Layout from './components/Layout';
import CompactLayout from './components/CompactLayout';

// ============================================
// TOOL IMPORTS - Add new tools here
// ============================================
import AsphaltTonnageCalculator from './tools/AsphaltTonnageCalculator';
import AsphaltDrivewayCalculator from './tools/AsphaltDrivewayCalculator';
import AsphaltMillingsCalculator from './tools/AsphaltMillingsCalculator';
import AsphaltPriceCalculator from './tools/AsphaltPriceCalculator';
import AsphaltVsConcreteCalculator from './tools/AsphaltVsConcreteCalculator';
import AsphaltTypeSelector from './tools/AsphaltTypeSelector';
import AsphaltRemovalCostCalculator from './tools/AsphaltRemovalCostCalculator';
import HotColdMixCalculator from './tools/HotColdMixCalculator';
import DrivewayResurfacingCalculator from './tools/DrivewayResurfacingCalculator';
import AsphaltSquareFeetCalculator from './tools/AsphaltSquareFeetCalculator';
import HotAsphaltCalculator from './tools/HotAsphaltCalculator';
import CrushedAsphaltCalculator from './tools/CrushedAsphaltCalculator';
import AsphaltYieldDensityEmulsionCalculator from './tools/AsphaltYieldDensityEmulsionCalculator';
import ToolTemplate from './tools/_TEMPLATE';

// ============================================
// DASHBOARD (for your reference/testing only)
// ============================================
const Dashboard = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Asphalt Calculators</h1>

      <ul className="space-y-3">
        <li>
          <Link to="/tonnage" className="text-amber-600 hover:underline">
            Asphalt Tonnage Calculator
          </Link>
          {' - '}<code className="text-sm text-gray-500">/tonnage</code>
        </li>

        <li>
          <Link to="/driveway-cost" className="text-amber-600 hover:underline">
            Asphalt Driveway Cost Calculator
          </Link>
          {' - '}<code className="text-sm text-gray-500">/driveway-cost</code>
        </li>

        <li>
          <Link to="/millings" className="text-amber-600 hover:underline">
            Asphalt Millings Calculator
          </Link>
          {' - '}<code className="text-sm text-gray-500">/millings</code>
        </li>

        <li>
          <Link to="/asphalt-price" className="text-amber-600 hover:underline">
            Asphalt Price Calculator
          </Link>
          {' - '}<code className="text-sm text-gray-500">/asphalt-price</code>
        </li>

        <li>
          <Link to="/asphalt-vs-concrete" className="text-amber-600 hover:underline">
            Asphalt vs Concrete Calculator
          </Link>
          {' - '}<code className="text-sm text-gray-500">/asphalt-vs-concrete</code>
        </li>

        <li>
          <Link to="/asphalt-type" className="text-amber-600 hover:underline">
            Asphalt Type Selection
          </Link>
          {' - '}<code className="text-sm text-gray-500">/asphalt-type</code>
        </li>

        <li>
          <Link to="/asphalt-removal" className="text-amber-600 hover:underline">
            Asphalt Removal Cost Calculator
          </Link>
          {' - '}<code className="text-sm text-gray-500">/asphalt-removal</code>
        </li>

        <li>
          <Link to="/hot-cold-mix" className="text-amber-600 hover:underline">
            Hot & Cold Mix Calculator
          </Link>
          {' - '}<code className="text-sm text-gray-500">/hot-cold-mix</code>
        </li>

        <li>
          <Link to="/driveway-resurfacing" className="text-amber-600 hover:underline">
            Driveway Resurfacing Cost Calculator
          </Link>
          {' - '}<code className="text-sm text-gray-500">/driveway-resurfacing</code>
        </li>

        <li>
          <Link to="/asphalt-square-feet" className="text-amber-600 hover:underline">
            Asphalt Square Feet Calculator
          </Link>
          {' - '}<code className="text-sm text-gray-500">/asphalt-square-feet</code>
        </li>

        <li>
          <Link to="/hot-asphalt" className="text-amber-600 hover:underline">
            Hot Asphalt Calculator
          </Link>
          {' - '}<code className="text-sm text-gray-500">/hot-asphalt</code>
        </li>

        <li>
          <Link to="/crushed-asphalt" className="text-amber-600 hover:underline">
            Crushed Asphalt Calculator
          </Link>
          {' - '}<code className="text-sm text-gray-500">/crushed-asphalt</code>
        </li>

        <li>
          <Link to="/asphalt-yield" className="text-amber-600 hover:underline">
            Asphalt Yield, Density & Emulsion Calculator
          </Link>
          {' - '}<code className="text-sm text-gray-500">/asphalt-yield</code>
        </li>

        <li>
          <Link to="/tool-template" className="text-amber-600 hover:underline">
            Template
          </Link>
          {' - '}<code className="text-sm text-gray-500">/tool-template</code>
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
      <Routes>
        <Route path="/" element={<Layout><Dashboard /></Layout>} />

        <Route path="/tonnage" element={<CompactLayout><AsphaltTonnageCalculator /></CompactLayout>} />

        <Route path="/driveway-cost" element={<CompactLayout><AsphaltDrivewayCalculator /></CompactLayout>} />

        <Route path="/millings" element={<CompactLayout><AsphaltMillingsCalculator /></CompactLayout>} />

        <Route path="/asphalt-price" element={<CompactLayout><AsphaltPriceCalculator /></CompactLayout>} />

        <Route path="/asphalt-vs-concrete" element={<CompactLayout><AsphaltVsConcreteCalculator /></CompactLayout>} />

        <Route path="/asphalt-type" element={<CompactLayout><AsphaltTypeSelector /></CompactLayout>} />

        <Route path="/asphalt-removal" element={<CompactLayout><AsphaltRemovalCostCalculator /></CompactLayout>} />

        <Route path="/hot-cold-mix" element={<CompactLayout><HotColdMixCalculator /></CompactLayout>} />

        <Route path="/driveway-resurfacing" element={<CompactLayout><DrivewayResurfacingCalculator /></CompactLayout>} />

        <Route path="/asphalt-square-feet" element={<CompactLayout><AsphaltSquareFeetCalculator /></CompactLayout>} />

        <Route path="/hot-asphalt" element={<CompactLayout><HotAsphaltCalculator /></CompactLayout>} />

        <Route path="/crushed-asphalt" element={<CompactLayout><CrushedAsphaltCalculator /></CompactLayout>} />

        <Route path="/asphalt-yield" element={<CompactLayout><AsphaltYieldDensityEmulsionCalculator /></CompactLayout>} />

        <Route path="/tool-template" element={<Layout><ToolTemplate /></Layout>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
