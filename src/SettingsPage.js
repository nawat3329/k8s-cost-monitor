import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';


const SettingsPage = ({
  selectedCurrency,
  setSelectedCurrency,
  conversionRates,
  setConversionRates,
}) => {



  const fetchConversionRates = async () => {
    try {
      const response = await fetch('https://api.freecurrencyapi.com/v1/latest?apikey=R2AcQFtQLI4Ib8Mcc5Eo0dmSM4Ff0q1jpXy3rDnh');
      const data = await response.json();
      setConversionRates(data.data);
    } catch (error) {
      console.error('Error fetching currency conversion data:', error);
    }
  };

  useEffect(() => {
    fetchConversionRates();
  }, []);

  useEffect(() => {
    const storedCurrency = localStorage.getItem('selectedCurrency');
    if (storedCurrency) {
      setSelectedCurrency(storedCurrency);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('selectedCurrency', selectedCurrency);
  }, [selectedCurrency]);

  return (
    <div className="m-4">
      <h1>Settings</h1>
      <label htmlFor="currency-select">Select Currency:</label>
      <select
        id="currency-select"
        value={selectedCurrency}
        onChange={(e) => setSelectedCurrency(e.target.value)}
      >
        {Object.keys(conversionRates).map((currency) => (
          <option key={currency} value={currency}>
            {currency}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SettingsPage;
