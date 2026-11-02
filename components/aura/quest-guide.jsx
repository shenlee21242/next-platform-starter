'use client';

import { ListChecks, Quote as QuoteIcon } from 'lucide-react';
import { getLifeQuestById } from './life-quests';
import { useI18n } from './i18n';

export default function QuestGuide({ quest }) {
    const { t, language, dir } = useI18n();
    if (!quest) return null;
    const archived = !quest.quote || !quest.howTo ? getLifeQuestById(quest.sourceId || quest.id, language) : null;
    const quote = quest.quote || archived?.quote;
    const howTo = quest.howTo || archived?.howTo;
    if (!quote && !howTo) return null;

    return (
        <section className="quest-guide" dir={dir} lang={language} aria-label={t('quest.guide')}>
            {quote && (
                <blockquote className="quest-guide-quote" dir="auto">
                    <QuoteIcon size={19} strokeWidth={1.4} aria-hidden="true" />
                    <div><span>{t('quest.wisdom')}</span><p>{quote}</p></div>
                </blockquote>
            )}
            {howTo && (
                <div className="quest-guide-how" dir="auto">
                    <h3><ListChecks size={17} strokeWidth={1.6} />{t('quest.howTo')}</h3>
                    <p>{howTo}</p>
                </div>
            )}
        </section>
    );
}
