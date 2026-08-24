# Tout App Store Connect Preparation

Replace every bracketed placeholder before submission. Do not publish claims that are not supported by the production app and backend.

| App Store Connect field | Value to complete |
|---|---|
| App name | `[Confirm final name: Tout or legal product name]` |
| Subtitle | `[≤30 characters]` |
| Promotional text | `[Optional promotional text]` |
| Description | `[Final passenger booking and trip-management description]` |
| Keywords | `[Comma-separated keywords; do not repeat the app name]` |
| Primary category | `[Choose category]` |
| Secondary category | `[Optional]` |
| Support URL | `[Public HTTPS support URL]` |
| Privacy policy URL | `[Public HTTPS privacy-policy URL]` |
| Marketing URL | `[Optional public HTTPS URL]` |
| Copyright | `[Year and legal entity]` |
| Age rating | `[Complete Apple questionnaire]` |
| Review contact | `[Name, email, phone]` |
| Review notes | `[Explain passenger account, test booking flow, map/location flow, and any payment test steps]` |
| Review login | `[Dedicated non-expiring review username]` |
| Review password | `[Dedicated review password]` |
| Bundle ID | `com.toutroutes.passenger` — confirm availability and ownership before registration |
| Version/build | `1.0` / incrementing build number — confirm in the release archive |
| Export compliance | `[Answer App Store Connect encryption question after production review]` |

## Artwork still required

The included `ios/ToutApp/Images.xcassets/AppIcon.appiconset` contains the catalog structure but no final branded PNG files. Supply the final 1024×1024 icon and the required App Store screenshots for supported iPhone sizes. Screenshots must show the real production UI and must not contain placeholder data or unsupported claims.

## Critical source blocker

The passenger source is incomplete. Before building a release candidate, supply the missing screens and shared modules identified in the handoff report, including navigation types, API service, shared theme/styles, referenced assets, and the `react-native-haptic-feedback` dependency. Do not replace these files with empty stubs for App Store distribution.

## Privacy worksheet

This is an engineering review aid, not a substitute for Apple’s App Store Connect privacy questionnaire. Confirm the actual data flow with the backend owner and Firebase console.

| Data or capability indicated by source | Verify collection | Verify linked to user | Verify purpose | Verify tracking |
|---|---|---|---|---|
| Account/contact/authentication data | `[ ]` | `[ ]` | App functionality | `[ ]` |
| Precise location and live trip location | `[ ]` | `[ ]` | App functionality | `[ ]` |
| Device/user identifiers and push token if enabled | `[ ]` | `[ ]` | App functionality | `[ ]` |
| Trip, booking, route, and destination data | `[ ]` | `[ ]` | App functionality | `[ ]` |
| Payment or transaction data, if enabled | `[ ]` | `[ ]` | App functionality | `[ ]` |
| Biometric processing | `[ ]` | Usually device-only; verify implementation | App functionality | `[ ]` |
| Diagnostics/crash data from SDKs | `[ ]` | `[ ]` | App functionality/analytics | `[ ]` |
| Firebase/Auth/Firestore/Storage/Messaging behavior | `[ ]` | `[ ]` | Based on actual SDK configuration | `[ ]` |

## Build gate

Build on macOS with Xcode 26 or later using the iOS 26 SDK or later. Install pods, add the correct Firebase iOS plist if the completed source uses Firebase, configure the Apple team and App Store signing, archive the `ToutApp` scheme in Release mode, upload to TestFlight, and test on physical iPhones before App Review.
