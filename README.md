# AURA — Real-Life RPG

A cinematic, responsive RPG habit tracker built with Next.js, React, and a custom dark-fantasy design system. AURA 1.11 includes a four-language, 22,500-quest life codex and an offline Capacitor Android shell.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Downloads

- **Android:** [AURA 1.11 debug APK](public/downloads/AURA-debug.apk)
- **Arabic Word codex:** [AURA — 22,500 life quests](public/downloads/AURA-Life-Quests-22500-Ar.docx)

The APK is debug-signed for direct installation and testing; it is not a Play Store release build. The interface, fonts, generated quest engine, and artwork are bundled for offline use. Distribution APKs and the Word document are not nested inside subsequent Android builds.

To install on Android, download `AURA-debug.apk`, allow your browser or file manager to install unknown apps when prompted, then open the APK and tap **Install**.

### Build locally

Install Android Studio, Android SDK 35, and Java 21, then run:

```bash
npm ci
npm run build:apk
```

The generated APK is located at `android/app/build/outputs/apk/debug/app-debug.apk`. For native development, use `npm run cap:sync` after changing the web interface.

## AURA 1.11 highlights

- **22,500 active real-world quests** across Religious, Psychological, Physical, Mental, Self-development, and Social paths
- Exactly **2,500 quests per rank** across F, E, D, C, B, A, S, SS, and SSS
- Complete **English, العربية, Français, and Español** quest content generated from the same structured sources
- Persistent language selection, translated accepted quests, and a structural right-to-left Arabic layout
- Level-cumulative Deck of Fate: levels 0–9 use F; 10–19 use F/E; 20–29 use F/E/D; a new rank is added every ten levels until all nine unlock at level 80
- Balanced random selection across six life paths, level-weighted rank probabilities, rank-based Gold costs, and existing XP/Gold/Diamond rewards
- Searchable Codex with full-text/ID/source search, path/rank/skill filters, 24-entry pagination, detailed entries, and Deck handoff
- Deterministic inline SVG artwork for every quest ID—no 22,500-file image payload—and a distinctive colored reveal aura for every rank
- Respectful family, marriage, professional mixed-gender, and cross-gender communication tasks based on consent, truthful persuasion, privacy, and freedom to refuse
- Thirty-eight selectable heroes, persistent skill progression, daily quests, Focus Sanctuary, boss trials, local social previews, and the existing reward systems

The Deck accepts quests; Codex browsing itself is read-only. Existing device-local authentication/storage and social opponents remain preview systems, not production backend services.

## The 22,500-quest engine

Each rank contains:

| Path | Per rank | Across nine ranks |
| --- | ---: | ---: |
| Religious | 500 | 4,500 |
| Psychological | 400 | 3,600 |
| Physical | 400 | 3,600 |
| Mental | 400 | 3,600 |
| Self-development | 400 | 3,600 |
| Social | 400 | 3,600 |
| **Total** | **2,500** | **22,500** |

The Religious matrix contains 25 core actions × 20 execution contexts × nine ranks. Each other path contains 20 core actions × 20 contexts × nine ranks. Rank directives, doses, completion evidence, and multi-week plans make every generated objective unique. Higher ranks emphasize quality, consistency, review, and sustainable projects rather than unsafe volume.

Runtime content and translations live in:

- `components/aura/life-content/` — multilingual core actions, contexts, and source mappings
- `components/aura/life-quests.js` — deterministic quest generation, rewards, references, localization, and ID lookup
- `components/aura/fate.js` — cumulative level gates and weighted random selection
- `components/aura/quest-artwork.jsx` — seeded, unique inline SVG card illustrations
- `components/aura/i18n.jsx` — interface translations, language context, and switcher

Every record exposes `id`, `rank`, `category`, `text`, `xp`, `gold`, `description`, `image`, `skillIds`, `baseAction`, `completion`, and `sourceCodes`. `image` is a unique `aura-art://` identity rendered by the local SVG engine. Accepted quests retain their source ID and are regenerated in the newly selected language.

### Reference and safety policy

The source synthesis covers the Quran, authentic Sunnah collections, classical religious works, CBT/ACT/DBT, behavioral activation, self-determination theory, motivational interviewing, psychiatry references, WHO/ACSM physical-health guidance, learning science, habit formation, decision-making, communication, marriage, and ethical influence.

The tasks are practical adaptations, not quotations from every source, fatwas, diagnoses, or treatment plans. Religious uncertainties belong with qualified scholars. Cards never instruct users to change medication or replace professional care. Cross-gender influence is restricted to honest communication and mutual benefit with consent and the right to decline; manipulation, coercion, jealousy tactics, and persistence after refusal are excluded.

### Validate and export

```bash
npm run validate:life-quests   # All 22,500 × 4 locales, counts, uniqueness, sources, skills, and level gates
npm run export:life-codex      # Export the Arabic runtime bank for the Word builder
npm run build:life-docx        # Build the Arabic Word document
npm run generate:life-codex    # Export + build in one command
```

The Word builder requires Python and `python-docx`:

```bash
python -m pip install -r scripts/requirements-docx.txt
npm run generate:life-codex
```

Generated JSON intermediates are written to the ignored `artifacts/` directory. The final Word document contains all 22,500 Arabic cards, organized by path and then rank F through SSS, with references, completion evidence, level rules, and source methodology.

## Original 2,700-quest archive

The original English Physical/Mental/Spiritual JSON banks and their 2,700 static illustrations remain in the repository as a legacy archive:

- `components/aura/quests/physical.json` — 900 `PH-*` quests
- `components/aura/quests/mental.json` — 900 `ME-*` quests
- `components/aura/quests/spiritual.json` — 900 `SP-*` quests

They are no longer the active Deck/Codex bank. Their deterministic source generator and independent validator remain available:

```bash
npm run generate:quests
npm run validate:quests
```

## Commands

```bash
npm run dev                 # Development server
npm run build               # Production web build
npm run build:mobile        # Native web bundle
npm run cap:sync            # Build and copy the bundle into Android
npm run build:apk           # Build an installable debug APK (requires Android SDK)
npm run lint                # ESLint
npm run validate:life-quests# Validate the active 22,500-quest engine and level gates
npm run generate:life-codex # Rebuild the Arabic Word codex
npm run generate:quests     # Rebuild the legacy 2,700-quest archive
npm run validate:quests     # Validate the legacy archive
npm run start               # Serve the production web build
```

Every push to `main` or an `arena/*` branch also runs **Build Android APK** in GitHub Actions.

## Architecture note

This repository implements the front-end experience with device-local sessions and per-account browser storage. Email, Google, and Facebook controls are preview authentication flows, not production OAuth or secure remote identity verification. Progress is restored only on the same browser/device. Firebase Authentication, Firestore persistence, trusted server-time anti-cheat, native notifications, and production admin authorization require a separately configured backend and are not represented as active integrations.
