import { useEffect, useRef } from 'react';

export default function InteractiveBackground({ children }) {
    const containerRef = useRef(null);

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!containerRef.current) return;
            const x = e.clientX / window.innerWidth;
            const y = e.clientY / window.innerHeight;
            
            // Set CSS variables that we can use in Tailwind or inline styles for parallax
            containerRef.current.style.setProperty('--x', x);
            containerRef.current.style.setProperty('--y', y);
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div 
            ref={containerRef}
            className="min-h-screen bg-gray-200 text-gray-900 font-sans flex flex-col overflow-x-hidden relative transition-colors duration-300"
            style={{
                backgroundImage: 'radial-gradient(#6b7280 1.5px, transparent 1.5px)',
                backgroundSize: '24px 24px',
                backgroundPosition: 'calc(var(--x, 0.5) * -20px) calc(var(--y, 0.5) * -20px)'
            }}
        >
            <div className="relative z-10 flex flex-col flex-grow w-full">
                {children}
            </div>
        </div>
    );
}
