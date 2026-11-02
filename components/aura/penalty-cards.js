const l = (en, ar, fr, es) => ({ en, ar, fr, es });
const localize = (value, language) => typeof value === 'string' ? value : value?.[language] || value?.en || '';

export const PENALTY_RARITY_WEIGHTS = { Common: 60, Uncommon: 25, Rare: 12, Legendary: 3 };
export const PENALTY_RARITIES = ['Common', 'Uncommon', 'Rare', 'Legendary'];
export const DEFAULT_PENALTY_CONTRACT = {
    enabled: false,
    tiers: { Common: true, Uncommon: true, Rare: true, Legendary: false },
    disabledCardIds: [],
    realWorldCardIds: [],
    partnerName: '',
    partnerContact: '',
};

export function normalizePenaltyContract(value = {}) {
    return {
        ...DEFAULT_PENALTY_CONTRACT,
        ...value,
        tiers: { ...DEFAULT_PENALTY_CONTRACT.tiers, ...(value.tiers || {}) },
        disabledCardIds: Array.isArray(value.disabledCardIds) ? value.disabledCardIds : [],
        realWorldCardIds: Array.isArray(value.realWorldCardIds) ? value.realWorldCardIds : [],
    };
}

export const penaltyCards = [
    { id: 'mist-whisper', rarity: 'Common', effect: { xp: 10 }, name: l('Mist’s Whisper', 'همسة الضباب', 'Murmure de la brume', 'Susurro de la niebla'), effectText: l('Lose 10 XP.', 'خسارة 10 XP.', 'Perdez 10 XP.', 'Pierde 10 XP.'), text: l('One small step backward. I will remember it.', 'خطوة صغيرة إلى الوراء. سأتذكرها.', 'Un petit pas en arrière. Je m’en souviendrai.', 'Un pequeño paso atrás. Lo recordaré.') },
    { id: 'soul-dust', rarity: 'Common', effect: { gold: 3 }, name: l('Soul Dust', 'غبار الأرواح', 'Poussière d’âmes', 'Polvo de almas'), effectText: l('Lose 3 Gold.', 'خسارة 3 ذهب.', 'Perdez 3 or.', 'Pierde 3 de oro.'), text: l('Your Gold slips like sand between my fingers.', 'يتسرب ذهبك كالرمال بين أصابعي.', 'Votre or s’écoule comme du sable entre mes doigts.', 'Tu oro se escapa como arena entre mis dedos.') },
    { id: 'temporary-burden', rarity: 'Common', effect: { quests: 1 }, name: l('Temporary Burden', 'ثقل مؤقت', 'Fardeau temporaire', 'Carga temporal'), effectText: l('Add one mandatory Fate quest for today.', 'إضافة مهمة قدر إلزامية واحدة لليوم.', 'Ajoutez une quête du destin obligatoire pour aujourd’hui.', 'Añade una misión del destino obligatoria para hoy.'), text: l('Since you did not choose, I will choose for you.', 'بما أنك لم تختر، سأختار أنا لك.', 'Puisque vous n’avez pas choisi, je choisirai pour vous.', 'Como no elegiste, elegiré por ti.') },
    { id: 'fading-memory', rarity: 'Common', effect: { noXpNext: true }, name: l('Fading Memory', 'ذكرى باهتة', 'Souvenir pâle', 'Recuerdo pálido'), effectText: l('Your next completed quest earns no XP.', 'مهمتك المكتملة التالية لا تمنحك XP.', 'Votre prochaine quête terminée ne rapporte aucun XP.', 'Tu próxima misión completada no otorga XP.'), text: l('Your next victory will vanish into forgetting.', 'ستختفي غنيمة انتصارك التالي في النسيان.', 'Votre prochaine victoire disparaîtra dans l’oubli.', 'Tu próxima victoria desaparecerá en el olvido.') },

    { id: 'the-glance', rarity: 'Uncommon', effect: { xp: 30 }, name: l('The Glance', 'نظرة خاطفة', 'Le Regard', 'La Mirada'), effectText: l('Lose 30 XP.', 'خسارة 30 XP.', 'Perdez 30 XP.', 'Pierde 30 XP.'), text: l('My eyes caught your hesitation.', 'التقطت عيناي ترددك.', 'Mes yeux ont vu votre hésitation.', 'Mis ojos vieron tu duda.') },
    { id: 'streak-fever', rarity: 'Uncommon', effect: { streak: true }, name: l('Streak Fever', 'حمى السلسلة', 'Fièvre de série', 'Fiebre de racha'), effectText: l('Reset your streak to 0.', 'إعادة سلسلتك إلى 0.', 'Réinitialisez votre série à 0.', 'Restablece tu racha a 0.'), text: l('How many days will you need to build it again?', 'كم يومًا ستحتاج لبنائها من جديد؟', 'Combien de jours faudra-t-il pour la reconstruire ?', '¿Cuántos días necesitarás para reconstruirla?') },
    { id: 'bone-tax', rarity: 'Uncommon', effect: { gold: 8 }, name: l('Bone Tax', 'ضريبة العظام', 'Taxe des os', 'Impuesto de huesos'), effectText: l('Lose 8 Gold.', 'خسارة 8 ذهب.', 'Perdez 8 or.', 'Pierde 8 de oro.'), text: l('Delay always collects its tribute.', 'للتأخير ضريبته دائمًا.', 'Le retard perçoit toujours son tribut.', 'La demora siempre cobra su tributo.') },
    { id: 'heavy-shackles', rarity: 'Uncommon', effect: { slotHours: 24 }, name: l('Heavy Shackles', 'قيد ثقيل', 'Lourdes entraves', 'Grilletes pesados'), effectText: l('Lock one random-quest slot for 24 hours.', 'إغلاق فتحة مهمة عشوائية واحدة لمدة 24 ساعة.', 'Verrouillez un emplacement aléatoire pendant 24 heures.', 'Bloquea un espacio aleatorio durante 24 horas.'), text: l('One space remains empty. Your purchases remain yours.', 'تبقى مساحة واحدة فارغة، وتبقى مشترياتك ملكك.', 'Un espace reste vide. Vos achats restent les vôtres.', 'Un espacio queda vacío. Tus compras siguen siendo tuyas.') },

    { id: 'soul-shock', rarity: 'Rare', effect: { xp: 60 }, name: l('Soul Shock', 'صعقة الروح', 'Choc de l’âme', 'Choque del alma'), effectText: l('Lose 60 XP.', 'خسارة 60 XP.', 'Perdez 60 XP.', 'Pierde 60 XP.'), text: l('My eyes are on you now.', 'عيناي عليك الآن.', 'Mes yeux sont sur vous maintenant.', 'Mis ojos están sobre ti ahora.') },
    { id: 'gold-bleed', rarity: 'Rare', effect: { gold: 20 }, name: l('Gold Bleed', 'نزيف الذهب', 'Saignement d’or', 'Sangrado de oro'), effectText: l('Lose 20 Gold.', 'خسارة 20 ذهب.', 'Perdez 20 or.', 'Pierde 20 de oro.'), text: l('Every moment of neglect has a price.', 'لكل لحظة إهمال ثمن.', 'Chaque moment de négligence a un prix.', 'Cada momento de descuido tiene un precio.') },
    { id: 'regression', rarity: 'Rare', effect: { xpPercent: 50 }, name: l('Regression', 'التراجع', 'Régression', 'Regresión'), effectText: l('Lose 50% of XP in your current level.', 'خسارة 50% من XP في مستواك الحالي.', 'Perdez 50 % de l’XP du niveau actuel.', 'Pierde el 50 % de la XP de tu nivel actual.'), text: l('Two steps forward, then one into the mist.', 'خطوتان للأمام، ثم خطوة إلى الضباب.', 'Deux pas en avant, puis un dans la brume.', 'Dos pasos adelante y uno hacia la niebla.') },
    { id: 'shattered-vow', rarity: 'Rare', effect: { xp: 30, streak: true }, name: l('Shattered Vow', 'تمزيق القيد', 'Serment brisé', 'Juramento roto'), effectText: l('Lose 30 XP and reset your streak.', 'خسارة 30 XP وكسر السلسلة.', 'Perdez 30 XP et réinitialisez votre série.', 'Pierde 30 XP y restablece tu racha.'), text: l('A fragile promise breaks easily.', 'الوعد الهش ينكسر بسهولة.', 'Une promesse fragile se brise facilement.', 'Una promesa frágil se rompe con facilidad.') },

    { id: 'aura-judgment', rarity: 'Legendary', effect: { xp: 100, gold: 30, streak: true }, name: l('AURA’s Judgment', 'حكم AURA', 'Jugement d’AURA', 'Juicio de AURA'), effectText: l('Lose 100 XP and 30 Gold; reset your streak.', 'خسارة 100 XP و30 ذهب وكسر السلسلة.', 'Perdez 100 XP et 30 or ; réinitialisez votre série.', 'Pierde 100 XP y 30 de oro; restablece tu racha.'), text: l('I am AURA. What I take is not returned.', 'أنا AURA. ما آخذه لا يعود.', 'Je suis AURA. Ce que je prends ne revient pas.', 'Soy AURA. Lo que tomo no regresa.') },
    { id: 'reapers-mark', rarity: 'Legendary', effect: { dailyXp: true, quests: 2 }, name: l('The Reaper’s Mark', 'علامة الحاصد', 'La Marque du Faucheur', 'La Marca de la Segadora'), effectText: l('Lose XP earned today and add two mandatory quests.', 'خسارة XP المكتسب اليوم وإضافة مهمتين إلزاميتين.', 'Perdez l’XP gagnée aujourd’hui et ajoutez deux quêtes obligatoires.', 'Pierde la XP ganada hoy y añade dos misiones obligatorias.'), text: l('You are marked. Tomorrow carries a heavier duty.', 'لقد وُسمت. يحمل الغد واجبًا أثقل.', 'Vous êtes marqué. Demain porte un devoir plus lourd.', 'Estás marcado. Mañana tendrás un deber más pesado.') },
    { id: 'harvest-of-slots', rarity: 'Legendary', effect: { slotHours: 72 }, name: l('Harvest of Slots', 'حصاد الفتحات', 'Récolte d’emplacements', 'Cosecha de espacios'), effectText: l('Lock one random-quest slot for 72 hours. No purchase is destroyed.', 'إغلاق فتحة عشوائية 72 ساعة دون تدمير أي عملية شراء.', 'Verrouillez un emplacement pendant 72 heures. Aucun achat n’est détruit.', 'Bloquea un espacio durante 72 horas. Ninguna compra se destruye.'), text: l('Space is a privilege, never a debt sold back to you.', 'المساحة امتياز، وليست دينًا يُباع لك من جديد.', 'L’espace est un privilège, jamais une dette revendue.', 'El espacio es un privilegio, nunca una deuda revendida.') },
    { id: 'curse-of-decay', rarity: 'Legendary', effect: { level: 1 }, name: l('Curse of Decay', 'لعنة التراجع', 'Malédiction de décadence', 'Maldición de decadencia'), effectText: l('Lose one level, never below level 0.', 'خسارة مستوى واحد، ولا تنزل أبدًا عن المستوى 0.', 'Perdez un niveau, sans jamais descendre sous 0.', 'Pierde un nivel, sin bajar nunca de 0.'), text: l('You will remember this descent.', 'ستتذكر هذا الهبوط.', 'Vous vous souviendrez de cette descente.', 'Recordarás este descenso.') },

    { id: 'real-bitter-morning', rarity: 'Common', realWorld: true, effect: {}, name: l('The Bitter Morning', 'الصباح المر', 'Le Matin amer', 'La Mañana amarga'), effectText: l('Choose a caffeine-free morning tomorrow.', 'اختر صباحًا بلا كافيين غدًا.', 'Choisissez une matinée sans caféine demain.', 'Elige una mañana sin cafeína mañana.'), text: l('A small voluntary reset for your attention.', 'إعادة ضبط اختيارية صغيرة لانتباهك.', 'Une petite réinitialisation volontaire de votre attention.', 'Un pequeño reinicio voluntario para tu atención.') },
    { id: 'real-digital-step-back', rarity: 'Common', realWorld: true, effect: {}, name: l('Digital Step-Back', 'التراجع التقني', 'Recul numérique', 'Retroceso digital'), effectText: l('Pause social media for three hours.', 'أوقف التواصل الاجتماعي لمدة ثلاث ساعات.', 'Mettez les réseaux sociaux en pause pendant trois heures.', 'Pausa las redes sociales durante tres horas.'), text: l('Return your eyes to the life you chose.', 'أعد عينيك إلى الحياة التي اخترتها.', 'Rendez vos yeux à la vie que vous avez choisie.', 'Devuelve tus ojos a la vida que elegiste.') },
    { id: 'real-chaos-theory', rarity: 'Common', realWorld: true, effect: {}, name: l('Chaos Theory', 'فوضى المكان', 'Théorie du chaos', 'Teoría del caos'), effectText: l('Tidy your desk or one small area now.', 'رتّب مكتبك أو مساحة صغيرة الآن.', 'Rangez votre bureau ou un petit espace maintenant.', 'Ordena tu escritorio o un área pequeña ahora.'), text: l('Give your next action a clear place to begin.', 'امنح خطوتك التالية مكانًا واضحًا للبدء.', 'Offrez à votre prochaine action un point de départ clair.', 'Dale a tu próxima acción un lugar claro para empezar.') },
    { id: 'real-physical-debt', rarity: 'Uncommon', realWorld: true, effect: {}, name: l('Physical Debt', 'الدين البدني', 'Dette physique', 'Deuda física'), effectText: l('Choose 10 comfortable repetitions or a five-minute walk. Never exercise through pain.', 'اختر 10 تكرارات مريحة أو مشيًا لخمس دقائق. لا تتمرن مع الألم.', 'Choisissez 10 répétitions confortables ou une marche de cinq minutes. Jamais en cas de douleur.', 'Elige 10 repeticiones cómodas o caminar cinco minutos. Nunca con dolor.'), text: l('Movement should restore you, not harm you.', 'الحركة يجب أن تستعيد نشاطك لا أن تؤذيك.', 'Le mouvement doit vous restaurer, jamais vous blesser.', 'El movimiento debe restaurarte, no dañarte.') },
    { id: 'real-water-reset', rarity: 'Uncommon', realWorld: true, effect: {}, name: l('Water Reset', 'استعادة الماء', 'Récupération par l’eau', 'Recuperación con agua'), effectText: l('Wash your face and drink a glass of water.', 'اغسل وجهك واشرب كوبًا من الماء.', 'Lavez-vous le visage et buvez un verre d’eau.', 'Lávate la cara y bebe un vaso de agua.'), text: l('A gentle reset, without cold exposure or harm.', 'إعادة لطيفة بلا تعرض للبرد أو أذى.', 'Une récupération douce, sans froid ni danger.', 'Un reinicio suave, sin frío ni daño.') },
    { id: 'real-pleasure-denial', rarity: 'Uncommon', realWorld: true, effect: {}, name: l('Pleasure Denial', 'حرمان المتعة', 'Refus du plaisir', 'Renuncia al placer'), effectText: l('Pause shows and video games for the rest of the day.', 'أوقف المسلسلات وألعاب الفيديو لبقية اليوم.', 'Mettez les séries et les jeux vidéo en pause pour la journée.', 'Pausa series y videojuegos por el resto del día.'), text: l('Make room for the promise you postponed.', 'افسح المجال للوعد الذي أجلته.', 'Faites place à la promesse reportée.', 'Haz espacio para la promesa aplazada.') },
    { id: 'real-private-confession', rarity: 'Rare', realWorld: true, effect: {}, name: l('Private Accountability', 'مساءلة خاصة', 'Responsabilité privée', 'Responsabilidad privada'), effectText: l('Send a private, respectful update to your chosen accountability partner. Nothing is sent automatically.', 'أرسل تحديثًا خاصًا ومحترمًا لشريك المساءلة الذي اخترته. لا يُرسل شيء تلقائيًا.', 'Envoyez une mise à jour privée et respectueuse à votre partenaire. Rien n’est envoyé automatiquement.', 'Envía una actualización privada y respetuosa a tu compañero. Nada se envía automáticamente.'), text: l('Honesty needs trust, never public shame.', 'الصدق يحتاج إلى الثقة، لا إلى الفضيحة.', 'L’honnêteté exige la confiance, jamais la honte publique.', 'La honestidad requiere confianza, nunca vergüenza pública.') },
    { id: 'real-home-table', rarity: 'Rare', realWorld: true, effect: {}, name: l('The Home Table', 'مائدة البيت', 'La Table de la maison', 'La Mesa de casa'), effectText: l('Prepare one nourishing meal at home. Never skip meals.', 'حضّر وجبة مغذية في البيت. لا تتخطَّ الوجبات أبدًا.', 'Préparez un repas nourrissant à la maison. Ne sautez jamais de repas.', 'Prepara una comida nutritiva en casa. Nunca te saltes comidas.'), text: l('Care for your body while you rebuild discipline.', 'اعتنِ بجسدك بينما تعيد بناء الانضباط.', 'Prenez soin de votre corps tout en reconstruisant votre discipline.', 'Cuida tu cuerpo mientras reconstruyes disciplina.') },
    { id: 'real-conscious-tribute', rarity: 'Rare', realWorld: true, effect: {}, name: l('Conscious Tribute', 'الصدقة الواعية', 'Offrande consciente', 'Ofrenda consciente'), effectText: l('If freely chosen, make a small donation to a charity you trust. AURA never charges you.', 'إن اخترت بحرية، قدّم تبرعًا صغيرًا لجهة خيرية تثق بها. AURA لا تخصم منك أبدًا.', 'Si vous le choisissez librement, faites un petit don à une association de confiance. AURA ne vous facture jamais.', 'Si lo eliges libremente, haz una pequeña donación a una organización de confianza. AURA nunca te cobra.'), text: l('Generosity must be free, informed, and never coerced.', 'العطاء يجب أن يكون حرًا وواعيًا وبلا إكراه.', 'La générosité doit être libre, éclairée et jamais forcée.', 'La generosidad debe ser libre, informada y nunca forzada.') },
    { id: 'real-device-sabbath', rarity: 'Legendary', realWorld: true, effect: {}, name: l('Device Sabbath', 'راحة الجهاز', 'Repos de l’appareil', 'Descanso del dispositivo'), effectText: l('Optionally entrust a gaming controller—not a phone or safety device—to someone for 24 hours.', 'اختياريًا، سلّم ذراع ألعاب، لا هاتفًا أو جهاز أمان، لشخص موثوق لمدة 24 ساعة.', 'Confiez éventuellement une manette de jeu—pas un téléphone ni un appareil de sécurité—pendant 24 heures.', 'Opcionalmente entrega un mando de juegos, no un teléfono ni dispositivo de seguridad, durante 24 horas.'), text: l('A voluntary pause, with communication and safety untouched.', 'استراحة اختيارية مع بقاء التواصل والأمان دون مساس.', 'Une pause volontaire, sans toucher à la communication ni à la sécurité.', 'Una pausa voluntaria, sin afectar comunicación ni seguridad.') },
];

export function getPenaltyCard(id, language = 'en') {
    const card = penaltyCards.find((entry) => entry.id === id);
    if (!card) return null;
    return { ...card, name: localize(card.name, language), text: localize(card.text, language), effectText: localize(card.effectText, language) };
}

export function getAvailablePenaltyCards(contractValue = {}, level = 0, neglectDays = 0) {
    const contract = normalizePenaltyContract(contractValue);
    return penaltyCards.filter((card) => {
        if (!contract.tiers[card.rarity]) return false;
        if (card.rarity === 'Legendary' && (level < 5 || neglectDays < 3)) return false;
        return card.realWorld ? contract.realWorldCardIds.includes(card.id) : !contract.disabledCardIds.includes(card.id);
    });
}

export function drawPenaltyCard(contract, level = 0, neglectDays = 0, random = Math.random) {
    const pool = getAvailablePenaltyCards(contract, level, neglectDays);
    if (!pool.length) return null;
    const availableRarities = PENALTY_RARITIES.filter((rarity) => pool.some((card) => card.rarity === rarity));
    const totalWeight = availableRarities.reduce((sum, rarity) => sum + PENALTY_RARITY_WEIGHTS[rarity], 0);
    let roll = Math.min(0.999999999, Math.max(0, random())) * totalWeight;
    let rarity = availableRarities[availableRarities.length - 1];
    for (const candidate of availableRarities) {
        roll -= PENALTY_RARITY_WEIGHTS[candidate];
        if (roll < 0) { rarity = candidate; break; }
    }
    const rarityPool = pool.filter((card) => card.rarity === rarity);
    return rarityPool[Math.min(rarityPool.length - 1, Math.floor(Math.max(0, random()) * rarityPool.length))];
}

export function createPenaltyJudgment({ contract, level = 0, neglectDays = 0, reason = 'daily-missed', failedQuestIds = [], day, dailyXpEarned = 0, dailyXpDay = null, date = new Date() }, random = Math.random) {
    const card = drawPenaltyCard(contract, level, neglectDays, random);
    if (!card) return null;
    return {
        id: `judgment-${day}`,
        cardId: card.id,
        rarity: card.rarity,
        realWorld: Boolean(card.realWorld),
        reason,
        failedQuestIds: [...failedQuestIds],
        dailyXpEarned: Math.max(0, Number(dailyXpEarned) || 0),
        dailyXpDay,
        status: 'awaiting',
        effectApplied: false,
        createdAt: date.toISOString(),
        resolvedAt: null,
        note: '',
        proof: null,
    };
}
