# TripMap App Store Submission Flow

Last updated: 2026-06-30

This document records the iPhone App Store submission flow for TripMap.
Do not store API keys, private keys, issuer IDs, passwords, or one-time codes in this file.

## Current Submission

- App name: TripMap
- Apple App ID: 6784323563
- iOS bundle ID: com.uri.tripmap
- App Store version: 1.2.3
- Build number: 21
- Review submission ID: 7e481a3d-87c3-4723-b0a8-a42cea3efddc
- Submission state: WAITING_FOR_REVIEW
- Release type: Manual release

## Latest Review Feedback

Apple rejected build `1.2.3 (21)` on 2026-06-30 under guideline 2.3.8
because the App Store screenshots included non-iOS status bar imagery.

Fix:

- Removed the Android-style status bar area from the iPhone 6.5-inch and iPad
  13-inch App Store screenshots.
- Uploaded replacement screenshots for:
  - `APP_IPHONE_65`
  - `APP_IPAD_PRO_3GEN_129`
- Confirmed all replacement screenshot assets reached `COMPLETE` processing
  state in App Store Connect.

## Previous Review Feedback

Apple rejected build `1.2.3 (20)` on 2026-06-29 under guideline 2.3.8
because the app icon looked like a placeholder icon instead of final content.

Fix:

- Replaced the Expo-style placeholder app icon with a TripMap-specific folded map, route, and pin icon.
- Regenerated `assets/icon.png` as a 1024x1024 RGB PNG with no alpha channel.
- Regenerated the matching splash, favicon, Android adaptive icon, and Play Console 512px icon assets.
- Bumped the next iOS build number to `21` in `app.config.js`.
- Removed the remote push notification entitlement from iOS prebuild output because TripMap only schedules local notifications.

## 2026-06-29 Resubmission

Uploaded and resubmitted version `1.2.3`, build `21`.

Artifacts:

- Archive: `dist/ios/TripMap-1.2.3-21.xcarchive`
- IPA: `dist/ios/export-21/TripMap.ipa`
- Archive log: `dist/ios/logs/archive-1.2.3-21.log`
- Export log: `dist/ios/logs/export-1.2.3-21.log`
- Validation log: `dist/ios/logs/validate-1.2.3-21.log`
- Upload log: `dist/ios/logs/upload-1.2.3-21.log`

Verification:

- Apple validation finished without errors.
- Uploaded build ID: `bd528be8-a541-42de-8b34-3e5e4a07d70c`
- Build number: `21`
- Processing state: `VALID`
- Selected build for App Store version `1.2.3`: `bd528be8-a541-42de-8b34-3e5e4a07d70c`

Final verified state:

- Review submission state: `WAITING_FOR_REVIEW`
- App Store version state: `WAITING_FOR_REVIEW`
- Submitted date: `2026-06-29T04:06:38.755Z`

## 2026-06-30 Screenshot Resubmission

Uploaded revised screenshots and resubmitted version `1.2.3`, build `21`.

Updated screenshot sets:

- `APP_IPAD_PRO_3GEN_129`
  - `ipadPro129_01.png`
  - `ipadPro129_02.png`
  - `ipadPro129_03.png`
  - `ipadPro129_04.png`
  - `ipadPro129_05.png`
- `APP_IPHONE_65`
  - `iphone_65_01.png`
  - `iphone_65_02.png`
  - `iphone_65_03.png`
  - `iphone_65_04.png`
  - `iphone_65_05.png`

Verification:

- Replacement screenshots uploaded and processed successfully.
- Old screenshots with non-iOS status bar imagery were removed from App Store
  Connect.
- Review submission item state changed from `REJECTED` to
  `READY_FOR_REVIEW`.

Final verified state:

- Review submission state: `WAITING_FOR_REVIEW`
- App Store version state: `WAITING_FOR_REVIEW`
- Submitted date: `2026-06-30T13:39:03.197Z`

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
