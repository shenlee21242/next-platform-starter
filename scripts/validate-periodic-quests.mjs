import assert from 'node:assert/strict';
import {
    countActiveRandomQuests,
    createDailyQuest,
    createMonthlyQuest,
    createNewGame,
    createWeeklyQuest,
    getPeriodBounds,
    getPeriodKey,
    isRandomQuest,
    localDayKey,
    localMonthKey,
    localWeekKey,
    secondsUntilPeriodEnd,
    updatePeriodicQuests,
    withDailyQuest,
} from '../components/aura/game.js';

const at = (year, month, day, hour = 12) => new Date(year, month - 1, day, hour, 0, 0, 0);
const byId = (game, id) => game.quests.find((quest) => quest.id === id);
const goalIds = (game) => game.quests.filter((quest) => quest.questKind === 'goal').map((quest) => quest.id).sort();

const sunday = at(2026, 11, 1);
assert.equal(localDayKey(sunday), '2026-11-01');
assert.equal(localWeekKey(sunday), '2026-10-26', 'Weeks start on Monday');
assert.equal(localMonthKey(sunday), '2026-11');
assert.equal(getPeriodKey('day', sunday), '2026-11-01');
assert.equal(getPeriodKey('week', sunday), '2026-10-26');
assert.equal(getPeriodKey('month', sunday), '2026-11');
assert.equal(secondsUntilPeriodEnd('day', sunday), 43200);
assert.equal(secondsUntilPeriodEnd('week', sunday), 43200);
assert.equal(secondsUntilPeriodEnd('month', sunday), 2548800);
assert.equal(secondsUntilPeriodEnd('week', at(2026, 11, 2)), 561600);
assert.equal(secondsUntilPeriodEnd('month', at(2026, 11, 30)), 43200);
assert.equal(localDayKey(getPeriodBounds('day', sunday).start), '2026-11-01');
assert.equal(localDayKey(getPeriodBounds('day', sunday).end), '2026-11-01');
assert.equal(localDayKey(getPeriodBounds('week', sunday).start), '2026-10-26');
assert.equal(localDayKey(getPeriodBounds('week', sunday).end), '2026-11-01');
assert.equal(localDayKey(getPeriodBounds('week', at(2026, 11, 2)).end), '2026-11-08');
assert.equal(localDayKey(getPeriodBounds('month', sunday).start), '2026-11-01');
assert.equal(localDayKey(getPeriodBounds('month', sunday).end), '2026-11-30');
assert.equal(getPeriodBounds('month', sunday).end.getHours(), 23);
console.log('PASS local day/week/month keys, inclusive date ranges, and exact period deadlines');

const initial = withDailyQuest({ ...createNewGame(), profileComplete: true }, sunday);
assert.deepEqual(goalIds(initial), ['daily-2026-11-01', 'monthly-2026-11', 'weekly-2026-10-26']);
assert.equal(initial.quests.length, 3);
assert.equal(countActiveRandomQuests(initial.quests), 0, 'Automatic goals do not consume random slots');
assert.equal(isRandomQuest(createDailyQuest({ heroClass: 'Shadow Ranger' }, null, sunday)), false);
assert.equal(isRandomQuest(createWeeklyQuest(sunday)), false);
assert.equal(isRandomQuest(createMonthlyQuest(sunday)), false);
assert.equal(createDailyQuest({ heroClass: 'Shadow Ranger' }, null, sunday, 'ar').title, 'أكمل جلسة تركيز لمدة 20 دقيقة');
assert.equal(createWeeklyQuest(sunday, 'ar').title, 'أكمل ثلاث جلسات عمل بلا تشتت هذا الأسبوع');
assert.equal(createWeeklyQuest(at(2026, 11, 2)).title, createWeeklyQuest(at(2026, 11, 8)).title, 'Weekly template stays stable from Monday through Sunday');
assert.equal(createMonthlyQuest(sunday, 'fr').title, 'Créez une routine d’exercice durable et évaluez-la ce mois-ci');
assert.equal(createMonthlyQuest(sunday, 'es').title, 'Crea una rutina de ejercicio sostenible y revísala este mes');
assert.ok(initial.quests.every((quest) => quest.periodKey === getPeriodKey(quest.period, sunday)));
assert.ok(initial.quests.every((quest) => quest.diamonds === 0));
console.log('PASS localized daily/weekly/monthly generation and random-slot independence');

const duplicateCheck = updatePeriodicQuests({ ...initial, language: 'en' }, at(2026, 11, 1, 18));
assert.equal(duplicateCheck.quests.length, 3, 'Same-period updates never duplicate goals');
assert.deepEqual(duplicateCheck.createdPeriods, []);
assert.equal(duplicateCheck.isNewDay, false);
const preserved = withDailyQuest({ ...initial, dailyGoldEarned: 17 }, at(2026, 11, 1, 18));
assert.equal(preserved.dailyGoldEarned, 17, 'Same-day migration does not reset the Gold cap');
assert.equal(preserved.quests.length, 3);
console.log('PASS idempotent same-day persistence');

const custom = (id, period, periodKey) => ({ id, title: id, category: 'Mental', duration: 10, xp: 10, gold: 1, done: false, questKind: 'custom', period, periodKey });
const legacyCustom = { id: 'legacy-custom', title: 'Persistent custom quest', category: 'Mental', duration: 10, xp: 10, gold: 1, done: false, questKind: 'custom' };
const fate = { id: 'fate-test', title: 'Fate quest', category: 'Mental', duration: 10, xp: 10, gold: 1, done: false, questKind: 'random' };
let game = {
    ...initial,
    quests: [
        ...initial.quests,
        custom('custom-day', 'day', '2026-11-01'),
        custom('custom-week', 'week', '2026-10-26'),
        custom('custom-month', 'month', '2026-11'),
        legacyCustom,
        fate,
    ],
    focusSessions: 4,
    focusMinutes: 90,
};
const monday = withDailyQuest(game, at(2026, 11, 2));
assert.ok(byId(monday, 'daily-2026-11-02'));
assert.ok(byId(monday, 'weekly-2026-11-02'));
assert.ok(byId(monday, 'monthly-2026-11'), 'Monthly goal survives the weekly reset');
assert.equal(byId(monday, 'custom-day'), undefined);
assert.equal(byId(monday, 'custom-week'), undefined);
assert.ok(byId(monday, 'custom-month'), 'Custom monthly goal survives daily and weekly resets');
assert.ok(byId(monday, 'legacy-custom'));
assert.ok(byId(monday, 'fate-test'));
assert.equal(monday.focusSessions, 0);
assert.equal(monday.focusMinutes, 0);

const tuesday = withDailyQuest(monday, at(2026, 11, 3));
assert.ok(byId(tuesday, 'daily-2026-11-03'));
assert.ok(byId(tuesday, 'weekly-2026-11-02'), 'Weekly goal survives an ordinary daily reset');
assert.ok(byId(tuesday, 'monthly-2026-11'), 'Monthly goal survives another daily reset');
assert.ok(byId(tuesday, 'custom-month'));
assert.ok(byId(tuesday, 'legacy-custom'));
assert.equal(countActiveRandomQuests(tuesday.quests), 1, 'Only the Fate quest uses a random slot');

const december = withDailyQuest(tuesday, at(2026, 12, 1));
assert.ok(byId(december, 'daily-2026-12-01'));
assert.ok(byId(december, 'weekly-2026-11-30'));
assert.ok(byId(december, 'monthly-2026-12'));
assert.equal(byId(december, 'monthly-2026-11'), undefined);
assert.equal(byId(december, 'custom-month'), undefined, 'Old custom monthly goal expires at month rollover');
assert.ok(byId(december, 'legacy-custom'));
assert.ok(byId(december, 'fate-test'));
console.log('PASS daily, Monday, and month-boundary rollover with custom-goal expiry');

const legacy = {
    ...createNewGame(),
    profileComplete: true,
    lastQuestDate: '2026-11-01',
    dailyGoldEarned: 13,
    quests: [{ id: 'daily-2026-11-01', title: 'Legacy daily', category: 'Mental', duration: 20, xp: 100, gold: 60, generated: true, generatedFor: '2026-11-01', questKind: 'random', done: false }],
};
const migrated = withDailyQuest(legacy, at(2026, 11, 1, 16));
assert.equal(migrated.quests.length, 3);
assert.equal(byId(migrated, 'daily-2026-11-01').questKind, 'goal');
assert.equal(byId(migrated, 'daily-2026-11-01').period, 'day');
assert.equal(byId(migrated, 'daily-2026-11-01').periodKey, '2026-11-01');
assert.equal(migrated.dailyGoldEarned, 13);
assert.equal(countActiveRandomQuests(migrated.quests), 0, 'Legacy daily IDs release their old random slot');
console.log('PASS legacy-save migration without progress loss');

const unlimited = Array.from({ length: 30 }, (_, index) => custom(`custom-${index}`, ['day', 'week', 'month'][index % 3], getPeriodKey(['day', 'week', 'month'][index % 3], sunday)));
const unlimitedResult = updatePeriodicQuests({ ...initial, quests: [...initial.quests, ...unlimited] }, sunday);
assert.equal(unlimitedResult.quests.filter((quest) => quest.questKind === 'custom').length, 30);
assert.equal(countActiveRandomQuests(unlimitedResult.quests), 0);
assert.ok(unlimited.every((quest) => byId(unlimitedResult, quest.id)));
console.log('PASS unlimited custom goals in every period');

const penaltyBase = {
    ...createNewGame(),
    profileComplete: true,
    lastQuestDate: '2026-11-02',
    gold: 1000,
    streak: 7,
    quests: [
        { id: 'daily-2026-11-02', generated: true, questKind: 'goal', period: 'day', periodKey: '2026-11-02', done: true },
        { id: 'weekly-2026-11-02', generated: true, questKind: 'goal', period: 'week', periodKey: '2026-11-02', done: false },
        { id: 'monthly-2026-11', generated: true, questKind: 'goal', period: 'month', periodKey: '2026-11', done: false },
    ],
};
const noFalsePenalty = withDailyQuest(penaltyBase, at(2026, 11, 3));
assert.equal(noFalsePenalty.gold, 1000, 'Unfinished weekly/monthly goals do not trigger the daily penalty');
assert.equal(noFalsePenalty.streak, 7);
assert.equal(noFalsePenalty.notifications.length, 0);
const dailyPenalty = withDailyQuest({ ...penaltyBase, quests: penaltyBase.quests.map((quest) => quest.period === 'day' ? { ...quest, done: false } : quest) }, at(2026, 11, 3));
assert.equal(dailyPenalty.gold, 900);
assert.equal(dailyPenalty.streak, 0);
console.log('PASS daily-penalty isolation from weekly/monthly goals');

console.log('All periodic-goal validators passed.');
