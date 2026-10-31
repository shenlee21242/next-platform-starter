const l = (en, ar, fr, es) => ({ en, ar, fr, es });

export const workdayStoreItems = [
    { id: 'reward-break', category: 'rewards', percent: 40, icon: 'break', effect: 'redeem', name: l('Short break', 'استراحة قصيرة', 'Petite pause', 'Descanso corto'), description: l('30 minutes of guilt-free entertainment.', '30 دقيقة ترفيه دون شعور بالذنب.', '30 minutes de divertissement sans culpabilité.', '30 minutos de ocio sin culpa.') },
    { id: 'reward-hour', category: 'rewards', percent: 80, icon: 'hour', effect: 'redeem', name: l('Entertainment hour', 'ساعة ترفيه', 'Une heure de divertissement', 'Hora de ocio'), description: l('A film, YouTube, or games for one hour.', 'فيلم أو يوتيوب أو ألعاب لمدة ساعة.', 'Un film, YouTube ou des jeux pendant une heure.', 'Película, YouTube o juegos durante una hora.') },
    { id: 'reward-meal', category: 'rewards', percent: 150, icon: 'meal', effect: 'redeem', name: l('Favorite meal', 'وجبة مفضلة', 'Repas préféré', 'Comida favorita'), description: l('Enjoy a favorite meal or a restaurant visit.', 'استمتع بوجبة مفضلة أو زيارة مطعم.', 'Savourez un repas préféré ou une sortie au restaurant.', 'Disfruta una comida favorita o un restaurante.') },
    { id: 'reward-rest-day', category: 'rewards', percent: 120, icon: 'rest', effect: 'select-quest', name: l('Rest day', 'يوم راحة', 'Jour de repos', 'Día de descanso'), description: l('Skip one quest without a penalty or rewards.', 'تخطَّ مهمة واحدة بلا عقوبة أو مكافآت.', 'Sautez une quête sans pénalité ni récompense.', 'Omite una misión sin penalización ni recompensas.') },
    { id: 'reward-late-night', category: 'rewards', percent: 200, icon: 'night', effect: 'redeem', name: l('Late night', 'سهرة متأخرة', 'Soirée tardive', 'Noche larga'), description: l('A planned late evening after two full workdays.', 'سهرة مخططة بعد يومي عمل كاملين.', 'Une soirée tardive prévue après deux journées complètes.', 'Una noche larga planeada tras dos jornadas completas.') },
    { id: 'reward-small-gift', category: 'rewards', percent: 300, icon: 'gift', effect: 'redeem', name: l('A small gift for yourself', 'شراء شيء صغير لنفسك', 'Un petit cadeau pour soi', 'Un pequeño capricho'), description: l('Buy yourself something small after three workdays.', 'اشترِ لنفسك شيئًا صغيرًا بعد ثلاثة أيام عمل.', 'Achetez-vous un petit quelque chose après trois journées.', 'Cómprate algo pequeño tras tres jornadas.') },

    { id: 'power-reroll', category: 'powerups', percent: 40, dailyLimit: 2, icon: 'reroll', effect: 'select-quest', name: l('Quest Reroll', 'إعادة تدوير مهمة', 'Relance de quête', 'Cambio de misión'), description: l('Replace one unfinished quest with a new Fate quest.', 'استبدل مهمة غير مكتملة بمهمة قدر جديدة.', 'Remplacez une quête inachevée par une nouvelle quête du destin.', 'Sustituye una misión pendiente por una nueva misión del destino.') },
    { id: 'power-xp', category: 'powerups', percent: 60, dailyLimit: 1, icon: 'xp', effect: 'xp-boost', name: l('XP Multiplier', 'مضاعف XP', 'Multiplicateur d’XP', 'Multiplicador de XP'), description: l('Double quest XP for one hour.', 'ضاعف XP المهام لمدة ساعة.', 'Doublez l’XP des quêtes pendant une heure.', 'Duplica la XP de misiones durante una hora.') },
    { id: 'power-streak-freeze', category: 'powerups', percent: 80, dailyLimit: 1, icon: 'freeze', effect: 'automatic', name: l('Streak Freeze', 'تجميد السلسلة', 'Gel de série', 'Congelar racha'), description: l('Automatically preserve your streak for one missed day.', 'يحافظ تلقائيًا على سلسلتك عند يوم فائت واحد.', 'Préserve automatiquement votre série lors d’un jour manqué.', 'Conserva automáticamente tu racha durante un día fallado.') },
    { id: 'power-penalty-shield', category: 'powerups', percent: 100, dailyLimit: 1, icon: 'shield', effect: 'automatic', name: l('Penalty Shield', 'درع العقوبة', 'Bouclier de pénalité', 'Escudo de penalización'), description: l('Automatically cancel one daily Gold and streak penalty.', 'يلغي تلقائيًا عقوبة الذهب والسلسلة ليوم واحد.', 'Annule automatiquement une pénalité quotidienne d’or et de série.', 'Cancela automáticamente una penalización diaria de oro y racha.') },
    { id: 'power-gold', category: 'powerups', percent: 150, dailyLimit: 1, icon: 'gold', effect: 'gold-boost', name: l('Gold Multiplier', 'مضاعف الذهب', 'Multiplicateur d’or', 'Multiplicador de oro'), description: l('Double quest Gold for the rest of today, within your daily cap.', 'ضاعف ذهب المهام لبقية اليوم ضمن سقفك اليومي.', 'Doublez l’or des quêtes aujourd’hui, dans la limite quotidienne.', 'Duplica el oro de misiones hoy, dentro de tu límite diario.') },

    { id: 'cosmetic-background', category: 'cosmetics', percent: 250, icon: 'background', effect: 'permanent', name: l('Profile background', 'خلفية بروفايل', 'Arrière-plan du profil', 'Fondo de perfil'), description: l('A permanent celestial background for your character profile.', 'خلفية فلكية دائمة لملف شخصيتك.', 'Un arrière-plan céleste permanent pour votre profil.', 'Un fondo celestial permanente para tu perfil.') },
    { id: 'cosmetic-title', category: 'cosmetics', percent: 300, icon: 'title', effect: 'permanent', name: l('Workday Achiever', 'مُنجز أيام العمل', 'Bâtisseur de journées', 'Constructor de jornadas'), description: l('Display a permanent title on your character profile.', 'اعرض لقبًا دائمًا في ملف شخصيتك.', 'Affichez un titre permanent sur votre profil.', 'Muestra un título permanente en tu perfil.') },
    { id: 'cosmetic-frame', category: 'cosmetics', percent: 350, icon: 'frame', effect: 'permanent', name: l('Avatar Frame', 'إطار صورة رمزية', 'Cadre d’avatar', 'Marco de avatar'), description: l('A permanent radiant frame around your avatars.', 'إطار مشرق دائم حول صورك الرمزية.', 'Un cadre lumineux permanent autour de vos avatars.', 'Un marco luminoso permanente para tus avatares.') },
    { id: 'cosmetic-theme', category: 'cosmetics', percent: 400, icon: 'theme', effect: 'permanent', name: l('Royal Violet Theme', 'ثيم البنفسج الملكي', 'Thème violet royal', 'Tema violeta real'), description: l('A permanent violet-and-gold color theme across AURA.', 'ثيم دائم بالبنفسج والذهبي في كل AURA.', 'Un thème violet et or permanent dans toute AURA.', 'Un tema permanente violeta y dorado en toda AURA.') },

    { id: 'upgrade-quest-slot', category: 'upgrades', percent: 800, icon: 'slot', effect: 'upgrade', name: l('+1 Daily Quest Slot', '+1 فتحة مهمة يومية', '+1 emplacement de quête quotidienne', '+1 espacio de misión diaria'), description: l('Permanently add one daily quest slot. Repeatable.', 'أضف فتحة مهمة يومية واحدة دائمًا. قابلة للتكرار.', 'Ajoutez définitivement un emplacement quotidien. Répétable.', 'Añade permanentemente un espacio diario. Acumulable.') },
    { id: 'upgrade-gold-cap', category: 'upgrades', percent: 600, icon: 'cap', effect: 'upgrade', name: l('Daily Gold Cap', 'زيادة سقف الذهب اليومي', 'Plafond d’or quotidien', 'Límite de oro diario'), description: l('Permanently add 100% of a workday to your daily quest-Gold cap. Repeatable.', 'أضف دائمًا 100% من يوم عمل إلى سقف ذهب المهام اليومي. قابلة للتكرار.', 'Ajoutez 100 % d’une journée à votre plafond quotidien. Répétable.', 'Añade un 100 % de una jornada a tu límite diario. Acumulable.') },
    { id: 'upgrade-second-chance', category: 'upgrades', percent: 1000, icon: 'chance', effect: 'upgrade', once: true, name: l('Second Chance', 'فرصة ثانية', 'Seconde chance', 'Segunda oportunidad'), description: l('Permanently cancel one full daily penalty each month.', 'ألغِ دائمًا عقوبة يومية كاملة مرة كل شهر.', 'Annulez définitivement une pénalité quotidienne complète par mois.', 'Cancela permanentemente una penalización diaria completa al mes.') },

    // Preserve the existing PvP attack-spell path without mixing it into the requested balance table.
    { id: 'p4', category: 'arena', percent: 100, dailyLimit: 1, icon: 'spell', effect: 'arena', name: l('Exhaustion Spell', 'تعويذة الإنهاك', 'Sort d’épuisement', 'Hechizo de agotamiento'), description: l('A consumable PvP attack spell: −10% rival XP for one hour.', 'تعويذة هجوم استهلاكية: ‏−10% من XP الخصم لمدة ساعة.', 'Un sort JcJ consommable : −10 % d’XP rival pendant une heure.', 'Un hechizo JcJ consumible: −10 % de XP rival durante una hora.') },
];

export const storeBalanceRows = [
    { category: 'rewards', min: 40, max: 300 },
    { category: 'powerups', min: 40, max: 150 },
    { category: 'cosmetics', min: 250, max: 400 },
    { category: 'upgrades', min: 600, max: 1000 },
];

export function getWorkdayBaseline(quests = []) {
    const total = quests.reduce((sum, quest) => sum + Math.max(0, Number(quest.gold) || 0), 0);
    return total > 0 ? Math.round(total) : 100;
}

export function getWorkdayPrice(baseline, percent) {
    return Math.max(1, Math.ceil((Math.max(1, Number(baseline) || 100) * Number(percent)) / 100));
}

export function getStoreItemName(item, language = 'en') {
    return typeof item.name === 'string' ? item.name : item.name?.[language] || item.name?.en || item.id;
}

export function getStoreItemDescription(item, language = 'en') {
    return typeof item.description === 'string' ? item.description : item.description?.[language] || item.description?.en || '';
}
