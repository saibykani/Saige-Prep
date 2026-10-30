---
slug: automation-design-patterns
title: Automation design patterns
summary: Learn the design patterns that keep automation frameworks maintainable, including Page Object, Factory, Builder, Singleton, Strategy, Facade and Screenplay, with Java examples and guidance on when each one is overkill.
level: advanced
duration: 40
tags: [design-patterns, framework-design, java, automation]
objectives:
  - Explain what a design pattern is and why frameworks use them
  - Apply Factory, Builder, Strategy and Facade in test code
  - Recognise when Singleton harms parallel execution
  - Compare Page Object and Screenplay approaches
prerequisites:
  - OOP for test automation
  - Page Object Model
related: [page-object-model, java-oop-for-test-automation, parallel-execution, data-driven-testing, test-architecture-and-system-design]
references:
  - title: Selenium documentation — Test practices
    url: https://www.selenium.dev/documentation/test_practices/
  - title: Serenity BDD — Screenplay pattern
    url: https://serenity-bdd.github.io/docs/screenplay/screenplay_fundamentals
  - title: Playwright documentation — Page object models
    url: https://playwright.dev/docs/pom
interview:
  - q: Which design patterns have you used in a test framework, and why?
    a: "Page Object to isolate UI mechanics; a Factory to create the right WebDriver from configuration; Builder for readable test data such as a user with only the fields that matter; Strategy to swap behaviours like local versus remote execution; and a Facade that combines several page or API steps into one business action. Each one removed duplication or made a change local."
  - q: Is Singleton a good choice for WebDriver?
    a: "A classic static Singleton is a poor choice when tests run in parallel, because there is one instance for all threads. If you want a single access point, use a per-thread holder with ThreadLocal, or inject the driver through constructors."
  - q: What is the Screenplay pattern?
    a: "It models tests around actors who have abilities, such as browsing the web or calling an API, perform tasks composed of interactions, and ask questions about the system state. It follows SOLID principles more strictly than page objects and scales well for large suites, at the cost of more classes and a learning curve."
practice:
  - "Write a DriverFactory that returns Chrome, Firefox or a RemoteWebDriver based on a system property."
  - "Create a UserBuilder with sensible defaults and use it to create a user that only differs in country."
  - "Identify a sequence of five page calls repeated in many tests and wrap it in a facade method."
takeaways:
  - Patterns are named solutions to recurring problems; use them where the problem exists.
  - Factory centralises object creation such as drivers.
  - Builder makes test data readable and defaults explicit.
  - Avoid static Singletons for drivers in parallel suites.
  - Screenplay suits large suites; Page Object suits most teams.
quiz:
  - id: adpt-q1
    type: single
    topic: automation-design-patterns
    difficulty: intermediate
    prompt: Tests need Chrome locally, Firefox on some CI jobs and a remote Grid browser on others. Which pattern fits creating the driver?
    options: ["Builder", "Factory", "Observer", "Decorator"]
    answer: [1]
    explanation: "A Factory hides the decision of which concrete class to create behind one method. Builder is for constructing one object step by step with many optional parts, not choosing between types."
  - id: adpt-q2
    type: code-output
    topic: automation-design-patterns
    difficulty: intermediate
    prompt: What does this print?
    code: |
      User u = new UserBuilder().country("IN").build();
      System.out.println(u.name() + "/" + u.country());
      // UserBuilder defaults: name "Test User", country "US"
    codeLanguage: java
    options: ["Test User/US", "Test User/IN", "null/IN", "Compilation error"]
    answer: [1]
    explanation: "A builder starts from defaults and overrides only what you set. name keeps its default, country is overridden to IN."
  - id: adpt-q3
    type: truefalse
    topic: automation-design-patterns
    difficulty: beginner
    prompt: Using more design patterns always makes a test framework better.
    options: ["True", "False"]
    answer: [1]
    explanation: "Patterns add indirection. Applied where there is no matching problem, they make code harder to read. A small suite may need only page objects and a driver factory."
  - id: adpt-q4
    type: scenario
    topic: automation-design-patterns
    difficulty: advanced
    prompt: Forty tests each repeat login, search, add to cart and open checkout before testing payment variants. What is the cleanest improvement?
    options: ["Copy the steps into a utility class with static methods that use a static driver", "Create a facade such as CheckoutFlow.reachPaymentAs(user, product) built from page objects", "Merge all forty tests into one", "Use Thread.sleep between steps"]
    answer: [1]
    explanation: "A facade gives a single business-level entry point that reuses page objects. Static drivers break parallel runs, and merging tests destroys isolation and clear failure reporting."
---

## Beginner-friendly explanation

Builders do not invent a new way to make a door every time. They use well-known designs: hinged doors, sliding doors, revolving doors. Each design solves a known problem, and anyone on the team understands it by name.

**Design patterns** are the same for code: named, proven solutions to problems that keep coming back. In test automation the recurring problems are "how do I create the right browser?", "how do I build test data without 20-argument constructors?", and "how do I stop tests repeating the same ten steps?". Knowing the patterns lets you solve these cleanly and explain your framework in interviews.

## Technical explanation

| Pattern | Problem in test code | Typical use |
|---|---|---|
| Page Object | UI locators duplicated across tests | One class per page or component |
| Factory | Choosing which object to create | `DriverFactory.create("firefox")` |
| Builder | Objects with many optional fields | Test data such as users and orders |
| Singleton | Exactly one instance of something | Read-only config; avoid for drivers |
| Strategy | Swapping an algorithm at runtime | Local vs remote execution, wait policies |
| Facade | Many steps for one business action | `CheckoutFlow.placeOrder(...)` |
| Decorator | Adding behaviour around calls | Logging every click |
| Screenplay | Large suites with many roles | Actors, abilities, tasks, questions |

Selenium supports the decorator idea natively with `WebDriverListener` and `EventFiringDecorator` in Selenium 4.

```mermaid
flowchart TB
  T[Test] --> F["Facade: CheckoutFlow"]
  F --> LP[LoginPage]
  F --> SP[SearchPage]
  F --> CP[CartPage]
  T --> B["Builder: UserBuilder"]
  BT[BaseTest] --> DF["Factory: DriverFactory"]
  DF --> S{"Strategy: local or remote?"}
  S --> L[ChromeDriver]
  S --> R[RemoteWebDriver]
```

### Screenplay in brief

An **Actor** has **Abilities** (BrowseTheWeb, CallAnApi), performs **Tasks** made of **Interactions**, and asks **Questions**. Serenity BDD provides an implementation for Java; Playwright and other ecosystems have community versions.

## Real-world example

An insurance team's framework had a 600-line `BaseTest` with `if (browser.equals("chrome"))` blocks, and tests built quote data through constructors with twelve positional arguments. They introduced a `DriverFactory`, a `QuoteBuilder` with defaults, and a `QuoteFlow` facade. New tests shrank to a few lines, and adding Edge support meant one new case in the factory rather than editing every base class.

## Step-by-step walkthrough

1. Find duplication or painful change points in your framework.
2. Name the problem: creation, configuration, repeated flow, data construction.
3. Pick the simplest pattern that addresses it.
4. Refactor one area and keep tests green.
5. Document the pattern in the framework README so new members recognise it.

## Code examples

```java
public final class DriverFactory {
    public static WebDriver create(String browser, String gridUrl) {
        boolean remote = gridUrl != null && !gridUrl.isBlank();
        switch (browser.toLowerCase()) {
            case "firefox": {
                FirefoxOptions o = new FirefoxOptions();
                return remote ? remote(gridUrl, o) : new FirefoxDriver(o);
            }
            case "chrome":
            default: {
                ChromeOptions o = new ChromeOptions();
                return remote ? remote(gridUrl, o) : new ChromeDriver(o);
            }
        }
    }

    private static WebDriver remote(String url, Capabilities caps) {
        try {
            return new RemoteWebDriver(new URL(url), caps);
        } catch (MalformedURLException e) {
            throw new IllegalArgumentException("Bad grid URL", e);
        }
    }
}
```

```java
public record User(String name, String email, String country) {}

public class UserBuilder {
    private String name = "Test User";
    private String email = "user+" + UUID.randomUUID() + "@example.test";
    private String country = "US";

    public UserBuilder name(String v)    { this.name = v; return this; }
    public UserBuilder country(String v) { this.country = v; return this; }
    public User build() { return new User(name, email, country); }
}
```

```java
public class CheckoutFlow {
    private final WebDriver driver;
    public CheckoutFlow(WebDriver driver) { this.driver = driver; }

    public PaymentPage reachPaymentAs(User user, String product) {
        return new LoginPage(driver).open(Config.BASE_URL)
            .loginAs(user.email(), Secrets.passwordFor(user))
            .search(product)
            .addFirstResultToCart()
            .openCart()
            .checkout();
    }
}
```

## Expected output

A test using these pieces reads like a specification:

```java
User indian = new UserBuilder().country("IN").build();
PaymentPage pay = new CheckoutFlow(driver).reachPaymentAs(indian, "Desk lamp");
Assert.assertTrue(pay.offersMethod("UPI"));
```

## Common mistakes

- **Pattern hunting**: adding patterns with no problem to solve.
- **Static Singleton driver**, breaking parallel execution.
- **Facades that assert**, hiding expectations from tests.
- **Builders without defaults**, which are just constructors with extra steps.
- **Deep inheritance** chains instead of composition.
- **Utility classes full of static methods** that quietly hold state.

## Troubleshooting

- **Factory keeps growing `if` branches**: move options into configuration or separate small factories per platform.
- **Hard to tell where a step lives**: keep a consistent layering: tests call flows, flows call pages, pages call WebDriver.
- **Screenplay feels heavy**: it may be more structure than the suite needs; page objects plus facades are fine.

## Key takeaways summary

Design patterns give names to good structure. Factory and Strategy tame driver creation, Builder makes data readable, Facade removes repeated flows, and Page Object or Screenplay organise UI interactions. Choose patterns because they solve a real problem, and keep them parallel-safe.
