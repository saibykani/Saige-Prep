---
slug: locator-strategies
title: Locator strategies
summary: Choose locators that survive UI changes — id, name, CSS, XPath, link text and Selenium 4 relative locators — and know which to prefer and why.
level: beginner
duration: 40
tags: [selenium, locators, css, xpath, automation]
objectives:
  - List the eight By strategies and Selenium 4 relative locators
  - Write CSS selectors and XPath expressions for common element patterns
  - Rank locators by stability and choose the most robust one available
  - Work with developers to add dedicated test attributes
prerequisites:
  - Selenium architecture and WebDriver
  - Basic HTML (elements, attributes, nesting)
related: [selenium-architecture, waits-and-synchronization, page-object-model, flaky-test-reduction]
references:
  - title: Selenium documentation — Locator strategies
    url: https://www.selenium.dev/documentation/webdriver/elements/locators/
  - title: Selenium documentation — Finding web elements
    url: https://www.selenium.dev/documentation/webdriver/elements/finders/
  - title: Playwright documentation — Locators (for comparison)
    url: https://playwright.dev/docs/locators
interview:
  - q: What is your locator preference order and why?
    a: "First a unique, stable id or a dedicated test attribute such as data-testid, because they exist for identification and rarely change with styling. Then name or other meaningful attributes. Then short CSS selectors anchored on stable attributes. XPath when I need text matching or to walk up the tree. I avoid absolute XPath and selectors tied to layout or generated class names, because they break when the page structure or styling changes."
  - q: When would you use XPath instead of CSS?
    a: "When I need to locate by visible text, for example //button[normalize-space()='Pay now'], or navigate to a parent or preceding sibling, such as finding the row that contains a given order number and then a button inside it. CSS cannot select by text content or move up the tree, although the :has() pseudo-class now covers some parent cases in modern browsers."
  - q: How do you handle elements with dynamic IDs like user-48213?
    a: "Avoid the dynamic part. Use a stable attribute, a partial match such as CSS [id^='user-'] if the prefix is meaningful, or a relationship to stable nearby text. The best long-term fix is asking developers for a data-testid, which is cheap for them and removes the guesswork."
practice:
  - "Open any public demo site, pick five elements and write both a CSS selector and an XPath for each. Verify them in the browser DevTools console with document.querySelectorAll and $x."
  - "Write an XPath that finds the Delete button in the table row containing order number 1042."
  - "Rewrite this brittle locator into a robust one: /html/body/div[2]/div/form/div[3]/button."
takeaways:
  - Prefer ids and dedicated test attributes; they exist to identify elements.
  - Use CSS for attribute and hierarchy matching; use XPath for text and upward navigation.
  - Never use absolute XPath or auto-generated class names.
  - Verify every locator matches exactly one element before using it in a test.
  - Keep locators in page objects so a change is fixed in one place.
quiz:
  - id: sel-loc-q1
    type: single
    topic: locator-strategies
    difficulty: beginner
    prompt: Which locator is most likely to survive a visual redesign of a login form?
    options: ["By.xpath(\"/html/body/div[2]/form/input[1]\")", "By.cssSelector(\"[data-testid='login-email']\")", "By.className(\"css-1x9ab3f\")", "By.cssSelector(\"form > div:nth-child(2) > input\")"]
    answer: [1]
    explanation: "A dedicated test attribute is independent of layout and styling. The absolute XPath and nth-child selector break when structure changes, and generated class names change with each build."
  - id: sel-loc-q2
    type: code-output
    topic: locator-strategies
    difficulty: intermediate
    prompt: The page has three elements matching .price. What happens when this line runs?
    code: |
      String first = driver.findElement(By.cssSelector(".price")).getText();
    codeLanguage: java
    options: ["It throws because more than one element matches", "It returns the text of the first matching element in document order", "It returns the text of all three joined", "It returns an empty string"]
    answer: [1]
    explanation: "findElement returns the first match in document order and does not complain about extra matches. That silent behaviour is why you should check that a locator is unique: a test can quietly act on the wrong element."
  - id: sel-loc-q3
    type: debugging
    topic: locator-strategies
    difficulty: intermediate
    prompt: This XPath fails to find a button whose HTML is a button element containing the text '  Pay now ' with extra spaces. Which fix is best?
    code: |
      By pay = By.xpath("//button[text()='Pay now']");
    codeLanguage: java
    options: ["//button[normalize-space()='Pay now']", "//button[@text='Pay now']", "//*[text()='Pay now']", "By.linkText(\"Pay now\")"]
    answer: [0]
    explanation: "normalize-space() trims and collapses whitespace before comparing, so it matches the padded text. @text looks for an attribute called text, which does not exist; the wildcard version still fails on whitespace; linkText only works for anchor elements."
  - id: sel-loc-q4
    type: multiple
    topic: locator-strategies
    difficulty: beginner
    prompt: Which of these are valid Selenium 4 Java By strategies? Select all that apply.
    options: ["By.id", "By.cssSelector", "By.text", "By.partialLinkText", "By.tagName"]
    answer: [0, 1, 3, 4]
    explanation: "Selenium's By class offers id, name, className, tagName, linkText, partialLinkText, cssSelector and xpath. There is no By.text; text matching is done with XPath or linkText for links."
---

## Beginner-friendly explanation

Imagine telling a friend which book to fetch from a crowded shelf. "The third book from the left on the second shelf" works until someone adds a book. "The blue one" fails when two are blue. "The one with the library barcode 4417" always works, because the barcode exists precisely to identify that book.

A **locator** is how your test tells Selenium which element on the page to use. Good locators are like barcodes: unique and stable. Bad locators are like "third from the left": they work today and break tomorrow.

## Technical explanation

Selenium's `By` class offers eight strategies:

| Strategy | Example | Notes |
|---|---|---|
| `By.id` | `By.id("email")` | Fast and stable if the id is static and unique |
| `By.name` | `By.name("password")` | Good for form fields |
| `By.className` | `By.className("error")` | One class name only; no spaces |
| `By.tagName` | `By.tagName("h1")` | Usually too broad on its own |
| `By.linkText` | `By.linkText("Forgot password?")` | Exact visible text of an anchor |
| `By.partialLinkText` | `By.partialLinkText("Forgot")` | Substring of anchor text |
| `By.cssSelector` | `By.cssSelector("[data-testid='submit']")` | Flexible and widely used |
| `By.xpath` | `By.xpath("//tr[td='1042']//button")` | Text matching and upward navigation |

### CSS selector essentials

- `#id`, `.class`, `tag`, `[attr='value']`
- Partial attributes: `[id^='user-']` (starts with), `[href$='.pdf']` (ends with), `[class*='alert']` (contains)
- Hierarchy: `form#login input[type='email']` (descendant), `ul > li` (child)

### XPath essentials

- Relative paths start with `//`. Never use absolute `/html/body/...`.
- Text: `//button[normalize-space()='Save']`, `//h2[contains(., 'Orders')]`
- Axes: `//td[.='1042']/parent::tr`, `//label[.='Email']/following-sibling::input`

### Relative locators (Selenium 4)

`RelativeLocator.with(By.tagName("input")).below(By.id("email"))` finds elements by visual position using `above`, `below`, `toLeftOf`, `toRightOf` and `near`. They depend on rendered layout, so treat them as a fallback.

### Stability ranking

1. Dedicated test attributes (`data-testid`, `data-test`) or stable ids
2. `name` and meaningful attributes (`type`, `aria-label`)
3. Short CSS anchored on those attributes
4. XPath using visible text or stable relationships
5. Never: absolute XPath, positional `nth-child` chains, generated class names

## Real-world example

An HR portal's automation used selectors copied from the browser's "Copy XPath" menu, such as `/html/body/div[3]/div[2]/div/div[4]/button`. A banner was added at the top of every page, every index shifted by one, and most of the suite broke overnight. The team agreed with developers to add `data-testid` attributes to interactive elements as part of the Definition of Done, and rewrote locators to use them. Subsequent layout changes no longer touched the tests.

## Step-by-step walkthrough

1. **Inspect the element** in browser DevTools and look for an id, name or test attribute.
2. **Check uniqueness** in the console: `document.querySelectorAll("[data-testid='submit']").length` should be 1. For XPath use `$x("//button[normalize-space()='Save']")`.
3. **Prefer the shortest selector** anchored on a stable attribute.
4. **Avoid dynamic values**; use stable prefixes or nearby labels instead.
5. **Store the locator in a page object** as a private `By` field.
6. **Ask for test ids** when nothing stable exists.

## Code examples

```java
import static org.openqa.selenium.support.locators.RelativeLocator.with;

import java.util.List;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

public class OrdersPage {
    private final WebDriver driver;

    private final By searchBox   = By.cssSelector("[data-testid='order-search']");
    private final By resultRows  = By.cssSelector("table#orders tbody tr");
    private final By passwordBox = with(By.tagName("input")).below(By.id("email"));

    public OrdersPage(WebDriver driver) { this.driver = driver; }

    /** XPath: find the row containing the order number, then its Delete button. */
    private By deleteButtonFor(String orderNo) {
        return By.xpath("//table[@id='orders']//tr[td[normalize-space()='" + orderNo + "']]"
                + "//button[normalize-space()='Delete']");
    }

    public void deleteOrder(String orderNo) {
        driver.findElement(deleteButtonFor(orderNo)).click();
    }

    public int resultCount() {
        List<WebElement> rows = driver.findElements(resultRows);
        return rows.size();
    }
}
```

## Expected output

Checking locators in the Chrome DevTools console before using them (illustrative):

```text
> document.querySelectorAll("[data-testid='order-search']").length
1
> $x("//table[@id='orders']//tr[td[normalize-space()='1042']]//button[normalize-space()='Delete']").length
1
> document.querySelectorAll(".btn").length
14
```

The last result shows why `.btn` is a poor locator: fourteen matches, and `findElement` would silently use the first.

## Common mistakes

- **Copying absolute XPath from DevTools** without rewriting it.
- **Not checking uniqueness**, so `findElement` quietly picks the wrong match.
- **Using `By.className` with spaces** (`"btn primary"`), which is invalid; use CSS `.btn.primary`.
- **Matching translated text** in multi-language apps, which breaks per locale.
- **Locators scattered across tests** instead of centralised in page objects.
- **Blaming the locator for timing problems.** A correct locator still fails if the element has not rendered yet; that is a [wait](/learn/automation/waits-and-synchronization) problem.

## Troubleshooting

- **`NoSuchElementException` but the element is visible**: it may be inside an iframe or shadow DOM, or not rendered yet. Check frames and waits before rewriting the locator.
- **`InvalidSelectorException`**: syntax error in CSS or XPath; test it in the DevTools console.
- **Locator works in DevTools but not in the test**: the DevTools snapshot may be after JavaScript finished; add an explicit wait.
- **Shadow DOM elements**: use `element.getShadowRoot().findElement(By.cssSelector(...))` in Selenium 4 (CSS only inside shadow roots).

## Key takeaways summary

Choose locators the way you would label something for a stranger: by a unique, stable identity rather than by position or appearance. Prefer ids and test attributes, use CSS and XPath deliberately, verify uniqueness, and keep locators in one place so changes are cheap.
