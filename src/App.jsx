import React, { useState, useEffect } from 'react';
import './App.css';
import CountrySelect from './components/CountrySelect';
import ModeSwitcher from './components/ModeSwitcher';
import ResultsDisplay from './components/ResultsDisplay';
import { addBusinessDays, getBusinessDaysDifference } from './utils/businessDays';
import { format } from 'date-fns';
import { ArrowRight } from 'lucide-react';

function App() {
  const [country, setCountry] = useState('US');
  const [mode, setMode] = useState('add'); // 'add' or 'diff'

  // Inputs
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [daysInput, setDaysInput] = useState('5');
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const [result, setResult] = useState(null);

  useEffect(() => {
    calculate();
  }, [country, mode, startDate, daysInput, endDate]);

  const calculate = () => {
    try {
      if (mode === 'add') {
        const days = parseInt(daysInput, 10);
        if (isNaN(days) || !startDate) {
          setResult(null);
          return;
        }
        const res = addBusinessDays(startDate, days, country);
        setResult(res);
      } else {
        if (!startDate || !endDate) {
          setResult(null);
          return;
        }
        const res = getBusinessDaysDifference(startDate, endDate, country);
        setResult(res);
      }
    } catch (e) {
      console.error(e);
      setResult(null);
    }
  };

  return (
    <div className="App">
      <div className="glass-panel" style={{ maxWidth: '480px', margin: '0 auto', padding: '2rem' }}>
        <h1>WorkDay</h1>
        <p style={{ marginBottom: '2rem', opacity: 0.8 }}>Business Days Calculator</p>

        <CountrySelect value={country} onChange={setCountry} />
        <ModeSwitcher mode={mode} setMode={setMode} />

        <div className="form-content animate-fade-in" key={mode}>
          <div className="input-group" style={{ marginBottom: '1rem' }}>
            <label className="label">Start Date</label>
            <input
              type="date"
              className="glass-input"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          {mode === 'add' ? (
            <div className="input-group" style={{ marginBottom: '1rem' }}>
              <label className="label">Working Days to Add</label>
              <input
                type="number"
                className="glass-input"
                value={daysInput}
                onChange={(e) => setDaysInput(e.target.value)}
                placeholder="e.g. 10"
              />
            </div>
          ) : (
            <div className="input-group" style={{ marginBottom: '1rem' }}>
              <label className="label">End Date</label>
              <input
                type="date"
                className="glass-input"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          )}

          <button className="btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
            Calculate <ArrowRight size={16} style={{ display: 'inline', marginLeft: '5px' }} />
          </button>
        </div>

        <ResultsDisplay result={result} mode={mode} />
      </div>

      <footer style={{ marginTop: '3rem', opacity: 0.5, fontSize: '0.8rem' }}>
        Supports national holidays for major countries.
      </footer>
    </div>
  );
}

export default App;
