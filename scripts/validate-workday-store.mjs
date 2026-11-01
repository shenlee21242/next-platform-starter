import assert from 'node:assert/strict';
import {
    getNextRandomQuestSlot,
    getNextRandomQuestSlotPrice,
    getRandomQuestSlotLimit,
    getRandomQuestSlotPrice,
    getWorkdayBaseline,
    getWorkdayPrice,
    MAX_RANDOM_QUEST_SLOTS,
    MIN_RANDOM_QUEST_SLOTS,
    WORKDAY_BASELINE_GOLD,
    storeBalanceRows,
    workdayStoreItems,
} from '../components/aura/store-catalog.js';
import {
    countActiveRandomQuests,
    createDailyQuest,
    createNewGame,
    isRandomQuest,
    resolveDailyProtection,
} from '../components/aura/game.js';

const expectedPercents = {
    'reward-break': 40,
    'reward-hour': 80,
    'reward-meal': 150,
    'reward-rest-day': 120,
    'reward-late-night': 200,
    'reward-small-gift': 300,
    'power-reroll': 50,
    'power-xp': 80,
    'power-streak-freeze': 100,
    'power-penalty-shield': 150,
    'power-gold': 250,
    'cosmetic-background': 400,
    'cosmetic-title': 900,
    'cosmetic-frame': 600,
    'cosmetic-theme': 1500,
    'upgrade-gold-cap': 600,
    'upgrade-second-chance': 1000,
};

const expectedPrices = {
    'reward-break': 4,
    'reward-hour': 8,
    'reward-meal': 15,
    'reward-rest-day': 12,
    'reward-late-night': 20,
    'reward-small-gift': 30,
    'power-reroll': 5,
    'power-xp': 8,
    'power-streak-freeze': 10,
    'power-penalty-shield': 15,
    'power-gold': 25,
    'cosmetic-background': 40,
    'cosmetic-title': 90,
    'cosmetic-frame': 60,
    'cosmetic-theme': 150,
    'upgrade-gold-cap': 60,
    'upgrade-second-chance': 100,
};

const items = workdayStoreItems.filter((item) => item.category !== 'arena');
assert.equal(items.length, 18, 'The store must contain 17 workday-priced items plus the fixed-price random slot upgrade');
assert.deepEqual(Object.fromEntries(items.filter((item) => item.percent !== undefined).map((item) => [item.id, item.percent])), expectedPercents);
assert.equal(items.find((item) => item.id === 'upgrade-quest-slot')?.pricing, 'random-slot');
assert.equal(WORKDAY_BASELINE_GOLD, 10);

for (const item of items) {
    if (item.percent !== undefined) assert.equal(getWorkdayPrice(WORKDAY_BASELINE_GOLD, item.percent), expectedPrices[item.id], `${item.id} exact Gold price at the 10-Gold workday baseline`);
    for (const language of ['en', 'ar', 'fr', 'es']) {
        assert.ok(item.name[language], `${item.id} has a ${language} name`);
        assert.ok(item.description[language], `${item.id} has a ${language} description`);
    }
}

assert.deepEqual(storeBalanceRows, [
    { category: 'rewards', min: 40, max: 300 },
    { category: 'powerups', min: 50, max: 250 },
    { category: 'cosmetics', min: 400, max: 1500 },
    { category: 'upgrades', min: 600, max: 1000 },
]);
assert.equal(getWorkdayBaseline(), 10);
assert.equal(getWorkdayBaseline([{ gold: 1000000 }, { gold: 2000000 }]), 10, 'Quest count and rewards never inflate store prices');
assert.equal(getWorkdayBaseline([]), 10, 'An empty quest list uses the same 10-Gold reference');
assert.equal(getWorkdayPrice(70, 40), 28, 'The generic percentage helper still supports custom references');
assert.equal(getWorkdayPrice(70, 150), 105);
assert.equal(getWorkdayPrice(101, 40), 41, 'Fractional prices round up');
assert.equal(getWorkdayPrice(getWorkdayBaseline(), 200), 20, 'Base daily Gold cap is 200% of ten Gold');
assert.equal(getWorkdayPrice(getWorkdayBaseline(), 300), 30, 'Each cap upgrade adds ten Gold');
assert.equal(getWorkdayPrice(getWorkdayBaseline(), workdayStoreItems.find((item) => item.id === 'p4').percent), 100, 'The unlisted PvP spell keeps its previous reference price');

const expectedSlotPrices = { 4: 30, 5: 42, 6: 59, 7: 82, 8: 115, 9: 161, 10: 226 };
assert.equal(MIN_RANDOM_QUEST_SLOTS, 3);
assert.equal(MAX_RANDOM_QUEST_SLOTS, 10);
for (const [slot, price] of Object.entries(expectedSlotPrices)) {
    assert.equal(getRandomQuestSlotPrice(Number(slot)), price, `Random slot ${slot} price`);
}
assert.equal(Object.values(expectedSlotPrices).reduce((sum, price) => sum + price, 0), 715);
assert.equal(getRandomQuestSlotPrice(3), null);
assert.equal(getRandomQuestSlotPrice(11), null);
assert.equal(getRandomQuestSlotLimit({ questSlots: 0 }), 3);
for (let purchased = 0; purchased <= 7; purchased += 1) {
    const upgrades = { questSlots: purchased };
    const expectedLimit = Math.min(10, 3 + purchased);
    assert.equal(getRandomQuestSlotLimit(upgrades), expectedLimit);
    assert.equal(getNextRandomQuestSlot(upgrades), expectedLimit < 10 ? expectedLimit + 1 : null);
    assert.equal(getNextRandomQuestSlotPrice(upgrades), expectedLimit < 10 ? expectedSlotPrices[expectedLimit + 1] : null);
}
assert.equal(getRandomQuestSlotLimit({ questSlots: 99 }), 10, 'Legacy purchases remain capped at ten slots');

const custom = { id: 1, questKind: 'custom', done: false };
const selected = { id: 'chain-1', questKind: 'selected', done: false };
const daily = { id: 'daily-1', generated: true, done: false };
const fate = { id: 'fate-1', done: false };
const rerolled = { id: 'reroll-1', done: false };
assert.equal(countActiveRandomQuests([custom, selected, daily, fate, rerolled]), 3);
assert.equal(countActiveRandomQuests([custom, selected, daily, { ...fate, done: true }, rerolled]), 2, 'Completed random quests release their active slots');
assert.equal(isRandomQuest(custom), false);
assert.equal(isRandomQuest(selected), false);
assert.equal(isRandomQuest(createDailyQuest({ heroClass: 'Shadow Ranger' })), true);

const incomplete = [{ id: 'one', done: false }];
const shield = resolveDailyProtection({ quests: incomplete, inventory: ['power-penalty-shield'] });
assert.equal(shield.gold, 0);
assert.equal(shield.streakReset, false);
assert.equal(shield.protection, 'Penalty Shield');
assert.deepEqual(shield.inventory, []);

const freeze = resolveDailyProtection({ quests: incomplete, inventory: ['power-streak-freeze'] });
assert.equal(freeze.gold, 100);
assert.equal(freeze.streakReset, false);
assert.equal(freeze.protection, 'Streak Freeze');
assert.deepEqual(freeze.inventory, []);

const date = new Date('2026-10-31T12:00:00');
const secondChance = resolveDailyProtection({
    quests: incomplete,
    inventory: ['power-penalty-shield'],
    upgrades: { secondChance: 1 },
    secondChanceMonth: '2026-09',
}, date);
assert.equal(secondChance.gold, 0);
assert.equal(secondChance.streakReset, false);
assert.equal(secondChance.protection, 'Second Chance');
assert.equal(secondChance.secondChanceMonth, '2026-10');
assert.deepEqual(secondChance.inventory, ['power-penalty-shield'], 'Monthly protection does not consume a shield');

const alreadyUsed = resolveDailyProtection({
    quests: incomplete,
    inventory: ['power-penalty-shield'],
    upgrades: { secondChance: 1 },
    secondChanceMonth: '2026-10',
}, date);
assert.equal(alreadyUsed.protection, 'Penalty Shield');
assert.deepEqual(alreadyUsed.inventory, []);

const rested = resolveDailyProtection({ quests: [{ id: 'rest', done: true, skipped: true }] });
assert.equal(rested.incomplete, 0);
assert.equal(rested.gold, 0);
assert.equal(rested.streakReset, false);

const game = createNewGame({ name: 'Store Validator' });
assert.deepEqual(game.customRewards, []);
assert.deepEqual(game.purchaseHistory, []);
assert.deepEqual(game.upgrades, { questSlots: 0, goldCap: 0, secondChance: 0 });
assert.equal(game.dailyGoldEarned, 0);

console.log('PASS all 17 requested prices at a stable 10-Gold workday reference, four-language copy, and balance ranges');
console.log('PASS random slots 3–10, fixed prices 30/42/59/82/115/161/226 (715 total), and active-quest classification');
console.log('PASS Penalty Shield, Streak Freeze, monthly Second Chance, and rest-day protection');
console.log('PASS new-game store, upgrade, effect, and daily-cap persistence defaults');
