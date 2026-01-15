import React from 'react';
import { LANGUAGES } from '../utils/translations';
import { Globe } from 'lucide-react';

const LanguageSelector = ({ currentLang, setLang }) => {
    return (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
            <div className="glass-panel" style={{ padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '20px' }}>
                <Globe size={14} style={{ opacity: 0.7 }} />
                <select
                    value={currentLang}
                    onChange={(e) => setLang(e.target.value)}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-color)',
                        fontSize: '0.85rem',
                        outline: 'none',
                        cursor: 'pointer'
                    }}
                >
                    {LANGUAGES.map(l => (
                        <option key={l.code} value={l.code} style={{ color: 'black' }}>
                            {l.flag} {l.name}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
};

export default LanguageSelector;
