'use client';

import { useDeferredValue, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, ChevronRight, Coins, Search, Sparkles, X } from 'lucide-react';
import { skills } from './data';
import { fateRanks, getFateRank } from './fate';
import { getLifeQuestBank, lifeCategories } from './life-quests';
import { useI18n } from './i18n';
import QuestArtwork from './quest-artwork';
import { CategoryIcon, EmptyState, formatNumber, Modal, ScreenHeader } from './ui';

const PAGE_SIZE = 24;
const categories = lifeCategories.map((category) => category.id);

function CodexEntryModal({ quest, onClose, onDraw }) {
    const { t, language } = useI18n();
    if (!quest) return null;
    const rank = getFateRank(quest.rank);
    return (
        <Modal onClose={onClose} label={`${quest.id} ${t('codex.title')}`} className={`codex-detail-modal rank-reveal-${quest.rank.toLowerCase()}`}>
            <div className="quest-detail-art rank-aura" style={{ '--rank-color': rank.color }}><QuestArtwork quest={quest} /></div>
            <div className="eyebrow">{quest.id} · {t(`category.${quest.category}`)}</div>
            <h2 dir="auto" lang={language}>{quest.text}</h2>
            <p dir="auto" lang={language}>{quest.description}</p>
            <div className="quest-skill-links" aria-label={t('codex.advances')}><span>{t('codex.advances')}</span><div>{quest.skillIds.map((id) => <strong key={id}>{t(`skill.${id}`)}</strong>)}</div></div>
            <div className="quest-detail-grid"><div><Sparkles size={17} /><span>{t('codex.experience')}</span><strong>+{formatNumber(quest.xp)} XP</strong></div><div><Coins size={17} /><span>{t('codex.goldReward')}</span><strong>+{formatNumber(quest.gold)} {t('common.gold')}</strong></div><div><BookOpen size={17} /><span>{t('codex.reference')}</span><strong>{quest.sourceCodes.join(' · ')}</strong></div></div>
            <p className="codex-detail-note">{t('codex.note')}</p>
            <button className="button button-primary button-full" onClick={onDraw}><Sparkles size={16} /> {t('codex.openDeck')}</button>
        </Modal>
    );
}

export default function QuestCodex({ onOpenModal }) {
    const { t, language, dir } = useI18n();
    const [query, setQuery] = useState('');
    const deferredQuery = useDeferredValue(query);
    const [category, setCategory] = useState('All');
    const [rank, setRank] = useState('All');
    const [skill, setSkill] = useState('All');
    const [page, setPage] = useState(1);
    const [selected, setSelected] = useState(null);
    const questBank = useMemo(() => getLifeQuestBank(language), [language]);
    const filtersActive = query || category !== 'All' || rank !== 'All' || skill !== 'All';

    const filteredQuests = useMemo(() => {
        const normalizedQuery = deferredQuery.trim().toLocaleLowerCase(language);
        return questBank.filter((quest) => {
            if (category !== 'All' && quest.category !== category) return false;
            if (rank !== 'All' && quest.rank !== rank) return false;
            if (skill !== 'All' && !quest.skillIds.includes(skill)) return false;
            if (normalizedQuery && !`${quest.id} ${quest.text} ${quest.baseAction} ${quest.description} ${quest.sourceCodes.join(' ')}`.toLocaleLowerCase(language).includes(normalizedQuery)) return false;
            return true;
        });
    }, [questBank, deferredQuery, language, category, rank, skill]);

    const pageCount = Math.max(1, Math.ceil(filteredQuests.length / PAGE_SIZE));
    const currentPage = Math.min(page, pageCount);
    const pageQuests = filteredQuests.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
    const updateFilter = (setter) => (value) => { setter(value); setPage(1); };
    const resetFilters = () => { setQuery(''); setCategory('All'); setRank('All'); setSkill('All'); setPage(1); };
    const changePage = (nextPage) => {
        setPage(Math.max(1, Math.min(pageCount, nextPage)));
        window.scrollTo({ top: 0, behavior: 'auto' });
    };

    return (
        <div className="screen codex-screen" dir={dir}>
            <ScreenHeader eyebrow={t('codex.eyebrow')} title={t('codex.title')} description={t('codex.description')}>
                <button className="button button-primary" onClick={() => onOpenModal('tarot')}><Sparkles size={16} /> {t('common.drawCard')}</button>
            </ScreenHeader>

            <section className="panel codex-filter-panel" aria-label={t('codex.title')}>
                <label className="codex-search"><Search size={18} /><input value={query} onChange={(event) => updateFilter(setQuery)(event.target.value)} placeholder={t('codex.searchPlaceholder')} aria-label={t('codex.searchLabel')} />{query && <button type="button" onClick={() => updateFilter(setQuery)('')} aria-label={t('common.close')}><X size={15} /></button>}</label>
                <div className="codex-filter-selects">
                    <label><span>{t('codex.path')}</span><select value={category} onChange={(event) => updateFilter(setCategory)(event.target.value)}><option value="All">{t('common.all')}</option>{categories.map((item) => <option key={item} value={item}>{t(`category.${item}`)}</option>)}</select></label>
                    <label><span>{t('codex.rank')}</span><select value={rank} onChange={(event) => updateFilter(setRank)(event.target.value)}><option value="All">{t('common.all')}</option>{fateRanks.map((item) => <option key={item.rank} value={item.rank}>{item.rank}</option>)}</select></label>
                    <label><span>{t('codex.skill')}</span><select value={skill} onChange={(event) => updateFilter(setSkill)(event.target.value)}><option value="All">{t('common.all')}</option>{skills.map((item) => <option key={item.id} value={item.id}>{t(`skill.${item.id}`)}</option>)}</select></label>
                </div>
            </section>

            <div className="codex-results-heading" id="codex-results">
                <div><BookOpen size={16} /><span><strong>{formatNumber(filteredQuests.length)}</strong> {t('codex.entries')}<small> {t('codex.fromTotal')}</small></span></div>
                {filtersActive && <button className="text-button" onClick={resetFilters}>{t('codex.resetFilters')}</button>}
            </div>

            {pageQuests.length ? <>
                <div className="codex-grid">
                    {pageQuests.map((quest) => {
                        const rankData = getFateRank(quest.rank);
                        return (
                            <button type="button" className={`codex-card panel codex-rank-${quest.rank.toLowerCase()}`} key={quest.id} onClick={() => setSelected(quest)} style={{ '--rank-color': rankData.color }} aria-label={`${quest.id}: ${quest.text}`}>
                                <div className="codex-card-art"><QuestArtwork quest={quest} decorative /></div>
                                <div className="codex-card-copy">
                                    <div className="codex-card-category"><CategoryIcon category={quest.category} size={13} /><span>{t(`category.${quest.category}`)}</span><i /> <small>{quest.id}</small></div>
                                    <h2 dir="auto" lang={language}>{quest.text}</h2>
                                    <div className="codex-card-skills">{quest.skillIds.map((id) => <span key={id}>{t(`skill.${id}`)}</span>)}</div>
                                    <div className="codex-card-rewards"><strong>+{formatNumber(quest.xp)} <small>XP</small></strong><span><Coins size={13} /> +{formatNumber(quest.gold)}</span><ChevronRight size={16} /></div>
                                </div>
                            </button>
                        );
                    })}
                </div>
                <nav className="codex-pagination" aria-label={t('codex.title')}>
                    <button className="button button-secondary" onClick={() => changePage(currentPage - 1)} disabled={currentPage === 1}><ArrowLeft size={15} /> {t('common.previous')}</button>
                    <span>{t('codex.page')} <strong>{currentPage}</strong> {t('codex.of')} {formatNumber(pageCount)}<small>{(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filteredQuests.length)} / {formatNumber(filteredQuests.length)}</small></span>
                    <button className="button button-secondary" onClick={() => changePage(currentPage + 1)} disabled={currentPage === pageCount}>{t('common.next')} <ArrowRight size={15} /></button>
                </nav>
            </> : <section className="panel"><EmptyState icon={<Search size={25} />} title={t('codex.noResults')} description={t('codex.noResultsDescription')} action={t('codex.resetFilters')} onAction={resetFilters} /></section>}

            {selected && <CodexEntryModal quest={selected} onClose={() => setSelected(null)} onDraw={() => { setSelected(null); onOpenModal('tarot'); }} />}
        </div>
    );
}
