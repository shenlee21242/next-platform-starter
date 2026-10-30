'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { ArrowLeft, ArrowRight, BookOpen, ChevronRight, Coins, Search, Sparkles, X } from 'lucide-react';
import { skills } from './data';
import { fateRanks, getFateRank, questBank } from './fate';
import { CategoryIcon, EmptyState, formatNumber, Modal, ScreenHeader } from './ui';

const PAGE_SIZE = 24;
const categories = ['Physical', 'Mental', 'Spiritual'];

function CodexEntryModal({ quest, onClose, onDraw }) {
    if (!quest) return null;
    const rank = getFateRank(quest.rank);
    return (
        <Modal onClose={onClose} label={`${quest.id} quest Codex entry`} className="codex-detail-modal">
            <div className="quest-detail-art" style={{ '--rank-color': rank.color }}><Image src={quest.image} alt={`${quest.category} ${quest.rank}-rank quest illustration`} width={640} height={400} unoptimized /></div>
            <div className="eyebrow">{quest.id} · {quest.category} PATH</div>
            <h2>{quest.text}</h2>
            <p>{quest.description}</p>
            <div className="quest-skill-links" aria-label="Skills advanced by this quest"><span>ADVANCES</span><div>{quest.skillIds.map((id) => <strong key={id}>{skills.find((skill) => skill.id === id)?.name || id}</strong>)}</div></div>
            <div className="quest-detail-grid"><div><Sparkles size={17} /><span>Experience</span><strong>+{formatNumber(quest.xp)} XP</strong></div><div><Coins size={17} /><span>Gold reward</span><strong>+{formatNumber(quest.gold)} Gold</strong></div><div><BookOpen size={17} /><span>Base action</span><strong>{quest.baseAction}</strong></div></div>
            <p className="codex-detail-note">Codex entries are for exploration. Quests are accepted through your level-weighted Deck of Fate.</p>
            <button className="button button-primary button-full" onClick={onDraw}><Sparkles size={16} /> Open the Deck of Fate</button>
        </Modal>
    );
}

export default function QuestCodex({ onOpenModal }) {
    const [query, setQuery] = useState('');
    const [category, setCategory] = useState('All');
    const [rank, setRank] = useState('All');
    const [skill, setSkill] = useState('All');
    const [page, setPage] = useState(1);
    const [selected, setSelected] = useState(null);
    const filtersActive = query || category !== 'All' || rank !== 'All' || skill !== 'All';

    const filteredQuests = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();
        return questBank.filter((quest) => {
            if (category !== 'All' && quest.category !== category) return false;
            if (rank !== 'All' && quest.rank !== rank) return false;
            if (skill !== 'All' && !quest.skillIds.includes(skill)) return false;
            if (normalizedQuery && !`${quest.id} ${quest.text} ${quest.baseAction} ${quest.description}`.toLowerCase().includes(normalizedQuery)) return false;
            return true;
        });
    }, [query, category, rank, skill]);

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
        <div className="screen codex-screen">
            <ScreenHeader eyebrow="THE COMPLETE REAL-WORLD ARCHIVE" title="Quest Codex" description="Explore every path, rank, and skill connection. Your Deck still decides which quest you accept.">
                <button className="button button-primary" onClick={() => onOpenModal('tarot')}><Sparkles size={16} /> Draw a Fate card</button>
            </ScreenHeader>

            <section className="panel codex-filter-panel" aria-label="Filter the quest Codex">
                <label className="codex-search"><Search size={18} /><input value={query} onChange={(event) => updateFilter(setQuery)(event.target.value)} placeholder="Search by quest, action, or ID…" aria-label="Search all 2,700 quests" />{query && <button type="button" onClick={() => updateFilter(setQuery)('')} aria-label="Clear quest search"><X size={15} /></button>}</label>
                <div className="codex-filter-selects">
                    <label><span>Path</span><select value={category} onChange={(event) => updateFilter(setCategory)(event.target.value)}><option>All</option>{categories.map((item) => <option key={item}>{item}</option>)}</select></label>
                    <label><span>Rank</span><select value={rank} onChange={(event) => updateFilter(setRank)(event.target.value)}><option>All</option>{fateRanks.map((item) => <option key={item.rank}>{item.rank}</option>)}</select></label>
                    <label><span>Linked skill</span><select value={skill} onChange={(event) => updateFilter(setSkill)(event.target.value)}><option>All</option>{skills.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
                </div>
            </section>

            <div className="codex-results-heading" id="codex-results">
                <div><BookOpen size={16} /><span><strong>{formatNumber(filteredQuests.length)}</strong> {filteredQuests.length === 1 ? 'entry' : 'entries'}<small> from {formatNumber(questBank.length)} quests</small></span></div>
                {filtersActive && <button className="text-button" onClick={resetFilters}>Reset filters</button>}
            </div>

            {pageQuests.length ? <>
                <div className="codex-grid">
                    {pageQuests.map((quest) => {
                        const rankData = getFateRank(quest.rank);
                        return (
                            <button type="button" className="codex-card panel" key={quest.id} onClick={() => setSelected(quest)} style={{ '--rank-color': rankData.color }} aria-label={`Read ${quest.id}: ${quest.text}`}>
                                <div className="codex-card-art"><Image src={quest.image} alt="" width={640} height={400} sizes="(max-width: 700px) 100vw, (max-width: 1200px) 50vw, 33vw" unoptimized /></div>
                                <div className="codex-card-copy">
                                    <div className="codex-card-category"><CategoryIcon category={quest.category} size={13} /><span>{quest.category}</span><i /> <small>{quest.id}</small></div>
                                    <h2>{quest.text}</h2>
                                    <div className="codex-card-skills">{quest.skillIds.map((id) => <span key={id}>{skills.find((item) => item.id === id)?.name || id}</span>)}</div>
                                    <div className="codex-card-rewards"><strong>+{formatNumber(quest.xp)} <small>XP</small></strong><span><Coins size={13} /> +{formatNumber(quest.gold)}</span><ChevronRight size={16} /></div>
                                </div>
                            </button>
                        );
                    })}
                </div>
                <nav className="codex-pagination" aria-label="Quest Codex pages">
                    <button className="button button-secondary" onClick={() => changePage(currentPage - 1)} disabled={currentPage === 1}><ArrowLeft size={15} /> Previous</button>
                    <span>Page <strong>{currentPage}</strong> of {formatNumber(pageCount)}<small>{(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filteredQuests.length)} of {formatNumber(filteredQuests.length)}</small></span>
                    <button className="button button-secondary" onClick={() => changePage(currentPage + 1)} disabled={currentPage === pageCount}>Next <ArrowRight size={15} /></button>
                </nav>
            </> : <section className="panel"><EmptyState icon={<Search size={25} />} title="No quests found" description="Try a different ID, path, rank, or linked skill." action="Reset filters" onAction={resetFilters} /></section>}

            {selected && <CodexEntryModal quest={selected} onClose={() => setSelected(null)} onDraw={() => { setSelected(null); onOpenModal('tarot'); }} />}
        </div>
    );
}
