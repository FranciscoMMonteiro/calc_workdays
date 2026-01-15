import React from 'react';
import { Globe } from 'lucide-react';
import { SUPPORTED_COUNTRIES } from '../utils/businessDays';

const CountrySelect = ({ value, onChange, t }) => {
    return (
        <div className="input-group" style={{ marginBottom: '1.5rem' }}>
            <label className="label">
                <Globe size={16} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'text-bottom' }} />
                {t.country}
            </label>
            <select
                className="glass-input"
                value={value}
                onChange={(e) => onChange(e.target.value)}
            >
                {SUPPORTED_COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code} style={{ color: 'black' }}>
                        {c.name}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default CountrySelect;
