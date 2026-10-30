import physicalQuests from './quests/physical.json' with { type: 'json' };
import mentalQuests from './quests/mental.json' with { type: 'json' };
import spiritualQuests from './quests/spiritual.json' with { type: 'json' };

// 100 base actions × nine ranks in each category. The generated source JSON
// remains readable and can be independently validated or reused by clients.
export const questBank = [...physicalQuests, ...mentalQuests, ...spiritualQuests];

export const fateRanks = [
    { rank: 'F', label: 'Initiate', price: 50, xp: 20, gold: 10, diamonds: 0, duration: 10, color: '#a9b0ba' },
    { rank: 'E', label: 'Novice', price: 75, xp: 50, gold: 25, diamonds: 0, duration: 15, color: '#8fc6b4' },
    { rank: 'D', label: 'Apprentice', price: 100, xp: 100, gold: 50, diamonds: 0, duration: 20, color: '#75b9d1' },
    { rank: 'C', label: 'Adept', price: 150, xp: 250, gold: 100, diamonds: 0, duration: 25, color: '#4cd7f6' },
    { rank: 'B', label: 'Expert', price: 250, xp: 500, gold: 250, diamonds: 0, duration: 45, color: '#7f9ee8' },
    { rank: 'A', label: 'Master', price: 600, xp: 1000, gold: 500, diamonds: 0, duration: 60, color: '#c4a5ff' },
    { rank: 'S', label: 'Grandmaster', price: 1200, xp: 2500, gold: 1000, diamonds: 1, duration: 90, color: '#ffc174' },
    { rank: 'SS', label: 'Heroic', price: 5000, xp: 5000, gold: 2500, diamonds: 2, duration: 120, color: '#ef8d72' },
    { rank: 'SSS', label: 'Legendary', price: 20000, xp: 10000, gold: 5000, diamonds: 3, duration: 180, color: '#f0d6ff' },
];

const probabilityBands = [
    { maxLevel: 5, chances: { F: 100 } },
    { maxLevel: 10, chances: { F: 80, E: 20 } },
    { maxLevel: 20, chances: { E: 50, D: 40, C: 10 } },
    { maxLevel: 30, chances: { D: 50, C: 40, B: 10 } },
    { maxLevel: 40, chances: { C: 50, B: 40, A: 10 } },
    { maxLevel: 50, chances: { B: 50, A: 40, S: 10 } },
    { maxLevel: 60, chances: { A: 50, S: 40, SS: 10 } },
    { maxLevel: 70, chances: { S: 50, SS: 40, SSS: 10 } },
    { maxLevel: Infinity, chances: { SS: 60, SSS: 40 } },
];

const questsByRankAndCategory = new Map();
for (const quest of questBank) {
    const key = `${quest.rank}:${quest.category}`;
    if (!questsByRankAndCategory.has(key)) questsByRankAndCategory.set(key, []);
    questsByRankAndCategory.get(key).push(quest);
}

export function getRankProbabilities(playerLevel) {
    const normalizedLevel = Math.max(1, Math.floor(Number(playerLevel) || 1));
    const band = probabilityBands.find((item) => normalizedLevel <= item.maxLevel);
    return fateRanks.map(({ rank }) => ({ rank, chance: band.chances[rank] || 0 }));
}

export function getFateRank(rank) {
    return fateRanks.find((item) => item.rank === rank) || fateRanks[0];
}

export function generateQuest(playerLevel, random = Math.random) {
    const probabilities = getRankProbabilities(playerLevel).filter((item) => item.chance > 0);
    const rankRoll = random() * 100;
    let cumulative = 0;
    let selectedRank = probabilities[probabilities.length - 1].rank;
    for (const item of probabilities) {
        cumulative += item.chance;
        if (rankRoll < cumulative) {
            selectedRank = item.rank;
            break;
        }
    }

    const selectedCategory = ['Physical', 'Mental', 'Spiritual'][Math.floor(random() * 3)];
    const availableQuests = questsByRankAndCategory.get(`${selectedRank}:${selectedCategory}`);
    return availableQuests[Math.floor(random() * availableQuests.length)];
}
