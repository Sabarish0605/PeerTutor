import React from 'react';

/**
 * HiveLogo — the Hive brand mark + wordmark.
 * Renders the honeycomb 'H' brand mark beside the "Hive" text.
 *
 * Props:
 *   size      — icon width/height in px (default 28)
 *   fontSize  — wordmark font size in px (default 18)
 *   color     — wordmark text color (default '#f1f1f1')
 *   noText    — if true, only the icon is rendered
 */
export default function HiveLogo({ size = 28, fontSize = 18, color = '#f1f1f1', noText = false }) {
    return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: Math.max(8, Math.round(size * 0.22)), userSelect: 'none', verticalAlign: 'middle' }}>
            {/* Hexagonal Hive Icon */}
            <img
                src="/hive-icon.png"
                alt="Hive"
                width={size}
                height={size}
                style={{
                    width: size,
                    height: size,
                    objectFit: 'contain',
                    flexShrink: 0,
                    display: 'block'
                }}
            />

            {!noText && (
                <span style={{
                    fontSize,
                    fontWeight: 800,
                    color,
                    letterSpacing: '-0.5px',
                    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                    lineHeight: 1,
                    display: 'inline-flex',
                    alignItems: 'baseline'
                }}>
                    Hive
                </span>
            )}
        </span>
    );
}
