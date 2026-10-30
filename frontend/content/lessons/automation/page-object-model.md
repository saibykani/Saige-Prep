---
slug: page-object-model
title: Page Object Model
summary: Separate what a test checks from how it interacts with the page. Build page objects and components that keep locators in one place and make tests read like user journeys.
level: intermediate
duration: 40
tags: [pom, framework-design, selenium, automation]
objectives:
  - Explain the problem the Page Object Model solves
  - Design page and component classes with private locators and intention-revealing methods
  - Decide where waits and assertions belong
  - Recognise and avoid common POM anti-patterns
prerequisites:
  - OOP for test automation
  - Locator strategies and waits
  - TestNG essentials
related: [java-oop-for-test-automation, automation-design-patterns, locator-strategies, waits-and-synchronization]
references:
  - title: Selenium documentation — Page object models
    url: https://www.selenium.dev/documentation/test_practices/encouraged/page_object_models/
  - title: Selenium documentation — Test practices
    url: https://www.selenium.dev/documentation/test_practices/
  - title: Playwright documentation — Page object models
    url: https://playwright.dev/docs/pom
interview:
  - q: What is the Page Object Model and what problem does it solve?
    a: "It is a design pattern where each page, or significant component, of the application is represented by a class that holds its locators privately and exposes the services the page offers, such as loginAs or addToCart. Tests call those methods instead of using Selenium directly. It solves duplication and brittleness: when the UI changes, you update one class rather than every test, and tests read as business steps."
  - q: Should page objects contain assertions?
    a: "Generally no. The Selenium documentation recommends keeping assertions in tests, so page objects remain reusable for both positive and negative scenarios. Page objects return state, such as the error text or whether a banner is visible, and the test decides what is expected. A narrow exception some teams allow is a check in the constructor that the right page has loaded."
  - q: What is PageFactory and would you use it?
    a: "PageFactory initialises @FindBy-annotated WebElement fields with lazy proxies. It still exists in Selenium 4's support package, but it hides when elements are looked up, can cause stale element problems and does not integrate naturally with explicit waits. Many teams prefer storing By locators and finding elements inside methods after waiting, which is more explicit and easier to debug."
practice:
  - "Write page objects for a login page and a dashboard page. loginAs should return a DashboardPage; loginExpectingError should return the error text."
  - "Identify a header that appears on several pages and extract it into a Header component used by composition."
  - "Take an existing test that calls driver.findElement directly ten times and refactor it to use page objects. Count how many lines the test shrinks to."
takeaways:
  - One class per page or component; locators private; methods describe user intent.
  - Navigation methods return the next page object, giving a fluent, readable flow.
  - Waits belong inside page methods; assertions belong in tests.
  - Compose components rather than building deep inheritance hierarchies.
  - Never share a static driver across page objects if you plan to run in parallel.
quiz:
  - id: pom-q1
    type: single
    topic: page-object-model
    difficulty: beginner
    prompt: The id of the login button changes. In a well-designed POM framework, how many places need updating?
    options: ["Every test that logs in", "One: the LoginPage class", "The testng.xml file", "None; Selenium detects it automatically"]
    answer: [1]
    explanation: "Centralising locators in the page object is the core benefit of POM: one change fixes every test that uses the page. Without POM, every test with its own copy of the locator would need editing."
  - id: pom-q2
    type: scenario
    topic: page-object-model
    difficulty: intermediate
    prompt: A teammate adds Assert.assertEquals(title, 'Dashboard') inside LoginPage.loginAs(). Now a negative test for wrong passwords cannot reuse loginAs. What is the best design?
    options: ["Copy loginAs into a second method without the assertion", "Remove the assertion from the page; return the next page or state and assert in each test", "Catch the AssertionError in the negative test", "Use SoftAssert inside the page"]
    answer: [1]
    explanation: "Page objects should model behaviour and expose state; tests decide expectations. Duplicating methods or catching assertion errors spreads the design problem, and soft asserts inside pages still hide expectations from the test."
  - id: pom-q3
    type: debugging
    topic: page-object-model
    difficulty: intermediate
    prompt: Tests in parallel mode randomly type into the wrong browser. What is the most likely cause in this page object base?
    code: |
      public class BasePage {
          protected static WebDriver driver;
          public BasePage(WebDriver d) { driver = d; }
      }
    codeLanguage: java
    options: ["The constructor should be private", "The driver field is static, so all page objects in all threads share whichever driver was set last", "BasePage must be abstract", "WebDriver is not thread-safe so parallel testing is impossible"]
    answer: [1]
    explanation: "A static field belongs to the class, so threads overwrite each other's driver. Make it an instance field (protected final WebDriver driver) and give each thread its own driver. Parallel testing is fine as long as each thread has its own WebDriver instance."
  - id: pom-q4
    type: truefalse
    topic: page-object-model
    difficulty: beginner
    prompt: A page object should represent every single element on a page, even those no test uses.
    options: ["True", "False"]
    answer: [1]
    explanation: "Model the services tests actually need. Unused locators are maintenance cost with no benefit and go stale silently."
---

## Beginner-friendly explanation

Imagine writing instructions for a new employee: "Go to the third drawer of the grey cabinet, take the blue form, fill in boxes 4 and 7, and put it in the tray by the window." If the office is rearranged, you have to rewrite every instruction sheet.

A better approach is a single "Office guide" that says how to do things — "Submit expense form" — and instruction sheets that just say "Submit expense form for ₹2,000". When the office changes, you update the guide once.

The **Page Object Model (POM)** is that guide for a web application. Each page gets a class that knows *where* things are and *how* to use them. Tests only say *what* the user does and *what* should happen.

## Technical explanation

A **page object** is a class that wraps a page or a significant component and exposes its **services**. Rules of thumb from the Selenium documentation and common practice:

- **Locators are private.** Tests never see `By` or `WebElement`.
- **Public methods describe user intent**: `loginAs(user, pass)`, `searchFor(term)`, `addToCart(product)`.
- **Navigation methods return page objects**: `loginAs` returns `DashboardPage`; `loginExpectingError` returns the error text.
- **Waits live inside page methods**, so tests stay free of synchronization code.
- **Assertions live in tests**, so page methods are reusable for positive and negative cases.
- **Components** (header, date picker, cart drawer) are their own classes, composed into pages.

```mermaid
flowchart TB
  subgraph Tests
    LT["LoginTests"]
    CT["CheckoutTests"]
  end
  subgraph Pages
    BP["BasePage (driver, wait, helpers)"]
    LP["LoginPage: loginAs(), loginExpectingError()"]
    DP["DashboardPage: userName(), header()"]
    CP["CheckoutPage: payWith(card)"]
    HC["Header component: search(), openCart()"]
  end
  LT --> LP
  CT --> CP
  BP --> LP
  BP --> DP
  BP --> CP
  DP -. composes .-> HC
  CP -. composes .-> HC
  LP -->|"returns"| DP
```

### PageFactory

Selenium's support package includes `PageFactory` and `@FindBy`, which create lazy element proxies. It is still available but optional; many teams prefer explicit `By` fields and waits, which avoid hidden lookups and stale proxies.

### Variations

- **Fluent page objects**: methods return `this` or the next page so steps chain.
- **Page component objects**: smaller classes for repeated widgets.
- **Screenplay pattern**: models actors, tasks and questions instead of pages, for very large suites (see [automation design patterns](/learn/automation/automation-design-patterns)).

## Real-world example

An e-commerce team had 300 UI tests, each with its own `driver.findElement(By.xpath(...))` calls for the checkout form. A redesign renamed several fields, and fixing the suite took two engineers most of a sprint. After introducing page objects for the checkout flow and a shared address-form component, the next redesign of that form was absorbed by updating one component class; the tests themselves did not change.

## Step-by-step walkthrough

1. **List the user journeys** your tests need, and the pages and components they touch.
2. **Create `BasePage`** with the driver, a `WebDriverWait` and small helpers.
3. **Create one class per page** with private `By` locators.
4. **Add methods for services**, waiting inside them before acting.
5. **Return the next page object** from methods that navigate.
6. **Expose state through getters** (`errorMessage()`, `itemCount()`) for tests to assert.
7. **Extract repeated widgets** into component classes.

## Code examples

```java
// LoginPage.java
public class LoginPage extends BasePage {
    private final By username = By.id("username");
    private final By password = By.id("password");
    private final By submit   = By.cssSelector("[data-testid='login-submit']");
    private final By error    = By.cssSelector("[role='alert']");

    public LoginPage(WebDriver driver) { super(driver); }

    public LoginPage open(String baseUrl) {
        driver.get(baseUrl + "/login");
        return this;
    }

    public DashboardPage loginAs(String user, String pass) {
        submitCredentials(user, pass);
        return new DashboardPage(driver);
    }

    public String loginExpectingError(String user, String pass) {
        submitCredentials(user, pass);
        return wait.until(ExpectedConditions.visibilityOfElementLocated(error)).getText();
    }

    private void submitCredentials(String user, String pass) {
        type(username, user);
        type(password, pass);
        click(submit);
    }
}

// LoginTests.java
public class LoginTests extends BaseTest {

    @Test
    public void validUserSeesTheirName() {
        DashboardPage dashboard = new LoginPage(driver).open(Config.BASE_URL).loginAs("demo", "s3cret");
        Assert.assertEquals(dashboard.userName(), "Demo User");
    }

    @Test
    public void wrongPasswordIsRejected() {
        String error = new LoginPage(driver).open(Config.BASE_URL).loginExpectingError("demo", "nope");
        Assert.assertEquals(error, "Invalid username or password");
    }
}
```

`BasePage` (with `type`, `click` and `wait`) is shown in [OOP for test automation](/learn/automation/java-oop-for-test-automation).

## Expected output

Illustrative TestNG summary after a successful run:

```text
===============================================
Default Suite
Total tests run: 2, Passes: 2, Failures: 0, Skips: 0
===============================================
```

## Common mistakes

- **Assertions inside page objects**, making methods unusable for negative tests.
- **Public `WebElement` fields or getters** that let tests bypass the page API.
- **"God" page objects** with hundreds of methods; split into components.
- **Static drivers** in base pages, breaking [parallel execution](/learn/automation/parallel-execution).
- **Methods named after UI mechanics** (`clickButton3`) rather than intent (`submitOrder`).
- **Deep inheritance** (`CheckoutPage extends CartPage extends HeaderPage`) instead of composition.

## Troubleshooting

- **`StaleElementReferenceException` with PageFactory**: the proxy refers to an element that re-rendered; switch to `By` fields and find after waiting.
- **Tests still contain `driver.findElement`**: a missing page method; add it rather than reaching around the page.
- **Page constructors fail on slow loads**: if you verify the page in the constructor, wait for a unique element there rather than checking immediately.

## Key takeaways summary

The Page Object Model separates intent from mechanics. Tests describe journeys and expectations; page and component classes own locators, waits and interactions. Done well, UI changes stay cheap and tests stay readable — which is the whole point of a maintainable framework.
