/**
 * FluxLogo — the FLUX brand mark + wordmark.
 * Renders the teal rounded-square SVG icon beside the "FLUX" text.
 *
 * Props:
 *   size      — icon width/height in px (default 28)
 *   fontSize  — wordmark font size in px (default 18)
 *   color     — wordmark text color (default '#f1f1f1')
 *   noText    — if true, only the icon is rendered
 */
export default function FluxLogo({ size = 28, fontSize = 18, color = '#f1f1f1', noText = false }) {
    return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 9, userSelect: 'none' }}>
            {/* Icon — matches public/favicon.svg */}
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 64 64"
                width={size}
                height={size}
                style={{ flexShrink: 0 }}
                aria-label="FLUX logo"
            >
                <defs>
                    <linearGradient id="fluxLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#00D2DC" />
                        <stop offset="100%" stopColor="#00A8B2" />
                    </linearGradient>
                </defs>
                <rect x="2" y="2" width="60" height="60" rx="18" fill="url(#fluxLogoGrad)" />
                <polygon
                    points="25,18 47,32 25,46"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="5.5"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                />
            </svg>

            {!noText && (
                <span style={{
                    fontSize,
                    fontWeight: 900,
                    color,
                    letterSpacing: '-0.5px',
                    fontFamily: 'Roboto, Inter, sans-serif',
                    lineHeight: 1,
                }}>
                    FLUX
                </span>
            )}
        </span>
    );
}
