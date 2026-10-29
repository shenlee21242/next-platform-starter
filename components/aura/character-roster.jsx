'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { BookOpen, Check, Search, X } from 'lucide-react';
import { characters } from './characters';

const heroClasses = [...new Set(characters.map((character) => character.heroClass))];

function tiltCard(event) {
    if (event.pointerType !== 'mouse') return;
    const card = event.currentTarget;
    const bounds = card.getBoundingClientRect();
    const horizontal = (event.clientX - bounds.left) / bounds.width - 0.5;
    const vertical = (event.clientY - bounds.top) / bounds.height - 0.5;
    card.style.setProperty('--hero-rotate-y', `${horizontal * 5}deg`);
    card.style.setProperty('--hero-rotate-x', `${vertical * -5}deg`);
}

function resetTilt(event) {
    event.currentTarget.style.setProperty('--hero-rotate-y', '0deg');
    event.currentTarget.style.setProperty('--hero-rotate-x', '0deg');
}

export default function CharacterRoster({ selectedId, onSelect, onReadStory, variant = 'gallery' }) {
    const [query, setQuery] = useState('');
    const [gender, setGender] = useState('All');
    const [heroClass, setHeroClass] = useState('All');

    const filteredCharacters = useMemo(() => {
        const search = query.trim().toLowerCase();
        return characters.filter((character) => {
            const matchesGender = gender === 'All' || character.gender === gender;
            const matchesClass = heroClass === 'All' || character.heroClass === heroClass;
            const matchesSearch = !search || [character.name, character.title, character.origin, character.specialty, character.heroClass]
                .some((value) => value.toLowerCase().includes(search));
            return matchesGender && matchesClass && matchesSearch;
        });
    }, [query, gender, heroClass]);

    const hasFilters = query || gender !== 'All' || heroClass !== 'All';
    const clearFilters = () => {
        setQuery('');
        setGender('All');
        setHeroClass('All');
    };

    return (
        <div className={`character-roster roster-${variant}`}>
            <div className="roster-controls">
                <label className="roster-search">
                    <Search size={15} />
                    <span className="sr-only">Search characters</span>
                    <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, story, or specialty" />
                    {query && <button type="button" onClick={() => setQuery('')} aria-label="Clear character search"><X size={13} /></button>}
                </label>
                <div className="roster-filter-row">
                    <div className="roster-gender-filter" role="group" aria-label="Filter by gender">
                        {['All', 'Male', 'Female'].map((option) => (
                            <button type="button" key={option} className={gender === option ? 'active' : ''} onClick={() => setGender(option)} aria-pressed={gender === option}>
                                {option === 'All' ? 'All heroes' : option}
                            </button>
                        ))}
                    </div>
                    <label className="roster-class-filter">
                        <span className="sr-only">Filter by class</span>
                        <select value={heroClass} onChange={(event) => setHeroClass(event.target.value)}>
                            <option value="All">All paths</option>
                            {heroClasses.map((option) => <option key={option} value={option}>{option}</option>)}
                        </select>
                    </label>
                </div>
                <div className="roster-result-count">
                    <span>{filteredCharacters.length} of {characters.length} heroes</span>
                    {hasFilters && <button type="button" onClick={clearFilters}>Reset filters</button>}
                </div>
            </div>

            {filteredCharacters.length > 0 ? (
                <div className={variant === 'onboarding' ? 'hero-select-grid' : 'skins-grid'}>
                    {filteredCharacters.map((character) => {
                        const selected = selectedId === character.id;
                        const sharedProps = {
                            className: `${variant === 'onboarding' ? 'hero-select-card' : 'skin-card'} hero-3d-card ${selected ? variant === 'onboarding' ? 'active' : 'is-active' : ''}`,
                            onPointerMove: tiltCard,
                            onPointerLeave: resetTilt,
                        };

                        if (variant === 'onboarding') {
                            return (
                                <article key={character.id} {...sharedProps}>
                                    <button type="button" className="hero-select-portrait" onClick={() => onReadStory(character)} aria-label={`Read ${character.name}'s backstory`}>
                                        <Image src={character.image} alt={`${character.name}, ${character.title}`} fill sizes="(max-width: 560px) 42vw, 210px" />
                                        <span className="hero-select-class">{character.heroClass}</span>
                                        <span className="hero-select-story"><BookOpen size={11} /> Story</span>
                                        {selected && <span className="hero-selected-mark"><Check size={14} /></span>}
                                    </button>
                                    <div className="hero-select-copy">
                                        <div><strong>{character.name}</strong><span>{character.title}</span></div>
                                        <button type="button" className="hero-story-link" onClick={() => onSelect(character)} disabled={selected}>{selected ? 'Selected' : 'Choose'}</button>
                                    </div>
                                </article>
                            );
                        }

                        return (
                            <article key={character.id} {...sharedProps}>
                                <button type="button" className="skin-art" onClick={() => onReadStory(character)} aria-label={`Read ${character.name}'s backstory`}>
                                    <Image src={character.image} alt={`${character.name}, ${character.title}`} fill sizes="(max-width: 560px) 45vw, 260px" />
                                    {selected && <span className="skin-equipped"><Check size={12} /> EQUIPPED</span>}
                                    <span className="skin-story-hint"><BookOpen size={13} /> Read story</span>
                                </button>
                                <div className="skin-copy">
                                    <span>{character.heroClass}</span>
                                    <strong>{character.name}</strong>
                                    <small>{character.title}</small>
                                    <button type="button" className="hero-equip-button" onClick={() => onSelect(character.id)} disabled={selected}>{selected ? 'Current hero' : 'Choose hero'}</button>
                                </div>
                            </article>
                        );
                    })}
                </div>
            ) : (
                <div className="roster-empty">
                    <Search size={22} />
                    <strong>No heroes found</strong>
                    <p>Try another name or clear the filters to see the full collection.</p>
                    <button type="button" className="button button-secondary" onClick={clearFilters}>Show all heroes</button>
                </div>
            )}
        </div>
    );
}
