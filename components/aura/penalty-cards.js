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
    harshTributeTarget: '',
    realWorldContractVersion: 2,
};

export function normalizePenaltyContract(value = {}) {
    return {
        ...DEFAULT_PENALTY_CONTRACT,
        ...value,
        tiers: { ...DEFAULT_PENALTY_CONTRACT.tiers, ...(value.tiers || {}) },
        disabledCardIds: Array.isArray(value.disabledCardIds) ? value.disabledCardIds : [],
        realWorldCardIds: (value.realWorldContractVersion ?? (value.realWorldCardIds?.length ? 0 : 2)) === 2 && Array.isArray(value.realWorldCardIds) ? value.realWorldCardIds : [],
        realWorldContractVersion: value.realWorldContractVersion ?? (value.realWorldCardIds?.length ? 0 : 2),
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

    { id: 'real-bitter-morning', rarity: 'Common', realWorld: true, effect: {}, name: l('The Bitter Morning', 'فقدان القهوة', 'Le Matin amer', 'La Mañana amarga'), effectText: l('No coffee or tea tomorrow.', 'لا يُسمح لك بشرب القهوة أو الشاي غدًا.', 'Pas de café ni de thé demain.', 'No café ni té mañana.'), text: l('You took your comfort today; tomorrow I will take your alertness. A morning without coffee.', 'أخذت راحتك اليوم، غدًا سأخذ يقظتك. صباح بلا قهوة.', 'Vous avez pris votre confort aujourd’hui ; demain je prendrai votre vigilance. Un matin sans café.', 'Tomaste tu comodidad hoy; mañana tomaré tu alerta. Una mañana sin café.') },
    { id: 'real-digital-step-back', rarity: 'Common', realWorld: true, effect: {}, name: l('Digital Step-Back', 'التراجع التقني', 'Recul numérique', 'Retroceso digital'), effectText: l('Close all social media apps for three consecutive hours.', 'إغلاق جميع تطبيقات التواصل الاجتماعي لمدة 3 ساعات متواصلة.', 'Fermez toutes les applications sociales pendant trois heures consécutives.', 'Cierra todas las aplicaciones sociales durante tres horas seguidas.'), text: l('Your eyes were here instead of on your quests. I will hide the world from them for hours.', 'عيناك كانتا هنا بدلًا من مهامك. سأحجب عنهما العالم لساعات.', 'Vos yeux étaient ici au lieu de vos quêtes. Je leur cacherai le monde pendant des heures.', 'Tus ojos estaban aquí en lugar de tus misiones. Les ocultaré el mundo por horas.') },
    { id: 'real-chaos-theory', rarity: 'Common', realWorld: true, effect: {}, name: l('Chaos Theory', 'فوضى المكان', 'Théorie du chaos', 'Teoría del caos'), effectText: l('Tidy your entire room or desk now; do nothing else before that.', 'رتّب غرفتك أو مكتبك بالكامل الآن، ولا تفعل أي شيء آخر قبل ذلك.', 'Rangez entièrement votre chambre ou votre bureau maintenant ; ne faites rien d’autre avant.', 'Ordena toda tu habitación o escritorio ahora; no hagas nada más antes.'), text: l('There is chaos within you, and I will create chaos outside until you tidy it.', 'داخلك فوضى، وسأجعل خارجك فوضى حتى ترتبه.', 'Le chaos est en vous, et je créerai le chaos autour de vous jusqu’à ce que vous le rangiez.', 'Hay caos dentro de ti, y crearé caos fuera hasta que lo ordenes.') },
    { id: 'real-physical-debt', rarity: 'Uncommon', realWorld: true, effect: {}, name: l('Physical Debt', 'الدين البدني', 'Dette physique', 'Deuda física'), effectText: l('Perform 50 push-ups or 50 jumping jacks immediately.', 'أدِّ 50 تمرين ضغط أو 50 قفزة Jumping Jacks فورًا.', 'Effectuez immédiatement 50 pompes ou 50 jumping jacks.', 'Haz 50 flexiones o 50 jumping jacks inmediatamente.'), text: l('Your body failed you, and now it must pay the price. Move.', 'جسدك خذلك، والآن عليه أن يدفع الثمن. تحرك.', 'Votre corps vous a abandonné, et il doit maintenant payer le prix. Bougez.', 'Tu cuerpo te falló, y ahora debe pagar el precio. Muévete.') },
    { id: 'real-reapers-chill', rarity: 'Uncommon', realWorld: true, effect: {}, name: l('Reaper’s Chill', 'برد الحاصد', 'Le Froid du Faucheur', 'El Frío de la Segadora'), effectText: l('Take a fully cold shower for one full minute.', 'استحم بماء بارد تمامًا لمدة دقيقة كاملة.', 'Prenez une douche entièrement froide pendant une minute complète.', 'Toma una ducha completamente fría durante un minuto completo.'), text: l('To awaken the soul that slept through its duty. Shower in cold water.', 'لأيقظ روحك التي نامت عن واجبها. استحم بماء بارد.', 'Pour réveiller l’âme qui a dormi pendant son devoir. Douchez-vous à l’eau froide.', 'Para despertar el alma que durmió ante su deber. Dúchate con agua fría.') },
    { id: 'real-pleasure-denial', rarity: 'Uncommon', realWorld: true, effect: {}, name: l('Pleasure Denial', 'حرمان المتعة', 'Refus du plaisir', 'Renuncia al placer'), effectText: l('No series, films, or video games tomorrow.', 'لا يُسمح لك بمشاهدة أي مسلسل أو فيلم أو لعب فيديو غدًا.', 'Aucune série, aucun film ni jeu vidéo demain.', 'Nada de series, películas ni videojuegos mañana.'), text: l('Entertainment is a right earned, not granted. Denied for one day.', 'الترفيه حق يُكتسب، لا يُمنح. محروم منه ليوم.', 'Le divertissement se mérite, il ne se donne pas. Privé pour un jour.', 'El entretenimiento se gana, no se regala. Un día sin él.') },
    { id: 'real-small-tribute', rarity: 'Uncommon', realWorld: true, effect: {}, name: l('Small Tribute', 'التضحية المالية الصغيرة', 'Petit tribut', 'Pequeño tributo'), effectText: l('Donate 1 US dollar to UNICEF, as designated by AURA.', 'تبرّع بدولار أمريكي واحد لليونيسف؛ هذا هو اختيار AURA.', 'Faites un don d’un dollar américain à l’UNICEF, choisi par AURA.', 'Dona 1 dólar estadounidense a UNICEF, elegido por AURA.'), text: l('I will turn your Gold into charity. Perhaps you will learn the value of time.', 'سأحول ذهبك إلى صدقة. ربما تتعلم قيمة الوقت.', 'Je transformerai votre or en charité. Vous apprendrez peut-être la valeur du temps.', 'Convertiré tu oro en caridad. Quizá aprendas el valor del tiempo.') },
    { id: 'real-private-confession', rarity: 'Rare', realWorld: true, effect: {}, name: l('The Confession', 'الاعتراف', 'La Confession', 'La Confesión'), effectText: l('Send your preselected close friend: “I failed to complete my quests today in AURA.”', 'أرسل لصديقك المقرب المحدد مسبقًا: «لقد فشلت في إنجاز مهامي اليوم في تطبيق AURA.»', 'Envoyez à votre ami proche présélectionné : « Je n’ai pas accompli mes quêtes aujourd’hui dans AURA. »', 'Envía a tu amigo cercano preseleccionado: «No completé mis misiones hoy en AURA.»'), text: l('Secrets weigh on the soul. Confess your failure to someone you trust.', 'الأسرار تُثقل الروح. اعترف بفشلك لمن تثق به.', 'Les secrets pèsent sur l’âme. Confessez votre échec à une personne de confiance.', 'Los secretos pesan en el alma. Confiesa tu fracaso a alguien de confianza.') },
    { id: 'real-harsh-tribute', rarity: 'Rare', realWorld: true, effect: {}, name: l('The Harsh Tribute', 'التبرع القاسي', 'Le Tribut cruel', 'El Tributo cruel'), effectText: l('Donate 5 US dollars to the preselected organization, party, or person you dislike.', 'تبرّع بخمسة دولارات للجهة أو الحزب أو الشخصية التي لا تحبها وحددتها مسبقًا.', 'Faites un don de cinq dollars à l’organisation, au parti ou à la personne que vous n’aimez pas, présélectionné.', 'Dona cinco dólares a la organización, partido o persona que no te agrada y preseleccionaste.'), text: l('Your Gold will go to someone you hate. Your pain will be doubled.', 'ذهبك سيذهب لمن تكره. ألمك سيكون مضاعفًا.', 'Votre or ira à quelqu’un que vous détestez. Votre douleur sera doublée.', 'Tu oro irá a quien odias. Tu dolor será doble.') },
    { id: 'real-luxury-lockdown', rarity: 'Rare', realWorld: true, effect: {}, name: l('Luxury Lockdown', 'حرمان الرفاهية', 'Confinement du luxe', 'Bloqueo de lujo'), effectText: l('No food delivery for three days.', 'لا يُسمح لك بطلب طعام من الخارج لمدة ثلاثة أيام.', 'Aucune livraison de nourriture pendant trois jours.', 'Nada de comida a domicilio durante tres días.'), text: l('Delicious food is a luxury. You will cook for yourself, or starve.', 'الطعام اللذيذ رفاهية. ستطبخ لنفسك، أو تجوع.', 'La bonne nourriture est un luxe. Vous cuisinerez vous-même, ou vous aurez faim.', 'La comida deliciosa es un lujo. Cocinarás para ti o pasarás hambre.') },
    { id: 'real-digital-shame', rarity: 'Legendary', realWorld: true, effect: {}, name: l('Digital Shame', 'العار الرقمي', 'Honte numérique', 'Vergüenza digital'), effectText: l('Post a Story saying: “I failed myself today and did not complete my quests. AURA took my soul.”', 'انشر تغريدة أو حالة على حسابك: «لقد خذلت نفسي اليوم ولم أنجز مهامي. AURA قبضت روحي.»', 'Publiez une Story : « J’ai échoué aujourd’hui et je n’ai pas accompli mes quêtes. AURA a pris mon âme. »', 'Publica una historia: «Hoy me fallé y no completé mis misiones. AURA tomó mi alma.»'), text: l('You can no longer hide. I will make your failure visible to everyone.', 'لا يمكنك الاختباء بعد الآن. سأجعل فشلك مرئيًا للجميع.', 'Vous ne pouvez plus vous cacher. Je rendrai votre échec visible à tous.', 'Ya no puedes esconderte. Haré tu fracaso visible para todos.') },
    { id: 'real-seizure-of-joy', rarity: 'Legendary', realWorld: true, effect: {}, name: l('Seizure of Joy', 'مصادرة الترفيه', 'Saisie de la joie', 'Confiscación de la alegría'), effectText: l('Give your game controller or phone charging cable to a friend or family member for 24 hours.', 'سلّم جهاز التحكم أو كابل شاحن الهاتف لصديق أو فرد من العائلة لمدة 24 ساعة.', 'Confiez votre manette ou votre câble de charge à un proche pendant 24 heures.', 'Entrega tu mando o el cable del cargador a un amigo o familiar durante 24 horas.'), text: l('I will cut off your source of fun, so you learn that play has its time.', 'سأقطع عنك مصدر متعتك، لتتعلم أن اللعب له وقت.', 'Je couperai votre source de plaisir pour vous apprendre que le jeu a son temps.', 'Cortaré tu fuente de diversión para que aprendas que el juego tiene su momento.') },
    { id: 'real-hard-labor', rarity: 'Legendary', realWorld: true, effect: {}, name: l('The Hard Labor', 'العمل الشاق', 'Le Travail dur', 'El Trabajo duro'), effectText: l('Wake at 05:00 tomorrow, then read 20 pages or do heavy housework.', 'استيقظ غدًا الساعة 05:00، ثم اقرأ 20 صفحة أو أدِّ أعمالًا منزلية شاقة.', 'Réveillez-vous demain à 05 h 00, puis lisez 20 pages ou effectuez de lourdes tâches ménagères.', 'Despierta mañana a las 05:00 y lee 20 páginas o haz tareas domésticas pesadas.'), text: l('You wasted your day, so I will waste your night. Wake before dawn and work.', 'من أهدر نهاره، سأهدر ليله. استيقظ قبل الفجر واعمل.', 'Vous avez gaspillé votre journée, je gaspillerai votre nuit. Réveillez-vous avant l’aube et travaillez.', 'Desperdiciaste tu día, desperdiciaré tu noche. Despierta antes del amanecer y trabaja.') },
    { id: 'real-ultimate-tribute', rarity: 'Legendary', realWorld: true, effect: {}, name: l('The Ultimate Tribute', 'الخسارة المالية الكبرى', 'Le Tribut ultime', 'El Tributo definitivo'), effectText: l('Deduct 20 US dollars from your card and donate the full amount.', 'خصم 20 دولارًا أمريكيًا من بطاقتك وإرسالها كاملة كتبرع.', 'Débitez 20 dollars américains de votre carte et donnez la totalité.', 'Descuenta 20 dólares estadounidenses de tu tarjeta y dona el importe completo.'), text: l('When you lose passion, you will learn that laziness is expensive. You paid the price.', 'عندما تفقد الشغف، ستدرك أن الكسل مكلف. دفعت الثمن.', 'Quand vous perdrez la passion, vous comprendrez que la paresse coûte cher. Vous avez payé le prix.', 'Cuando pierdas la pasión, aprenderás que la pereza cuesta. Pagaste el precio.') },

    // Retired definitions remain readable for existing archives but cannot be drawn or newly selected.
    { id: 'real-water-reset', rarity: 'Uncommon', realWorld: true, legacy: true, effect: {}, name: l('Water Reset', 'استعادة الماء', 'Récupération par l’eau', 'Recuperación con agua'), effectText: l('Wash your face and drink a glass of water.', 'اغسل وجهك واشرب كوبًا من الماء.', 'Lavez-vous le visage et buvez un verre d’eau.', 'Lávate la cara y bebe un vaso de agua.'), text: l('A gentle reset, without cold exposure or harm.', 'إعادة لطيفة بلا تعرض للبرد أو أذى.', 'Une récupération douce, sans froid ni danger.', 'Un reinicio suave, sin frío ni daño.') },
    { id: 'real-home-table', rarity: 'Rare', realWorld: true, legacy: true, effect: {}, name: l('The Home Table', 'مائدة البيت', 'La Table de la maison', 'La Mesa de casa'), effectText: l('Prepare one nourishing meal at home. Never skip meals.', 'حضّر وجبة مغذية في البيت. لا تتخطَّ الوجبات أبدًا.', 'Préparez un repas nourrissant à la maison. Ne sautez jamais de repas.', 'Prepara una comida nutritiva en casa. Nunca te saltes comidas.'), text: l('Care for your body while you rebuild discipline.', 'اعتنِ بجسدك بينما تعيد بناء الانضباط.', 'Prenez soin de votre corps tout en reconstruisant votre discipline.', 'Cuida tu cuerpo mientras reconstruyes disciplina.') },
    { id: 'real-conscious-tribute', rarity: 'Rare', realWorld: true, legacy: true, effect: {}, name: l('Conscious Tribute', 'الصدقة الواعية', 'Offrande consciente', 'Ofrenda consciente'), effectText: l('If freely chosen, make a small donation to a charity you trust. AURA never charges you.', 'إن اخترت بحرية، قدّم تبرعًا صغيرًا لجهة خيرية تثق بها. AURA لا تخصم منك أبدًا.', 'Si vous le choisissez librement, faites un petit don à une association de confiance. AURA ne vous facture jamais.', 'Si lo eliges libremente, haz una pequeña donación a una organización de confianza. AURA nunca te cobra.'), text: l('Generosity must be free, informed, and never coerced.', 'العطاء يجب أن يكون حرًا وواعيًا وبلا إكراه.', 'La générosité doit être libre, éclairée et jamais forcée.', 'La generosidad debe ser libre, informada y nunca forzada.') },
    { id: 'real-device-sabbath', rarity: 'Legendary', realWorld: true, legacy: true, effect: {}, name: l('Device Sabbath', 'راحة الجهاز', 'Repos de l’appareil', 'Descanso del dispositivo'), effectText: l('Optionally entrust a gaming controller—not a phone or safety device—to someone for 24 hours.', 'اختياريًا، سلّم ذراع ألعاب، لا هاتفًا أو جهاز أمان، لشخص موثوق لمدة 24 ساعة.', 'Confiez éventuellement une manette de jeu—pas un téléphone ni un appareil de sécurité—pendant 24 heures.', 'Opcionalmente entrega un mando de juegos, no un teléfono ni dispositivo de seguridad, durante 24 horas.'), text: l('A voluntary pause, with communication and safety untouched.', 'استراحة اختيارية مع بقاء التواصل والأمان دون مساس.', 'Une pause volontaire, sans toucher à la communication ni à la sécurité.', 'Una pausa voluntaria, sin afectar comunicación ni seguridad.') },
];

export function getPenaltyCard(id, language = 'en') {
    const card = penaltyCards.find((entry) => entry.id === id);
    if (!card) return null;
    return { ...card, name: localize(card.name, language), text: localize(card.text, language), effectText: localize(card.effectText, language) };
}

export function getAvailablePenaltyCards(contractValue = {}, level = 0, neglectDays = 0) {
    const contract = normalizePenaltyContract(contractValue);
    return penaltyCards.filter((card) => {
        if (card.legacy) return false;
        if (!contract.tiers[card.rarity]) return false;
        if (card.rarity === 'Legendary' && (level < 5 || neglectDays < 3)) return false;
        return card.realWorld ? contract.realWorldCardIds.includes(card.id) : !contract.disabledCardIds.includes(card.id);
    });
}

export const REAL_WORLD_TRIAL_CARD_IDS = [
    'real-bitter-morning', 'real-digital-step-back', 'real-chaos-theory',
    'real-physical-debt', 'real-reapers-chill', 'real-pleasure-denial', 'real-small-tribute',
    'real-private-confession', 'real-harsh-tribute', 'real-luxury-lockdown',
    'real-digital-shame', 'real-seizure-of-joy', 'real-hard-labor', 'real-ultimate-tribute',
];

export function createPenaltyTrialJudgment(judgments = [], date = new Date()) {
    const previousTrials = judgments.filter((entry) => entry.reason === 'developer-trial').length;
    const cardId = REAL_WORLD_TRIAL_CARD_IDS[previousTrials % REAL_WORLD_TRIAL_CARD_IDS.length];
    const card = penaltyCards.find((entry) => entry.id === cardId);
    return {
        id: `judgment-trial-${date.getTime()}-${previousTrials}`,
        cardId,
        rarity: card.rarity,
        realWorld: true,
        reason: 'developer-trial',
        trialNumber: previousTrials + 1,
        failedQuestIds: [],
        dailyXpEarned: 0,
        dailyXpDay: null,
        status: 'awaiting',
        effectApplied: false,
        createdAt: date.toISOString(),
        resolvedAt: null,
        note: '',
        proof: null,
    };
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
