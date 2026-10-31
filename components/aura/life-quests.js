import religious from './life-content/religious.mjs';
import psychological from './life-content/psychological.mjs';
import physical from './life-content/physical.mjs';
import mental from './life-content/mental.mjs';
import selfDevelopment from './life-content/self-development.mjs';
import social from './life-content/social.mjs';
import { a } from './life-content/shared.mjs';

export const SUPPORTED_LANGUAGES = ['en', 'ar', 'fr', 'es'];
export const lifeCategories = [religious, psychological, physical, mental, selfDevelopment, social];
export const lifeQuestCount = lifeCategories.reduce((total, category) => total + category.perRank * 9, 0);

export const FATE_DRAW_FEE_RATIO = 0.2;

// A Fate draw is a small commitment fee, not a guaranteed economic loss.
// The base completion reward is five times the draw fee; the regular daily cap still applies.
export const rankDefinitions = [
    { rank: 'F', label: 'Initiate', xp: 20, gold: 10, diamonds: 0, duration: 10, color: '#a9b0ba' },
    { rank: 'E', label: 'Novice', xp: 50, gold: 25, diamonds: 0, duration: 15, color: '#75d6ae' },
    { rank: 'D', label: 'Apprentice', xp: 100, gold: 50, diamonds: 0, duration: 20, color: '#75b9d1' },
    { rank: 'C', label: 'Adept', xp: 250, gold: 100, diamonds: 0, duration: 25, color: '#4cd7f6' },
    { rank: 'B', label: 'Expert', xp: 500, gold: 250, diamonds: 0, duration: 45, color: '#7f9ee8' },
    { rank: 'A', label: 'Master', xp: 1000, gold: 500, diamonds: 0, duration: 60, color: '#c4a5ff' },
    { rank: 'S', label: 'Grandmaster', xp: 2500, gold: 1000, diamonds: 1, duration: 90, color: '#ffc174' },
    { rank: 'SS', label: 'Heroic', xp: 5000, gold: 2500, diamonds: 2, duration: 120, color: '#ef8d72' },
    { rank: 'SSS', label: 'Legendary', xp: 10000, gold: 5000, diamonds: 3, duration: 180, color: '#f0a8e0' },
].map((rank) => ({ ...rank, price: Math.max(1, Math.round(rank.gold * FATE_DRAW_FEE_RATIO)) }));

export const LIFE_CHAIN_LENGTH = rankDefinitions.length;
export const lifeQuestChainCount = lifeCategories.reduce((total, category) => total + category.perRank / 2, 0);
export const lifeQuestSequentialCount = lifeQuestChainCount * LIFE_CHAIN_LENGTH;

const rankDirectives = [
    a('خطوة البداية', 'First step', 'Premier pas', 'Primer paso'),
    a('تحدي الاستكشاف', 'Explorer challenge', 'Défi de l’explorateur', 'Reto de exploración'),
    a('تحدي المبتدئ الجاد', 'Committed beginner challenge', 'Défi du débutant assidu', 'Reto del principiante constante'),
    a('تحدي الممارس', 'Practitioner challenge', 'Défi du pratiquant', 'Reto del practicante'),
    a('تحدي المتقدم', 'Advanced challenge', 'Défi avancé', 'Reto avanzado'),
    a('تحدي الإتقان', 'Mastery challenge', 'Défi de maîtrise', 'Reto de maestría'),
    a('تحدي الخبير', 'Expert challenge', 'Défi d’expert', 'Reto de experto'),
    a('تحدي البطل', 'Heroic challenge', 'Défi héroïque', 'Reto heroico'),
    a('التحدي الأسطوري', 'Legendary challenge', 'Défi légendaire', 'Reto legendario'),
];

const rankProofs = [
    a('دليل الإنجاز: سجّل وقت التنفيذ وكلمة عن سهولة الخطوة.', 'Completion evidence: log when you did it and one word about how manageable it felt.', 'Preuve : note l’heure et un mot sur la facilité du pas.', 'Evidencia: registra cuándo lo hiciste y una palabra sobre lo sencillo que resultó.'),
    a('دليل الإنجاز: أضف تسجيلًا من سطرين وحدد موعد التكرار.', 'Completion evidence: add a two-line log and schedule the next repetition.', 'Preuve : ajoute deux lignes de journal et fixe la prochaine répétition.', 'Evidencia: añade dos líneas de registro y programa la próxima repetición.'),
    a('دليل الإنجاز: سجّل ما أنجزته وعائقًا واحدًا ستزيله.', 'Completion evidence: record the result and one obstacle you will remove.', 'Preuve : note le résultat et un obstacle à supprimer.', 'Evidencia: registra el resultado y un obstáculo que eliminarás.'),
    a('دليل الإنجاز: أرفق سجل الجلسات وأثرًا واحدًا يمكن التحقق منه.', 'Completion evidence: attach a session log and one verifiable output.', 'Preuve : joins le journal des séances et un résultat vérifiable.', 'Evidencia: adjunta el registro de sesiones y un resultado verificable.'),
    a('دليل الإنجاز: راجع جودة التنفيذ وسجّل ثلاث ملاحظات.', 'Completion evidence: review quality and record three observations.', 'Preuve : vérifie la qualité et note trois observations.', 'Evidencia: revisa la calidad y registra tres observaciones.'),
    a('دليل الإنجاز: قارن النتيجة بخطتك واكتب درسًا وتحسينًا.', 'Completion evidence: compare the result with your plan; write one lesson and improvement.', 'Preuve : compare au plan et note une leçon et une amélioration.', 'Evidencia: compara el resultado con tu plan; escribe una lección y una mejora.'),
    a('دليل الإنجاز: أرفق سجلًا أسبوعيًا وملخصًا عن الأثر.', 'Completion evidence: attach a weekly log and an impact summary.', 'Preuve : joins un journal hebdomadaire et un résumé de l’impact.', 'Evidencia: adjunta un registro semanal y un resumen del impacto.'),
    a('دليل الإنجاز: أرفق سجلًا تراكميًا ومراجعة لمنع الانتكاس.', 'Completion evidence: attach a cumulative log and a relapse-prevention review.', 'Preuve : joins un journal cumulatif et une revue de prévention de la rechute.', 'Evidencia: adjunta un registro acumulativo y una revisión para prevenir recaídas.'),
    a('دليل الإنجاز: أنشئ ملف إنجاز وخطة ثلاثين يومًا لاستدامة الأثر.', 'Completion evidence: create a portfolio and a thirty-day plan to sustain the benefit.', 'Preuve : crée un portfolio et un plan de trente jours pour durablement ancrer le bénéfice.', 'Evidencia: crea un portafolio y un plan de treinta días para mantener el beneficio.'),
];

const values = {
    pages: [1, 2, 4, 7, 10, 15, 20, 30, 40],
    journalPages: [1, 1, 2, 3, 4, 5, 7, 10, 15],
    verses: [1, 2, 3, 5, 7, 10, 15, 20, 30],
    minutes: [2, 5, 10, 15, 20, 30, 45, 60, 90],
    shortMinutes: [2, 3, 5, 8, 10, 15, 20, 25, 30],
    reps: [3, 5, 8, 12, 16, 20, 30, 40, 50],
    seconds: [10, 15, 20, 30, 40, 50, 60, 75, 90],
    days: [1, 2, 3, 5, 7, 14, 30, 60, 90],
    fastDays: [1, 1, 2, 2, 3, 4, 6, 8, 12],
    acts: [1, 2, 3, 4, 5, 7, 10, 14, 20],
    sessions: [1, 2, 3, 4, 5, 7, 10, 14, 21],
    ideas: [1, 2, 3, 4, 5, 7, 10, 15, 20],
    words: [3, 5, 10, 15, 20, 30, 50, 75, 100],
    problems: [1, 2, 3, 5, 7, 10, 15, 20, 30],
    repetitions: [10, 33, 50, 100, 150, 200, 300, 500, 1000],
    texts: [1, 2, 3, 4, 5, 7, 10, 15, 20],
    book: [3, 5, 10, 20, 30, 50, 100, 1, 2],
    writing: [50, 100, 200, 500, 1000, 2000, 3000, 5000, 1],
};

const planMilestones = [
    a('حدّد الهدف والنتيجة في سطر واحد', 'Define the goal and outcome in one sentence', 'Définis le but et le résultat en une phrase', 'Define el objetivo y el resultado en una frase'),
    a('اجمع الموارد وجهات الدعم المناسبة', 'Collect suitable resources and support contacts', 'Rassemble les ressources et contacts de soutien appropriés', 'Reúne recursos y contactos de apoyo adecuados'),
    a('أنشئ نموذجًا أوليًا أو مسودة بسيطة', 'Create a simple prototype or draft', 'Crée un prototype ou un brouillon simple', 'Crea un prototipo o borrador sencillo'),
    a('طبّق أصغر جزء صالح للاستخدام', 'Implement the smallest useful part', 'Mets en œuvre la plus petite partie utile', 'Aplica la parte útil más pequeña'),
    a('حسّن الخطة بعد مراجعة وتجربة موثقة', 'Improve the plan after a documented review and test', 'Améliore le plan après une révision et un test documentés', 'Mejora el plan tras una revisión y prueba documentadas'),
    a('طبّق الخطة كاملة وسجّل النتائج', 'Implement the full plan and record results', 'Applique le plan complet et consigne les résultats', 'Aplica el plan completo y registra los resultados'),
    a('تابع التطبيق أربعة أسابيع مع مراجعة أسبوعية', 'Follow the plan for four weeks with weekly reviews', 'Suis le plan quatre semaines avec une revue hebdomadaire', 'Sigue el plan cuatro semanas con revisiones semanales'),
    a('راجع النتائج ثمانية أسابيع ووثّق الدروس', 'Review results for eight weeks and document lessons', 'Évalue les résultats pendant huit semaines et documente les leçons', 'Revisa los resultados durante ocho semanas y documenta las lecciones'),
    a('حافظ على النظام تسعين يومًا وشارك ما ينفع بأمان', 'Sustain the system for ninety days and safely share what helps', 'Maintiens le système quatre-vingt-dix jours et partage prudemment ce qui aide', 'Mantén el sistema noventa días y comparte con seguridad lo que ayuda'),
];

const unitNames = {
    pages: a(['صفحة واحدة', 'صفحتان', 'صفحات', 'صفحة'], ['page', 'pages'], ['page', 'pages'], ['página', 'páginas']),
    journalPages: a(['صفحة واحدة', 'صفحتان', 'صفحات', 'صفحة'], ['page', 'pages'], ['page', 'pages'], ['página', 'páginas']),
    verses: a(['آية واحدة', 'آيتان', 'آيات', 'آية'], ['verse', 'verses'], ['verset', 'versets'], ['versículo', 'versículos']),
    minutes: a(['دقيقة واحدة', 'دقيقتان', 'دقائق', 'دقيقة'], ['minute', 'minutes'], ['minute', 'minutes'], ['minuto', 'minutos']),
    shortMinutes: a(['دقيقة واحدة', 'دقيقتان', 'دقائق', 'دقيقة'], ['minute', 'minutes'], ['minute', 'minutes'], ['minuto', 'minutos']),
    reps: a(['تكرار واحد', 'تكراران', 'تكرارات', 'تكرارًا'], ['repetition', 'repetitions'], ['répétition', 'répétitions'], ['repetición', 'repeticiones']),
    seconds: a(['ثانية واحدة', 'ثانيتان', 'ثوانٍ', 'ثانية'], ['second', 'seconds'], ['seconde', 'secondes'], ['segundo', 'segundos']),
    days: a(['يوم واحد', 'يومان', 'أيام', 'يومًا'], ['day', 'days'], ['jour', 'jours'], ['día', 'días']),
    fastDays: a(['يوم صيام واحد', 'يوما صيام', 'أيام صيام', 'يوم صيام'], ['fasting day', 'fasting days'], ['jour de jeûne', 'jours de jeûne'], ['día de ayuno', 'días de ayuno']),
    acts: a(['عمل واحد', 'عملان', 'أعمال', 'عملًا'], ['action', 'actions'], ['action', 'actions'], ['acción', 'acciones']),
    sessions: a(['جلسة واحدة', 'جلستان', 'جلسات', 'جلسة'], ['session', 'sessions'], ['séance', 'séances'], ['sesión', 'sesiones']),
    ideas: a(['فكرة واحدة', 'فكرتان', 'أفكار', 'فكرة'], ['idea', 'ideas'], ['idée', 'idées'], ['idea', 'ideas']),
    words: a(['كلمة واحدة', 'كلمتان', 'كلمات', 'كلمة'], ['word', 'words'], ['mot', 'mots'], ['palabra', 'palabras']),
    problems: a(['مسألة واحدة', 'مسألتان', 'مسائل', 'مسألة'], ['problem', 'problems'], ['problème', 'problèmes'], ['problema', 'problemas']),
    repetitions: a(['مرة واحدة', 'مرتان', 'مرات', 'مرة'], ['repetition', 'repetitions'], ['répétition', 'répétitions'], ['repetición', 'repeticiones']),
    texts: a(['نص واحد', 'نصان', 'نصوص', 'نصًا'], ['text', 'texts'], ['texte', 'textes'], ['texto', 'textos']),
};

function formatDose(unit, rankIndex, locale) {
    if (unit === 'plan') return planMilestones[rankIndex][locale];
    if (unit === 'book' && rankIndex >= 7) {
        if (rankIndex === 7) return a('كتاب كامل واحد', 'one complete book', 'un livre complet', 'un libro completo')[locale];
        return a('كتابين كاملين خلال أسبوع', 'two complete books within one week', 'deux livres complets en une semaine', 'dos libros completos en una semana')[locale];
    }
    if (unit === 'writing' && rankIndex === 8) return a('كتاب قصير مكتمل', 'one complete short book', 'un court livre complet', 'un libro corto completo')[locale];
    const count = (values[unit] || values.sessions)[rankIndex];
    if (unit === 'book' || unit === 'writing') {
        const key = unit === 'book' ? 'pages' : 'words';
        const names = unitNames[key][locale];
        return locale === 'ar' ? formatArabicCount(count, names) : `${count} ${count === 1 ? names[0] : names[1]}`;
    }
    const names = unitNames[unit][locale];
    if (locale === 'ar') return formatArabicCount(count, names);
    return `${count.toLocaleString(locale === 'fr' ? 'fr-FR' : 'es-ES')} ${count === 1 ? names[0] : names[1]}`;
}

function formatArabicCount(count, names) {
    if (count === 1) return names[0];
    if (count === 2) return names[1];
    if (count <= 10) return `${count} ${names[2]}`;
    return `${count.toLocaleString('en-US')} ${names[3]}`;
}

function normalizeLocale(locale) {
    return SUPPORTED_LANGUAGES.includes(locale) ? locale : 'en';
}

export function createLifeQuest(categoryId, baseIndex, rankIndex, locale = 'en') {
    const language = normalizeLocale(locale);
    const category = lifeCategories.find((item) => item.id === categoryId);
    if (!category) throw new Error(`Unknown life quest category: ${categoryId}`);
    const rank = rankDefinitions[rankIndex];
    if (!rank) throw new Error(`Unknown life quest rank index: ${rankIndex}`);
    const actionCount = category.actions.length;
    const totalBase = actionCount * category.contexts.length;
    if (!Number.isInteger(baseIndex) || baseIndex < 0 || baseIndex >= totalBase) throw new Error(`Invalid ${categoryId} base quest index: ${baseIndex}`);
    const actionIndex = baseIndex % actionCount;
    const contextIndex = Math.floor(baseIndex / actionCount);
    const action = category.actions[actionIndex];
    const context = category.contexts[contextIndex];
    const id = `${category.prefix}-${String(baseIndex + 1).padStart(4, '0')}-${rank.rank}`;
    const isSequential = baseIndex < category.perRank / 2;
    const chainId = isSequential ? `${category.prefix}-CHAIN-${String(baseIndex + 1).padStart(4, '0')}` : null;
    const questIdAtRank = (index) => `${category.prefix}-${String(baseIndex + 1).padStart(4, '0')}-${rankDefinitions[index].rank}`;
    const dose = formatDose(action.unit, rankIndex, language);
    const separator = language === 'ar' ? '؛ ' : '; ';
    const text = `${rankDirectives[rankIndex][language]}: ${action.action[language]} — ${dose}${separator}${context[language]}.`;
    const completion = rankProofs[rankIndex][language];
    const baseAction = action.action[language];
    const description = `${baseAction} — ${context[language]}. ${completion}`;
    return {
        id,
        sourceId: id,
        rank: rank.rank,
        rankIndex,
        category: category.id,
        text,
        xp: rank.xp,
        gold: rank.gold,
        diamonds: rank.diamonds,
        duration: rank.duration,
        description,
        completion,
        image: `aura-art://${id.toLowerCase()}`,
        generatedArt: true,
        skillIds: category.skills,
        baseAction,
        context: context[language],
        sourceCodes: action.sources || category.sources,
        language: language,
        baseIndex,
        unit: action.unit,
        isSequential,
        chainId,
        chainStep: isSequential ? rankIndex + 1 : null,
        chainLength: isSequential ? LIFE_CHAIN_LENGTH : null,
        previousQuestId: isSequential && rankIndex > 0 ? questIdAtRank(rankIndex - 1) : null,
        nextQuestId: isSequential && rankIndex < LIFE_CHAIN_LENGTH - 1 ? questIdAtRank(rankIndex + 1) : null,
    };
}

export function getLifeQuestBank(locale = 'en') {
    const quests = [];
    for (const category of lifeCategories) {
        for (let rankIndex = 0; rankIndex < rankDefinitions.length; rankIndex += 1) {
            for (let baseIndex = 0; baseIndex < category.perRank; baseIndex += 1) {
                quests.push(createLifeQuest(category.id, baseIndex, rankIndex, locale));
            }
        }
    }
    return quests;
}

export function getLifeQuestById(id, locale = 'en') {
    const match = /^(DN|PS|BD|MN|SD|SC)-(\d{4})-(SSS|SS|S|F|E|D|C|B|A)$/.exec(id || '');
    if (!match) return null;
    const category = lifeCategories.find((item) => item.prefix === match[1]);
    const rankIndex = rankDefinitions.findIndex((item) => item.rank === match[3]);
    return category && rankIndex >= 0 ? createLifeQuest(category.id, Number(match[2]) - 1, rankIndex, locale) : null;
}

export function getLifeQuestChain(chainId, locale = 'en') {
    const match = /^(DN|PS|BD|MN|SD|SC)-CHAIN-(\d{4})$/.exec(chainId || '');
    if (!match) return [];
    const category = lifeCategories.find((item) => item.prefix === match[1]);
    const baseIndex = Number(match[2]) - 1;
    if (!category || baseIndex < 0 || baseIndex >= category.perRank / 2) return [];
    return rankDefinitions.map((_, rankIndex) => createLifeQuest(category.id, baseIndex, rankIndex, locale));
}

export function localizeLifeQuest(quest, locale = 'en') {
    if (!quest?.generatedArt && !quest?.sourceId) return quest;
    const localized = getLifeQuestById(quest.sourceId || quest.id, locale);
    if (!localized) return quest;
    const translated = { ...quest, ...localized, id: quest.id, sourceId: localized.id, done: quest.done };
    if (quest.title) translated.title = quest.title.startsWith(`${quest.rank} · `) ? `${localized.rank} · ${localized.text}` : localized.text;
    return translated;
}

export const LIFE_REFERENCES = [
    ['QURAN', 'القرآن الكريم', 'المصدر التشريعي الأول؛ استُلهمت منه العبادات والأخلاق والرحمة والعدل وصلة الرحم وحدود التعامل.'],
    ['SUNNAH', 'صحيح البخاري وصحيح مسلم', 'مرجعا السنة الأساسيان في النية والصلاة والذكر والصدقة والصدق والأمانة وحسن الخلق.'],
    ['RIYAD', 'رياض الصالحين — يحيى بن شرف النووي', 'تنظيم أعمال القلوب والعبادات والآداب؛ لا تُستخدم الأحاديث خارج سياقها.'],
    ['NAVAWI40', 'الأربعون النووية — يحيى بن شرف النووي', 'أصول النية والدين والنصيحة والأخلاق والالتزام.'],
    ['ADHKAR', 'الأذكار — يحيى بن شرف النووي', 'أوراد اليوم والليلة والدعاء والذكر مع مراعاة حضور القلب.'],
    ['MADARIJ', 'مدارج السالكين — ابن قيم الجوزية', 'مرجع تربوي في النية والقلب والسير؛ يُقرأ بتمييز ولا يساوي نصوص الوحي.'],
    ['SIRAH', 'السيرة النبوية والتاريخ الإسلامي', 'دروس القدوة والصبر والعدل؛ دون تصوير مباشر للشخصيات المقدسة.'],
    ['KNOWLEDGE', 'مراجع التفسير والفقه المعتمدة لدى أهل العلم', 'الرجوع لمختص في المسائل الخلافية والحالات الشخصية.'],
    ['CBT', 'Judith Beck — Cognitive Behavior Therapy: Basics and Beyond', 'سجل الأفكار والدليل والبدائل المتوازنة والتنشيط السلوكي.'],
    ['FEELING_GOOD', 'David Burns — Feeling Good', 'تدريبات معرفية مساندة؛ ليست بديلًا عن العلاج.'],
    ['ACT', 'Russ Harris — The Happiness Trap / ACT', 'القيم والقبول واللحظة الحالية والفعل الهادف.'],
    ['DBT', 'Marsha Linehan — DBT Skills Training Manual', 'التنظيم الانفعالي وتحمل الضيق والفاعلية في العلاقات.'],
    ['WHO_STRESS', 'WHO — Doing What Matters in Times of Stress', 'التجذير والتنفس والقيم والتعامل مع الضغط.'],
    ['BEHAVIORAL_ACTIVATION', 'Martell, Addis & Jacobson — Behavioral Activation', 'خطوات نشطة ذات معنى عند انخفاض الدافع.'],
    ['SELF_COMPASSION', 'Kristin Neff — Self-Compassion', 'اللطف الواقعي مع الذات دون إنكار المسؤولية.'],
    ['SDT', 'Deci & Ryan — Self-Determination Theory', 'الاستقلال والكفاءة والانتماء ودعم القرار دون سيطرة.'],
    ['MI', 'Miller & Rollnick — Motivational Interviewing', 'الأسئلة المفتوحة والانعكاس واحترام استقلال القرار.'],
    ['PSYCHIATRY', 'APA DSM-5-TR / WHO ICD-11 / Kaplan & Sadock', 'للفهم المهني والإحالة؛ لا تستخدم البطاقات للتشخيص أو تعديل الدواء.'],
    ['RELAPSE_PREVENTION', 'Marlatt & Gordon — Relapse Prevention', 'المؤشرات المبكرة وخطط الاستقرار والدعم.'],
    ['EMOTIONAL_AGILITY', 'Susan David — Emotional Agility', 'تسمية المشاعر والتصرف بما ينسجم مع القيم.'],
    ['POSITIVE_PSYCH', 'Martin Seligman — Flourish', 'العلاقات والمعنى والإنجاز والمشاعر الإيجابية الواقعية.'],
    ['MBSR', 'Jon Kabat-Zinn — Full Catastrophe Living', 'اليقظة والمسح الجسدي والاستجابة الواعية.'],
    ['WHO_PA', 'WHO Guidelines on Physical Activity and Sedentary Behaviour', 'النشاط المنتظم وتقليل الجلوس مع التدرج والسلامة.'],
    ['ACSM', 'ACSM’s Guidelines for Exercise Testing and Prescription', 'مبادئ الإحماء والجرعة والتعافي والتكييف الفردي.'],
    ['NSCA', 'NSCA — Essentials of Strength Training and Conditioning', 'جودة الحركة والتدرج ومجموعات التمرين والراحة.'],
    ['AASM', 'American Academy of Sleep Medicine guidance', 'ثبات النوم وروتين ما قبل النوم؛ الأرق المزمن يحتاج تقييمًا مختصًا.'],
    ['WHO_DIET', 'WHO — Healthy Diet guidance', 'التنوع والخضروات والألياف وتقليل المشروبات المحلاة دون حميات متطرفة.'],
    ['MINDFUL_EATING', 'Evidence-informed mindful eating practice', 'الانتباه للجوع والشبع دون وصم الطعام أو الجسد.'],
    ['ORAL_HEALTH', 'WHO oral health guidance', 'العناية اليومية بالفم والأسنان والفحص المهني.'],
    ['PREVENTIVE_CARE', 'Evidence-based preventive care principles', 'الفحوص والمتابعة بحسب العمر والحالة وإرشاد المختص.'],
    ['MAKE_IT_STICK', 'Brown, Roediger & McDaniel — Make It Stick', 'الاسترجاع والتباعد والتنويع والاختبار الذاتي.'],
    ['DEEP_WORK', 'Cal Newport — Deep Work', 'تركيز بلا تشتيت ومخرجات معرفية واضحة.'],
    ['PEAK', 'Ericsson & Pool — Peak', 'الممارسة الهادفة والتغذية الراجعة والتدرج.'],
    ['LEARNING', 'Evidence-informed learning science', 'الربط والتفسير والتطبيق بدل القراءة السلبية.'],
    ['ORGANIZED_MIND', 'Daniel Levitin — The Organized Mind', 'التفريغ الخارجي والتنظيم وتقليل الحمل المعرفي.'],
    ['MEMORY', 'Evidence-informed memory and mnemonic practice', 'القصر الذهني والاسترجاع والمثال الحسي.'],
    ['WRITING', 'William Zinsser — On Writing Well', 'الوضوح والتركيز والمراجعة والكتابة لغرض.'],
    ['CRITICAL_THINKING', 'Stella Cottrell — Critical Thinking Skills', 'تحليل الحجة والدليل والافتراض والاعتراض.'],
    ['DIGITAL_LITERACY', 'UNESCO media and information literacy principles', 'تقييم المصدر والسياق والتحقق قبل المشاركة.'],
    ['KAHNEMAN', 'Daniel Kahneman — Thinking, Fast and Slow', 'الانحيازات ويومية القرار مع تجنب الثقة الزائدة.'],
    ['DECISIONS', 'Annie Duke — Thinking in Bets', 'فصل جودة القرار عن النتيجة وتسجيل التوقع.'],
    ['PROBLEM_SOLVING', 'Evidence-informed problem-solving therapy', 'تعريف المشكلة وتوليد البدائل وتجربة الحل وتقييمه.'],
    ['CREATIVITY', 'Design thinking and creative problem-solving practice', 'التوليد قبل التقييم وتعدد وجهات النظر.'],
    ['DATA_LITERACY', 'OpenStax Introductory Statistics', 'الأساسيات والقراءة النقدية للبيانات.'],
    ['ATOMIC_HABITS', 'James Clear — Atomic Habits', 'الإشارة والبيئة والخطوة الصغيرة والتتبع.'],
    ['SEVEN_HABITS', 'Stephen Covey — The 7 Habits of Highly Effective People', 'المبادرة والغاية والأولوية والمنفعة المتبادلة.'],
    ['GTD', 'David Allen — Getting Things Done', 'التقاط المهام وتوضيحها ومراجعتها.'],
    ['ESSENTIALISM', 'Greg McKeown — Essentialism', 'الاختيار الواعي وتقليل غير الضروري.'],
    ['MAKE_TIME', 'Knapp & Zeratsky — Make Time', 'الأولوية اليومية والطاقة والتركيز.'],
    ['GOALS', 'Locke & Latham — Goal-setting research', 'الأهداف المحددة والتغذية الراجعة والالتزام الواقعي.'],
    ['NOW_HABIT', 'Neil Fiore — The Now Habit', 'فهم التسويف والبدء الآمن والعمل المجدول.'],
    ['PROCRASTINATION_EQUATION', 'Piers Steel — The Procrastination Equation', 'الدافع والقيمة والاندفاع والتأجيل.'],
    ['MINDSET', 'Carol Dweck — Mindset', 'التعلم من الخطأ والجهد الاستراتيجي لا المديح الثابت.'],
    ['STRENGTHS', 'Peterson & Seligman — Character Strengths and Virtues', 'ملاحظة نقاط القوة واستخدامها باعتدال.'],
    ['CAREER', 'Evidence-informed career and portfolio development', 'التعلم التطبيقي والدليل المهني والتغذية الراجعة.'],
    ['PSYCHOLOGY_OF_MONEY', 'Morgan Housel — The Psychology of Money', 'الادخار والكفاية والسلوك طويل الأمد دون توصيات استثمارية.'],
    ['PERSONAL_FINANCE', 'Consumer financial budgeting guidance', 'الميزانية والطوارئ والديون دون مضاربة أو منتجات محددة.'],
    ['DIGITAL_SECURITY', 'CISA basic cyber hygiene guidance', 'كلمات المرور والتحديثات والنسخ الاحتياطية والخصوصية.'],
    ['DIGITAL_MINIMALISM', 'Cal Newport — Digital Minimalism', 'الاستخدام المقصود للتقنية وتقليل التشتيت.'],
    ['NVC', 'Marshall Rosenberg — Nonviolent Communication', 'الملاحظة والشعور والحاجة والطلب دون لوم.'],
    ['DIFFICULT_CONVERSATIONS', 'Stone, Patton & Heen — Difficult Conversations', 'الفهم والنية والأثر والحوار الصعب.'],
    ['JUST_LISTEN', 'Mark Goulston — Just Listen', 'الإصغاء والانعكاس والأسئلة المفتوحة.'],
    ['BOUNDARIES', 'Evidence-informed assertiveness and boundary practice', 'الوضوح والاحترام والرضا والسلامة.'],
    ['NEGOTIATION', 'Fisher, Ury & Patton — Getting to Yes', 'المعايير والخيارات والمصالح بدل المواقف المتصلبة.'],
    ['GOTTMAN', 'John Gottman & Nan Silver — The Seven Principles for Making Marriage Work', 'الاحترام والتقدير وإدارة الخلاف الزوجي.'],
    ['HOLD_ME_TIGHT', 'Sue Johnson — Hold Me Tight', 'الأمان العاطفي والاحتياجات في العلاقة.'],
    ['SOCIAL_SUPPORT', 'Evidence-informed social support research', 'طلب الدعم وتقديمه وبناء الانتماء.'],
    ['RESPECT', 'Quran 49:13 and consent-based professional ethics', 'الكرامة والمساواة وعدم التعميم وقبول الاختلاف.'],
    ['PROFESSIONALISM', 'Professional mixed-gender communication ethics', 'الوضوح والخصوصية وحدود العمل وعدم التحرش.'],
    ['ETHICAL_INFLUENCE', 'Robert Cialdini — Influence', 'الإقناع الصادق مع الرفض الحر؛ ممنوع استغلال الثغرة أو الضغط.'],
    ['SOCIAL_PSYCHOLOGY', 'Elliot Aronson — The Social Animal', 'القوالب والانحياز وتفسير السلوك.'],
    ['PUBLIC_SPEAKING', 'Dale Carnegie — Public Speaking for Success', 'التدريب والوضوح والتواصل المحترم.'],
    ['CARNEGIE', 'Dale Carnegie — How to Win Friends and Influence People', 'التقدير الصادق والاهتمام بالآخر دون تملق.'],
    ['NETWORKING', 'Evidence-informed reciprocal professional networking', 'المنفعة المتبادلة والمصداقية والمتابعة.'],
];
