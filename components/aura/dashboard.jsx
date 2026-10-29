'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
    ArrowRight,
    CalendarDays,
    ChevronRight,
    CircleAlert,
    Clock3,
    Coins,
    Flame,
    Focus,
    Plus,
    ShieldAlert,
    Sparkles,
    Swords,
    Zap,
} from 'lucide-react';
import { XP_TO_LEVEL } from './data';
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
}) {
    const [filter, setFilter] = useState('All');
    const completed = quests.filter((quest) => quest.done).length;
    const remaining = quests.length - completed;
    const filteredQuests = filter === 'All' ? quests : quests.filter((quest) => quest.category === filter);

    return (
        <div className="screen dashboard-screen">
            <ScreenHeader
                eyebrow="YOUR DAILY ADVENTURE"
                title="Ready for today’s quests?"
                description="Small victories. Legendary outcomes."
            >
                <button className="button button-primary" onClick={onAddQuest}>
                    <Plus size={17} /> New quest
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
                        <strong>−100 <Coins size={13} /></strong>
                    </div>
                </section>
            )}

            <div className="dashboard-grid">
                <div className="dashboard-main-column">
                    <section className="panel quests-panel">
                        <div className="quests-panel-heading">
                            <PanelTitle
                                title="Daily quests"
                                meta={quests.length ? `${completed}/${quests.length} completed` : 'No quests yet'}
                            />
                            {quests.length > 0 && (
                                <div className="quest-progress-summary">
                                    <ProgressBar value={completed} max={quests.length} />
                                    <span>{Math.round((completed / quests.length) * 100)}%</span>
                                </div>
                            )}
                        </div>
                        <div className="quest-filter" role="tablist" aria-label="Filter quests">
                            {['All', 'Physical', 'Mental', 'Spiritual'].map((item) => (
                                <button
                                    key={item}
                                    className={filter === item ? 'active' : ''}
                                    onClick={() => setFilter(item)}
                                    role="tab"
                                    aria-selected={filter === item}
                                >
                                    {item}
                                    {item === 'All' && <span>{quests.length}</span>}
                                </button>
                            ))}
                        </div>

                        <div className="quest-list">
                            {filteredQuests.length ? filteredQuests.map((quest) => (
                                <article className={`quest-row ${quest.done ? 'is-complete' : ''}`} key={quest.id}>
                                    <CheckButton
                                        checked={quest.done}
                                        onClick={() => onToggleQuest(quest.id)}
                                        label={`${quest.done ? 'Mark incomplete' : 'Complete'} ${quest.title}`}
                                    />
                                    <div className={`quest-category-icon category-${quest.category.toLowerCase()}`}>
                                        <CategoryIcon category={quest.category} size={19} />
                                    </div>
                                    <div className="quest-info">
                                        <h3>{quest.title}</h3>
                                        <div className="quest-meta">
                                            <span>{quest.category}</span>
                                            <i />
                                            <span><Clock3 size={12} /> {quest.duration} min</span>
                                        </div>
                                    </div>
                                    <div className="quest-rewards">
                                        <span className="xp-reward">+{quest.xp} <small>XP</small></span>
                                        <span className="gold-reward"><Coins size={13} /> +{quest.gold}</span>
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
                            <Plus size={16} /> {quests.length ? 'Add another quest' : 'Add your first quest'}
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
                        <div className="character-art">
                            <Image src="/images/aura-hero.png" alt="Arin, Shadow Ranger" fill priority sizes="(max-width: 900px) 100vw, 30vw" />
                            <div className="character-art-overlay" />
                            <div className="character-card-top">
                                <span className="level-chip">LEVEL {level}</span>
                                <span className="class-chip">SHADOW RANGER</span>
                            </div>
                        </div>
                        <div className="character-card-body">
                            <div className="character-name-row">
                                <div>
                                    <h2>Arin</h2>
                                    <span>Gold III <i /> 12 day streak</span>
                                </div>
                                <button className="icon-button" onClick={() => onNavigate('character')} aria-label="Open character profile"><ArrowRight size={18} /></button>
                            </div>
                            <div className="character-xp">
                                <div><span>EXPERIENCE</span><strong>{formatNumber(xp)} <small>/ {formatNumber(XP_TO_LEVEL)} XP</small></strong></div>
                                <ProgressBar value={xp} max={XP_TO_LEVEL} />
                            </div>
                            <div className="attribute-grid">
                                <div><span>STR</span><strong>24</strong><i className="attribute-up">+2</i></div>
                                <div><span>INT</span><strong>31</strong><i className="attribute-up">+4</i></div>
                                <div><span>STA</span><strong>28</strong><i className="attribute-up">+3</i></div>
                                <div><span>CHA</span><strong>19</strong><i>—</i></div>
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
                            <small>THE UNKNOWN AWAITS</small>
                            <strong>Draw a mystery quest</strong>
                            <span>From 50 Gold <ArrowRight size={13} /></span>
                        </span>
                    </button>
                </aside>
            </div>
        </div>
    );
}
