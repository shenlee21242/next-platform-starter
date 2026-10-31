import assert from 'node:assert/strict';
import {
    getWorkdayBaseline,
    getWorkdayPrice,
    storeBalanceRows,
    workdayStoreItems,
} from '../components/aura/store-catalog.js';
import {
    createNewGame,
    resolveDailyProtection,
} from '../components/aura/game.js';

const expected = {
    'reward-break': 40,
    'reward-hour': 80,
    'reward-meal': 150,
    'reward-rest-day': 120,
    'reward-late-night': 200,
    'reward-small-gift': 300,
    'power-reroll': 40,
    'power-xp': 60,
    'power-streak-freeze': 80,
    'power-penalty-shield': 100,
    'power-gold': 150,
    'cosmetic-background': 250,
    'cosmetic-title': 300,
    'cosmetic-frame': 350,
    'cosmetic-theme': 400,
    'upgrade-quest-slot': 800,
    'upgrade-gold-cap': 600,
    'upgrade-second-chance': 1000,
};

const items = workdayStoreItems.filter((item) => item.category !== 'arena');
assert.equal(items.length, 18, 'The workday store must contain the 18 requested items');
assert.deepEqual(Object.fromEntries(items.map((item) => [item.id, item.percent])), expected);

for (const item of items) {
    assert.equal(getWorkdayPrice(100, item.percent), expected[item.id], `${item.id} price at a 100-Gold baseline`);
    for (const language of ['en', 'ar', 'fr', 'es']) {
        assert.ok(item.name[language], `${item.id} has a ${language} name`);
        assert.ok(item.description[language], `${item.id} has a ${language} description`);
    }
}

assert.deepEqual(storeBalanceRows, [
    { category: 'rewards', min: 40, max: 300 },
    { category: 'powerups', min: 40, max: 150 },
    { category: 'cosmetics', min: 250, max: 400 },
    { category: 'upgrades', min: 600, max: 1000 },
]);
assert.equal(getWorkdayBaseline([{ gold: 40, done: true }, { gold: 35 }, { gold: 25 }]), 100);
assert.equal(getWorkdayBaseline([{ gold: 40, done: true }, { gold: 25, done: true, skipped: true }]), 65, 'Rest-day skips do not change the full-workday reference');
assert.equal(getWorkdayBaseline([]), 100, 'An empty quest list uses a stable 100-Gold fallback');
assert.equal(getWorkdayPrice(70, 40), 28);
assert.equal(getWorkdayPrice(70, 150), 105);
assert.equal(getWorkdayPrice(101, 40), 41, 'Fractional prices round up');

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

console.log('PASS all 18 workday-store items, four-language copy, dynamic prices, and balance ranges');
console.log('PASS Penalty Shield, Streak Freeze, monthly Second Chance, and rest-day protection');
console.log('PASS new-game store, upgrade, effect, and daily-cap persistence defaults');
