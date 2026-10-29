# AURA — Real-Life RPG

A cinematic, responsive RPG habit-tracking prototype built with Next.js, React, and a custom dark-fantasy design system.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Included in this prototype

- Interactive daily quests with category filters, rewards, countdowns, and empty states
- Character progression, level-up celebrations, attributes, and avatar skins
- Radial skill constellation with unlockable permanent and active skills
- Weekly Void Colossus boss encounter with trial progress
- Imperial Vault with cosmetics, consumables, and tarot cards
- Mystery tarot draws with rank-based pricing and real quest rewards
- Focus Sanctuary timer, energy, and session rewards
- Friends, gifting, friends-only leaderboards, and stake-based PvP duels
- Notifications, settings, onboarding, responsive drawer navigation, and reduced-motion support

## Commands

```bash
npm run build   # Production build
npm run lint    # ESLint
npm run start   # Serve the production build
```

## Architecture note

This repository currently implements the front-end experience with in-memory demo state. Firebase Authentication, Firestore persistence, server-time anti-cheat, native notifications, and production-ready admin authorization require a separately configured backend and are not represented as active integrations in this prototype.
