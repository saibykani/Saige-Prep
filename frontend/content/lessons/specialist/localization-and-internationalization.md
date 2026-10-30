---
slug: localization-and-internationalization
title: Localization and Internationalization
summary: Learn the difference between internationalization (making software ready for any locale) and localization (adapting it to one), and how to test text expansion, encodings, date and number formats, plurals, right-to-left layouts and translations.
level: beginner
duration: 35
tags: [localization, internationalization, i18n, l10n, unicode]
objectives:
  - Define internationalization, localization and locale
  - Test locale-sensitive formats for dates, numbers, currency, plurals and sorting
  - Use pseudo-localization to find i18n defects before translation
  - Check right-to-left layouts and Unicode handling
prerequisites:
  - Functional versus non-functional testing
  - Test data design
related: [cross-browser-testing, testing-data-validation, test-data-design, functional-vs-non-functional-testing, compatibility-and-installation-testing]
references:
  - title: W3C Internationalization (i18n) Activity
    url: https://www.w3.org/International/
  - title: W3C — Localization vs. Internationalization
    url: https://www.w3.org/International/questions/qa-i18n
  - title: Unicode CLDR — Common Locale Data Repository
    url: https://cldr.unicode.org/
  - title: MDN Web Docs — Intl
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl
  - title: Unicode Consortium
    url: https://home.unicode.org/
interview:
  - q: What is the difference between internationalization and localization?
    a: Internationalization, i18n, is engineering the product so it can support any language and region without code changes, for example storing text in resource files, using Unicode, and formatting dates and numbers through locale-aware libraries. Localization, l10n, is adapting the product for a specific locale, translating text, using local formats, currency, images and legal content. I test i18n once, early, often with pseudo-localization, and test l10n for each locale with native-speaker review.
  - q: What is pseudo-localization and why is it useful?
    a: It replaces UI text with an altered version of the source language, such as accented characters, padding to make strings around 30 to 40 percent longer, and brackets around each string. Testers can still read it, but it immediately shows hard-coded strings that were not externalised, truncated or overflowing text, broken encoding and string concatenation, all before paying for real translations.
  - q: What would you check when a product adds Arabic?
    a: Arabic is written right to left, so I check that the layout mirrors, navigation, icons with direction such as arrows, and progress bars, while things like phone numbers, code and some logos stay left to right. I check mixed-direction text, that the dir attribute is set, Arabic fonts render and join correctly, input and cursor movement work, plurals use all six Arabic plural categories, and dates and numbers follow the chosen locale conventions.
practice:
  - "Use the browser console to format the number 1234567.891 and today's date with Intl for en-US, de-DE, hi-IN and ar-EG. Record the differences."
  - "Write five test cases for a 'You have N messages' label, covering plural rules in English and in a language with more plural forms."
  - "Take a screen from a demo app and estimate where 40% longer text would overflow."
takeaways:
  - Internationalization makes software ready for any locale; localization adapts it to one.
  - Never hard-code formats; dates, numbers, currency and plurals depend on locale.
  - Pseudo-localization finds hard-coded strings and overflow before translation.
  - Right-to-left languages need mirrored layouts and careful mixed-direction text.
  - Use Unicode end to end and test with names and text from many scripts.
quiz:
  - id: i18n-q1
    type: single
    topic: localization-and-internationalization
    difficulty: beginner
    prompt: Which activity is internationalization rather than localization?
    options: ["Translating the help pages into Japanese", "Moving hard-coded UI strings into resource files", "Choosing culturally suitable images for Brazil", "Reviewing German translations for tone"]
    answer: [1]
    explanation: Externalising strings is engineering that makes any translation possible, so it is i18n. The other options adapt content for one specific locale, which is l10n.
  - id: i18n-q2
    type: code-output
    topic: localization-and-internationalization
    difficulty: intermediate
    prompt: What does this JavaScript print?
    code: |
      console.log(new Intl.NumberFormat('de-DE').format(1234.5));
    codeLanguage: javascript
    options: ["1,234.5", "1.234,5", "1 234,5", "1234.5"]
    answer: [1]
    explanation: German uses a full stop to group thousands and a comma as the decimal separator. 1,234.5 is the US English format.
  - id: i18n-q3
    type: truefalse
    topic: localization-and-internationalization
    difficulty: beginner
    prompt: Every language forms plurals the same way as English, with one form for 1 and another for everything else.
    options: ["True", "False"]
    answer: [1]
    explanation: Plural rules differ widely. Japanese has one form, Polish uses different forms depending on the number's ending, and Arabic has six categories. Use CLDR plural rules instead of an if count == 1 check.
  - id: i18n-q4
    type: debugging
    topic: localization-and-internationalization
    difficulty: intermediate
    prompt: A user named "Zoë Çelik" appears as "ZoÃ« Ã‡elik" in an exported file. What is the most likely cause?
    options: ["The font does not support the letters", "UTF-8 bytes were decoded as a single-byte encoding such as Windows-1252", "The name is too long", "The locale is set to right-to-left"]
    answer: [1]
    explanation: This garbled pattern, called mojibake, is the classic sign of UTF-8 data being read as Windows-1252 or Latin-1. A missing font usually shows boxes instead.
---

## Beginner-friendly explanation

Think of building a house where every light socket accepts any country's plug through a simple adapter. Designing the sockets that way is **internationalization**. Fitting the right adapters, signs and furniture when someone from Japan moves in is **localization**.

Software works the same way. Internationalization (often written i18n, because there are 18 letters between the i and the n) prepares the product for any language and region. Localization (l10n) adapts it to one specific place. Testers check both.

## Technical explanation

A **locale** identifies a language and region, such as `en-US`, `en-GB`, `fr-CA` or `ar-EG`. Many formats depend on it.

| Item | en-US | de-DE | hi-IN |
|---|---|---|---|
| Number | 1,234,567.89 | 1.234.567,89 | 12,34,567.89 |
| Date (short) | 3/14/2026 | 14.3.2026 | 14/3/2026 |
| Currency | $1,234.50 | 1.234,50 € | ₹1,234.50 |

Exact output can vary slightly by library and CLDR version, so assert on what the locale data says, not on what you expect from memory.

### What to test for internationalization

- **Externalised strings:** no hard-coded text in code or images.
- **Unicode (UTF-8) end to end:** forms, database, APIs, exports and emails keep characters intact.
- **Text expansion:** translations can be much longer than English, especially for short labels.
- **No string concatenation:** "You have " + n + " items" breaks in languages with different word order.
- **Plurals and gender** handled by rules, not `if (n == 1)`.
- **Sorting and search:** alphabetical order differs between languages; accent-insensitive search may be expected.
- **Time zones:** store times in UTC and display in the user's zone.
- **Right-to-left (RTL):** Arabic and Hebrew need mirrored layouts and `dir="rtl"`.

### What to test for localization

- Translation accuracy, consistency and tone, ideally reviewed by native speakers.
- Local formats, currency, address and phone formats, units and legal text.
- Culturally appropriate images, colours and examples.

### Pseudo-localization

```mermaid
flowchart LR
  A["Add to cart"] --> B["[Àđđ ţö çàŕţ ~~~~]"]
  B --> C{Visible in UI?}
  C -->|plain English shows| D[Hard-coded string defect]
  C -->|text cut off| E[Truncation defect]
  C -->|renders fully| F[Ready for translation]
```

## Code examples

```javascript
const n = 1234567.891;
for (const locale of ['en-US', 'de-DE', 'hi-IN']) {
  console.log(locale, new Intl.NumberFormat(locale).format(n));
}
const plural = new Intl.PluralRules('ar-EG');
console.log([0, 1, 2, 5, 11, 100].map((x) => plural.select(x)));
```

## Expected output

```text
en-US 1,234,567.891
de-DE 1.234.567,891
hi-IN 12,34,567.891
[ 'zero', 'one', 'two', 'few', 'many', 'other' ]
```

Arabic needs six different message variants for those counts, where English needs two.

## Real-world example

A fitness app launched in Germany and France. In English the button "Start" fitted perfectly; the German translation was much longer and the label was cut off on small phones. The app also built sentences like "Workout " + name + " completed", which produced awkward grammar in French. A pseudo-localization run before translation would have shown both problems in an afternoon. The team added pseudo-locale screenshots to their regression checks.

## Common mistakes

- **Testing only in English** and assuming translations will fit.
- **Hard-coding date, number or currency formats.**
- **Using simple test names** like "John Smith" and never names with accents, apostrophes or non-Latin scripts.
- **Mirroring everything in RTL**, including phone numbers and media controls that should stay left to right.
- **Confusing language with country**, for example assuming every Spanish speaker uses euros.

## Troubleshooting

- **Garbled characters.** Find where the encoding changes: form, API, database or export.
- **Translation missing.** Check the fallback chain, for example `fr-CA` falls back to `fr`, then the default.

## Key takeaways summary

Internationalization makes software locale-ready; localization makes it feel native. Test formats, plurals, encodings, text expansion and RTL, and use pseudo-localization early. Related: [cross-browser testing](/learn/specialist/cross-browser-testing).
