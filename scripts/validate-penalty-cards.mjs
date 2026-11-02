import { existsSync, readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import {
    DEFAULT_PENALTY_CONTRACT,
    REAL_WORLD_TRIAL_CARD_IDS,
    createPenaltyTrialJudgment,
    PENALTY_RARITY_WEIGHTS,
    drawPenaltyCard,
    getAvailablePenaltyCards,
    normalizePenaltyContract,
    penaltyCards,
} from '../components/aura/penalty-cards.js';
import {
    createDailyQuest,
    createMonthlyQuest,
    createNewGame,
    createWeeklyQuest,
    getPeriodKey,
    localDayKey,
    withDailyQuest,
} from '../components/aura/game.js';
import { getRandomQuestSlotPrice } from '../components/aura/store-catalog.js';

const at = (day, hour = 3) => new Date(2026, 10, day, hour, 0, 0, 0);
assert.equal(penaltyCards.filter((card) => !card.realWorld).length, 16);
assert.equal(new Set(penaltyCards.map((card) => card.id)).size, penaltyCards.length);
assert.deepEqual(PENALTY_RARITY_WEIGHTS, { Common: 60, Uncommon: 25, Rare: 12, Legendary: 3 });
assert.equal(Object.values(PENALTY_RARITY_WEIGHTS).reduce((sum, value) => sum + value, 0), 100);
assert.equal(DEFAULT_PENALTY_CONTRACT.enabled, false);
assert.equal(DEFAULT_PENALTY_CONTRACT.tiers.Legendary, false);
assert.equal(DEFAULT_PENALTY_CONTRACT.realWorldCardIds.length, 0);
assert.ok(penaltyCards.every((card) => ['en', 'ar', 'fr', 'es'].every((language) => card.name[language] && card.text[language] && card.effectText[language])));
assert.ok(penaltyCards.every((card) => !('permanent' in card.effect) && !('price' in card.effect) && !('destroy' in card.effect)));
const viteConfig = readFileSync(new URL('../vite.config.js', import.meta.url), 'utf8');
for (const file of ['penalty-back.webp', 'penalty-sorceress.webp']) {
    assert.equal(existsSync(new URL(`../public/images/${file}`, import.meta.url)), true);
    assert.ok(viteConfig.includes(`'${file}'`), `${file} must be copied into the offline Android bundle`);
}
console.log('PASS 16 in-game cards, localized catalog, default opt-out, and non-destructive effects');

const openContract = normalizePenaltyContract({ enabled: true, tiers: { Common: true, Uncommon: true, Rare: true, Legendary: true } });
assert.equal(drawPenaltyCard(openContract, 6, 3, () => 0).rarity, 'Common');
assert.equal(drawPenaltyCard(openContract, 6, 3, () => 0.61).rarity, 'Uncommon');
assert.equal(drawPenaltyCard(openContract, 6, 3, () => 0.86).rarity, 'Rare');
assert.equal(drawPenaltyCard(openContract, 6, 3, () => 0.98).rarity, 'Legendary');
assert.equal(getAvailablePenaltyCards(openContract, 4, 9).some((card) => card.rarity === 'Legendary'), false);
assert.equal(getAvailablePenaltyCards(openContract, 6, 2).some((card) => card.rarity === 'Legendary'), false);
assert.equal(getAvailablePenaltyCards(openContract, 5, 3).some((card) => card.rarity === 'Legendary'), true);
assert.equal(getAvailablePenaltyCards(DEFAULT_PENALTY_CONTRACT, 10, 10).some((card) => card.realWorld), false);
const selectableRealCards = penaltyCards.filter((card) => card.realWorld && !card.legacy);
assert.deepEqual(selectableRealCards.map((card) => card.id), REAL_WORLD_TRIAL_CARD_IDS);
assert.equal(selectableRealCards.length, 14);
assert.deepEqual(Object.fromEntries(['Common', 'Uncommon', 'Rare', 'Legendary'].map((rarity) => [rarity, selectableRealCards.filter((card) => card.rarity === rarity).length])), { Common: 3, Uncommon: 4, Rare: 3, Legendary: 4 });
assert.ok(penaltyCards.find((card) => card.id === 'real-physical-debt').effectText.ar.includes('50'));
assert.ok(penaltyCards.find((card) => card.id === 'real-reapers-chill').effectText.ar.includes('ماء بارد'));
assert.ok(penaltyCards.find((card) => card.id === 'real-small-tribute').effectText.en.includes('UNICEF'));
assert.ok(penaltyCards.find((card) => card.id === 'real-harsh-tribute').effectText.en.includes('5 US dollars'));
assert.ok(penaltyCards.find((card) => card.id === 'real-luxury-lockdown').effectText.en.includes('three days'));
assert.ok(penaltyCards.find((card) => card.id === 'real-digital-shame').effectText.en.includes('Post a Story'));
assert.ok(penaltyCards.find((card) => card.id === 'real-ultimate-tribute').effectText.en.includes('20 US dollars'));
const legacySelection = normalizePenaltyContract({ realWorldCardIds: ['real-chaos-theory'] });
assert.deepEqual(legacySelection.realWorldCardIds, [], 'Changed real-world terms require renewed opt-in');
assert.deepEqual(normalizePenaltyContract({ realWorldContractVersion: 2, realWorldCardIds: ['real-chaos-theory'] }).realWorldCardIds, ['real-chaos-theory']);
const allRealContract = normalizePenaltyContract({ enabled: true, tiers: { Common: true, Uncommon: true, Rare: true, Legendary: true }, realWorldContractVersion: 2, realWorldCardIds: penaltyCards.filter((card) => card.realWorld).map((card) => card.id) });
assert.equal(getAvailablePenaltyCards(allRealContract, 10, 10).filter((card) => card.legacy).length, 0);
assert.equal(getAvailablePenaltyCards(allRealContract, 10, 10).filter((card) => card.realWorld).length, 14);
const trialDate = new Date('2026-11-02T20:00:00Z');
let trialHistory = [];
for (let index = 0; index < 15; index += 1) {
    const trial = createPenaltyTrialJudgment(trialHistory, trialDate);
    assert.equal(trial.cardId, REAL_WORLD_TRIAL_CARD_IDS[index % 14]);
    assert.equal(trial.status, 'awaiting');
    assert.equal(trial.reason, 'developer-trial');
    assert.equal(trial.realWorld, true);
    trialHistory = [trial, ...trialHistory];
}
console.log('PASS exact 3/4/3/4 real-world catalog, renewed opt-in, legacy archives, and 14-card JSS777 trial cycle');
console.log('PASS rarity weights, card selection, Legendary level/neglect gates, and real-world opt-in');

const previousDay = at(1, 12);
const goals = [
    createDailyQuest({ heroClass: 'Shadow Ranger' }, null, previousDay),
    createWeeklyQuest(previousDay),
    createMonthlyQuest(previousDay),
];
const contract = normalizePenaltyContract({
    enabled: true,
    tiers: { Common: true, Uncommon: false, Rare: false, Legendary: false },
    disabledCardIds: penaltyCards.filter((card) => card.rarity === 'Common' && card.id !== 'mist-whisper').map((card) => card.id),
});
const base = {
    ...createNewGame(),
    profileComplete: true,
    quests: goals.map((quest) => quest.period === 'day' ? { ...quest, done: false } : { ...quest, done: true }),
    lastQuestDate: '2026-11-01',
    lastActivityDay: '2026-11-01',
    level: 6,
    xp: 200,
    gold: 500,
    streak: 4,
    judgments: [],
    settings: { language: 'en', penalty: 'Standard', penaltyContract: contract },
    inventory: ['power-penalty-shield', 'power-streak-freeze'],
};
const originalRandom = Math.random;
Math.random = () => 0;
try {
    const before = withDailyQuest(base, at(2, 2));
    assert.equal(before.judgments.length, 0, 'No judgment before 03:00');
    assert.equal(before.lastQuestDate, '2026-11-01');
    const judged = withDailyQuest(base, at(2, 3));
    assert.equal(judged.judgments.length, 1);
    assert.equal(judged.judgments[0].id, 'judgment-2026-11-02');
    assert.equal(judged.judgments[0].cardId, 'mist-whisper');
    assert.equal(judged.judgments[0].status, 'awaiting');
    assert.equal(judged.gold, 500, 'No effect applies before the user accepts');
    assert.equal(judged.streak, 4);
    assert.deepEqual(judged.inventory, base.inventory, 'Shield is reserved for the user decision');
    assert.equal(judged.notifications[0].title, 'AURA judgment pending');
    const duplicate = withDailyQuest(judged, at(2, 4));
    assert.equal(duplicate.judgments.length, 1, 'A failure day produces only one judgment');
    assert.equal(getPeriodKey('day', at(2, 3)), localDayKey(at(2, 3)));

    const protectedGame = withDailyQuest({ ...base, upgrades: { ...base.upgrades, secondChance: 1 } }, at(2, 3));
    assert.equal(protectedGame.judgments.length, 0);
    assert.equal(protectedGame.secondChanceMonth, '2026-11');
    assert.equal(protectedGame.gold, 500);

    const inactive = withDailyQuest({
        ...base,
        quests: goals.map((quest) => ({ ...quest, done: true })),
        lastActivityDay: '2026-10-31',
    }, at(2, 3));
    assert.equal(inactive.judgments.length, 1, 'A full inactive day is judged even when no daily quest remains open');
    assert.equal(inactive.judgments[0].reason, 'streak-broken');

    const previousSunday = at(8, 12);
    const longFailure = withDailyQuest({
        ...base,
        quests: [
            { ...createDailyQuest({ heroClass: 'Shadow Ranger' }, null, previousSunday), done: true },
            { ...createWeeklyQuest(previousSunday), done: false },
            { ...createMonthlyQuest(previousSunday), done: true },
        ],
        lastQuestDate: '2026-11-08',
        lastActivityDay: '2026-11-08',
    }, at(9, 3));
    assert.equal(longFailure.judgments.length, 1, 'An expired incomplete weekly goal triggers judgment');
    assert.equal(longFailure.judgments[0].reason, 'quest-expired');

    const legendaryOnly = normalizePenaltyContract({ enabled: true, tiers: { Common: false, Uncommon: false, Rare: false, Legendary: true } });
    const lockedPool = withDailyQuest({
        ...base,
        level: 1,
        neglectDays: 0,
        settings: { ...base.settings, penaltyContract: legendaryOnly },
    }, at(2, 3));
    assert.equal(lockedPool.judgments.length, 0);
    assert.equal(lockedPool.gold, 500, 'An empty eligible contract pool never falls back to an unselected legacy punishment');
    assert.equal(lockedPool.streak, 4);
} finally {
    Math.random = originalRandom;
}
console.log('PASS 03:00 evaluation, pending-only effects, deduplication, inactivity, and Second Chance');

assert.deepEqual(Array.from({ length: 7 }, (_, index) => getRandomQuestSlotPrice(index + 4)), [30, 42, 59, 82, 115, 161, 226]);
console.log('PASS permanent slot purchases and exact store ladder remain untouched');
