---
slug: accessibility-testing-fundamentals
title: Accessibility Testing and WCAG
summary: Learn how WCAG 2.2 organises accessibility into the POUR principles and conformance levels A, AA and AAA, and how to combine automated scanning with manual checks to find barriers for real users.
level: beginner
duration: 40
tags: [accessibility, wcag, a11y, axe, non-functional]
objectives:
  - Explain the four POUR principles and the A, AA and AAA conformance levels of WCAG 2.2
  - Recognise common success criteria such as text alternatives, contrast, keyboard access, focus visibility and labels
  - Combine automated tools like axe with manual and assistive-technology checks
  - Write accessibility defects that cite the success criterion, impact and steps to reproduce
prerequisites:
  - Functional versus non-functional testing
  - Basic HTML awareness (elements, attributes)
related: [screen-reader-and-keyboard-testing, accessibility-automation, cross-browser-testing, functional-vs-non-functional-testing]
references:
  - title: W3C WAI — WCAG 2 Overview
    url: https://www.w3.org/WAI/standards-guidelines/wcag/
  - title: W3C — Web Content Accessibility Guidelines (WCAG) 2.2
    url: https://www.w3.org/TR/WCAG22/
  - title: Deque — axe accessibility testing tools
    url: https://www.deque.com/axe/
  - title: MDN Web Docs — Accessibility
    url: https://developer.mozilla.org/en-US/docs/Web/Accessibility
interview:
  - q: What are the POUR principles?
    a: WCAG groups its guidelines under four principles. Perceivable means information can be perceived by at least one sense, for example text alternatives for images and captions for video. Operable means every function works with different input methods, such as the keyboard, with enough time and no seizure-inducing flashing. Understandable means content and behaviour are predictable and errors are explained. Robust means content works with current and future user agents, including assistive technologies, which mainly means correct names, roles and states.
  - q: Can automated tools like axe make a site WCAG compliant?
    a: No. Automated tools reliably catch issues that can be determined from the code, such as missing form labels, missing alt attributes, insufficient colour contrast in many cases and invalid ARIA. Many criteria need human judgement, for example whether alt text is meaningful, whether focus order is logical, whether error messages are understandable and whether a screen reader user can actually complete the task. I run axe early and in CI, then do manual keyboard, zoom and screen reader testing on key journeys.
  - q: Which conformance level do most organisations target and what does it imply?
    a: Most policies and regulations reference WCAG Level AA. Conforming to AA means meeting every Level A and Level AA success criterion for the full page and complete processes. AAA is not usually required for whole sites because some AAA criteria cannot be met for all content, though individual AAA criteria can be adopted where useful.
practice:
  - "Run axe on three pages of an application you are allowed to test. For each violation, record the WCAG success criterion, impact and affected element, then decide whether it is a true defect."
  - "Check a sign-up form against 1.1.1, 1.3.1, 1.4.3, 2.1.1, 2.4.7, 3.3.1 and 3.3.2 manually and record pass or fail with evidence."
  - "Zoom a page to 200% and then view it at a 320 CSS pixel wide viewport. List content that is lost, overlaps or needs horizontal scrolling."
takeaways:
  - WCAG 2.2 is organised as principles (POUR), guidelines and testable success criteria at levels A, AA and AAA.
  - Level AA is the common target and includes all Level A criteria.
  - Automated tools find a subset of issues; manual and assistive-technology testing is essential.
  - Key manual checks are keyboard access, visible focus, zoom and reflow, contrast, labels, errors and screen reader output.
  - Good accessibility defects cite the success criterion, user impact and exact element.
quiz:
  - id: a11y-fund-q1
    type: single
    topic: accessibility-testing-fundamentals
    difficulty: beginner
    prompt: Under WCAG 2.2 Level AA, what is the minimum contrast ratio for normal-size body text against its background?
    options: ["3:1", "4.5:1", "7:1", "2:1"]
    answer: [1]
    explanation: Success criterion 1.4.3 Contrast (Minimum) requires 4.5:1 for normal text. 3:1 applies to large text, and 7:1 is the AAA enhanced requirement.
  - id: a11y-fund-q2
    type: multiple
    topic: accessibility-testing-fundamentals
    difficulty: intermediate
    prompt: Which issues usually need a human to judge, rather than an automated scanner? Select all that apply.
    options: ["Whether an image's alt text describes its purpose meaningfully", "Whether a form input has any programmatic label", "Whether the focus order follows a logical sequence", "Whether an error message explains how to fix the problem"]
    answer: [0, 2, 3]
    explanation: A scanner can detect a missing label or missing alt attribute, but not whether text is meaningful, order is logical or instructions are helpful. Those require human review.
  - id: a11y-fund-q3
    type: truefalse
    topic: accessibility-testing-fundamentals
    difficulty: beginner
    prompt: To conform to WCAG Level AA, a page must meet all Level A and all Level AA success criteria.
    options: ["True", "False"]
    answer: [0]
    explanation: Conformance levels are cumulative. AA conformance means satisfying every A and every AA criterion, or providing a conforming alternate version.
  - id: a11y-fund-q4
    type: scenario
    topic: accessibility-testing-fundamentals
    difficulty: intermediate
    prompt: A required field shows only a red border when left empty, with no text. Which principle is primarily affected?
    options: ["Robust only", "Perceivable and Understandable, because colour alone carries the error and no text explains it", "Operable only", "None, a red border is sufficient"]
    answer: [1]
    explanation: Colour alone fails 1.4.1 Use of Color for users who cannot distinguish red, and 3.3.1 Error Identification requires the error to be described in text. Keyboard operation (Operable) is not the issue here.
---

## Beginner-friendly explanation

Picture a building with only a staircase at the entrance. People using wheelchairs, parents with prams and delivery workers with trolleys all struggle. Adding a ramp helps them, and it helps many others too.

Digital products have staircases as well: a button that only works with a mouse, grey text too faint to read, a video without captions, a form that a screen reader announces as "edit, edit, edit" with no labels. **Accessibility testing** finds these barriers so people with visual, hearing, motor, cognitive and other disabilities can use the product, and so everyone benefits from clearer, more robust design.

## Technical explanation

The **Web Content Accessibility Guidelines (WCAG)** are published by the W3C's Web Accessibility Initiative. WCAG 2.2 became a W3C Recommendation in October 2023. It is structured as:

- **4 principles (POUR)**
- **Guidelines** under each principle
- **Testable success criteria**, each at **Level A**, **AA** or **AAA**

| Principle | Meaning | Example success criteria |
|---|---|---|
| Perceivable | Users can perceive the information | 1.1.1 Non-text Content (A), 1.4.3 Contrast (Minimum) (AA), 1.4.10 Reflow (AA) |
| Operable | Users can operate the interface | 2.1.1 Keyboard (A), 2.4.7 Focus Visible (AA), 2.5.8 Target Size (Minimum) (AA) |
| Understandable | Content and behaviour are understandable | 3.3.1 Error Identification (A), 3.3.2 Labels or Instructions (A) |
| Robust | Works with assistive technologies | 4.1.2 Name, Role, Value (A) |

Levels are cumulative: AA conformance means meeting all A and AA criteria. Many laws and procurement policies reference Level AA, but which version and level apply depends on jurisdiction and contract.

### New in WCAG 2.2

WCAG 2.2 added criteria including 2.4.11 Focus Not Obscured (Minimum) (AA), 2.5.7 Dragging Movements (AA), 2.5.8 Target Size (Minimum) (AA, at least 24 by 24 CSS pixels with exceptions), 3.2.6 Consistent Help (A), 3.3.7 Redundant Entry (A) and 3.3.8 Accessible Authentication (Minimum) (AA). It also removed 4.1.1 Parsing as obsolete.

### Automated versus manual testing

| Approach | Good at | Misses |
|---|---|---|
| Automated scanners (axe, browser devtools) | Missing labels and alt attributes, many contrast failures, invalid ARIA, duplicate ids | Meaning, logical order, usability with assistive tech |
| Manual checks | Keyboard flow, focus visibility, zoom and reflow, meaningful text | Slower, needs skill and consistency |
| Assistive technology testing | Real screen reader and voice control experience | Needs practice and device coverage |
| Testing with disabled users | Real barriers and priorities | Requires planning and budget |

```mermaid
flowchart LR
  A[Automated scan in CI] --> B[Manual checklist: keyboard, zoom, contrast, forms]
  B --> C[Screen reader pass on key journeys]
  C --> D[Defects with WCAG criterion and impact]
  D --> E[Fix and retest]
```

## Real-world example

A council services portal passed its automated scan with no violations. During manual testing, a tester using only the keyboard could not complete a booking: the date picker opened on focus but could not be closed or navigated with the keyboard, trapping focus. Screen reader testing also showed the time slots announced as "button" with no names because they were icon-only. Neither issue was flagged by the scanner in that configuration. The team added keyboard support and accessible names, and added the booking journey to their manual accessibility regression.

## Step-by-step walkthrough

1. **Agree the target**, usually WCAG 2.2 Level AA, and the scope: pages, journeys, platforms.
2. **Run an automated scan** with axe or a similar tool on each page state, including open dialogs and error states.
3. **Keyboard pass:** complete each journey using Tab, Shift+Tab, Enter, Space, arrow keys and Escape.
4. **Visual checks:** contrast, use of colour, zoom to 200%, reflow at 320 CSS pixels wide, text spacing.
5. **Forms and errors:** labels, instructions, error identification and suggestions.
6. **Media:** captions, transcripts, audio description where needed, no auto-playing audio without control.
7. **Screen reader pass** on critical journeys (see [screen reader and keyboard testing](/learn/specialist/screen-reader-and-keyboard-testing)).
8. **Report** each defect with the success criterion, user impact, element and steps.

### Worked example: defect report fields

| Field | Example |
|---|---|
| Title | Search button has no accessible name |
| WCAG criterion | 4.1.2 Name, Role, Value (A) |
| Impact | Screen reader users hear "button" and cannot know its purpose |
| Steps | Navigate to header search with NVDA in Chrome; Tab to the magnifier icon |
| Expected | Announced as "Search, button" |
| Actual | Announced as "button" |

## Code examples

A labelled input and an icon button with an accessible name, in HTML:

```html
<label for="email">Email address</label>
<input id="email" type="email" autocomplete="email" aria-describedby="email-hint">
<p id="email-hint">We will send your receipt here.</p>

<button type="submit" aria-label="Search">
  <svg aria-hidden="true" focusable="false"><!-- icon --></svg>
</button>
```

## Expected output

An axe scan of a compliant page reports zero violations for the WCAG tags you selected, but it also reports items needing review. Those "incomplete" results are not passes; they are prompts for manual checks.

## Common mistakes

- **Treating a clean automated scan as compliance.**
- **Testing only with a mouse.**
- **Adding ARIA everywhere** instead of using native HTML elements, which already have roles and keyboard support.
- **Relying on colour alone** to show errors, status or required fields.
- **Writing defects without the success criterion**, making priority and fix unclear.
- **Scanning only the initial page state**, missing modals, menus and error states.

## Troubleshooting

- **Contrast result disputed.** Measure the actual foreground and background colours, including text over images or gradients, at the rendered size and weight.
- **Scanner flags something the team believes is fine.** Check the rule documentation and decide with evidence; record accepted exceptions.
- **Unclear which criterion applies.** Use the WCAG Understanding documents linked from each criterion.

## Key takeaways summary

WCAG 2.2 gives testable success criteria grouped by POUR and graded A, AA and AAA. Automated tools such as axe are a fast first filter, but meaningful accessibility testing needs keyboard, visual and screen reader checks on real journeys, and defects that name the criterion and the human impact.
