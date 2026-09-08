import React from 'react';

export default function StarRating({ value = 0, size = 16 }) {
    const v = parseFloat(value) || 0;

    return (
        <div className="flex items-center gap-1" aria-hidden="true">
            {Array.from({ length: 5 }, (_, idx) => {
                const i = idx + 1;
                const start = i - 1;
                const pct = Math.max(0, Math.min(1, v - start));
                const fill = Math.round(pct * 100);

                return (
                    <div key={i} style={{ width: size, height: size, position: 'relative', display: 'inline-block' }}>
                        <svg viewBox="0 0 24 24" width={size} height={size} style={{ position: 'absolute', left: 0, top: 0 }} className="text-gray-600">
                        <path fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"
                            d="M12 .587l3.668 7.431L23.4 9.75l-5.7 5.56L18.9 24 12 19.897 5.1 24l1.2-8.69L.6 9.75l7.732-1.732z" />
                        </svg>

                        <div style={{ width: `${fill}%`, height: size, overflow: 'hidden', position: 'absolute', left: 0, top: 0 }}>
                        <svg viewBox="0 0 24 24" width={size} height={size} style={{ display: 'block' }} className="text-[#f5c518]">
                            <path fill="currentColor" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"
                            d="M12 .587l3.668 7.431L23.4 9.75l-5.7 5.56L18.9 24 12 19.897 5.1 24l1.2-8.69L.6 9.75l7.732-1.732z" />
                        </svg>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}