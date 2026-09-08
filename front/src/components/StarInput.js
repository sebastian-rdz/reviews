import React, { useRef, useState } from 'react';

export default function StarInput({ value = 4, onChange, size = 20, max = 5, readOnly = false }) {
    const containerRef = useRef(null);
    const [hoverValue, setHoverValue] = useState(null);
    const pointerDownRef = useRef(false);

    const displayValue = hoverValue !== null ? hoverValue : value;

    function clamp(v) {
        if (v < 0.5) return 0.5;
        if (v > max) return max;
        return v;
    }

    function valueFromPointer(e) {
        const el = containerRef.current;
        if (!el) return value;
        const rect = el.getBoundingClientRect();
        const x = (e.clientX ?? (e.touches && e.touches[0].clientX) ?? 0) - rect.left;
        const starWidth = rect.width / max;
        let index = Math.floor(x / starWidth) + 1;
        if (index < 1) index = 1;
        if (index > max) index = max;
        const within = x - (index - 1) * starWidth;
        const v = (within >= starWidth / 2) ? index : (index - 0.5);
        return clamp(v);
    }

    function handlePointerDown(e) {
        if (readOnly) return;
        pointerDownRef.current = true;
        // pointer capture for smoother dragging on some devices
        try { e.currentTarget.setPointerCapture?.(e.pointerId); } catch {}
        const v = valueFromPointer(e);
        setHoverValue(v);
        onChange && onChange(v);
    }

    function handlePointerMove(e) {
        if (readOnly) return;
        const v = valueFromPointer(e);
        setHoverValue(v);
        if (pointerDownRef.current) {
        onChange && onChange(v); // update while dragging
        }
    }

    function handlePointerUp(e) {
        if (readOnly) return;
        pointerDownRef.current = false;
        try { e.currentTarget.releasePointerCapture?.(e.pointerId); } catch {}
        const v = valueFromPointer(e);
        setHoverValue(null);
        onChange && onChange(v);
    }

    function handlePointerLeave() {
        if (pointerDownRef.current) return; // keep while dragging outside
        setHoverValue(null);
    }

    function fillPercentForStar(i) {
        const v = displayValue;
        const start = i - 1;
        const pct = Math.max(0, Math.min(1, v - start));
        return Math.round(pct * 100);
    }

    return (
        <div
            ref={containerRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerLeave}
            style={{ display: 'flex', gap: 6, touchAction: 'none', userSelect: 'none' }}
            aria-hidden={readOnly}
        >
        {Array.from({ length: max }, (_, idx) => {
            const i = idx + 1;
            const fill = fillPercentForStar(i);
            return (
            <div key={i} style={{ width: size, height: size, position: 'relative' }}>
                
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
