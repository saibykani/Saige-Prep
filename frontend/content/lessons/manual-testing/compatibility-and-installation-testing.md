---
slug: compatibility-and-installation-testing
title: Compatibility and Installation Testing
summary: Compatibility testing checks that software co-exists and interoperates with other products and environments; installation testing checks it can be installed, upgraded, configured and removed correctly. Learn how to plan both with a risk-based coverage matrix.
level: intermediate
duration: 35
tags: [non-functional, compatibility-testing, installation-testing, portability, istqb]
objectives:
  - Define compatibility in terms of co-existence and interoperability
  - Explain installability as part of portability and what installation testing covers
  - Build a risk-based environment coverage matrix instead of testing every combination
  - Design installation, upgrade, rollback and uninstall tests
prerequisites:
  - Functional versus non-functional testing
  - System and end-to-end testing
related: [functional-vs-non-functional-testing, cross-browser-testing, device-and-os-coverage-strategy, pairwise-and-combinatorial-testing, docker-for-testers, recovery-reliability-availability-testing]
references:
  - title: ISTQB Certified Tester Foundation Level Syllabus v4.0 (section 2.2.2, Test types)
    url: https://www.istqb.org/certifications/certified-tester-foundation-level-ctfl-v4-0/
  - title: ISO/IEC 25010 Systems and software quality models
    url: https://www.iso.org/standard/35733.html
  - title: Docker documentation
    url: https://docs.docker.com/
  - title: Android Developers, testing guide
    url: https://developer.android.com/training/testing
interview:
  - q: What is compatibility testing?
    a: Compatibility testing checks the degree to which a product can exchange information with other products or systems and perform its required functions while sharing the same environment and resources. ISO/IEC 25010 splits it into co-existence, working alongside other software without harmful interference, and interoperability, exchanging and using information with other systems. In practice teams also use the term for checking behaviour across browsers, operating systems, devices and versions, which strictly relates more to portability and adaptability.
  - q: How do you choose which browser, OS and device combinations to test?
    a: I start from data and risk, using analytics on what our users actually use, contractual or regulatory commitments, and known problem platforms. I define tiers, full testing on the top combinations and smoke testing on the long tail, and use pairwise techniques when several dimensions multiply. I write the supported-platforms list down so everyone agrees what is in scope, and I revisit it as usage changes.
  - q: What would you include in installation testing?
    a: Fresh installation on each supported platform, including with minimum prerequisites; installation with different options and paths; upgrade from each supported previous version with real data preserved; rollback or downgrade if supported; repair; uninstallation, checking that files, services and registry or configuration entries are removed and user data is handled as documented; and failure cases such as insufficient disk space, missing permissions or an interrupted install. I also check the installation documentation matches what actually happens.
practice:
  - "Your analytics show seven browser and OS combinations with meaningful usage. Build a tiered coverage matrix and justify which tier each goes in."
  - "Write ten installation test cases for a desktop application, covering fresh install, upgrade from two versions back, uninstall and two failure conditions."
  - "List three co-existence risks and three interoperability risks for a new browser extension used by a finance team."
takeaways:
  - Compatibility covers co-existence and interoperability with other products in a shared environment.
  - Testing across browsers, OS and devices is commonly called compatibility testing and relates to portability.
  - Installation testing covers install, upgrade, rollback, repair and uninstall, including failure cases.
  - Use data and risk to choose environments; test the top tier fully and the long tail lightly.
  - Upgrades with real existing data are where installation defects most often hide.
quiz:
  - id: compinst-q1
    type: single
    topic: compatibility-and-installation-testing
    difficulty: intermediate
    prompt: Your accounting app must keep running correctly while the company's antivirus and backup agents run on the same machine. Which compatibility sub-characteristic does this test?
    options: ["Interoperability", "Co-existence", "Installability", "Recoverability"]
    answer: [1]
    explanation: Co-existence is about functioning efficiently while sharing an environment and resources with other products without harmful impact. Interoperability is about exchanging and using information with other systems.
  - id: compinst-q2
    type: multiple
    topic: compatibility-and-installation-testing
    difficulty: intermediate
    prompt: Which belong in installation testing? Select all that apply.
    options: ["Upgrading from the previous supported version with existing user data", "Uninstalling and checking leftover services and files", "Installing with insufficient disk space", "Measuring checkout response time under 1,000 users", "Installing with a non-administrator account"]
    answer: [0, 1, 2, 4]
    explanation: Upgrade, uninstall, low-resource and permission scenarios are classic installation tests. Response time under load is performance efficiency testing.
  - id: compinst-q3
    type: scenario
    topic: compatibility-and-installation-testing
    difficulty: intermediate
    prompt: There are 4 browsers, 3 operating systems and 3 screen sizes, which gives 36 combinations, and time for about 12. What is the best approach?
    options: ["Test only the developer's own setup", "Choose combinations using usage data and risk, and apply pairwise selection to cover every pair of values", "Randomly pick 12 combinations", "Test all 36 by working overtime"]
    answer: [1]
    explanation: Usage data and risk focus effort where users are, and pairwise selection covers every pair of values in far fewer combinations. Random picks can miss important pairs, and testing only one setup ignores most users.
  - id: compinst-q4
    type: truefalse
    topic: compatibility-and-installation-testing
    difficulty: beginner
    prompt: A successful fresh installation proves that upgrades from older versions will also work.
    options: ["True", "False"]
    answer: [1]
    explanation: Upgrades run different code paths, such as data migrations, configuration merges and removal of old components, against existing data. They must be tested separately from each supported starting version.
---

## Beginner-friendly explanation

Think of buying a new appliance for your kitchen. First, can you **install** it: does it fit the space, connect to your plug and water supply, and can you remove it later without damaging the wall? Then, does it **get along** with what is already there: does the dishwasher trip the fuse when the kettle is on, and can it talk to the smart-home app you already use?

**Installation testing** checks the first set of questions for software: can it be installed, upgraded and removed cleanly? **Compatibility testing** checks the second: does it work alongside other software and exchange information with other systems, on the platforms your users really have?

## Technical explanation

### Compatibility

ISTQB CTFL v4.0 lists compatibility as one of the quality characteristics for non-functional testing, following ISO/IEC 25010. It has two sub-characteristics:

| Sub-characteristic | Meaning | Example |
|---|---|---|
| Co-existence | Functions efficiently while sharing a common environment and resources with other products, without harmful impact on them | A desktop client still works when a VPN client and antivirus are running |
| Interoperability | Two or more systems exchange information and use the information exchanged | Exported invoices import correctly into the customer's accounting system |

In everyday practice, "compatibility testing" also means checking behaviour across **browsers, operating systems, devices, screen sizes and versions**. In ISO/IEC 25010 terms that variety is closer to **portability** (adaptability), but the industry label is so common that you should recognise both meanings. Detailed browser practice is covered in [cross-browser testing](/learn/specialist/cross-browser-testing).

### Installation

**Installability** is a sub-characteristic of portability: how effectively and efficiently a product can be installed or uninstalled in a specified environment. Installation testing typically covers:

- fresh install on each supported platform, with default and custom options
- prerequisites present, missing and at minimum versions
- upgrade from each supported previous version, with existing data and configuration
- rollback or downgrade, where supported
- repair and reinstall
- uninstall: files, services, scheduled tasks, registry or configuration entries removed; user data handled as documented
- failure cases: insufficient disk space, no admin rights, interrupted install, network loss during download
- accuracy of the installation guide and release notes

```mermaid
stateDiagram-v2
  [*] --> NotInstalled
  NotInstalled --> Installed: fresh install
  Installed --> Upgraded: upgrade with existing data
  Upgraded --> Installed: rollback
  Installed --> NotInstalled: uninstall
  Upgraded --> NotInstalled: uninstall
  NotInstalled --> Failed: install interrupted
  Failed --> NotInstalled: clean-up verified
```

### Choosing environments

Testing every combination is rarely possible. A practical approach:

1. Use usage analytics and contracts to list real target environments.
2. Group them into **tiers**: Tier 1 gets full functional testing; Tier 2 gets smoke and critical paths; Tier 3 is best effort.
3. When several dimensions multiply, use [pairwise testing](/learn/manual-testing/pairwise-and-combinatorial-testing) to cover every pair of values with fewer runs.
4. Use containers, virtual machines and device clouds to make environments reproducible.

## Real-world example

A team shipped a new version of a desktop reporting tool. Fresh installs passed on every supported Windows version. After release, customers who upgraded from the version two releases back found their saved report templates missing.

The upgrade had been tested only from the immediately previous version. The older version stored templates in a different folder, and the migration step did not look there. The team added an **upgrade matrix** to its installation tests, covering every supported starting version with a realistic profile of existing user data, and kept anonymised sample profiles from each version for that purpose.

## Step-by-step walkthrough

1. **Write down the supported platforms list** with stakeholders: browsers, OS versions, devices, runtimes, databases and partner systems.
2. **Identify co-existence risks**: other software commonly running alongside, such as security agents, office suites and other plug-ins.
3. **Identify interoperability points**: files, APIs and messages exchanged with other systems.
4. **Tier the environments** using usage data and risk.
5. **Design installation scenarios**: fresh, upgrade per starting version, rollback, uninstall and failure cases.
6. **Prepare reproducible environments**, for example clean VM snapshots or containers, so every run starts from a known state.
7. **Execute and record the exact environment** (versions and configuration) with every result.

### Worked example: tiered coverage matrix

| Environment | Tier | What is tested |
|---|---|---|
| Chrome latest on Windows 11 | 1 | Full functional and regression |
| Safari latest on macOS | 1 | Full functional and regression |
| Safari on iOS latest | 1 | Full functional and regression |
| Firefox latest on Windows 11 | 2 | Smoke plus critical journeys |
| Chrome on Android latest | 2 | Smoke plus critical journeys |
| Edge latest on Windows 10 | 3 | Smoke only |

The tiers here are illustrative; base yours on your own users' data.

## Code examples

Containers make "same environment every time" practical. This runs a test suite against two database versions to check the application's compatibility with both:

```bash
for v in 15 16; do
  docker run -d --name db-$v -e POSTGRES_PASSWORD=test -p 54$v:5432 postgres:$v
  DB_URL="postgresql://postgres:test@localhost:54$v/postgres" npm test
  docker rm -f db-$v
done
```

## Expected output

The suite runs twice, once per database version. A test that passes against one version and fails against the other points to a compatibility defect, such as reliance on a feature or default that changed between versions.

## Common mistakes

- **Testing only on the team's own machines**, which rarely match users' environments.
- **Testing upgrades from only the latest previous version.**
- **Uninstall not checked**: leftover services, scheduled tasks or files cause problems on reinstall.
- **No written supported-platforms list**, so nobody knows what "compatible" promises.
- **Ignoring co-existence**, such as other plug-ins, security software or browser extensions that change pages.
- **Not recording environment versions**, making failures impossible to reproduce.

## Troubleshooting

- **A failure occurs only on one user's machine.** Collect exact versions, installed software and configuration, then reproduce in a clean environment and add one difference at a time.
- **Too many combinations.** Tier by usage and risk, then apply pairwise selection within tiers.
- **Install tests leave machines dirty.** Use VM snapshots or disposable containers and reset before every run.

## Key takeaways summary

Compatibility testing checks that your product co-exists and interoperates with the rest of the user's world; installation testing checks it can be put in, upgraded and taken out cleanly. Agree the supported platforms, tier them by risk, test upgrades from every supported version with real data, and record the exact environment for every result.
