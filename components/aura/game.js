export const SESSION_STORAGE_KEY = 'aura_session_v3';
export const ACCOUNT_STORAGE_PREFIX = 'aura_account_v3_';

export const defaultPlayer = {
    name: 'Arin',
    age: 24,
    height: 178,
    weight: 74,
    characterId: 'kael',
    heroClass: 'Shadow Ranger',
};

export const defaultSettings = {
    sound: true,
    particles: true,
    notifications: true,
    reducedMotion: false,
    penalty: 'Standard',
};

export function accountStorageKey(email) {
    return `${ACCOUNT_STORAGE_PREFIX}${email.trim().toLowerCase()}`;
}

export function localDayKey(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export function secondsUntilMidnight() {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    return Math.max(0, Math.floor((midnight.getTime() - now.getTime()) / 1000));
}

export function createNewGame(auth = {}) {
    const suggestedName = auth.name || defaultPlayer.name;
    return {
        profileComplete: false,
        player: { ...defaultPlayer, name: suggestedName },
        quests: [],
        level: 0,
        xp: 0,
        gold: 100,
        diamonds: 0,
        energy: 100,
        bossProgress: 100,
        skillPoints: 0,
        unlockedSkills: ['discipline'],
        inventory: [],
        activeSkin: 'kael',
        duel: null,
        streak: 0,
        lastCompletionDate: null,
        lastQuestDate: null,
        focusSessions: 0,
        focusMinutes: 0,
        notifications: [],
        settings: { ...defaultSettings },
    };
}

const firstQuestByClass = {
    'Shadow Ranger': { title: 'Complete a 20-minute focus session', category: 'Mental', duration: 20, xp: 100, gold: 60 },
    'Iron Vanguard': { title: 'Complete a 15-minute bodyweight workout', category: 'Physical', duration: 15, xp: 100, gold: 60 },
    'Dawn Keeper': { title: 'Take 10 minutes for prayer or reflection', category: 'Spiritual', duration: 10, xp: 100, gold: 60 },
    'Arcane Weaver': { title: 'Read or study without distraction for 20 minutes', category: 'Mental', duration: 20, xp: 100, gold: 60 },
};

const rotatingQuests = [
    { title: 'Read 10 pages of a book', category: 'Mental', duration: 20, xp: 100, gold: 60 },
    { title: 'Take a 20-minute walk', category: 'Physical', duration: 20, xp: 100, gold: 60 },
    { title: 'Write three lines of reflection', category: 'Spiritual', duration: 10, xp: 100, gold: 60 },
    { title: 'Complete one distraction-free work block', category: 'Mental', duration: 25, xp: 120, gold: 70 },
    { title: 'Stretch and move for 15 minutes', category: 'Physical', duration: 15, xp: 100, gold: 60 },
];

export function createDailyQuest(player, previousQuestDate = null) {
    const today = localDayKey();
    const dayNumber = Math.floor(Date.now() / 86400000);
    const template = previousQuestDate
        ? rotatingQuests[dayNumber % rotatingQuests.length]
        : firstQuestByClass[player.heroClass] || firstQuestByClass['Shadow Ranger'];
    return {
        ...template,
        id: `daily-${today}`,
        done: false,
        generated: true,
        generatedFor: today,
    };
}

export function withDailyQuest(game) {
    if (!game.profileComplete) return game;
    const today = localDayKey();
    if (game.lastQuestDate === today && game.quests?.some((quest) => quest.generatedFor === today)) return game;
    const dailyQuest = createDailyQuest(game.player, game.lastQuestDate);
    return {
        ...game,
        quests: [...(game.quests || []).filter((quest) => !quest.generated), dailyQuest],
        lastQuestDate: today,
    };
}

export function readStoredGame(email) {
    try {
        const raw = window.localStorage.getItem(accountStorageKey(email));
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

export function writeStoredGame(email, game) {
    try {
        window.localStorage.setItem(accountStorageKey(email), JSON.stringify(game));
    } catch {
        // The game remains playable for this session if device storage is full.
    }
}

export function readSession() {
    try {
        const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

export function writeSession(session) {
    try {
        if (session) window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
        else window.localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch {
        // Authentication still works for this session without persistent storage.
    }
}
