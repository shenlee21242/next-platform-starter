'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import {
    ArrowRight,
    Brain,
    Check,
    ChevronRight,
    Coins,
    Diamond,
    Dumbbell,
    MoonStar,
    Sparkles,
    X,
} from 'lucide-react';

export function formatNumber(value) {
    return new Intl.NumberFormat('en-US').format(value);
}

export function formatClock(totalSeconds) {
    const safe = Math.max(0, totalSeconds);
    const hours = Math.floor(safe / 3600);
    const minutes = Math.floor((safe % 3600) / 60);
    const seconds = safe % 60;
    return [hours, minutes, seconds].map((part) => String(part).padStart(2, '0')).join(':');
}

export function formatShortClock(totalSeconds) {
    const safe = Math.max(0, totalSeconds);
    const minutes = Math.floor(safe / 60);
    const seconds = safe % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function CategoryIcon({ category, size = 18, ...props }) {
    if (category === 'Physical') return <Dumbbell size={size} strokeWidth={1.7} {...props} />;
    if (category === 'Mental') return <Brain size={size} strokeWidth={1.7} {...props} />;
    if (category === 'Spiritual') return <MoonStar size={size} strokeWidth={1.7} {...props} />;
    return <Sparkles size={size} strokeWidth={1.7} {...props} />;
}

export function Currency({ type = 'gold', value, compact = false }) {
    const Icon = type === 'diamonds' ? Diamond : Coins;
    return (
        <span className={`currency currency-${type}`} title={type === 'diamonds' ? 'Diamonds' : 'Gold'}>
            <span className="currency-icon"><Icon size={compact ? 14 : 16} strokeWidth={1.7} /></span>
            <strong>{formatNumber(value)}</strong>
        </span>
    );
}

export function ProgressBar({ value, max = 100, tone = 'gold', className = '' }) {
    const percentage = Math.max(0, Math.min(100, (value / max) * 100));
    return (
        <div className={`progress-track ${className}`} role="progressbar" aria-valuenow={value} aria-valuemax={max}>
            <span className={`progress-fill progress-${tone}`} style={{ width: `${percentage}%` }} />
        </div>
    );
}

export function ScreenHeader({ eyebrow, title, description, children }) {
    return (
        <div className="screen-header">
            <div>
                {eyebrow && <div className="eyebrow">{eyebrow}</div>}
                <h1>{title}</h1>
                {description && <p>{description}</p>}
            </div>
            {children && <div className="screen-header-actions">{children}</div>}
        </div>
    );
}

export function Avatar({ name, initials, color, size = 'medium', image = false, online = false }) {
    return (
        <span className={`avatar avatar-${size}`} style={{ '--avatar-color': color || '#534a3d' }}>
            {image ? (
                <Image src="/images/aura-hero.png" alt={`${name}'s avatar`} fill sizes="80px" />
            ) : (
                <span>{initials || name?.slice(0, 2).toUpperCase()}</span>
            )}
            {online && <i className="online-dot" aria-label="Online" />}
        </span>
    );
}

export function PanelTitle({ eyebrow, title, meta, action, onAction }) {
    return (
        <div className="panel-title">
            <div>
                {eyebrow && <span className="panel-eyebrow">{eyebrow}</span>}
                <h2>{title}</h2>
            </div>
            {meta && <span className="panel-meta">{meta}</span>}
            {action && (
                <button className="text-button" onClick={onAction}>
                    {action}<ChevronRight size={15} />
                </button>
            )}
        </div>
    );
}

export function Modal({ children, onClose, className = '', label = 'Dialog' }) {
    useEffect(() => {
        const handleKey = (event) => {
            if (event.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleKey);
        const previous = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', handleKey);
            document.body.style.overflow = previous;
        };
    }, [onClose]);

    return (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClose();
        }}>
            <section className={`modal-card ${className}`} role="dialog" aria-modal="true" aria-label={label}>
                <button className="modal-close icon-button" onClick={onClose} aria-label="Close dialog"><X size={19} /></button>
                {children}
            </section>
        </div>
    );
}

export function EmptyState({ icon, title, description, action, onAction }) {
    return (
        <div className="empty-state">
            <div className="empty-state-icon">{icon}</div>
            <h3>{title}</h3>
            <p>{description}</p>
            {action && <button className="button button-secondary" onClick={onAction}>{action}<ArrowRight size={16} /></button>}
        </div>
    );
}

export function CheckButton({ checked, onClick, label }) {
    return (
        <button className={`quest-check ${checked ? 'is-checked' : ''}`} onClick={onClick} aria-label={label} aria-pressed={checked}>
            {checked && <Check size={16} strokeWidth={2.4} />}
        </button>
    );
}
