'use client';

import { useDeferredValue, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, Link2, Search, Sparkles, X } from 'lucide-react';
import { skills } from './data';
import { fateRanks, getFateRank } from './fate';
import { getLifeQuestBank, lifeCategories } from './life-quests';
import { useI18n } from './i18n';
import QuestRankCard from './quest-card';
import QuestChainPanel from './quest-chain';
import { EmptyState, formatNumber, Modal, ScreenHeader } from './ui';

const PAGE_SIZE = 24;
const categories = lifeCategories.map((category) => category.id);

function CodexEntryModal({ quest, onClose, onDraw, onSelect, level, completedSourceIds, acceptedSourceIds }) {
    const { t, language } = useI18n();
    if (!quest) return null;
    return (
        <Modal onClose={onClose} label={`${quest.id} ${t('codex.title')}`} className={`codex-detail-modal rank-reveal-${quest.rank.toLowerCase()}`}>
            <QuestRankCard quest={quest} flippable />
            <div className="eyebrow">{quest.id} · {t(`category.${quest.category}`)}</div>
            <h2 dir="auto" lang={language}>{quest.text}</h2>
            <p dir="auto" lang={language}>{quest.description}</p>
            <QuestChainPanel quest={quest} onSelect={onSelect} level={level} completedSourceIds={completedSourceIds} acceptedSourceIds={acceptedSourceIds} />
            <p className="codex-detail-note">{t('codex.reference')}: {quest.sourceCodes.join(' · ')}</p>
            <p className="codex-detail-note">{t('codex.note')}</p>
            <button className="button button-primary button-full" onClick={onDraw}><Sparkles size={16} /> {t('codex.openDeck')}</button>
        </Modal>
    );
}

export default function QuestCodex({ onOpenModal, level = 0, quests = [] }) {
    const { t, language, dir } = useI18n();
    const [query, setQuery] = useState('');
    const deferredQuery = useDeferredValue(query);
    const [category, setCategory] = useState('All');
    const [rank, setRank] = useState('All');
    const [skill, setSkill] = useState('All');
    const [sequence, setSequence] = useState('All');
    const [page, setPage] = useState(1);
    const [selected, setSelected] = useState(null);
    const questBank = useMemo(() => getLifeQuestBank(language), [language]);
    const acceptedSourceIds = useMemo(() => quests.map((quest) => quest.sourceId || quest.id).filter(Boolean), [quests]);
    const completedSourceIds = useMemo(() => quests.filter((quest) => quest.done).map((quest) => quest.sourceId || quest.id).filter(Boolean), [quests]);
    const filtersActive = query || category !== 'All' || rank !== 'All' || skill !== 'All' || sequence !== 'All';

    const filteredQuests = useMemo(() => {
        const normalizedQuery = deferredQuery.trim().toLocaleLowerCase(language);
        return questBank.filter((quest) => {
            if (category !== 'All' && quest.category !== category) return false;
            if (rank !== 'All' && quest.rank !== rank) return false;
            if (skill !== 'All' && !quest.skillIds.includes(skill)) return false;
            if (sequence === 'Sequential' && !quest.chainId) return false;
            if (sequence === 'Standalone' && quest.chainId) return false;
            if (normalizedQuery && !`${quest.id} ${quest.chainId || ''} ${quest.text} ${quest.baseAction} ${quest.description} ${quest.sourceCodes.join(' ')}`.toLocaleLowerCase(language).includes(normalizedQuery)) return false;
            return true;
        });
    }, [questBank, deferredQuery, language, category, rank, skill, sequence]);

    const pageCount = Math.max(1, Math.ceil(filteredQuests.length / PAGE_SIZE));
    const currentPage = Math.min(page, pageCount);
    const pageQuests = filteredQuests.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
    const updateFilter = (setter) => (value) => { setter(value); setPage(1); };
    const resetFilters = () => { setQuery(''); setCategory('All'); setRank('All'); setSkill('All'); setSequence('All'); setPage(1); };
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
                    <label><span>{t('codex.sequence')}</span><select value={sequence} onChange={(event) => updateFilter(setSequence)(event.target.value)} aria-label={t('codex.sequence')}><option value="All">{t('common.all')}</option><option value="Sequential">{t('codex.sequential')}</option><option value="Standalone">{t('codex.standalone')}</option></select></label>
                </div>
                <div className="codex-chain-summary"><Link2 size={14} /><span>{t('codex.chainSummary')}</span></div>
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
                                <QuestRankCard quest={quest} compact />
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

            {selected && <CodexEntryModal quest={selected} onClose={() => setSelected(null)} onSelect={setSelected} level={level} completedSourceIds={completedSourceIds} acceptedSourceIds={acceptedSourceIds} onDraw={() => { setSelected(null); onOpenModal('tarot'); }} />}
        </div>
    );
}
