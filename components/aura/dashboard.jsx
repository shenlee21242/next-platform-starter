'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
    ArrowRight,
    BookOpen,
    CalendarDays,
    ChevronRight,
    CircleAlert,
    Clock3,
    Coins,
    Diamond,
    Flame,
    Focus,
    Plus,
    ShieldAlert,
    Sparkles,
    Swords,
    Zap,
} from 'lucide-react';
import { XP_TO_LEVEL, getRank } from './data';
import { getCharacter } from './characters';
import { useI18n } from './i18n';
import QuestArtwork from './quest-artwork';
import CharacterLoreModal from './character-lore';
import {
    CategoryIcon,
    CheckButton,
    Currency,
    EmptyState,
    formatClock,
    formatNumber,
    formatShortClock,
    PanelTitle,
    ProgressBar,
    ScreenHeader,
} from './ui';

export default function Dashboard({
    quests,
    onToggleQuest,
    onAddQuest,
    onNavigate,
    onOpenModal,
    level,
    xp,
    bossProgress,
    deadline,
    focusSeconds,
    focusRunning,
    onFocusToggle,
    activeSkin,
    player,
    attributes,
    streak,
    penaltyGold,
}) {
    const { t, language } = useI18n();
    const [filter, setFilter] = useState('All');
    const [storyOpen, setStoryOpen] = useState(false);
    const character = getCharacter(player.characterId || activeSkin);
    const completed = quests.filter((quest) => quest.done).length;
    const remaining = quests.length - completed;
    const filteredQuests = filter === 'All' ? quests : quests.filter((quest) => quest.category === filter);

    return (
        <div className="screen dashboard-screen">
            <ScreenHeader
                eyebrow={t('dashboard.eyebrow')}
                title={t('dashboard.title')}
                description={t('dashboard.description')}
            >
                <button className="button button-primary" onClick={onAddQuest}>
                    <Plus size={17} /> {t('common.newQuest')}
                </button>
            </ScreenHeader>

            {remaining > 0 && (
                <section className="penalty-banner" aria-label="Daily quest reminder">
                    <div className="penalty-symbol"><ShieldAlert size={21} strokeWidth={1.6} /></div>
                    <div className="penalty-copy">
                        <strong>Your streak is on the line.</strong>
                        <span>Complete {remaining} remaining {remaining === 1 ? 'quest' : 'quests'} before the day ends.</span>
                    </div>
                    <div className="penalty-deadline">
                        <span><Clock3 size={13} /> TIME REMAINING</span>
                        <strong>{formatClock(deadline)}</strong>
                    </div>
                    <div className="penalty-cost">
                        <span>MISSED PENALTY</span>
                        <strong>−{penaltyGold} <Coins size={13} /></strong>
                    </div>
                </section>
            )}

            <div className="dashboard-grid">
                <div className="dashboard-main-column">
                    <section className="panel quests-panel">
                        <div className="quests-panel-heading">
                            <PanelTitle
                                title={t('dashboard.dailyQuests')}
                                meta={quests.length ? `${completed}/${quests.length} ${t('common.completed')}` : t('dashboard.noQuests')}
                            />
                            {quests.length > 0 && (
                                <div className="quest-progress-summary">
                                    <ProgressBar value={completed} max={quests.length} />
                                    <span>{Math.round((completed / quests.length) * 100)}%</span>
                                </div>
                            )}
                        </div>
                        <div className="quest-filter" role="tablist" aria-label="Filter quests">
                            {['All', 'Religious', 'Psychological', 'Physical', 'Mental', 'SelfDevelopment', 'Social', 'Spiritual'].map((item) => (
                                <button
                                    key={item}
                                    className={filter === item ? 'active' : ''}
                                    onClick={() => setFilter(item)}
                                    role="tab"
                                    aria-selected={filter === item}
                                >
                                    {item === 'All' ? t('common.all') : t(`category.${item}`)}
                                    {item === 'All' && <span>{quests.length}</span>}
                                </button>
                            ))}
                        </div>

                        <div className="quest-list">
                            {filteredQuests.length ? filteredQuests.map((quest) => (
                                <article className={`quest-row ${quest.image || quest.generatedArt ? 'has-image' : ''} ${quest.done ? 'is-complete' : ''}`} key={quest.id}>
                                    <CheckButton
                                        checked={quest.done}
                                        onClick={() => onToggleQuest(quest.id)}
                                        label={`${quest.done ? 'Mark incomplete' : 'Complete'} ${quest.title}`}
                                    />
                                    {quest.generatedArt || quest.sourceId ? <div className="quest-thumbnail"><QuestArtwork quest={{ ...quest, text: quest.text || quest.title }} decorative /></div> : quest.image ? <div className="quest-thumbnail"><Image src={quest.image} alt="" width={640} height={400} unoptimized /></div> : <div className={`quest-category-icon category-${quest.category.toLowerCase()}`}>
                                        <CategoryIcon category={quest.category} size={19} />
                                    </div>}
                                    <div className="quest-info">
                                        <h3 dir="auto" lang={language}>{quest.title}</h3>
                                        {quest.description && <p className="quest-row-description" dir="auto" lang={language}>{quest.description.split(' Objective:')[0]}</p>}
                                        <div className="quest-meta">
                                            <span>{t(`category.${quest.category}`)}</span>
                                            <i />
                                            <span><Clock3 size={12} /> {quest.duration} min</span>
                                        </div>
                                    </div>
                                    <div className="quest-rewards">
                                        <span className="xp-reward">+{quest.xp} <small>XP</small></span>
                                        <span className="gold-reward"><Coins size={13} /> +{quest.gold}</span>
                                        {quest.diamonds > 0 && <span className="diamond-reward"><Diamond size={13} /> +{quest.diamonds}</span>}
                                    </div>
                                    <button className="quest-more" aria-label={`View ${quest.title}`} onClick={() => onOpenModal('quest-detail', quest)}>
                                        <ChevronRight size={17} />
                                    </button>
                                </article>
                            )) : (
                                <EmptyState
                                    icon={<Sparkles size={25} />}
                                    title={quests.length ? `No ${filter.toLowerCase()} quests yet` : 'Your adventure starts here'}
                                    description={quests.length ? 'Try another path or add a new quest to this category.' : 'Add your first quest and turn today into progress.'}
                                    action="Create a quest"
                                    onAction={onAddQuest}
                                />
                            )}
                        </div>
                        <button className="add-quest-row" onClick={onAddQuest}>
                            <Plus size={16} /> {quests.length ? t('dashboard.addAnother') : t('dashboard.addFirst')}
                        </button>
                    </section>

                    <section className="boss-card">
                        <Image src="/images/void-colossus.png" alt="The Void Colossus in an ancient arena" fill sizes="(max-width: 900px) 100vw, 55vw" />
                        <div className="boss-card-shade" />
                        <div className="boss-card-top">
                            <span className="boss-label"><Swords size={14} /> WEEKLY BOSS</span>
                            <span className="rank-badge rank-s">S RANK</span>
                        </div>
                        <div className="boss-card-content">
                            <div className="boss-title-row">
                                <div>
                                    <span>THE FOURTH TRIAL</span>
                                    <h2>The Void Colossus</h2>
                                </div>
                                <button className="round-arrow" onClick={() => onOpenModal('boss')} aria-label="View boss details"><ArrowRight size={19} /></button>
                            </div>
                            <div className="boss-status">
                                <div className="boss-health">
                                    <div><span>COLOSSUS INTEGRITY</span><strong>{bossProgress}%</strong></div>
                                    <ProgressBar value={bossProgress} tone="crimson" />
                                </div>
                                <div className="boss-time"><Clock3 size={15} /><span><strong>4d 13h</strong> remaining</span></div>
                            </div>
                        </div>
                    </section>
                </div>

                <aside className="dashboard-side-column">
                    <section className={`character-card skin-${activeSkin}`}>
                        <button type="button" className="character-art" onClick={() => setStoryOpen(true)} aria-label={`Read ${character.name}'s backstory`}>
                            <Image src={character.image} alt={`${player.name} as ${character.name}, ${character.title}`} fill priority sizes="(max-width: 900px) 100vw, 30vw" />
                            <div className="character-art-overlay" />
                            <div className="character-card-top">
                                <span className="level-chip">LEVEL {level}</span>
                                <span className="class-chip">{character.heroClass.toUpperCase()}</span>
                            </div>
                            <span className="dashboard-lore-hint"><BookOpen size={13} /> Story</span>
                        </button>
                        <div className="character-card-body">
                            <div className="character-name-row">
                                <div>
                                    <h2>{player.name}</h2>
                                    <span>{character.name} · {getRank(level)} <i /> {streak} day streak</span>
                                </div>
                                <button className="icon-button" onClick={() => onNavigate('character')} aria-label="Open character profile"><ArrowRight size={18} /></button>
                            </div>
                            <div className="character-xp">
                                <div><span>EXPERIENCE</span><strong>{formatNumber(xp)} <small>/ {formatNumber(XP_TO_LEVEL)} XP</small></strong></div>
                                <ProgressBar value={xp} max={XP_TO_LEVEL} />
                            </div>
                            <div className="attribute-grid">
                                {Object.entries(attributes).map(([name, value]) => (
                                    <div key={name}><span>{name}</span><strong>{value}</strong><i>{level > 0 ? `+${level}` : '—'}</i></div>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section className="panel sanctuary-widget">
                        <div className="sanctuary-widget-icon"><Focus size={21} strokeWidth={1.5} /></div>
                        <div className="sanctuary-widget-copy">
                            <span>FOCUS SANCTUARY</span>
                            <strong>{formatShortClock(focusSeconds)}</strong>
                            <small>{focusRunning ? 'Your sanctuary is active' : 'Silence the noise. Enter deep work.'}</small>
                        </div>
                        <button className={`sanctuary-play ${focusRunning ? 'is-running' : ''}`} onClick={onFocusToggle} aria-label={focusRunning ? 'Pause focus timer' : 'Start focus timer'}>
                            {focusRunning ? <span className="pause-icon" /> : <Zap size={18} fill="currentColor" />}
                        </button>
                        <button className="sanctuary-expand" onClick={() => onNavigate('focus')} aria-label="Open Focus Sanctuary"><ChevronRight size={16} /></button>
                    </section>

                    <button className="tarot-widget" onClick={() => onOpenModal('tarot')}>
                        <span className="tarot-mini-card"><Sparkles size={23} strokeWidth={1.2} /><i>FATE</i></span>
                        <span className="tarot-widget-copy">
                            <small>{t('dashboard.unknown')}</small>
                            <strong>{t('dashboard.drawMystery')}</strong>
                            <span>{t('dashboard.fromGold')} <ArrowRight size={13} /></span>
                        </span>
                    </button>
                </aside>
            </div>
            {storyOpen && <CharacterLoreModal character={character} onClose={() => setStoryOpen(false)} />}
            <button className="quest-fab" onClick={onAddQuest} aria-label="Add a new daily quest">
                <Plus size={21} strokeWidth={1.8} />
                <span>{t('common.newQuest')}</span>
            </button>
        </div>
    );
}
