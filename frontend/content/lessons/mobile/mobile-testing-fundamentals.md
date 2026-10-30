---
slug: mobile-testing-fundamentals
title: Mobile Testing Fundamentals
summary: Mobile apps live on small screens, flaky networks, limited batteries and interrupt-heavy operating systems. Learn the risks that make mobile testing different and how to cover them.
level: beginner
duration: 30
tags: [mobile, android, ios, test-design]
objectives:
  - Distinguish native, hybrid and mobile web apps and explain how each affects testing
  - List the mobile-specific risk areas such as interruptions, lifecycle, network, permissions and battery
  - Design test cases for app lifecycle events like backgrounding, rotation and process death
  - Choose sensibly between emulators, simulators and real devices for a given test
prerequisites:
  - Test scenarios and test cases
  - Basic familiarity with using a smartphone app store
related: [android-vs-ios-testing, device-and-os-coverage-strategy, appium-architecture-and-setup, compatibility-and-installation-testing, testing-multi-browser-and-network-issues]
references:
  - title: Android Developers — Test apps on Android
    url: https://developer.android.com/training/testing
  - title: Apple Developer Documentation — XCTest
    url: https://developer.apple.com/documentation/xctest
  - title: Appium documentation
    url: https://appium.io/docs/en/latest/
interview:
  - q: What makes mobile testing different from web testing?
    a: The environment is far less controlled. Apps run on many device models, screen sizes and OS versions, on networks that change from Wi-Fi to cellular to nothing, with limited battery and memory. The operating system can pause or kill the app at any time, and users are interrupted by calls, notifications and permission prompts. There are also store distribution, install and upgrade paths that web apps do not have. So beyond functional checks I test lifecycle, interruptions, connectivity, permissions, performance on low-end hardware and upgrade paths.
  - q: What is the difference between a native, hybrid and mobile web app from a tester's point of view?
    a: A native app is built with the platform SDK (Kotlin or Java on Android, Swift or Objective-C on iOS) and uses native UI controls, so it is tested with native tools such as Espresso, XCUITest or Appium native drivers. A hybrid app wraps web content in a native shell using a WebView, so tests may need to switch between the native context and the web context. A mobile web app runs in the device browser and is tested like a responsive website, though touch, viewport and browser differences still matter.
  - q: When would you insist on a real device rather than an emulator?
    a: For anything that depends on real hardware or real conditions. Examples are camera and biometrics, Bluetooth and NFC, true performance and battery drain, thermal throttling, push notifications on iOS, real cellular networks, and vendor-specific OS customisations. Emulators and simulators are excellent for fast functional feedback and CI, but release confidence needs some real-device coverage.
practice:
  - "Write six lifecycle test cases for a video-calling app covering incoming phone calls, backgrounding, screen lock, rotation and the OS killing the app."
  - "A banking app must work offline for viewing the last statement. Design tests for going offline mid-request, airplane mode on launch and recovery when connectivity returns."
  - "List which of your test cases for a fitness app could run on an emulator and which need a real device, with a one-line reason for each."
takeaways:
  - Mobile testing adds environment risk on top of functional risk; devices, OS versions, networks and interruptions all vary.
  - Test the app lifecycle deliberately, including backgrounding, rotation, low memory and process death with state restoration.
  - Network conditions are a test input; include slow, lossy, switching and absent connectivity.
  - Permissions can be denied, granted once or revoked later; each path needs a test.
  - Use emulators and simulators for speed and real devices for hardware, performance and release confidence.
quiz:
  - id: mob-fund-q1
    type: single
    topic: mobile-testing-fundamentals
    difficulty: beginner
    prompt: A product wraps an existing responsive website inside a native shell so it can be published in the app stores. What kind of app is this?
    options: ["Native app", "Hybrid app", "Mobile web app", "Progressive desktop app"]
    answer: [1]
    explanation: Web content running inside a native container (a WebView) is a hybrid app. It is not native because the UI is web-based, and it is not a pure mobile web app because it is installed from a store and has a native shell.
  - id: mob-fund-q2
    type: multiple
    topic: mobile-testing-fundamentals
    difficulty: intermediate
    prompt: Which of these are mobile-specific interruption or lifecycle scenarios worth testing? Select all that apply.
    options: ["An incoming phone call during checkout", "Rotating the device while a form is half filled", "The OS killing the app while it is in the background", "Submitting a form with a required field empty", "Switching from Wi-Fi to cellular during an upload"]
    answer: [0, 1, 2, 4]
    explanation: Calls, rotation, process death and network switching are driven by the mobile environment rather than the business rules. An empty required field is ordinary input validation that applies equally to a web form, so it is not a mobile-specific scenario.
  - id: mob-fund-q3
    type: truefalse
    topic: mobile-testing-fundamentals
    difficulty: beginner
    prompt: If all tests pass on an emulator, you can be confident about battery drain and camera behaviour on real phones.
    options: ["True", "False"]
    answer: [1]
    explanation: Emulators and simulators approximate hardware. Battery, thermal behaviour, camera quality and sensors differ on real devices, so those risks need real-device testing.
  - id: mob-fund-q4
    type: scenario
    topic: mobile-testing-fundamentals
    difficulty: intermediate
    prompt: Users report that a long registration form loses everything they typed after they switch to their email app to copy a verification code. What is the most likely class of defect?
    options: ["A server-side validation bug", "State is not saved and restored across backgrounding or process death", "A font rendering issue", "An incorrect HTTP status code"]
    answer: [1]
    explanation: Switching apps backgrounds the form; under memory pressure the OS may kill the process. If the app does not save and restore UI state, input is lost. Server validation or status codes would not explain data vanishing on return.
---

## Beginner-friendly explanation

Testing a website is a bit like inspecting a car in a quiet garage. Testing a mobile app is like inspecting the same car while someone drives it through rain, tunnels and traffic, with the phone ringing and the fuel light on.

A mobile app runs in the user's pocket, not on a stable desktop. The screen is small and can rotate. The network drops in a lift. The battery saver kicks in. A phone call arrives right in the middle of a payment. The operating system decides, without asking, to close the app to free memory.

Mobile testing means checking that the app still does the right thing under all of those everyday disruptions, not only on a perfect afternoon on office Wi-Fi.

## Technical explanation

### Types of mobile application

| Type | Built with | Testing implication |
|---|---|---|
| Native | Platform SDKs (Kotlin/Java for Android, Swift/Objective-C for iOS) | Native UI tools: Espresso, XCUITest, or Appium with a native driver |
| Hybrid | Web content inside a native WebView container | Tests may switch between native and web contexts |
| Mobile web | Runs in the device browser | Responsive web testing plus touch and mobile browser quirks |

Cross-platform frameworks render either native controls or their own drawn UI; check which before choosing locators and tools.

### Mobile-specific risk areas

- **Lifecycle.** Apps move between foreground, background and stopped states. Android can destroy and recreate an activity on rotation, and either OS may kill a background process. State must survive.
- **Interruptions.** Calls, alarms, notifications, permission dialogs, low-battery warnings and switching apps.
- **Connectivity.** Offline, slow, high-latency, lossy and switching networks. Requests may be cut off half-way.
- **Permissions.** Location, camera, notifications and contacts can be granted, denied, granted only once or revoked later in settings.
- **Device fragmentation.** Screen sizes, densities, notches, OS versions and manufacturer customisations.
- **Resources.** Limited memory, storage and battery; background work restrictions.
- **Distribution.** Fresh install, upgrade from an older version with existing data, and uninstall.
- **Input.** Touch gestures, on-screen keyboards that cover fields, and accessibility settings like large text.

### Lifecycle at a glance

```mermaid
stateDiagram-v2
  [*] --> Foreground: launch
  Foreground --> Background: home button, call, app switch
  Background --> Foreground: user returns
  Background --> Killed: OS reclaims memory
  Killed --> Foreground: user relaunches, state should be restored
  Foreground --> [*]: user closes app
```

### Emulators, simulators and real devices

An Android **emulator** emulates device hardware and runs a real Android system image. The iOS **Simulator** runs an iOS environment built for the Mac; it simulates the device rather than emulating its hardware. Both are fast, free and scriptable, which suits CI. Neither reproduces real battery, thermal, camera, radio or vendor-specific behaviour, so a sensible strategy mixes them with real devices.

## Real-world example

A food-delivery team tested ordering thoroughly on office Wi-Fi with flagship phones. After release, support tickets reported duplicate orders. The pattern: users on trains tapped **Place order**, the request reached the server, the connection dropped before the response arrived, the app showed a generic error, and the user tapped again.

The team added connectivity tests that cut the network after the request was sent, and found the client retried without an idempotency key. The fix combined a server-side idempotency key with a client screen that checked order status after reconnecting.

## Step-by-step walkthrough

1. **Identify the app type** (native, hybrid, mobile web). It decides your tools and locator strategy.
2. **List core user journeys** such as sign-in, browse, purchase and settings.
3. **Overlay mobile conditions** on each journey: interruptions, rotation, backgrounding, network changes, permission states.
4. **Add install and upgrade paths**: fresh install, upgrade with existing data, reinstall.
5. **Pick the environment per test**: emulator or simulator for fast functional checks, real devices for hardware and performance.
6. **Record device, OS version, build and network condition** in every result and defect report.

### Worked example: interruption matrix for checkout

| Step in checkout | Interruption | Expected result |
|---|---|---|
| Card details half entered | Incoming call, then return | Entered fields still present; card number masked |
| Payment submitted | Network lost before response | App checks order status on reconnect; no duplicate charge |
| 3-D Secure page open | App backgrounded for 5 minutes | Session either resumes or shows a clear retry message |
| Order confirmation | Device rotated | Confirmation stays visible; no re-submission |

## Common mistakes

- **Testing only on Wi-Fi with a flagship phone.** Many users have older, slower devices and weaker networks.
- **Ignoring process death.** Backgrounding briefly is not the same as the OS killing the app; test both.
- **Assuming permissions are always granted.** Test deny, deny permanently, and revoke from settings.
- **Skipping upgrade testing.** A fresh install hides migration bugs in local databases and cached data.
- **Treating the emulator as the final word.** It is a fast feedback tool, not a substitute for real hardware.
- **Defect reports without environment details.** A bug without device model, OS version and build number is hard to reproduce.

## Troubleshooting

- **Cannot reproduce a crash reported by users.** Check the device model and OS version in the crash report, then try low memory, background restoration and the exact network condition.
- **Behaviour differs between two phones on the same OS version.** Manufacturer customisations, screen density and battery-optimisation settings are common causes.
- **Hard to simulate a bad network.** Use the emulator's network settings, developer options on devices, or a network-conditioning proxy in your test lab.

## Key takeaways summary

Mobile testing is functional testing plus the environment: lifecycle, interruptions, connectivity, permissions, fragmentation and upgrades. Build those conditions into your scenarios on purpose, use emulators for speed and real devices for truth, and always record the environment with your results.
