let serverOffsetMs = 0;
let trustedServerMs = null;
let trustedMonotonicMs = 0;

export function auraNow() {
    if (trustedServerMs !== null && typeof performance !== 'undefined') {
        return new Date(trustedServerMs + (performance.now() - trustedMonotonicMs));
    }
    return new Date(Date.now() + serverOffsetMs);
}

export async function syncAuraClock(timeoutMs = 1800) {
    if (typeof window === 'undefined') return auraNow();
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), timeoutMs);
    try {
        const response = await fetch('/api/aura/time', { cache: 'no-store', signal: controller.signal });
        if (!response.ok) throw new Error('Clock unavailable');
        const payload = await response.json();
        const serverTime = Date.parse(payload.time);
        if (Number.isFinite(serverTime)) {
            serverOffsetMs = serverTime - Date.now();
            trustedServerMs = serverTime;
            trustedMonotonicMs = performance.now();
        }
    } catch {
        // Offline Android sessions retain the last trusted time, or the device clock before the first sync.
    } finally {
        window.clearTimeout(timeout);
    }
    return auraNow();
}
