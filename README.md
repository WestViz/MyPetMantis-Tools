# CabinetCalq & Estimator Tools

This project is a React-based suite of calculator tools.

## Architecture

The project uses a **Switchboard Pattern** to manage multiple calculators.
- `src/App.tsx`: Acts as the central router (Switchboard).
- `src/tools/`: Contains isolated calculator modules.

## How to add a new Tool

1. **Duplicate the Template**:
   Copy `src/tools/_TEMPLATE.tsx` to a new folder, e.g., `src/tools/fence-calculator/index.tsx`.

2. **Develop**:
   Build your calculator logic within that new component. You can create a `components/` subfolder inside your tool directory for specific UI parts.

3. **Register**:
   Open `src/App.tsx`, import your new tool, and add a `<Route>` and a `Link` card in the Dashboard.

   ```tsx
   import FenceCalculator from './tools/fence-calculator';
   
   // ... inside Routes
   <Route path="/fence-calculator" element={<FenceCalculator />} />
   ```

## Tech Stack
- React 18
- Tailwind CSS
- Lucide React (Icons)
- React Router Dom