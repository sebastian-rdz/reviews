// Small shared formatting helpers.

export function runtimeLabel(minutes) {
    if (!minutes) return null;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h && m) return `${h}h ${m}m`;
    if (h) return `${h}h`;
    return `${m}m`;
}

export function dayLabel(iso) {
    if (!iso) return null;
    const d = new Date(iso.length <= 10 ? `${iso}T00:00:00` : iso);
    if (Number.isNaN(d.getTime())) return null;
    return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

export function monthKey(iso) {
    if (!iso) return 'undated';
    return iso.slice(0, 7); // YYYY-MM
}

export function monthLabel(key) {
    if (key === 'undated') return 'No date';
    const [y, m] = key.split('-');
    const d = new Date(Number(y), Number(m) - 1, 1);
    return d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

export function posterFallback(w = 96, h = 144) {
    return (
        'data:image/svg+xml;utf8,' +
        encodeURIComponent(
            `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 96 144">
                <rect width="96" height="144" fill="#242b3b"/>
                <path d="M48 58a10 10 0 100 20 10 10 0 000-20zm0 6a4 4 0 110 8 4 4 0 010-8z" fill="#454c5c"/>
                <text x="48" y="98" font-family="Inter,sans-serif" font-size="9" fill="#626a7d" text-anchor="middle">No poster</text>
            </svg>`
        )
    );
}
