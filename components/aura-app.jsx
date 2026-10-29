'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import {
    ArrowRight,
    Bell,
    Check,
    ChevronRight,
    CircleAlert,
    Clock3,
    Coins,
    Diamond,
    Dumbbell,
    Flame,
    Focus,
    Gem,
    LayoutDashboard,
    LockKeyhole,
    Menu,
    Network,
    Plus,
    Settings,
    Shield,
    Sparkles,
    Swords,
    Trophy,
    UserRound,
    Users,
    X,
    Zap,
} from 'lucide-react';
import Dashboard from './aura/dashboard';
import {
    CharacterScreen,
    FocusScreen,
    LeaderboardScreen,
    NotificationsScreen,
    PvpScreen,
    SettingsScreen,
    SkillTreeScreen,
    SocialScreen,
    StoreScreen,
} from './aura/screens';
import { friends, initialQuests, randomQuests, tarotRanks, XP_TO_LEVEL } from './aura/data';
import { Avatar, CategoryIcon, Currency, formatClock, formatNumber, Modal, ProgressBar } from './aura/ui';

const navigation = [
    {
        label: 'YOUR JOURNEY',
        items: [
            { id: 'quests', label: 'Quest dashboard', icon: LayoutDashboard },
            { id: 'skills', label: 'Skill tree', icon: Network },
            { id: 'character', label: 'Character', icon: UserRound },
            { id: 'store', label: 'Imperial Vault', icon: Gem },
            { id: 'focus', label: 'Focus Sanctuary', icon: Focus },
        ],
    },
    {
        label: 'YOUR CIRCLE',
        items: [
            { id: 'social', label: 'Social hub', icon: Users },
            { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
            { id: 'duel', label: 'Duel arena', icon: Swords },
        ],
    },
];

const screenLabels = Object.fromEntries(navigation.flatMap((group) => group.items.map((item) => [item.id, item.label])));
screenLabels.notifications = 'Notifications';
screenLabels.settings = 'Settings';

const initialNotifications = [
    { id: 1, type: 'gift', title: 'A gift from Layla', description: 'Layla sent you an Energy Potion. Your circle has your back.', time: '12 minutes ago', read: false },
    { id: 2, type: 'duel', title: 'Omar is ready to duel', description: 'Omar accepted your friendly challenge. First to 3 quests wins.', time: '1 hour ago', read: false },
    { id: 3, type: 'quest', title: 'The Colossus grows weaker', description: 'Your weekly boss is at 68% integrity. Keep up the pressure.', time: '3 hours ago', read: false },
    { id: 4, type: 'system', title: 'Gold III achieved', description: 'Your consistency has raised you to Gold III. The next rank awaits.', time: 'Yesterday', read: true },
];

const defaultPlayer = { name: 'Arin', age: 24, height: 178, weight: 74, heroClass: 'Shadow Ranger' };
const PROFILE_STORAGE_KEY = 'aura_player_profile';

function AuraMark({ size = 34 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
            <path d="M20 3 35 12v16L20 37 5 28V12L20 3Z" stroke="currentColor" strokeWidth="1.3" />
            <path d="m20 8 10 20H10L20 8Z" stroke="currentColor" strokeWidth="1.3" />
            <path d="m14 23 6-11 6 11-6 5-6-5Z" fill="currentColor" fillOpacity=".16" stroke="currentColor" strokeWidth="1.1" />
            <circle cx="20" cy="20" r="2" fill="currentColor" />
        </svg>
    );
}

function AddQuestModal({ onClose, onSubmit }) {
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('Physical');
    const [duration, setDuration] = useState(30);
    const [difficulty, setDifficulty] = useState('Standard');
    const rewards = { Easy: [60, 40], Standard: [120, 80], Hard: [220, 150] };
    const submit = (event) => {
        event.preventDefault();
        if (!title.trim()) return;
        const [xp, gold] = rewards[difficulty];
        onSubmit({ title: title.trim(), category, duration: Number(duration), difficulty, xp, gold });
    };
    return (
        <Modal onClose={onClose} label="Create a new quest" className="quest-form-modal">
            <div className="modal-heading"><span className="modal-heading-icon"><Plus size={22} /></span><div className="eyebrow">A NEW STEP FORWARD</div><h2>Create a daily quest</h2><p>Make it clear, achievable, and worth showing up for.</p></div>
            <form onSubmit={submit} className="aura-form">
                <label><span>Quest name</span><input autoFocus value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Train for 30 minutes" required maxLength={60} /></label>
                <fieldset><legend>Choose a path</legend><div className="category-picker">{['Physical', 'Mental', 'Spiritual'].map((item) => <button type="button" key={item} className={category === item ? 'active' : ''} onClick={() => setCategory(item)}><CategoryIcon category={item} size={19} /><span>{item}</span></button>)}</div></fieldset>
                <div className="form-row">
                    <label><span>Duration</span><div className="input-with-suffix"><input type="number" min="5" max="240" step="5" value={duration} onChange={(event) => setDuration(event.target.value)} /><small>minutes</small></div></label>
                    <label><span>Difficulty</span><select value={difficulty} onChange={(event) => setDifficulty(event.target.value)}><option>Easy</option><option>Standard</option><option>Hard</option></select></label>
                </div>
                <div className="quest-reward-preview"><span>COMPLETION REWARDS</span><div><strong>+{rewards[difficulty][0]} XP</strong><strong><Coins size={14} /> +{rewards[difficulty][1]} Gold</strong></div></div>
                <button className="button button-primary button-full" type="submit"><Plus size={16} /> Add to today’s quests</button>
            </form>
        </Modal>
    );
}

function QuestDetailModal({ quest, onClose, onToggle }) {
    if (!quest) return null;
    return (
        <Modal onClose={onClose} label={quest.title} className="quest-detail-modal">
            <div className={`quest-detail-symbol category-${quest.category.toLowerCase()}`}><CategoryIcon category={quest.category} size={30} /></div>
            <div className="eyebrow">{quest.category} PATH · DAILY QUEST</div>
            <h2>{quest.title}</h2>
            <p>Show up for yourself. Complete this quest before the daily reset to earn your rewards and protect your streak.</p>
            <div className="quest-detail-grid"><div><Clock3 size={17} /><span>Estimated time</span><strong>{quest.duration} minutes</strong></div><div><Sparkles size={17} /><span>Experience</span><strong>+{quest.xp} XP</strong></div><div><Coins size={17} /><span>Gold reward</span><strong>+{quest.gold} Gold</strong></div></div>
            <button className={`button button-full ${quest.done ? 'button-secondary' : 'button-primary'}`} onClick={() => { onToggle(quest.id); onClose(); }}>{quest.done ? <><X size={16} /> Mark as incomplete</> : <><Check size={16} /> Mark quest complete</>}</button>
        </Modal>
    );
}

function BossModal({ progress, onClose, onTrial }) {
    return (
        <Modal onClose={onClose} label="Weekly boss quest" className="boss-modal">
            <div className="boss-modal-art"><Image src="/images/void-colossus.png" alt="The Void Colossus" fill sizes="620px" /><div /></div>
            <div className="boss-modal-content"><div className="eyebrow">WEEKLY BOSS · S RANK</div><h2>The Void Colossus</h2><p>An ancient will stands between you and the next realm. Complete real-world trials to break its integrity before the week ends.</p>
                <div className="boss-modal-progress"><div><span>COLOSSUS INTEGRITY</span><strong>{progress}%</strong></div><ProgressBar value={progress} tone="crimson" /></div>
                <div className="boss-objectives"><h3>This week’s trial</h3><div className={progress < 100 ? 'done' : ''}><span>{progress < 100 ? <Check size={13} /> : 1}</span>Enter the arena</div><div className={progress <= 68 ? 'done' : ''}><span>{progress <= 68 ? <Check size={13} /> : 2}</span>Complete 10 daily quests</div><div className={progress <= 35 ? 'done' : ''}><span>{progress <= 35 ? <Check size={13} /> : 3}</span>Finish 3 Focus sessions</div><div className={progress === 0 ? 'done' : ''}><span>{progress === 0 ? <Check size={13} /> : 4}</span>Deliver the final blow</div></div>
                <div className="boss-reward-line"><span>VICTORY REWARDS</span><strong>+1,200 XP</strong><strong><Coins size={14} /> 800</strong><strong><Diamond size={14} /> 1</strong></div>
                <button className="button button-primary button-full" disabled={progress === 0} onClick={onTrial}><Swords size={16} /> {progress === 0 ? 'Colossus defeated' : 'Log a boss trial · −8% integrity'}</button>
            </div>
        </Modal>
    );
}

function TarotModal({ gold, onClose, onSpend, onAccept }) {
    const [rank, setRank] = useState('F');
    const [stage, setStage] = useState('choose');
    const timer = useRef(null);
    const selected = tarotRanks.find((item) => item.rank === rank);
    const quest = randomQuests[rank];
    useEffect(() => () => clearTimeout(timer.current), []);
    const draw = () => {
        if (!onSpend(selected.price)) return;
        setStage('drawing');
        timer.current = setTimeout(() => setStage('revealed'), 1100);
    };
    return (
        <Modal onClose={onClose} label="Tarot mystery quest" className={`tarot-modal stage-${stage}`}>
            {stage === 'choose' && <>
                <div className="modal-heading tarot-heading"><span className="modal-heading-icon"><Sparkles size={22} /></span><div className="eyebrow">THE DECK OF FATE</div><h2>Choose your trial</h2><p>The quest remains a mystery until the card is revealed.</p></div>
                <div className="tarot-rank-grid">{tarotRanks.map((item) => <button key={item.rank} className={rank === item.rank ? 'active' : ''} style={{ '--rank-color': item.color }} onClick={() => setRank(item.rank)}><span>{item.rank}</span><strong>{item.label}</strong><small><Coins size={12} /> {formatNumber(item.price)}</small></button>)}</div>
                <div className="tarot-reward-preview"><span>POSSIBLE REWARDS</span><strong>{selected.xp} XP</strong><i />{(rank === 'S' || rank === 'SSS') && <strong><Diamond size={14} /> Rare Diamonds</strong>}<strong><Coins size={14} /> Bonus Gold</strong></div>
                <button className="button button-primary button-full" onClick={draw} disabled={gold < selected.price}><Sparkles size={16} /> {gold < selected.price ? `You need ${formatNumber(selected.price - gold)} more Gold` : `Draw ${rank}-rank card · ${formatNumber(selected.price)} Gold`}</button>
                <p className="tarot-odds">Every card contains a real-world quest. Choose your commitment wisely.</p>
            </>}
            {stage === 'drawing' && <div className="tarot-drawing"><div className="tarot-card-back"><AuraMark size={52} /><span>AURA</span><i /></div><h2>The deck is listening…</h2><p>Your next trial is revealing itself.</p></div>}
            {stage === 'revealed' && <div className="tarot-revealed"><div className="revealed-card" style={{ '--rank-color': selected.color }}><span className="revealed-rank">{rank}</span><AuraMark size={44} /><span>THE DECK OF FATE</span><i /></div><div className="eyebrow">YOUR {rank}-RANK QUEST</div><h2>{quest.title}</h2><p>{quest.description}</p><div className="revealed-rewards"><strong>+{formatNumber(quest.xp)} XP</strong><strong><Coins size={15} /> +{formatNumber(quest.gold)}</strong>{(rank === 'S' || rank === 'SSS') && <strong><Diamond size={14} /> +1</strong>}</div><button className="button button-primary button-full" onClick={() => onAccept({ ...quest, rank })}><Check size={16} /> Accept this quest</button></div>}
        </Modal>
    );
}

function DuelModal({ friend, gold, onClose, onStart, player }) {
    const [stake, setStake] = useState(250);
    if (!friend) return null;
    return (
        <Modal onClose={onClose} label="Create a duel" className="duel-modal">
            <div className="eyebrow">A FRIENDLY TRIAL</div><h2>Challenge {friend.name}</h2><p>First to complete 3 daily quests wins the pot.</p>
            <div className="duel-modal-versus"><Avatar name={player.name} image size="large" /><span>VS</span><Avatar {...friend} size="large" /></div>
            <label className="stake-label">Choose your Gold stake</label><div className="stake-options">{[100, 250, 500].map((amount) => <button key={amount} className={stake === amount ? 'active' : ''} onClick={() => setStake(amount)}><Coins size={15} />{amount}</button>)}</div>
            <div className="duel-pot-preview"><span>Winner takes</span><strong>{formatNumber(stake * 2)} Gold</strong></div>
            <button className="button button-primary button-full" onClick={() => onStart(friend, stake)} disabled={gold < stake}><Swords size={16} /> {gold < stake ? 'Not enough Gold' : 'Begin duel'}</button>
        </Modal>
    );
}

function OnboardingExperience({ player, onClose, onSave }) {
    const [step, setStep] = useState(1);
    const [form, setForm] = useState({ ...player });
    const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
    const detailsValid = form.name.trim() && Number(form.age) >= 13 && Number(form.height) > 50 && Number(form.weight) > 20;

    useEffect(() => {
        const previous = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        const handleKey = (event) => {
            if (event.key === 'Escape' && onClose) onClose();
        };
        document.addEventListener('keydown', handleKey);
        return () => {
            document.body.style.overflow = previous;
            document.removeEventListener('keydown', handleKey);
        };
    }, [onClose]);

    const finish = () => onSave({
        ...form,
        name: form.name.trim(),
        age: Number(form.age),
        height: Number(form.height),
        weight: Number(form.weight),
    });

    return (
        <div className="onboarding-experience" role="dialog" aria-modal="true" aria-label="Create your AURA character">
            <div className="onboarding-visual">
                <Image src="/images/aura-hero.png" alt="A shadow ranger entering a new realm" fill priority sizes="(max-width: 760px) 100vw, 45vw" />
                <div className="onboarding-visual-shade" />
                <div className="onboarding-visual-brand"><AuraMark size={38} /><span>AURA</span></div>
                <div className="onboarding-visual-copy">
                    <div className="eyebrow">YOUR REAL LIFE IS THE ADVENTURE</div>
                    <h1>Become the hero of your own story.</h1>
                    <p>Not another game to escape into. A system built to level up the life you already have.</p>
                    <div className="onboarding-visual-rule"><i /><span>YOUR JOURNEY BEGINS HERE</span><i /></div>
                </div>
            </div>
            <section className="onboarding-content">
                {onClose && <button className="onboarding-close icon-button" onClick={onClose} aria-label="Close onboarding"><X size={19} /></button>}
                <div className="onboarding-form-wrap">
                    <div className="onboarding-progress"><span>CHARACTER CREATION</span><div><i className="active" /><i className={step === 2 ? 'active' : ''} /></div><strong>0{step} / 02</strong></div>
                    {step === 1 ? (
                        <>
                            <div className="eyebrow">THE PERSON BEHIND THE PLAYER</div>
                            <h2>Every legend has a beginning.</h2>
                            <p className="onboarding-step-description">Tell us who you are. Your choices will shape your personal Aura.</p>
                            <form className="aura-form onboarding-native-form" onSubmit={(event) => { event.preventDefault(); if (detailsValid) setStep(2); }}>
                                <label><span>What should we call you?</span><input autoFocus value={form.name} onChange={(event) => update('name', event.target.value)} placeholder="Your player name" maxLength={24} required /></label>
                                <div className="form-row three">
                                    <label><span>Age</span><input type="number" value={form.age} onChange={(event) => update('age', event.target.value)} min="13" max="120" required /></label>
                                    <label><span>Height · cm</span><input type="number" value={form.height} onChange={(event) => update('height', event.target.value)} min="51" max="250" required /></label>
                                    <label><span>Weight · kg</span><input type="number" value={form.weight} onChange={(event) => update('weight', event.target.value)} min="21" max="400" required /></label>
                                </div>
                                <div className="onboarding-privacy"><Shield size={15} /><span>Your physical details stay on this device and only shape your character record.</span></div>
                                <button className="button button-primary button-full" type="submit" disabled={!detailsValid}>Choose your path <ArrowRight size={16} /></button>
                            </form>
                        </>
                    ) : (
                        <>
                            <div className="eyebrow">CHOOSE YOUR STARTING CLASS</div>
                            <h2>How will you rise, {form.name.trim()}?</h2>
                            <p className="onboarding-step-description">Pick the path that feels most like you. Every class can master every skill over time.</p>
                            <div className="class-options onboarding-class-options">
                                {[
                                    ['Shadow Ranger', Focus, 'Mental mastery', 'Focus, intelligence, and quiet discipline.'],
                                    ['Iron Vanguard', Dumbbell, 'Physical strength', 'Strength, stamina, and relentless action.'],
                                    ['Dawn Keeper', Sparkles, 'Spiritual balance', 'Reflection, gratitude, and inner peace.'],
                                ].map(([item, Icon, description, detail]) => (
                                    <button type="button" key={item} className={form.heroClass === item ? 'active' : ''} onClick={() => update('heroClass', item)}>
                                        <Icon size={25} /><strong>{item}</strong><span>{description}</span><small>{detail}</small>{form.heroClass === item && <Check size={15} />}
                                    </button>
                                ))}
                            </div>
                            <button className="button button-primary button-full" onClick={finish}>Begin your journey <ArrowRight size={16} /></button>
                            <button className="text-button onboarding-back" onClick={() => setStep(1)}>Back to player details</button>
                        </>
                    )}
                </div>
            </section>
        </div>
    );
}

function LevelUpModal({ level, onClose }) {
    return (
        <Modal onClose={onClose} label="Level up" className="level-up-modal">
            <div className="level-up-rays" /><div className="level-up-emblem"><AuraMark size={62} /></div><div className="eyebrow">YOUR LEGEND GROWS</div><h2>Level {level}</h2><p>Discipline became progress. Progress became power.</p><div className="level-up-perks"><div><Sparkles size={18} /><span><strong>+1 Skill Point</strong><small>Shape your constellation</small></span></div><div><Zap size={18} /><span><strong>+20 Maximum Energy</strong><small>Your capacity has grown</small></span></div></div><button className="button button-primary button-full" onClick={onClose}>Continue the journey <ArrowRight size={16} /></button>
        </Modal>
    );
}

export default function AuraApp() {
    const [screen, setScreen] = useState('quests');
    const [player, setPlayer] = useState(defaultPlayer);
    const [profileReady, setProfileReady] = useState(false);
    const [initialOnboarding, setInitialOnboarding] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [quests, setQuests] = useState(initialQuests);
    const [gold, setGold] = useState(2450);
    const [diamonds, setDiamonds] = useState(18);
    const [level, setLevel] = useState(12);
    const [xp, setXp] = useState(2840);
    const xpRef = useRef(2840);
    const [energy, setEnergy] = useState(82);
    const [bossProgress, setBossProgress] = useState(68);
    const [deadline, setDeadline] = useState(6 * 3600 + 42 * 60 + 18);
    const [focusDuration, setFocusDuration] = useState(25 * 60);
    const [focusSeconds, setFocusSeconds] = useState(25 * 60);
    const [focusRunning, setFocusRunning] = useState(false);
    const [skillPoints, setSkillPoints] = useState(4);
    const [unlockedSkills, setUnlockedSkills] = useState(['discipline', 'iron-body']);
    const [inventory, setInventory] = useState([]);
    const [activeSkin, setActiveSkin] = useState('realistic');
    const [duel, setDuel] = useState(null);
    const [devMode, setDevMode] = useState(false);
    const [notifications, setNotifications] = useState(initialNotifications);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [modal, setModal] = useState(null);
    const [modalData, setModalData] = useState(null);
    const [toast, setToast] = useState(null);
    const [settings, setSettings] = useState({ sound: true, particles: true, notifications: true, reducedMotion: false, penalty: 'Standard' });

    const notify = useCallback((message, type = 'success') => setToast({ message, type, id: Date.now() }), []);
    const closeModal = useCallback(() => { setModal(null); setModalData(null); }, []);
    const openModal = useCallback((type, data = null) => { setModal(type); setModalData(data); setNotificationsOpen(false); }, []);

    const awardRewards = useCallback((xpAmount, goldAmount, message) => {
        const nextXp = xpRef.current + xpAmount;
        if (nextXp >= XP_TO_LEVEL) {
            const remainder = nextXp - XP_TO_LEVEL;
            xpRef.current = remainder;
            setXp(remainder);
            setLevel((current) => current + 1);
            setSkillPoints((current) => current + 1);
            setModal('level-up');
        } else {
            xpRef.current = nextXp;
            setXp(nextXp);
        }
        setGold((current) => current + goldAmount);
        if (message) notify(message);
    }, [notify]);

    useEffect(() => {
        const timer = window.setTimeout(() => {
            try {
                const saved = window.localStorage.getItem(PROFILE_STORAGE_KEY);
                if (saved) {
                    setPlayer({ ...defaultPlayer, ...JSON.parse(saved) });
                } else {
                    setInitialOnboarding(true);
                }
            } catch {
                setInitialOnboarding(true);
            }
            setProfileReady(true);
        }, 0);
        return () => window.clearTimeout(timer);
    }, []);

    useEffect(() => {
        const timer = setInterval(() => setDeadline((current) => Math.max(0, current - 1)), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (!focusRunning) return undefined;
        const timer = setTimeout(() => {
            if (focusSeconds <= 1) {
                setFocusSeconds(0);
                setFocusRunning(false);
                setEnergy((current) => Math.max(0, current - 10));
                awardRewards(150, 75, 'Sanctuary complete · +150 XP and +75 Gold');
            } else {
                setFocusSeconds(focusSeconds - 1);
            }
        }, 1000);
        return () => clearTimeout(timer);
    }, [focusSeconds, focusRunning, awardRewards]);

    useEffect(() => {
        if (!toast) return undefined;
        const timer = setTimeout(() => setToast(null), 3500);
        return () => clearTimeout(timer);
    }, [toast]);

    const savePlayer = (profile) => {
        const isFirstLaunch = initialOnboarding;
        setPlayer(profile);
        try {
            window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
        } catch {
            // The profile still works for this session when storage is unavailable.
        }
        setInitialOnboarding(false);
        closeModal();
        notify(isFirstLaunch ? `Welcome to AURA, ${profile.name}. Your journey begins now.` : 'Your character record has been updated.');
    };

    const navigate = (id) => {
        setScreen(id);
        setSidebarOpen(false);
        setNotificationsOpen(false);
        window.scrollTo({ top: 0, behavior: settings.reducedMotion ? 'auto' : 'smooth' });
    };

    const toggleQuest = (id) => {
        const quest = quests.find((item) => item.id === id);
        if (!quest) return;
        setQuests((current) => current.map((item) => item.id === id ? { ...item, done: !item.done } : item));
        if (quest.done) {
            const next = Math.max(0, xpRef.current - quest.xp);
            xpRef.current = next;
            setXp(next);
            setGold((current) => Math.max(0, current - quest.gold));
            notify('Quest marked incomplete. Rewards returned.', 'neutral');
        } else {
            awardRewards(quest.xp, quest.gold, `Quest complete · +${quest.xp} XP · +${quest.gold} Gold`);
        }
    };

    const addQuest = (quest) => {
        setQuests((current) => [...current, { ...quest, id: Date.now(), done: false }]);
        closeModal();
        notify('New quest added to today’s path.');
    };

    const buyItem = (item) => {
        const balance = item.currency === 'gold' ? gold : diamonds;
        if (balance < item.price) {
            notify(`Not enough ${item.currency === 'gold' ? 'Gold' : 'Diamonds'} for this item.`, 'error');
            return;
        }
        if (item.currency === 'gold') setGold((current) => current - item.price);
        else setDiamonds((current) => current - item.price);
        setInventory((current) => [...current, item.id]);
        if (item.id === 'p1') setEnergy((current) => Math.min(100, current + 50));
        notify(`${item.name} acquired${item.id === 'p1' ? ' · +50 Energy' : ''}.`);
    };

    const unlockSkill = (skill) => {
        if (unlockedSkills.includes(skill.id) || skillPoints < skill.cost) return;
        setSkillPoints((current) => current - skill.cost);
        setUnlockedSkills((current) => [...current, skill.id]);
        notify(`${skill.name} unlocked in your constellation.`);
    };

    const spendForCard = (price) => {
        if (gold < price) {
            notify('Not enough Gold for this draw.', 'error');
            return false;
        }
        setGold((current) => current - price);
        return true;
    };

    const acceptTarot = (quest) => {
        setQuests((current) => [...current, { ...quest, id: Date.now(), done: false, title: `${quest.rank} · ${quest.title}` }]);
        closeModal();
        navigate('quests');
        notify('Fate accepted. The quest is now on your daily path.');
    };

    const startDuel = (friend, stake) => {
        if (gold < stake) return;
        setGold((current) => current - stake);
        setDuel({ ...friend, stake });
        closeModal();
        navigate('duel');
        notify(`${friend.name} has been challenged. First to 3 quests wins.`);
    };

    const castAttackSpell = () => {
        if (!duel || duel.debuff || !inventory.includes('p4')) return;
        const targetName = duel.name;
        setInventory((current) => current.filter((item) => item !== 'p4'));
        setDuel((current) => ({ ...current, debuff: 'Exhausted · −10% XP', debuffUntil: Date.now() + 3600000 }));
        notify(`Exhaustion cast on ${targetName}. Their XP is reduced for one hour.`);
    };

    const bossTrial = () => {
        setBossProgress((current) => Math.max(0, current - 8));
        awardRewards(150, 75, 'Boss trial logged · The Colossus weakens.');
    };

    const secretCode = (code) => {
        if (code === 'JAS777') {
            setDevMode(true);
            return 'Developer Mode enabled. Gold conversion is now available.';
        }
        setDevMode(false);
        return 'Developer Mode disabled.';
    };

    const resetFocus = () => { setFocusRunning(false); setFocusSeconds(focusDuration); };
    const changeFocusDuration = (seconds) => { setFocusDuration(seconds); setFocusSeconds(seconds); setFocusRunning(false); };
    const completedQuests = quests.filter((quest) => quest.done).length;
    const unread = notifications.filter((notification) => !notification.read).length;

    let content;
    switch (screen) {
        case 'skills': content = <SkillTreeScreen unlockedSkills={unlockedSkills} skillPoints={skillPoints} onUnlock={unlockSkill} />; break;
        case 'character': content = <CharacterScreen player={player} level={level} xp={xp} activeSkin={activeSkin} onSkinChange={(skin) => { setActiveSkin(skin); notify('Avatar equipped.'); }} onOpenModal={openModal} />; break;
        case 'store': content = <StoreScreen gold={gold} diamonds={diamonds} inventory={inventory} onBuy={buyItem} onOpenModal={openModal} />; break;
        case 'social': content = <SocialScreen devMode={devMode} onSecretCode={secretCode} onGift={(friend) => { setGold((current) => Math.max(0, current - 25)); notify(`A 25 Gold gift is on its way to ${friend.name}.`); }} onChallenge={(friend) => openModal('duel', friend)} />; break;
        case 'leaderboard': content = <LeaderboardScreen xp={xp} level={level} playerName={player.name} />; break;
        case 'focus': content = <FocusScreen focusSeconds={focusSeconds} focusDuration={focusDuration} focusRunning={focusRunning} onToggle={() => setFocusRunning((current) => !current)} onReset={resetFocus} onDuration={changeFocusDuration} energy={energy} />; break;
        case 'duel': content = <PvpScreen duel={duel} player={player} level={level} hasAttackSpell={inventory.includes('p4')} onCastSpell={castAttackSpell} completedQuests={completedQuests} onNavigate={navigate} onClaim={() => { setGold((current) => current + duel.stake * 2); setDuel(null); notify(`Duel won · ${formatNumber(duel.stake * 2)} Gold added to your vault.`); navigate('social'); }} />; break;
        case 'notifications': content = <NotificationsScreen notifications={notifications} onMarkAllRead={() => setNotifications((current) => current.map((item) => ({ ...item, read: true })))} />; break;
        case 'settings': content = <SettingsScreen player={player} settings={settings} onSettingChange={(key, value) => setSettings((current) => ({ ...current, [key]: value }))} onOpenModal={openModal} />; break;
        default: content = <Dashboard player={player} quests={quests} onToggleQuest={toggleQuest} onAddQuest={() => openModal('add-quest')} onNavigate={navigate} onOpenModal={openModal} level={level} xp={xp} bossProgress={bossProgress} deadline={deadline} focusSeconds={focusSeconds} focusRunning={focusRunning} onFocusToggle={() => setFocusRunning((current) => !current)} activeSkin={activeSkin} />;
    }

    if (!profileReady) {
        return <div className="aura-boot"><AuraMark size={48} /><strong>AURA</strong><span>PREPARING YOUR JOURNEY</span><i /></div>;
    }

    return (
        <div className={`aura-app ${settings.particles ? '' : 'no-particles'} ${settings.reducedMotion ? 'reduce-motion' : ''} ${(initialOnboarding || modal === 'onboarding') ? 'onboarding-active' : ''}`}>
            <div className="ambient-grid" /><div className="ambient-glow" /><div className="ambient-particles"><i /><i /><i /><i /><i /><i /></div>
            {sidebarOpen && <button className="sidebar-dismiss" aria-label="Close navigation" onClick={() => setSidebarOpen(false)} />}
            <aside className={`sidebar ${sidebarOpen ? 'is-open' : ''}`}>
                <button className="brand" onClick={() => navigate('quests')} aria-label="Aura dashboard"><AuraMark /><span><strong>AURA</strong><small>REAL-LIFE RPG</small></span></button>
                <button className="sidebar-close icon-button" onClick={() => setSidebarOpen(false)} aria-label="Close menu"><X size={18} /></button>
                <nav className="sidebar-nav" aria-label="Main navigation">
                    {navigation.map((group) => <div className="nav-group" key={group.label}><span className="nav-group-label">{group.label}</span>{group.items.map((item) => { const Icon = item.icon; return <button key={item.id} className={`nav-item ${screen === item.id ? 'active' : ''}`} onClick={() => navigate(item.id)}><Icon size={18} strokeWidth={1.6} /><span>{item.label}</span>{item.id === 'duel' && duel && <i className="nav-live-dot" />}</button>; })}</div>)}
                </nav>
                <div className="sidebar-bottom">
                    <button className="sidebar-fate-card" onClick={() => openModal('tarot')}><span className="fate-icon"><Sparkles size={19} /></span><span><strong>Draw your fate</strong><small>Mystery quests await</small></span><ChevronRight size={15} /></button>
                    <button className={`nav-item ${screen === 'settings' ? 'active' : ''}`} onClick={() => navigate('settings')}><Settings size={18} strokeWidth={1.6} /><span>Settings</span></button>
                    <div className="sidebar-profile"><Avatar name={player.name} image size="small" /><div><strong>{player.name}</strong><span>Level {level} · Gold III</span></div><button className="icon-button" onClick={() => navigate('character')} aria-label="Open profile"><ChevronRight size={15} /></button></div>
                </div>
            </aside>

            <div className="app-shell">
                <header className="topbar">
                    <div className="topbar-left"><button className="mobile-menu icon-button" onClick={() => setSidebarOpen(true)} aria-label="Open navigation"><Menu size={21} /></button><div className="topbar-breadcrumb"><span>AURA</span><ChevronRight size={12} /><strong>{screenLabels[screen]}</strong></div></div>
                    <div className="topbar-right">
                        <div className="streak-chip" title="12 day streak"><Flame size={16} fill="currentColor" /><strong>12</strong><span>day streak</span></div>
                        <div className="topbar-currencies"><Currency value={gold} />{devMode && <button className="convert-button" onClick={() => { if (gold >= 100) { setGold((current) => current - 100); setDiamonds((current) => current + 1); notify('Converted 100 Gold into 1 Diamond.'); } }}>Convert</button>}<Currency type="diamonds" value={diamonds} /></div>
                        <div className="topbar-divider" />
                        <button className="icon-button notification-button" onClick={() => setNotificationsOpen((current) => !current)} aria-label={`${unread} unread notifications`}><Bell size={19} strokeWidth={1.6} />{unread > 0 && <span>{unread}</span>}</button>
                        <button className="topbar-avatar" onClick={() => navigate('character')} aria-label="Open character profile"><Avatar name={player.name} image size="small" /></button>
                    </div>
                </header>
                <main className="main-content">{content}</main>
            </div>

            {notificationsOpen && <><button className="notification-dismiss" aria-label="Close notifications" onClick={() => setNotificationsOpen(false)} /><section className="notification-popover"><div className="notification-popover-header"><div><span>SYSTEM MESSAGES</span><h2>Notifications</h2></div><button className="text-button" onClick={() => setNotifications((current) => current.map((item) => ({ ...item, read: true })))}>Mark all read</button></div><div className="notification-popover-list">{notifications.slice(0, 3).map((notification) => <button key={notification.id} className={!notification.read ? 'unread' : ''} onClick={() => navigate('notifications')}><span className={`notification-dot type-${notification.type}`} /><div><strong>{notification.title}</strong><p>{notification.description}</p><small>{notification.time}</small></div></button>)}</div><button className="notification-view-all" onClick={() => navigate('notifications')}>View all notifications <ArrowRight size={14} /></button></section></>}

            {initialOnboarding && <OnboardingExperience player={player} onSave={savePlayer} />}
            {modal === 'add-quest' && <AddQuestModal onClose={closeModal} onSubmit={addQuest} />}
            {modal === 'quest-detail' && <QuestDetailModal quest={quests.find((quest) => quest.id === modalData?.id) || modalData} onClose={closeModal} onToggle={toggleQuest} />}
            {modal === 'boss' && <BossModal progress={bossProgress} onClose={closeModal} onTrial={bossTrial} />}
            {modal === 'tarot' && <TarotModal gold={gold} onClose={closeModal} onSpend={spendForCard} onAccept={acceptTarot} />}
            {modal === 'duel' && <DuelModal player={player} friend={modalData} gold={gold} onClose={closeModal} onStart={startDuel} />}
            {modal === 'onboarding' && <OnboardingExperience player={player} onClose={closeModal} onSave={savePlayer} />}
            {modal === 'level-up' && <LevelUpModal level={level} onClose={closeModal} />}

            {toast && <div className={`toast toast-${toast.type}`} role="status" key={toast.id}><span>{toast.type === 'error' ? <CircleAlert size={18} /> : toast.type === 'neutral' ? <Bell size={18} /> : <Check size={18} />}</span><p>{toast.message}</p><button onClick={() => setToast(null)} aria-label="Dismiss notification"><X size={15} /></button></div>}
        </div>
    );
}
