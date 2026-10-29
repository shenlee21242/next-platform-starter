export const DEFAULT_CHARACTER_ID = 'kael';

export const characters = [
    {
        id: 'kael',
        name: 'Kael',
        title: 'The Silent Pathfinder',
        gender: 'Male',
        heroClass: 'Shadow Ranger',
        origin: 'The Borderlands',
        specialty: 'Focus & perception',
        image: '/images/heroes/kael.webp',
        quote: 'Discipline is my sharpest blade.',
        backstory: [
            'Kael grew up beyond the last lantern of the border cities, where a missed footpath could mean a night in the cold. He learned to read broken branches, shifting wind, and the quiet between sounds. By the time he reached the capital, he could find a route where everyone else saw a wall.',
            'He never sought a crown or an army. Kael’s real test came when he had to master his own restlessness and remain still long enough to choose the right path. He now teaches that attention is a form of courage: every distraction resisted becomes another step toward the life you meant to build.',
        ],
    },
    {
        id: 'nyra',
        name: 'Nyra',
        title: 'The Veiled Cartographer',
        gender: 'Female',
        heroClass: 'Shadow Ranger',
        origin: 'The Old Medina',
        specialty: 'Strategy & awareness',
        image: '/images/heroes/nyra.webp',
        quote: 'A clear mind can find a road through any darkness.',
        backstory: [
            'Nyra was raised among mapmakers in the Old Medina, copying coastlines and mountain passes by candlelight. When she discovered that some maps were designed to lead travelers into danger, she left the workshop and began charting safe routes herself. Her hood became a familiar sight along roads that had no names.',
            'She carries no kingdom’s banner. Her loyalty is to the people trying to find their way home. Nyra believes that patience reveals what haste conceals, and her carefully marked journals record more than roads: they hold every promise she has kept, one deliberate day at a time.',
        ],
    },
    {
        id: 'darius',
        name: 'Darius',
        title: 'The Unbroken Oath',
        gender: 'Male',
        heroClass: 'Iron Vanguard',
        origin: 'The Bronze Citadel',
        specialty: 'Strength & resilience',
        image: '/images/heroes/darius.webp',
        quote: 'Strength is a promise you keep to yourself.',
        backstory: [
            'Darius served as the youngest gate captain of the Bronze Citadel. He earned his reputation not through a single heroic charge, but by returning to the same difficult post every dawn and refusing to let exhaustion decide who he would become. His armor still bears the marks of those early years.',
            'When his service ended, he searched for a purpose that could not be taken away with a title. He found it in helping ordinary people discover their own endurance. For Darius, every repeated effort is another hammer strike: unseen at first, then strong enough to carry a life.',
        ],
    },
    {
        id: 'mira',
        name: 'Mira',
        title: 'The Forgeheart',
        gender: 'Female',
        heroClass: 'Iron Vanguard',
        origin: 'The Ember District',
        specialty: 'Power & discipline',
        image: '/images/heroes/mira.webp',
        quote: 'I was not born unbreakable. I practiced.',
        backstory: [
            'Mira apprenticed in a crowded smithy, repairing armor for champions whose names filled the arena. She listened to their stories and noticed what the songs left out: the mornings they trained alone, the failures they repaired, and the days they simply began again. Eventually, she forged a suit for herself.',
            'Her first trials were humble and mostly unseen. Mira learned to treat frustration as heat—useful when shaped, destructive when ignored. She now stands beside others at the beginning of their own training, reminding them that confidence is not the absence of doubt but the decision to keep working beside it.',
        ],
    },
    {
        id: 'sami',
        name: 'Sami',
        title: 'The Keeper of First Light',
        gender: 'Male',
        heroClass: 'Dawn Keeper',
        origin: 'The Quiet Library',
        specialty: 'Reflection & wisdom',
        image: '/images/heroes/sami.webp',
        quote: 'Begin again, gently and without delay.',
        backstory: [
            'Sami spent decades preserving fragile books in a library that most travelers passed without noticing. He restored torn pages, copied fading ink, and discovered that careful repetition could rescue even what seemed lost. The same practice slowly changed the way he treated his own imperfect days.',
            'He now opens the sanctuary doors before sunrise and welcomes anyone who needs a quiet place to reflect. Sami does not promise instant transformation. He offers something steadier: a chair, an open book, and the reminder that a sincere beginning can be made more than once.',
        ],
    },
    {
        id: 'amara',
        name: 'Amara',
        title: 'The Lantern of Dawn',
        gender: 'Female',
        heroClass: 'Dawn Keeper',
        origin: 'The River Villages',
        specialty: 'Gratitude & purpose',
        image: '/images/heroes/amara.webp',
        quote: 'What we nurture with attention becomes our light.',
        backstory: [
            'Amara grew up in a family of storytellers who carried histories from one river village to the next. When she found an abandoned sanctuary along the old route, she stayed to restore it, one small task each morning. Travelers began stopping to help, then stopping simply to rest and reflect.',
            'Her book contains no prophecy, only observations, gratitude, and lessons gathered from ordinary lives. Amara teaches that purpose is not always a distant calling. Often it is the decision to care for what is already in front of you, until a forgotten place—or a forgotten hope—becomes a light for others.',
        ],
    },
];

export function getCharacter(id) {
    const legacyIds = ['realistic', 'cyberpunk', 'comic', 'golden'];
    const normalizedId = legacyIds.includes(id) ? DEFAULT_CHARACTER_ID : id;
    return characters.find((character) => character.id === normalizedId) || characters[0];
}
