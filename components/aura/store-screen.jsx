'use client';

import { useState } from 'react';
import {
    Award, CalendarCheck, Check, Clock3, Coffee, Coins, Film, FlaskConical,
    Gift, Image as ImageIcon, ListPlus, MoonStar, Palette, Plus, RotateCcw,
    Scan, ShieldCheck, ShoppingBag, Snowflake, Sparkles, Swords, Trash2,
    TrendingUp, Utensils, WandSparkles,
} from 'lucide-react';
import { useI18n } from './i18n';
import { Currency, formatNumber, ScreenHeader } from './ui';
import {
    getNextRandomQuestSlot, getNextRandomQuestSlotPrice, getStoreItemDescription, getStoreItemName, getWorkdayBaseline,
    getWorkdayPrice, MAX_RANDOM_QUEST_SLOTS, storeBalanceRows, workdayStoreItems,
} from './store-catalog';
import { localDayKey } from './game';

const icons = {
    break: Coffee, hour: Film, meal: Utensils, rest: CalendarCheck, night: MoonStar,
    gift: ShoppingBag, reroll: RotateCcw, xp: Sparkles, freeze: Snowflake,
    shield: ShieldCheck, gold: Coins, background: ImageIcon, title: Award,
    frame: Scan, theme: Palette, slot: ListPlus, cap: TrendingUp,
    chance: FlaskConical, spell: WandSparkles,
};

const copy = {
    en: {
        eyebrow: 'THE WORKDAY ECONOMY', title: 'Imperial Vault', description: 'Real rewards, useful tools, and permanent upgrades—workday-priced, with fixed-cost random slots.',
        baseline: 'ONE FULL WORKDAY', baselineText: '100% = all Gold offered by today’s current quest list.', fallback: 'An empty quest list uses the 100 Gold reference baseline.', quests: 'today’s quests',
        rewards: 'Real-Life Rewards', powerups: 'Power-Ups', cosmetics: 'Cosmetics', upgrades: 'Permanent Upgrades', arena: 'PvP Arena',
        rewardsNote: 'Redeem intentionally. Add your own reward and choose its workday percentage.', powerupsNote: 'Consumable tools with strict purchase limits each day.', cosmeticsNote: 'Purchase once. Your customization is permanent.', upgradesNote: 'Long-term upgrades purchased with sustained real-world effort.', arenaNote: 'Consumable spells remain available for friendly PvP duels.',
        custom: 'Add a custom reward', customName: 'Reward name', customPlaceholder: 'e.g. A nature walk', percent: 'Workday percentage', create: 'Save reward', cancel: 'Cancel', customDescription: 'Your personalized real-life reward.', delete: 'Delete custom reward',
        redeem: 'Redeem', acquire: 'Acquire', upgrade: 'Upgrade', owned: 'Owned', active: 'Active', use: 'Use', activate: 'Activate', armed: 'Armed automatically', openDuel: 'Open duel',
        dailyLimit: 'Daily limit', purchasedToday: 'bought today', ownedCount: 'in inventory', permanent: 'PERMANENT', consumable: 'CONSUMABLE', realReward: 'REAL-LIFE REWARD', upgradeBadge: 'PERMANENT UPGRADE', arenaBadge: 'PVP CONSUMABLE',
        balance: 'Quick balance', balanceText: 'Standard categories stay anchored to the same full-workday baseline.', category: 'Category', lowest: 'Lowest price', highest: 'Highest price',
        slots: 'Random quest slots', activeRandom: 'active random', max: 'max', nextSlot: 'SLOT', maxed: '10/10 MAX', slotFormula: 'Custom and selected quests are unlimited. Start with 3 random slots; slot 4 costs 30 Gold, then each price is ×1.4 and rounded. All seven upgrades total 715 Gold (about 71 days at 10 Gold/day).', balanceSlotNote: 'Random slots use separate fixed Gold prices: 30, 42, 59, 82, 115, 161, 226.', goldCap: 'Daily quest-Gold cap', earnedToday: 'earned today', baseCap: 'Base cap: 200%; each cap upgrade adds another 100%.',
        xpActive: '×2 XP active', goldActive: '×2 Gold active today', minutes: 'min remaining',
    },
    ar: {
        eyebrow: 'اقتصاد يوم العمل', title: 'الخزنة الإمبراطورية', description: 'مكافآت وأدوات وترقيات مرتبطة بيوم عملك، مع أسعار ثابتة مستقلة للفتحات العشوائية.',
        baseline: 'يوم عمل كامل', baselineText: '100% = كل الذهب المعروض في قائمة مهام اليوم الحالية.', fallback: 'عندما لا توجد مهام يُستخدم مرجع 100 ذهبة.', quests: 'مهام اليوم',
        rewards: 'مكافآت حقيقية', powerups: 'أدوات اللعبة', cosmetics: 'تخصيص الملف', upgrades: 'ترقيات دائمة', arena: 'ساحة PvP',
        rewardsNote: 'استبدل بوعي. أضف مكافأتك الخاصة وحدد نسبتها من يوم العمل.', powerupsNote: 'أدوات استهلاكية بحدود شراء صارمة كل يوم.', cosmeticsNote: 'اشترِ مرة واحدة فقط؛ التخصيص دائم.', upgradesNote: 'ترقيات طويلة الأمد تُشترى بجهد واقعي مستمر.', arenaNote: 'تبقى التعويذات الاستهلاكية متاحة لنزالات PvP الودية.',
        custom: 'أضف مكافأة مخصصة', customName: 'اسم المكافأة', customPlaceholder: 'مثال: نزهة في الطبيعة', percent: 'النسبة من يوم العمل', create: 'حفظ المكافأة', cancel: 'إلغاء', customDescription: 'مكافأتك الواقعية المخصصة.', delete: 'حذف المكافأة المخصصة',
        redeem: 'استبدال', acquire: 'شراء', upgrade: 'ترقية', owned: 'مملوك', active: 'نشط', use: 'استخدام', activate: 'تفعيل', armed: 'يعمل تلقائيًا', openDuel: 'افتح النزال',
        dailyLimit: 'الحد اليومي', purchasedToday: 'تم شراؤه اليوم', ownedCount: 'في المخزون', permanent: 'دائم', consumable: 'استهلاكي', realReward: 'مكافأة واقعية', upgradeBadge: 'ترقية دائمة', arenaBadge: 'عنصر PvP استهلاكي',
        balance: 'التوازن السريع', balanceText: 'تبقى الفئات الأساسية مرتبطة بمرجع يوم العمل الكامل نفسه.', category: 'الفئة', lowest: 'أقل سعر', highest: 'أعلى سعر',
        slots: 'فتحات المهام العشوائية', activeRandom: 'عشوائية نشطة', max: 'الحد الأقصى', nextSlot: 'الفتحة', maxed: '10/10 كحد أقصى', slotFormula: 'المهام المخصصة والمختارة غير محدودة. تبدأ بـ3 فتحات عشوائية؛ الفتحة الرابعة 30 ذهبًا، ثم يُضرب كل سعر في 1.4 مع التقريب. المجموع 715 ذهبًا (نحو 71 يومًا بمعدل 10 ذهب يوميًا).', balanceSlotNote: 'فتحات المهام العشوائية لها أسعار ذهب ثابتة ومنفصلة: 30، 42، 59، 82، 115، 161، 226.', goldCap: 'سقف ذهب المهام اليومي', earnedToday: 'مكتسب اليوم', baseCap: 'السقف الأساسي 200%؛ وكل ترقية تضيف 100% أخرى.',
        xpActive: 'مضاعف XP نشط', goldActive: 'مضاعف الذهب نشط اليوم', minutes: 'دقيقة متبقية',
    },
    fr: {
        eyebrow: 'L’ÉCONOMIE DE LA JOURNÉE', title: 'Chambre impériale', description: 'Récompenses, outils et améliorations liés à votre journée, avec des prix fixes pour les emplacements aléatoires.',
        baseline: 'UNE JOURNÉE COMPLÈTE', baselineText: '100 % = tout l’or offert par les quêtes actuelles du jour.', fallback: 'Sans quête, la référence est de 100 pièces d’or.', quests: 'quêtes du jour',
        rewards: 'Récompenses réelles', powerups: 'Outils de jeu', cosmetics: 'Personnalisation', upgrades: 'Améliorations permanentes', arena: 'Arène JcJ',
        rewardsNote: 'Ajoutez vos propres récompenses et leur pourcentage.', powerupsNote: 'Outils consommables avec des limites d’achat quotidiennes.', cosmeticsNote: 'Un seul achat, une personnalisation permanente.', upgradesNote: 'Des améliorations durables obtenues par un effort constant.', arenaNote: 'Les sorts consommables restent disponibles pour les duels JcJ.',
        custom: 'Ajouter une récompense', customName: 'Nom de la récompense', customPlaceholder: 'ex. Une marche dans la nature', percent: 'Pourcentage de la journée', create: 'Enregistrer', cancel: 'Annuler', customDescription: 'Votre récompense réelle personnalisée.', delete: 'Supprimer la récompense',
        redeem: 'Échanger', acquire: 'Acheter', upgrade: 'Améliorer', owned: 'Possédé', active: 'Actif', use: 'Utiliser', activate: 'Activer', armed: 'Activation automatique', openDuel: 'Ouvrir le duel',
        dailyLimit: 'Limite quotidienne', purchasedToday: 'achetés aujourd’hui', ownedCount: 'en inventaire', permanent: 'PERMANENT', consumable: 'CONSOMMABLE', realReward: 'RÉCOMPENSE RÉELLE', upgradeBadge: 'AMÉLIORATION PERMANENTE', arenaBadge: 'CONSOMMABLE JCJ',
        balance: 'Équilibre rapide', balanceText: 'Les catégories standard utilisent la même journée de référence.', category: 'Catégorie', lowest: 'Prix minimum', highest: 'Prix maximum',
        slots: 'Emplacements de quêtes aléatoires', activeRandom: 'aléatoires actives', max: 'max', nextSlot: 'EMPLACEMENT', maxed: '10/10 MAX', slotFormula: 'Les quêtes personnalisées et choisies sont illimitées. Commencez avec 3 emplacements aléatoires ; le 4e coûte 30 d’or, puis chaque prix est ×1,4 et arrondi. Total : 715 d’or (environ 71 jours à 10 d’or par jour).', balanceSlotNote: 'Les emplacements aléatoires utilisent des prix fixes séparés : 30, 42, 59, 82, 115, 161, 226.', goldCap: 'Plafond d’or des quêtes', earnedToday: 'gagné aujourd’hui', baseCap: 'Base : 200 % ; chaque amélioration ajoute 100 %.',
        xpActive: '×2 XP actif', goldActive: '×2 or actif aujourd’hui', minutes: 'min restantes',
    },
    es: {
        eyebrow: 'LA ECONOMÍA DE LA JORNADA', title: 'Cámara imperial', description: 'Recompensas, herramientas y mejoras ligadas a tu jornada, con precios fijos para los espacios aleatorios.',
        baseline: 'UNA JORNADA COMPLETA', baselineText: '100 % = todo el oro ofrecido por las misiones actuales de hoy.', fallback: 'Sin misiones se usa la referencia de 100 de oro.', quests: 'misiones de hoy',
        rewards: 'Recompensas reales', powerups: 'Herramientas', cosmetics: 'Personalización', upgrades: 'Mejoras permanentes', arena: 'Arena JcJ',
        rewardsNote: 'Añade tus propias recompensas y su porcentaje.', powerupsNote: 'Consumibles con límites de compra diarios.', cosmeticsNote: 'Compra única y personalización permanente.', upgradesNote: 'Mejoras duraderas obtenidas con esfuerzo constante.', arenaNote: 'Los hechizos consumibles siguen disponibles para duelos JcJ.',
        custom: 'Añadir recompensa', customName: 'Nombre de la recompensa', customPlaceholder: 'ej. Un paseo por la naturaleza', percent: 'Porcentaje de la jornada', create: 'Guardar', cancel: 'Cancelar', customDescription: 'Tu recompensa real personalizada.', delete: 'Eliminar recompensa',
        redeem: 'Canjear', acquire: 'Comprar', upgrade: 'Mejorar', owned: 'Adquirido', active: 'Activo', use: 'Usar', activate: 'Activar', armed: 'Se activa automáticamente', openDuel: 'Abrir duelo',
        dailyLimit: 'Límite diario', purchasedToday: 'comprados hoy', ownedCount: 'en inventario', permanent: 'PERMANENTE', consumable: 'CONSUMIBLE', realReward: 'RECOMPENSA REAL', upgradeBadge: 'MEJORA PERMANENTE', arenaBadge: 'CONSUMIBLE JCJ',
        balance: 'Equilibrio rápido', balanceText: 'Las categorías estándar usan la misma jornada de referencia.', category: 'Categoría', lowest: 'Precio mínimo', highest: 'Precio máximo',
        slots: 'Espacios de misiones aleatorias', activeRandom: 'aleatorias activas', max: 'máx.', nextSlot: 'ESPACIO', maxed: '10/10 MÁX.', slotFormula: 'Las misiones personalizadas y seleccionadas son ilimitadas. Empiezas con 3 espacios aleatorios; el 4.º cuesta 30 de oro y cada precio se multiplica por 1,4 y se redondea. Total: 715 de oro (aproximadamente 71 días a 10 de oro al día).', balanceSlotNote: 'Los espacios aleatorios usan precios fijos separados: 30, 42, 59, 82, 115, 161, 226.', goldCap: 'Límite de oro de misiones', earnedToday: 'ganado hoy', baseCap: 'Base: 200 %; cada mejora añade otro 100 %.',
        xpActive: '×2 XP activo', goldActive: '×2 oro activo hoy', minutes: 'min restantes',
    },
};

export default function StoreScreen({
    gold, diamonds, inventory, quests, customRewards, purchaseHistory, upgrades,
    effects, dailyGoldEarned, dailyGoldCap, randomQuestLimit, randomQuestCount,
    onBuy, onUse, onAddCustomReward, onDeleteCustomReward, onNavigate,
}) {
    const { language, dir, t } = useI18n();
    const c = copy[language] || copy.en;
    const [tab, setTab] = useState('rewards');
    const [customOpen, setCustomOpen] = useState(false);
    const [customName, setCustomName] = useState('');
    const [customPercent, setCustomPercent] = useState(100);
    const today = localDayKey();
    const baseline = getWorkdayBaseline(quests);
    const allItems = [...workdayStoreItems, ...(customRewards || [])];
    const visibleItems = allItems.filter((item) => item.category === tab);
    const categories = ['rewards', 'powerups', 'cosmetics', 'upgrades', 'arena'];
    const badge = tab === 'rewards' ? c.realReward : tab === 'powerups' ? c.consumable : tab === 'cosmetics' ? c.permanent : tab === 'upgrades' ? c.upgradeBadge : c.arenaBadge;
    const xpMinutes = Math.max(0, Math.ceil(((effects?.xpBoostUntil || 0) - Date.now()) / 60000));

    const submitCustom = (event) => {
        event.preventDefault();
        const percent = Number(customPercent);
        if (!customName.trim() || percent < 1 || percent > 1000) return;
        onAddCustomReward({ name: customName.trim(), percent });
        setCustomName(''); setCustomPercent(100); setCustomOpen(false);
    };

    return (
        <div className="screen workday-store" dir={dir}>
            <ScreenHeader eyebrow={c.eyebrow} title={c.title} description={c.description}>
                <div className="store-balances"><Currency value={gold} /><Currency type="diamonds" value={diamonds} /></div>
            </ScreenHeader>

            <section className="panel workday-baseline-card">
                <div className="workday-baseline-icon"><Coins size={25} /></div>
                <div><span>{c.baseline}</span><h2><strong>100%</strong> = {formatNumber(baseline)} {t('common.gold')}</h2><p>{quests.length ? c.baselineText : c.fallback}</p></div>
                <small>{quests.length} {c.quests}</small>
            </section>
            {(xpMinutes > 0 || effects?.goldBoostDay === today) && <div className="store-active-effects">
                {xpMinutes > 0 && <span><Sparkles size={14} /> {c.xpActive} · {xpMinutes} {c.minutes}</span>}
                {effects?.goldBoostDay === today && <span><Coins size={14} /> {c.goldActive}</span>}
            </div>}

            <div className="store-tabs workday-store-tabs" role="tablist">
                {categories.map((item) => <button role="tab" aria-selected={tab === item} className={tab === item ? 'active' : ''} onClick={() => setTab(item)} key={item}>{c[item]}</button>)}
            </div>
            <div className="workday-category-heading"><div><h2>{c[tab]}</h2><p>{c[`${tab}Note`]}</p></div>{tab === 'rewards' && <button className="button button-secondary button-small" onClick={() => setCustomOpen((current) => !current)}><Plus size={15} /> {c.custom}</button>}</div>

            {tab === 'rewards' && customOpen && <form className="panel custom-reward-form" onSubmit={submitCustom}>
                <label><span>{c.customName}</span><input value={customName} onChange={(event) => setCustomName(event.target.value)} placeholder={c.customPlaceholder} maxLength={60} required autoFocus /></label>
                <label><span>{c.percent}</span><div className="custom-percent-input"><input type="number" min="1" max="1000" step="1" value={customPercent} onChange={(event) => setCustomPercent(event.target.value)} required /><strong>%</strong></div></label>
                <div className="custom-reward-preview"><span>{getWorkdayPrice(baseline, Number(customPercent) || 0)} {t('common.gold')}</span><small>{Number(customPercent) || 0}% × {formatNumber(baseline)}</small></div>
                <div className="custom-reward-actions"><button type="button" className="button button-secondary" onClick={() => setCustomOpen(false)}>{c.cancel}</button><button type="submit" className="button button-primary"><Plus size={15} /> {c.create}</button></div>
            </form>}

            {tab === 'upgrades' && <div className="upgrade-status-grid">
                <section className="panel"><ListPlus size={19} /><div><span>{c.slots}</span><strong>{randomQuestCount}/{randomQuestLimit}</strong><small>{c.activeRandom} · {c.max} {MAX_RANDOM_QUEST_SLOTS}</small></div></section>
                <section className="panel"><TrendingUp size={19} /><div><span>{c.goldCap}</span><strong>{formatNumber(dailyGoldCap)} {t('common.gold')} · {200 + (upgrades?.goldCap || 0) * 100}%</strong><small>{formatNumber(dailyGoldEarned)} {c.earnedToday}</small></div></section>
                <p>{c.baseCap}</p>
                <p>{c.slotFormula}</p>
            </div>}

            <div className="store-grid workday-store-grid">
                {visibleItems.map((item) => {
                    const Icon = icons[item.icon] || Gift;
                    const slotPurchase = item.pricing === 'random-slot';
                    const nextSlot = slotPurchase ? getNextRandomQuestSlot(upgrades) : null;
                    const maxed = slotPurchase && nextSlot === null;
                    const price = slotPurchase ? (getNextRandomQuestSlotPrice(upgrades) ?? 0) : getWorkdayPrice(baseline, item.percent);
                    const permanent = item.category === 'cosmetics' || item.once;
                    const owned = permanent && inventory.includes(item.id);
                    const count = inventory.filter((id) => id === item.id).length;
                    const boughtToday = (purchaseHistory || []).filter((entry) => entry.day === today && entry.itemId === item.id).length;
                    const limitReached = item.dailyLimit && boughtToday >= item.dailyLimit;
                    const upgradeCount = slotPurchase ? Math.max(0, randomQuestLimit - 3) : item.id === 'upgrade-gold-cap' ? upgrades?.goldCap || 0 : item.id === 'upgrade-second-chance' ? upgrades?.secondChance || 0 : 0;
                    const canUse = count > 0 && ['select-quest', 'xp-boost', 'gold-boost'].includes(item.effect);
                    return (
                        <article className={`store-item panel workday-store-item category-${item.category}`} key={item.id} data-store-item={item.id}>
                            <div className="workday-item-top"><span className="workday-item-icon"><Icon size={30} strokeWidth={1.35} /></span><span className="workday-item-badge">{badge}</span>{item.custom && <button type="button" className="icon-button custom-reward-delete" onClick={() => onDeleteCustomReward(item.id)} aria-label={c.delete}><Trash2 size={15} /></button>}</div>
                            <div className="store-item-copy"><h3>{getStoreItemName(item, language)}</h3><p>{item.custom ? c.customDescription : getStoreItemDescription(item, language)}</p></div>
                            <div className="workday-item-meta">
                                {item.dailyLimit && <span><Clock3 size={12} /> {c.dailyLimit}: {boughtToday}/{item.dailyLimit} {c.purchasedToday}</span>}
                                {item.category === 'powerups' && count > 0 && <span>{count} {c.ownedCount}</span>}
                                {item.category === 'upgrades' && upgradeCount > 0 && <span>{c.owned} ×{upgradeCount}</span>}
                            </div>
                            <div className="store-item-bottom workday-item-bottom">
                                <span className="workday-price"><strong>{slotPurchase ? (maxed ? c.maxed : `${c.nextSlot} ${nextSlot}`) : `${item.percent}%`}</strong><small>{maxed ? <>{randomQuestLimit}/{MAX_RANDOM_QUEST_SLOTS}</> : <><Coins size={14} /> {formatNumber(price)} {t('common.gold')}</>}</small></span>
                                <div className="workday-item-actions">
                                    {canUse && <button className="button button-secondary button-small" onClick={() => onUse(item)}>{item.effect === 'select-quest' ? c.use : c.activate}</button>}
                                    {item.effect === 'automatic' && count > 0 && <span className="store-armed"><Check size={13} /> {c.armed}</span>}
                                    {item.effect === 'arena' && count > 0 && <button className="button button-secondary button-small" onClick={() => onNavigate('duel')}><Swords size={13} /> {c.openDuel}</button>}
                                    <button className={`button ${owned || maxed ? 'button-secondary' : 'button-primary'} button-small`} onClick={() => onBuy(item)} disabled={owned || limitReached || maxed}>
                                        {maxed ? c.maxed : owned ? <><Check size={14} /> {item.once ? c.active : c.owned}</> : limitReached ? `${boughtToday}/${item.dailyLimit}` : item.category === 'rewards' && item.effect === 'redeem' ? c.redeem : item.category === 'upgrades' ? c.upgrade : c.acquire}
                                    </button>
                                </div>
                            </div>
                        </article>
                    );
                })}
            </div>

            <section className="panel workday-balance-table">
                <div><span className="eyebrow">100% = {formatNumber(baseline)} {t('common.gold')}</span><h2>{c.balance}</h2><p>{c.balanceText}</p><small className="workday-slot-balance-note">{c.balanceSlotNote}</small></div>
                <div className="balance-table" role="table">
                    <div className="balance-row balance-header" role="row"><span>{c.category}</span><span>{c.lowest}</span><span>{c.highest}</span></div>
                    {storeBalanceRows.map((row) => <div className="balance-row" role="row" key={row.category}><strong>{c[row.category]}</strong><span>{row.min}% · {formatNumber(getWorkdayPrice(baseline, row.min))} {t('common.gold')}</span><span>{row.max}% · {formatNumber(getWorkdayPrice(baseline, row.max))} {t('common.gold')}</span></div>)}
                </div>
            </section>
        </div>
    );
}
