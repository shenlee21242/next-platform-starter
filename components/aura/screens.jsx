'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import {
    ArrowLeft,
    ArrowRight,
    Award,
    Bell,
    BookOpen,
    Brain,
    Check,
    ChevronRight,
    CircleHelp,
    Clock3,
    Coins,
    Crown,
    Diamond,
    Dumbbell,
    Flame,
    FlaskConical,
    Focus,
    GalleryVerticalEnd,
    Gift,
    Heart,
    LockKeyhole,
    Mail,
    Medal,
    MoonStar,
    MoreHorizontal,
    Pause,
    Play,
    Plus,
    RotateCcw,
    Scan,
    Search,
    Settings2,
    Shield,
    ShieldCheck,
    Shirt,
    Snowflake,
    Sparkles,
    Swords,
    Trophy,
    UserPlus,
    Users,
    WandSparkles,
    Zap,
} from 'lucide-react';
import { friends, skills, storeItems, XP_TO_LEVEL, getRank } from './data';
import { characters, getCharacter } from './characters';
import CharacterLoreModal from './character-lore';
import CharacterRoster from './character-roster';
import {
    Avatar,
    CategoryIcon,
    Currency,
    EmptyState,
    formatNumber,
    formatShortClock,
    PanelTitle,
    ProgressBar,
    ScreenHeader,
} from './ui';

const skillIcons = {
    center: Sparkles,
    physical: Dumbbell,
    mental: Focus,
    gold: Coins,
    energy: Zap,
    spiritual: MoonStar,
    swift: Swords,
    mind: Brain,
};

export function SkillTreeScreen({ unlockedSkills, skillPoints, skillQuestProgress = {}, onUnlock }) {
    const [selectedId, setSelectedId] = useState('iron-body');
    const selected = skills.find((skill) => skill.id === selectedId);
    const SelectedIcon = skillIcons[selected.icon];
    const isUnlocked = unlockedSkills.includes(selected.id);
    const linkedProgress = skillQuestProgress[selected.id] || 0;
    const questRequirement = selected.questRequirement || 0;
    const hasQuestRequirement = linkedProgress >= questRequirement;
    const canUnlock = !isUnlocked && skillPoints >= selected.cost && hasQuestRequirement;

    return (
        <div className="screen">
            <ScreenHeader eyebrow="YOUR INNER CONSTELLATION" title="Skill tree" description="Shape your strengths. Every real-world victory leaves a mark.">
                <div className="skill-points-chip"><Sparkles size={16} /><span><strong>{skillPoints}</strong> skill points available</span></div>
            </ScreenHeader>
            <div className="skill-layout">
                <section className="panel constellation-panel">
                    <div className="constellation-legend"><span><i className="legend-dot cyan" /> Permanent</span><span><i className="legend-dot gold" /> Active</span></div>
                    <div className="constellation-map">
                        <div className="constellation-orbit orbit-one" />
                        <div className="constellation-orbit orbit-two" />
                        <svg className="constellation-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                            {skills.slice(1).map((skill) => (
                                <line key={skill.id} x1="50" y1="50" x2={skill.x} y2={skill.y} className={unlockedSkills.includes(skill.id) ? 'line-unlocked' : ''} />
                            ))}
                            <line x1="50" y1="15" x2="79" y2="28" />
                            <line x1="79" y1="28" x2="85" y2="61" />
                            <line x1="85" y1="61" x2="65" y2="85" />
                            <line x1="65" y1="85" x2="35" y2="85" />
                            <line x1="35" y1="85" x2="15" y2="61" />
                            <line x1="15" y1="61" x2="21" y2="28" />
                            <line x1="21" y1="28" x2="50" y2="15" />
                        </svg>
                        {skills.map((skill) => {
                            const Icon = skillIcons[skill.icon];
                            const unlocked = unlockedSkills.includes(skill.id);
                            return (
                                <button
                                    key={skill.id}
                                    className={`skill-node ${skill.id === 'discipline' ? 'skill-center' : ''} ${unlocked ? 'is-unlocked' : ''} ${selectedId === skill.id ? 'is-selected' : ''} ${skill.type === 'Active' ? 'is-active-skill' : ''}`}
                                    style={{ left: `${skill.x}%`, top: `${skill.y}%` }}
                                    onClick={() => setSelectedId(skill.id)}
                                    aria-label={`${skill.name}, ${unlocked ? 'unlocked' : 'locked'}`}
                                >
                                    <span className="skill-node-circle">{unlocked ? <Icon size={skill.id === 'discipline' ? 28 : 21} strokeWidth={1.5} /> : <LockKeyhole size={18} strokeWidth={1.5} />}</span>
                                    <span className="skill-node-name">{skill.name}</span>
                                </button>
                            );
                        })}
                    </div>
                </section>
                <aside className="panel skill-detail-panel">
                    <span className={`skill-detail-icon ${selected.type === 'Active' ? 'gold' : ''}`}><SelectedIcon size={29} strokeWidth={1.35} /></span>
                    <div className="eyebrow">{selected.type} SKILL</div>
                    <h2>{selected.name}</h2>
                    <p>{selected.description}</p>
                    <div className="skill-detail-stats">
                        <div><span>Current tier</span><strong>{isUnlocked ? 'I' : '—'}</strong></div>
                        <div><span>Next tier</span><strong>{isUnlocked ? 'II' : 'I'}</strong></div>
                    </div>
                    {questRequirement > 0 && <div className="skill-quest-requirement">
                        <div><span>Linked Fate quests</span><strong>{Math.min(linkedProgress, questRequirement)} / {questRequirement}</strong></div>
                        <ProgressBar value={Math.min(linkedProgress, questRequirement)} max={questRequirement} />
                        <small>{hasQuestRequirement ? 'Quest milestone complete' : `${questRequirement - linkedProgress} more linked ${questRequirement - linkedProgress === 1 ? 'quest' : 'quests'} required`}</small>
                    </div>}
                    <div className="skill-requirement">
                        <span>Upgrade cost</span>
                        <strong><Sparkles size={15} /> {selected.cost} SP</strong>
                    </div>
                    <button
                        className={`button ${isUnlocked ? 'button-secondary' : 'button-primary'} button-full`}
                        disabled={!canUnlock}
                        onClick={() => onUnlock(selected)}
                    >
                        {isUnlocked ? <><Check size={16} /> Skill unlocked</> : !hasQuestRequirement ? `Complete ${questRequirement - linkedProgress} more linked ${questRequirement - linkedProgress === 1 ? 'quest' : 'quests'}` : skillPoints < selected.cost ? `Need ${selected.cost} skill points` : <><LockKeyhole size={16} /> Unlock skill</>}
                    </button>
                    <small className="skill-detail-note"><CircleHelp size={13} /> Generated quests show their linked skills. Complete them to unlock this milestone; SP is earned through levels.</small>
                </aside>
            </div>
        </div>
    );
}

export function CharacterScreen({ level, xp, activeSkin, onSkinChange, onOpenModal, player, attributes }) {
    const [storyCharacter, setStoryCharacter] = useState(null);
    const activeCharacter = getCharacter(player.characterId || activeSkin);

    return (
        <div className="screen">
            <ScreenHeader eyebrow="THE PERSON BEHIND THE PROGRESS" title="Character profile" description="Your real life, reflected in your legend.">
                <button className="button button-secondary" onClick={() => onOpenModal('onboarding')}><Settings2 size={16} /> Edit character</button>
            </ScreenHeader>
            <div className="profile-layout">
                <button type="button" className={`profile-hero panel skin-${activeCharacter.id}`} onClick={() => setStoryCharacter(activeCharacter)} aria-label={`Read ${activeCharacter.name}'s backstory`}>
                    <Image src={activeCharacter.image} alt={`${activeCharacter.name}, ${activeCharacter.title}`} fill sizes="(max-width: 800px) 100vw, 40vw" />
                    <div className="profile-hero-gradient" />
                    <div className="profile-level"><span>LEVEL</span><strong>{level}</strong></div>
                    <span className="profile-lore-hint"><BookOpen size={14} /> Read backstory</span>
                    <div className="profile-hero-copy">
                        <span>{activeCharacter.heroClass.toUpperCase()}</span>
                        <h2>{player.name}</h2>
                        <small>{activeCharacter.name} · {activeCharacter.title}</small>
                        <p>“{activeCharacter.quote}”</p>
                    </div>
                </button>
                <section className="profile-stats-column">
                    <div className="panel profile-progress-card">
                        <PanelTitle title="Level progression" meta={`Rank · ${getRank(level)}`} />
                        <div className="profile-xp-number"><strong>{formatNumber(xp)}</strong><span>/ {formatNumber(XP_TO_LEVEL)} XP</span></div>
                        <ProgressBar value={xp} max={XP_TO_LEVEL} />
                        <p><Sparkles size={14} /> {formatNumber(Math.max(0, XP_TO_LEVEL - xp))} XP until your next level</p>
                    </div>
                    <div className="attribute-cards">
                        {[['STR', 'Strength', attributes.STR, Dumbbell, 'Grows with your level'], ['INT', 'Intelligence', attributes.INT, Brain, 'Grows with your level'], ['STA', 'Stamina', attributes.STA, Heart, 'Grows with your level'], ['CHA', 'Charisma', attributes.CHA, Users, 'Grows with your level']].map(([abbr, name, value, Icon, change]) => (
                            <div className="panel attribute-card" key={abbr}>
                                <div><Icon size={19} strokeWidth={1.5} /><span>{abbr}</span></div>
                                <strong>{value}</strong>
                                <span>{name}</span>
                                <small>{change}</small>
                            </div>
                        ))}
                    </div>
                    <div className="panel physical-stats-card">
                        <PanelTitle title="Physical record" />
                        <div><span>Age</span><strong>{player.age} years</strong></div>
                        <div><span>Height</span><strong>{player.height} cm</strong></div>
                        <div><span>Weight</span><strong>{player.weight} kg</strong></div>
                        <div><span>Status</span><strong className="status-ready"><i /> Ready for battle</strong></div>
                    </div>
                </section>
            </div>
            <section className="panel skins-panel">
                <PanelTitle title="Hero collection" meta={`${characters.length} heroes · 4 classes`} eyebrow="CHOOSE YOUR CHARACTER" />
                <p className="hero-gallery-note">Tap any portrait to discover the person behind the armor.</p>
                <CharacterRoster selectedId={activeCharacter.id} onSelect={onSkinChange} onReadStory={setStoryCharacter} />
            </section>
            {storyCharacter && <CharacterLoreModal character={storyCharacter} selected={storyCharacter.id === activeCharacter.id} onClose={() => setStoryCharacter(null)} onSelect={(character) => onSkinChange(character.id)} />}
        </div>
    );
}

const storeIcons = {
    armor: Shield,
    cloak: Shirt,
    frame: Scan,
    potion: FlaskConical,
    elixir: Zap,
    freeze: Snowflake,
    spell: WandSparkles,
    card: GalleryVerticalEnd,
};

export function StoreScreen({ gold, diamonds, inventory, onBuy, onOpenModal }) {
    const [tab, setTab] = useState('Cosmetics');
    const visibleItems = storeItems.filter((item) => item.category === tab);
    return (
        <div className="screen">
            <ScreenHeader eyebrow="RELICS FOR THE RELENTLESS" title="Imperial Vault" description="Earned in the real world. Spent on your legend.">
                <div className="store-balances"><Currency value={gold} /><Currency type="diamonds" value={diamonds} /></div>
            </ScreenHeader>
            <div className="store-tabs" role="tablist">
                {['Cosmetics', 'Consumables', 'Cards'].map((item) => <button role="tab" aria-selected={tab === item} className={tab === item ? 'active' : ''} onClick={() => setTab(item)} key={item}>{item}</button>)}
            </div>
            <div className="store-grid">
                {visibleItems.map((item) => {
                    const Icon = storeIcons[item.icon];
                    const owned = inventory.includes(item.id);
                    return (
                        <article className={`store-item panel tone-${item.tone}`} key={item.id}>
                            <div className="store-item-art">
                                <span className="store-rarity">{item.rarity}</span>
                                <div className="store-art-orbit" />
                                <Icon size={60} strokeWidth={1.05} />
                            </div>
                            <div className="store-item-copy"><h3>{item.name}</h3><p>{item.description}</p></div>
                            <div className="store-item-bottom">
                                <span className={`store-price price-${item.currency}`}>{item.currency === 'gold' ? <Coins size={16} /> : <Diamond size={15} />}<strong>{formatNumber(item.price)}</strong></span>
                                <button className={`button ${owned ? 'button-secondary' : 'button-primary'} button-small`} onClick={() => item.category === 'Cards' && !owned ? onOpenModal('tarot') : onBuy(item)} disabled={owned}>
                                    {owned ? <><Check size={14} /> Owned</> : item.category === 'Cards' ? 'Draw card' : 'Acquire'}
                                </button>
                            </div>
                        </article>
                    );
                })}
            </div>
            <div className="vault-note"><ShieldCheck size={16} /><span>Every item is earned through your journey. Diamonds cannot be purchased with Gold.</span></div>
        </div>
    );
}

export function SocialScreen({ onGift, onChallenge, onSecretCode, onAdminAction, devMode }) {
    const [query, setQuery] = useState('');
    const [searchMessage, setSearchMessage] = useState('');
    const filtered = friends.filter((friend) => `${friend.name} ${friend.handle}`.toLowerCase().includes(query.toLowerCase()));
    const submitSearch = (event) => {
        event.preventDefault();
        if (query.trim().toUpperCase() === 'JAS777' || query.trim().toUpperCase() === 'JAS666') {
            const result = onSecretCode(query.trim().toUpperCase());
            setSearchMessage(result);
            setQuery('');
        }
    };
    return (
        <div className="screen">
            <ScreenHeader eyebrow="NO ONE CONQUERS ALONE" title="Social hub" description="Build your circle. Challenge each other to rise.">
                <button className="button button-primary" onClick={() => document.getElementById('friend-search')?.focus()}><UserPlus size={16} /> Add friend</button>
            </ScreenHeader>
            <form className="friend-search" onSubmit={submitSearch}>
                <Search size={18} />
                <input id="friend-search" value={query} onChange={(event) => { setQuery(event.target.value); setSearchMessage(''); }} placeholder="Search by name or Aura ID…" aria-label="Search friends" />
                {query && <button type="submit" className="button button-secondary button-small">Search</button>}
            </form>
            {searchMessage && <div className={`inline-message ${devMode ? 'success' : ''}`}><Sparkles size={15} />{searchMessage}</div>}
            {devMode && (
                <section className="panel developer-tools" aria-label="Developer systems">
                    <div><span>REGISTERED ADMIN</span><strong>Developer systems</strong><p>Discreet tools for testing this device-local preview.</p></div>
                    <div className="developer-actions">
                        <button className="button button-secondary button-small" onClick={() => onAdminAction('convert')}><Coins size={14} /> 100 Gold → 1 Diamond</button>
                        <button className="button button-secondary button-small" onClick={() => onAdminAction('xp')}><Sparkles size={14} /> Inject 300 XP</button>
                        <button className="button button-secondary button-small" onClick={() => onAdminAction('energy')}><Zap size={14} /> Refill Energy</button>
                    </div>
                </section>
            )}
            <div className="social-layout">
                <section className="panel friends-panel">
                    <PanelTitle title="Your companions" meta={`${friends.length} friends`} />
                    <div className="friends-list">
                        {filtered.length ? filtered.map((friend) => (
                            <article className="friend-row" key={friend.id}>
                                <Avatar {...friend} online={friend.online} />
                                <div className="friend-info"><h3>{friend.name}<span>LVL {friend.level}</span></h3><p>{friend.status}</p></div>
                                <div className="friend-actions">
                                    <button className="icon-button" onClick={() => onGift(friend)} title={`Send ${friend.name} a gift`} aria-label={`Gift ${friend.name}`}><Gift size={17} /></button>
                                    <button className="button button-secondary button-small" onClick={() => onChallenge(friend)}><Swords size={14} /> Duel</button>
                                </div>
                            </article>
                        )) : <EmptyState icon={<Users size={25} />} title="No companions found" description="Try a different name or Aura ID. Your next ally may be one search away." />}
                    </div>
                </section>
                <aside className="social-side">
                    <section className="panel social-streak-card">
                        <span className="social-streak-icon"><Flame size={25} /></span>
                        <div><span>YOUR CIRCLE’S STREAK</span><strong>18 days</strong><p>Your longest shared streak with Omar.</p></div>
                    </section>
                    <section className="panel social-invite-card">
                        <Mail size={25} strokeWidth={1.3} />
                        <h3>Grow your guild</h3>
                        <p>Invite someone who keeps you accountable.</p>
                        <button className="button button-secondary button-full" onClick={() => { navigator.clipboard?.writeText('https://aura.app/invite/arin'); }}>Copy invite link</button>
                    </section>
                </aside>
            </div>
        </div>
    );
}

export function LeaderboardScreen({ xp, level, playerName, playerImage }) {
    const [period, setPeriod] = useState('Weekly');
    const totalXp = level * XP_TO_LEVEL + xp;
    const players = useMemo(() => {
        const multiplier = period === 'Weekly' ? 1 : period === 'Monthly' ? 3.7 : 14.2;
        return [
            ...friends.filter((friend) => friend.id !== 3).map((friend) => ({ ...friend, score: Math.round(friend.xp * multiplier) })),
            { id: 'you', name: playerName, handle: '@arin', level, xp: totalXp, score: Math.round(totalXp * multiplier), initials: playerName.slice(0, 2).toUpperCase(), color: '#66543b', online: true },
        ].sort((a, b) => b.score - a.score);
    }, [period, totalXp, level, playerName]);
    const podium = [players[1], players[0], players[2]];
    return (
        <div className="screen">
            <ScreenHeader eyebrow="FRIENDS, NOT STRANGERS" title="Leaderboard" description="A little rivalry. A lot of growth.">
                <div className="segmented-control">{['Weekly', 'Monthly', 'Yearly'].map((item) => <button className={period === item ? 'active' : ''} onClick={() => setPeriod(item)} key={item}>{item}</button>)}</div>
            </ScreenHeader>
            <section className="panel leaderboard-podium-panel">
                <div className="podium-glow" />
                <div className="podium">
                    {podium.map((player, index) => {
                        const rank = [2, 1, 3][index];
                        return (
                            <div className={`podium-player podium-rank-${rank}`} key={player.id}>
                                {rank === 1 && <Crown className="podium-crown" size={26} strokeWidth={1.3} />}
                                <Avatar {...player} size={rank === 1 ? 'large' : 'medium'} image={player.id === 'you' ? playerImage : false} />
                                <h3>{player.name}</h3><span>Level {player.level}</span><strong>{formatNumber(player.score)} <small>XP</small></strong>
                                <div className="podium-base"><i>{rank}</i></div>
                            </div>
                        );
                    })}
                </div>
            </section>
            <section className="panel ranking-list-panel">
                <div className="ranking-list-header"><span>RANK</span><span>CHALLENGER</span><span>LEVEL</span><span>TOTAL XP</span></div>
                {players.map((player, index) => (
                    <div className={`ranking-row ${player.id === 'you' ? 'is-you' : ''}`} key={player.id}>
                        <span className="ranking-number">{index + 1 <= 3 ? <Medal size={19} /> : index + 1}</span>
                        <div className="ranking-person"><Avatar {...player} size="small" image={player.id === 'you' ? playerImage : false} /><strong>{player.name}{player.id === 'you' && <small>YOU</small>}</strong></div>
                        <span>{player.level}</span><strong>{formatNumber(player.score)} XP</strong>
                    </div>
                ))}
            </section>
        </div>
    );
}

export function FocusScreen({ focusSeconds, focusDuration, focusRunning, onToggle, onReset, onDuration, energy, focusSessions, focusMinutes, streak }) {
    const progress = 1 - focusSeconds / focusDuration;
    const needsEnergy = !focusRunning && energy < 10;
    return (
        <div className="screen focus-screen">
            <ScreenHeader eyebrow="A QUIET PLACE IN A LOUD WORLD" title="Focus Sanctuary" description="One session. One intention. Nothing else." />
            <div className="focus-layout">
                <section className="panel focus-timer-panel">
                    <div className="focus-mode-tabs">{[[25, 'Deep work'], [15, 'Light focus'], [5, 'Short break']].map(([minutes, label]) => <button key={minutes} className={focusDuration === minutes * 60 ? 'active' : ''} onClick={() => onDuration(minutes * 60)} disabled={focusRunning}>{label}</button>)}</div>
                    <div className={`focus-ring ${focusRunning ? 'is-running' : ''}`} style={{ '--timer-progress': `${progress * 360}deg` }}>
                        <div className="focus-ring-inner">
                            <span>{focusRunning ? 'SANCTUARY ACTIVE' : 'READY WHEN YOU ARE'}</span>
                            <strong>{formatShortClock(focusSeconds)}</strong>
                            <small>{focusRunning ? 'Stay with the moment.' : 'Your next victory starts here.'}</small>
                        </div>
                    </div>
                    <div className="focus-controls">
                        <button className="icon-button focus-reset" onClick={onReset} aria-label="Reset timer"><RotateCcw size={19} /></button>
                        <button className="focus-main-button" onClick={onToggle} disabled={needsEnergy}>{focusRunning ? <Pause size={21} fill="currentColor" /> : needsEnergy ? <Zap size={21} /> : <Play size={21} fill="currentColor" />}{focusRunning ? 'Pause session' : needsEnergy ? 'Need 10 Energy' : 'Begin focus'}</button>
                        <span className="focus-control-spacer" />
                    </div>
                    <p className="focus-energy-cost"><Zap size={14} /> A completed session uses 10 Energy and earns 150 XP.</p>
                </section>
                <aside className="focus-side-column">
                    <section className="panel energy-card">
                        <PanelTitle title="Your energy" meta={`${energy}/100`} />
                        <div className="energy-visual"><Zap size={28} fill="currentColor" /><strong>{energy}<small>%</small></strong></div>
                        <ProgressBar value={energy} tone="cyan" />
                        <p>{energy >= 10 ? 'You’re ready for a deep work session.' : 'You need 10 Energy. Rest or use an Energy Potion to recover.'}</p>
                    </section>
                    <section className="panel focus-stats-card">
                        <PanelTitle title="This week" />
                        <div><span><Focus size={16} /> Focus time</span><strong>{Math.floor(focusMinutes / 60)}h {focusMinutes % 60}m</strong></div>
                        <div><span><Check size={16} /> Sessions</span><strong>{focusSessions}</strong></div>
                        <div><span><Flame size={16} /> Best streak</span><strong>{streak} days</strong></div>
                    </section>
                    <blockquote className="focus-quote">“You do not rise to the level of your goals. You fall to the level of your systems.”<span>— JAMES CLEAR</span></blockquote>
                </aside>
            </div>
        </div>
    );
}

export function PvpScreen({ duel, onNavigate, onClaim, player, level, hasAttackSpell, onCastSpell }) {
    if (!duel) return (
        <div className="screen"><ScreenHeader eyebrow="DIRECT CHALLENGE" title="PvP Duel Arena" description="Honor, discipline, and a little friendly rivalry." /><section className="panel"><EmptyState icon={<Swords size={28} />} title="No active duel" description="Challenge a friend from the Social Hub. First to complete 3 daily quests takes the pot." action="Find a challenger" onAction={() => onNavigate('social')} /></section></div>
    );
    const playerScore = Math.min(3, duel.playerProgress || 0);
    return (
        <div className="screen">
            <ScreenHeader eyebrow="LIVE DUEL · FIRST TO 3 QUESTS" title="Duel Arena" description={`A friendly trial against ${duel.name}.`} />
            <section className="panel duel-arena">
                <div className="duel-stake"><Trophy size={16} /><span>VICTOR’S POT</span><strong>{formatNumber(duel.stake * 2)} GOLD</strong></div>
                <div className="duel-versus">
                    <div className="duel-player"><Avatar name={player.name} size="duel" image={getCharacter(player.characterId).image} /><span>LEVEL {level}</span><h2>{player.name}</h2><strong>{playerScore}<small>/3</small></strong><ProgressBar value={playerScore} max={3} /><p>{3 - playerScore || 'No'} quests to victory</p></div>
                    <div className="versus-mark"><span>VS</span><i /></div>
                    <div className="duel-player">
                        <Avatar {...duel} size="duel" online={duel.online} />
                        <span>LEVEL {duel.level}</span>
                        <h2>{duel.name}</h2>
                        {duel.debuff && <span className="duel-debuff"><WandSparkles size={11} /> {duel.debuff}</span>}
                        <strong>1<small>/3</small></strong><ProgressBar value={1} max={3} tone="cyan" /><p>2 quests to victory</p>
                    </div>
                </div>
                <div className={`duel-spell-panel ${duel.debuff ? 'is-cast' : ''}`}>
                    <span className="duel-spell-icon"><WandSparkles size={21} strokeWidth={1.5} /></span>
                    <div>
                        <strong>{duel.debuff ? 'Exhaustion is active' : 'Exhaustion Spell'}</strong>
                        <p>{duel.debuff ? `${duel.name} earns −10% XP for the next hour.` : 'Weaken your opponent with −10% XP for their next hour.'}</p>
                    </div>
                    {duel.debuff ? (
                        <span className="spell-cast-label"><Check size={13} /> CAST</span>
                    ) : (
                        <button className="button button-secondary button-small" onClick={hasAttackSpell ? onCastSpell : () => onNavigate('store')}>
                            {hasAttackSpell ? <><WandSparkles size={14} /> Cast spell</> : 'Get from Vault'}
                        </button>
                    )}
                </div>
                <button className="button button-primary" onClick={playerScore >= 3 ? onClaim : () => onNavigate('quests')}>{playerScore >= 3 ? <><Trophy size={16} /> Claim {formatNumber(duel.stake * 2)} Gold pot</> : <>Complete your daily quests <ArrowRight size={16} /></>}</button>
            </section>
        </div>
    );
}

export function NotificationsScreen({ notifications, onMarkAllRead }) {
    return (
        <div className="screen">
            <ScreenHeader eyebrow="SYSTEM MESSAGES" title="Notifications" description="Gifts, challenges, and important moments from your journey.">
                <button className="button button-secondary" onClick={onMarkAllRead}><Check size={16} /> Mark all read</button>
            </ScreenHeader>
            <section className="panel notifications-page-panel">
                {notifications.length ? notifications.map((notification) => (
                    <article className={`notification-page-row ${!notification.read ? 'is-unread' : ''}`} key={notification.id}>
                        <span className={`notification-type type-${notification.type}`}>{notification.type === 'gift' ? <Gift size={19} /> : notification.type === 'duel' ? <Swords size={19} /> : notification.type === 'quest' ? <Clock3 size={19} /> : <Bell size={19} />}</span>
                        <div><h3>{notification.title}</h3><p>{notification.description}</p><span>{notification.time}</span></div>
                        {!notification.read && <i className="unread-dot" />}
                    </article>
                )) : <EmptyState icon={<Bell size={26} />} title="All quiet in the realm" description="You’re all caught up. New gifts and challenges will appear here." />}
            </section>
        </div>
    );
}

function SettingToggle({ settings, onSettingChange, setting, title, description }) {
    return (
        <div className="setting-row"><div><strong>{title}</strong><p>{description}</p></div><button className={`toggle ${settings[setting] ? 'is-on' : ''}`} role="switch" aria-label={title} aria-checked={settings[setting]} onClick={() => onSettingChange(setting, !settings[setting])}><span /></button></div>
    );
}

export function SettingsScreen({ settings, onSettingChange, onOpenModal, player, session, onLogout }) {
    return (
        <div className="screen settings-screen">
            <ScreenHeader eyebrow="MAKE AURA YOURS" title="Settings" description="Tune the system. Keep the discipline." />
            <div className="settings-layout">
                <div>
                    <section className="panel settings-section">
                        <PanelTitle title="Experience" eyebrow="INTERFACE & AUDIO" />
                        <SettingToggle settings={settings} onSettingChange={onSettingChange} setting="sound" title="Sound effects" description="Subtle audio for rewards and interactions." />
                        <SettingToggle settings={settings} onSettingChange={onSettingChange} setting="particles" title="Ambient particles" description="Floating dust and constellation effects." />
                        <SettingToggle settings={settings} onSettingChange={onSettingChange} setting="notifications" title="Quest reminders" description="Deadlines, gifts, and duel updates." />
                        <SettingToggle settings={settings} onSettingChange={onSettingChange} setting="reducedMotion" title="Reduce motion" description="Minimize transitions and celebration effects." />
                    </section>
                    <section className="panel settings-section">
                        <PanelTitle title="Discipline" eyebrow="DIFFICULTY" />
                        <div className="setting-row"><div><strong>Penalty severity</strong><p>Applied when daily quests expire incomplete.</p></div><select value={settings.penalty} onChange={(event) => onSettingChange('penalty', event.target.value)}><option>Forgiving</option><option>Standard</option><option>Relentless</option></select></div>
                        <div className="setting-row"><div><strong>Daily reset</strong><p>Your quest day resets at midnight.</p></div><span className="setting-static"><Clock3 size={15} /> 00:00 local</span></div>
                    </section>
                </div>
                <aside>
                    <section className="panel settings-section account-card">
                        <PanelTitle title="Account" eyebrow="PLAYER RECORD" />
                        <div className="account-profile"><Avatar name={player.name} image={getCharacter(player.characterId).image} size="large" /><div><strong>{player.name}</strong><span>{session?.email}</span><small>Signed in with {session?.provider}</small></div></div>
                        <button className="button button-secondary button-full" onClick={() => onOpenModal('onboarding')}><Settings2 size={15} /> Edit player details</button>
                        <button className="button button-secondary button-full" onClick={() => onOpenModal('onboarding')}><RotateCcw size={15} /> Replay onboarding</button>
                        <button className="button button-secondary button-full account-logout" onClick={onLogout}><ArrowLeft size={15} /> Sign out</button>
                    </section>
                    <section className="panel settings-section system-info"><ShieldCheck size={20} /><div><strong>Aura System v1.9</strong><p>Progress is stored locally in this interactive preview.</p></div></section>
                </aside>
            </div>
        </div>
    );
}
