'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import {
    ArrowRight,
    Bell,
    BookOpen,
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
    Pencil,
    Plus,
    Settings,
    Shield,
    Sparkles,
    Swords,
    Trash2,
    Trophy,
    UserRound,
    Users,
    X,
    Zap,
} from 'lucide-react';
import Dashboard from './aura/dashboard';
import QuestCodex from './aura/quest-codex';
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
} from './aura/screens';
import StoreScreen from './aura/store-screen';
import {
    getNextRandomQuestSlot,
    getNextRandomQuestSlotPrice,
    getRandomQuestSlotLimit,
    getWorkdayBaseline,
    getWorkdayPrice,
    getStoreItemName,
    MAX_RANDOM_QUEST_SLOTS,
    workdayStoreItems,
} from './aura/store-catalog';
import { initialQuests, skills as skillDefinitions, XP_TO_LEVEL, getRank } from './aura/data';
import { fateRanks, generateQuest, getFateRank, getRankProbabilities } from './aura/fate';
import { I18nProvider, LanguageSwitcher, translate, useI18n } from './aura/i18n';
import { localizeLifeQuest } from './aura/life-quests';
import QuestRankCard, { AuraCoverArtwork } from './aura/quest-card';
import QuestChainPanel from './aura/quest-chain';
import { Avatar, CategoryIcon, Currency, formatClock, formatNumber, Modal } from './aura/ui';
import {
    countActiveRandomQuests,
    createDailyQuest,
    createMonthlyQuest,
    createNewGame,
    createWeeklyQuest,
    DAILY_PENALTY_GOLD,
    defaultPlayer,
    defaultSettings,
    getPeriodKey,
    getQuestPeriod,
    isRandomQuest,
    localDayKey,
    localWeekKey,
    readSession,
    readStoredGame,
    resolveDailyProtection,
    secondsUntilMidnight,
    updatePeriodicQuests,
    withDailyQuest,
    writeSession,
    writeStoredGame,
} from './aura/game';

const navigation = [
    {
        id: 'journey',
        label: 'YOUR JOURNEY',
        items: [
            { id: 'quests', label: 'Quest dashboard', icon: LayoutDashboard },
            { id: 'codex', label: 'Quest Codex', icon: BookOpen },
            { id: 'skills', label: 'Skill tree', icon: Network },
            { id: 'character', label: 'Character', icon: UserRound },
            { id: 'store', label: 'Imperial Vault', icon: Gem },
            { id: 'focus', label: 'Focus Sanctuary', icon: Focus },
        ],
    },
    {
        id: 'circle',
        label: 'YOUR CIRCLE',
        items: [
            { id: 'social', label: 'Social hub', icon: Users },
            { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
            { id: 'duel', label: 'Duel arena', icon: Swords },
        ],
    },
];

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

function AddQuestModal({ onClose, onSubmit, initialPeriod = 'day', initialQuest = null }) {
    const { t } = useI18n();
    const [title, setTitle] = useState(initialQuest?.title || '');
    const [period, setPeriod] = useState(initialQuest ? getQuestPeriod(initialQuest) : initialPeriod);
    const [category, setCategory] = useState(initialQuest?.category || 'Physical');
    const [duration, setDuration] = useState(initialQuest?.duration || 30);
    const [difficulty, setDifficulty] = useState(initialQuest?.difficulty || 'Standard');
    const rewards = { Easy: [60, 40], Standard: [120, 80], Hard: [220, 150] };
    const submit = (event) => {
        event.preventDefault();
        if (!title.trim()) return;
        const [xp, gold] = rewards[difficulty];
        onSubmit({ title: title.trim(), category, duration: Number(duration), difficulty, xp, gold, period });
    };
    return (
        <Modal onClose={onClose} label={initialQuest ? t('goal.editTitle') : 'Create a new quest'} className="quest-form-modal">
            <div className="modal-heading"><span className="modal-heading-icon">{initialQuest ? <Pencil size={22} /> : <Plus size={22} />}</span><div className="eyebrow">{t(initialQuest ? 'goal.editEyebrow' : 'goal.newEyebrow')}</div><h2>{initialQuest ? t('goal.editTitle') : t('goal.createTitle', { period: t(`goal.${period}`) })}</h2><p>{t(initialQuest ? 'goal.editDescription' : 'goal.createDescription')}</p></div>
            <form onSubmit={submit} className="aura-form">
                <label><span>Quest name</span><input autoFocus value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Train for 30 minutes" required maxLength={60} /></label>
                <fieldset><legend>{t('goal.choosePeriod')}</legend><div className="goal-period-picker">{['day', 'week', 'month'].map((item) => <button type="button" key={item} className={period === item ? 'active' : ''} onClick={() => setPeriod(item)}>{t(`goal.${item}`)}</button>)}</div></fieldset>
                <fieldset><legend>Choose a path</legend><div className="category-picker">{['Physical', 'Mental', 'Religious', 'Psychological', 'SelfDevelopment', 'Social', 'Spiritual'].map((item) => <button type="button" key={item} className={category === item ? 'active' : ''} onClick={() => setCategory(item)}><CategoryIcon category={item} size={19} /><span>{t(`category.${item}`)}</span></button>)}</div></fieldset>
                <div className="form-row">
                    <label><span>Duration</span><div className="input-with-suffix"><input type="number" min="5" max="240" step="5" value={duration} onChange={(event) => setDuration(event.target.value)} /><small>minutes</small></div></label>
                    <label><span>Difficulty</span><select value={difficulty} onChange={(event) => setDifficulty(event.target.value)}><option>Easy</option><option>Standard</option><option>Hard</option></select></label>
                </div>
                <div className="quest-reward-preview"><span>COMPLETION REWARDS</span><div><strong>+{rewards[difficulty][0]} XP</strong><strong><Coins size={14} /> +{rewards[difficulty][1]} Gold</strong></div></div>
                <button className="button button-primary button-full" type="submit">{initialQuest ? <Check size={16} /> : <Plus size={16} />} {initialQuest ? t('goal.saveChanges') : t('goal.addToPeriod', { period: t(`goal.${period}`) })}</button>
            </form>
        </Modal>
    );
}

function QuestDetailModal({ quest, onClose, onToggle, onAddNext, onEdit, onDelete, level, quests = [] }) {
    const { t, language } = useI18n();
    const [confirmDelete, setConfirmDelete] = useState(false);
    if (!quest) return null;
    const acceptedSourceIds = quests.map((item) => item.sourceId || item.id).filter(Boolean);
    const completedSourceIds = quests.filter((item) => item.done).map((item) => item.sourceId || item.id).filter(Boolean);
    return (
        <Modal onClose={onClose} label={quest.title} className={`quest-detail-modal ${quest.rank ? `rank-reveal-${quest.rank.toLowerCase()}` : ''}`}>
            {quest.generatedArt || quest.sourceId ? <QuestRankCard quest={{ ...quest, text: quest.text || quest.title }} flippable /> : quest.image ? <div className="quest-detail-art"><Image src={quest.image} alt={`${quest.category} quest illustration`} width={640} height={400} unoptimized /></div> : <div className={`quest-detail-symbol category-${quest.category.toLowerCase()}`}><CategoryIcon category={quest.category} size={30} /></div>}
            <div className="eyebrow">{t(`category.${quest.category}`)} · {quest.rank ? t('quest.fate', { rank: quest.rank }) : t(`goal.${getQuestPeriod(quest)}`)}</div>
            <h2 dir="auto" lang={language}>{quest.title}</h2>
            <p dir="auto" lang={language}>{quest.description || t('goal.detailDescription')}</p>
            <QuestChainPanel quest={quest} onAddNext={onAddNext} level={level} completedSourceIds={completedSourceIds} acceptedSourceIds={acceptedSourceIds} />
            {quest.skillIds?.length > 0 && <div className="quest-skill-links" aria-label={t('codex.advances')}><span>{t('codex.advances')}</span><div>{quest.skillIds.map((id) => <strong key={id}>{t(`skill.${id}`)}</strong>)}</div></div>}
            {quest.skipped ? <div className="quest-detail-grid quest-rest-day-detail"><div><Check size={17} /><span>{t('dashboard.restDaySkip')}</span><strong>{t('quest.restDayNoPenalty')}</strong></div></div> : <div className="quest-detail-grid"><div><Clock3 size={17} /><span>{t('quest.estimatedTime')}</span><strong>{quest.duration} {t('common.minutesShort')}</strong></div><div><Sparkles size={17} /><span>{t('codex.experience')}</span><strong>+{formatNumber(quest.xp)} XP</strong></div><div><Coins size={17} /><span>{t('codex.goldReward')}</span><strong>+{formatNumber(quest.gold)} {t('common.gold')}</strong></div>{quest.diamonds > 0 && <div><Diamond size={17} /><span>{t('common.diamonds')}</span><strong>+{quest.diamonds}</strong></div>}</div>}
            <button className={`button button-full ${quest.done ? 'button-secondary' : 'button-primary'}`} onClick={() => { onToggle(quest.id); if (!quest.chainId) onClose(); }}>{quest.done ? <><X size={16} /> {t('quest.markIncomplete')}</> : <><Check size={16} /> {t('quest.markComplete')}</>}</button>
            {quest.questKind === 'custom' && !confirmDelete && <div className="goal-detail-actions">
                <button className="button button-secondary" onClick={() => onEdit(quest)}><Pencil size={15} /> {t('goal.edit')}</button>
                <button className="button button-ghost-danger" onClick={() => setConfirmDelete(true)}><Trash2 size={15} /> {t('goal.delete')}</button>
            </div>}
            {quest.questKind === 'custom' && confirmDelete && <div className="goal-delete-confirm" role="alert">
                <strong>{t('goal.deleteConfirm')}</strong>
                <p>{t('goal.deleteWarning')}</p>
                <div><button className="button button-secondary" onClick={() => setConfirmDelete(false)}>{t('common.cancel')}</button><button className="button button-danger" onClick={() => onDelete(quest)}><Trash2 size={15} /> {t('goal.deleteConfirmButton')}</button></div>
            </div>}
        </Modal>
    );
}

function StoreItemQuestModal({ item, quests, onClose, onSelect }) {
    const { t, language } = useI18n();
    const itemName = getStoreItemName(item, language);
    const availableQuests = quests.filter((quest) => !quest.done);
    return (
        <Modal onClose={onClose} label={itemName} className="store-quest-modal">
            <div className="modal-heading"><span className="modal-heading-icon"><Sparkles size={22} /></span><div className="eyebrow">{t(item.id === 'reward-rest-day' ? 'store.restEyebrow' : 'store.rerollEyebrow')}</div><h2>{itemName}</h2><p>{t(item.id === 'reward-rest-day' ? 'store.restDescription' : 'store.rerollDescription')}</p></div>
            <div className="store-quest-choices">
                {availableQuests.length ? availableQuests.map((quest) => (
                    <button type="button" className="store-quest-choice" key={quest.id} onClick={() => onSelect(quest)}>
                        <CategoryIcon category={quest.category} size={19} />
                        <div><strong dir="auto" lang={language}>{quest.title}</strong><span>{t(`category.${quest.category}`)} · {quest.duration} {t('common.minutesShort')} · {item.id === 'reward-rest-day' ? `0 XP / 0 ${t('common.gold')}` : `+${quest.xp} XP / +${quest.gold} ${t('common.gold')}`}</span></div>
                        <ChevronRight size={16} />
                    </button>
                )) : <div className="store-quest-empty"><Check size={22} /><strong>{t('store.noUnfinished')}</strong><p>{t('store.noQuestForItem')}</p></div>}
            </div>
        </Modal>
    );
}

function TarotModal({ gold, level, randomQuestCount = 0, randomQuestLimit = 3, onClose, onSpend, onAccept, reducedMotion = false }) {
    const { t, language } = useI18n();
    const [stage, setStage] = useState('choose');
    const [drawnQuest, setDrawnQuest] = useState(null);
    const [revealStep, setRevealStep] = useState(0);
    const timers = useRef([]);
    const probabilities = getRankProbabilities(level);
    const availableRanks = probabilities.filter((item) => item.chance > 0).map((item) => getFateRank(item.rank));
    const prices = availableRanks.map((item) => item.price);
    const minimumPrice = Math.min(...prices);
    const maximumPrice = Math.max(...prices);
    const revealedRank = getFateRank(drawnQuest?.rank || 'F');
    const slotsFull = randomQuestCount >= randomQuestLimit;
    useEffect(() => () => timers.current.forEach((timer) => clearTimeout(timer)), []);

    const draw = () => {
        if (slotsFull) return;
        const quest = generateQuest(level, Math.random, language);
        const rank = getFateRank(quest.rank);
        if (!onSpend(rank.price)) return;
        timers.current.forEach((timer) => clearTimeout(timer));
        timers.current = [];
        setDrawnQuest(quest);
        setRevealStep(0);
        setStage('drawing');
        const [characterAt, descriptionAt, completeAt] = reducedMotion ? [90, 180, 330] : [700, 1550, 2500];
        timers.current = [
            setTimeout(() => setRevealStep(1), characterAt),
            setTimeout(() => setRevealStep(2), descriptionAt),
            setTimeout(() => setStage('revealed'), completeAt),
        ];
    };

    const accept = () => onAccept({
        ...drawnQuest,
        sourceId: drawnQuest.id,
        title: drawnQuest.text,
    });

    return (
        <Modal onClose={onClose} label={t('fate.eyebrow')} className={`tarot-modal fate-generator-modal stage-${stage} reveal-step-${revealStep}`}>
            {stage === 'choose' && <>
                <div className="modal-heading tarot-heading"><span className="modal-heading-icon"><Sparkles size={22} /></span><div className="eyebrow">{t('fate.eyebrow')}</div><h2>{t('fate.title')}</h2><p>{t('fate.description')}</p></div>
                <div className="fate-level-status"><span>{t('fate.deck', { level })}</span><strong>{availableRanks.map((item) => item.rank).join(' · ')}</strong><small>{minimumPrice === maximumPrice ? `${formatNumber(minimumPrice)} ${t('fate.perDraw')}` : `${formatNumber(minimumPrice)}–${formatNumber(maximumPrice)} ${t('common.gold')}`}</small></div>
                <p className={`fate-slot-status ${slotsFull ? 'is-full' : ''}`}>{t('fate.randomSlots', { count: randomQuestCount, limit: randomQuestLimit })}</p>
                <p className="fate-reveal-hint">{t('fate.revealHint')}</p>
                <div className="fate-rank-grid" role="group" aria-label={t('fate.deck', { level })}>
                    {fateRanks.map((item, rankIndex) => {
                        const chance = probabilities.find((entry) => entry.rank === item.rank)?.chance || 0;
                        const displayChance = Number(chance.toFixed(1));
                        return (
                            <button type="button" key={item.rank} onClick={draw} disabled={!chance || slotsFull || gold < minimumPrice} className={`fate-rank-card fate-shape-${item.rank.toLowerCase()} ${chance ? 'is-unlocked' : 'is-unavailable'}`} style={{ '--rank-color': item.color }} aria-label={`${item.rank}, ${chance ? t('fate.chance', { chance: displayChance }) : t('fate.locked', { level: rankIndex * 10 })}`}>
                                <span className="fate-rank-cover"><AuraCoverArtwork /></span>
                                <strong>{item.rank} · {t(`rank.${item.rank}`)}</strong>
                                <small><Coins size={11} /> {formatNumber(item.price)}</small>
                                <em>{chance ? t('fate.chance', { chance: displayChance }) : t('fate.locked', { level: rankIndex * 10 })}</em>
                            </button>
                        );
                    })}
                </div>
                <button className="button button-primary button-full fate-draw-action" onClick={draw} disabled={slotsFull || gold < minimumPrice}>
                    <Sparkles size={16} /> {slotsFull ? t('fate.slotsFull') : gold < minimumPrice ? t('fate.needGold', { count: formatNumber(minimumPrice - gold) }) : `${t('fate.draw')} · ${formatNumber(minimumPrice)}${maximumPrice > minimumPrice ? `–${formatNumber(maximumPrice)}` : ''} ${t('common.gold')}`}
                </button>
                <p className="tarot-odds">{t('fate.odds')}</p>
                <p className="tarot-odds fate-value-note">{t('fate.valueNote')}</p>
            </>}
            {stage === 'drawing' && <div className={`tarot-drawing reveal-stage-${revealStep}`}>
                <QuestRankCard
                    quest={drawnQuest}
                    face={['cover', 'character', 'front'][revealStep]}
                    className="fate-reveal-sequence-card"
                />
                <h2>{revealStep === 0 ? t('fate.turning') : revealStep === 1 ? t('fate.revealCharacter') : t('fate.revealQuest')}</h2>
                <p>{revealStep === 0 ? t('fate.choosing') : revealStep === 1 ? t('fate.revealCharacterDescription') : t('fate.revealQuestDescription')}</p>
                <div className="fate-reveal-progress" aria-label={t('fate.revealHint')}><i className="active" /><i className={revealStep >= 1 ? 'active' : ''} /><i className={revealStep >= 2 ? 'active' : ''} /></div>
            </div>}
            {stage === 'revealed' && <div className={`tarot-revealed fate-quest-revealed rank-reveal-${drawnQuest.rank.toLowerCase()}`} style={{ '--rank-color': revealedRank.color }}>
                <QuestRankCard quest={drawnQuest} flippable className="fate-revealed-card" />
                <div className="eyebrow">{t('fate.yourQuest', { rank: drawnQuest.rank })}</div>
                <div className="fate-quest-category"><CategoryIcon category={drawnQuest.category} size={20} /><span>{t(`category.${drawnQuest.category}`)}</span></div>
                <h2 dir="auto" lang={language}>{drawnQuest.text}</h2>
                <p className="fate-quest-description" dir="auto" lang={language}>{drawnQuest.description}</p>
                <QuestChainPanel quest={drawnQuest} level={level} />
                <div className="quest-skill-links" aria-label={t('codex.advances')}><span>{t('codex.advances')}</span><div>{drawnQuest.skillIds.map((id) => <strong key={id}>{t(`skill.${id}`)}</strong>)}</div></div>
                <p className="fate-draw-note">{t('fate.drawnFrom', { level, price: formatNumber(revealedRank.price), reward: formatNumber(drawnQuest.gold), net: formatNumber(drawnQuest.gold - revealedRank.price) })}</p>
                <div className="revealed-rewards"><strong>+{formatNumber(drawnQuest.xp)} XP</strong><strong><Coins size={15} /> +{formatNumber(drawnQuest.gold)}</strong>{revealedRank.diamonds > 0 && <strong><Diamond size={14} /> +{revealedRank.diamonds}</strong>}</div>
                <button className="button button-primary button-full" onClick={accept}><Check size={16} /> {t('common.accept')}</button>
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
    const [goalPeriod, setGoalPeriod] = useState('day');
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
    const [customRewards, setCustomRewards] = useState([]);
    const [purchaseHistory, setPurchaseHistory] = useState([]);
    const [upgrades, setUpgrades] = useState({ questSlots: 0, goldCap: 0, secondChance: 0 });
    const [effects, setEffects] = useState({});
    const [dailyGoldEarned, setDailyGoldEarned] = useState(0);
    const [dailyGoldDay, setDailyGoldDay] = useState(localDayKey());
    const [secondChanceMonth, setSecondChanceMonth] = useState(null);
    const [activeSkin, setActiveSkin] = useState('kael');
    const [duel, setDuel] = useState(null);
    const [streak, setStreak] = useState(0);
    const [bestStreak, setBestStreak] = useState(0);
    const [lastCompletionDate, setLastCompletionDate] = useState(null);
    const [lastQuestDate, setLastQuestDate] = useState(null);
    const rolloverRef = useRef(null);
    const [devMode, setDevMode] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [modal, setModal] = useState(null);
    const [modalData, setModalData] = useState(null);
    const [toast, setToast] = useState(null);
    const [settings, setSettings] = useState(defaultSettings);
    const language = settings.language || 'en';
    const languageRef = useRef(language);
    const languageTouchedRef = useRef(false);
    languageRef.current = language;
    const t = useCallback((key, variables) => translate(language, key, variables), [language]);
    const onLanguageChange = useCallback((nextLanguage) => {
        languageTouchedRef.current = true;
        const dailyTitle = createDailyQuest(player, lastQuestDate, new Date(), nextLanguage).title;
        const weeklyTitle = createWeeklyQuest(new Date(), nextLanguage).title;
        const monthlyTitle = createMonthlyQuest(new Date(), nextLanguage).title;
        setSettings((current) => ({ ...current, language: nextLanguage }));
        setQuests((current) => current.map((quest) => {
            const localized = localizeLifeQuest(quest, nextLanguage);
            if (quest.generated && quest.questKind === 'goal' && quest.period === 'day') return { ...localized, title: dailyTitle };
            if (quest.generated && quest.questKind === 'goal' && quest.period === 'week') return { ...localized, title: weeklyTitle };
            if (quest.generated && quest.questKind === 'goal' && quest.period === 'month') return { ...localized, title: monthlyTitle };
            return localized;
        }));
    }, [player, lastQuestDate]);

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
        setQuests(Array.isArray(game.quests) ? game.quests.map((quest) => localizeLifeQuest(quest, game.settings?.language || languageRef.current)) : []);
        setLevel(game.level ?? 0);
        const savedXp = game.xp ?? 0;
        xpRef.current = savedXp;
        setXp(savedXp);
        setGold(game.gold ?? 100);
        setDiamonds(game.diamonds ?? 0);
        setEnergy(game.energy ?? 100);
        setSkillPoints(game.skillPoints ?? 0);
        setUnlockedSkills(game.unlockedSkills || ['discipline']);
        setSkillQuestProgress(game.skillQuestProgress || {});
        setInventory(game.inventory || []);
        setCustomRewards(game.customRewards || []);
        setPurchaseHistory(game.purchaseHistory || []);
        setUpgrades({ questSlots: 0, goldCap: 0, secondChance: 0, ...(game.upgrades || {}) });
        setEffects(game.effects || {});
        setDailyGoldEarned(game.dailyGoldDay === localDayKey() ? game.dailyGoldEarned || 0 : 0);
        setDailyGoldDay(localDayKey());
        setSecondChanceMonth(game.secondChanceMonth || null);
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
        setGoalPeriod('day');
        setModal(null);
        setModalData(null);
    }, []);

    const startSession = useCallback((auth) => {
        const email = auth.email.trim().toLowerCase();
        const stored = readStoredGame(email);
        const returningPlayer = Boolean(stored?.profileComplete);
        const game = returningPlayer ? withDailyQuest(stored) : createNewGame(auth);
        const selectedLanguage = languageTouchedRef.current ? languageRef.current : game.settings?.language || languageRef.current;
        restoreGame({ ...game, settings: { ...game.settings, language: selectedLanguage } });
        const nextSession = { email, provider: auth.provider };
        setSession(nextSession);
        writeSession(nextSession);
        setInitialOnboarding(!returningPlayer);
        setProfileReady(true);
        setToast(null);
    }, [restoreGame]);

    useEffect(() => {
        const direction = language === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = language;
        document.documentElement.dir = direction;
        return () => {
            document.documentElement.lang = 'en';
            document.documentElement.dir = 'ltr';
        };
    }, [language]);

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
            skillPoints,
            unlockedSkills,
            skillQuestProgress,
            inventory,
            customRewards,
            purchaseHistory,
            upgrades,
            effects,
            dailyGoldEarned,
            dailyGoldDay,
            secondChanceMonth,
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
    }, [session, profileReady, initialOnboarding, player, quests, level, xp, gold, diamonds, energy, skillPoints, unlockedSkills, skillQuestProgress, inventory, customRewards, purchaseHistory, upgrades, effects, dailyGoldEarned, dailyGoldDay, secondChanceMonth, activeSkin, duel, streak, bestStreak, lastCompletionDate, lastQuestDate, focusSessions, focusMinutes, notifications, settings]);

    useEffect(() => {
        const timer = setInterval(() => setDeadline(secondsUntilMidnight()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const isCalendarRollover = Boolean(lastQuestDate && lastQuestDate !== localDayKey());
        if ((deadline !== 0 && !isCalendarRollover) || !session || initialOnboarding) return undefined;
        const timer = window.setTimeout(() => {
            const today = localDayKey();
            if (lastQuestDate === today) {
                setDeadline(secondsUntilMidnight());
                return;
            }
            if (rolloverRef.current === today) return;
            rolloverRef.current = today;
            const periodic = updatePeriodicQuests({ player, quests, lastQuestDate, language });
            const dailyQuest = periodic.dailyQuest;
            const penalty = resolveDailyProtection({ quests: quests.filter((quest) => !['week', 'month'].includes(quest.period)), severity: settings.penalty, inventory, upgrades, secondChanceMonth });
            const isNewWeek = periodic.isNewWeek;
            if (penalty.incomplete) {
                setGold((current) => Math.max(0, current - penalty.gold));
                if (penalty.streakReset) setStreak(0);
                setInventory(penalty.inventory);
                setSecondChanceMonth(penalty.secondChanceMonth);
                setNotifications((current) => [{
                    id: `penalty-${today}`,
                    type: 'quest',
                    title: penalty.protection || 'Daily quest penalty',
                    description: penalty.protection
                        ? `${penalty.protection} protected your record. ${penalty.gold ? `${penalty.gold} Gold was deducted; your streak is safe.` : 'The Gold and streak penalty was canceled.'}`
                        : `${penalty.incomplete} ${penalty.incomplete === 1 ? 'quest was' : 'quests were'} left incomplete. A ${penalty.gold} Gold penalty was applied and your streak was reset.`,
                    time: 'Daily reset',
                    read: false,
                }, ...current]);
            }
            if (isNewWeek) {
                setFocusSessions(0);
                setFocusMinutes(0);
            }
            setQuests(periodic.quests);
            setLastQuestDate(today);
            setDailyGoldEarned(0);
            setDailyGoldDay(today);
            setDeadline(secondsUntilMidnight());
            notify(penalty.incomplete
                ? penalty.protection
                    ? `Daily reset · ${penalty.protection} activated${penalty.gold ? ` · −${penalty.gold} Gold` : ''}.`
                    : `Daily reset · −${penalty.gold} Gold and your streak was reset.`
                : `A new day begins. ${dailyQuest.title} is your new daily quest.`, penalty.incomplete && !penalty.protection ? 'error' : 'success');
        }, 0);
        return () => window.clearTimeout(timer);
    }, [deadline, session, initialOnboarding, player, lastQuestDate, quests, language, settings.penalty, inventory, upgrades, secondChanceMonth, notify]);

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
            const periodic = updatePeriodicQuests({ player: nextProfile, quests: [], lastQuestDate: null, language });
            setQuests(periodic.quests);
            setLastQuestDate(localDayKey());
        }
        setInitialOnboarding(false);
        closeModal();
        notify(isFirstLaunch ? t('goal.welcome', { name: profile.name }) : 'Your character record has been updated.');
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

    const workdayBaseline = getWorkdayBaseline();
    const randomQuestLimit = getRandomQuestSlotLimit(upgrades);
    const randomQuestCount = countActiveRandomQuests(quests);
    const dailyGoldCap = getWorkdayPrice(workdayBaseline, 200 + (upgrades.goldCap || 0) * 100);

    const toggleQuest = (id) => {
        const quest = quests.find((item) => item.id === id);
        if (!quest) return;
        if (quest.done && quest.skipped) {
            setQuests((current) => current.map((item) => item.id === id ? { ...item, done: false, skipped: false, awardedGold: undefined, awardedXp: undefined } : item));
            notify('Rest-day skip reversed. No rewards were changed.', 'neutral');
            return;
        }
        const changeSkillProgress = (direction) => {
            if (!quest.skillIds?.length) return;
            setSkillQuestProgress((current) => {
                const next = { ...current };
                for (const skillId of quest.skillIds) next[skillId] = Math.max(0, (next[skillId] || 0) + direction);
                return next;
            });
        };
        if (quest.done) {
            const awardedXp = quest.awardedXp ?? quest.xp;
            const awardedGold = quest.awardedGold ?? quest.gold;
            setQuests((current) => current.map((item) => item.id === id ? { ...item, done: false, awardedGold: undefined, awardedXp: undefined } : item));
            changeSkillProgress(-1);
            const next = Math.max(0, xpRef.current - awardedXp);
            xpRef.current = next;
            setXp(next);
            setGold((current) => Math.max(0, current - awardedGold));
            if (dailyGoldDay === localDayKey()) setDailyGoldEarned((current) => Math.max(0, current - awardedGold));
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
            const today = localDayKey();
            const earnedToday = dailyGoldDay === today ? dailyGoldEarned : 0;
            const xpMultiplier = (effects.xpBoostUntil || 0) > Date.now() ? 2 : 1;
            const goldMultiplier = effects.goldBoostDay === today ? 2 : 1;
            const awardedXp = quest.xp * xpMultiplier;
            const requestedGold = quest.gold * goldMultiplier;
            const awardedGold = Math.min(requestedGold, Math.max(0, dailyGoldCap - earnedToday));
            setQuests((current) => current.map((item) => item.id === id ? { ...item, done: true, skipped: false, awardedGold, awardedXp } : item));
            setDailyGoldDay(today);
            setDailyGoldEarned(earnedToday + awardedGold);
            changeSkillProgress(1);
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
            const capNote = awardedGold < requestedGold ? ' · daily Gold cap reached' : '';
            awardRewards(awardedXp, awardedGold, `Quest complete · +${awardedXp} XP · +${awardedGold} Gold${diamondReward}${capNote}`);
        }
    };

    const addQuest = (quest) => {
        const period = getQuestPeriod(quest);
        setQuests((current) => [...current, { ...quest, id: Date.now(), done: false, questKind: 'custom', period, periodKey: getPeriodKey(period) }]);
        setGoalPeriod(period);
        closeModal();
        notify(t('goal.addedNotification', { period: t(`goal.${period}`) }));
    };

    const editQuest = (updates) => {
        const original = modalData?.quest;
        if (!original || original.questKind !== 'custom') return;
        const period = getQuestPeriod(updates);
        setQuests((current) => current.map((quest) => quest.id === original.id ? { ...quest, ...updates, id: quest.id, done: quest.done, questKind: 'custom', period, periodKey: getPeriodKey(period) } : quest));
        setGoalPeriod(period);
        closeModal();
        notify(t('goal.updatedNotification'));
    };

    const deleteQuest = (quest) => {
        if (quest.questKind !== 'custom') return;
        setQuests((current) => current.filter((entry) => entry.id !== quest.id));
        closeModal();
        notify(t('goal.deletedNotification'), 'neutral');
    };

    const buyItem = (item) => {
        const today = localDayKey();
        const slotPurchase = item.id === 'upgrade-quest-slot';
        const nextSlot = slotPurchase ? getNextRandomQuestSlot(upgrades) : null;
        const price = slotPurchase ? getNextRandomQuestSlotPrice(upgrades) : getWorkdayPrice(workdayBaseline, item.percent);
        const permanent = item.category === 'cosmetics' || item.once;
        const boughtToday = purchaseHistory.filter((entry) => entry.day === today && entry.itemId === item.id).length;
        const itemName = getStoreItemName(item, language);
        if (slotPurchase && (nextSlot === null || price === null)) {
            notify(`Random quest slots are already at the ${MAX_RANDOM_QUEST_SLOTS}-slot maximum.`, 'neutral');
            return;
        }
        if (permanent && inventory.includes(item.id)) return;
        if (item.dailyLimit && boughtToday >= item.dailyLimit) {
            notify(`${itemName}: daily purchase limit reached (${item.dailyLimit}).`, 'error');
            return;
        }
        if (gold < price) {
            notify(`You need ${price - gold} more Gold for ${itemName}.`, 'error');
            return;
        }
        setGold((current) => current - price);
        setPurchaseHistory((current) => [...current, { id: `purchase-${Date.now()}`, itemId: item.id, day: today, price, percent: item.percent ?? null, slot: nextSlot || undefined, at: Date.now() }].slice(-200));
        if (['powerups', 'arena'].includes(item.category) || item.effect === 'select-quest' || permanent) {
            setInventory((current) => [...current, item.id]);
        }
        if (slotPurchase) setUpgrades((current) => ({ ...current, questSlots: Math.min(MAX_RANDOM_QUEST_SLOTS - 3, Math.max(0, current.questSlots || 0) + 1) }));
        if (item.id === 'upgrade-gold-cap') setUpgrades((current) => ({ ...current, goldCap: (current.goldCap || 0) + 1 }));
        if (item.id === 'upgrade-second-chance') setUpgrades((current) => ({ ...current, secondChance: 1 }));
        notify(`${itemName} · −${price} Gold (${slotPurchase ? `random slot ${nextSlot}/${MAX_RANDOM_QUEST_SLOTS}` : `${item.percent}% of a workday`}).`);
    };

    const useStoreItem = (item) => {
        if (!inventory.includes(item.id)) return;
        if (item.effect === 'select-quest') {
            openModal('store-item-quest', item);
            return;
        }
        const consume = () => setInventory((current) => {
            const next = [...current];
            const index = next.indexOf(item.id);
            if (index >= 0) next.splice(index, 1);
            return next;
        });
        if (item.effect === 'xp-boost') {
            consume();
            setEffects((current) => ({ ...current, xpBoostUntil: Date.now() + 3600000 }));
            notify('×2 quest XP activated for one hour.');
        } else if (item.effect === 'gold-boost') {
            consume();
            setEffects((current) => ({ ...current, goldBoostDay: localDayKey() }));
            notify('×2 quest Gold activated for the rest of today. Your daily cap still applies.');
        }
    };

    const applyStoreItemToQuest = (quest) => {
        const item = modalData;
        if (!item || !inventory.includes(item.id) || quest.done) return;
        if (item.id === 'power-reroll' && !isRandomQuest(quest) && randomQuestCount >= randomQuestLimit) {
            notify(`All ${randomQuestLimit} random quest slots are full. Complete a random quest or upgrade your slots first.`, 'error');
            return;
        }
        setInventory((current) => {
            const next = [...current];
            const index = next.indexOf(item.id);
            if (index >= 0) next.splice(index, 1);
            return next;
        });
        if (item.id === 'reward-rest-day') {
            setQuests((current) => current.map((entry) => entry.id === quest.id ? { ...entry, done: true, skipped: true, awardedGold: 0, awardedXp: 0 } : entry));
            notify(`Rest day used for “${quest.title}”. No penalty and no rewards.`);
        } else if (item.id === 'power-reroll') {
            const replacement = generateQuest(level, Math.random, language);
            setQuests((current) => current.map((entry) => entry.id === quest.id ? { ...replacement, sourceId: replacement.id, id: `reroll-${Date.now()}`, done: false, questKind: 'random', generated: entry.generated, generatedFor: entry.generatedFor, period: entry.period, periodKey: entry.periodKey, title: `${replacement.rank} · ${replacement.text}` } : entry));
            notify(`Quest rerolled into ${replacement.rank} rank.`);
        }
        closeModal();
        navigate('quests');
    };

    const addCustomReward = ({ name, percent }) => {
        setCustomRewards((current) => [...current, { id: `custom-reward-${Date.now()}`, category: 'rewards', percent, icon: 'gift', effect: 'redeem', custom: true, name, description: '' }]);
        notify(`Custom reward “${name}” saved at ${percent}% of a workday.`);
    };

    const deleteCustomReward = (id) => {
        setCustomRewards((current) => current.filter((item) => item.id !== id));
        notify('Custom reward removed.', 'neutral');
    };

    const unlockSkill = (skill) => {
        const linkedProgress = skillQuestProgress[skill.id] || 0;
        if (unlockedSkills.includes(skill.id) || skillPoints < skill.cost || linkedProgress < skill.questRequirement) return;
        setSkillPoints((current) => current - skill.cost);
        setUnlockedSkills((current) => [...current, skill.id]);
        notify(`${skill.name} unlocked in your constellation.`);
    };

    const spendForCard = (price) => {
        if (randomQuestCount >= randomQuestLimit) {
            notify(`All ${randomQuestLimit} random quest slots are full. Complete a random quest or upgrade your slots in the Vault.`, 'error');
            return false;
        }
        if (gold < price) {
            notify('Not enough Gold for this draw.', 'error');
            return false;
        }
        setGold((current) => current - price);
        return true;
    };

    const acceptTarot = (quest) => {
        if (randomQuestCount >= randomQuestLimit) {
            closeModal();
            notify(`All ${randomQuestLimit} random quest slots are full. Complete a random quest or upgrade your slots in the Vault.`, 'error');
            return;
        }
        setQuests((current) => [...current, { ...quest, id: `fate-${Date.now()}`, done: false, questKind: 'random', title: `${quest.rank} · ${quest.title}` }]);
        closeModal();
        navigate('quests');
        notify('Fate accepted. The quest is now on your daily path.');
    };

    const acceptChainQuest = (quest) => {
        const sourceId = quest.sourceId || quest.id;
        if (quests.some((item) => (item.sourceId || item.id) === sourceId)) {
            notify(t('chain.alreadyAdded'), 'neutral');
            return;
        }
        setQuests((current) => [...current, { ...quest, sourceId, id: `chain-${Date.now()}`, done: false, questKind: 'selected', title: `${quest.rank} · ${quest.text}` }]);
        closeModal();
        navigate('quests');
        notify(t('chain.addedNotification', { rank: quest.rank }));
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
    const equippedTitle = inventory.includes('cosmetic-title') ? getStoreItemName(workdayStoreItems.find((item) => item.id === 'cosmetic-title'), language) : '';
    const unread = notifications.filter((notification) => !notification.read).length;

    let content;
    switch (screen) {
        case 'codex': content = <QuestCodex onOpenModal={openModal} level={level} quests={quests} />; break;
        case 'skills': content = <SkillTreeScreen unlockedSkills={unlockedSkills} skillPoints={skillPoints} skillQuestProgress={skillQuestProgress} onUnlock={unlockSkill} />; break;
        case 'character': content = <CharacterScreen player={player} playerTitle={equippedTitle} attributes={attributes} level={level} xp={xp} activeSkin={activeSkin} onSkinChange={selectCharacter} onOpenModal={openModal} />; break;
        case 'store': content = <StoreScreen gold={gold} diamonds={diamonds} inventory={inventory} quests={quests} customRewards={customRewards} purchaseHistory={purchaseHistory} upgrades={upgrades} effects={effects} dailyGoldEarned={dailyGoldDay === localDayKey() ? dailyGoldEarned : 0} dailyGoldCap={dailyGoldCap} randomQuestLimit={randomQuestLimit} randomQuestCount={randomQuestCount} onBuy={buyItem} onUse={useStoreItem} onAddCustomReward={addCustomReward} onDeleteCustomReward={deleteCustomReward} onNavigate={navigate} />; break;
        case 'social': content = <SocialScreen devMode={devMode} onSecretCode={secretCode} onAdminAction={runAdminAction} onGift={(friend) => { if (gold < 25) { notify('You need 25 Gold to send a gift.', 'error'); return; } setGold((current) => current - 25); notify(`A 25 Gold gift is on its way to ${friend.name}.`); }} onChallenge={(friend) => openModal('duel', friend)} />; break;
        case 'leaderboard': content = <LeaderboardScreen xp={xp} level={level} playerName={player.name} playerImage={activeCharacter.image} />; break;
        case 'focus': content = <FocusScreen focusSeconds={focusSeconds} focusDuration={focusDuration} focusSessions={focusSessions} focusMinutes={focusMinutes} streak={bestStreak} focusRunning={focusRunning} onToggle={toggleFocus} onReset={resetFocus} onDuration={changeFocusDuration} energy={energy} />; break;
        case 'duel': content = <PvpScreen duel={duel} player={player} level={level} hasAttackSpell={inventory.includes('p4')} onCastSpell={castAttackSpell} onNavigate={navigate} onClaim={() => { setGold((current) => current + duel.stake * 2); setDuel(null); notify(`Duel won · ${formatNumber(duel.stake * 2)} Gold added to your vault.`); navigate('social'); }} />; break;
        case 'notifications': content = <NotificationsScreen notifications={notifications} onMarkAllRead={() => setNotifications((current) => current.map((item) => ({ ...item, read: true })))} />; break;
        case 'settings': content = <SettingsScreen player={player} session={session} onLogout={logout} settings={settings} onSettingChange={(key, value) => setSettings((current) => ({ ...current, [key]: value }))} onOpenModal={openModal} />; break;
        default: content = <Dashboard penaltyGold={DAILY_PENALTY_GOLD[settings.penalty] || DAILY_PENALTY_GOLD.Standard} quests={quests} activePeriod={goalPeriod} onPeriodChange={setGoalPeriod} onToggleQuest={toggleQuest} onAddQuest={(period = 'day') => openModal('add-quest', { period })} onNavigate={navigate} onOpenModal={openModal} deadline={deadline} focusSeconds={focusSeconds} focusRunning={focusRunning} onFocusToggle={toggleFocus} randomQuestLimit={randomQuestLimit} randomQuestCount={randomQuestCount} />;
    }

    if (!profileReady) {
        return <I18nProvider language={language} onLanguageChange={onLanguageChange}><div className="aura-boot"><AuraMark size={48} /><strong>AURA</strong><span>PREPARING YOUR JOURNEY</span><i /></div></I18nProvider>;
    }

    if (!session) {
        return <I18nProvider language={language} onLanguageChange={onLanguageChange}><AuthScreen onAuthenticate={startSession} /></I18nProvider>;
    }

    return (
        <I18nProvider language={language} onLanguageChange={onLanguageChange}>
        <div className={`aura-app ${settings.particles ? '' : 'no-particles'} ${settings.reducedMotion ? 'reduce-motion' : ''} ${inventory.includes('cosmetic-background') ? 'cosmetic-profile-background' : ''} ${inventory.includes('cosmetic-frame') ? 'cosmetic-avatar-frame' : ''} ${inventory.includes('cosmetic-theme') ? 'cosmetic-royal-theme' : ''} ${(initialOnboarding || modal === 'onboarding') ? 'onboarding-active' : ''}`}>
            <div className="ambient-grid" /><div className="ambient-glow" /><div className="ambient-particles"><i /><i /><i /><i /><i /><i /></div>
            {sidebarOpen && <button className="sidebar-dismiss" aria-label="Close navigation" onClick={() => setSidebarOpen(false)} />}
            <aside className={`sidebar ${sidebarOpen ? 'is-open' : ''}`}>
                <button className="brand" onClick={() => navigate('quests')} aria-label="Aura dashboard"><AuraMark /><span><strong>AURA</strong><small>REAL-LIFE RPG</small></span></button>
                <button className="sidebar-close icon-button" onClick={() => setSidebarOpen(false)} aria-label="Close menu"><X size={18} /></button>
                <nav className="sidebar-nav" aria-label="Main navigation">
                    {navigation.map((group) => <div className="nav-group" key={group.id}><span className="nav-group-label">{t(`nav.${group.id}`)}</span>{group.items.map((item) => { const Icon = item.icon; return <button key={item.id} className={`nav-item ${screen === item.id ? 'active' : ''}`} onClick={() => navigate(item.id)}><Icon size={18} strokeWidth={1.6} /><span>{t(`nav.${item.id}`)}</span>{item.id === 'duel' && duel && <i className="nav-live-dot" />}</button>; })}</div>)}
                </nav>
                <div className="sidebar-bottom">
                    <button className="sidebar-fate-card" onClick={() => openModal('tarot')}><span className="fate-icon"><Sparkles size={19} /></span><span><strong>{t('common.drawCard')}</strong><small>{t('dashboard.drawMystery')}</small></span><ChevronRight size={15} /></button>
                    <button className={`nav-item ${screen === 'settings' ? 'active' : ''}`} onClick={() => navigate('settings')}><Settings size={18} strokeWidth={1.6} /><span>{t('nav.settings')}</span></button>
                    <div className="sidebar-profile"><Avatar name={player.name} image={activeCharacter.image} size="small" /><div><strong>{player.name}</strong><span>{t('common.level')} {level} · {getRank(level)}</span></div><button className="icon-button" onClick={() => navigate('character')} aria-label="Open profile"><ChevronRight size={15} /></button></div>
                </div>
            </aside>

            <div className="app-shell">
                <header className="topbar">
                    <div className="topbar-left"><button className="mobile-menu icon-button" onClick={() => setSidebarOpen(true)} aria-label="Open navigation"><Menu size={21} /></button><div className="topbar-breadcrumb"><span>AURA</span><ChevronRight size={12} /><strong>{t(`nav.${screen}`)}</strong></div></div>
                    <div className="topbar-right">
                        <LanguageSwitcher compact />
                        <div className="streak-chip" title={`${streak} ${t('common.dayStreak')}`}><Flame size={16} fill="currentColor" /><strong>{streak}</strong><span>{t('common.dayStreak')}</span></div>
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
            {modal === 'add-quest' && <AddQuestModal initialPeriod={modalData?.period || 'day'} initialQuest={modalData?.quest || null} onClose={closeModal} onSubmit={modalData?.quest ? editQuest : addQuest} />}
            {modal === 'quest-detail' && <QuestDetailModal quest={quests.find((quest) => quest.id === modalData?.id) || modalData} onClose={closeModal} onToggle={toggleQuest} onAddNext={acceptChainQuest} onEdit={(entry) => openModal('add-quest', { period: getQuestPeriod(entry), quest: entry })} onDelete={deleteQuest} level={level} quests={quests} />}
            {modal === 'store-item-quest' && modalData && <StoreItemQuestModal item={modalData} quests={quests} onClose={closeModal} onSelect={applyStoreItemToQuest} />}
            {modal === 'tarot' && <TarotModal gold={gold} level={level} randomQuestCount={randomQuestCount} randomQuestLimit={randomQuestLimit} onClose={closeModal} onSpend={spendForCard} onAccept={acceptTarot} reducedMotion={settings.reducedMotion} />}
            {modal === 'duel' && <DuelModal player={player} friend={modalData} gold={gold} onClose={closeModal} onStart={startDuel} />}
            {modal === 'onboarding' && <OnboardingExperience player={player} onClose={closeModal} onSave={savePlayer} />}
            {modal === 'level-up' && <LevelUpModal level={level} onClose={closeModal} />}

            {toast && <div className={`toast toast-${toast.type}`} role="status" key={toast.id}><span>{toast.type === 'error' ? <CircleAlert size={18} /> : toast.type === 'neutral' ? <Bell size={18} /> : <Check size={18} />}</span><p>{toast.message}</p><button onClick={() => setToast(null)} aria-label="Dismiss notification"><X size={15} /></button></div>}
        </div>
        </I18nProvider>
    );
}
