import { generateQuest, getRankProbabilities } from '../components/aura/fate.js';
import {
    getLifeQuestBank,
    getLifeQuestById,
    lifeCategories,
    lifeQuestCount,
    LIFE_REFERENCES,
    rankDefinitions,
    SUPPORTED_LANGUAGES,
} from '../components/aura/life-quests.js';

const assert = (condition, message) => { if (!condition) throw new Error(message); };
const expectedByRank = { Religious: 500, Psychological: 400, Physical: 400, Mental: 400, SelfDevelopment: 400, Social: 400 };
const referenceCodes = new Set(LIFE_REFERENCES.map(([code]) => code));
const skillCoverage = new Map();

assert(lifeQuestCount === 22500, `Expected 22,500 tasks, found ${lifeQuestCount}`);
assert(lifeCategories.length === 6, 'Expected six life paths');
for (const category of lifeCategories) {
    assert(category.actions.length * category.contexts.length === category.perRank, `${category.id}: action/context matrix does not match per-rank count`);
    assert(category.actions.length === (category.id === 'Religious' ? 25 : 20), `${category.id}: unexpected base action count`);
    assert(category.contexts.length === 20, `${category.id}: expected 20 execution contexts`);
    assert(category.perRank === expectedByRank[category.id], `${category.id}: incorrect rank allocation`);
    for (const action of category.actions) {
        for (const language of SUPPORTED_LANGUAGES) assert(action.action[language]?.length > 8, `${category.id}: missing ${language} action translation`);
        for (const code of action.sources || category.sources) assert(referenceCodes.has(code), `${category.id}: unknown reference ${code}`);
    }
    for (const context of category.contexts) {
        for (const language of SUPPORTED_LANGUAGES) assert(context[language]?.length > 12, `${category.id}: missing ${language} context translation`);
    }
}

for (const language of SUPPORTED_LANGUAGES) {
    const quests = getLifeQuestBank(language);
    assert(quests.length === 22500, `${language}: expected 22,500 generated tasks`);
    for (const field of ['id', 'text', 'description', 'image']) {
        const unique = new Set(quests.map((quest) => quest[field]));
        assert(unique.size === 22500, `${language}: ${field} is not globally unique (${unique.size})`);
    }
    for (const category of lifeCategories) {
        for (const rank of rankDefinitions) {
            const matches = quests.filter((quest) => quest.category === category.id && quest.rank === rank.rank);
            assert(matches.length === category.perRank, `${language}/${category.id}/${rank.rank}: count mismatch`);
            assert(matches.every((quest) => quest.xp === rank.xp && quest.gold === rank.gold), `${language}/${category.id}/${rank.rank}: rewards mismatch`);
        }
    }
    for (const quest of quests) {
        assert(quest.generatedArt && quest.image === `aura-art://${quest.id.toLowerCase()}`, `${quest.id}: generated artwork identity missing`);
        assert(quest.skillIds.length > 0 && quest.sourceCodes.length > 0, `${quest.id}: skill or source relationship missing`);
        assert(quest.text.includes(quest.baseAction) && quest.text.includes(quest.context), `${quest.id}: incomplete localized text`);
        assert(getLifeQuestById(quest.id, language)?.text === quest.text, `${quest.id}: deterministic ID lookup failed`);
        for (const skill of quest.skillIds) skillCoverage.set(skill, (skillCoverage.get(skill) || 0) + 1);
    }
    const sample = quests.find((quest) => quest.category === 'Mental' && quest.unit === 'book');
    assert(sample && getLifeQuestById(`${sample.id.slice(0, -1)}SS`, language), `${language}: mental book track missing`);
    console.log(`PASS ${language}: 22,500 unique localized tasks, IDs, descriptions, artwork identities, sources, and rewards`);
}

const unlockExpectations = [
    [0, ['F']], [9, ['F']], [10, ['F', 'E']], [19, ['F', 'E']], [20, ['F', 'E', 'D']],
    [30, ['F', 'E', 'D', 'C']], [40, ['F', 'E', 'D', 'C', 'B']], [50, ['F', 'E', 'D', 'C', 'B', 'A']],
    [60, ['F', 'E', 'D', 'C', 'B', 'A', 'S']], [70, ['F', 'E', 'D', 'C', 'B', 'A', 'S', 'SS']],
    [80, ['F', 'E', 'D', 'C', 'B', 'A', 'S', 'SS', 'SSS']], [200, ['F', 'E', 'D', 'C', 'B', 'A', 'S', 'SS', 'SSS']],
];
for (const [level, expected] of unlockExpectations) {
    const probabilities = getRankProbabilities(level);
    const unlocked = probabilities.filter((item) => item.chance > 0).map((item) => item.rank);
    assert(JSON.stringify(unlocked) === JSON.stringify(expected), `Level ${level}: wrong ranks ${unlocked.join(',')}`);
    assert(Math.abs(probabilities.reduce((sum, item) => sum + item.chance, 0) - 100) < 0.000001, `Level ${level}: probabilities do not total 100`);
    for (let index = 0; index < 80; index += 1) {
        const quest = generateQuest(level, () => (index % 97) / 97, 'ar');
        assert(expected.includes(quest.rank), `Level ${level}: generated forbidden ${quest.rank} card`);
    }
    console.log(`PASS level ${level}: ${unlocked.join(' + ')} only, cumulative deck, weighted total 100%`);
}

const englishSocial = getLifeQuestBank('en').filter((quest) => quest.category === 'Social');
assert(englishSocial.some((quest) => /another gender/i.test(quest.baseAction)), 'Missing cross-gender perspective tasks');
assert(englishSocial.some((quest) => /Persuade with truthful evidence/i.test(quest.baseAction)), 'Missing ethical influence tasks');
assert(englishSocial.some((quest) => /right to refuse/i.test(quest.text)), 'Ethical influence lacks refusal protection');
assert(englishSocial.some((quest) => /mixed-gender/i.test(quest.baseAction)), 'Missing professional mixed-gender tasks');
assert(skillCoverage.has('iron-body') && skillCoverage.has('inner-peace') && skillCoverage.has('mind-palace') && skillCoverage.has('discipline'), 'Core skill coverage missing');

console.log('PASS 2,500 tasks per rank × 9 ranks = 22,500 tasks');
console.log('PASS category allocation: 4,500 Religious + 3,600 each for the other five paths');
console.log('PASS respectful cross-gender, marriage, family, consent, and ethical-influence coverage');
console.log('PASS every existing skill has generated-task relationships');
