'use client';

import { useMemo } from 'react';
import { ArrowRight, Check, Link2, LockKeyhole, Plus } from 'lucide-react';
import { getFateRank } from './fate';
import { getLifeQuestChain } from './life-quests';
import { useI18n } from './i18n';

export default function QuestChainPanel({ quest, onSelect, onAddNext, level = 0, completedSourceIds = [], acceptedSourceIds = [] }) {
    const { t, language, dir } = useI18n();
    const chain = useMemo(() => getLifeQuestChain(quest.chainId, language), [quest.chainId, language]);
    if (!quest.chainId || !chain.length) return null;

    const rank = getFateRank(quest.rank);
    const currentSourceId = quest.sourceId || quest.id;
    const currentDone = Boolean(quest.done || completedSourceIds.includes(currentSourceId));
    const next = chain.find((step) => step.id === quest.nextQuestId) || null;
    const nextLevel = next ? next.rankIndex * 10 : 0;
    const nextLocked = Boolean(next && level < nextLevel);
    const nextAccepted = Boolean(next && acceptedSourceIds.includes(next.id));
    const canAddNext = Boolean(next && currentDone && !nextLocked && !nextAccepted);

    return (
        <section className="quest-chain-panel" dir={dir} style={{ '--rank-color': rank.color }} aria-label={t('chain.label')} data-chain-step={quest.chainStep} data-next-quest={next?.id || ''}>
            <div className="quest-chain-heading"><span><Link2 size={15} />{t('chain.label')}</span><strong>{t('chain.step', { step: quest.chainStep, total: quest.chainLength })}</strong></div>
            <p>{t('chain.easiestToHardest')}</p>
            <div className="quest-chain-track" role="list" aria-label={`${quest.chainId}, ${t('chain.step', { step: quest.chainStep, total: quest.chainLength })}`}>
                {chain.map((step) => {
                    const completed = completedSourceIds.includes(step.id) || (step.id === currentSourceId && quest.done);
                    const current = step.id === currentSourceId;
                    const locked = level < step.rankIndex * 10;
                    return <button type="button" role="listitem" key={step.id} className={`${current ? 'is-current' : ''} ${completed ? 'is-complete' : ''} ${locked ? 'is-locked' : ''}`} onClick={() => onSelect?.(step)} disabled={!onSelect} aria-current={current ? 'step' : undefined} aria-label={`${t('chain.step', { step: step.chainStep, total: 9 })}: ${step.rank}`} title={`${step.rank} · ${step.baseAction}`}><span>{completed ? <Check size={11} /> : step.rank}</span><i /></button>;
                })}
            </div>
            {next ? <div className="quest-chain-next">
                <div><span>{t('chain.next')}</span><strong dir="auto">{next.rank} · {next.baseAction}</strong><small>{nextLocked ? t('chain.locked', { level: nextLevel, rank: next.rank }) : !currentDone && onAddNext ? t('chain.completeFirst') : nextAccepted ? t('chain.alreadyAdded') : t('chain.unlockedNext')}</small></div>
                {onAddNext ? <button type="button" className="button button-secondary button-small" disabled={!canAddNext} onClick={() => onAddNext(next)}>{nextAccepted ? <Check size={14} /> : nextLocked ? <LockKeyhole size={14} /> : <Plus size={14} />}{nextAccepted ? t('chain.alreadyAdded') : t('chain.addNext')}</button> : onSelect ? <button type="button" className="button button-secondary button-small" onClick={() => onSelect(next)}>{t('chain.viewNext')}<ArrowRight size={14} /></button> : null}
            </div> : <div className="quest-chain-complete"><Check size={16} /><span>{t('chain.complete')}</span></div>}
        </section>
    );
}
