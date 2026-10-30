---
slug: java-oop-for-test-automation
title: OOP for test automation
summary: Classes, objects, encapsulation, inheritance, polymorphism and abstraction explained through the code you write in real Selenium and TestNG frameworks.
level: beginner
duration: 40
tags: [java, oop, automation, framework-design]
objectives:
  - Explain classes, objects, constructors and access modifiers with automation examples
  - Apply encapsulation to hide locators and expose meaningful page actions
  - Use inheritance and interfaces appropriately, and know when composition is better
  - Recognise polymorphism in the WebDriver interface and use it to swap browsers
prerequisites:
  - Java basics for testers (types, strings, methods)
related: [java-basics-for-testers, page-object-model, automation-design-patterns, selenium-architecture]
references:
  - title: Java SE documentation (Oracle)
    url: https://docs.oracle.com/en/java/
  - title: Selenium documentation — Page object models
    url: https://www.selenium.dev/documentation/test_practices/encouraged/page_object_models/
  - title: Selenium WebDriver documentation
    url: https://www.selenium.dev/documentation/webdriver/
interview:
  - q: Where do you use the four OOP principles in a Selenium framework?
    a: "Encapsulation: page objects keep locators private and expose methods like login(user). Inheritance: page classes extend a BasePage that holds the driver and shared wait helpers. Polymorphism: tests depend on the WebDriver interface, so the same code runs on ChromeDriver, FirefoxDriver or RemoteWebDriver. Abstraction: interfaces or abstract classes such as a DriverFactory hide how a browser is created from the tests that use it."
  - q: Why is WebDriver driver = new ChromeDriver() preferred over ChromeDriver driver = new ChromeDriver()?
    a: "Programming to the interface keeps the rest of the code independent of a specific browser. Methods accept and return WebDriver, so switching to Firefox or a remote Grid session is a one-line change in a factory. If you need a browser-specific feature you can still cast or use the concrete type locally, but that should be the exception."
  - q: When would you choose composition over inheritance in a test framework?
    a: "When the relationship is 'has a' rather than 'is a'. A checkout page has a header and a cart summary component; it is not a kind of header. Modelling shared widgets as component objects that pages contain avoids deep inheritance chains where a change in a base class ripples unpredictably through every page."
practice:
  - "Create a BasePage class with a protected WebDriver field and a constructor, then a LoginPage that extends it with private locators and a public loginAs(username, password) method."
  - "Write an interface called DriverFactory with a create() method and two implementations, one for Chrome and one for Firefox. Choose between them using a system property."
  - "Refactor a page class that inherits from a HeaderPage into one that holds a Header component object instead. Note what became simpler."
takeaways:
  - A class is a blueprint; an object is an instance with its own state.
  - Encapsulation in tests means private locators and public, intention-revealing actions.
  - Inherit for genuine 'is a' relationships such as BasePage; compose for shared widgets.
  - Program to interfaces like WebDriver so implementations can be swapped.
  - Keep assertions in tests, not in page objects, so pages stay reusable.
quiz:
  - id: joop-q1
    type: single
    topic: java-oop-for-test-automation
    difficulty: beginner
    prompt: In a page object, the locators are declared private and only methods such as loginAs() are public. Which OOP principle is this?
    options: ["Inheritance", "Encapsulation", "Polymorphism", "Overloading"]
    answer: [1]
    explanation: "Hiding internal details (locators) and exposing a controlled interface (actions) is encapsulation. Inheritance would be extending a base class; polymorphism is one interface with many implementations."
  - id: joop-q2
    type: code-output
    topic: java-oop-for-test-automation
    difficulty: intermediate
    prompt: What does this program print?
    code: |
      class BasePage {
          String name() { return "base"; }
          void describe() { System.out.println("Page: " + name()); }
      }
      class CartPage extends BasePage {
          @Override String name() { return "cart"; }
      }
      public class Main {
          public static void main(String[] args) {
              BasePage page = new CartPage();
              page.describe();
          }
      }
    codeLanguage: java
    options: ["Page: base", "Page: cart", "Compilation error", "Page: null"]
    answer: [1]
    explanation: "Method calls are resolved on the actual object at run time (dynamic dispatch). The object is a CartPage, so its overridden name() runs even though the variable type is BasePage. 'Page: base' would only appear if name() were not overridden."
  - id: joop-q3
    type: debugging
    topic: java-oop-for-test-automation
    difficulty: intermediate
    prompt: Every LoginPage method throws NullPointerException on driver. What is the bug?
    code: |
      public class LoginPage {
          private WebDriver driver;
          public LoginPage(WebDriver driver) {
              driver = driver;
          }
          public void open() { driver.get("https://example.test/login"); }
      }
    codeLanguage: java
    options: ["WebDriver cannot be a field", "The constructor assigns the parameter to itself; it should be this.driver = driver", "The field must be public", "get() needs a URL object"]
    answer: [1]
    explanation: "Inside the constructor, driver refers to the parameter, so driver = driver does nothing and the field stays null. this.driver = driver assigns the field. Making the field public would not fix it."
  - id: joop-q4
    type: multiple
    topic: java-oop-for-test-automation
    difficulty: intermediate
    prompt: Which are good reasons to declare variables as WebDriver rather than ChromeDriver? Select all that apply.
    options: ["The same tests can run on different browsers", "It makes tests run faster", "It allows a factory to return RemoteWebDriver for a Grid", "It removes the need for waits"]
    answer: [0, 2]
    explanation: "Depending on the interface lets different implementations be substituted, including RemoteWebDriver. It has no effect on speed or synchronization."
---

## Beginner-friendly explanation

Imagine a TV remote. You press **Volume up** without knowing anything about the circuits inside. The remote hides the complexity (that is **encapsulation**), every brand's remote has a volume button that behaves the same way from your point of view (**polymorphism**), and a "smart remote" is still a remote with extra buttons (**inheritance**).

Object-oriented programming (OOP) lets you build test code the same way. A `LoginPage` object has buttons like `loginAs(user)`; the test presses them without caring which HTML element sits underneath. When the page changes, you fix the inside of the remote once, and every test that uses it keeps working.

## Technical explanation

### Classes, objects and constructors

A **class** defines fields (state) and methods (behaviour). An **object** is an instance created with `new`. A **constructor** initialises the object; use `this.field = parameter` to assign fields when names clash.

Access modifiers control visibility: `private` (this class only), package-private (no keyword), `protected` (package plus subclasses) and `public`.

### The four principles in automation

| Principle | Meaning | Automation example |
|---|---|---|
| Encapsulation | Hide state, expose behaviour | Private `By` locators, public `loginAs()` |
| Inheritance | A subclass reuses and extends a parent | `LoginPage extends BasePage` sharing the driver and waits |
| Polymorphism | One interface, many implementations; overriding resolves at run time | `WebDriver` implemented by `ChromeDriver`, `FirefoxDriver`, `RemoteWebDriver` |
| Abstraction | Expose *what*, hide *how* | A `DriverFactory` interface; an abstract `BaseTest` |

**Overloading** (same method name, different parameters, chosen at compile time) is different from **overriding** (a subclass replaces a parent method, chosen at run time).

### Interfaces and abstract classes

An **interface** declares capabilities (`WebDriver`, `TakesScreenshot`, `JavascriptExecutor`). A class can implement many interfaces, which is why you can cast a `ChromeDriver` to `TakesScreenshot`. An **abstract class** can hold shared code and state but cannot be instantiated; `BasePage` is often abstract.

### Composition over inheritance

Inheritance is for "is a"; composition is for "has a". A product page *has a* header and a search bar. Model those as component classes the page holds as fields, instead of building tall inheritance chains.

```mermaid
flowchart TB
  BasePage["BasePage (abstract): driver, wait, click(), type()"]
  LoginPage["LoginPage: loginAs()"]
  ProductPage["ProductPage: addToCart()"]
  Header["Header component: search(), openCart()"]
  BasePage --> LoginPage
  BasePage --> ProductPage
  ProductPage -. has a .-> Header
```

## Real-world example

An insurance team's framework started with every page class extending a `HeaderPage`, which extended a `NavigationPage`, which extended `BasePage`. When the header was redesigned, a single changed method broke forty page classes in different ways. The team refactored the header into a `Header` component held by the pages that actually show it. The next redesign touched one class.

## Step-by-step walkthrough

1. **Create an abstract `BasePage`** holding a `protected final WebDriver driver` and a `WebDriverWait`.
2. **Add small shared helpers** (`click(By)`, `type(By, String)`) that wait before acting.
3. **Create page classes** that extend `BasePage`, keep locators `private`, and expose business actions.
4. **Return the next page object** from navigation actions so tests read as a flow.
5. **Keep assertions in the test class**, using getters such as `errorMessage()`.
6. **Extract repeated widgets** into component classes and compose them.

## Code examples

```java
// BasePage.java and LoginPage.java (shown together; each public class lives in its own file)
import java.time.Duration;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

public abstract class BasePage {
    protected final WebDriver driver;
    protected final WebDriverWait wait;

    protected BasePage(WebDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(10));
    }

    protected void type(By locator, String text) {
        var field = wait.until(ExpectedConditions.visibilityOfElementLocated(locator));
        field.clear();
        field.sendKeys(text);
    }

    protected void click(By locator) {
        wait.until(ExpectedConditions.elementToBeClickable(locator)).click();
    }
}

public class LoginPage extends BasePage {
    private final By username = By.id("username");
    private final By password = By.id("password");
    private final By submit = By.cssSelector("button[type='submit']");

    public LoginPage(WebDriver driver) { super(driver); }

    public DashboardPage loginAs(String user, String pass) {
        type(username, user);
        type(password, pass);
        click(submit);
        return new DashboardPage(driver);
    }
}
```

A test then depends only on the interface and the page API:

```java
WebDriver driver = new ChromeDriver();   // Selenium Manager resolves the driver binary
DashboardPage dashboard = new LoginPage(driver).loginAs("demo", "s3cret");
System.out.println("Logged in as: " + dashboard.userName());
```

## Expected output

Illustrative output from running the snippet against a demo application:

```text
Logged in as: demo
```

If the constructor bug from the quiz were present (`driver = driver;`), the first action would instead fail with `java.lang.NullPointerException: Cannot invoke "org.openqa.selenium.WebDriver.findElement(...)" because "this.driver" is null`.

## Common mistakes

- **Public locators or `WebElement` fields** that tests poke at directly, defeating encapsulation.
- **Assertions inside page objects**, which makes pages hard to reuse for negative tests.
- **Deep inheritance chains** for things that are really components.
- **Static `WebDriver` fields** shared across all tests, which breaks parallel execution.
- **Confusing overloading with overriding** in interviews and in code reviews.
- **Forgetting `this.`** in constructors and setters.

## Troubleshooting

- **`NullPointerException` on `driver`**: check constructor assignments and that every page receives the driver.
- **`ClassCastException`**: you cast to an interface the object does not implement; check the concrete type.
- **A subclass method is never called**: the signature does not match the parent; add `@Override` so the compiler checks it.

## Key takeaways summary

OOP is what keeps a test framework maintainable. Encapsulate locators behind meaningful page methods, share genuine common behaviour through a base class, compose reusable widgets, and code against interfaces like `WebDriver`. These ideas lead directly into the [Page Object Model](/learn/automation/page-object-model).
