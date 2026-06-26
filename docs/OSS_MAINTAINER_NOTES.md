# OSS Maintainer Notes

TripMap is maintained as an offline-first React Native travel planning app and
as a practical reference for small app maintainers who need to balance local
data, optional cloud sync, maps, attachments, and mobile release workflows.

## Maintenance Workflows

- Review pull requests that touch trip data models and persistence.
- Keep Expo, React Native, Firebase, and navigation dependencies current.
- Maintain iOS, Android, and web behavior without relying on one platform only.
- Improve accessibility and form ergonomics for travel-day use.
- Keep setup documentation accurate for optional Firebase and Google Maps use.
- Harden local-data and cloud-sync boundaries before adding sharing features.

## Where Codex Helps

- PR review for TypeScript, navigation, and state-management changes
- Test generation for reducers, import parsing, and sync conflict handling
- Documentation updates when setup or data models change
- Release checklist automation for iOS, Android, and web targets
- Security review for Firebase rules, attachment handling, and secret hygiene

## Application Positioning

TripMap does not currently claim broad package adoption. Its public value is as
an actively maintained, end-to-end mobile app template for a common travel
workflow: keeping trip plans useful offline while allowing optional cloud backup.
