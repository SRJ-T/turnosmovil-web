import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './Dashboard';
import Landing from './Landing';
import SuccessPage from './Success';
import Activar from './Activar';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/success" element={<SuccessPage />} />
        <Route path="/app/*" element={<Dashboard />} />
        <Route path="/activar" element={<Activar />} />
      </Routes>
    </Router>
  );
}
