'use client';

import { useId, useMemo } from 'react';
import { getFateRank } from './fate';
import { translate } from './i18n';

const categoryColors = {
    Religious: '#b99afb',
    Psychological: '#d7dce5',
    Physical: '#ef4444',
    Mental: '#a58cf5',
    SelfDevelopment: '#e5b86b',
    Social: '#35c994',
    Spiritual: '#b99afb',
};

const emblems = {
    Religious: <><path d="M0-48C-24-60-48-58-68-46v92c24-12 46-10 68 4 22-14 44-16 68-4v-92c-20-12-44-14-68-2v94" /><path d="M-48-24h27m-27 17h34m14-17h27M0-7h48" opacity=".55" /></>,
    Psychological: <><path d="M0 52C-70 12-60-42-28-42-10-42 0-28 0-28s10-14 28-14c32 0 42 54-28 94Z" /><path d="M-34 4h22l10-20 14 40 12-20h22" /></>,
    Physical: <><path d="M-58-22v44m-14-30v16m144-30v44m14-30v16M-58 0H58M-72-16v32m144-32v32" /><path d="M-42 48h84" opacity=".45" /></>,
    Mental: <><circle cx="0" cy="0" r="15" /><circle cx="-48" cy="-34" r="9" /><circle cx="50" cy="-30" r="9" /><circle cx="-46" cy="40" r="9" /><circle cx="52" cy="38" r="9" /><path d="m-9-12-30-17M10-11l31-15M-10 10l-27 23M11 11l31 21" /></>,
    SelfDevelopment: <><path d="m0-58 58 28L0-2-58-30Z" /><path d="m-58 0 58 28L58 0M-58 28 0 56l58-28" /><path d="M0-30v58m0-58-12 12M0-30l12 12" /></>,
    Social: <><circle cx="-34" cy="-32" r="14" /><circle cx="34" cy="-32" r="14" /><path d="M-70 46v-20c0-42 72-42 72 0v20M2 46v-20c0-42 72-42 72 0v20M-80 46H82" /><path d="M-18-4 0 10 18-4" /></>,
    Spiritual: <><path d="M0-48C-24-60-48-58-68-46v92c24-12 46-10 68 4 22-14 44-16 68-4v-92c-20-12-44-14-68-2v94" /></>,
};

function hash(value) {
    let result = 2166136261;
    for (let index = 0; index < value.length; index += 1) {
        result ^= value.charCodeAt(index);
        result = Math.imul(result, 16777619);
    }
    return result >>> 0;
}

function seededRandom(initialSeed) {
    let state = initialSeed || 1;
    return () => {
        state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
        return state / 4294967296;
    };
}

export default function QuestArtwork({ quest, className = '', decorative = false }) {
    const instanceId = useId().replaceAll(':', '');
    const art = useMemo(() => {
        const seed = hash(quest.sourceId || quest.id || quest.text || 'aura-quest');
        const random = seededRandom(seed);
        return {
            seed,
            rotation: Math.round(random() * 50 - 25),
            orbit: 88 + (seed % 6) * 7,
            horizon: 170 + (seed % 35),
            particles: Array.from({ length: 13 }, () => ({
                x: Math.round(28 + random() * 584),
                y: Math.round(36 + random() * 292),
                r: (1 + random() * 2.2).toFixed(1),
                opacity: (0.1 + random() * 0.4).toFixed(2),
            })),
        };
    }, [quest.id, quest.sourceId, quest.text]);
    const rank = getFateRank(quest.rank);
    const categoryColor = categoryColors[quest.category] || '#4cd7f6';
    const title = (quest.baseAction || quest.text || '').replace(/\s+/g, ' ').trim();
    const shortTitle = title.length > 45 ? `${title.slice(0, 42)}…` : title;
    const direction = quest.language === 'ar' ? 'rtl' : 'ltr';
    const categoryLabel = translate(quest.language || 'en', `category.${quest.category}`);
    const gradientId = `bg-${instanceId}`;
    const glowId = `glow-${instanceId}`;
    const gridId = `grid-${instanceId}`;

    return (
        <svg className={`quest-generated-art ${className}`} viewBox="0 0 640 400" direction="ltr" role={decorative ? undefined : 'img'} aria-hidden={decorative ? true : undefined} aria-label={decorative ? undefined : `${quest.sourceId || quest.id}: ${quest.text}`} preserveAspectRatio="xMidYMid slice">
            <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#111319" /><stop offset="1" stopColor="#0a0b0e" /></linearGradient>
                <radialGradient id={glowId}><stop stopColor={rank.color} stopOpacity=".22" /><stop offset="1" stopColor={rank.color} stopOpacity="0" /></radialGradient>
                <pattern id={gridId} width="32" height="32" patternUnits="userSpaceOnUse"><path d="M32 0H0v32" fill="none" stroke={categoryColor} strokeOpacity=".065" /></pattern>
            </defs>
            <rect width="640" height="400" rx="24" fill={`url(#${gradientId})`} />
            <rect width="640" height="400" rx="24" fill={`url(#${gridId})`} />
            <ellipse cx={230 + art.seed % 180} cy="184" rx="250" ry="180" fill={`url(#${glowId})`} />
            <path d="M24 76V24h52M564 24h52v52M24 324v52h52M564 376h52v-52" fill="none" stroke={rank.color} strokeOpacity=".55" strokeWidth="2" />
            <g transform={`translate(320 ${art.horizon}) rotate(${art.rotation})`} fill="none" stroke={categoryColor}>
                <circle r={art.orbit} strokeOpacity=".2" /><circle r={art.orbit + 18} strokeOpacity=".09" strokeDasharray="3 12" />
                <path d={`M0 -${art.orbit + 28}v12 M0 ${art.orbit + 16}v12 M-${art.orbit + 28} 0h12 M${art.orbit + 16} 0h12`} strokeOpacity=".6" />
            </g>
            <g transform={`translate(320 ${art.horizon})`} fill="none" stroke={categoryColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">{emblems[quest.category] || emblems.SelfDevelopment}</g>
            {art.particles.map((particle, index) => <circle key={`${art.seed}-${index}`} cx={particle.x} cy={particle.y} r={particle.r} fill={categoryColor} opacity={particle.opacity} />)}
            <text x="36" y="52" fill={categoryColor} fontFamily="Arial,sans-serif" fontSize="12" letterSpacing="1.5">AURA / {categoryLabel}</text>
            <text x="604" y="56" textAnchor="end" fill={rank.color} fontFamily="Georgia,serif" fontSize="28" letterSpacing="2">{quest.rank}</text>
            <path d="M36 292H604" stroke={rank.color} strokeOpacity=".25" />
            <text x={direction === 'rtl' ? 604 : 36} y="329" direction={direction} textAnchor={direction === 'rtl' ? 'end' : 'start'} fill="#f3f0e9" fontFamily="Arial,sans-serif" fontSize="17" fontWeight="600">{shortTitle}</text>
            <text x="36" y="360" fill="#9299a5" fontFamily="monospace" fontSize="12" letterSpacing="1.5">{quest.sourceId || quest.id}</text>
            <text x="604" y="360" textAnchor="end" fill={rank.color} fontFamily="Arial,sans-serif" fontSize="11" letterSpacing="2">RANK {(quest.rankIndex ?? 0) + 1} / 9</text>
        </svg>
    );
}
