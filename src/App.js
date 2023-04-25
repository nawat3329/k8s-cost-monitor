import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import HomePage from "./HomePage";
import SettingsPage from "./SettingsPage";
import RuleControlPage from './RuleControlPage';

function App() {

  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [conversionRates, setConversionRates] = useState({});
  const [metrics, setMetrics] = useState([]);
  const [clusters, setClusters] = useState([]);

  return (
    <Router>
      <nav className="navbar">
        <ul className="nav-links">
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/rulecontrol">Role Control</Link>
          </li>
          <li>
            <Link to="/settings">Settings</Link>
          </li>
        </ul>
      </nav>

      <Routes>
        <Route exact path="/" element={<HomePage
          selectedCurrency={selectedCurrency}
          conversionRates={conversionRates}
          setMetrics={setMetrics}
          metrics={metrics}
          clusters={clusters}
          setClusters={setClusters}
        />}
        />
        <Route path="/settings" element={
          <SettingsPage
            selectedCurrency={selectedCurrency}
            setSelectedCurrency={setSelectedCurrency}
            conversionRates={conversionRates}
            setConversionRates={setConversionRates}
          />

        } />
        <Route exact path="/rulecontrol" element={<RuleControlPage
            metricsData={metrics}
            clusters={clusters}
        />} />
      </Routes>
    </Router>
  );
}

export default App;
