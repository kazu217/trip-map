# TripMap App Store Submission Flow

Last updated: 2026-06-26

This document records the iPhone App Store submission flow for TripMap.
Do not store API keys, private keys, issuer IDs, passwords, or one-time codes in this file.

## Current Submission

- App name: TripMap
- Apple App ID: 6784323563
- iOS bundle ID: com.uri.tripmap
- App Store version: 1.2.3
- Build number: 19
- Review submission ID: 2610f80a-b2e3-4cb0-bcae-f661463a7261
- Submission state: WAITING_FOR_REVIEW
- Release type: Manual release

## Public URLs

- Privacy Policy: https://gist.githubusercontent.com/kazu217/8621926ec815866b513ffe5e9552889d/raw/PRIVACY_POLICY.md
- Support: https://gist.githubusercontent.com/kazu217/9dc59a7d2143e2a26c63bccbf19b4c58/raw/SUPPORT.md

Source files:

- docs/PRIVACY_POLICY.md
- docs/SUPPORT.md

## Files Changed For iOS

- app.config.js
  - iOS bundle identifier was set to `com.uri.tripmap`.
  - Android package remains `com.tripmap.app`.
- ios/TripMap.xcodeproj/project.pbxproj
  - `PRODUCT_BUNDLE_IDENTIFIER` was set to `com.uri.tripmap`.
- ios/TripMap/Info.plist
  - URL scheme was set to `com.uri.tripmap`.
  - Version fields use Xcode build settings.
- fastlane/Deliverfile
  - Metadata path, screenshots path, app ID, bundle ID, version, manual release, and skip binary upload settings were recorded.
- dist/app-store/fastlane/metadata/ja/
  - Japanese App Store metadata.
- dist/app-store/fastlane/screenshots/ja/
  - Uploaded App Store screenshots.

## Build And Upload Summary

1. Created or confirmed Apple bundle ID for `com.uri.tripmap`.
2. Created and installed an App Store provisioning profile.
3. Built the archive:
   - `dist/ios/TripMap.xcarchive`
4. Exported the IPA:
   - `dist/ios/export/TripMap.ipa`
5. Uploaded the IPA to App Store Connect.
6. Confirmed uploaded build:
   - Build ID: `833eb92e-9b67-4dbd-af8e-220fafc5ec18`
   - Build number: `19`
   - Processing state: `VALID`

## App Store Connect Setup

1. Created the App Store Connect app record:
   - App name: TripMap
   - Apple App ID: 6784323563
   - Bundle ID: `com.uri.tripmap`
2. Selected build `19` for version `1.2.3`.
3. Uploaded screenshots for:
   - iPhone 6.5-inch
   - iPad 13-inch
4. Filled Japanese metadata:
   - App name
   - Subtitle
   - Description
   - Keywords
   - Promotional text
   - Copyright
5. Set category:
   - Travel
6. Set content rights:
   - No third-party content.
7. Set age rating:
   - 4+
8. Set price:
   - Free
9. Set review contact:
   - No sign-in required
   - Contact email: kazu20040127@gmail.com
10. Set release option:
   - Manual release

## Privacy Setup

Published App Privacy answers in App Store Connect.

Selected collected data types:

- Photos or Videos
- Other User Content
- User ID

For each selected type:

- Purpose: App Functionality
- Linked to user: Yes
- Used for tracking: No

Not selected:

- Location
- Ads data
- Analytics data
- Device ID
- Purchases

Reasoning:

- TripMap stores user-entered travel data, notes, files, images, and optional cloud sync data.
- The app does not use advertising tracking.
- The app does not request current device location for App Store privacy purposes.

## Precheck

Ran App Store metadata precheck with fastlane.

Initial warning:

- Description mentioned `Google`, which fastlane flags as a competitor reference.

Fix:

- Changed `Googleマップ` to `外部マップアプリ`.
- Changed `Firebase設定時` wording to generic cloud sync wording.

Final result:

- No negative Apple sentiment
- No placeholder text
- No Apple competitor references
- No future functionality promises
- No test content wording
- No broken URLs
- Precheck finished without detecting potential problems

## Final Submission

The old `appStoreVersionSubmissions` create endpoint returned 403, so the new review submission flow was used:

1. Create or reuse a `reviewSubmissions` record for iOS.
2. Add the App Store version as a `reviewSubmissionItems` item.
3. Submit the review submission by setting `submitted: true`.
4. Verify the state.

Final verified state:

- Review submission state: `WAITING_FOR_REVIEW`
- App Store version state: `WAITING_FOR_REVIEW`
- Submitted date: `2026-06-26T03:16:49.703Z`

## After Review

Because release type is manual, approval does not automatically publish the app.

After Apple approves the version:

1. Open App Store Connect.
2. Go to TripMap app version `1.2.3`.
3. Confirm the approved build.
4. Click manual release when ready.

## Useful Local Verification Commands

These commands intentionally do not include secrets.

```sh
fastlane precheck \
  -a com.uri.tripmap \
  --platform ios \
  --default_rule_level warn \
  --include_in_app_purchases false \
  --api_key_path /tmp/tripmap_asc_api_key.json
```

```sh
ASC_ISSUER_ID="$(awk -F'Issuer ID: ' '/Issuer ID:/ {print $2}' "$HOME/claude/translate/.env" | tr -d '[:space:]')" \
python3 /tmp/tripmap_verify_submission_state.py
```

## Notes

- The App Store Connect browser session may expire and return to the login page.
- Most metadata and submission checks can be done through the App Store Connect API if the local API key is available.
- Keep API keys and private key files outside the repository and out of Markdown files.
