'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import {
    ArrowRight,
    Calendar,
    CalendarDays,
    CalendarRange,
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
import { getPeriodKey, getQuestPeriod, secondsUntilPeriodEnd } from './game';
import QuestArtwork from './quest-artwork';
import { AuraCoverArtwork } from './quest-card';
import {
    CategoryIcon,
    CheckButton,
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
    const [period, setPeriod] = useState('day');
    const [now, setNow] = useState(() => new Date());
    const periodOptions = [
        { id: 'day', icon: Calendar },
        { id: 'week', icon: CalendarDays },
        { id: 'month', icon: CalendarRange },
    ];
    const inCurrentPeriod = (quest, value) => getQuestPeriod(quest) === value && (!quest.periodKey || quest.periodKey === getPeriodKey(value, now));
    const periodQuests = quests.filter((quest) => inCurrentPeriod(quest, period));
    const dailyQuests = quests.filter((quest) => inCurrentPeriod(quest, 'day'));
    const completed = periodQuests.filter((quest) => quest.done).length;
    const remaining = dailyQuests.filter((quest) => !quest.done).length;
    const filteredQuests = filter === 'All' ? periodQuests : periodQuests.filter((quest) => quest.category === filter);
    const fateStartingPrice = getFateRank('F').price;
    const periodSeconds = secondsUntilPeriodEnd(period, now);
    const periodCountdown = period === 'day'
        ? formatClock(periodSeconds)
        : t('goal.daysHours', { days: Math.floor(periodSeconds / 86400), hours: Math.floor((periodSeconds % 86400) / 3600) });
    const panelMeta = periodQuests.length
        ? `${completed}/${periodQuests.length} ${t('common.completed')} · ${t('dashboard.unlimitedCustom')}${period === 'day' ? ` · ${t('dashboard.randomSlots', { count: randomQuestCount, limit: randomQuestLimit })}` : ''}`
        : t('dashboard.noQuests');

    useEffect(() => {
        const timer = window.setInterval(() => setNow(new Date()), 1000);
        return () => window.clearInterval(timer);
    }, []);

    return (
        <div className="screen dashboard-screen">
            <ScreenHeader
                eyebrow={t('dashboard.eyebrow')}
                title={t('dashboard.title')}
                description={t('dashboard.description')}
            >
                <button className="button button-primary" onClick={() => onAddQuest(period)}>
                    <Plus size={17} /> {t('common.newQuest')}
                </button>
            </ScreenHeader>

            {remaining > 0 && (
                <section className="penalty-banner" aria-label="Daily quest reminder">
                    <div className="penalty-symbol"><ShieldAlert size={21} strokeWidth={1.6} /></div>
                    <div className="penalty-copy">
                        <strong>{t('dashboard.streakWarning')}</strong>
                        <span>{t('dashboard.remaining', { count: remaining })}</span>
                    </div>
                    <div className="penalty-deadline">
                        <span><Clock3 size={13} /> {t('dashboard.timeRemaining')}</span>
                        <strong>{formatClock(deadline)}</strong>
                    </div>
                    <div className="penalty-cost">
                        <span>{t('dashboard.missedPenalty')}</span>
                        <strong>−{penaltyGold} <Coins size={13} /></strong>
                    </div>
                </section>
            )}

            <div className="dashboard-grid">
                <div className="dashboard-main-column">
                    <section className="panel quests-panel">
                        <div className="goal-period-tabs" role="tablist" aria-label={t('goal.navigation')}>
                            {periodOptions.map(({ id, icon: Icon }) => {
                                const count = quests.filter((quest) => inCurrentPeriod(quest, id)).length;
                                return (
                                    <button type="button" key={id} className={period === id ? 'active' : ''} onClick={() => setPeriod(id)} role="tab" aria-selected={period === id}>
                                        <Icon size={17} strokeWidth={1.6} />
                                        <span>{t(`goal.${id}`)}</span>
                                        <small>{count}</small>
                                    </button>
                                );
                            })}
                        </div>
                        <div className="goal-period-banner">
                            <div>
                                <span className="eyebrow">{t(`goal.${period}Reset`)}</span>
                                <h2>{t(`goal.${period}Title`)}</h2>
                            </div>
                            <div className="goal-period-countdown">
                                <span><Clock3 size={13} /> {t('dashboard.timeRemaining')}</span>
                                <strong>{periodCountdown}</strong>
                            </div>
                        </div>
                        <div className="quests-panel-heading">
                            <PanelTitle title={t(`goal.${period}`)} meta={panelMeta} />
                            {periodQuests.length > 0 && (
                                <div className="quest-progress-summary">
                                    <ProgressBar value={completed} max={periodQuests.length} />
                                    <span>{Math.round((completed / periodQuests.length) * 100)}%</span>
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
                                    {item === 'All' && <span>{periodQuests.length}</span>}
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
                                    title={periodQuests.length ? t('goal.emptyCategory', { category: filter === 'All' ? t('common.all') : t(`category.${filter}`) }) : t('goal.emptyTitle', { period: t(`goal.${period}`) })}
                                    description={periodQuests.length ? t('goal.emptyCategoryDescription') : t('goal.emptyDescription')}
                                    action={t('goal.createPeriod', { period: t(`goal.${period}`) })}
                                    onAction={() => onAddQuest(period)}
                                />
                            )}
                        </div>
                        <button className="add-quest-row" onClick={() => onAddQuest(period)}>
                            <Plus size={16} /> {periodQuests.length ? t('dashboard.addAnother') : t('dashboard.addFirst')}
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
            <button className="quest-fab" onClick={() => onAddQuest(period)} aria-label={t('goal.addToPeriod', { period: t(`goal.${period}`) })}>
                <Plus size={21} strokeWidth={1.8} />
                <span>{t('common.newQuest')}</span>
            </button>
        </div>
    );
}
