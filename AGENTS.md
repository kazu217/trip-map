# Agent Guidance

Use these conventions when working in this repository.

## Project Shape

TripMap is an Expo + React Native + TypeScript app. It should work locally with
demo data when Firebase and Google Maps are not configured.

## Development

- Install with `npm install`.
- Run the app with `npm run start`.
- Verify TypeScript with `npm run typecheck`.
- Regenerate native projects with Expo prebuild instead of committing generated
  `ios/` or `android/` directories.

## Code Conventions

- Reusable UI belongs in `src/components`.
- Screen-specific behavior belongs in `src/screens`.
- External-service code belongs in `src/services`.
- Trip and spot mutations should go through `src/store/tripStore.ts`.
- Shared models belong in `src/types/models.ts`.
- Date and display formatting helpers belong in `src/utils`.

## Documentation

- Update `docs/DATA_MODEL.md` when model shapes change.
- Update `docs/SCREEN_SPEC.md` when navigation or screens change.
- Update setup docs when Firebase, Google Maps, or build behavior changes.

## Safety

Do not commit `.env`, generated native projects, app-store artifacts, build
outputs, keystores, provisioning profiles, Firebase credentials, or Google Maps
keys.
