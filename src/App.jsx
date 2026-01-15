import React, { useState, useEffect } from 'react';
import './App.css';
import CountrySelect from './components/CountrySelect';
import ModeSwitcher from './components/ModeSwitcher';
import ResultsDisplay from './components/ResultsDisplay';
import { addBusinessDays, getBusinessDaysDifference } from './utils/businessDays';
import { format } from 'date-fns';
import { ArrowRight } from 'lucide-react';
import { Analytics } from "@vercel/analytics/react"

import { translations } from './utils/translations';
import LanguageSelector from './components/LanguageSelector';

function App() {
  const [lang, setLang] = useState('pt'); // Defaulting to PT as user requested "Portuguese - BR" first on list? Or keep EN? User "I want to have Portuguese - BR, English...". I'll default to PT.
  const [country, setCountry] = useState('BR'); // Defaulting to Brazil as well likely.
  const [mode, setMode] = useState('diff');

  const t = translations[lang] || translations['en'];

  // Inputs
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [daysInput, setDaysInput] = useState('5');
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const [result, setResult] = useState(null);

  // Clear result when inputs change (except language)
  useEffect(() => {
    setResult(null);
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
      <div style={{ width: '100%', maxWidth: '480px' }}>
        <LanguageSelector currentLang={lang} setLang={setLang} />
      </div>

      <div className="glass-panel" style={{ maxWidth: '480px', margin: '0 auto', padding: '2rem' }}>
        <h1>{t.title}</h1>
        <p style={{ marginBottom: '2rem', opacity: 0.8 }}>{t.subtitle}</p>

        <CountrySelect value={country} onChange={setCountry} t={t} />
        <ModeSwitcher mode={mode} setMode={setMode} t={t} />

        <div className="form-content animate-fade-in" key={mode}>

          {/* Flex container for side-by-side inputs */}
          <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
            <div className="input-group" style={{ flex: 1, marginBottom: '1rem' }}>
              <label className="label">{t.start_date}</label>
              <input
                type="date"
                className="glass-input"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            {mode === 'add' ? (
              <div className="input-group" style={{ flex: 1, marginBottom: '1rem' }}>
                <label className="label">{t.working_days_add}</label>
                <input
                  type="number"
                  className="glass-input"
                  value={daysInput}
                  onChange={(e) => setDaysInput(e.target.value)}
                  placeholder="e.g. 10"
                />
              </div>
            ) : (
              <div className="input-group" style={{ flex: 1, marginBottom: '1rem' }}>
                <label className="label">{t.end_date}</label>
                <input
                  type="date"
                  className="glass-input"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            )}
          </div>

          <button className="btn-primary" onClick={calculate} style={{ width: '100%', marginTop: '1rem' }}>
            {t.calculate} <ArrowRight size={16} style={{ display: 'inline', marginLeft: '5px' }} />
          </button>
        </div>

        <ResultsDisplay result={result} mode={mode} t={t} />
      </div>

      <div style={{ textAlign: 'center', marginTop: '3rem', opacity: 0.5, fontSize: '0.8rem' }}>
        <p>{t.footer}</p>
      </div>
      <Analytics />
    </div>
  );
};

export default App;
