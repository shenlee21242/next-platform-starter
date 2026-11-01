'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
    ArrowRight,
    ChevronRight,
    Clock3,
    Coins,
    Diamond,
    Focus,
    Link2,
    Plus,
    ShieldAlert,
    Sparkles,
    Zap,
} from 'lucide-react';
import { useI18n } from './i18n';
import { getFateRank } from './fate';
import QuestArtwork from './quest-artwork';
import { AuraCoverArtwork } from './quest-card';
import {
    CategoryIcon,
    CheckButton,
    Currency,
    EmptyState,
    formatClock,
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
    deadline,
    focusSeconds,
    focusRunning,
    onFocusToggle,
    penaltyGold,
    randomQuestLimit = 3,
    randomQuestCount = 0,
}) {
    const { t, language } = useI18n();
    const [filter, setFilter] = useState('All');
    const completed = quests.filter((quest) => quest.done).length;
    const remaining = quests.length - completed;
    const filteredQuests = filter === 'All' ? quests : quests.filter((quest) => quest.category === filter);
    const fateStartingPrice = getFateRank('F').price;

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
                                meta={quests.length ? `${completed}/${quests.length} ${t('common.completed')} · ${t('dashboard.unlimitedCustom')} · ${t('dashboard.randomSlots', { count: randomQuestCount, limit: randomQuestLimit })}` : t('dashboard.noQuests')}
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
                                <article className={`quest-row ${quest.image || quest.generatedArt ? 'has-image' : ''} ${quest.done ? 'is-complete' : ''} ${quest.skipped ? 'is-skipped' : ''}`} key={quest.id}>
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
                                            {quest.chainId && <><i /><span className="quest-row-chain" title={t('chain.label')}><Link2 size={12} /> {t('chain.step', { step: quest.chainStep, total: quest.chainLength })}</span></>}
                                        </div>
                                    </div>
                                    <div className="quest-rewards">
                                        {quest.skipped ? <span className="quest-skipped-label">{t('dashboard.restDaySkip')}</span> : <>
                                            <span className="xp-reward">+{quest.xp} <small>XP</small></span>
                                            <span className="gold-reward"><Coins size={13} /> +{quest.gold}</span>
                                            {quest.diamonds > 0 && <span className="diamond-reward"><Diamond size={13} /> +{quest.diamonds}</span>}
                                        </>}
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

                </div>

                <aside className="dashboard-side-column">
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
                        <span className="tarot-mini-card aura-mini-cover"><AuraCoverArtwork /></span>
                        <span className="tarot-widget-copy">
                            <small>{t('dashboard.unknown')}</small>
                            <strong>{t('dashboard.drawMystery')}</strong>
                            <span>{t('dashboard.fromGold', { price: fateStartingPrice })} <ArrowRight size={13} /></span>
                        </span>
                    </button>
                </aside>
            </div>
            <button className="quest-fab" onClick={onAddQuest} aria-label="Add a new daily quest">
                <Plus size={21} strokeWidth={1.8} />
                <span>{t('common.newQuest')}</span>
            </button>
        </div>
    );
}
