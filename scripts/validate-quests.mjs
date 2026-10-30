import { readFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { physicalActions } from './physical-actions.mjs';
import { mentalActions } from './mental-actions.mjs';
import { spiritualActions } from './spiritual-actions.mjs';

const ranks = ['F', 'E', 'D', 'C', 'B', 'A', 'S', 'SS', 'SSS'];
const rewards = [[20, 10], [50, 25], [100, 50], [250, 100], [500, 250], [1000, 500], [2500, 1000], [5000, 2500], [10000, 5000]];
const reps = [5, 10, 15, 25, 40, 60, 100, 150, 300];
const seconds = [30, 45, 60, 90, 120, 180, 300, 420, 600];
const distances = [200, 400, 800, 1500, 3000, 5000, 10000, 15000, 21000];
const pages = [3, 5, 10, 20, 30, 50, 100];
const focus = [15, 25, 45, 60, 120, 180, 240, 360, 480];
const writing = [50, 100, 200, 500, 1000, 2000, 3000, 5000];
const memory = [1, 3, 5, 10, 20, 50, 100, 200, 500];
const quranPages = [1, 2, 5, 10, 20, 50, 100, 300, 604];
const quranMinutes = [5, 10, 15, 30, 60, 120, 240, 480, 720];
const quranVerses = [1, 2, 5, 10, 20, 50, 100, 500, 1000];
const knowledge = [1, 2, 5, 10, 20, 50, 100, 200, 365];
const charity = [1, 2, 5, 10, 20, 50, 100, 200, 500];
const dhikr = [10, 33, 100, 300, 500, 1000, 3000, 5000, 10000];
const rakah = [2, 4, 10, 20, 40, 100, 200, 500, 1000];
const screenHours = [1, 2, 5, 12, 24, 48, 72, 168, 336];
const number = (value) => value.toLocaleString('en-US');
const secondsText = (value) => value < 60 ? `${value} seconds` : `${value / 60} ${value === 60 ? 'minute' : 'minutes'}`;
const minutesText = (value) => value < 60 ? `${value} ${value === 1 ? 'minute' : 'minutes'}` : `${value / 60} ${value === 60 ? 'hour' : 'hours'}`;
const distanceText = (value) => value < 1000 ? `${value} m` : `${number(value / 1000)} km`;
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const includes = (quest, expected) => assert(quest.text.includes(expected), `${quest.id}: expected “${expected}” in “${quest.text}”`);

function validateScaling(action, quest, index, category) {
    if (category === 'Physical') {
        if (action.kind === 'reps') includes(quest, `${number(reps[index])} ${reps[index] === 1 ? 'repetition' : 'repetitions'}`);
        if (['time', 'nature', 'cold'].includes(action.kind)) includes(quest, secondsText(seconds[index]));
        if (action.kind === 'distance') includes(quest, distanceText(distances[index]));
        return;
    }
    if (category === 'Mental') {
        if (action.kind === 'reading') {
            if (index < 7) includes(quest, `${pages[index]} ${pages[index] === 1 ? 'page' : 'pages'}`);
            if (index === 7) includes(quest, 'one full book');
            if (index === 8) { includes(quest, 'two full books'); includes(quest, 'one week'); }
        }
        if (['media', 'pomodoro', 'deep50', 'deep90', 'focus', 'mindfulness'].includes(action.kind)) includes(quest, minutesText(focus[index]));
        if (['writing', 'reviewWriting'].includes(action.kind)) {
            if (index < 8) includes(quest, `${number(writing[index])} ${writing[index] === 1 ? 'word' : 'words'}`);
            else includes(quest, 'short book');
        }
        if (['language', 'memoryWords', 'memoryUse', 'memoryQuote', 'memoryPalace', 'mentalMath', 'memoryPoem', 'recall', 'idioms', 'teachConcept', 'flashcards'].includes(action.kind)) includes(quest, number(memory[index]));
        if (action.kind === 'skills') includes(quest, ['Watch a tutorial', 'basics', 'simple exercise', 'small project', 'intermediate project', 'mastery', 'portfolio', 'complete product', 'Launch a real public project'][index]);
        if (action.kind === 'problem') {
            if (index === 8) includes(quest, 'original');
            else { includes(quest, ['easy', 'easy', 'medium', 'medium', 'hard', 'hard', 'expert', 'expert'][index]); includes(quest, `Solve ${[1, 2, 1, 2, 1, 2, 1, 2][index]} `); }
        }
        if (['sleep', 'sleepScreen', 'socialDetox', 'nap'].includes(action.kind)) includes(quest, number([1, 2, 3, 5, 7, 14, 30, 60, 100][index]));
        return;
    }
    if (action.kind === 'quranPages') includes(quest, `${number(quranPages[index])} ${quranPages[index] === 1 ? 'page' : 'pages'}`);
    if (action.kind === 'quranMinutes') includes(quest, minutesText(quranMinutes[index]));
    if (action.kind === 'quranVerses') includes(quest, `${number(quranVerses[index])} ${quranVerses[index] === 1 ? 'verse' : 'verses'}`);
    if (action.kind === 'knowledgeCount') includes(quest, `${number(knowledge[index])} learning`);
    if (action.kind === 'days') includes(quest, `${number(quranPages[index])} ${quranPages[index] === 1 ? 'day' : 'days'}`);
    if (action.kind === 'rakah') includes(quest, `${number(rakah[index])} rakah`);
    if (action.kind === 'dhikr') includes(quest, `${number(dhikr[index])} ${dhikr[index] === 1 ? 'time' : 'times'}`);
    if (action.kind === 'acts') includes(quest, `${number(knowledge[index])} sincere`);
    if (action.kind === 'people') includes(quest, number(charity[index]));
    if (action.kind === 'items') includes(quest, `${number(charity[index])} ${charity[index] === 1 ? 'item' : 'items'}`);
    if (action.kind === 'fastDays') includes(quest, `${number(charity[index])} voluntary`);
    if (action.kind === 'screenHours') includes(quest, minutesText(screenHours[index] * 60));
}

const configs = [
    { category: 'Physical', prefix: 'PH', directory: 'physical', actions: physicalActions },
    { category: 'Mental', prefix: 'ME', directory: 'mental', actions: mentalActions },
    { category: 'Spiritual', prefix: 'SP', directory: 'spiritual', actions: spiritualActions },
];
const all = [];
const artworkHashes = new Set();
const dataSource = await readFile('components/aura/data.js', 'utf8');
const skillBlock = dataSource.split('export const skills = [')[1]?.split('];')[0] || '';
const skillIds = [...skillBlock.matchAll(/\{ id: '([^']+)'/g)].map((match) => match[1]);
assert(skillIds.length >= 8, 'Could not read all skill definitions');
const coverage = Object.fromEntries(skillIds.map((skillId) => [skillId, 0]));

for (const config of configs) {
    assert(config.actions.length === 100, `${config.category}: expected 100 base actions`);
    assert(new Set(config.actions.map((action) => action.name)).size === 100, `${config.category}: duplicate base action names`);
    assert(new Set(config.actions.map((action) => action.description)).size === 100, `${config.category}: duplicate base descriptions`);
    const quests = JSON.parse(await readFile(`components/aura/quests/${config.directory}.json`, 'utf8'));
    assert(Array.isArray(quests) && quests.length === 900, `${config.category}: expected a 900-item JSON array`);
    const files = await readdir(`public/images/quests/${config.directory}`);
    assert(files.filter((file) => file.endsWith('.svg')).length === 900, `${config.category}: expected 900 SVG files`);
    for (let actionIndex = 0; actionIndex < 100; actionIndex += 1) {
        const action = config.actions[actionIndex];
        for (let rankIndex = 0; rankIndex < 9; rankIndex += 1) {
            const quest = quests[actionIndex * 9 + rankIndex];
            const id = `${config.prefix}-${String(actionIndex + 1).padStart(3, '0')}-${ranks[rankIndex]}`;
            assert(quest.id === id, `${config.category}: unexpected ID/order at ${id}`);
            assert(quest.rank === ranks[rankIndex] && quest.category === config.category, `${id}: rank/category mismatch`);
            assert(quest.xp === rewards[rankIndex][0] && quest.gold === rewards[rankIndex][1], `${id}: reward mismatch`);
            for (const field of ['text', 'description', 'image', 'baseAction']) assert(typeof quest[field] === 'string' && quest[field].length > 0, `${id}: missing ${field}`);
            assert(quest.baseAction === action.name, `${id}: base action mismatch`);
            assert(quest.description.includes(`Objective: ${quest.text}.`), `${id}: description does not contain its unique objective`);
            assert(Array.isArray(quest.skillIds) && quest.skillIds.length > 0, `${id}: missing skill links`);
            for (const skillId of quest.skillIds) {
                assert(Object.hasOwn(coverage, skillId), `${id}: unknown skill ${skillId}`);
                coverage[skillId] += 1;
            }
            assert(quest.image === `/images/quests/${config.directory}/${id.toLowerCase()}.svg`, `${id}: image path mismatch`);
            const svg = await readFile(`public${quest.image}`);
            assert(svg.toString('utf8').includes(id) && svg.toString('utf8').includes('<svg'), `${id}: invalid individual artwork`);
            artworkHashes.add(createHash('sha256').update(svg).digest('hex'));
            validateScaling(action, quest, rankIndex, config.category);
            all.push(quest);
        }
    }
}

assert(all.length === 2700, 'Total quest count is not 2700');
for (const field of ['id', 'text', 'description', 'image']) assert(new Set(all.map((quest) => quest[field])).size === 2700, `${field} values are not globally unique`);
assert(artworkHashes.size === 2700, `Artwork content is not unique: ${artworkHashes.size}/2700`);
for (const [skillId, count] of Object.entries(coverage)) assert(count > 0, `${skillId} has no linked random quests`);
const inclusiveActions = spiritualActions.filter((action) => /opposite-sex|mixed-gender|marriage|spouse|sister|mother/i.test(action.name));
assert(inclusiveActions.length >= 6, 'Respectful family/marriage/opposite-sex task coverage is missing');

console.log('PASS 2,700 valid quests: 900 Physical, 900 Mental, 900 Spiritual');
console.log('PASS nine ranks per base action, exact rewards, and category-specific scaling');
console.log('PASS globally unique IDs, text, descriptions, image paths, and 2,700 artwork hashes');
console.log('PASS every skill has linked random quests:', coverage);
console.log(`PASS respectful family/marriage/opposite-sex coverage: ${inclusiveActions.length} base actions`);
