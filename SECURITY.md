# Security Policy

TripMap can store sensitive travel information such as reservation numbers,
hotel addresses, ticket images, private notes, and trip dates.

## Supported Scope

This repository is an open-source app and reference implementation. Report
security issues that affect local data handling, Firebase sync, attachment
handling, authentication assumptions, or unsafe defaults.

## Responsible Disclosure

Please do not open public issues for vulnerabilities that expose private travel
data or credentials. Use GitHub private vulnerability reporting if available, or
contact the maintainer through the GitHub profile associated with this
repository.

Include:

- affected component
- reproduction steps
- expected impact
- suggested fix, if known

## Secrets And Local Data

Never commit `.env`, Firebase credentials, Google Maps keys, keystores,
provisioning profiles, generated native projects, or build artifacts. The
public repository is configured to exclude those files.

Firebase API keys for client apps are not treated as server secrets, but each
deployment must still use Firebase Authentication, Firestore rules, Storage
rules, and service-specific restrictions to protect user data.
