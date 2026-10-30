'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ArrowRight, Check, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from 'lucide-react';
import { LanguageSwitcher, useI18n } from './i18n';

function AuthMark({ size = 38 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
            <path d="M20 3 35 12v16L20 37 5 28V12L20 3Z" stroke="currentColor" strokeWidth="1.3" />
            <path d="m20 8 10 20H10L20 8Z" stroke="currentColor" strokeWidth="1.3" />
            <path d="m14 23 6-11 6 11-6 5-6-5Z" fill="currentColor" fillOpacity=".16" stroke="currentColor" strokeWidth="1.1" />
            <circle cx="20" cy="20" r="2" fill="currentColor" />
        </svg>
    );
}

function nameFromEmail(email) {
    const raw = email.split('@')[0].replace(/[._-]+/g, ' ').trim();
    return raw ? raw.replace(/\b\w/g, (letter) => letter.toUpperCase()).slice(0, 24) : 'Aura Player';
}

export default function AuthScreen({ onAuthenticate }) {
    const { t } = useI18n();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [busy, setBusy] = useState('');

    const authenticate = (provider, providerEmail, name) => {
        setBusy(provider);
        setError('');
        onAuthenticate({ provider, email: providerEmail.toLowerCase(), name });
    };

    const submitEmail = (event) => {
        event.preventDefault();
        const normalized = email.trim().toLowerCase();
        if (!/^\S+@\S+\.\S+$/.test(normalized)) {
            setError(t('auth.validEmail'));
            return;
        }
        if (password.length < 6) {
            setError(t('auth.passwordLength'));
            return;
        }
        authenticate('email', normalized, nameFromEmail(normalized));
    };

    return (
        <div className="auth-screen">
            <div className="onboarding-visual auth-visual">
                <Image src="/images/aura-hero.png" alt="A ranger standing at the beginning of an epic journey" fill priority sizes="(max-width: 760px) 100vw, 45vw" />
                <div className="onboarding-visual-shade" />
                <div className="onboarding-visual-brand"><AuthMark size={38} /><span>AURA</span></div>
                <div className="onboarding-visual-copy">
                    <div className="eyebrow">{t('auth.eyebrow')}</div>
                    <h1>{t('auth.heroTitle')}</h1>
                    <p>{t('auth.heroDescription')}</p>
                    <div className="auth-benefits">
                        <span><Check size={13} /> Daily real-world quests</span>
                        <span><Check size={13} /> Character progression</span>
                        <span><Check size={13} /> Friends and friendly duels</span>
                    </div>
                </div>
            </div>
            <main className="auth-content">
                <div className="auth-form-wrap">
                    <div className="auth-language"><LanguageSwitcher /></div>
                    <div className="auth-mobile-brand"><AuthMark size={31} /><span>AURA</span></div>
                    <div className="eyebrow">{t('auth.welcome')}</div>
                    <h1>{t('auth.title')}</h1>
                    <p>{t('auth.description')}</p>

                    <div className="auth-provider-stack">
                        <button className="auth-provider google" disabled={!!busy} onClick={() => authenticate('google', 'google.player@aura.demo', 'Aura Player')}>
                            <span className="provider-mark google-mark">G</span>
                            <span>{busy === 'google' ? 'Connecting…' : 'Continue with Google'}</span>
                            <ArrowRight size={16} />
                        </button>
                        <button className="auth-provider facebook" disabled={!!busy} onClick={() => authenticate('facebook', 'facebook.player@aura.demo', 'Aura Player')}>
                            <span className="provider-mark facebook-mark">f</span>
                            <span>{busy === 'facebook' ? 'Connecting…' : 'Continue with Facebook'}</span>
                            <ArrowRight size={16} />
                        </button>
                    </div>

                    <div className="auth-divider"><i /><span>{t('auth.orEmail')}</span><i /></div>
                    <form className="aura-form auth-email-form" onSubmit={submitEmail} noValidate>
                        <label>
                            <span>{t('auth.email')}</span>
                            <div className="auth-input"><Mail size={16} /><input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required /></div>
                        </label>
                        <label>
                            <span>{t('auth.password')}</span>
                            <div className="auth-input"><LockKeyhole size={16} /><input type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder={t('auth.passwordPlaceholder')} required /><button type="button" onClick={() => setShowPassword((current) => !current)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></div>
                        </label>
                        {error && <div className="auth-error" role="alert">{error}</div>}
                        <button className="button button-primary button-full auth-submit" type="submit" disabled={!!busy}>{busy === 'email' ? '…' : t('auth.login')}<ArrowRight size={16} /></button>
                    </form>
                    <div className="auth-local-note"><ShieldCheck size={14} /><span>{t('auth.local')}</span></div>
                    <p className="auth-terms">By continuing, you choose to show up for yourself—one real quest at a time.</p>
                </div>
            </main>
        </div>
    );
}
