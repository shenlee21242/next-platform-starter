import { createLifeQuest, lifeCategories, rankDefinitions } from './life-quests.js';

export const fateRanks = rankDefinitions;

// Every ten levels adds one rank while preserving every earlier rank:
// 0–9 F; 10–19 F/E; 20–29 F/E/D … 80+ F through SSS.
// Lower ranks remain useful and appear more often; the newest rank is rarer.
export function getRankProbabilities(playerLevel) {
    const numericLevel = Number(playerLevel);
    const normalizedLevel = Number.isFinite(numericLevel) ? Math.max(0, Math.floor(numericLevel)) : 0;
    const unlockedCount = Math.min(fateRanks.length, Math.floor(normalizedLevel / 10) + 1);
    const totalWeight = (unlockedCount * (unlockedCount + 1)) / 2;
    return fateRanks.map(({ rank }, index) => ({
        rank,
        chance: index < unlockedCount ? ((unlockedCount - index) / totalWeight) * 100 : 0,
    }));
}

export function getFateRank(rank) {
    return fateRanks.find((item) => item.rank === rank) || fateRanks[0];
}

function randomIndex(random, length) {
    const roll = Number(random());
    const normalized = Number.isFinite(roll) ? Math.min(0.999999999999, Math.max(0, roll)) : 0;
    return Math.floor(normalized * length);
}

export function generateQuest(playerLevel, random = Math.random, locale = 'en') {
    const probabilities = getRankProbabilities(playerLevel).filter((item) => item.chance > 0);
    const rankRoll = randomIndex(random, 10000) / 100;
    let cumulative = 0;
    let selectedRank = probabilities[probabilities.length - 1].rank;
    for (const item of probabilities) {
        cumulative += item.chance;
        if (rankRoll < cumulative) {
            selectedRank = item.rank;
            break;
        }
    }

    const category = lifeCategories[randomIndex(random, lifeCategories.length)];
    const baseIndex = randomIndex(random, category.perRank);
    const rankIndex = fateRanks.findIndex((item) => item.rank === selectedRank);
    return createLifeQuest(category.id, baseIndex, rankIndex, locale);
}
