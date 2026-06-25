# ChronoLog — Episodic Performance Dashboard

A high-performance React Native dashboard for streaming episodic medical telemetry. Built for sustained 60/120 FPS scrolling across **2,200+** dynamic-height episode cards, fluid shared-element transitions, gesture-driven diagnostics, and custom native device-integrity checks on iOS (Swift) and Android (Kotlin).

![Platform](https://img.shields.io/badge/platform-iOS%20%7C%20Android-blue)
![React Native](https://img.shields.io/badge/React%20Native-0.76-61DAFB)

## Features

- **Virtualized telemetry feed** — `@shopify/flash-list` with precomputed `overrideItemLayout` heights, `getItemType` recycling pools, and `drawDistance` tuning for flick-scroll without blank flashes.
- **Independent card updates** — `React.memo` with custom equality on every card sub-component; stable `useCallback` handlers prevent list-wide re-renders.
- **Dynamic layouts** — CRITICAL cards render SVG sparklines + pulsing indicator; ROUTINE cards use a compact metrics row; CLINICAL_NOTE and SYSTEM_ALERT have distinct footprints.
- **Expand transition** — Card `measureInWindow` bounds morph into full-screen detail via Reanimated shared values (UI thread).
- **Diagnostics sheet** — Pan gesture with velocity-based snap, rubber-band overscroll, flick-to-dismiss — all on the native UI thread via Reanimated 3 + Gesture Handler 2.
- **Device integrity gateway** — Custom native module (no third-party wrappers) detects jailbreak (iOS), root/emulator (Android), and blocks interaction behind a polished warning modal until acknowledged.

## Architecture — Performance

| Concern | Approach |
|--------|----------|
| List virtualization | FlashList with `estimatedItemSize`, per-type height map via `estimateEpisodeHeight()`, `getItemType` for view recycling |
| Re-render isolation | `EpisodeCard`, `Sparkline`, `PulsingIndicator` memoized; episode objects are stable references from bundled JSON |
| Animations | Reanimated 3 worklets — morph overlay, diagnostics sheet, pulse indicator run off JS thread |
| Data | 2,202 episodes bundled as `src/data/episodes.json` (regenerate via `npm run generate-data`) |
| Sparklines | Lightweight `react-native-svg` paths with dashed gap markers for null vitals |

## Native Bridge — Device Integrity

### iOS (`DeviceIntegrityModule.swift`)
- Scans known jailbreak filesystem paths (`/Applications/Cydia.app`, MobileSubstrate, etc.)
- Sandbox write test to `/private/`
- `cydia://` URL scheme probe
- dyld injected-library scan (Substrate, SSLKillSwitch, etc.)
- Simulator excluded from jailbreak positives in `#if targetEnvironment(simulator)`

### Android (`DeviceIntegrityModule.kt`)
- Emulator fingerprint/model/hardware heuristics
- `su` binary path checks + `which su` execution
- `test-keys` build tag detection
- Magisk / SuperSU data directory probes

Exposed to JS as `NativeModules.DeviceIntegrityModule.checkDeviceIntegrity()` → `{ isSecure, platform, reasons[] }`.

## Prerequisites

- Node.js ≥ 18
- Xcode 15+ (iOS)
- Android Studio / SDK 34+ (Android)
- CocoaPods (`gem install cocoapods`)
- JDK 17

## Setup & Run

```bash
git clone <your-repo-url>
cd ChronoLog
npm install

# Regenerate mock telemetry (optional)
npm run generate-data

# iOS
cd ios && bundle exec pod install && cd ..
npm run ios

# Android
npm run android
```

### Release APK

```bash
cd android
./gradlew assembleRelease
# Output: android/app/build/outputs/apk/release/app-release.apk
```

Or from project root: `npm run build:apk`

### Performance Monitor

Shake device → **Show Perf Monitor** (or `Cmd+D` / `Cmd+M` in simulator). Rapid-scroll the feed to verify sustained frame rates.

## Project Structure

```
src/
  components/     EpisodeCard, Sparkline, DiagnosticsSheet, EpisodeDetailOverlay, …
  data/           episodes.json (2200+ records)
  native/         JS bridge wrapper for DeviceIntegrityModule
  screens/        TelemetryFeed (FlashList host)
  theme/          Dark clinical palette
  types/          Episode schema
  utils/          Height estimation helpers
ios/ChronoLog/    DeviceIntegrityModule.swift + .m bridge
android/.../      DeviceIntegrityModule.kt + Package
scripts/          generateMockData.js
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Metro bundler |
| `npm run ios` | Run on iOS simulator/device |
| `npm run android` | Run on Android emulator/device |
| `npm run generate-data` | Regenerate 2200+ mock episodes |
| `npm run build:apk` | Assemble release APK |

## License

MIT — built as a technical assessment submission.
