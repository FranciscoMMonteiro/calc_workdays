import React from 'react';
import { Calendar, Calculator } from 'lucide-react';

const ModeSwitcher = ({ mode, setMode }) => {
    return (
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '12px' }}>
            <button
                className={`mode-btn ${mode === 'add' ? 'active' : ''}`}
                onClick={() => setMode('add')}
                style={btnStyle(mode === 'add')}
            >
                <Calculator size={18} style={{ marginRight: '8px' }} />
                Start + Days
            </button>
            <button
                className={`mode-btn ${mode === 'diff' ? 'active' : ''}`}
                onClick={() => setMode('diff')}
                style={btnStyle(mode === 'diff')}
            >
                <Calendar size={18} style={{ marginRight: '8px' }} />
                Date Difference
            </button>
        </div>
    );
};

const btnStyle = (isActive) => ({
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '10px',
    border: 'none',
    borderRadius: '8px',
    background: isActive ? 'var(--primary-color)' : 'transparent',
    color: isActive ? 'white' : 'var(--text-color)',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontWeight: isActive ? 600 : 400
});

export default ModeSwitcher;
