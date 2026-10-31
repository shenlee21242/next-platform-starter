'use client';

import { useEffect, useState } from 'react';
import { Clock3, Coins, Diamond, RotateCcw, Sparkles } from 'lucide-react';
import { getFateRank } from './fate';
import { useI18n } from './i18n';
import QuestArtwork from './quest-artwork';
import { CategoryIcon, formatNumber } from './ui';

function CardCorners() {
    return <div className="skill-card-corners" aria-hidden="true"><i /><i /><i /><i /></div>;
}

export default function QuestRankCard({ quest, compact = false, flippable = false, initialFace = 'front', className = '' }) {
    const { t, language, dir } = useI18n();
    const [face, setFace] = useState(initialFace);
    useEffect(() => setFace(initialFace), [quest.id, quest.sourceId, initialFace]);
    const rank = getFateRank(quest.rank || 'F');
    const title = quest.baseAction || quest.text || quest.title || '';
    const sourceId = quest.sourceId || quest.id;
    const skills = (quest.skillIds || []).map((id) => t(`skill.${id}`)).join(' · ');

    return (
        <div className={`skill-quest-card ${compact ? 'is-compact' : ''} ${flippable ? 'is-flippable' : ''} ${className}`} style={{ '--rank-color': rank.color }} dir={dir} lang={language} data-rank={quest.rank || 'F'} data-chain={quest.chainId || ''}>
            <div className={`skill-card-surface skill-card-${face}`} data-face={face} key={face}>
                <CardCorners />
                {face === 'back' ? (
                    <div className="skill-card-back-layout">
                        <span className="skill-card-brand">aura</span>
                        <i className="skill-card-star star-one" aria-hidden="true" />
                        <i className="skill-card-star star-two" aria-hidden="true" />
                        <div className="skill-card-rank-diamond" aria-label={t('card.tier', { rank: quest.rank || 'F' })}><span>{quest.rank || 'F'}</span></div>
                        <div className="skill-card-back-footer"><Sparkles size={20} strokeWidth={1.2} /><small>{t('card.tier', { rank: quest.rank || 'F' })}</small></div>
                    </div>
                ) : (
                    <div className="skill-card-front-layout">
                        <div className="skill-card-front-top"><span className="skill-card-brand">aura</span><span className="skill-card-rank-badge">{quest.rank || 'F'}</span></div>
                        <div className="skill-card-art"><QuestArtwork quest={{ ...quest, text: quest.text || quest.title }} decorative /></div>
                        <div className="skill-card-copy">
                            <div className="skill-card-overline"><span>{t('card.name')}</span><span><CategoryIcon category={quest.category} size={11} />{t(`category.${quest.category}`)}</span></div>
                            <h3 dir="auto">{title}</h3>
                            <div className="skill-card-skill"><span>{t('card.skill')}</span><strong>{skills}</strong></div>
                            {quest.chainId && <div className="skill-card-chain" aria-label={`${t('chain.label')}: ${t('chain.step', { step: quest.chainStep, total: quest.chainLength })}`}><div><span>{t('chain.label')}</span><strong>{quest.chainStep}/{quest.chainLength}</strong></div><div className="skill-card-chain-steps" aria-hidden="true">{Array.from({ length: quest.chainLength }, (_, index) => <i key={index} className={index + 1 === quest.chainStep ? 'active' : ''} />)}</div></div>}
                        </div>
                        <div className={`skill-card-rewards ${quest.diamonds > 0 ? 'with-diamonds' : ''}`}>
                            <div title={t('codex.experience')}><Sparkles size={13} /><span><strong>+{formatNumber(quest.xp)}</strong><small>XP</small></span></div>
                            <div title={t('codex.goldReward')}><Coins size={13} /><span><strong>+{formatNumber(quest.gold)}</strong><small>{t('common.gold')}</small></span></div>
                            <div title={t('quest.estimatedTime')}><Clock3 size={13} /><span><strong>{quest.duration}</strong><small>{t('common.minutesShort')}</small></span></div>
                            {quest.diamonds > 0 && <div title={t('common.diamonds')}><Diamond size={13} /><span><strong>+{quest.diamonds}</strong><small>{t('common.diamonds')}</small></span></div>}
                        </div>
                        <div className="skill-card-id">{sourceId}</div>
                    </div>
                )}
            </div>
            {flippable && <button type="button" className="skill-card-flip" onClick={() => setFace((current) => current === 'front' ? 'back' : 'front')}><RotateCcw size={14} />{face === 'front' ? t('card.flipToBack') : t('card.flipToFront')}</button>}
        </div>
    );
}
