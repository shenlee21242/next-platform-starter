export const XP_TO_LEVEL = 300;

export function getRank(level) {
    if (level <= 0) return 'Unranked';
    if (level < 5) return 'Bronze I';
    if (level < 10) return 'Silver I';
    if (level < 15) return 'Gold III';
    if (level < 20) return 'Platinum I';
    return 'Diamond I';
}

// The account flow adds a class-based quest after onboarding and rotates
// subsequent daily quests. Players can also create their own quests.
export const initialQuests = [];

export const friends = [
    { id: 1, name: 'Omar Khaled', handle: '@omar', level: 15, xp: 4280, online: true, color: '#6d5b45', initials: 'OK', status: 'On a 21 day streak' },
    { id: 2, name: 'Layla Mansour', handle: '@layla', level: 14, xp: 3910, online: true, color: '#435b62', initials: 'LM', status: 'In Focus Sanctuary' },
    { id: 3, name: 'Yusuf Ali', handle: '@yusuf', level: 12, xp: 2840, online: false, color: '#514d68', initials: 'YA', status: 'Last seen 2h ago' },
    { id: 4, name: 'Maryam Noor', handle: '@maryam', level: 11, xp: 2510, online: true, color: '#625044', initials: 'MN', status: 'Completed 5 quests today' },
    { id: 5, name: 'Zaid Rahman', handle: '@zaid', level: 9, xp: 1940, online: false, color: '#3e5551', initials: 'ZR', status: 'Last seen yesterday' },
];

export const storeItems = [
    { id: 'c1', category: 'Cosmetics', name: 'Gilded Vanguard', description: 'Ancient gold-trimmed armor set', icon: 'armor', price: 1800, currency: 'gold', rarity: 'Epic', tone: 'gold' },
    { id: 'c2', category: 'Cosmetics', name: 'Nomad of the Night', description: 'A cloak woven from shadow', icon: 'cloak', price: 750, currency: 'gold', rarity: 'Rare', tone: 'cyan' },
    { id: 'c3', category: 'Cosmetics', name: 'Celestial Frame', description: 'Animated avatar frame', icon: 'frame', price: 8, currency: 'diamonds', rarity: 'Legendary', tone: 'violet' },
    { id: 'p1', category: 'Consumables', name: 'Energy Potion', description: 'Restore 50 Sanctuary energy', icon: 'potion', price: 250, currency: 'gold', rarity: 'Common', tone: 'cyan' },
    { id: 'p2', category: 'Consumables', name: 'XP Elixir', description: 'Double XP for 24 hours', icon: 'elixir', price: 600, currency: 'gold', rarity: 'Rare', tone: 'violet' },
    { id: 'p3', category: 'Consumables', name: 'Streak Freeze', description: 'Protect your streak for one day', icon: 'freeze', price: 400, currency: 'gold', rarity: 'Rare', tone: 'cyan' },
    { id: 'p4', category: 'Consumables', name: 'Exhaustion Spell', description: 'Challenge a rival with −10% XP', icon: 'spell', price: 350, currency: 'gold', rarity: 'Rare', tone: 'crimson' },
    { id: 't1', category: 'Cards', name: 'Fate Card · F', description: 'A small step toward greatness', icon: 'card', price: 50, currency: 'gold', rarity: 'F Rank', tone: 'gold' },
    { id: 't2', category: 'Cards', name: 'Fate Card · A', description: 'A trial for the disciplined', icon: 'card', price: 650, currency: 'gold', rarity: 'A Rank', tone: 'cyan' },
    { id: 't3', category: 'Cards', name: 'Fate Card · S', description: 'High risk. Legendary rewards.', icon: 'card', price: 1400, currency: 'gold', rarity: 'S Rank', tone: 'violet' },
];

export const skills = [
    { id: 'discipline', name: 'Discipline', type: 'Permanent', description: 'The center of your constellation. All growth begins here.', cost: 0, x: 50, y: 50, icon: 'center' },
    { id: 'iron-body', name: 'Iron Body', type: 'Permanent', description: '+5% XP from every Physical quest.', cost: 2, x: 50, y: 15, icon: 'physical' },
    { id: 'deep-work', name: 'Deep Work', type: 'Permanent', description: '+10% XP from Focus Sanctuary sessions.', cost: 2, x: 79, y: 28, icon: 'mental' },
    { id: 'golden-touch', name: 'Golden Touch', type: 'Active', description: 'Earn +15% Gold for the next 24 hours.', cost: 3, x: 85, y: 61, icon: 'gold' },
    { id: 'second-wind', name: 'Second Wind', type: 'Active', description: 'Restore 25 Energy without a potion.', cost: 3, x: 65, y: 85, icon: 'energy' },
    { id: 'inner-peace', name: 'Inner Peace', type: 'Permanent', description: '+5% XP from every Spiritual quest.', cost: 2, x: 35, y: 85, icon: 'spiritual' },
    { id: 'swift-strike', name: 'Swift Strike', type: 'Active', description: 'Your first quest each day earns double Gold.', cost: 4, x: 15, y: 61, icon: 'swift' },
    { id: 'mind-palace', name: 'Mind Palace', type: 'Permanent', description: '+5% XP from every Mental quest.', cost: 2, x: 21, y: 28, icon: 'mind' },
];

export const tarotRanks = [
    { rank: 'F', label: 'Initiate', price: 50, xp: '80–120', color: '#a9b0ba' },
    { rank: 'B', label: 'Adept', price: 250, xp: '250–400', color: '#4cd7f6' },
    { rank: 'S', label: 'Master', price: 1200, xp: '900–1,200', color: '#ffc174' },
    { rank: 'SSS', label: 'Legendary', price: 20000, xp: '5,000+', color: '#c4a5ff' },
];

export const randomQuests = {
    F: { title: 'The First Step', description: 'Take a focused 15-minute walk without your phone.', xp: 100, gold: 80, category: 'Physical', duration: 15 },
    B: { title: 'The Unbroken Hour', description: 'Complete one hour of distraction-free deep work.', xp: 350, gold: 250, category: 'Mental', duration: 60 },
    S: { title: 'Trial of the Dawn', description: 'Complete a workout and reflection before 8 AM.', xp: 1100, gold: 800, diamonds: 1, category: 'Physical', duration: 60 },
    SSS: { title: 'The Legend’s Path', description: 'Finish every daily quest for seven consecutive days.', xp: 5000, gold: 4000, diamonds: 3, category: 'Mental', duration: 30 },
};
