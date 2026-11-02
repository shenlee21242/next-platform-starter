import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { physicalActions } from './physical-actions.mjs';
import { mentalActions } from './mental-actions.mjs';
import { spiritualActions } from './spiritual-actions.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ranks = [
    { rank: 'F', xp: 20, gold: 10 },
    { rank: 'E', xp: 50, gold: 25 },
    { rank: 'D', xp: 100, gold: 50 },
    { rank: 'C', xp: 250, gold: 100 },
    { rank: 'B', xp: 500, gold: 250 },
    { rank: 'A', xp: 1000, gold: 500 },
    { rank: 'S', xp: 2500, gold: 1000 },
    { rank: 'SS', xp: 5000, gold: 2500 },
    { rank: 'SSS', xp: 10000, gold: 5000 },
];

const values = {
    reps: [5, 10, 15, 25, 40, 60, 100, 150, 300],
    seconds: [30, 45, 60, 90, 120, 180, 300, 420, 600],
    distance: [200, 400, 800, 1500, 3000, 5000, 10000, 15000, 21000],
    pages: [3, 5, 10, 20, 30, 50, 100],
    words: [1, 3, 5, 10, 20, 50, 100, 200, 500],
    focusMinutes: [15, 25, 45, 60, 120, 180, 240, 360, 480],
    writingWords: [50, 100, 200, 500, 1000, 2000, 3000, 5000],
    habits: [1, 2, 5, 10, 20, 50, 100, 200, 365],
    days: [1, 2, 3, 5, 7, 14, 30, 60, 100],
    quranPages: [1, 2, 5, 10, 20, 50, 100, 300, 604],
    quranMinutes: [5, 10, 15, 30, 60, 120, 240, 480, 720],
    quranVerses: [1, 2, 5, 10, 20, 50, 100, 500, 1000],
    knowledge: [1, 2, 5, 10, 20, 50, 100, 200, 365],
    rakah: [2, 4, 10, 20, 40, 100, 200, 500, 1000],
    dhikr: [10, 33, 100, 300, 500, 1000, 3000, 5000, 10000],
    charity: [1, 2, 5, 10, 20, 50, 100, 200, 500],
    screenHours: [1, 2, 5, 12, 24, 48, 72, 168, 336],
};

const plural = (number, singular, pluralForm = `${singular}s`) => `${number.toLocaleString('en-US')} ${number === 1 ? singular : pluralForm}`;
const duration = (seconds) => seconds < 60 ? `${seconds} ${seconds === 1 ? 'second' : 'seconds'}` : `${seconds / 60} ${seconds === 60 ? 'minute' : 'minutes'}`;
const minutes = (number) => number < 60 ? `${number} ${number === 1 ? 'minute' : 'minutes'}` : `${number / 60} ${number === 60 ? 'hour' : 'hours'}`;
const distance = (meters) => meters < 1000 ? `${meters} m` : `${(meters / 1000).toLocaleString('en-US')} km`;
const list = (kind, index) => values[kind][index];

function physicalText(action, index) {
    if (action.kind === 'reps') return `Complete ${plural(list('reps', index), 'repetition')} of ${action.name}`;
    if (action.kind === 'time') return `Complete ${action.name} for ${duration(list('seconds', index))}`;
    if (action.kind === 'distance') return `Cover ${distance(list('distance', index))} with ${action.name}`;
    if (action.kind === 'nature') return `Take a ${duration(list('seconds', index))} nature walk without your phone`;
    if (action.kind === 'cold') {
        const time = duration(list('seconds', index));
        if (index < 2) return `End a normal shower with ${time} of comfortable cold water`;
        return `Accumulate ${time} of safe cold-shower practice across comfortable sessions`;
    }
    throw new Error(`Unknown Physical kind: ${action.kind}`);
}

const skillMilestones = [
    'Watch a tutorial on',
    'Practice the basics of',
    'Complete a simple exercise in',
    'Complete a small project in',
    'Complete an intermediate project in',
    'Demonstrate advanced mastery of',
    'Build a portfolio for',
    'Build a complete product using',
    'Launch a real public project featuring',
];
const problemDifficulties = ['easy', 'easy', 'medium', 'medium', 'hard', 'hard', 'expert', 'expert'];
const problemCounts = [1, 2, 1, 2, 1, 2, 1, 2];

function mentalText(action, index) {
    const phrase = action.phrase;
    switch (action.kind) {
        case 'reading':
            if (index === 7) return `Complete “${action.name}” with one full book`;
            if (index === 8) return `Complete “${action.name}” with two full books in one week`;
            return `Read ${plural(list('pages', index), 'page')} ${action.preposition || 'of'} ${phrase}`;
        case 'media': return `${phrase} for ${minutes(list('focusMinutes', index))}`;
        case 'language': return `Study ${plural(list('words', index), 'new word')} in a new language`;
        case 'pomodoro': return `Complete a ${minutes(list('focusMinutes', index))} Pomodoro-style focus session`;
        case 'deep50': return `Complete ${minutes(list('focusMinutes', index))} of Deep Work with the 50-minute method`;
        case 'deep90': return `Complete ${minutes(list('focusMinutes', index))} of Deep Work with the 90-minute method`;
        case 'focus': return `Practice ${phrase} for ${minutes(list('focusMinutes', index))}`;
        case 'habit': return `${action.name} — complete ${plural(list('habits', index), 'repetition')}`;
        case 'writing':
            if (index === 8) return `Write a short book inspired by ${phrase}`;
            return `Write ${plural(list('writingWords', index), 'word')} for ${phrase}`;
        case 'reviewWriting':
            if (index === 8) return 'Write a short book that curates and reviews your past notes';
            return `Write ${plural(list('writingWords', index), 'word')} while reviewing your past notes`;
        case 'memoryWords': return `Memorize ${plural(list('words', index), 'new word')}`;
        case 'memoryUse': return `Use ${plural(list('words', index), 'new word')} in separate original sentences`;
        case 'memoryQuote': return `Memorize a quote of ${plural(list('words', index), 'word')}`;
        case 'memoryPalace': return `Practice a memory palace with ${plural(list('words', index), 'item')}`;
        case 'mentalMath': return `Solve ${plural(list('words', index), 'mental math problem')}`;
        case 'memoryPoem': return `Memorize a short poem of ${plural(list('words', index), 'word')}`;
        case 'recall': return `Recall ${plural(list('words', index), 'idea')} learned yesterday without checking your notes`;
        case 'idioms': return `Learn ${plural(list('words', index), 'new idiom')}`;
        case 'teachConcept': return `Teach a concept using ${plural(list('words', index), 'key term')}`;
        case 'flashcards': return `Review ${plural(list('words', index), 'flashcard')}`;
        case 'skills': return `${skillMilestones[index]} ${phrase}`;
        case 'problem':
            if (index === 8) return `Create your own original ${phrase}`;
            return `Solve ${problemCounts[index]} ${problemDifficulties[index]} ${phrase}${problemCounts[index] > 1 ? 's' : ''}`;
        case 'mindfulness': return `${phrase} for ${minutes(list('focusMinutes', index))}`;
        case 'sleep': return `Sleep for 8 hours on ${plural(list('days', index), 'night')}`;
        case 'sleepScreen': return `Prepare for sleep without a screen on ${plural(list('days', index), 'night')}`;
        case 'socialDetox': return `Avoid social media for ${plural(list('days', index), 'day')}`;
        case 'nap': return `Take a 20-minute nap ${plural(list('days', index), 'time')}`;
        default: throw new Error(`Unknown Mental kind: ${action.kind}`);
    }
}

function spiritualText(action, index) {
    switch (action.kind) {
        case 'quranPages': return `${action.name}: read ${plural(list('quranPages', index), 'page')}`;
        case 'quranMinutes': return `${action.name} for ${minutes(list('quranMinutes', index))}`;
        case 'quranVerses': return `${action.name}: complete ${plural(list('quranVerses', index), 'verse')}`;
        case 'knowledgeCount': return `${action.name}: complete ${plural(list('knowledge', index), 'learning milestone')}`;
        case 'days': return `${action.name} for ${plural(list('quranPages', index), 'day')}`;
        case 'rakah': return `${action.name}: complete ${plural(list('rakah', index), 'rakah', 'rakah')}`;
        case 'dhikr': return `${action.name} ${plural(list('dhikr', index), 'time')}`;
        case 'acts': return `${action.name}: complete ${plural(list('knowledge', index), 'sincere act')}`;
        case 'people': return `${action.name}: support ${plural(list('charity', index), 'person', 'people')}`;
        case 'items': return `${action.name}: contribute ${plural(list('charity', index), 'item')}`;
        case 'fastDays': return `${action.name}: observe ${plural(list('charity', index), 'voluntary fast day')}`;
        case 'screenHours': return `${action.name} for ${minutes(list('screenHours', index) * 60)}`;
        default: throw new Error(`Unknown Spiritual kind: ${action.kind}`);
    }
}

function hash(value) {
    let result = 2166136261;
    for (let index = 0; index < value.length; index += 1) {
        result ^= value.charCodeAt(index);
        result = Math.imul(result, 16777619);
    }
    return result >>> 0;
}

function randomFrom(seed) {
    let state = seed || 1;
    return () => {
        state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
        return state / 4294967296;
    };
}

const escapeXml = (value) => value.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[character]);

function emblem(icon, color) {
    const common = `fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"`;
    const icons = {
        strength: `<path d="M-58-18v36m-12-24v12m140-24v36m12-24v12M-58 0H58M-70-12v24m140-24v24"/>`,
        cardio: `<path d="M-70 0h24l14-34 22 68 18-50 14 16h48"/><path d="M-56 42h112" opacity=".35"/>`,
        mobility: `<path d="M-54 28c22-70 86-70 108 0M-42-30c38 20 66 20 84 0M0-52v104"/><circle cx="0" cy="0" r="16"/>`,
        mindfulness: `<path d="M0 38C-48 38-66 8-58-12-28-10-8 4 0 38Zm0 0C48 38 66 8 58-12 28-10 8 4 0 38Zm0 0C-20 4-18-30 0-48 18-30 20 4 0 38Z"/>`,
        reading: `<path d="M0-38C-20-50-44-50-66-40v80c22-10 46-10 66 2 20-12 44-12 66-2v-80c-22-10-46-10-66 2v80"/><path d="M-50-20h28m-28 16h38m12-16h28M10-4h38" opacity=".55"/>`,
        focus: `<path d="m0-62 62 62L0 62-62 0Z"/><path d="m0-36 36 36L0 36-36 0Z"/><circle cx="0" cy="0" r="8"/>`,
        writing: `<path d="m-46 38 12-36 68-68 30 30-68 68-42 6Z"/><path d="m18-50 30 30M-34 2l30 30M-60 54h120"/>`,
        memory: `<circle cx="0" cy="0" r="14"/><circle cx="-48" cy="-34" r="9"/><circle cx="50" cy="-30" r="9"/><circle cx="-46" cy="40" r="9"/><circle cx="52" cy="38" r="9"/><path d="m-9-12-30-17M10-11l31-15M-10 10l-27 23M11 11l31 21"/>`,
        skills: `<path d="m0-56 58 28L0 0-58-28Z"/><path d="m-58 0 58 28L58 0M-58 28 0 56l58-28"/>`,
        puzzle: `<path d="M-52-52h40v20c20-12 36 4 24 20h40v40H32c12 20-4 36-20 24v40h-40V72c-20 12-36-4-24-20h-40V12h40V-8c20 12 36-4 24-20h16v-24Z"/>`,
        quran: `<path d="M0-42C-20-54-44-54-64-44v84c22-10 44-10 64 2 20-12 42-12 64-2v-84c-20-10-44-10-64-2v84"/><path d="m0-28 5 12 13 1-10 9 3 13L0 1-11 7l3-13-10-9 13-1Z"/>`,
        salah: `<path d="M-58 54v-72C-58-58 0-70 0-70S58-58 58-18v72M-72 54H72M-34 54v-58c0-26 34-34 34-34s34 8 34 34v58"/>`,
        dhikr: `<ellipse cx="0" cy="0" rx="54" ry="66"/><circle cx="0" cy="-66" r="8"/><circle cx="54" cy="0" r="8"/><circle cx="0" cy="66" r="8"/><circle cx="-54" cy="0" r="8"/><path d="M0 74v22m-12 0h24"/>`,
        fasting: `<path d="M28-62C-28-50-48 12-14 50c22 24 60 20 78-2C10 68-34 38-30-6-26-36-4-54 28-62Z"/><path d="m42-24 5 12 13 1-10 9 3 13-11-7-11 7 3-13-10-9 13-1Z"/>`,
        charity: `<path d="M-62 10c20-8 34-4 48 12l20 22M62 10c-20-8-34-4-48 12L-6 44M-62 10v36c30 22 92 22 124 0V10"/><path d="M0 12C-34-10-20-42 0-24 20-42 34-10 0 12Z"/>`,
        knowledge: `<path d="M-58 48h116M-44 48v-72h88v72M-58-24h116M0-62v20"/><path d="m0-70 8 12-8 12-8-12Z"/>`,
        family: `<path d="M-62 48v-32c0-42 46-42 46 0v32M16 48v-32c0-42 46-42 46 0v32M-78 48H78M-38-38c22-20 54-20 76 0"/><circle cx="-39" cy="-42" r="10"/><circle cx="39" cy="-42" r="10"/>`,
        community: `<path d="m0-62 54 30v64L0 62-54 32v-64Z"/><circle cx="0" cy="0" r="13"/><circle cx="0" cy="-40" r="7"/><circle cx="34" cy="20" r="7"/><circle cx="-34" cy="20" r="7"/><path d="M0-27v-6M10 8l17 8M-10 8l-17 8"/>`,
    };
    return `<g ${common}>${icons[icon] || icons.focus}</g>`;
}

function artwork(quest, action, actionIndex, rankIndex, category) {
    const seed = hash(quest.id);
    const random = randomFrom(seed);
    const categoryColor = { Physical: '#4cd7f6', Mental: '#c4a5ff', Spiritual: '#e5b86b' }[category];
    const rankColors = ['#a9b0ba', '#8fc6b4', '#75b9d1', '#4cd7f6', '#7f9ee8', '#c4a5ff', '#ffc174', '#ef8d72', '#f0d6ff'];
    const accent = rankColors[rankIndex];
    const particles = Array.from({ length: 12 }, () => {
        const x = Math.round(35 + random() * 570);
        const y = Math.round(40 + random() * 300);
        const radius = (1 + random() * 2.2).toFixed(1);
        const opacity = (0.12 + random() * 0.36).toFixed(2);
        return `<circle cx="${x}" cy="${y}" r="${radius}" fill="${categoryColor}" opacity="${opacity}"/>`;
    }).join('');
    const rotation = Math.round(random() * 50 - 25);
    const orbit = 90 + (actionIndex % 5) * 7 + rankIndex * 2;
    const title = action.name.length > 43 ? `${action.name.slice(0, 40)}…` : action.name;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400" viewBox="0 0 640 400" role="img" aria-labelledby="title desc">
<title id="title">${escapeXml(quest.text)}</title><desc id="desc">${escapeXml(action.description)}</desc>
<defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#111319"/><stop offset="1" stop-color="#0a0b0e"/></linearGradient><radialGradient id="glow"><stop stop-color="${accent}" stop-opacity=".18"/><stop offset="1" stop-color="${accent}" stop-opacity="0"/></radialGradient><pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse"><path d="M32 0H0v32" fill="none" stroke="${categoryColor}" stroke-opacity=".055"/></pattern></defs>
<rect width="640" height="400" rx="24" fill="url(#bg)"/><rect width="640" height="400" rx="24" fill="url(#grid)"/><ellipse cx="${240 + actionIndex % 160}" cy="190" rx="240" ry="180" fill="url(#glow)"/>
<path d="M24 76V24h52M564 24h52v52M24 324v52h52M564 376h52v-52" fill="none" stroke="${accent}" stroke-opacity=".5" stroke-width="2"/>
<g transform="translate(320 184) rotate(${rotation})" fill="none" stroke="${categoryColor}"><circle r="${orbit}" stroke-opacity=".18"/><circle r="${orbit + 18}" stroke-opacity=".08" stroke-dasharray="3 12"/><path d="M0-${orbit + 28}v12M0${orbit + 16}v12M-${orbit + 28} 0h12M${orbit + 16} 0h12" stroke-opacity=".55"/></g>
<g transform="translate(320 184)">${emblem(action.icon, categoryColor)}</g>${particles}
<text x="36" y="52" fill="${categoryColor}" font-family="Arial,sans-serif" font-size="12" letter-spacing="3">AURA / ${category.toUpperCase()} PATH</text><text x="604" y="54" text-anchor="end" fill="${accent}" font-family="Georgia,serif" font-size="25" letter-spacing="2">${quest.rank}</text>
<path d="M36 292H604" stroke="${accent}" stroke-opacity=".2"/><text x="36" y="326" fill="#f3f0e9" font-family="Arial,sans-serif" font-size="18" font-weight="600">${escapeXml(title)}</text><text x="36" y="354" fill="#8e96a3" font-family="monospace" font-size="12" letter-spacing="2">${quest.id}</text><text x="604" y="354" text-anchor="end" fill="${accent}" font-family="Arial,sans-serif" font-size="11" letter-spacing="2">RANK ${rankIndex + 1} / 9</text>
</svg>`;
}

const configs = [
    { category: 'Physical', prefix: 'PH', actions: physicalActions, text: physicalText, directory: 'physical' },
    { category: 'Mental', prefix: 'ME', actions: mentalActions, text: mentalText, directory: 'mental' },
    { category: 'Spiritual', prefix: 'SP', actions: spiritualActions, text: spiritualText, directory: 'spiritual' },
];

const generated = {};
for (const config of configs) {
    if (config.actions.length !== 100) throw new Error(`${config.category} must contain exactly 100 base actions`);
    const output = [];
    const imageDirectory = path.join(root, 'public', 'images', 'quests', config.directory);
    await mkdir(imageDirectory, { recursive: true });
    for (let actionIndex = 0; actionIndex < config.actions.length; actionIndex += 1) {
        const action = config.actions[actionIndex];
        for (let rankIndex = 0; rankIndex < ranks.length; rankIndex += 1) {
            const reward = ranks[rankIndex];
            const id = `${config.prefix}-${String(actionIndex + 1).padStart(3, '0')}-${reward.rank}`;
            const text = config.text(action, rankIndex);
            const image = `/images/quests/${config.directory}/${id.toLowerCase()}.svg`;
            const quest = {
                id,
                rank: reward.rank,
                category: config.category,
                text,
                xp: reward.xp,
                gold: reward.gold,
                description: `${action.description} Objective: ${text}. Higher-rank totals may be accumulated across appropriate sessions unless the objective specifies otherwise.`,
                image,
                skillIds: action.skills,
                baseAction: action.name,
            };
            output.push(quest);
            await writeFile(path.join(imageDirectory, `${id.toLowerCase()}.svg`), artwork(quest, action, actionIndex, rankIndex, config.category));
        }
    }
    generated[config.category] = output;
    const jsonDirectory = path.join(root, 'components', 'aura', 'quests');
    await mkdir(jsonDirectory, { recursive: true });
    await writeFile(path.join(jsonDirectory, `${config.directory}.json`), `${JSON.stringify(output, null, 2)}\n`);
}

const all = Object.values(generated).flat();
const assertUnique = (field) => {
    const seen = new Set(all.map((quest) => quest[field]));
    if (seen.size !== 2700) throw new Error(`${field} is not unique: ${seen.size}/2700`);
};
assertUnique('id');
assertUnique('text');
assertUnique('description');
assertUnique('image');
for (const config of configs) {
    if (generated[config.category].length !== 900) throw new Error(`${config.category} count is not 900`);
    for (const { rank, xp, gold } of ranks) {
        const matches = generated[config.category].filter((quest) => quest.rank === rank);
        if (matches.length !== 100 || matches.some((quest) => quest.xp !== xp || quest.gold !== gold)) throw new Error(`${config.category} ${rank} rewards or count invalid`);
    }
}
console.log(`Generated ${all.length} quests and ${all.length} unique SVG illustrations.`);
for (const config of configs) console.log(`${config.category}: ${generated[config.category].length} quests`);
console.log(`Unique IDs/text/descriptions/images: ${all.length}/${all.length}/${all.length}/${all.length}`);
