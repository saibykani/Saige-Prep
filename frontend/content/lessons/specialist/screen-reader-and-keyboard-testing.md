---
slug: screen-reader-and-keyboard-testing
title: Screen Reader and Keyboard Testing
summary: Test like a keyboard-only or screen reader user. Learn focus order, visible focus, keyboard traps and skip links, then use NVDA, JAWS, VoiceOver and TalkBack to verify names, roles, states and announcements.
level: intermediate
duration: 40
tags: [accessibility, wcag, screen-reader, keyboard, a11y]
objectives:
  - Run a structured keyboard-only test covering focus order, visibility, traps and operability
  - Use core commands in NVDA, VoiceOver and JAWS to navigate by headings, landmarks, links and form fields
  - Verify accessible names, roles, states and live announcements against expected output
  - Choose sensible screen reader and browser pairings for test coverage
prerequisites:
  - Accessibility testing and WCAG
related: [accessibility-testing-fundamentals, accessibility-automation, cross-browser-testing, mobile-testing-fundamentals]
references:
  - title: W3C WAI — WCAG 2 Overview
    url: https://www.w3.org/WAI/standards-guidelines/wcag/
  - title: W3C — WAI-ARIA Authoring Practices Guide
    url: https://www.w3.org/WAI/ARIA/apg/
  - title: NV Access — NVDA screen reader
    url: https://www.nvaccess.org/
  - title: MDN Web Docs — Accessibility
    url: https://developer.mozilla.org/en-US/docs/Web/Accessibility
  - title: Deque — axe accessibility testing tools
    url: https://www.deque.com/axe/
interview:
  - q: How do you test a page for keyboard accessibility?
    a: I put the mouse away and complete every task with Tab, Shift+Tab, Enter, Space, arrow keys and Escape. I check that every interactive element is reachable and operable, that focus order follows the visual and logical order, that focus is always clearly visible and not hidden behind sticky headers, that there are no keyboard traps, that dialogs move focus in, keep it inside while open and return it on close, and that a skip link or landmarks let users bypass repeated navigation. These map to WCAG criteria such as 2.1.1, 2.1.2, 2.4.1, 2.4.3, 2.4.7 and 2.4.11.
  - q: Which screen readers would you test with and why?
    a: It depends on the audience and platforms, but a common set is NVDA with Chrome or Firefox and JAWS with Chrome or Edge on Windows, VoiceOver with Safari on macOS and iOS, and TalkBack with Chrome on Android. NVDA is free, which makes it practical for every tester. Each screen reader and browser pairing interprets markup a little differently, so critical journeys should be checked on the pairings the users actually use.
  - q: What is the difference between NVDA's browse mode and focus mode?
    a: In browse mode, NVDA intercepts keystrokes so single letters act as quick navigation, for example H for next heading and K for next link, and the arrow keys read content. In focus mode, keystrokes pass to the page so users can type in fields or operate custom widgets. NVDA usually switches automatically when entering form fields, and NVDA+Space toggles it manually. Testers need to know this, otherwise they misreport behaviour, for example thinking a text field is broken when NVDA is still in browse mode.
practice:
  - "Complete a full checkout on an application you are allowed to test using only the keyboard. Record every point where focus is lost, invisible, trapped or out of order."
  - "With NVDA and a browser, list all headings and landmarks on a page using the elements list. Compare the outline with what a sighted user would consider the page structure."
  - "Open a modal dialog with VoiceOver running and write the expected announcement, focus position on open, Tab behaviour while open, and focus position after close."
takeaways:
  - Keyboard testing checks reachability, operability, logical order, visible focus and absence of traps.
  - Screen readers expose each element's name, role, state and value; test that each is correct.
  - Learn quick navigation by headings, landmarks, links and form fields; real users rely on it.
  - Test the screen reader and browser pairings your users actually use.
  - Dynamic changes such as errors and toasts need to be announced, typically via live regions or focus management.
quiz:
  - id: a11y-sr-q1
    type: single
    topic: screen-reader-and-keyboard-testing
    difficulty: beginner
    prompt: While tabbing through a page, focus enters an embedded widget and neither Tab, Shift+Tab nor Escape can move it out. Which WCAG success criterion is failed?
    options: ["1.4.3 Contrast (Minimum)", "2.1.2 No Keyboard Trap", "1.1.1 Non-text Content", "3.1.1 Language of Page"]
    answer: [1]
    explanation: Focus that cannot be moved away using the keyboard is a keyboard trap, covered by 2.1.2. The other criteria concern contrast, text alternatives and page language.
  - id: a11y-sr-q2
    type: scenario
    topic: screen-reader-and-keyboard-testing
    difficulty: intermediate
    prompt: An icon-only "delete" button is announced by NVDA as just "button". What is the best fix to suggest?
    options: ["Make the icon larger", "Give the button an accessible name such as an aria-label of Delete item, or visually hidden text", "Add a tooltip that appears on mouse hover only", "Change the icon colour to red"]
    answer: [1]
    explanation: The button lacks an accessible name (4.1.2 Name, Role, Value). A text label or aria-label gives screen readers a name. Hover tooltips do not reach keyboard or screen reader users, and size or colour do not create a name.
  - id: a11y-sr-q3
    type: truefalse
    topic: screen-reader-and-keyboard-testing
    difficulty: beginner
    prompt: When a modal dialog closes, keyboard focus should normally return to the control that opened it.
    options: ["True", "False"]
    answer: [0]
    explanation: Returning focus to the triggering control keeps keyboard and screen reader users oriented. Leaving focus at the top of the page or on the removed dialog forces them to find their place again.
  - id: a11y-sr-q4
    type: multiple
    topic: screen-reader-and-keyboard-testing
    difficulty: intermediate
    prompt: In NVDA browse mode, which keys move to the next element of a type? Select all that apply.
    options: ["H for the next heading", "K for the next link", "F for the next form field", "Q for the next button"]
    answer: [0, 1, 2]
    explanation: H, K and F are standard NVDA quick navigation keys for headings, links and form fields. Buttons use B; Q moves to the next block quote.
---

## Beginner-friendly explanation

Try using a website with your mouse unplugged. You press Tab to jump from link to link, Enter to press a button. Now imagine also closing your eyes and having the computer read out each thing you land on: "Search, edit text", "Main navigation, landmark", "Add to basket, button".

That is how many people use the web every day: some because they cannot use a mouse, others because they are blind or have low vision and use a **screen reader**. Keyboard and screen reader testing means walking in their shoes to confirm everything can be reached, understood and used.

## Technical explanation

### Keyboard testing

| Check | What good looks like | WCAG |
|---|---|---|
| Reachable | Every interactive element can be focused with Tab | 2.1.1 Keyboard (A) |
| No trap | Focus can always move away | 2.1.2 No Keyboard Trap (A) |
| Bypass blocks | Skip link or landmarks to jump past repeated menus | 2.4.1 Bypass Blocks (A) |
| Logical order | Focus follows a meaningful sequence | 2.4.3 Focus Order (A) |
| Visible focus | A clear focus indicator is always visible | 2.4.7 Focus Visible (AA) |
| Not obscured | Focused item is not hidden by sticky headers or banners | 2.4.11 Focus Not Obscured (Minimum) (AA) |

Expected keys: **Tab** and **Shift+Tab** move between controls; **Enter** activates links and buttons; **Space** activates buttons and toggles checkboxes; **arrow keys** move within radio groups, menus, tabs and sliders; **Escape** closes dialogs and menus.

### How screen readers work

Browsers build an **accessibility tree** from the HTML and ARIA. Screen readers read that tree and announce each element's **name** ("Add to basket"), **role** ("button"), **state** ("expanded", "checked", "required") and **value**. Native elements such as `button`, `a` with `href`, `input` with a `label` provide these automatically; custom widgets must add them with ARIA and keyboard handling. The first rule of ARIA is to prefer native HTML when it does the job.

### Common screen readers

| Screen reader | Platform | Typical browser pairing |
|---|---|---|
| NVDA (free, open source) | Windows | Chrome, Firefox |
| JAWS (commercial) | Windows | Chrome, Edge |
| Narrator (built in) | Windows | Edge |
| VoiceOver (built in) | macOS, iOS, iPadOS | Safari |
| TalkBack (built in) | Android | Chrome |

### Core commands

| Task | NVDA | JAWS | VoiceOver (macOS) |
|---|---|---|---|
| Start or stop | Ctrl+Alt+N to start | Desktop shortcut | Cmd+F5 |
| Next heading | H | H | VO+Cmd+H |
| Next link | K | Tab or U for unvisited | VO+Cmd+L |
| Next form field | F | F | VO+Cmd+J |
| List elements | NVDA+F7 | Insert+F6 headings list | VO+U (rotor) |
| Stop speech | Ctrl | Ctrl | Ctrl |

NVDA's modifier key is Insert by default; VoiceOver's VO key is Control+Option. On iOS VoiceOver, swipe right or left to move, double-tap to activate and rotate two fingers to use the rotor. Commands can vary by version and settings, so confirm with each product's documentation.

### Dynamic content

When content changes without a page load, such as a validation error, a toast or updated search results, users must be told. Common approaches are moving focus to the new content (for example to an error summary) or using an ARIA **live region** (`aria-live="polite"` or `role="status"`) so the screen reader announces it.

## Real-world example

An online grocery site added a "quantity stepper" built from styled divs with click handlers. Mouse users loved it. Keyboard testing showed the plus and minus controls could not be focused at all. With NVDA, the quantity was read as plain text with no indication it could be changed, and adding an item produced no announcement. The fix replaced the controls with native buttons that had accessible names ("Increase quantity of Apples"), and added a polite live region announcing "Apples, quantity 3". A follow-up test confirmed the full shopping journey worked with keyboard and NVDA.

## Step-by-step walkthrough

1. **Keyboard first.** Complete the journey without a mouse; note order, focus visibility, traps and unreachable controls.
2. **Pick pairings**, for example NVDA with Chrome and VoiceOver with Safari on iOS.
3. **Survey the structure.** Use the elements list or rotor to review headings, landmarks and links. Is the outline sensible? Are link texts meaningful out of context?
4. **Navigate the journey** with quick keys and Tab. For every control, write what is announced: name, role, state.
5. **Trigger dynamic changes**: errors, loading states, toasts, dialogs. Is each announced or focused?
6. **Compare with expected output** and log differences as defects with the pairing and versions.

## Expected output

For a well-built sign-in form, an NVDA user tabbing through might hear something like:

```text
Sign in, heading level 1
Email address, edit, required, blank
Password, edit, protected, required, blank
Show password, toggle button, not pressed
Sign in, button
```

After submitting with an empty email, focus moves to an error summary and NVDA announces something like "There is a problem. Enter your email address, link". Exact wording differs between screen readers, versions and browsers; what matters is that the name, role, state and message are all present.

## Common mistakes

- **Using only Tab with a screen reader**, while real users navigate mostly by headings, landmarks and quick keys.
- **Reporting behaviour without the screen reader, browser and versions.**
- **Confusing NVDA browse mode and focus mode** when testing forms and widgets.
- **Ignoring focus after actions**: after closing a dialog or deleting an item, where does focus go?
- **Accepting placeholder text as a label**; it disappears on typing and is not reliably announced.
- **Removing focus outlines** for visual design without a visible replacement.

## Troubleshooting

- **NVDA reads nothing when typing letters.** You are in browse mode where letters are navigation keys; press NVDA+Space to switch to focus mode.
- **Announcements differ between browsers.** Check the accessibility tree in browser devtools to see the computed name and role, then decide whether it is a markup or an assistive technology issue.
- **VoiceOver on iOS skips an element.** It may be hidden from accessibility or grouped with its parent; inspect with the accessibility inspector in Xcode.

## Key takeaways summary

Keyboard and screen reader testing proves a product is usable without a mouse or without sight. Check reachability, order, focus visibility and traps; then verify that every control announces the right name, role and state, and that dynamic changes are announced, on the pairings your users rely on.
