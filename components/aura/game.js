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
    language: 'en',
    sound: true,
    particles: true,
    notifications: true,
    reducedMotion: false,
    penalty: 'Standard',
};

export const DAILY_PENALTY_GOLD = {
    Forgiving: 50,
    Standard: 100,
    Relentless: 200,
};

export function getMissedQuestPenalty(quests = [], severity = 'Standard') {
    const incomplete = quests.filter((quest) => !quest.done).length;
    return {
        incomplete,
        gold: incomplete ? DAILY_PENALTY_GOLD[severity] || DAILY_PENALTY_GOLD.Standard : 0,
    };
}

export function accountStorageKey(email) {
    return `${ACCOUNT_STORAGE_PREFIX}${email.trim().toLowerCase()}`;
}

export function localDayKey(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export function localWeekKey(date = new Date()) {
    const monday = new Date(date);
    monday.setHours(12, 0, 0, 0);
    monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
    return localDayKey(monday);
}

export function localMonthKey(date = new Date()) {
    return localDayKey(date).slice(0, 7);
}

export function getPeriodKey(period = 'day', date = new Date()) {
    if (period === 'week') return localWeekKey(date);
    if (period === 'month') return localMonthKey(date);
    return localDayKey(date);
}

export function getQuestPeriod(quest = {}) {
    return ['day', 'week', 'month'].includes(quest.period) ? quest.period : 'day';
}

export const GOAL_SESSION_PLANS = {
    week: { targetSessions: 3, sessionDuration: 20, sessionDays: [0, 2, 4], xp: 600, gold: 240 },
    month: { targetSessions: 8, sessionDuration: 30, sessionDays: [1, 4], xp: 1600, gold: 640 },
};

const boundedInteger = (value, fallback, minimum, maximum) => {
    const number = Math.round(Number(value));
    return Math.min(maximum, Math.max(minimum, Number.isFinite(number) && number > 0 ? number : fallback));
};

export function isProgressiveQuest(quest = {}) {
    return ['week', 'month'].includes(getQuestPeriod(quest));
}

export function getQuestSessionTarget(quest = {}) {
    if (!isProgressiveQuest(quest)) return 1;
    const period = getQuestPeriod(quest);
    return boundedInteger(quest.targetSessions, GOAL_SESSION_PLANS[period].targetSessions, 2, period === 'week' ? 7 : 31);
}

export function getQuestCompletedSessions(quest = {}) {
    if (!isProgressiveQuest(quest)) return quest.done ? 1 : 0;
    const target = getQuestSessionTarget(quest);
    if (quest.done) return target;
    const completed = Math.floor(Number(quest.completedSessions));
    return Math.min(target, Math.max(0, Number.isFinite(completed) ? completed : 0));
}

export function getQuestProgressPercent(quest = {}) {
    if (!isProgressiveQuest(quest)) return quest.done ? 100 : 0;
    return Math.round((getQuestCompletedSessions(quest) / getQuestSessionTarget(quest)) * 100);
}

export function hasQuestSessionToday(quest = {}, date = new Date()) {
    const today = localDayKey(date);
    return Array.isArray(quest.sessionHistory) && quest.sessionHistory.some((entry) => entry?.day === today);
}

export function getNextSessionReward(quest = {}) {
    const target = getQuestSessionTarget(quest);
    const completed = getQuestCompletedSessions(quest);
    if (!isProgressiveQuest(quest) || quest.done || completed >= target) return { xp: 0, gold: 0 };
    const totalXp = Math.max(0, Number(quest.xp) || 0);
    const totalGold = Math.max(0, Number(quest.gold) || 0);
    return {
        xp: Math.floor((totalXp * (completed + 1)) / target) - Math.floor((totalXp * completed) / target),
        gold: Math.floor((totalGold * (completed + 1)) / target) - Math.floor((totalGold * completed) / target),
    };
}

export function normalizeQuestProgress(quest = {}) {
    if (!isProgressiveQuest(quest)) return quest;
    const period = getQuestPeriod(quest);
    const plan = GOAL_SESSION_PLANS[period];
    const hadPlan = Number(quest.targetSessions) > 0;
    const targetSessions = getQuestSessionTarget(quest);
    const validDays = Array.isArray(quest.sessionDays)
        ? [...new Set(quest.sessionDays.map(Number).filter((day) => Number.isInteger(day) && day >= 0 && day <= 6))].sort((a, b) => a - b)
        : [];
    const sessionDays = validDays.length ? validDays : [...plan.sessionDays];
    const previousDuration = boundedInteger(quest.duration, plan.sessionDuration, 5, 240 * 31);
    const sessionDuration = hadPlan || quest.done
        ? boundedInteger(quest.sessionDuration, Math.max(5, Math.round(previousDuration / targetSessions)), 5, 240)
        : quest.questKind === 'custom'
            ? boundedInteger(quest.duration, plan.sessionDuration, 5, 240)
            : plan.sessionDuration;
    const completed = getQuestCompletedSessions(quest);
    const done = Boolean(quest.done || completed >= targetSessions);
    let xp = quest.xp;
    let gold = quest.gold;
    let duration = hadPlan || quest.done ? previousDuration : sessionDuration * targetSessions;
    if (!hadPlan && !quest.done) {
        if (quest.generated && quest.questKind === 'goal') {
            xp = plan.xp;
            gold = plan.gold;
        } else if (quest.questKind === 'custom') {
            xp = (Number(quest.xp) || 0) * targetSessions;
            gold = (Number(quest.gold) || 0) * targetSessions;
        }
    }
    if (!hadPlan && quest.done) duration = previousDuration;
    return {
        ...quest,
        xp,
        gold,
        duration,
        sessionDuration,
        targetSessions,
        completedSessions: done ? targetSessions : completed,
        sessionDays,
        sessionHistory: Array.isArray(quest.sessionHistory) ? quest.sessionHistory : [],
        done,
    };
}

export function isRandomQuest(quest = {}) {
    const id = String(quest.id ?? '');
    if (quest.questKind === 'goal' || quest.questKind === 'custom' || quest.questKind === 'selected' || id.startsWith('daily-')) return false;
    if (quest.questKind === 'random') return true;
    return quest.generated === true || /^(fate|reroll)-/.test(id);
}

export function countActiveRandomQuests(quests = []) {
    return quests.filter((quest) => !quest.done && isRandomQuest(quest)).length;
}

export function secondsUntilMidnight() {
    return secondsUntilPeriodEnd('day');
}

export function secondsUntilPeriodEnd(period = 'day', date = new Date()) {
    const end = new Date(date);
    end.setHours(0, 0, 0, 0);
    if (period === 'week') {
        const daysSinceMonday = (end.getDay() + 6) % 7;
        end.setDate(end.getDate() + 7 - daysSinceMonday);
    } else if (period === 'month') {
        end.setMonth(end.getMonth() + 1, 1);
    } else {
        end.setDate(end.getDate() + 1);
    }
    return Math.max(0, Math.floor((end.getTime() - date.getTime()) / 1000));
}

export function getPeriodBounds(period = 'day', date = new Date()) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    if (period === 'week') start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
    if (period === 'month') start.setDate(1);
    const end = new Date(start);
    if (period === 'week') end.setDate(end.getDate() + 6);
    if (period === 'month') end.setMonth(end.getMonth() + 1, 0);
    end.setHours(23, 59, 59, 999);
    return { start, end };
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
        skillQuestProgress: {},
        inventory: [],
        customRewards: [],
        purchaseHistory: [],
        upgrades: { questSlots: 0, goldCap: 0, secondChance: 0 },
        effects: {},
        dailyGoldEarned: 0,
        dailyGoldDay: localDayKey(),
        secondChanceMonth: null,
        activeSkin: 'kael',
        duel: null,
        streak: 0,
        bestStreak: 0,
        lastCompletionDate: null,
        lastQuestDate: null,
        focusSessions: 0,
        focusMinutes: 0,
        focusWeek: localWeekKey(),
        notifications: [],
        settings: { ...defaultSettings },
    };
}

const goalText = (en, ar, fr, es) => ({ en, ar, fr, es });
const localizeGoal = (value, language) => typeof value === 'string' ? value : value?.[language] || value?.en || '';
const calendarDayNumber = (key) => {
    const [year, month, day] = key.split('-').map(Number);
    return Math.floor(Date.UTC(year, month - 1, day) / 86400000);
};

const firstQuestByClass = {
    'Shadow Ranger': { title: goalText('Complete a 20-minute focus session', 'أكمل جلسة تركيز لمدة 20 دقيقة', 'Terminez une session de concentration de 20 minutes', 'Completa una sesión de concentración de 20 minutos'), category: 'Mental', duration: 20, xp: 100, gold: 60 },
    'Iron Vanguard': { title: goalText('Complete a 15-minute bodyweight workout', 'أكمل تمرينًا بوزن الجسم لمدة 15 دقيقة', 'Effectuez un entraînement au poids du corps de 15 minutes', 'Completa 15 minutos de ejercicio con peso corporal'), category: 'Physical', duration: 15, xp: 100, gold: 60 },
    'Dawn Keeper': { title: goalText('Take 10 minutes for prayer or reflection', 'خصص 10 دقائق للصلاة أو التأمل', 'Prenez 10 minutes pour la prière ou la réflexion', 'Dedica 10 minutos a la oración o la reflexión'), category: 'Spiritual', duration: 10, xp: 100, gold: 60 },
    'Arcane Weaver': { title: goalText('Read or study without distraction for 20 minutes', 'اقرأ أو ذاكر بلا تشتت لمدة 20 دقيقة', 'Lisez ou étudiez sans distraction pendant 20 minutes', 'Lee o estudia sin distracciones durante 20 minutos'), category: 'Mental', duration: 20, xp: 100, gold: 60 },
};

const rotatingQuests = [
    { title: goalText('Read 10 pages of a book', 'اقرأ 10 صفحات من كتاب', 'Lisez 10 pages d’un livre', 'Lee 10 páginas de un libro'), category: 'Mental', duration: 20, xp: 100, gold: 60 },
    { title: goalText('Take a 20-minute walk', 'امشِ لمدة 20 دقيقة', 'Faites une marche de 20 minutes', 'Da una caminata de 20 minutos'), category: 'Physical', duration: 20, xp: 100, gold: 60 },
    { title: goalText('Write three lines of reflection', 'اكتب ثلاثة أسطر من التأمل', 'Écrivez trois lignes de réflexion', 'Escribe tres líneas de reflexión'), category: 'Spiritual', duration: 10, xp: 100, gold: 60 },
    { title: goalText('Complete one distraction-free work block', 'أكمل كتلة عمل واحدة بلا تشتت', 'Terminez un bloc de travail sans distraction', 'Completa un bloque de trabajo sin distracciones'), category: 'Mental', duration: 25, xp: 120, gold: 70 },
    { title: goalText('Stretch and move for 15 minutes', 'تمدّد وتحرّك لمدة 15 دقيقة', 'Étirez-vous et bougez pendant 15 minutes', 'Estírate y muévete durante 15 minutos'), category: 'Physical', duration: 15, xp: 100, gold: 60 },
];

export function createDailyQuest(player, previousQuestDate = null, date = new Date(), language = 'en') {
    const today = localDayKey(date);
    const dayNumber = calendarDayNumber(today);
    const template = previousQuestDate
        ? rotatingQuests[dayNumber % rotatingQuests.length]
        : firstQuestByClass[player.heroClass] || firstQuestByClass['Shadow Ranger'];
    return {
        ...template,
        title: localizeGoal(template.title, language),
        id: `daily-${today}`,
        done: false,
        questKind: 'goal',
        generated: true,
        generatedFor: today,
        period: 'day',
        periodKey: today,
        diamonds: 0,
    };
}

const weeklyGoalTemplates = [
    { title: goalText('Complete three distraction-free work sessions this week', 'أكمل ثلاث جلسات عمل بلا تشتت هذا الأسبوع', 'Terminez trois sessions de travail sans distraction cette semaine', 'Completa tres sesiones de trabajo sin distracciones esta semana'), category: 'Mental', duration: 60, sessionDuration: 20, targetSessions: 3, sessionDays: [0, 2, 4], xp: 600, gold: 240 },
    { title: goalText('Take three 20-minute walks this week', 'امشِ ثلاث مرات لمدة 20 دقيقة هذا الأسبوع', 'Faites trois marches de 20 minutes cette semaine', 'Da tres caminatas de 20 minutos esta semana'), category: 'Physical', duration: 60, sessionDuration: 20, targetSessions: 3, sessionDays: [0, 2, 4], xp: 600, gold: 240 },
    { title: goalText('Read 50 pages and record one lesson this week', 'اقرأ 50 صفحة وسجّل درسًا واحدًا هذا الأسبوع', 'Lisez 50 pages et notez une leçon cette semaine', 'Lee 50 páginas y anota una lección esta semana'), category: 'SelfDevelopment', duration: 60, sessionDuration: 20, targetSessions: 3, sessionDays: [0, 2, 4], xp: 600, gold: 240 },
];

const monthlyGoalTemplates = [
    { title: goalText('Finish one meaningful personal project this month', 'أنجز مشروعًا شخصيًا ذا معنى هذا الشهر', 'Terminez un projet personnel significatif ce mois-ci', 'Termina un proyecto personal significativo este mes'), category: 'SelfDevelopment', duration: 240, sessionDuration: 30, targetSessions: 8, sessionDays: [1, 4], xp: 1600, gold: 640 },
    { title: goalText('Build a sustainable exercise routine and review it this month', 'ابنِ روتين تمارين مستدامًا وراجعه هذا الشهر', 'Créez une routine d’exercice durable et évaluez-la ce mois-ci', 'Crea una rutina de ejercicio sostenible y revísala este mes'), category: 'Physical', duration: 240, sessionDuration: 30, targetSessions: 8, sessionDays: [1, 4], xp: 1600, gold: 640 },
    { title: goalText('Review your habits and write a monthly improvement plan', 'راجع عاداتك واكتب خطة تحسين شهرية', 'Passez en revue vos habitudes et rédigez un plan d’amélioration mensuel', 'Revisa tus hábitos y escribe un plan mensual de mejora'), category: 'Psychological', duration: 240, sessionDuration: 30, targetSessions: 8, sessionDays: [1, 4], xp: 1600, gold: 640 },
];

export function createWeeklyQuest(date = new Date(), language = 'en') {
    const week = localWeekKey(date);
    const template = weeklyGoalTemplates[Math.floor(calendarDayNumber(week) / 7) % weeklyGoalTemplates.length];
    return {
        ...template,
        title: localizeGoal(template.title, language),
        id: `weekly-${week}`,
        done: false,
        questKind: 'goal',
        generated: true,
        generatedFor: week,
        period: 'week',
        periodKey: week,
        completedSessions: 0,
        sessionHistory: [],
        diamonds: 0,
    };
}

export function createMonthlyQuest(date = new Date(), language = 'en') {
    const month = localMonthKey(date);
    const template = monthlyGoalTemplates[(date.getFullYear() * 12 + date.getMonth()) % monthlyGoalTemplates.length];
    return {
        ...template,
        title: localizeGoal(template.title, language),
        id: `monthly-${month}`,
        done: false,
        questKind: 'goal',
        generated: true,
        generatedFor: month,
        period: 'month',
        periodKey: month,
        completedSessions: 0,
        sessionHistory: [],
        diamonds: 0,
    };
}

export function updatePeriodicQuests({ player, quests = [], lastQuestDate = null, language = 'en' }, date = new Date()) {
    const today = localDayKey(date);
    const isNewDay = lastQuestDate !== today;
    const previousDate = lastQuestDate ? new Date(`${lastQuestDate}T12:00:00`) : null;
    const isNewWeek = Boolean(previousDate && localWeekKey(previousDate) !== localWeekKey(date));
    const isNewMonth = Boolean(previousDate && localMonthKey(previousDate) !== localMonthKey(date));
    const normalized = (quests || []).map((quest) => {
        const id = String(quest.id ?? '');
        if (quest.generated && !quest.period && id.startsWith('daily-')) {
            return normalizeQuestProgress({ ...quest, questKind: 'goal', period: 'day', periodKey: quest.generatedFor || lastQuestDate || today });
        }
        if (['day', 'week', 'month'].includes(quest.period) && !quest.periodKey) {
            return normalizeQuestProgress({ ...quest, periodKey: getPeriodKey(quest.period, date) });
        }
        return normalizeQuestProgress(quest);
    });
    const retained = normalized.filter((quest) => {
        if (['day', 'week', 'month'].includes(quest.period)) return quest.periodKey === getPeriodKey(quest.period, date);
        return !isNewDay || !quest.generated;
    });
    const next = [...retained];
    const createdPeriods = [];
    const ensureGoal = (period, quest) => {
        const key = getPeriodKey(period, date);
        if (!next.some((entry) => entry.generated && entry.period === period && entry.periodKey === key)) {
            next.push(quest);
            createdPeriods.push(period);
        }
    };
    ensureGoal('day', createDailyQuest(player, lastQuestDate, date, language));
    ensureGoal('week', createWeeklyQuest(date, language));
    ensureGoal('month', createMonthlyQuest(date, language));
    return {
        quests: next,
        dailyQuest: next.find((quest) => quest.generated && quest.period === 'day' && quest.periodKey === today) || null,
        isNewDay,
        isNewWeek,
        isNewMonth,
        createdPeriods,
    };
}

export function resolveDailyProtection({ quests = [], severity = 'Standard', inventory = [], upgrades = {}, secondChanceMonth = null }, date = new Date()) {
    const penalty = getMissedQuestPenalty(quests, severity);
    const nextInventory = [...inventory];
    const month = localDayKey(date).slice(0, 7);
    let nextSecondChanceMonth = secondChanceMonth;
    let gold = penalty.gold;
    let streakReset = penalty.incomplete > 0;
    let protection = null;
    const consume = (itemId) => {
        const index = nextInventory.indexOf(itemId);
        if (index >= 0) nextInventory.splice(index, 1);
    };

    if (penalty.incomplete) {
        if (upgrades.secondChance && secondChanceMonth !== month) {
            nextSecondChanceMonth = month;
            gold = 0;
            streakReset = false;
            protection = 'Second Chance';
        } else if (nextInventory.includes('power-penalty-shield')) {
            consume('power-penalty-shield');
            gold = 0;
            streakReset = false;
            protection = 'Penalty Shield';
        } else if (nextInventory.includes('power-streak-freeze')) {
            consume('power-streak-freeze');
            streakReset = false;
            protection = 'Streak Freeze';
        }
    }
    return { ...penalty, gold, streakReset, protection, inventory: nextInventory, secondChanceMonth: nextSecondChanceMonth };
}

export function withDailyQuest(game, date = new Date()) {
    if (!game.profileComplete) return game;
    const today = localDayKey(date);
    const periodic = updatePeriodicQuests({ ...game, language: game.settings?.language || 'en' }, date);
    if (!periodic.isNewDay) return { ...game, quests: periodic.quests };

    const penalty = resolveDailyProtection({
        quests: game.lastQuestDate ? (game.quests || []).filter((quest) => !['week', 'month'].includes(quest.period)) : [],
        severity: game.settings?.penalty,
        inventory: game.inventory,
        upgrades: game.upgrades,
        secondChanceMonth: game.secondChanceMonth,
    }, date);
    const penaltyNotification = penalty.incomplete ? {
        id: `penalty-${today}`,
        type: 'quest',
        title: penalty.protection || 'Daily quest penalty',
        description: penalty.protection
            ? `${penalty.protection} protected your record. ${penalty.gold ? `${penalty.gold} Gold was deducted; your streak is safe.` : 'The Gold and streak penalty was canceled.'}`
            : `${penalty.incomplete} ${penalty.incomplete === 1 ? 'quest was' : 'quests were'} left incomplete. A ${penalty.gold} Gold penalty was applied and your streak was reset.`,
        time: 'Daily reset',
        read: false,
    } : null;

    return {
        ...game,
        quests: periodic.quests,
        lastQuestDate: today,
        gold: Math.max(0, (game.gold ?? 100) - penalty.gold),
        streak: penalty.streakReset ? 0 : game.streak ?? 0,
        bestStreak: Math.max(game.bestStreak ?? 0, game.streak ?? 0),
        inventory: penalty.inventory,
        secondChanceMonth: penalty.secondChanceMonth,
        dailyGoldEarned: 0,
        dailyGoldDay: today,
        focusSessions: periodic.isNewWeek ? 0 : game.focusSessions ?? 0,
        focusMinutes: periodic.isNewWeek ? 0 : game.focusMinutes ?? 0,
        focusWeek: localWeekKey(date),
        notifications: penaltyNotification ? [penaltyNotification, ...(game.notifications || [])] : game.notifications || [],
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
