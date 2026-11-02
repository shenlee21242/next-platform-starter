'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Archive, Check, ChevronRight, FileImage, LockKeyhole, Scale, Shield, ShieldCheck, Upload, X } from 'lucide-react';
import { useI18n } from './i18n';
import { Modal, PanelTitle } from './ui';
import { getAvailablePenaltyCards, getPenaltyCard, normalizePenaltyContract, penaltyCards, PENALTY_RARITIES, PENALTY_RARITY_WEIGHTS } from './penalty-cards';

export function PenaltyJudgmentModal({ judgment, hasShield, onAccept, onShield, reducedMotion = false, contract = null }) {
    const { t, language } = useI18n();
    const [revealed, setRevealed] = useState(reducedMotion);
    const card = getPenaltyCard(judgment?.cardId, language);
    useEffect(() => {
        if (revealed) return undefined;
        const timer = window.setTimeout(() => setRevealed(true), 850);
        return () => window.clearTimeout(timer);
    }, [revealed]);
    if (!judgment || !card) return null;
    const isTrial = judgment.reason === 'developer-trial';
    const preselected = card.id === 'real-harsh-tribute' ? contract?.harshTributeTarget : card.id === 'real-private-confession' ? contract?.partnerName : '';
    return (
        <Modal dismissible={false} onClose={() => {}} label={t('judgment.title')} className={`judgment-modal rarity-${card.rarity.toLowerCase()}`}>
            <div className="judgment-aura" />
            <header className="judgment-heading">
                <span className="judgment-sigil"><Scale size={24} /></span>
                <div className="eyebrow">{t('judgment.eyebrow')}</div>
                {isTrial && <span className="judgment-trial-badge">{t('judgment.trialBadge')}</span>}
                <h2>{t('judgment.title')}</h2>
                <p>{t(isTrial ? 'judgment.trialDescription' : 'judgment.description')}</p>
                <small><LockKeyhole size={13} /> {t('judgment.noEffectYet')}</small>
            </header>
            <div className={`penalty-card-stage ${revealed ? 'is-revealed' : ''}`} aria-live="polite">
                {!revealed ? <div className="penalty-card-back"><Image src="/images/penalty-back.webp" alt="AURA card back" fill sizes="300px" priority /></div> : (
                    <article className="penalty-card-face">
                        <div className="penalty-card-art"><Image src="/images/penalty-sorceress.webp" alt="AURA judgment sorceress" fill sizes="300px" priority /></div>
                        <div className="penalty-card-copy">
                            <div><span className={`penalty-rarity rarity-text-${card.rarity.toLowerCase()}`}>{t(`rarity.${card.rarity}`)}</span><span>{card.realWorld ? t('contract.realCards') : t('contract.gameCards')}</span></div>
                            <h3 dir="auto">{card.name}</h3>
                            <strong dir="auto">{card.effectText}</strong>
                            <p dir="auto">“{card.text}”</p>
                        </div>
                    </article>
                )}
            </div>
            {!revealed ? <span className="judgment-revealing">{t('judgment.revealing')}</span> : (
                <div className="judgment-actions">
                    {card.realWorld && <p className="judgment-real-note"><ShieldCheck size={15} /> {t('judgment.realWorldNote')}</p>}
                    {preselected && <p className="judgment-preselected">{t('contract.preselected')}: <strong>{preselected}</strong></p>}
                    <button className="button button-primary button-full" onClick={() => onAccept(judgment)}><Check size={17} /> {t('judgment.accept')}</button>
                    <button className="button button-secondary button-full" disabled={!hasShield} onClick={() => onShield(judgment)}><Shield size={17} /> {t('judgment.shield')}</button>
                    {!hasShield && <small>{t('judgment.noShield')}</small>}
                </div>
            )}
        </Modal>
    );
}

export function PenaltyLedger({ judgments = [], onReview, onFulfill }) {
    const { t, language } = useI18n();
    const locale = { en: 'en-US', ar: 'ar-MA', fr: 'fr-FR', es: 'es-ES' }[language] || 'en-US';
    return (
        <section className="panel penalty-ledger" aria-label={t('ledger.title')}>
            <PanelTitle eyebrow={t('ledger.eyebrow')} title={t('ledger.title')} meta={`${judgments.length}`} />
            <p className="ledger-description">{t('ledger.description')}</p>
            {!judgments.length ? <div className="ledger-empty"><Archive size={25} /><span>{t('ledger.empty')}</span></div> : (
                <div className="ledger-list">
                    {judgments.slice(0, 30).map((judgment) => {
                        const card = getPenaltyCard(judgment.cardId, language);
                        if (!card) return null;
                        const date = new Date(judgment.createdAt);
                        return (
                            <article className={`ledger-entry ledger-${judgment.status}`} key={judgment.id}>
                                <span className="ledger-status-icon">{judgment.status === 'fulfilled' ? <Check size={17} /> : judgment.status === 'shielded' ? <Shield size={17} /> : <Scale size={17} />}</span>
                                <div className="ledger-entry-copy">
                                    <div><span className={`penalty-rarity rarity-text-${card.rarity.toLowerCase()}`}>{t(`rarity.${card.rarity}`)}</span><time dateTime={judgment.createdAt}>{Number.isNaN(date.getTime()) ? '' : new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(date)}</time></div>
                                    <h3 dir="auto">{card.name}</h3>
                                    <p dir="auto">{card.effectText}</p>
                                    <span className="ledger-status-label">{t(`ledger.${judgment.status}`)}</span>
                                    {judgment.reason === 'developer-trial' && <small>{t('ledger.trial')} · #{judgment.trialNumber}</small>}
                                    {judgment.protection && <small><ShieldCheck size={12} /> {judgment.protection}</small>}
                                    {judgment.note && <blockquote dir="auto">{judgment.note}</blockquote>}
                                </div>
                                {judgment.status === 'awaiting' && <button className="button button-secondary button-small" onClick={() => onReview(judgment)}>{t('ledger.review')} <ChevronRight size={14} /></button>}
                                {judgment.status === 'pending' && <button className="button button-secondary button-small" onClick={() => onFulfill(judgment)}>{t('ledger.fulfill')} <ChevronRight size={14} /></button>}
                            </article>
                        );
                    })}
                </div>
            )}
        </section>
    );
}

function ContractToggle({ checked, onChange, label, disabled = false }) {
    return <button type="button" className={`toggle ${checked ? 'is-on' : ''}`} role="switch" aria-checked={checked} aria-label={label} disabled={disabled} onClick={() => onChange(!checked)}><span /></button>;
}

export function PenaltyContractModal({ contract: initialContract, onClose, onSave }) {
    const { t, language } = useI18n();
    const [draft, setDraft] = useState(() => normalizePenaltyContract(initialContract));
    const [tab, setTab] = useState('rules');
    const [error, setError] = useState('');
    const toggleTier = (rarity) => setDraft((current) => ({ ...current, tiers: { ...current.tiers, [rarity]: !current.tiers[rarity] } }));
    const toggleCard = (card) => {
        const field = card.realWorld ? 'realWorldCardIds' : 'disabledCardIds';
        setDraft((current) => {
            const selected = card.realWorld ? current.realWorldCardIds.includes(card.id) : !current.disabledCardIds.includes(card.id);
            const ids = card.realWorld
                ? selected ? current.realWorldCardIds.filter((id) => id !== card.id) : [...current.realWorldCardIds, card.id]
                : selected ? [...current.disabledCardIds, card.id] : current.disabledCardIds.filter((id) => id !== card.id);
            return { ...current, [field]: ids };
        });
    };
    const save = () => {
        const eligible = getAvailablePenaltyCards(draft, 5, 3);
        if (draft.enabled && !eligible.length) { setError(t('contract.noCards')); return; }
        onSave(normalizePenaltyContract({ ...draft, realWorldContractVersion: 2 }));
    };
    const visibleCards = tab === 'real' ? penaltyCards.filter((card) => card.realWorld && !card.legacy) : penaltyCards.filter((card) => !card.realWorld);
    return (
        <Modal onClose={onClose} label={t('contract.title')} className="contract-modal">
            <div className="modal-heading"><span className="modal-heading-icon"><Scale size={22} /></span><div className="eyebrow">{t('judgment.eyebrow')}</div><h2>{t('contract.title')}</h2><p>{t('contract.description')}</p></div>
            <div className="contract-tabs" role="tablist">{[['rules', 'contract.rules'], ['game', 'contract.gameCards'], ['real', 'contract.realCards']].map(([id, key]) => <button type="button" role="tab" aria-selected={tab === id} className={tab === id ? 'active' : ''} onClick={() => setTab(id)} key={id}>{t(key)}</button>)}</div>
            <div className="contract-scroll">
                {tab === 'rules' ? <>
                    <div className="setting-row contract-enable-row"><div><strong>{t('contract.enabled')}</strong><p>{t('contract.enabledDescription')}</p></div><ContractToggle checked={draft.enabled} onChange={(enabled) => setDraft((current) => ({ ...current, enabled }))} label={t('contract.enabled')} /></div>
                    <div className="contract-rarities"><h3>{t('contract.severity')}</h3>{PENALTY_RARITIES.map((rarity) => <div className={`contract-rarity rarity-text-${rarity.toLowerCase()}`} key={rarity}><div><strong>{t(`rarity.${rarity}`)}</strong><span>{PENALTY_RARITY_WEIGHTS[rarity]}%</span></div><ContractToggle checked={draft.tiers[rarity]} onChange={() => toggleTier(rarity)} label={t(`rarity.${rarity}`)} /></div>)}<p><LockKeyhole size={14} /> {t('contract.legendaryRule')}</p></div>
                    <div className="contract-partner"><h3>{t('contract.partner')}</h3><div className="form-row"><label><span>{t('contract.partnerName')}</span><input value={draft.partnerName} maxLength={60} onChange={(event) => setDraft((current) => ({ ...current, partnerName: event.target.value }))} /></label><label><span>{t('contract.partnerContact')}</span><input value={draft.partnerContact} maxLength={100} onChange={(event) => setDraft((current) => ({ ...current, partnerContact: event.target.value }))} /></label></div><small>{t('contract.partnerHint')}</small></div>
                    <div className="contract-partner"><h3>{t('contract.tributeTarget')}</h3><label><span>{t('contract.tributeTarget')}</span><input value={draft.harshTributeTarget} placeholder={t('contract.tributeTargetPlaceholder')} maxLength={100} onChange={(event) => setDraft((current) => ({ ...current, harshTributeTarget: event.target.value }))} /></label><small>{t('contract.tributeTargetHint')}</small></div>
                    <div className="contract-safety"><ShieldCheck size={18} /><p>{t('contract.safe')}</p></div>
                </> : <div className="contract-card-list">{visibleCards.map((rawCard) => {
                    const card = getPenaltyCard(rawCard.id, language);
                    const selected = card.realWorld ? draft.realWorldCardIds.includes(card.id) : !draft.disabledCardIds.includes(card.id);
                    const tierEnabled = draft.tiers[card.rarity];
                    return <div className={`contract-card-row ${selected && tierEnabled ? 'selected' : ''} ${card.realWorld && card.rarity === 'Legendary' ? 'real-legendary' : ''}`} key={card.id}><div><span className={`penalty-rarity rarity-text-${card.rarity.toLowerCase()}`}>{t(`rarity.${card.rarity}`)} · {PENALTY_RARITY_WEIGHTS[card.rarity]}%</span><h3 dir="auto">{card.name}</h3><p dir="auto">{card.effectText}</p></div><ContractToggle checked={selected} onChange={() => toggleCard(card)} label={card.name} /></div>;
                })}</div>}
            </div>
            {error && <p className="form-error" role="alert">{error}</p>}
            <div className="contract-footer"><span>{draft.enabled ? t('contract.active') : t('contract.inactive')}</span><button className="button button-primary" onClick={save}><Check size={16} /> {t('goal.saveChanges')}</button></div>
        </Modal>
    );
}

async function imageToProof(file) {
    if (!file?.type.startsWith('image/')) return null;
    const url = URL.createObjectURL(file);
    try {
        const image = await new Promise((resolve, reject) => {
            const element = new window.Image();
            element.onload = () => resolve(element);
            element.onerror = reject;
            element.src = url;
        });
        const scale = Math.min(1, 480 / Math.max(image.naturalWidth, image.naturalHeight));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
        canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL('image/jpeg', 0.65);
    } finally {
        URL.revokeObjectURL(url);
    }
}

export function PenaltyFulfillmentModal({ judgment, onClose, onComplete }) {
    const { t, language } = useI18n();
    const [note, setNote] = useState(judgment?.note || '');
    const [proof, setProof] = useState(judgment?.proof || null);
    const card = getPenaltyCard(judgment?.cardId, language);
    if (!card) return null;
    return (
        <Modal onClose={onClose} label={t('ledger.fulfill')} className="fulfillment-modal">
            <div className="modal-heading"><span className="modal-heading-icon"><Archive size={22} /></span><div className="eyebrow">{t('ledger.eyebrow')}</div><h2>{card.name}</h2><p>{card.effectText}</p></div>
            <p className="fulfillment-honor"><ShieldCheck size={17} /> {t('ledger.honor')}</p>
            <label className="fulfillment-note"><span>{t('ledger.note')}</span><textarea value={note} maxLength={500} onChange={(event) => setNote(event.target.value)} placeholder={t('ledger.notePlaceholder')} rows={4} /></label>
            <div className="fulfillment-proof"><span>{t('ledger.proof')}</span>{proof ? <div className="proof-preview"><img src={proof} alt={t('ledger.proof')} /><button className="icon-button" onClick={() => setProof(null)} aria-label={t('common.cancel')}><X size={16} /></button></div> : <label className="proof-upload"><Upload size={18} /><span>{t('ledger.proof')}</span><input type="file" accept="image/*" onChange={async (event) => { const next = await imageToProof(event.target.files?.[0]); if (next) setProof(next); }} /></label>}</div>
            <button className="button button-primary button-full" onClick={() => onComplete(judgment, { note: note.trim(), proof })}><FileImage size={16} /> {t('ledger.fulfill')}</button>
        </Modal>
    );
}
