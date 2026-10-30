# AURA — Real-Life RPG

A cinematic, responsive RPG habit-tracking prototype built with Next.js, React, and a custom dark-fantasy design system.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Android APK

AURA includes a native Capacitor Android shell. The interface, fonts, and artwork are bundled into the APK, so the prototype works offline after installation.

**Latest direct download:** [AURA 1.9 debug APK](public/downloads/AURA-debug.apk).

### Download from GitHub Actions

Every push to `main` or an `arena/*` branch runs **Build Android APK**. Open the completed workflow run and download the **AURA-Android-APK** artifact. The APK is debug-signed for direct installation and testing; it is not a Play Store release build.

To install it on an Android device:

1. Download `AURA-debug.apk` to the device.
2. Allow your browser or file manager to install unknown apps when Android prompts you.
3. Open the APK and tap **Install**.

### Build locally

Install Android Studio, Android SDK 35, and Java 21, then run:

```bash
npm ci
npm run build:apk
```

The generated APK is located at `android/app/build/outputs/apk/debug/app-debug.apk`.

For native development, use `npm run cap:sync` after changing the web interface, then open the `android` directory in Android Studio.

## Included in this prototype

- Device-local email, Google, and Facebook preview login with returning-account restoration
- Level-zero character creation and class-based daily quests that rotate on later days
- Interactive daily quests with category filters, rewards, countdowns, empty states, and configurable daily-reset penalties
- Character progression, level-up celebrations, and attributes
- Thirty-eight selectable heroes—17 male and 21 female—across four classes, including all 32 supplied character portraits, searchable/filterable selection, 3D-style card depth, and readable backstories
- Radial skill constellation with permanent and active skills, SP costs, and reversible linked-quest unlock milestones
- Weekly Void Colossus boss encounter with trial progress
- Imperial Vault with cosmetics, consumables, and tarot cards
- Level-weighted Deck of Fate with 2,700 real-world quests across nine ranks (F–SSS), unique illustrations/descriptions, balanced categories, and real XP, Gold, and Diamond quest rewards
- Energy-gated Focus Sanctuary timer, weekly statistics, session rewards, and persistent best streak
- Friends, gifting, cumulative-XP leaderboards, duel-specific PvP progress, stake pots, and consumable attack spells
- Notifications, settings, onboarding, responsive drawer navigation, and reduced-motion support

## The 2,700-quest bank

Each path contains exactly 100 base actions with nine variations—F, E, D, C, B, A, S, SS, and SSS—for 900 quests per path and 2,700 total:

- `components/aura/quests/physical.json` — 900 `PH-*` quests
- `components/aura/quests/mental.json` — 900 `ME-*` quests
- `components/aura/quests/spiritual.json` — 900 `SP-*` quests

Every record includes `id`, `rank`, `category`, `text`, `xp`, `gold`, `description`, `image`, `skillIds`, and `baseAction`. Every quest has an individual minimalist SVG illustration under `public/images/quests/`. Completion advances the listed skills’ unlock milestones; reversing a completion also reverses that progress.

The deterministic source actions and artwork generator live in `scripts/`. Regenerate and independently verify counts, IDs, unique text/descriptions/artwork, rank scaling, exact rewards, and all-skill coverage with:

```bash
npm run generate:quests
npm run validate:quests
```

## Commands

```bash
npm run build           # Production web build
npm run build:mobile    # Native web bundle
npm run cap:sync        # Build and copy the bundle into Android
npm run build:apk       # Build an installable debug APK (requires Android SDK)
npm run lint            # ESLint
npm run generate:quests # Rebuild JSON quest banks and individual SVG artwork
npm run validate:quests # Validate all 2,700 quests and skill relationships
npm run start           # Serve the production web build
```

## Architecture note

This repository currently implements the front-end experience with device-local sessions and per-account browser storage. The email, Google, and Facebook controls are preview authentication flows; they are not production OAuth or secure remote identity verification. Progress is restored only on the same browser/device. Firebase Authentication, Firestore persistence, server-time anti-cheat, native notifications, and production-ready admin authorization require a separately configured backend and are not represented as active integrations in this prototype.
