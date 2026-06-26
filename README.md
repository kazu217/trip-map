# TripMap

Offline-first travel itinerary organizer built with Expo, React Native, and
TypeScript.

TripMap helps travelers keep hotels, transport, tours, tickets, reservation
numbers, links, notes, and map pins in one trip workspace. The project is also
intended to be a practical open-source reference for maintainers building
privacy-aware, cross-platform travel planning apps.

## Why It Matters

Travel plans are usually scattered across booking sites, emails, PDFs, maps,
screenshots, and notes. TripMap focuses on a small but durable maintainer
problem: make essential trip information fast to find, local-first by default,
and portable across iOS, Android, and web.

The codebase is structured so contributors can improve one part at a time:
offline storage, Firebase backup, maps, attachments, notification reminders,
booking text import, accessibility, and release workflows.

## Features

- Trip CRUD with active and archived trips
- Spot CRUD for hotels, sightseeing, tours, and transport
- Category-colored map pins with a web fallback when native maps are unavailable
- Date-based itinerary and timeline views
- Reservation numbers, booking URLs, free-form notes, and ticket attachment URIs
- Offline local persistence through Zustand and AsyncStorage
- Optional Firebase anonymous auth and Firestore sync
- Optional Google Maps and geocoding integration
- TypeScript-first Expo project with documented build and release flows

## Repository Scope

This public repository intentionally tracks the Expo source, assets, lockfile,
and documentation. Generated native projects, build artifacts, local `.env`
files, keystores, provisioning profiles, and app-store export outputs are kept
out of Git.

Use `expo prebuild` or EAS Build to regenerate native projects when needed.

## Quick Start

```bash
npm install
cp .env.example .env
npm run start
```

The app works with local demo data when Firebase and Google Maps keys are not
configured. To enable cloud sync or native maps, fill in `.env` and restart
Expo. See:

- [Firebase setup](docs/FIREBASE_SETUP.md)
- [Google Maps setup](docs/GOOGLE_MAPS_SETUP.md)

## Commands

```bash
npm run start
npm run ios
npm run android
npm run web
npm run prebuild:all
npm run typecheck
```

## Documentation

- [Product requirements](docs/PRODUCT_REQUIREMENTS.md)
- [User stories](docs/USER_STORIES.md)
- [Screen specification](docs/SCREEN_SPEC.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Data model](docs/DATA_MODEL.md)
- [Testing](docs/TESTING.md)
- [Roadmap](docs/ROADMAP.md)
- [Security](SECURITY.md)
- [Contributing](CONTRIBUTING.md)
- [OSS maintainer notes](docs/OSS_MAINTAINER_NOTES.md)

## Good First Issues

- Add automated tests for trip and spot reducers
- Improve accessibility labels and focus behavior across forms
- Add import examples for common booking text formats
- Improve Firebase sync conflict handling
- Add CI checks for TypeScript and documentation links
- Add screenshots and a web demo workflow

## License

MIT
