---
slug: java-collections-and-exceptions
title: Collections and exceptions
summary: Use List, Set and Map to work with groups of elements and test data, and handle exceptions so failures are reported clearly instead of being hidden.
level: beginner
duration: 40
tags: [java, collections, exceptions, automation]
objectives:
  - Choose between List, Set and Map for common automation tasks
  - Iterate and filter collections, including with simple streams
  - Distinguish checked from unchecked exceptions and handle each appropriately
  - Use try-with-resources and finally to clean up reliably
prerequisites:
  - Java basics for testers
  - OOP for test automation
related: [java-basics-for-testers, java-oop-for-test-automation, data-driven-testing, debugging-failing-tests]
references:
  - title: Java SE 21 API specification (java.util collections)
    url: https://docs.oracle.com/en/java/javase/21/docs/api/index.html
  - title: Java SE documentation (Oracle)
    url: https://docs.oracle.com/en/java/
  - title: Selenium documentation — Finding web elements
    url: https://www.selenium.dev/documentation/webdriver/elements/finders/
interview:
  - q: What is the difference between findElement and findElements when nothing matches?
    a: "findElement throws NoSuchElementException (after any implicit wait). findElements returns an empty List and never throws for no matches. That makes findElements useful for checking absence: assert that the list is empty rather than catching an exception."
  - q: Explain checked versus unchecked exceptions with automation examples.
    a: "Checked exceptions extend Exception but not RuntimeException, and the compiler forces you to handle or declare them; IOException when reading a test-data file is one. Unchecked exceptions extend RuntimeException and are not enforced; all Selenium exceptions such as NoSuchElementException and TimeoutException are unchecked because they extend WebDriverException, which is a RuntimeException."
  - q: When should a test catch an exception?
    a: "Rarely. If an unexpected exception occurs, let it propagate so the framework marks the test as failed with the real stack trace. Catch only when you can add useful context and rethrow, when cleaning up, or when the exception is the expected behaviour, in which case use assertThrows (JUnit 5) or expectedExceptions (TestNG) instead of a manual try/catch."
practice:
  - "Collect all product names from a results page into a List, then assert that the list is sorted alphabetically using a copy sorted with Collections.sort or a stream."
  - "Use a Set to detect duplicate order IDs in a table and print any duplicates."
  - "Load key=value test settings from a properties file inside try-with-resources and store them in a Map. Make the error message name the missing file if it does not exist."
takeaways:
  - List keeps order and duplicates; Set removes duplicates; Map links keys to values.
  - findElements returns an empty list for no matches; findElement throws.
  - Selenium exceptions are unchecked; IOException and similar are checked.
  - Never swallow exceptions; add context and rethrow, or let them fail the test.
  - Use try-with-resources for files and streams, and finally or teardown hooks for browsers.
quiz:
  - id: jcol-q1
    type: single
    topic: java-collections-and-exceptions
    difficulty: beginner
    prompt: You want to verify that no two rows in a table share the same invoice number. Which collection makes this simplest?
    options: ["ArrayList", "HashSet", "LinkedList", "Array"]
    answer: [1]
    explanation: "A Set rejects duplicates: Set.add returns false when the element already exists, so duplicates are detected immediately. A List would accept them silently and require extra comparison logic."
  - id: jcol-q2
    type: code-output
    topic: java-collections-and-exceptions
    difficulty: intermediate
    prompt: There are no elements with class 'error' on the page. What is printed?
    code: |
      List<WebElement> errors = driver.findElements(By.className("error"));
      System.out.println("Errors: " + errors.size());
    codeLanguage: java
    options: ["Errors: 0", "Errors: null", "NoSuchElementException is thrown", "Errors: -1"]
    answer: [0]
    explanation: "findElements returns an empty list when nothing matches, so size() is 0. NoSuchElementException comes from findElement (singular), which is the tempting wrong choice."
  - id: jcol-q3
    type: debugging
    topic: java-collections-and-exceptions
    difficulty: intermediate
    prompt: This test passes even though the Save button is missing from the page. What is wrong?
    code: |
      @Test
      public void saveButtonIsShown() {
          try {
              driver.findElement(By.id("save")).isDisplayed();
          } catch (NoSuchElementException e) {
              System.out.println("Save not found");
          }
      }
    codeLanguage: java
    options: ["isDisplayed() always returns true", "The exception is swallowed, so nothing fails the test", "NoSuchElementException is a checked exception", "The test needs a @BeforeMethod"]
    answer: [1]
    explanation: "The catch block prints and continues, so the test ends normally and is reported as passed. The result of isDisplayed() is also never asserted. Remove the try/catch and assert assertTrue(driver.findElement(By.id(\"save\")).isDisplayed())."
  - id: jcol-q4
    type: truefalse
    topic: java-collections-and-exceptions
    difficulty: beginner
    prompt: TimeoutException thrown by WebDriverWait is an unchecked exception.
    options: ["True", "False"]
    answer: [0]
    explanation: "Selenium's TimeoutException extends WebDriverException, which extends RuntimeException, so it is unchecked and you are not forced to declare it."
---

## Beginner-friendly explanation

A **collection** is a container for many things at once. A shopping list (a **List**) keeps items in order and can repeat "milk" twice. A bag of unique raffle tickets (a **Set**) refuses duplicates. A phone book (a **Map**) links each name to a number.

Automation constantly deals with groups: all rows in a table, all product prices, all test users. Collections let you hold and check them in one go.

An **exception** is Java's way of shouting "something went wrong here". Good test code lets that shout reach the test report, so you can see exactly what failed, rather than covering its mouth.

## Technical explanation

### The core collection interfaces

| Interface | Common implementation | Ordered? | Duplicates? | Typical test use |
|---|---|---|---|---|
| `List` | `ArrayList` | Yes, by index | Yes | Rows, search results, `findElements` |
| `Set` | `HashSet`, `LinkedHashSet`, `TreeSet` | Only Linked/Tree | No | Uniqueness checks, window handles |
| `Map` | `HashMap`, `LinkedHashMap` | Only Linked | Unique keys | Test data by key, config, expected values |

`List.of(...)`, `Set.of(...)` and `Map.of(...)` create **immutable** collections, which is ideal for expected values. Collections hold objects, so `List<Integer>` not `List<int>`.

**Streams** process collections declaratively:

```java
List<String> names = driver.findElements(By.cssSelector(".product .name"))
        .stream()
        .map(WebElement::getText)
        .toList();                       // Java 16+
```

### Exceptions

All exceptions derive from `Throwable`. The two families that matter:

- **Checked** (`Exception` but not `RuntimeException`): `IOException`, `InterruptedException`. You must catch or declare with `throws`.
- **Unchecked** (`RuntimeException`): `NullPointerException`, `IllegalArgumentException`, and every Selenium exception, because `WebDriverException extends RuntimeException`.

Common Selenium exceptions: `NoSuchElementException`, `TimeoutException`, `StaleElementReferenceException`, `ElementClickInterceptedException`, `ElementNotInteractableException`, `NoSuchFrameException`, `NoAlertPresentException`.

**try-with-resources** closes anything implementing `AutoCloseable`, even when an exception occurs. `finally` runs whether or not an exception was thrown. In test frameworks, browser cleanup belongs in teardown hooks such as `@AfterMethod`.

## Real-world example

A logistics team checked that a "Recent shipments" table showed no duplicate tracking numbers. The original test compared every row to every other row inside nested loops and wrapped it in a `try/catch (Exception e)` "to make it stable". One day the table failed to load at all, the exception was caught, and the test passed. Rewriting it to collect tracking numbers into a `Set`, assert that the set size equals the row count, and remove the catch made it both shorter and honest.

## Step-by-step walkthrough

1. **Decide what you need**: order (List), uniqueness (Set) or lookup by key (Map).
2. **Program to the interface**: `List<String> names = new ArrayList<>();`.
3. **Collect values from the page** with `findElements` and a loop or stream.
4. **Compare against an expected collection**, ideally created with `List.of`.
5. **Let unexpected exceptions propagate**; add context only by wrapping and rethrowing with the original as the cause.
6. **Close resources** with try-with-resources and quit browsers in teardown.

## Code examples

```java
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.*;

public class CollectionsDemo {

    static Properties loadConfig(String file) {
        try (InputStream in = Files.newInputStream(Path.of(file))) {
            Properties props = new Properties();
            props.load(in);
            return props;
        } catch (IOException e) {
            // add context, keep the original cause
            throw new IllegalStateException("Cannot read config file: " + file, e);
        }
    }

    public static void main(String[] args) {
        List<String> orderIds = List.of("A-100", "A-101", "A-100", "A-102");

        Set<String> seen = new HashSet<>();
        List<String> duplicates = new ArrayList<>();
        for (String id : orderIds) {
            if (!seen.add(id)) duplicates.add(id);   // add() returns false if already present
        }
        System.out.println("Rows: " + orderIds.size() + ", unique: " + seen.size());
        System.out.println("Duplicates: " + duplicates);

        Map<String, Integer> stock = new LinkedHashMap<>();
        stock.put("keyboard", 12);
        stock.put("mouse", 0);
        stock.forEach((item, qty) -> System.out.println(item + " -> " + (qty > 0 ? "in stock" : "sold out")));

        loadConfig("missing.properties");
    }
}
```

## Expected output

Illustrative output; the final lines show how a wrapped exception keeps the original cause:

```text
Rows: 4, unique: 3
Duplicates: [A-100]
keyboard -> in stock
mouse -> sold out
Exception in thread "main" java.lang.IllegalStateException: Cannot read config file: missing.properties
	at CollectionsDemo.loadConfig(CollectionsDemo.java:15)
	at CollectionsDemo.main(CollectionsDemo.java:33)
Caused by: java.nio.file.NoSuchFileException: missing.properties
```

## Common mistakes

- **Using `findElement` to check absence** and catching the exception, instead of asserting `findElements(...).isEmpty()`.
- **Swallowing exceptions** with empty or print-only catch blocks.
- **Catching `Exception` broadly**, which also hides programming errors like `NullPointerException`.
- **Modifying a list while iterating it** with a for-each loop, causing `ConcurrentModificationException`.
- **Adding to an immutable `List.of(...)`**, which throws `UnsupportedOperationException`.
- **Relying on `HashMap` or `HashSet` order**, which is not guaranteed; use `LinkedHashMap` or sort.

## Troubleshooting

- **`IndexOutOfBoundsException`**: the list is shorter than expected; often the page had not finished loading, so wait for the expected count first.
- **`StaleElementReferenceException` while looping elements**: the DOM re-rendered; collect the text you need first, or re-find elements.
- **Unreported checked exception at compile time**: catch it, or add `throws` to the method signature (test methods may declare `throws Exception`).

## Key takeaways summary

Pick the collection that matches the question you are asking: order, uniqueness or lookup. Use `findElements` and collections to check groups of elements, and treat exceptions as information, not noise. Unexpected exceptions should fail the test loudly; that is what makes the [debugging of failing tests](/learn/automation/debugging-failing-tests) fast.
