'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { RotateCcw } from 'lucide-react';
import { getFateRank } from './fate';
import { useI18n } from './i18n';
import QuestArtwork from './quest-artwork';
import { formatNumber } from './ui';
import { AURA_CARD_COVER, getQuestCardTheme } from './card-themes';

const REWARD_ICONS = {
    gold: '◈', xp: '✧', duration: '◷', diamonds: '♦',
};

function RewardCell({ icon, value, label, color }) {
    return (
        <div className="skill-reward-cell">
            <span style={{ color }}>{REWARD_ICONS[icon]}</span>
            <div><strong>{icon === 'duration' ? '' : '+'}{formatNumber(value)}</strong><small>{label}</small></div>
        </div>
    );
}

export function AuraCoverArtwork({ className = '' }) {
    return (
        <div className={`aura-card-cover-art ${className}`}>
            <Image
                src={AURA_CARD_COVER}
                alt="AURA"
                fill
                sizes="(max-width: 700px) 78vw, 340px"
                draggable={false}
            />
        </div>
    );
}

export default function QuestRankCard({
    quest, compact = false, flippable = false, className = '',
    initialFace = 'front', face: controlledFace, onFaceChange,
}) {
    const { t, language, dir } = useI18n();
    const normalizedInitialFace = initialFace === 'back' ? 'character' : initialFace;
    const [internalFace, setInternalFace] = useState(normalizedInitialFace);
    const face = controlledFace ?? internalFace;
    useEffect(() => setInternalFace(normalizedInitialFace), [quest.id, quest.sourceId, normalizedInitialFace]);
    if (!quest) return null;
    const rank = getFateRank(quest.rank || 'F');
    const theme = getQuestCardTheme(quest.category);
    const title = quest.baseAction || quest.text || quest.title || '';
    const description = quest.text || quest.description || title;
    const sourceId = quest.sourceId || quest.id;
    const skills = (quest.skillIds || []).map((id) => t(`skill.${id}`));
    const rewards = [
        { icon: 'xp', value: quest.xp, label: 'XP', color: '#b99afb' },
        { icon: 'gold', value: quest.gold, label: t('common.gold'), color: '#e5b86b' },
        { icon: 'duration', value: quest.duration, label: t('common.minutesShort'), color: '#78c8ff' },
        ...(quest.diamonds > 0 ? [{ icon: 'diamonds', value: quest.diamonds, label: t('common.diamonds'), color: '#73d9ef' }] : []),
    ];
    const nextFace = { cover: 'character', character: 'front', front: 'cover' }[face] || 'front';
    const flipLabel = face === 'cover' ? t('card.showCharacter') : face === 'character' ? t('card.showQuest') : t('card.showCover');
    const cycleFace = () => {
        if (onFaceChange) onFaceChange(nextFace);
        if (controlledFace === undefined) setInternalFace(nextFace);
    };
    const cardStyle = {
        '--rank-color': rank.color,
        '--theme-color': theme.color, '--theme-secondary': theme.secondary,
    };

    return (
        <div className={`skill-quest-card ${compact ? 'is-compact' : ''} ${flippable ? 'is-flippable' : ''} card-face-${face} ${className}`} style={cardStyle} dir={dir} lang={language} data-card-theme={quest.category} data-rank={quest.rank || 'F'} data-chain={quest.chainId || ''}>
            <div className={`skill-card-surface themed-surface is-${face}`} data-face={face} key={face}>
                {face === 'cover' && <AuraCoverArtwork />}
                {face === 'character' && (
                    <div className="character-card-art">
                        <Image
                            src={theme.art}
                            alt={t(`category.${quest.category}`)}
                            fill
                            sizes="(max-width: 700px) 78vw, 340px"
                            style={{ filter: theme.filter }}
                            draggable={false}
                        />
                        <div className="character-art-shade" />
                        <div className="character-art-label">
                            <span>AURA · {t(`category.${quest.category}`)}</span>
                            <strong style={{ color: rank.color }}>{quest.rank || 'F'}</strong>
                        </div>
                    </div>
                )}
                {face === 'front' && (
                    <div className="themed-quest-front">
                        <Image
                            className="themed-front-background"
                            src={theme.art}
                            alt=""
                            fill
                            sizes="(max-width: 700px) 78vw, 340px"
                            style={{ filter: theme.filter }}
                            aria-hidden="true"
                            draggable={false}
                        />
                        <div className="themed-front-overlay" />
                        <div className="themed-ornate-frame">
                            <span className="frame-corner corner-tl" /><span className="frame-corner corner-tr" />
                            <span className="frame-corner corner-bl" /><span className="frame-corner corner-br" />
                            <header className="themed-front-header">
                                <span>AURA</span><strong style={{ color: rank.color }}>✦ {quest.rank || 'F'} ✦</strong>
                            </header>
                            <div className="themed-quest-kind">
                                <small>{quest.chainId ? t('card.chainQuest') : t('card.randomQuest')}</small>
                                <span>{t(`category.${quest.category}`)}</span>
                            </div>
                            <div className="themed-quest-window">
                                <QuestArtwork quest={{ ...quest, text: description }} decorative />
                                <div className="themed-window-copy">
                                    <h3 dir="auto">{title}</h3>
                                    <p dir="auto">{description}</p>
                                </div>
                            </div>
                            {!!skills.length && (
                                <div className="skill-card-skill themed-skill"><span>✦</span><div>{skills.map((skill) => <span key={skill}>{skill}</span>)}</div></div>
                            )}
                            <div className={`skill-card-rewards themed-rewards reward-count-${rewards.length}`}>
                                {rewards.map((reward) => <RewardCell key={reward.icon} {...reward} />)}
                            </div>
                            <footer className="themed-front-footer">
                                <span>{quest.chainId ? `${t('chain.label')} · ${quest.chainStep}/${quest.chainLength}` : t(`category.${quest.category}`)}</span>
                                <code>{sourceId}</code>
                            </footer>
                        </div>
                    </div>
                )}
            </div>
            {flippable && (
                <button type="button" className="skill-card-flip" onClick={cycleFace}>
                    <RotateCcw size={14} />{flipLabel}
                </button>
            )}
        </div>
    );
}
