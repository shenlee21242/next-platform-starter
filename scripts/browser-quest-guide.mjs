import { existsSync } from 'node:fs';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { createNewGame, getPeriodKey, withDailyQuest } from '../components/aura/game.js';
import { createLifeQuest } from '../components/aura/life-quests.js';

const baseUrl = process.env.AURA_URL || 'http://127.0.0.1:3000';
const executablePath = process.env.CHROMIUM_PATH || (existsSync('/tmp/chromium') ? '/tmp/chromium' : undefined);
const chromiumLibraries = existsSync('/tmp/al2023/lib') ? '/tmp/al2023/lib' : process.env.LD_LIBRARY_PATH;
const email = 'quest-guide-test@aura.app';
const sessionKey = 'aura_session_v3';
const accountKey = `aura_account_v3_${email}`;
const now = new Date();
const expected = createLifeQuest('Physical', 22, 0, 'ar');
const game = withDailyQuest({
    ...createNewGame(),
    profileComplete: true,
    gold: 100,
    lastActivityDay: getPeriodKey('day', now),
    settings: { ...createNewGame().settings, language: 'ar', reducedMotion: true },
}, now);

const browser = await chromium.launch({
    executablePath,
    headless: true,
    env: { ...process.env, ...(chromiumLibraries ? { LD_LIBRARY_PATH: chromiumLibraries } : {}) },
    args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage', '--disable-setuid-sandbox'],
});
const errors = [];

try {
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, locale: 'ar-MA', timezoneId: 'UTC' });
    const page = await context.newPage();
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
    await page.route('**/api/aura/time', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ time: now.toISOString(), source: 'test' }) }));
    await page.addInitScript(({ sessionKey, accountKey, email, game }) => {
        window.localStorage.setItem(sessionKey, JSON.stringify({ email, provider: 'local' }));
        window.localStorage.setItem(accountKey, JSON.stringify(game));
    }, { sessionKey, accountKey, email, game });
    await page.goto(baseUrl, { waitUntil: 'networkidle' });
    await page.waitForSelector('.aura-app');
    await page.locator('.tarot-widget').click();
    await page.locator('.fate-draw-action').waitFor();

    // Rank roll, Physical category, then baseIndex 22: push-ups + movement-quality context.
    await page.evaluate(() => {
        const rolls = [0, 0.34, 22.5 / 400];
        let index = 0;
        window.__questGuideRandom = Math.random;
        Math.random = () => rolls[index++] ?? 0;
    });
    await page.locator('.fate-draw-action').click();
    await page.evaluate(() => {
        Math.random = window.__questGuideRandom;
        delete window.__questGuideRandom;
    });
    await page.locator('.tarot-modal.stage-revealed').waitFor();

    const revealed = page.locator('.fate-quest-revealed');
    assert.equal(await revealed.locator('.fate-quest-name').innerText(), expected.baseAction);
    assert.equal(await revealed.locator('.themed-window-copy p').innerText(), expected.objective);
    assert.equal(await revealed.locator('.quest-guide-quote p').innerText(), expected.quote);
    assert.equal(await revealed.locator('.quest-guide-how p').innerText(), expected.howTo);
    assert.equal(await revealed.locator('.fate-quest-description').count(), 0);
    assert.ok(!(await revealed.innerText()).includes(expected.description), 'The old description must not be repeated below the card');
    assert.ok(expected.quote.includes('الألم الجسدي يساعد على تقوية إرادتك'));
    assert.ok(expected.howTo.includes('شدّ البطن') && expected.howTo.includes('هبوط الحوض'));

    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(400);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth), false, 'Quest guide must not overflow on mobile');
    await page.screenshot({ path: '/tmp/aura-quest-guide-ar-mobile.png', fullPage: true });
    await page.locator('.quest-guide').screenshot({ path: '/tmp/aura-quest-guide-panel-ar.png' });
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.getByRole('button', { name: 'اقبل هذه المهمة', exact: true }).click();
    await page.waitForTimeout(200);
    const saved = await page.evaluate((key) => JSON.parse(window.localStorage.getItem(key)), accountKey);
    const accepted = saved.quests.find((quest) => quest.sourceId === expected.id);
    assert.ok(accepted, 'Accepted Fate quest was not persisted');
    assert.equal(accepted.quote, expected.quote);
    assert.equal(accepted.howTo, expected.howTo);
    assert.equal(accepted.objective, expected.objective);
    assert.equal(saved.gold, 98, 'Only the two-Gold F-rank draw fee should be charged');

    await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.aura-app');
    await page.locator('.nav-item').filter({ hasText: 'موسوعة المهام' }).click();
    await page.locator('.codex-search input').fill(expected.id);
    const codexCard = page.locator(`.codex-card[aria-label^="${expected.id}:"]`);
    await codexCard.waitFor();
    await codexCard.click();
    const codex = page.locator('.codex-detail-modal');
    await codex.waitFor();
    assert.equal(await codex.locator('.quest-guide-quote p').innerText(), expected.quote);
    assert.equal(await codex.locator('.quest-guide-how p').innerText(), expected.howTo);
    assert.ok(!(await codex.innerText()).includes(expected.description), 'Codex must use the same nonduplicated guide');
    await context.close();
    assert.deepEqual(errors, [], 'Browser console/application errors detected');
    console.log('PASS deterministic Arabic Fate draw: quest name, compact objective, exact push-up wisdom and practical guide without repeated description');
    console.log('PASS mobile RTL layout, two-Gold draw accounting, accepted-quest persistence, reload, and matching Codex guidance');
} finally {
    await browser.close();
}
