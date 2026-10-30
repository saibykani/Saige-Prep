---
slug: android-vs-ios-testing
title: Android versus iOS Testing
summary: Android and iOS differ in tooling, distribution, permissions, navigation and device diversity. Learn what changes for a tester on each platform and which native frameworks and commands you will meet.
level: intermediate
duration: 35
tags: [mobile, android, ios, espresso, xcuitest]
objectives:
  - Compare the Android and iOS testing toolchains, including Espresso, UI Automator and XCUITest
  - Use basic adb commands to install apps, read logs and capture evidence on Android
  - Explain iOS simulators, real devices, code signing and TestFlight distribution from a tester's view
  - Identify platform behaviour differences that need separate test cases
prerequisites:
  - Mobile testing fundamentals
  - Basic command-line usage
related: [mobile-testing-fundamentals, device-and-os-coverage-strategy, appium-architecture-and-setup, appium-locators-and-gestures]
references:
  - title: Android Developers — Test apps on Android
    url: https://developer.android.com/training/testing
  - title: Android Developers — Android Debug Bridge (adb)
    url: https://developer.android.com/tools/adb
  - title: Apple Developer Documentation — XCTest
    url: https://developer.apple.com/documentation/xctest
  - title: Appium documentation
    url: https://appium.io/docs/en/latest/
interview:
  - q: Which native UI testing frameworks exist for Android and iOS, and how do they differ from Appium?
    a: On Android, Espresso is the in-app UI testing framework; it runs inside the app's process, synchronises automatically with the UI thread and is very fast, while UI Automator can interact across apps and system UI. On iOS, XCUITest is Apple's UI testing framework built on XCTest; tests run in a separate runner process and drive the app through the accessibility layer. Both are written in the platform language and usually live in the app repository. Appium is a cross-platform, language-agnostic server that drives these same underlying automation engines (UiAutomator2, XCUITest) through the W3C WebDriver protocol, trading some speed for one API across platforms.
  - q: Why can't you just install any iOS build on any iPhone the way you sideload an APK on Android?
    a: iOS requires every app installed on a real device to be code-signed with a certificate and a provisioning profile that permits that device or distribution method. For testing, teams use development builds for registered devices, ad hoc builds, enterprise distribution where licensed, or TestFlight. Simulator builds are compiled for the Mac and do not need device signing, but they cannot be installed on a phone. On Android, a debug-signed APK can be installed on a device with USB debugging enabled through adb.
  - q: Name some behaviours that need platform-specific test cases.
    a: Back navigation (Android has a system back gesture or button, iOS relies on in-app navigation and swipe-back), permission models and their wording, notification permission prompts, background execution limits, deep link handling (App Links versus Universal Links), share sheets, keyboard types, date pickers, and how each platform restores state after the app is killed. The business rules are shared, but these interactions differ and each needs its own expected result.
practice:
  - "Using adb, install a debug APK on an emulator, launch it, reproduce a defect, and capture both a screenshot and the filtered logcat output for your defect report."
  - "Write a comparison table of how your app requests location permission on Android and iOS, including the deny and 'allow once' paths."
  - "List five test cases for back navigation that apply only to Android, and the equivalent iOS swipe-back checks."
takeaways:
  - Android's native UI frameworks are Espresso (in-app) and UI Automator (cross-app); iOS uses XCUITest built on XCTest.
  - adb is the tester's Swiss-army knife on Android for installing, logging, screenshots and shell commands.
  - iOS real devices need signed builds; simulators are Mac-only and do not need device signing.
  - Android has far more device and vendor diversity; iOS has fewer devices but fast OS adoption.
  - Shared business rules still need platform-specific tests for navigation, permissions, notifications and deep links.
quiz:
  - id: mob-avi-q1
    type: single
    topic: android-vs-ios-testing
    difficulty: beginner
    prompt: Which is Apple's native UI testing framework for iOS apps?
    options: ["Espresso", "XCUITest", "UI Automator", "Robolectric"]
    answer: [1]
    explanation: XCUITest is the UI testing part of Apple's XCTest framework. Espresso and UI Automator are Android frameworks, and Robolectric runs Android tests on the JVM without a device.
  - id: mob-avi-q2
    type: code-output
    topic: android-vs-ios-testing
    difficulty: intermediate
    prompt: What does this command do?
    code: |
      adb -s emulator-5554 install -r app-debug.apk
    codeLanguage: bash
    options: ["Installs the APK on every connected device", "Installs or reinstalls the APK on the device with serial emulator-5554, keeping its data", "Uninstalls the app from emulator-5554", "Starts a new emulator named emulator-5554"]
    answer: [1]
    explanation: "-s selects one device by serial, and -r replaces an existing installation while keeping app data. Without -s adb fails when several devices are connected; it never installs to all of them."
  - id: mob-avi-q3
    type: truefalse
    topic: android-vs-ios-testing
    difficulty: beginner
    prompt: An iOS Simulator build can be installed directly on a physical iPhone for testing.
    options: ["True", "False"]
    answer: [1]
    explanation: Simulator builds are compiled for the Mac, not for the device's architecture and signing requirements. Physical devices need a properly signed device build, for example a development build or TestFlight.
  - id: mob-avi-q4
    type: scenario
    topic: android-vs-ios-testing
    difficulty: intermediate
    prompt: A test plan for a shopping app has one set of navigation test cases shared by Android and iOS. Which gap is most likely?
    options: ["Login validation rules are missing", "Android system back behaviour, such as leaving checkout with the back gesture, is not covered", "Price calculation is not tested", "The API status codes are not verified"]
    answer: [1]
    explanation: Login rules, prices and API codes are shared business logic. System back is an Android-specific interaction that can leave a flow in an unexpected state, so it needs its own test cases.
---

## Beginner-friendly explanation

Android and iOS are like two countries that both drive cars but have different road rules. The car (your app) does the same job in both, but the signs, the side of the road and the paperwork differ.

On Android, there are thousands of phone models from many manufacturers, and each may tweak the system a little. On iOS, there are far fewer models, all made by Apple, but Apple has strict rules about how apps are installed and signed.

As a tester, you check the same features on both, but you also learn each country's rules: how the back button works, how permissions are asked, how you install a test build and which tools you use.

## Technical explanation

### Toolchains side by side

| Aspect | Android | iOS |
|---|---|---|
| Native UI test framework | Espresso (in-app), UI Automator (cross-app, system UI) | XCUITest (part of XCTest) |
| Unit testing | JUnit, optionally Robolectric on the JVM | XCTest |
| Virtual device | Emulator (runs Android system images, any OS host) | Simulator (requires macOS and Xcode) |
| Command-line tooling | `adb`, `emulator`, Gradle | `xcodebuild`, `xcrun simctl` |
| Install a test build | Debug APK via `adb install` | Signed build: development, ad hoc or TestFlight |
| Appium driver | UiAutomator2 (or Espresso driver) | XCUITest driver |
| Logs | `adb logcat` | Xcode console, Console app |

**Espresso** runs in the same process as the app and automatically waits until the UI thread is idle, which makes tests fast and stable. **UI Automator** can drive system dialogs and other apps. **XCUITest** runs in a separate runner process and queries the app's accessibility hierarchy, so meaningful accessibility identifiers make iOS tests much easier.

### Signing and distribution on iOS

Every app on a real iOS device must be code-signed. A provisioning profile ties the app, the signing certificate and (for development and ad hoc builds) a list of registered devices together. TestFlight distributes beta builds to internal and external testers. Testers usually do not manage signing themselves, but must understand it: "the app won't install" is often an expired profile or an unregistered device, not a product bug.

### Behaviour differences that need their own tests

- **Navigation:** Android system back (button or gesture) versus iOS in-app back buttons and edge swipe-back.
- **Permissions:** different dialogs, wording and options; both platforms offer approximate versus precise location and one-time grants on recent versions.
- **Notifications:** opt-in prompts and behaviour differ by platform and OS version.
- **Deep links:** Android App Links versus iOS Universal Links.
- **Fragmentation:** Android has wide vendor and OS diversity; iOS has fewer device models and users tend to update quickly, but older devices drop out of support.

## Real-world example

A travel-booking team shipped a seat-selection screen that had passed every shared test case. Android users reported they were charged for seats they thought they had abandoned. On Android, pressing system back from the payment summary returned to seat selection but left the seat hold active, and a later "Continue" reused it. iOS users only had the in-app "Cancel" button, which correctly released the hold.

The fix was simple, but the lesson was about test design: navigation tests were written once for "mobile", so Android's system back path was never exercised.

## Step-by-step walkthrough

Capturing solid Android evidence with adb:

1. **List devices** to find the serial.
2. **Install** the debug build, replacing any existing version.
3. **Clear logs**, then reproduce the defect.
4. **Capture** a screenshot and the log, filtered to errors.

## Code examples

```bash
adb devices                                   # list connected devices and emulators
adb -s emulator-5554 install -r app-debug.apk # install or replace the build
adb -s emulator-5554 logcat -c                # clear the log buffer
# ... reproduce the defect on the device ...
adb -s emulator-5554 exec-out screencap -p > defect.png
adb -s emulator-5554 logcat -d '*:E' > defect-errors.txt
```

On a Mac, the equivalent simulator commands use `xcrun simctl`:

```bash
xcrun simctl list devices booted               # show booted simulators
xcrun simctl install booted MyApp.app          # install a simulator build
xcrun simctl io booted screenshot defect.png   # capture a screenshot
```

## Expected output

```text
List of devices attached
emulator-5554   device

Performing Streamed Install
Success
```

The `defect-errors.txt` file contains only error-level log lines, typically including an exception stack trace with the app's package name, which you attach to the defect report.

## Common mistakes

- **One test suite for "mobile".** Shared business rules are fine, but navigation, permissions and notifications need platform-specific cases.
- **Raising "app won't install on iPhone" as a product bug** before checking signing, profile expiry and device registration.
- **Testing Android only on a stock emulator.** Vendor skins and battery optimisation on real devices change behaviour.
- **Forgetting accessibility identifiers.** Without them, XCUITest and Appium locators become brittle on iOS.
- **Unfiltered logs.** Attaching thousands of logcat lines hides the useful stack trace.

## Troubleshooting

- **`adb devices` shows `unauthorized`.** Accept the USB debugging prompt on the device, or revoke and re-grant authorisations in developer options.
- **More than one device connected and adb errors.** Pass `-s <serial>` on every command.
- **iOS build installs on one phone but not another.** The second device is probably not in the provisioning profile; use TestFlight or ask for it to be registered.

## Key takeaways summary

Test the same product rules on both platforms, but respect their differences: Espresso and UI Automator versus XCUITest, adb versus simctl, open installs versus code signing, system back versus swipe-back. Platform-specific test cases and accurate environment evidence are what make mobile defect reports actionable.
