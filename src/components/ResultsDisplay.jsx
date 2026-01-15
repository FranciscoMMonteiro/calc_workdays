import React, { useState } from 'react';
import { format } from 'date-fns';
import { ChevronDown, ChevronUp } from 'lucide-react';

const ResultsDisplay = ({ result, mode, t }) => {
    if (!result) return null;

    const {
        startDate,
        endDate,
        calendarDays,
        businessDays,
        weekends,
        weekdaysHolidays,
        holidayDetails
    } = result;

    const [showHolidays, setShowHolidays] = useState(false);

    return (
        <div className="glass-panel animate-fade-in" style={{ marginTop: '2rem', overflow: 'hidden' }}>
            {/* Header Result */}
            <div style={{ padding: '1.5rem', background: 'rgba(99, 102, 241, 0.1)', borderBottom: '1px solid var(--glass-border)' }}>
                <label className="label" style={{ textAlign: 'center', color: '#a5b4fc' }}>
                    {mode === 'add' ? t.result : t.result_days}
                </label>
                <div style={{ fontSize: '2rem', fontWeight: 700, margin: '0.5rem 0' }}>
                    {mode === 'add' ? format(endDate, 'PPPP') : businessDays}
                </div>
            </div>

            {/* Detailed Table */}
            <div style={{ display: 'grid', width: '100%', fontSize: '0.95rem' }}>
                <Row
                    label={t.calendar_days}
                    value={calendarDays}
                />
                <Row
                    label={t.total_business_days}
                    value={businessDays}
                    highlight
                />
                <Row
                    label={t.weekends}
                    value={weekends}
                />
                <Row
                    label={t.holidays_weekdays}
                    value={weekdaysHolidays}
                />
                <Row
                    label={`${t.total_holidays_found} (${holidayDetails.length})`}
                    value={
                        <button
                            onClick={() => setShowHolidays(!showHolidays)}
                            style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', padding: 0, marginLeft: 'auto' }}
                        >
                            {showHolidays ? t.hide : t.show}
                            {showHolidays ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                    }
                />

                {showHolidays && holidayDetails.length > 0 && (
                    <div style={{ padding: '0 1rem 1rem 1rem', background: 'rgba(0,0,0,0.2)' }}>
                        {holidayDetails.map((h, idx) => (
                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.85rem' }}>
                                <span>{format(h.date, 'P')}</span>
                                <span style={{ opacity: 0.8 }}>{h.name} {h.onWeekend ? `(${t.weekend})` : ''}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const Row = ({ label, value, highlight }) => (
    <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '1rem 1.5rem',
        borderBottom: '1px solid var(--glass-border)',
        background: highlight ? 'rgba(99, 102, 241, 0.05)' : 'transparent'
    }}>
        <span style={{ color: 'var(--text-color)', opacity: highlight ? 1 : 0.8, fontWeight: highlight ? 600 : 400 }}>
            {label}
        </span>
        <span style={{ fontWeight: 600 }}>{value}</span>
    </div>
);

export default ResultsDisplay;
