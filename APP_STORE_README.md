# Tout App Store build notes

This directory contains the Tout passenger source supplied in the archive and a generated React Native 0.74.3 iOS project.

The source archive is incomplete. `App.tsx` references fifteen screen files that were not included, and the supplied screens also reference missing shared navigation types, API helpers, styles, and at least one native dependency. These files must be supplied or implemented and then tested before this project can be considered release-ready.

After the source is complete, replace the example bundle identifier if needed, add the real Firebase iOS configuration for that identifier, configure APNs, select the Apple Developer team, install CocoaPods on macOS, and test the Release scheme on a physical iPhone. The included `codemagic.yaml` is configured to build `ios/ToutApp.xcodeproj` with the `ToutApp` scheme and to submit to TestFlight but not directly to the App Store.

A signed IPA was not produced because Linux cannot run Xcode or Apple signing tools.
