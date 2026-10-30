---
slug: appium-locators-and-gestures
title: Appium Locators and Gestures
summary: Choose stable mobile locators such as accessibility id and resource-id over brittle XPath, inspect element trees with Appium Inspector, and perform swipes, scrolls and long presses with W3C Actions and driver mobile commands.
level: intermediate
duration: 40
tags: [mobile, appium, locators, gestures, automation]
objectives:
  - Rank Appium locator strategies by stability and speed for Android and iOS
  - Use Appium Inspector to read the element hierarchy and pick a locator
  - Perform taps, swipes and long presses with W3C Actions in Java
  - Use driver-specific mobile commands for scrolling and gestures and know when to prefer them
prerequisites:
  - Appium architecture and setup
  - Locator strategies
related: [appium-architecture-and-setup, locator-strategies, waits-and-synchronization, flaky-test-reduction, android-vs-ios-testing]
references:
  - title: Appium documentation
    url: https://appium.io/docs/en/latest/
  - title: W3C WebDriver specification (Actions)
    url: https://www.w3.org/TR/webdriver/
  - title: Android Developers — Test apps on Android
    url: https://developer.android.com/training/testing
  - title: Apple Developer Documentation — XCTest
    url: https://developer.apple.com/documentation/xctest
interview:
  - q: Which locator strategy do you prefer in Appium and why?
    a: Accessibility id first. On Android it maps to the content description and on iOS to the accessibility identifier, so one locator can often work on both platforms, it is fast and it is independent of layout. Next I use resource-id on Android or a predicate or class chain query on iOS. XPath is a last resort because it is evaluated against the whole page source, which is slow on large screens, and it breaks when layout changes. If an element has no good identifier, I ask developers to add one, which also helps accessibility.
  - q: TouchAction no longer works in your old tests. How do you perform a swipe now?
    a: TouchAction and MultiAction relied on legacy protocol endpoints that were removed. The replacement is W3C Actions, where I build a pointer input of type touch, then a sequence of pointer move, pointer down, a timed pointer move and pointer up, and call perform. For common gestures I often prefer the driver's mobile commands, such as mobile swipeGesture or scrollGesture on UiAutomator2 and mobile swipe or scroll on XCUITest, because they use native gesture APIs and are simpler to read.
  - q: How do you scroll to an element that is not yet on screen?
    a: On Android I can use the UiAutomator2 locator with UiScrollable and scrollIntoView, which scrolls natively until the element appears, or call mobile scrollGesture in a loop until the element is found. On iOS I can use mobile scroll with a direction or a predicate. I avoid fixed-coordinate swipes repeated a fixed number of times, because they depend on screen size, and I always end with an explicit wait for the element to be visible.
practice:
  - "Open your app in Appium Inspector, pick five elements and write the best locator for each on Android and on iOS, explaining your choice."
  - "Write a reusable Java helper that swipes up by a percentage of the screen using W3C Actions, calculated from the window size rather than fixed coordinates."
  - "Replace three XPath locators in an existing suite with accessibility ids or resource-ids and compare execution time before and after."
takeaways:
  - Prefer accessibility id, then resource-id or native iOS queries, and use XPath only as a last resort.
  - Ask developers for stable identifiers; they help both automation and accessibility.
  - TouchAction is gone; gestures use W3C Actions or driver mobile commands.
  - Compute gesture coordinates from screen or element size, never hard-coded pixels.
  - Pair every gesture with an explicit wait for the resulting state.
quiz:
  - id: mob-loc-q1
    type: single
    topic: appium-locators-and-gestures
    difficulty: beginner
    prompt: On Android, which element attribute does Appium's accessibility id strategy match?
    options: ["resource-id", "content-desc (content description)", "text", "class"]
    answer: [1]
    explanation: Accessibility id maps to the content description on Android and the accessibility identifier on iOS. resource-id is matched by the id strategy, and text or class need other strategies.
  - id: mob-loc-q2
    type: multiple
    topic: appium-locators-and-gestures
    difficulty: intermediate
    prompt: Why is XPath usually a poor first choice for mobile locators? Select all that apply.
    options: ["It is evaluated against the full page source, which is slow on large screens", "It often encodes layout position and breaks when the layout changes", "It is not supported by Appium", "Absolute paths depend on the exact element hierarchy"]
    answer: [0, 1, 3]
    explanation: Appium does support XPath, so that option is false. Its real problems are speed, because the whole hierarchy must be serialised and searched, and brittleness, because paths encode structure that changes.
  - id: mob-loc-q3
    type: code-output
    topic: appium-locators-and-gestures
    difficulty: intermediate
    prompt: What does this W3C Actions sequence do on a 1080 x 2400 screen?
    code: |
      PointerInput finger = new PointerInput(PointerInput.Kind.TOUCH, "finger");
      Sequence s = new Sequence(finger, 1);
      s.addAction(finger.createPointerMove(Duration.ZERO, PointerInput.Origin.viewport(), 540, 1800));
      s.addAction(finger.createPointerDown(PointerInput.MouseButton.LEFT.asArg()));
      s.addAction(finger.createPointerMove(Duration.ofMillis(600), PointerInput.Origin.viewport(), 540, 600));
      s.addAction(finger.createPointerUp(PointerInput.MouseButton.LEFT.asArg()));
      driver.perform(List.of(s));
    codeLanguage: java
    options: ["A long press in the centre", "A swipe from bottom to top that scrolls content down the list", "A swipe from top to bottom", "A double tap"]
    answer: [1]
    explanation: The finger goes down at y=1800 and moves to y=600 over 600 ms, an upward swipe that reveals content further down. A long press would hold without moving, and a top-to-bottom swipe would start at the smaller y value.
  - id: mob-loc-q4
    type: truefalse
    topic: appium-locators-and-gestures
    difficulty: beginner
    prompt: In Appium 2, TouchAction is the recommended way to perform gestures.
    options: ["True", "False"]
    answer: [1]
    explanation: TouchAction and MultiAction depended on legacy endpoints that were removed. Use W3C Actions or the driver's mobile gesture commands instead.
---

## Beginner-friendly explanation

Imagine directing a friend to a book in a library. "The third book on the second shelf of the fourth bookcase" works until someone rearranges the shelves. "The book titled *Testing Basics*" keeps working wherever it moves. Good locators are like titles, not shelf positions.

Gestures are the second half of mobile automation. Phones are used with fingers: tapping, swiping, holding and scrolling. Automation has to imitate those finger movements, and do it in a way that works on small and large screens alike.

## Technical explanation

### Locator strategies

| Strategy (Java `AppiumBy`) | Android matches | iOS matches | Stability and speed |
|---|---|---|---|
| `accessibilityId` | content-desc | accessibility identifier | Best; often cross-platform |
| `id` | resource-id | name or identifier | Very good |
| `androidUIAutomator` | UiSelector expression | not available | Good; native and fast |
| `iOSNsPredicateString` | not available | NSPredicate query | Good; native and fast |
| `iOSClassChain` | not available | Class chain query | Good; faster than XPath |
| `className` | widget class | element type | Weak; usually matches many |
| `xpath` | page source XML | page source XML | Slowest and most brittle |

**Appium Inspector** is a separate desktop or web application that connects to an Appium server, shows a screenshot alongside the element tree and suggests locators. Use it to discover attributes, then choose the most stable option, not just the first suggestion.

### Gestures

Gestures are expressed in two ways.

1. **W3C Actions.** The standard WebDriver Actions API describes input sources (pointer, key) and timed sequences of actions. A touch pointer performs `pointerMove`, `pointerDown`, `pause`, `pointerMove` and `pointerUp`. Combining two pointer sequences gives multi-touch gestures such as pinch.
2. **Driver mobile commands**, called through `executeScript`. UiAutomator2 offers commands such as `mobile: clickGesture`, `mobile: longClickGesture`, `mobile: swipeGesture` and `mobile: scrollGesture`; XCUITest offers commands such as `mobile: swipe`, `mobile: scroll` and `mobile: touchAndHold`. Arguments differ by driver, so check the driver documentation.

The legacy `TouchAction` and `MultiAction` classes were removed along with the JSON Wire Protocol; do not copy them from old tutorials.

```mermaid
flowchart TD
  A[Need to locate an element] --> B{Has accessibility id?}
  B -- yes --> C[Use accessibilityId]
  B -- no --> D{Has resource-id or iOS identifier?}
  D -- yes --> E[Use id]
  D -- no --> F{Native query possible?}
  F -- yes --> G[UiSelector, predicate or class chain]
  F -- no --> H[XPath as last resort and ask devs for an id]
```

## Real-world example

A news app's Android suite took a long time per run and failed often after UI updates. Almost every locator was an absolute XPath generated by a recording tool. The team agreed with developers to add accessibility identifiers to interactive elements, which also improved screen reader labels. The rewritten locators used accessibility id, and the swipe-based carousel tests switched from fixed pixel coordinates to `mobile: swipeGesture` on the carousel element. Runs became noticeably faster and layout changes stopped breaking tests that had nothing to do with them.

## Step-by-step walkthrough

1. **Start a session** in Appium Inspector with the same capabilities your tests use.
2. **Select the element** and read its attributes: content-desc, resource-id, name, label, text.
3. **Pick the most stable strategy** using the table above. Test it in Inspector's search.
4. **Wrap the locator** in a page object method, not inline in tests.
5. **For gestures**, decide between a driver command (simpler) and W3C Actions (portable, precise control).
6. **Compute coordinates** from the element rectangle or window size.
7. **Wait explicitly** for the expected result after each gesture.

## Code examples

```java
// Locators
driver.findElement(AppiumBy.accessibilityId("Login")).click();
driver.findElement(AppiumBy.id("com.example.shop:id/search_box")).sendKeys("shoes");
driver.findElement(AppiumBy.androidUIAutomator(
    "new UiScrollable(new UiSelector().scrollable(true))"
    + ".scrollIntoView(new UiSelector().text(\"Privacy policy\"))"));
// iOS equivalent query
// driver.findElement(AppiumBy.iOSNsPredicateString("label == 'Privacy policy'"));

// Swipe up by 60% of the screen height using W3C Actions
Dimension size = driver.manage().window().getSize();
int x = size.width / 2;
int startY = (int) (size.height * 0.8);
int endY = (int) (size.height * 0.2);

PointerInput finger = new PointerInput(PointerInput.Kind.TOUCH, "finger");
Sequence swipe = new Sequence(finger, 1)
    .addAction(finger.createPointerMove(Duration.ZERO, PointerInput.Origin.viewport(), x, startY))
    .addAction(finger.createPointerDown(PointerInput.MouseButton.LEFT.asArg()))
    .addAction(finger.createPointerMove(Duration.ofMillis(600), PointerInput.Origin.viewport(), x, endY))
    .addAction(finger.createPointerUp(PointerInput.MouseButton.LEFT.asArg()));
driver.perform(List.of(swipe));

// Same intent with a UiAutomator2 mobile command scoped to an element
WebElement list = driver.findElement(AppiumBy.id("com.example.shop:id/results"));
driver.executeScript("mobile: swipeGesture", Map.of(
    "elementId", ((RemoteWebElement) list).getId(),
    "direction", "up",
    "percent", 0.75));
```

## Expected output

After the swipe, the list shows later results. A follow-up assertion makes the outcome explicit:

```java
new WebDriverWait(driver, Duration.ofSeconds(10))
    .until(ExpectedConditions.visibilityOfElementLocated(AppiumBy.accessibilityId("Load more")));
```

If the element never appears, the wait fails with a `TimeoutException` naming the locator, which is a far clearer failure than a later `NoSuchElementException`.

## Common mistakes

- **Accepting the first XPath** a recorder or Inspector suggests.
- **Hard-coded pixel coordinates** that only work on one screen size.
- **Swiping without waiting** for scrolling animation to settle before the next action.
- **Locating by visible text** in a localised app, so tests fail in other languages.
- **Copying `TouchAction` code** from outdated articles.
- **Using the same locator for both platforms** without checking that the identifier really exists on each.

## Troubleshooting

- **Element found in Inspector but not in the test.** It may be off screen or not yet rendered; scroll to it and use an explicit wait.
- **Swipe does nothing.** Start point may be on a non-scrollable area or too close to the screen edge where the system gesture area is; move the start point inwards or swipe on the element.
- **Gesture works on Android but not iOS.** Mobile commands are driver-specific; use the XCUITest equivalent or W3C Actions.
- **Page source is huge and slow.** Avoid XPath on that screen and use native queries.

## Key takeaways summary

Stable mobile automation rests on stable locators and screen-independent gestures. Use accessibility ids and native queries, keep XPath for emergencies, perform gestures with W3C Actions or driver mobile commands rather than the removed TouchAction, and confirm each gesture's effect with an explicit wait.
