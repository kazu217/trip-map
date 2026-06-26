# Contributing

Thanks for helping improve TripMap.

## Development

```bash
npm install
cp .env.example .env
npm run start
```

Firebase and Google Maps are optional for local development. The app should keep
working with local demo data when those services are not configured.

## Project Conventions

- Keep TypeScript strictness intact.
- Put reusable UI in `src/components`.
- Keep screen-specific behavior in `src/screens`.
- Keep Firebase and external-service calls inside `src/services`.
- Route trip and spot mutations through `src/store/tripStore.ts`.
- Update `docs/DATA_MODEL.md` when data shapes change.
- Update `docs/SCREEN_SPEC.md` when screens or navigation change.

## Before Opening a Pull Request

```bash
npm run typecheck
```

Also run the main trip, spot, itinerary, map, and settings flows in Expo Go,
the iOS simulator, Android emulator, or the web target when your change touches
those surfaces.

Good pull requests are focused and include a short note about the user workflow
or maintainer workflow being improved.
