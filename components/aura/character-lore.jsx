'use client';

import Image from 'next/image';
import { BookOpen, Check, MapPin, Sparkles } from 'lucide-react';
import { Modal } from './ui';

export default function CharacterLoreModal({ character, onClose, onSelect, selected = false }) {
    if (!character) return null;

    return (
        <Modal onClose={onClose} label={`${character.name} backstory`} className="character-lore-modal">
            <div className="character-lore-layout">
                <div className="character-lore-art">
                    <Image src={character.image} alt={`${character.name}, ${character.title}`} fill sizes="(max-width: 700px) 100vw, 360px" />
                    <div className="character-lore-art-shade" />
                    <span>{character.heroClass}</span>
                </div>
                <div className="character-lore-content">
                    <div className="eyebrow">CHARACTER BACKSTORY</div>
                    <h2>{character.name}</h2>
                    <p className="character-lore-title">{character.title}</p>
                    <div className="character-lore-meta">
                        <span><MapPin size={14} /> {character.origin}</span>
                        <span><Sparkles size={14} /> {character.specialty}</span>
                    </div>
                    <blockquote>“{character.quote}”</blockquote>
                    <div className="character-lore-story">
                        <BookOpen size={18} />
                        {character.backstory.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                    </div>
                    {onSelect && (
                        <button className={`button ${selected ? 'button-secondary' : 'button-primary'}`} onClick={() => { if (!selected) onSelect(character); onClose(); }} disabled={selected}>
                            {selected ? <><Check size={16} /> Current hero</> : `Choose ${character.name}`}
                        </button>
                    )}
                </div>
            </div>
        </Modal>
    );
}
