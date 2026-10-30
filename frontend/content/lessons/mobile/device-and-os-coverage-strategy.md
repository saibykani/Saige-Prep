---
slug: device-and-os-coverage-strategy
title: Device and OS Coverage Strategy
summary: You cannot test every phone. Learn to build a risk-based device matrix from your own usage analytics, combine emulators, real devices and device clouds, and keep the matrix current.
level: intermediate
duration: 30
tags: [mobile, test-strategy, risk-based-testing, compatibility]
objectives:
  - Explain why exhaustive device coverage is impossible and what a coverage strategy replaces it with
  - Build a tiered device matrix from usage data, risk and technical dimensions
  - Decide which tests run on emulators, local real devices and remote device clouds
  - Maintain the matrix as OS versions and devices change
prerequisites:
  - Mobile testing fundamentals
  - Risk-based testing
related: [mobile-testing-fundamentals, android-vs-ios-testing, risk-based-testing, compatibility-and-installation-testing, pairwise-and-combinatorial-testing]
references:
  - title: Android Developers — Test apps on Android
    url: https://developer.android.com/training/testing
  - title: Apple Developer Documentation — XCTest
    url: https://developer.apple.com/documentation/xctest
  - title: Appium documentation
    url: https://appium.io/docs/en/latest/
interview:
  - q: How would you decide which devices to test on for a new release?
    a: I start from our own analytics, not general market data, to see which OS versions, device models, screen sizes and manufacturers our users actually have. I combine that with risk, such as the minimum supported OS version, devices with known issues, small screens and low memory, and anything new like a just-released OS version. Then I group devices into tiers, run the full regression on tier one, smoke and key journeys on tier two, and use emulators or a device cloud for broader sanity checks. The matrix is reviewed every release or quarter.
  - q: What dimensions besides device model matter in a coverage matrix?
    a: OS major version, screen size and density, aspect ratio and cut-outs, RAM and CPU class, manufacturer customisation on Android, form factor such as tablets and foldables, locale and text size, network type, and the app versions users upgrade from. A good matrix picks devices that cover several of these dimensions at once rather than listing popular models.
  - q: What are the trade-offs of using a cloud device farm?
    a: Benefits are access to many real models without buying them, parallel execution and no lab maintenance. Trade-offs are cost, queueing, network latency during interactive testing, less control over device state and settings, possible restrictions on hardware features and data privacy considerations for test data. I typically keep a small local set of tier-one devices for daily work and use the cloud for breadth before release.
practice:
  - "Given usage data showing your Android users across five OS versions and your iOS users across three, design a three-tier device matrix with no more than eight real devices."
  - "Pick four real devices that together cover small and large screens, low and high RAM, the oldest and newest supported OS versions, and at least two Android manufacturers."
  - "Write the review checklist you would follow when a new major iOS or Android version is released."
takeaways:
  - Exhaustive device coverage is impossible; a coverage strategy chooses a small, representative, risk-based set.
  - Use your own product analytics first, then risk factors like minimum OS, low-end hardware and known problem devices.
  - Pick devices that cover several dimensions at once, such as screen size, OS version, RAM and manufacturer.
  - Tier the matrix so the deepest testing goes to the devices that matter most.
  - Review the matrix regularly, especially around new OS releases and minimum-version changes.
quiz:
  - id: mob-cov-q1
    type: single
    topic: device-and-os-coverage-strategy
    difficulty: beginner
    prompt: What should be the primary input for choosing devices for a consumer app's test matrix?
    options: ["The newest flagship phones only", "The app's own usage analytics combined with risk", "Whatever devices the team already owns", "A random selection from a device cloud"]
    answer: [1]
    explanation: Your real users' devices and OS versions, weighted by risk, tell you where failures would matter. Flagships alone ignore low-end hardware, and convenience or randomness ignores both usage and risk.
  - id: mob-cov-q2
    type: multiple
    topic: device-and-os-coverage-strategy
    difficulty: intermediate
    prompt: Which are good reasons to include a device in tier one even if it is not among the most used? Select all that apply.
    options: ["It runs the minimum supported OS version", "It has the smallest supported screen", "It has low RAM and a slow CPU", "It is the most expensive model available", "It has a manufacturer customisation known to break background work"]
    answer: [0, 1, 2, 4]
    explanation: Minimum OS, smallest screen, low-end hardware and known vendor behaviour are risk factors that expose defects. Price on its own says nothing about risk.
  - id: mob-cov-q3
    type: truefalse
    topic: device-and-os-coverage-strategy
    difficulty: beginner
    prompt: Once a device matrix is agreed it should stay unchanged for the lifetime of the product.
    options: ["True", "False"]
    answer: [1]
    explanation: Users' devices change, new OS versions ship and the minimum supported version moves. The matrix needs a regular review, so a fixed matrix gradually stops reflecting real risk.
  - id: mob-cov-q4
    type: scenario
    topic: device-and-os-coverage-strategy
    difficulty: advanced
    prompt: Budget allows four real Android devices. Which selection gives the broadest risk coverage?
    options: ["Four flagship models from the same manufacturer on the latest OS", "One low-RAM phone on the minimum OS, one mid-range phone from a second manufacturer, one current flagship on the latest OS, one tablet or foldable", "Four identical phones for parallel runs", "Four phones on the latest OS with different colours"]
    answer: [1]
    explanation: The mixed selection spans OS versions, hardware class, manufacturers and form factors. The other choices duplicate the same dimensions and leave the riskiest configurations untested.
---

## Beginner-friendly explanation

Imagine you are a chef asked to make sure a new recipe tastes good to "everyone in the city". You cannot cook for millions of people. Instead you invite a small panel chosen carefully: someone who likes spicy food, someone who does not, a child, an older person, a vegetarian. If they are all happy, you are fairly confident.

A device coverage strategy does the same for phones. There are thousands of device models and many OS versions. You cannot test them all, so you choose a small panel that represents your real users and the riskiest combinations, and you test deeply on those.

## Technical explanation

A **device and OS coverage strategy** defines which device, OS and configuration combinations will be tested, at what depth, and on which kind of environment. It is a form of [risk-based testing](/learn/manual-testing/risk-based-testing) applied to the environment.

### Inputs

1. **Product analytics.** The distribution of your own users across OS versions, models, manufacturers and screen sizes. Public market data is a fallback for brand-new products only.
2. **Support policy.** The minimum supported OS version on each platform and any officially supported tablets or foldables.
3. **Risk factors.** Low memory, small screens, older GPUs, vendor customisations, new OS releases, devices that appear often in crash reports.
4. **Feature needs.** Camera, NFC, biometrics, Bluetooth or other hardware your app depends on.

### Dimensions to cover

| Dimension | Example values |
|---|---|
| OS major version | Minimum supported, most used, latest, beta |
| Screen | Smallest supported, typical, large, tablet, foldable |
| Hardware class | Low RAM and slow CPU, mid-range, high-end |
| Manufacturer (Android) | At least two vendors plus a near-stock build |
| Accessibility settings | Large text, dark mode, reduced motion |
| Locale | Default plus a right-to-left or long-text locale |

Choose devices that combine several dimensions. One low-end phone on the minimum OS with the smallest screen covers three risk dimensions in a single device.

### Tiers and environments

| Tier | Purpose | Environment | Tests run |
|---|---|---|---|
| Tier 1 | Highest-usage and highest-risk configurations | Local real devices | Full regression and exploratory testing |
| Tier 2 | Next band of usage and remaining risk dimensions | Real devices or device cloud | Smoke and critical journeys |
| Tier 3 | Long tail | Emulators, simulators or device cloud | Automated sanity checks |

```mermaid
flowchart LR
  A[Product analytics] --> D[Candidate devices]
  B[Support policy] --> D
  C[Risk factors] --> D
  D --> E{Covers new dimensions?}
  E -- yes --> F[Add to tier 1 or 2]
  E -- no --> G[Tier 3 or drop]
  F --> H[Review every release]
  G --> H
```

Emulators and simulators are ideal for automated runs in CI on every commit. Real devices, whether local or in a cloud device farm, provide hardware truth and are used before release.

## Real-world example

A retail app team tested on the four phones in their office: three recent flagships and one tablet. Their analytics, which nobody had checked, showed a large share of users on older mid-range Android phones with little RAM. After a release that added a high-resolution product carousel, those users saw the app killed when returning from the camera to scan a barcode, and lost their basket.

The team rebuilt the matrix from analytics, added two low-memory devices on the minimum OS version to tier one, and added a "return from camera" lifecycle test. The defect class never recurred in their release testing.

## Step-by-step walkthrough

1. **Export usage data** for the last few months: OS versions, models, screen sizes, manufacturers.
2. **Mark mandatory configurations**: minimum OS, latest OS, smallest screen, supported tablets.
3. **Add risk configurations**: low-end hardware, vendor customisations, devices frequent in crash reports.
4. **Collapse the list** by choosing devices that cover several dimensions each.
5. **Assign tiers** and the depth of testing per tier.
6. **Map environments**: local devices, device cloud or emulators.
7. **Schedule reviews**, at least each release and whenever a major OS version ships.

### Worked example: a compact Android tier-one set

| Device profile | OS | Dimensions covered |
|---|---|---|
| Low-end, 3 GB RAM, small screen, vendor A | Minimum supported | Old OS, low memory, small screen |
| Mid-range, vendor B | Most used | Typical user, second manufacturer |
| Current flagship, near-stock | Latest | New OS behaviour, high density |
| Foldable or tablet | Recent | Large and changing screen size |

## Common mistakes

- **Testing on the devices in the office** instead of the devices users own.
- **Covering only the latest OS.** The minimum supported version is often where defects hide.
- **Listing popular models that all share the same dimensions**, which adds cost without adding coverage.
- **Never revisiting the matrix**, so it drifts away from reality.
- **Ignoring settings as a dimension.** Large text, dark mode and battery saver change behaviour without changing the device.

## Troubleshooting

- **No analytics yet (new app).** Use the support policy and public platform data as a starting point, then replace it with your own data after launch.
- **Budget too small for real devices.** Keep one or two local tier-one devices and rent breadth from a device cloud before release.
- **A defect appears only on one vendor's phones.** Add a device from that vendor to tier two and note the customisation in the matrix.

## Key takeaways summary

You cannot test every phone, so test the right ones. Build the matrix from your users' data and from risk, pick devices that cover many dimensions each, tier the depth of testing, mix emulators with real devices, and review the matrix whenever the platform landscape moves.
