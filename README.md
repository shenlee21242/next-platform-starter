# AURA — Real-Life RPG

A cinematic, responsive RPG habit tracker built with Next.js, React, and a custom dark-fantasy design system. AURA 1.22 includes one-tap daily goals, multi-session weekly and monthly goals with saved progress and gradual rewards, full custom-goal management, a four-language 22,500-quest life codex, 1,250 nine-rank progression chains, illustrated three-state AURA cards, unlimited player-added goals, capped random-quest slots with fixed upgrade prices, a stable 10-Gold workday store, positive-net Fate draw economics, and an offline Capacitor Android shell.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Downloads

- **Android:** [AURA 1.22 debug APK](public/downloads/AURA-debug.apk)
- **Arabic Word codex:** [AURA — 22,500 life quests](public/downloads/AURA-Life-Quests-22500-Ar.docx)

The APK is debug-signed for direct installation and testing; it is not a Play Store release build. The interface, fonts, generated quest engine, and artwork are bundled for offline use. Distribution APKs and the Word document are not nested inside subsequent Android builds.

To install on Android, download `AURA-debug.apk`, allow your browser or file manager to install unknown apps when prompted, then open the APK and tap **Install**. If Android reports a conflicting signature from an older debug build, uninstall that build first; doing so also removes its device-local progress.

### Build locally

Install Android Studio, Android SDK 35, and Java 21, then run:

```bash
npm ci
npm run build:apk
```

The generated APK is located at `android/app/build/outputs/apk/debug/app-debug.apk`. For native development, use `npm run cap:sync` after changing the web interface.

## AURA 1.22 highlights

- **03:00 failure evaluation:** late-night completions count until 03:00; daily incompletes, a full inactive day, and expired weekly/monthly goals produce at most one judgment per failure day
- **Preaccepted Contract:** the player explicitly opts in, selects accepted rarities and individual in-game cards, and separately opts into each real-world card; Legendary remains locked until level 5 and three neglect days
- **Exact rarity model:** Common 60%, Uncommon 25%, Rare 12%, and Legendary 3%, renormalized only across rarities the contract makes eligible
- **Non-dismissible Judgment:** a dark full-screen card-flip experience requires accepting the revealed judgment or consuming an owned Penalty Shield; no XP, Gold, streak, slot, or quest effect applies before that decision
- **Immediate in-game resolution:** all 16 in-game cards implement XP/Gold loss, current-level percentage loss, streak effects with Streak Freeze, temporary slot locks, no-XP next completion, mandatory quests, daily-XP loss across levels, and level regression without going below level 0
- **Non-destructive slot locks:** Heavy Shackles and Harvest of Slots temporarily reduce usable random capacity for 24/72 hours while preserving permanent purchases and the exact 30/42/59/82/115/161/226 price ladder
- **Persistent AURA Archive:** the Character ledger keeps awaiting decisions, red pending real-world fulfillment, dimmed fulfilled entries with checks, and shield-canceled history; optional notes and resized evidence remain device-local
- **Exact 14-card real-world contract:** three Common, four Uncommon, three Rare, and four Legendary cards preserve the requested coffee/social-media/room, physical/cold/entertainment/tribute, confession/harsh-tribute/luxury, and digital-shame/seizure/hard-labor/ultimate-tribute concepts. Small Tribute designates UNICEF; Harsh Tribute has a preselected target field. Changed terms require renewed opt-in, while retired definitions remain readable in old archives
- **Developer penalty trial:** entering `JSS777` in Social Hub friend search immediately opens a trial judgment on any authenticated account and cycles through all 14 real-world cards on repeated entries. Trials are clearly labeled, never grant admin conversion privileges, and do not create a real failure judgment
- **Honor-based offline fulfillment:** accepted real-world judgments stay pending until the player confirms fulfillment. AURA never claims to post, message, charge, or enforce the action automatically; the Contract displays health and consent reminders without silently changing the selected card
- **Server-assisted clock:** the web app syncs to an uncached server-time endpoint and advances from a monotonic clock; offline Android retains the last trusted reading or honestly falls back to the device clock before its first sync
- **Daily once, long goals progressively:** daily goals retain one-tap completion, while every weekly and monthly goal advances through multiple sessions and reaches completion only at 100%
- **Flexible session planner:** custom weekly goals support 2–7 sessions and monthly goals 2–31 sessions, with 5–240 minutes per session and selectable preferred weekdays; one session per goal can be logged each day, and a missed preferred day can be made up on another day
- **Visible saved progress:** every long goal shows completed/target sessions, an automatic percentage, per-session and total time, preferred days, and session history; progress survives reloads and ordinary daily rollover
- **Larger effort-matched rewards:** long goals have larger total XP, Gold, and time commitments, awarded in exact gradual slices after each session with existing boosts and daily Gold caps; generated weekly goals default to 3 × 20 minutes for 600 XP / 240 Gold, and monthly goals to 8 × 30 minutes for 1,600 XP / 640 Gold
- **Safe session correction:** undoing the latest session removes only that session’s progress and actual awarded rewards; deleting a custom goal still never rolls back previously earned XP or Gold
- **Progress-preserving editing and migration:** started custom goals retain their ID, completion history, and percentage when edited or moved between compatible periods; completed plans are protected, and legacy weekly/monthly goals receive sensible session plans without rewriting earned rewards
- **Exact localized date ranges:** each period shows its inclusive local dates, including the Monday–Sunday week and the current calendar month, alongside its live reset countdown
- **Active and completed views:** All, Active, and Completed filters include live counts and compose with the existing category filters; changing periods resets narrowed filters so goals are never hidden accidentally
- **Custom-goal editing:** player-created goals can be renamed, retimed, moved between periods, and have their difficulty/rewards updated while preserving identity, completion state, and previously earned rewards
- **Safe custom-goal deletion:** a two-step confirmation permanently deletes only player-created goals; automatic, Fate, and chain-selected quests do not expose these controls, and deletion never rolls back earned XP or Gold
- **Immediate period handoff:** creating or moving a goal opens its destination tab automatically, and the selected period persists while navigating between screens in the SPA
- **Three functional goal periods:** every account receives a localized daily goal for the local day, a weekly goal for the Monday-based week, and a monthly goal for the calendar month; each has its own navigation tab, progress, deadline, and period metadata
- **Correct automatic rollover:** daily goals refresh at 03:00 local time, weekly goals refresh on Monday, and monthly goals refresh on the first day of the next month; weekly and monthly goals survive ordinary daily resets, while expired custom goals are removed with their period
- **Period-specific custom goals:** the New quest action inherits the open tab, and its period picker can create a daily, weekly, or monthly goal; all custom goals remain unlimited and independent of random-quest capacity
- **Resilient wall-clock resets:** the live timer rereads local time every second and detects calendar changes directly, covering device sleep and countdown drift; login, onboarding, and the live 03:00 path share the same period engine
- **Unlimited personal additions:** player-created goals in all three periods and the next quests selected from progression chains never consume random-quest capacity and can be added whenever the player wants
- **Three to ten simultaneous random quests:** every account starts with three active random-quest slots; completing a random quest releases its slot, and full slots prevent additional Fate draws or custom-to-random rerolls without consuming the reroll
- **Exact fixed slot prices:** slots 4–10 cost **30, 42, 59, 82, 115, 161, and 226 Gold**, following `round(30 × 1.4^(slot − 4))`; the complete ladder costs **715 Gold**, approximately **71 days at 10 Gold/day**, and further purchases lock at ten
- **Positive-net Fate draw economics:** every F–SSS draw fee is exactly 20% of that rank’s base Gold reward, so the base reward is five times the fee (F: 2 Gold to draw, 10 Gold on completion, +8 base net); the regular daily Gold cap still applies
- **Focused real-life quest dashboard:** the Weekly Boss and character selector are removed from the quest area; the complete selectable roster and backstories remain on the Character screen
- **Stable 10-Gold workday:** 100% is always 10 Gold, so built-in prices never increase when quests are added; custom real rewards still use player-selected percentages of that reference, while the base daily Gold cap is 20 and each cap upgrade adds 10
- **Exact real-life reward prices:** short break 4, entertainment hour 8, rest-day quest skip 12, favorite meal 15, late night 20, and a small gift 30 Gold
- **Exact power-up prices:** quest reroll 5, one-hour XP multiplier 8, Streak Freeze 10, Penalty Shield 15, and daily Gold multiplier 25 Gold; daily purchase limits remain enforced, and the separate PvP spell retains its previous 100-Gold reference price
- **Exact cosmetic and permanent-upgrade prices:** profile background 40, avatar frame 60, title 90, full color theme 150, daily Gold-cap upgrade 60, and monthly Second Chance 100 Gold; random slots retain their separate fixed ladder
- Rest-day quest selection skips one quest without rewards or penalties; rerolls replace rather than duplicate quests while retaining their period; XP/Gold boosts, daily caps, purchases, cosmetics, upgrades, and custom rewards persist locally
- **22,500 active real-world quests** across Religious, Psychological, Physical, Mental, Self-development, and Social paths
- Exactly **2,500 quests per rank** across F, E, D, C, B, A, S, SS, and SSS
- Exactly **11,250 sequential quests** in **1,250 themed chains**; every chain preserves its action/context while progressing through all nine ranks, leaving 11,250 standalone quests
- Every sealed deck card uses the same ornate AURA cover; drawing performs two successive rotations—AURA cover → category character back → quest-description front—with the cover also used by the dashboard deck widget
- Category-themed card treatments: emerald Social, silver Psychological, gold Self-development, red Physical, violet Cognitive, and violet/gold Religious; each description front retains its quest's unique generated SVG artwork, skills, chain metadata, and rewards
- Inspect all nine chain steps and add the next step after completing an accepted quest once its rank is level-unlocked
- Codex filtering for sequential chains or standalone quests, chain/ID search, persistent chain progress, and four-language chain navigation
- Complete **English, العربية, Français, and Español** quest content generated from the same structured sources
- Persistent language selection, translated accepted quests, and a structural right-to-left Arabic layout
- Level-cumulative Deck of Fate: levels 0–9 use F; 10–19 use F/E; 20–29 use F/E/D; a new rank is added every ten levels until all nine unlock at level 80
- Balanced random selection across six life paths, level-weighted rank probabilities, rank-based Gold costs, and existing XP/Gold/Diamond rewards
- Searchable Codex with full-text/ID/source search, path/rank/skill filters, 24-entry pagination, detailed entries, and Deck handoff
- Deterministic inline SVG artwork for every quest ID—no 22,500-file image payload—and a distinctive colored reveal aura for every rank
- Respectful family, marriage, professional mixed-gender, and cross-gender communication tasks based on consent, truthful persuasion, privacy, and freedom to refuse
- Thirty-eight selectable heroes with readable backstories, persistent skill progression, daily quests, Focus Sanctuary, local social previews, and the workday reward economy

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

The Religious matrix contains 25 core actions × 20 execution contexts × nine ranks. Each other path contains 20 core actions × 20 contexts × nine ranks. Rank directives, doses, completion evidence, and multi-week plans make every generated objective unique. Higher ranks emphasize quality, consistency, review, and sustainable projects rather than unsafe volume. The first half of each category/rank matrix forms nine-step chains (250 Religious chains plus 200 chains in every other path), so sequential and standalone tasks each total exactly half the library.

Runtime content and translations live in:

- `components/aura/life-content/` — multilingual core actions, contexts, and source mappings
- `components/aura/life-quests.js` — deterministic quest generation, rewards, references, localization, and ID lookup
- `components/aura/fate.js` — cumulative level gates and weighted random selection
- `components/aura/quest-artwork.jsx` — seeded, unique inline SVG card illustrations
- `components/aura/quest-card.jsx` — reusable AURA cover, character-art back, and illustrated quest-description front with manual three-state inspection
- `components/aura/card-themes.js` — category colors, character artwork, and image treatments
- `public/images/card-themes/` — optimized local WebP AURA cover and character card illustrations
- `components/aura/quest-chain.jsx` — nine-step chain navigation, level gates, completion state, and next-step handoff
- `components/aura/i18n.jsx` — interface translations, language context, and switcher
- `components/aura/game.js` — localized periodic-goal generation, multi-session plans, progress percentages, gradual reward slices, legacy-save migration, 03:00 failure evaluation, rollover, and judgment deduplication
- `components/aura/penalty-cards.js` — localized penalty catalog, contract normalization, rarity-weighted draws, eligibility gates, and safe effect definitions
- `components/aura/penalty-ui.jsx` — Judgment, Contract, fulfillment, and Character ledger interfaces
- `components/aura/clock.js` and `app/api/aura/time/route.js` — server-assisted, monotonic time with offline fallback
- `components/aura/dashboard.jsx` — daily/weekly/monthly navigation, exact date ranges, session progress bars, period progress, countdowns, status/category filters, and goal presentation
- `components/aura/store-catalog.js` — localized workday items, the stable 10-Gold reference, exact percentage mappings, fixed random-slot pricing helpers, and balance ranges
- `components/aura/store-screen.jsx` — responsive reward, power-up, cosmetic, upgrade, and PvP store interface

Every record exposes `id`, `rank`, `category`, `text`, `xp`, `gold`, `description`, `image`, `skillIds`, `baseAction`, `completion`, and `sourceCodes`. Sequential records also expose `chainId`, `chainStep`, `chainLength`, `previousQuestId`, and `nextQuestId`. `image` is a unique `aura-art://` identity rendered by the local SVG engine. Accepted quests retain their source ID and are regenerated in the newly selected language.

### Reference and safety policy

The source synthesis covers the Quran, authentic Sunnah collections, classical religious works, CBT/ACT/DBT, behavioral activation, self-determination theory, motivational interviewing, psychiatry references, WHO/ACSM physical-health guidance, learning science, habit formation, decision-making, communication, marriage, and ethical influence.

The tasks are practical adaptations, not quotations from every source, fatwas, diagnoses, or treatment plans. Religious uncertainties belong with qualified scholars. Cards never instruct users to change medication or replace professional care. Cross-gender influence is restricted to honest communication and mutual benefit with consent and the right to decline; manipulation, coercion, jealousy tactics, and persistence after refusal are excluded.

### Validate and export

```bash
npm run validate:life-quests   # All 22,500 × 4 locales, chains, sources, skills, level gates, and Fate economics
npm run validate:store         # All 17 exact prices at 10 Gold, the slot ladder, localization, and protection
npm run validate:periods       # Session plans, progress/rewards, date ranges, migration, rollover, unlimited goals, and penalties
npm run validate:penalties     # Contract, rarity, 03:00 judgments, inactivity, expiry, deduplication, and slot protections
npm run export:life-codex      # Export the Arabic runtime bank for the Word builder
npm run build:life-docx        # Build the Arabic Word document
npm run generate:life-codex    # Export + build in one command
```

For the optional browser regression suite, start the app, install a Playwright Chromium browser with `npx playwright install chromium`, then run `AURA_URL=http://127.0.0.1:3000 npm run test:penalty-browser`. Set `CHROMIUM_PATH` when using an existing Chromium executable.

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
npm run validate:life-quests # Validate the active 22,500-quest engine and level gates
npm run validate:store        # Validate exact 10-Gold-reference prices, slot limits, and protection rules
npm run validate:periods      # Validate session progress/rewards, date ranges, persistence metadata, and rollover
npm run generate:life-codex # Rebuild the Arabic Word codex
npm run generate:quests     # Rebuild the legacy 2,700-quest archive
npm run validate:quests     # Validate the legacy archive
npm run start               # Serve the production web build
```

Every push to `main` or an `arena/*` branch also runs **Build Android APK** in GitHub Actions.

## Architecture note

This repository implements the front-end experience with device-local sessions and per-account browser storage. Email, Google, and Facebook controls are preview authentication flows, not production OAuth or secure remote identity verification. Progress is restored only on the same browser/device. Firebase Authentication, Firestore persistence, trusted server-time anti-cheat, native notifications, and production admin authorization require a separately configured backend and are not represented as active integrations.
