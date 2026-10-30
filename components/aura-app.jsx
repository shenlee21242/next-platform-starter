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
import AuthScreen from './aura/auth-screen';
import CharacterLoreModal from './aura/character-lore';
import CharacterRoster from './aura/character-roster';
import { characters, getCharacter } from './aura/characters';
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
import { initialQuests, skills as skillDefinitions, XP_TO_LEVEL, getRank } from './aura/data';
import { fateRanks, generateQuest, getFateRank, getRankProbabilities } from './aura/fate';
import { Avatar, CategoryIcon, Currency, formatClock, formatNumber, Modal, ProgressBar } from './aura/ui';
import {
    createDailyQuest,
    createNewGame,
    DAILY_PENALTY_GOLD,
    defaultPlayer,
    defaultSettings,
    getMissedQuestPenalty,
    localDayKey,
    localWeekKey,
    readSession,
    readStoredGame,
    secondsUntilMidnight,
    withDailyQuest,
    writeSession,
    writeStoredGame,
} from './aura/game';

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
            {quest.image ? <div className="quest-detail-art"><Image src={quest.image} alt={`${quest.category} quest illustration`} width={640} height={400} unoptimized /></div> : <div className={`quest-detail-symbol category-${quest.category.toLowerCase()}`}><CategoryIcon category={quest.category} size={30} /></div>}
            <div className="eyebrow">{quest.category} PATH · {quest.rank ? `${quest.rank}-RANK FATE QUEST` : 'DAILY QUEST'}</div>
            <h2>{quest.title}</h2>
            <p>{quest.description || 'Show up for yourself. Complete this quest before the daily reset to earn your rewards and protect your streak.'}</p>
            {quest.skillIds?.length > 0 && <div className="quest-skill-links" aria-label="Skills advanced by this quest"><span>ADVANCES</span><div>{quest.skillIds.map((id) => <strong key={id}>{skillDefinitions.find((skill) => skill.id === id)?.name || id}</strong>)}</div></div>}
            <div className="quest-detail-grid"><div><Clock3 size={17} /><span>Estimated time</span><strong>{quest.duration} minutes</strong></div><div><Sparkles size={17} /><span>Experience</span><strong>+{formatNumber(quest.xp)} XP</strong></div><div><Coins size={17} /><span>Gold reward</span><strong>+{formatNumber(quest.gold)} Gold</strong></div>{quest.diamonds > 0 && <div><Diamond size={17} /><span>Diamond reward</span><strong>+{quest.diamonds}</strong></div>}</div>
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

function TarotModal({ gold, level, onClose, onSpend, onAccept }) {
    const [stage, setStage] = useState('choose');
    const [drawnQuest, setDrawnQuest] = useState(null);
    const timer = useRef(null);
    const probabilities = getRankProbabilities(level);
    const availableRanks = probabilities.filter((item) => item.chance > 0).map((item) => getFateRank(item.rank));
    const prices = availableRanks.map((item) => item.price);
    const minimumPrice = Math.min(...prices);
    const maximumPrice = Math.max(...prices);
    const revealedRank = getFateRank(drawnQuest?.rank || 'F');
    useEffect(() => () => clearTimeout(timer.current), []);

    const draw = () => {
        const quest = generateQuest(level);
        const rank = getFateRank(quest.rank);
        if (!onSpend(rank.price)) return;
        setDrawnQuest(quest);
        setStage('drawing');
        timer.current = setTimeout(() => setStage('revealed'), 1200);
    };

    const accept = () => onAccept({
        sourceId: drawnQuest.id,
        title: drawnQuest.text,
        category: drawnQuest.category,
        rank: drawnQuest.rank,
        description: drawnQuest.description,
        image: drawnQuest.image,
        skillIds: drawnQuest.skillIds,
        xp: drawnQuest.xp,
        gold: drawnQuest.gold,
        diamonds: revealedRank.diamonds,
        duration: revealedRank.duration,
    });

    return (
        <Modal onClose={onClose} label="Deck of Fate quest generator" className={`tarot-modal fate-generator-modal stage-${stage}`}>
            {stage === 'choose' && <>
                <div className="modal-heading tarot-heading"><span className="modal-heading-icon"><Sparkles size={22} /></span><div className="eyebrow">THE DECK OF FATE</div><h2>Your level shapes the unknown.</h2><p>Tap an active card to draw. Your level determines the possible ranks, then Physical, Mental, or Spiritual is rolled. You pay the revealed rank’s cost.</p></div>
                <div className="fate-level-status"><span>LEVEL {level} DECK</span><strong>{availableRanks.map((item) => item.rank).join(' · ')}</strong><small>{minimumPrice === maximumPrice ? `${formatNumber(minimumPrice)} Gold per draw` : `${formatNumber(minimumPrice)}–${formatNumber(maximumPrice)} Gold per draw`}</small></div>
                <div className="fate-rank-grid" role="group" aria-label={`Level ${level} rank probabilities`}>
                    {fateRanks.map((item) => {
                        const chance = probabilities.find((entry) => entry.rank === item.rank)?.chance || 0;
                        return (
                            <button type="button" key={item.rank} onClick={draw} disabled={!chance || gold < minimumPrice} className={`fate-rank-card fate-shape-${item.rank.toLowerCase()} ${chance ? '' : 'is-unavailable'}`} style={{ '--rank-color': item.color }} aria-label={`${item.rank} rank, ${chance}% chance, ${formatNumber(item.price)} Gold${chance ? '. Draw a level-weighted quest' : '. Outside current deck'}`}>
                                <span className="fate-rank-letter">{item.rank}</span>
                                <strong>{item.label}</strong>
                                <small><Coins size={11} /> {formatNumber(item.price)}</small>
                                <em>{chance ? `${chance}% chance` : 'Outside current deck'}</em>
                            </button>
                        );
                    })}
                </div>
                <button className="button button-primary button-full fate-draw-action" onClick={draw} disabled={gold < minimumPrice}>
                    <Sparkles size={16} /> {gold < minimumPrice ? `You need ${formatNumber(minimumPrice - gold)} more Gold` : `Draw a Fate card · ${formatNumber(minimumPrice)}${maximumPrice > minimumPrice ? `–${formatNumber(maximumPrice)}` : ''} Gold`}
                </button>
                <p className="tarot-odds">Every card contains a real-world quest. Higher levels unlock more demanding ranks.</p>
            </>}
            {stage === 'drawing' && <div className="tarot-drawing">
                <div className="fate-flip-scene"><div className="fate-flip-card">
                    <div className={`fate-flip-face fate-flip-back fate-shape-${drawnQuest.rank.toLowerCase()}`}><AuraMark size={48} /><span>AURA</span><i /></div>
                    <div className={`fate-flip-face fate-flip-front fate-shape-${drawnQuest.rank.toLowerCase()}`} style={{ '--rank-color': revealedRank.color }}><span>{drawnQuest.rank}</span><strong>{drawnQuest.category}</strong></div>
                </div></div>
                <h2>The deck is turning…</h2><p>Your level has chosen a rank. Fate is choosing a path.</p>
            </div>}
            {stage === 'revealed' && <div className="tarot-revealed fate-quest-revealed">
                <div className="fate-quest-art" style={{ '--rank-color': revealedRank.color }}><Image src={drawnQuest.image} alt={`${drawnQuest.category} ${drawnQuest.rank}-rank quest illustration`} width={640} height={400} unoptimized /></div>
                <div className="eyebrow">YOUR {drawnQuest.rank}-RANK · {drawnQuest.category.toUpperCase()} QUEST</div>
                <div className="fate-quest-category"><CategoryIcon category={drawnQuest.category} size={20} /><span>{drawnQuest.category}</span></div>
                <h2>{drawnQuest.text}</h2>
                <p className="fate-quest-description">{drawnQuest.description}</p>
                <div className="quest-skill-links" aria-label="Skills advanced by this quest"><span>ADVANCES</span><div>{drawnQuest.skillIds.map((id) => <strong key={id}>{skillDefinitions.find((skill) => skill.id === id)?.name || id}</strong>)}</div></div>
                <p className="fate-draw-note">Drawn from your Level {level} deck for {formatNumber(revealedRank.price)} Gold.</p>
                <div className="revealed-rewards"><strong>+{formatNumber(drawnQuest.xp)} XP</strong><strong><Coins size={15} /> +{formatNumber(drawnQuest.gold)}</strong>{revealedRank.diamonds > 0 && <strong><Diamond size={14} /> +{revealedRank.diamonds}</strong>}</div>
                <button className="button button-primary button-full" onClick={accept}><Check size={16} /> Accept this quest</button>
            </div>}
        </Modal>
    );
}

function DuelModal({ friend, gold, onClose, onStart, player }) {
    const [stake, setStake] = useState(250);
    if (!friend) return null;
    return (
        <Modal onClose={onClose} label="Create a duel" className="duel-modal">
            <div className="eyebrow">A FRIENDLY TRIAL</div><h2>Challenge {friend.name}</h2><p>First to complete 3 daily quests wins the pot.</p>
            <div className="duel-modal-versus"><Avatar name={player.name} image={getCharacter(player.characterId).image} size="large" /><span>VS</span><Avatar {...friend} size="large" /></div>
            <label className="stake-label">Choose your Gold stake</label><div className="stake-options">{[100, 250, 500].map((amount) => <button key={amount} className={stake === amount ? 'active' : ''} onClick={() => setStake(amount)}><Coins size={15} />{amount}</button>)}</div>
            <div className="duel-pot-preview"><span>Winner takes</span><strong>{formatNumber(stake * 2)} Gold</strong></div>
            <button className="button button-primary button-full" onClick={() => onStart(friend, stake)} disabled={gold < stake}><Swords size={16} /> {gold < stake ? 'Not enough Gold' : 'Begin duel'}</button>
        </Modal>
    );
}

function OnboardingExperience({ player, onClose, onSave }) {
    const [step, setStep] = useState(1);
    const [form, setForm] = useState({ ...player, characterId: player.characterId || 'kael' });
    const [storyCharacter, setStoryCharacter] = useState(null);
    const selectedCharacter = getCharacter(form.characterId);
    const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
    const chooseCharacter = (character) => setForm((current) => ({ ...current, characterId: character.id, heroClass: character.heroClass }));
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
                <Image key={selectedCharacter.id} src={selectedCharacter.image} alt={`${selectedCharacter.name}, ${selectedCharacter.title}`} fill priority sizes="(max-width: 760px) 100vw, 45vw" />
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
                <div className={`onboarding-form-wrap ${step === 2 ? 'hero-choice-wrap' : ''}`}>
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
                            <div className="eyebrow">CHOOSE YOUR STARTING HERO</div>
                            <h2>Who will walk beside you, {form.name.trim()}?</h2>
                            <p className="onboarding-step-description">{characters.length} heroes across four paths. Tap a portrait to read their story, then choose who reflects your journey.</p>
                            <CharacterRoster variant="onboarding" selectedId={form.characterId} onSelect={chooseCharacter} onReadStory={setStoryCharacter} />
                            <button className="button button-primary button-full" onClick={finish}>Begin as {selectedCharacter.name} <ArrowRight size={16} /></button>
                            <button className="text-button onboarding-back" onClick={() => setStep(1)}>Back to player details</button>
                        </>
                    )}
                </div>
            </section>
            {storyCharacter && <CharacterLoreModal character={storyCharacter} selected={storyCharacter.id === form.characterId} onClose={() => setStoryCharacter(null)} onSelect={chooseCharacter} />}
        </div>
    );
}

function LevelUpModal({ level, onClose }) {
    return (
        <Modal onClose={onClose} label="Level up" className="level-up-modal">
            <div className="level-up-rays" /><div className="level-up-emblem"><AuraMark size={62} /></div><div className="eyebrow">YOUR LEGEND GROWS</div><h2>Level {level}</h2><p>Discipline became progress. Progress became power.</p><div className="level-up-perks"><div><Sparkles size={18} /><span><strong>+1 Skill Point</strong><small>Shape your constellation</small></span></div><div><Zap size={18} /><span><strong>+20 Energy</strong><small>Your capacity has grown</small></span></div></div><button className="button button-primary button-full" onClick={onClose}>Continue the journey <ArrowRight size={16} /></button>
        </Modal>
    );
}

export default function AuraApp() {
    const [screen, setScreen] = useState('quests');
    const [session, setSession] = useState(null);
    const [player, setPlayer] = useState(defaultPlayer);
    const [profileReady, setProfileReady] = useState(false);
    const [initialOnboarding, setInitialOnboarding] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [quests, setQuests] = useState(initialQuests);
    const [gold, setGold] = useState(100);
    const [diamonds, setDiamonds] = useState(0);
    const [level, setLevel] = useState(0);
    const [xp, setXp] = useState(0);
    const xpRef = useRef(0);
    const [energy, setEnergy] = useState(100);
    const [bossProgress, setBossProgress] = useState(100);
    const [deadline, setDeadline] = useState(0);
    const [focusDuration, setFocusDuration] = useState(25 * 60);
    const [focusSeconds, setFocusSeconds] = useState(25 * 60);
    const [focusRunning, setFocusRunning] = useState(false);
    const [focusSessions, setFocusSessions] = useState(0);
    const [focusMinutes, setFocusMinutes] = useState(0);
    const [skillPoints, setSkillPoints] = useState(0);
    const [unlockedSkills, setUnlockedSkills] = useState(['discipline']);
    const [skillQuestProgress, setSkillQuestProgress] = useState({});
    const [inventory, setInventory] = useState([]);
    const [activeSkin, setActiveSkin] = useState('kael');
    const [duel, setDuel] = useState(null);
    const [streak, setStreak] = useState(0);
    const [bestStreak, setBestStreak] = useState(0);
    const [lastCompletionDate, setLastCompletionDate] = useState(null);
    const [lastQuestDate, setLastQuestDate] = useState(null);
    const [devMode, setDevMode] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [modal, setModal] = useState(null);
    const [modalData, setModalData] = useState(null);
    const [toast, setToast] = useState(null);
    const [settings, setSettings] = useState(defaultSettings);

    const notify = useCallback((message, type = 'success') => setToast({ message, type, id: Date.now() }), []);
    const closeModal = useCallback(() => { setModal(null); setModalData(null); }, []);
    const openModal = useCallback((type, data = null) => { setModal(type); setModalData(data); setNotificationsOpen(false); }, []);

    const awardRewards = useCallback((xpAmount, goldAmount, message) => {
        let nextXp = xpRef.current + xpAmount;
        let levelsGained = 0;
        while (nextXp >= XP_TO_LEVEL) {
            nextXp -= XP_TO_LEVEL;
            levelsGained += 1;
        }
        xpRef.current = nextXp;
        setXp(nextXp);
        if (levelsGained > 0) {
            setLevel((current) => current + levelsGained);
            setSkillPoints((current) => current + levelsGained);
            setEnergy((current) => Math.min(100, current + 20 * levelsGained));
            setModal('level-up');
        }
        setGold((current) => current + goldAmount);
        if (message) notify(message);
    }, [notify]);

    const restoreGame = useCallback((game) => {
        const restoredCharacter = getCharacter(game.player?.characterId || game.activeSkin);
        const sameFocusWeek = game.focusWeek === localWeekKey();
        setPlayer({ ...defaultPlayer, ...(game.player || {}), characterId: restoredCharacter.id, heroClass: game.player?.heroClass || restoredCharacter.heroClass });
        setQuests(Array.isArray(game.quests) ? game.quests : []);
        setLevel(game.level ?? 0);
        const savedXp = game.xp ?? 0;
        xpRef.current = savedXp;
        setXp(savedXp);
        setGold(game.gold ?? 100);
        setDiamonds(game.diamonds ?? 0);
        setEnergy(game.energy ?? 100);
        setBossProgress(game.bossProgress ?? 100);
        setSkillPoints(game.skillPoints ?? 0);
        setUnlockedSkills(game.unlockedSkills || ['discipline']);
        setSkillQuestProgress(game.skillQuestProgress || {});
        setInventory(game.inventory || []);
        setActiveSkin(restoredCharacter.id);
        setDuel(game.duel || null);
        setStreak(game.streak ?? 0);
        setBestStreak(Math.max(game.bestStreak ?? 0, game.streak ?? 0));
        setLastCompletionDate(game.lastCompletionDate || null);
        setLastQuestDate(game.lastQuestDate || null);
        setNotifications(game.notifications || []);
        setSettings({ ...defaultSettings, ...(game.settings || {}) });
        setFocusRunning(false);
        setFocusDuration(25 * 60);
        setFocusSeconds(25 * 60);
        setFocusSessions(sameFocusWeek ? game.focusSessions ?? 0 : 0);
        setFocusMinutes(sameFocusWeek ? game.focusMinutes ?? 0 : 0);
        setDeadline(secondsUntilMidnight());
        setDevMode(false);
        setScreen('quests');
        setModal(null);
        setModalData(null);
    }, []);

    const startSession = useCallback((auth) => {
        const email = auth.email.trim().toLowerCase();
        const stored = readStoredGame(email);
        const returningPlayer = Boolean(stored?.profileComplete);
        const game = returningPlayer ? withDailyQuest(stored) : createNewGame(auth);
        restoreGame(game);
        const nextSession = { email, provider: auth.provider };
        setSession(nextSession);
        writeSession(nextSession);
        setInitialOnboarding(!returningPlayer);
        setProfileReady(true);
        setToast(null);
    }, [restoreGame]);

    useEffect(() => {
        const timer = window.setTimeout(() => {
            const savedSession = readSession();
            if (savedSession?.email) startSession(savedSession);
            else setProfileReady(true);
        }, 0);
        return () => window.clearTimeout(timer);
    }, [startSession]);

    useEffect(() => {
        if (!session || !profileReady || initialOnboarding) return;
        writeStoredGame(session.email, {
            profileComplete: true,
            player,
            quests,
            level,
            xp,
            gold,
            diamonds,
            energy,
            bossProgress,
            skillPoints,
            unlockedSkills,
            skillQuestProgress,
            inventory,
            activeSkin,
            duel,
            streak,
            bestStreak,
            lastCompletionDate,
            lastQuestDate,
            focusSessions,
            focusMinutes,
            focusWeek: localWeekKey(),
            notifications,
            settings,
        });
    }, [session, profileReady, initialOnboarding, player, quests, level, xp, gold, diamonds, energy, bossProgress, skillPoints, unlockedSkills, skillQuestProgress, inventory, activeSkin, duel, streak, bestStreak, lastCompletionDate, lastQuestDate, focusSessions, focusMinutes, notifications, settings]);

    useEffect(() => {
        const timer = setInterval(() => setDeadline((current) => Math.max(0, current - 1)), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (deadline !== 0 || !session || initialOnboarding) return undefined;
        const timer = window.setTimeout(() => {
            const today = localDayKey();
            if (lastQuestDate === today) {
                setDeadline(secondsUntilMidnight());
                return;
            }
            const penalty = getMissedQuestPenalty(quests, settings.penalty);
            const dailyQuest = createDailyQuest(player, lastQuestDate);
            const isNewWeek = lastQuestDate && localWeekKey(new Date(`${lastQuestDate}T12:00:00`)) !== localWeekKey();
            if (penalty.incomplete) {
                setGold((current) => Math.max(0, current - penalty.gold));
                setStreak(0);
                setNotifications((current) => [{
                    id: `penalty-${today}`,
                    type: 'quest',
                    title: 'Daily quest penalty',
                    description: `${penalty.incomplete} ${penalty.incomplete === 1 ? 'quest was' : 'quests were'} left incomplete. A ${penalty.gold} Gold penalty was applied and your streak was reset.`,
                    time: 'Daily reset',
                    read: false,
                }, ...current]);
            }
            if (isNewWeek) {
                setFocusSessions(0);
                setFocusMinutes(0);
            }
            setQuests((current) => [...current.filter((quest) => !quest.generated), dailyQuest]);
            setLastQuestDate(today);
            setDeadline(secondsUntilMidnight());
            notify(penalty.incomplete
                ? `Daily reset · −${penalty.gold} Gold and your streak was reset.`
                : `A new day begins. ${dailyQuest.title} is your new daily quest.`, penalty.incomplete ? 'error' : 'success');
        }, 0);
        return () => window.clearTimeout(timer);
    }, [deadline, session, initialOnboarding, player, lastQuestDate, quests, settings.penalty, notify]);

    useEffect(() => {
        if (!focusRunning) return undefined;
        const timer = setTimeout(() => {
            if (focusSeconds <= 1) {
                setFocusSeconds(0);
                setFocusRunning(false);
                setEnergy((current) => Math.max(0, current - 10));
                setFocusSessions((current) => current + 1);
                setFocusMinutes((current) => current + Math.round(focusDuration / 60));
                awardRewards(150, 75, 'Sanctuary complete · +150 XP and +75 Gold');
            } else {
                setFocusSeconds(focusSeconds - 1);
            }
        }, 1000);
        return () => clearTimeout(timer);
    }, [focusSeconds, focusRunning, focusDuration, awardRewards]);

    useEffect(() => {
        if (!toast) return undefined;
        const timer = setTimeout(() => setToast(null), 3500);
        return () => clearTimeout(timer);
    }, [toast]);

    const savePlayer = (profile) => {
        const isFirstLaunch = initialOnboarding;
        const selectedCharacter = getCharacter(profile.characterId);
        const nextProfile = { ...profile, characterId: selectedCharacter.id, heroClass: selectedCharacter.heroClass };
        setPlayer(nextProfile);
        setActiveSkin(selectedCharacter.id);
        if (isFirstLaunch) {
            const dailyQuest = createDailyQuest(nextProfile, lastQuestDate);
            setQuests((current) => [...current.filter((quest) => !quest.generated), dailyQuest]);
            setLastQuestDate(localDayKey());
        }
        setInitialOnboarding(false);
        closeModal();
        notify(isFirstLaunch ? `Welcome to AURA, ${profile.name}. Your first daily quest is ready.` : 'Your character record has been updated.');
    };

    const logout = () => {
        writeSession(null);
        setSession(null);
        setInitialOnboarding(false);
        setNotificationsOpen(false);
        setModal(null);
        setToast(null);
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
        const changeSkillProgress = (direction) => {
            if (!quest.skillIds?.length) return;
            setSkillQuestProgress((current) => {
                const next = { ...current };
                for (const skillId of quest.skillIds) next[skillId] = Math.max(0, (next[skillId] || 0) + direction);
                return next;
            });
        };
        setQuests((current) => current.map((item) => item.id === id ? { ...item, done: !item.done } : item));
        if (quest.done) {
            changeSkillProgress(-1);
            const next = Math.max(0, xpRef.current - quest.xp);
            xpRef.current = next;
            setXp(next);
            setGold((current) => Math.max(0, current - quest.gold));
            if (quest.diamonds) setDiamonds((current) => Math.max(0, current - quest.diamonds));
            if (duel?.completedQuestIds?.includes(id)) {
                setDuel((current) => ({
                    ...current,
                    playerProgress: Math.max(0, (current.playerProgress || 0) - 1),
                    completedQuestIds: (current.completedQuestIds || []).filter((questId) => questId !== id),
                }));
            }
            notify('Quest marked incomplete. Rewards and linked skill progress returned.', 'neutral');
        } else {
            changeSkillProgress(1);
            const today = localDayKey();
            if (lastCompletionDate !== today) {
                const yesterday = localDayKey(new Date(Date.now() - 86400000));
                const nextStreak = lastCompletionDate === yesterday ? streak + 1 : 1;
                setStreak(nextStreak);
                setBestStreak((current) => Math.max(current, nextStreak));
                setLastCompletionDate(today);
            }
            if (quest.diamonds) setDiamonds((current) => current + quest.diamonds);
            if (duel) {
                setDuel((current) => {
                    if ((current.completedQuestIds || []).includes(id)) return current;
                    return {
                        ...current,
                        playerProgress: Math.min(3, (current.playerProgress || 0) + 1),
                        completedQuestIds: [...(current.completedQuestIds || []), id],
                    };
                });
            }
            const diamondReward = quest.diamonds ? ` · +${quest.diamonds} ${quest.diamonds === 1 ? 'Diamond' : 'Diamonds'}` : '';
            awardRewards(quest.xp, quest.gold, `Quest complete · +${quest.xp} XP · +${quest.gold} Gold${diamondReward}`);
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
        const linkedProgress = skillQuestProgress[skill.id] || 0;
        if (unlockedSkills.includes(skill.id) || skillPoints < skill.cost || linkedProgress < skill.questRequirement) return;
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
        setQuests((current) => [...current, { ...quest, id: `fate-${Date.now()}`, done: false, title: `${quest.rank} · ${quest.title}` }]);
        closeModal();
        navigate('quests');
        notify('Fate accepted. The quest is now on your daily path.');
    };

    const startDuel = (friend, stake) => {
        if (gold < stake) return;
        setGold((current) => current - stake);
        setDuel({ ...friend, stake, playerProgress: 0, completedQuestIds: [], startedAt: Date.now() });
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
        if (bossProgress <= 0) return;
        const nextProgress = Math.max(0, bossProgress - 8);
        setBossProgress(nextProgress);
        if (nextProgress === 0) {
            setDiamonds((current) => current + 1);
            awardRewards(1200, 800, 'Colossus defeated · +1,200 XP · +800 Gold · +1 Diamond');
        } else {
            awardRewards(150, 75, 'Boss trial logged · The Colossus weakens.');
        }
    };

    const secretCode = (code) => {
        if (session?.email !== 'arin@aura.app') return 'Invalid code';
        if (code === 'JAS777') {
            setDevMode(true);
            return 'Developer Mode enabled. Admin systems are now available.';
        }
        if (code === 'JAS666') {
            setDevMode(false);
            return 'Developer Mode disabled.';
        }
        return 'Invalid code';
    };

    const runAdminAction = (action) => {
        if (!devMode || session?.email !== 'arin@aura.app') return;
        if (action === 'convert') {
            if (gold < 100) {
                notify('You need at least 100 Gold to test conversion.', 'error');
                return;
            }
            setGold((current) => current - 100);
            setDiamonds((current) => current + 1);
            notify('Admin test · Converted 100 Gold into 1 Diamond.');
        } else if (action === 'xp') {
            awardRewards(XP_TO_LEVEL, 0, 'Admin test · 300 XP injected.');
        } else if (action === 'energy') {
            setEnergy(100);
            notify('Admin test · Sanctuary Energy refilled.');
        }
    };

    const selectCharacter = (id) => {
        const character = getCharacter(id);
        setActiveSkin(character.id);
        setPlayer((current) => ({ ...current, characterId: character.id, heroClass: character.heroClass }));
        notify(`${character.name} is now your active hero.`);
    };

    const toggleFocus = () => {
        if (focusRunning) {
            setFocusRunning(false);
            return;
        }
        if (energy < 10) {
            notify('You need at least 10 Energy to begin a Focus session.', 'error');
            return;
        }
        setFocusRunning(true);
    };
    const resetFocus = () => { setFocusRunning(false); setFocusSeconds(focusDuration); };
    const changeFocusDuration = (seconds) => { setFocusDuration(seconds); setFocusSeconds(seconds); setFocusRunning(false); };
    const attributes = {
        STR: 1 + level * 2,
        INT: 1 + level * 2,
        STA: 1 + level * 2,
        CHA: 1 + level,
    };
    const activeCharacter = getCharacter(player.characterId || activeSkin);
    const unread = notifications.filter((notification) => !notification.read).length;

    let content;
    switch (screen) {
        case 'skills': content = <SkillTreeScreen unlockedSkills={unlockedSkills} skillPoints={skillPoints} skillQuestProgress={skillQuestProgress} onUnlock={unlockSkill} />; break;
        case 'character': content = <CharacterScreen player={player} attributes={attributes} level={level} xp={xp} activeSkin={activeSkin} onSkinChange={selectCharacter} onOpenModal={openModal} />; break;
        case 'store': content = <StoreScreen gold={gold} diamonds={diamonds} inventory={inventory} onBuy={buyItem} onOpenModal={openModal} />; break;
        case 'social': content = <SocialScreen devMode={devMode} onSecretCode={secretCode} onAdminAction={runAdminAction} onGift={(friend) => { if (gold < 25) { notify('You need 25 Gold to send a gift.', 'error'); return; } setGold((current) => current - 25); notify(`A 25 Gold gift is on its way to ${friend.name}.`); }} onChallenge={(friend) => openModal('duel', friend)} />; break;
        case 'leaderboard': content = <LeaderboardScreen xp={xp} level={level} playerName={player.name} playerImage={activeCharacter.image} />; break;
        case 'focus': content = <FocusScreen focusSeconds={focusSeconds} focusDuration={focusDuration} focusSessions={focusSessions} focusMinutes={focusMinutes} streak={bestStreak} focusRunning={focusRunning} onToggle={toggleFocus} onReset={resetFocus} onDuration={changeFocusDuration} energy={energy} />; break;
        case 'duel': content = <PvpScreen duel={duel} player={player} level={level} hasAttackSpell={inventory.includes('p4')} onCastSpell={castAttackSpell} onNavigate={navigate} onClaim={() => { setGold((current) => current + duel.stake * 2); setDuel(null); notify(`Duel won · ${formatNumber(duel.stake * 2)} Gold added to your vault.`); navigate('social'); }} />; break;
        case 'notifications': content = <NotificationsScreen notifications={notifications} onMarkAllRead={() => setNotifications((current) => current.map((item) => ({ ...item, read: true })))} />; break;
        case 'settings': content = <SettingsScreen player={player} session={session} onLogout={logout} settings={settings} onSettingChange={(key, value) => setSettings((current) => ({ ...current, [key]: value }))} onOpenModal={openModal} />; break;
        default: content = <Dashboard player={player} attributes={attributes} streak={streak} penaltyGold={DAILY_PENALTY_GOLD[settings.penalty] || DAILY_PENALTY_GOLD.Standard} quests={quests} onToggleQuest={toggleQuest} onAddQuest={() => openModal('add-quest')} onNavigate={navigate} onOpenModal={openModal} level={level} xp={xp} bossProgress={bossProgress} deadline={deadline} focusSeconds={focusSeconds} focusRunning={focusRunning} onFocusToggle={toggleFocus} activeSkin={activeSkin} />;
    }

    if (!profileReady) {
        return <div className="aura-boot"><AuraMark size={48} /><strong>AURA</strong><span>PREPARING YOUR JOURNEY</span><i /></div>;
    }

    if (!session) {
        return <AuthScreen onAuthenticate={startSession} />;
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
                    <div className="sidebar-profile"><Avatar name={player.name} image={activeCharacter.image} size="small" /><div><strong>{player.name}</strong><span>Level {level} · {getRank(level)}</span></div><button className="icon-button" onClick={() => navigate('character')} aria-label="Open profile"><ChevronRight size={15} /></button></div>
                </div>
            </aside>

            <div className="app-shell">
                <header className="topbar">
                    <div className="topbar-left"><button className="mobile-menu icon-button" onClick={() => setSidebarOpen(true)} aria-label="Open navigation"><Menu size={21} /></button><div className="topbar-breadcrumb"><span>AURA</span><ChevronRight size={12} /><strong>{screenLabels[screen]}</strong></div></div>
                    <div className="topbar-right">
                        <div className="streak-chip" title={`${streak} day streak`}><Flame size={16} fill="currentColor" /><strong>{streak}</strong><span>day streak</span></div>
                        <div className="topbar-currencies"><Currency value={gold} />{devMode && <button className="convert-button" onClick={() => runAdminAction('convert')}>Convert</button>}<Currency type="diamonds" value={diamonds} /></div>
                        <div className="topbar-divider" />
                        <button className="icon-button notification-button" onClick={() => setNotificationsOpen((current) => !current)} aria-label={`${unread} unread notifications`}><Bell size={19} strokeWidth={1.6} />{unread > 0 && <span>{unread}</span>}</button>
                        <button className="topbar-avatar" onClick={() => navigate('character')} aria-label="Open character profile"><Avatar name={player.name} image={activeCharacter.image} size="small" /></button>
                    </div>
                </header>
                <main className="main-content">{content}</main>
            </div>

            {notificationsOpen && <><button className="notification-dismiss" aria-label="Close notifications" onClick={() => setNotificationsOpen(false)} /><section className="notification-popover"><div className="notification-popover-header"><div><span>SYSTEM MESSAGES</span><h2>Notifications</h2></div><button className="text-button" onClick={() => setNotifications((current) => current.map((item) => ({ ...item, read: true })))}>Mark all read</button></div><div className="notification-popover-list">{notifications.slice(0, 3).map((notification) => <button key={notification.id} className={!notification.read ? 'unread' : ''} onClick={() => navigate('notifications')}><span className={`notification-dot type-${notification.type}`} /><div><strong>{notification.title}</strong><p>{notification.description}</p><small>{notification.time}</small></div></button>)}</div><button className="notification-view-all" onClick={() => navigate('notifications')}>View all notifications <ArrowRight size={14} /></button></section></>}

            {initialOnboarding && <OnboardingExperience player={player} onSave={savePlayer} />}
            {modal === 'add-quest' && <AddQuestModal onClose={closeModal} onSubmit={addQuest} />}
            {modal === 'quest-detail' && <QuestDetailModal quest={quests.find((quest) => quest.id === modalData?.id) || modalData} onClose={closeModal} onToggle={toggleQuest} />}
            {modal === 'boss' && <BossModal progress={bossProgress} onClose={closeModal} onTrial={bossTrial} />}
            {modal === 'tarot' && <TarotModal gold={gold} level={level} onClose={closeModal} onSpend={spendForCard} onAccept={acceptTarot} />}
            {modal === 'duel' && <DuelModal player={player} friend={modalData} gold={gold} onClose={closeModal} onStart={startDuel} />}
            {modal === 'onboarding' && <OnboardingExperience player={player} onClose={closeModal} onSave={savePlayer} />}
            {modal === 'level-up' && <LevelUpModal level={level} onClose={closeModal} />}

            {toast && <div className={`toast toast-${toast.type}`} role="status" key={toast.id}><span>{toast.type === 'error' ? <CircleAlert size={18} /> : toast.type === 'neutral' ? <Bell size={18} /> : <Check size={18} />}</span><p>{toast.message}</p><button onClick={() => setToast(null)} aria-label="Dismiss notification"><X size={15} /></button></div>}
        </div>
    );
}
