import { mkdir, writeFile } from 'node:fs/promises';
import { getLifeQuestBank, lifeCategories, LIFE_REFERENCES, rankDefinitions } from '../components/aura/life-quests.js';

const quests = getLifeQuestBank('ar');
const manifest = {
    title: 'AURA — موسوعة بطاقات المهام الحياتية',
    total: quests.length,
    categories: lifeCategories.map((category) => ({ id: category.id, prefix: category.prefix, label: category.label.ar, perRank: category.perRank, total: category.perRank * 9 })),
    ranks: rankDefinitions.map((rank, index) => ({ ...rank, levelRange: index === 8 ? '80+' : `${index * 10}–${index * 10 + 9}` })),
    references: LIFE_REFERENCES,
};
await mkdir('artifacts', { recursive: true });
await mkdir('public/downloads', { recursive: true });
await writeFile('artifacts/life-quests-ar.json', JSON.stringify(quests));
await writeFile('artifacts/life-codex-manifest.json', JSON.stringify(manifest));
console.log(`Exported ${quests.length} Arabic quests for the Word codex.`);
