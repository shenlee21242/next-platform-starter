export const AURA_CARD_COVER = '/images/card-themes/aura-cover.webp';

const sharedArt = {
    gold: '/images/card-themes/self-development.webp',
    violet: '/images/card-themes/mental.webp',
    mint: '/images/card-themes/social.webp',
    fire: '/images/card-themes/physical.webp',
};

export const questCardThemes = {
    Religious: {
        color: '#b99afb', secondary: '#e5b86b', art: sharedArt.gold,
        filter: 'saturate(.82) hue-rotate(8deg) brightness(.94)',
    },
    Psychological: {
        color: '#d7dce5', secondary: '#94a2b5', art: sharedArt.violet,
        filter: 'grayscale(1) brightness(1.12) contrast(.94)',
    },
    Physical: {
        color: '#ef4444', secondary: '#ff9b68', art: sharedArt.fire,
        filter: 'saturate(1.08)',
    },
    Mental: {
        color: '#a58cf5', secondary: '#78c8ff', art: sharedArt.violet,
        filter: 'saturate(1.05) brightness(1.02)',
    },
    SelfDevelopment: {
        color: '#e5b86b', secondary: '#ffe0a1', art: sharedArt.gold,
        filter: 'saturate(1.06)',
    },
    Social: {
        color: '#35c994', secondary: '#a0ead0', art: sharedArt.mint,
        filter: 'saturate(1.08)',
    },
    Spiritual: {
        color: '#b99afb', secondary: '#e5b86b', art: sharedArt.gold,
        filter: 'saturate(.82) hue-rotate(8deg) brightness(.94)',
    },
};

export function getQuestCardTheme(category) {
    return questCardThemes[category] || questCardThemes.Mental;
}
