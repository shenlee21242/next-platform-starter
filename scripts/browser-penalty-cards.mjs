import { existsSync } from 'node:fs';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { createNewGame, getPeriodKey, withDailyQuest } from '../components/aura/game.js';
import { normalizePenaltyContract } from '../components/aura/penalty-cards.js';

const baseUrl = process.env.AURA_URL || 'http://127.0.0.1:3000';
const executablePath = process.env.CHROMIUM_PATH || (existsSync('/tmp/chromium') ? '/tmp/chromium' : undefined);
const chromiumLibraries = existsSync('/tmp/al2023/lib') ? '/tmp/al2023/lib' : process.env.LD_LIBRARY_PATH;
const email = 'penalty-test@aura.app';
const sessionKey = 'aura_session_v3';
const accountKey = `aura_account_v3_${email}`;
const now = new Date();
const today = getPeriodKey('day', now);
const contract = normalizePenaltyContract({ enabled: true });
const judgment = (cardId, id = `browser-${cardId}`) => ({ id: `judgment-${id}`, cardId, rarity: 'Common', realWorld: cardId.startsWith('real-'), reason: 'daily-missed', failedQuestIds: [], status: 'awaiting', effectApplied: false, createdAt: now.toISOString(), resolvedAt: null, note: '', proof: null });

function gameWith(judgments = [], overrides = {}) {
    const game = withDailyQuest({ ...createNewGame(), profileComplete: true }, now);
    return {
        ...game,
        level: 6,
        xp: 200,
        gold: 500,
        streak: 4,
        bestStreak: 4,
        lastActivityDay: today,
        judgments,
        settings: { ...game.settings, language: 'en', penaltyContract: contract, reducedMotion: false },
        ...overrides,
    };
}

const browser = await chromium.launch({
    executablePath,
    headless: true,
    env: { ...process.env, ...(chromiumLibraries ? { LD_LIBRARY_PATH: chromiumLibraries } : {}) },
    args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage', '--disable-setuid-sandbox'],
});
const errors = [];

async function openGame(game, { arabic = false, viewport = { width: 1280, height: 900 }, serverTime = now } = {}) {
    const context = await browser.newContext({ viewport, locale: arabic ? 'ar-MA' : 'en-US', timezoneId: 'UTC' });
    const page = await context.newPage();
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
    await page.route('**/api/aura/time', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ time: serverTime.toISOString(), source: 'test' }) }));
    if (arabic) game.settings = { ...game.settings, language: 'ar' };
    await page.addInitScript(({ sessionKey, accountKey, email, game }) => {
        if (!window.localStorage.getItem(accountKey)) {
            window.localStorage.setItem(sessionKey, JSON.stringify({ email, provider: 'local' }));
            window.localStorage.setItem(accountKey, JSON.stringify(game));
        }
    }, { sessionKey, accountKey, email, game });
    await page.goto(baseUrl, { waitUntil: 'networkidle' });
    await page.waitForSelector('.aura-app', { timeout: 30000 });
    return { context, page };
}

async function savedGame(page) {
    await page.waitForTimeout(150);
    return page.evaluate((key) => JSON.parse(window.localStorage.getItem(key)), accountKey);
}

try {
    {
        const { context, page } = await openGame(gameWith([judgment('mist-whisper')], { inventory: ['power-penalty-shield'] }));
        const modal = page.locator('.judgment-modal');
        await modal.waitFor();
        assert.equal(await modal.locator('.modal-close').count(), 0);
        await page.keyboard.press('Escape');
        await page.mouse.click(4, 4);
        assert.equal(await modal.count(), 1, 'Judgment cannot be dismissed by Escape or backdrop');
        await page.getByRole('button', { name: 'Accept judgment', exact: true }).waitFor();
        await page.waitForTimeout(800);
        await page.screenshot({ path: '/tmp/aura-judgment-en.png', fullPage: true });
        await page.getByRole('button', { name: 'Accept judgment', exact: true }).click();
        await page.locator('.nav-item').filter({ hasText: /^Character$/ }).click();
        await page.getByText('AURA Archive', { exact: true }).waitFor();
        const saved = await savedGame(page);
        assert.equal(saved.xp, 190);
        assert.equal(saved.gold, 500);
        assert.equal(saved.judgments[0].status, 'fulfilled');
        assert.deepEqual(saved.inventory, ['power-penalty-shield']);
        assert.equal(await page.locator('.ledger-fulfilled').count(), 1);
        await page.locator('.penalty-ledger').screenshot({ path: '/tmp/aura-ledger-en.png' });
        await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
        await page.waitForSelector('.aura-app', { timeout: 30000 });
        await page.locator('.nav-item').filter({ hasText: /^Character$/ }).click();
        await page.getByText('AURA Archive', { exact: true }).waitFor();
        assert.equal((await savedGame(page)).judgments[0].status, 'fulfilled');
        await context.close();
        console.log('PASS browser accept, immediate XP effect, non-dismissible modal, ledger, and reload persistence');
    }
    {
        const { context, page } = await openGame(gameWith([judgment('soul-dust')], { inventory: ['power-penalty-shield'] }));
        await page.getByRole('button', { name: 'Consume Penalty Shield', exact: true }).click();
        const saved = await savedGame(page);
        assert.equal(saved.gold, 500);
        assert.equal(saved.streak, 4);
        assert.equal(saved.inventory.includes('power-penalty-shield'), false);
        assert.equal(saved.judgments[0].status, 'shielded');
        await page.locator('.nav-item').filter({ hasText: /^Character$/ }).click();
        await page.locator('.ledger-shielded').waitFor();
        await context.close();
        console.log('PASS browser owned-shield cancellation without XP/Gold/streak loss');
    }
    const effectCases = [
        { cardId: 'temporary-burden', verify: (saved) => assert.equal(saved.quests.filter((quest) => quest.penaltyQuest).length, 1) },
        { cardId: 'heavy-shackles', overrides: { upgrades: { questSlots: 2, goldCap: 0, secondChance: 0 } }, verify: (saved) => { assert.equal(saved.upgrades.questSlots, 2); assert.ok(saved.effects.randomSlotLockUntil > Date.now()); } },
        { cardId: 'streak-fever', overrides: { inventory: ['power-streak-freeze'] }, verify: (saved) => { assert.equal(saved.streak, 4); assert.equal(saved.inventory.includes('power-streak-freeze'), false); assert.equal(saved.judgments[0].protection, 'Streak Freeze'); } },
        { cardId: 'aura-judgment', verify: (saved) => { assert.equal(saved.xp, 100); assert.equal(saved.gold, 470); assert.equal(saved.streak, 0); } },
        { cardId: 'regression', verify: (saved) => assert.equal(saved.xp, 100) },
        { cardId: 'curse-of-decay', verify: (saved) => { assert.equal(saved.level, 5); assert.equal(saved.xp, 0); } },
        { cardId: 'reapers-mark', judgmentOverrides: { dailyXpEarned: 500, dailyXpDay: today }, overrides: { dailyXpEarned: 500, dailyXpDay: today }, verify: (saved) => { assert.equal(saved.level, 5); assert.equal(saved.xp, 0); assert.equal(saved.dailyXpEarned, 0); assert.equal(saved.quests.filter((quest) => quest.penaltyQuest).length, 2); } },
    ];
    for (const testCase of effectCases) {
        const cardJudgment = { ...judgment(testCase.cardId), ...(testCase.judgmentOverrides || {}) };
        const { context, page } = await openGame(gameWith([cardJudgment], testCase.overrides || {}));
        await page.getByRole('button', { name: 'Accept judgment', exact: true }).click();
        const saved = await savedGame(page);
        assert.equal(saved.judgments[0].status, 'fulfilled');
        testCase.verify(saved);
        await context.close();
        console.log(`PASS browser effect: ${testCase.cardId}`);
    }
    {
        const { context, page } = await openGame(gameWith([judgment('fading-memory')]));
        await page.getByRole('button', { name: 'Accept judgment', exact: true }).click();
        await page.locator('.quest-row').first().locator('.quest-check').click();
        const saved = await savedGame(page);
        assert.equal(saved.xp, 200);
        assert.equal(saved.quests.find((quest) => quest.period === 'day').awardedXp, 0);
        assert.equal(saved.effects.noXpNextCompletion, false);
        await context.close();
        console.log('PASS browser effect: fading-memory consumes the next quest XP and then clears');
    }
    {
        const { context, page } = await openGame(gameWith([judgment('real-chaos-theory')]));
        await page.getByRole('button', { name: 'Accept judgment', exact: true }).click();
        let saved = await savedGame(page);
        assert.equal(saved.judgments[0].status, 'pending');
        assert.equal(saved.xp, 200);
        assert.equal(saved.gold, 500);
        await page.locator('.nav-item').filter({ hasText: /^Character$/ }).click();
        await page.locator('.ledger-pending').getByRole('button', { name: 'Confirm fulfillment' }).click();
        const fulfillment = page.locator('.fulfillment-modal');
        await fulfillment.locator('textarea').fill('Desk cleared and ready for tomorrow.');
        await fulfillment.getByRole('button', { name: 'Confirm fulfillment' }).click();
        saved = await savedGame(page);
        assert.equal(saved.judgments[0].status, 'fulfilled');
        assert.equal(saved.judgments[0].note, 'Desk cleared and ready for tomorrow.');
        await context.close();
        console.log('PASS browser real-world pending state and honor-based fulfillment');
    }
    {
        const { context, page } = await openGame(gameWith([], { settings: { ...gameWith().settings, penaltyContract: normalizePenaltyContract() } }));
        await page.locator('.nav-item').filter({ hasText: /^Settings$/ }).click();
        await page.getByRole('button', { name: 'Configure contract', exact: true }).click();
        const modal = page.locator('.contract-modal');
        await modal.getByRole('switch', { name: 'Enable judgment contract' }).click();
        await modal.getByRole('tab', { name: 'Real-world cards' }).click();
        await modal.getByRole('switch', { name: 'Chaos Theory', exact: true }).click();
        await page.screenshot({ path: '/tmp/aura-contract-en.png', fullPage: true });
        await modal.getByRole('button', { name: 'Save changes' }).click();
        const saved = await savedGame(page);
        assert.equal(saved.settings.penaltyContract.enabled, true);
        assert.ok(saved.settings.penaltyContract.realWorldCardIds.includes('real-chaos-theory'));
        await context.close();
        console.log('PASS browser contract opt-in, real-world card selection, and persistence');
    }
    {
        const prior = withDailyQuest({ ...createNewGame(), profileComplete: true }, new Date(Date.UTC(2026, 10, 1, 12)));
        const liveGame = {
            ...prior,
            level: 6,
            gold: 500,
            streak: 4,
            lastActivityDay: '2026-11-01',
            judgments: [],
            inventory: ['power-penalty-shield'],
            settings: { ...prior.settings, penaltyContract: contract },
        };
        const { context, page } = await openGame(liveGame, { serverTime: new Date(Date.UTC(2026, 10, 2, 2, 59, 58)) });
        await page.locator('.judgment-modal').waitFor({ timeout: 15000 });
        const saved = await savedGame(page);
        assert.equal(saved.lastQuestDate, '2026-11-02');
        assert.equal(saved.judgments.length, 1);
        assert.equal(saved.judgments[0].status, 'awaiting');
        assert.equal(saved.gold, 500);
        assert.equal(saved.streak, 4);
        assert.deepEqual(saved.inventory, ['power-penalty-shield']);
        await page.waitForTimeout(1200);
        assert.equal((await savedGame(page)).judgments.length, 1, 'Live rollover remains deduplicated');
        await context.close();
        console.log('PASS live 02:59 → 03:00 rollover creates one pending judgment without premature effects');
    }
    {
        const { context, page } = await openGame(gameWith([judgment('mist-whisper', 'arabic')]), { arabic: true, viewport: { width: 390, height: 844 } });
        await page.getByRole('heading', { name: 'الحكم', exact: true }).waitFor();
        await page.getByRole('button', { name: 'أقبل الحكم', exact: true }).waitFor();
        await page.waitForTimeout(800);
        assert.equal(await page.evaluate(() => document.documentElement.dir), 'rtl');
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true, 'No mobile horizontal overflow');
        await page.screenshot({ path: '/tmp/aura-judgment-ar-mobile.png', fullPage: true });
        await context.close();
        console.log('PASS Arabic RTL mobile judgment without horizontal overflow');
    }
    assert.deepEqual(errors, [], 'No browser application errors');
    console.log('All AURA penalty-card browser scenarios passed with zero application errors.');
} finally {
    await browser.close();
}
