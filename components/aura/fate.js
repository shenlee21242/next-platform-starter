export const questBank = [
    // RANK F (Easy)
    { rank: 'F', cat: 'Physical', text: 'Do 10 Squats' },
    { rank: 'F', cat: 'Mental', text: 'Read 3 pages' },
    { rank: 'F', cat: 'Spiritual', text: "Say 'Astaghfirullah' 33 times" },

    // RANK E (Novice)
    { rank: 'E', cat: 'Physical', text: 'Do 15 Squats' },
    { rank: 'E', cat: 'Mental', text: 'Read 5 pages' },
    { rank: 'E', cat: 'Spiritual', text: "Pray 2 Rak'ahs of Duha" },

    // RANK D (Apprentice)
    { rank: 'D', cat: 'Physical', text: 'Do 20 Push-ups' },
    { rank: 'D', cat: 'Mental', text: 'Learn 5 new words' },
    { rank: 'D', cat: 'Spiritual', text: 'Read 1 page of Quran' },

    // RANK C (Adept)
    { rank: 'C', cat: 'Physical', text: 'Do 40 Push-ups' },
    { rank: 'C', cat: 'Mental', text: 'Read 20 pages' },
    { rank: 'C', cat: 'Spiritual', text: 'Give Sadaqah' },

    // RANK B (Expert)
    { rank: 'B', cat: 'Physical', text: 'Run 2km' },
    { rank: 'B', cat: 'Mental', text: 'Write a 300-word essay' },
    { rank: 'B', cat: 'Spiritual', text: 'Fast a voluntary day' },

    // RANK A (Master)
    { rank: 'A', cat: 'Physical', text: 'Do 100 Push-ups' },
    { rank: 'A', cat: 'Mental', text: 'Read 50 pages' },
    { rank: 'A', cat: 'Spiritual', text: 'Pray Tahajjud' },

    // RANK S (Grandmaster)
    { rank: 'S', cat: 'Physical', text: 'Run 5km' },
    { rank: 'S', cat: 'Mental', text: 'Learn a new skill for 3 hours' },
    { rank: 'S', cat: 'Spiritual', text: 'Memorize 5 Ayahs' },

    // RANK SS (Heroic)
    { rank: 'SS', cat: 'Physical', text: 'Run 10km' },
    { rank: 'SS', cat: 'Mental', text: 'Read a full book' },
    { rank: 'SS', cat: 'Spiritual', text: 'Memorize 1 page of Quran' },

    // RANK SSS (Legendary)
    { rank: 'SSS', cat: 'Physical', text: 'Run a Half-Marathon' },
    { rank: 'SSS', cat: 'Mental', text: 'Build a full software project' },
    { rank: 'SSS', cat: 'Spiritual', text: 'Memorize 5 pages of Quran' },
];

export const fateRanks = [
    { rank: 'F', label: 'Initiate', price: 50, xp: 100, gold: 80, diamonds: 0, duration: 10, color: '#a9b0ba' },
    { rank: 'E', label: 'Novice', price: 75, xp: 140, gold: 100, diamonds: 0, duration: 15, color: '#8fc6b4' },
    { rank: 'D', label: 'Apprentice', price: 100, xp: 200, gold: 140, diamonds: 0, duration: 20, color: '#75b9d1' },
    { rank: 'C', label: 'Adept', price: 150, xp: 300, gold: 200, diamonds: 0, duration: 25, color: '#4cd7f6' },
    { rank: 'B', label: 'Expert', price: 250, xp: 350, gold: 250, diamonds: 0, duration: 45, color: '#7f9ee8' },
    { rank: 'A', label: 'Master', price: 600, xp: 700, gold: 500, diamonds: 0, duration: 60, color: '#c4a5ff' },
    { rank: 'S', label: 'Grandmaster', price: 1200, xp: 1100, gold: 800, diamonds: 1, duration: 90, color: '#ffc174' },
    { rank: 'SS', label: 'Heroic', price: 5000, xp: 2200, gold: 1600, diamonds: 2, duration: 120, color: '#ef8d72' },
    { rank: 'SSS', label: 'Legendary', price: 20000, xp: 5000, gold: 4000, diamonds: 3, duration: 180, color: '#f0d6ff' },
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

const categories = ['Physical', 'Mental', 'Spiritual'];

export function getRankProbabilities(playerLevel) {
    const normalizedLevel = Math.max(1, Math.floor(Number(playerLevel) || 1));
    const band = probabilityBands.find((item) => normalizedLevel <= item.maxLevel);
    return fateRanks.map(({ rank }) => ({ rank, chance: band.chances[rank] || 0 }));
}

export function getFateRank(rank) {
    return fateRanks.find((item) => item.rank === rank) || fateRanks[0];
}

export function generateQuest(playerLevel) {
    const probabilities = getRankProbabilities(playerLevel).filter((item) => item.chance > 0);
    const rankRoll = Math.random() * 100;
    let cumulative = 0;
    let selectedRank = probabilities[probabilities.length - 1].rank;
    for (const item of probabilities) {
        cumulative += item.chance;
        if (rankRoll < cumulative) {
            selectedRank = item.rank;
            break;
        }
    }

    const rankQuests = questBank.filter((quest) => quest.rank === selectedRank);
    const selectedCategory = categories[Math.floor(Math.random() * categories.length)];
    const categoryQuests = rankQuests.filter((quest) => quest.cat === selectedCategory);
    const availableQuests = categoryQuests.length ? categoryQuests : rankQuests;
    return availableQuests[Math.floor(Math.random() * availableQuests.length)];
}
