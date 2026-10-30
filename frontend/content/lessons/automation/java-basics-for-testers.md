---
slug: java-basics-for-testers
title: Java basics for testers
summary: The Java you actually need to write test automation — types, strings, conditions, loops and methods — with the traps that most often break test code.
level: beginner
duration: 40
tags: [java, automation, programming-basics]
objectives:
  - Declare variables with the right primitive or reference type
  - Compare strings correctly and explain why == is a trap
  - Write conditions, loops and small methods that make tests readable
  - Read a compiler error or stack trace well enough to fix simple test code
prerequisites:
  - A JDK (17 or later) and an IDE such as IntelliJ IDEA or Eclipse installed
  - Basic manual testing vocabulary (test case, expected result)
related: [java-oop-for-test-automation, java-collections-and-exceptions, testng-essentials, selenium-architecture]
references:
  - title: Java SE documentation (Oracle)
    url: https://docs.oracle.com/en/java/
  - title: Java SE 21 API specification
    url: https://docs.oracle.com/en/java/javase/21/docs/api/index.html
  - title: Selenium documentation
    url: https://www.selenium.dev/documentation/
interview:
  - q: "Why should you compare strings with equals() and not ==?"
    a: "== compares references, so it asks whether two variables point to the same object in memory. equals() compares the characters. Two strings with identical text can be different objects, for example text read from a web element and a literal in the test, so == can return false even when the text matches. In assertions you would normally use assertEquals, which calls equals() for you."
  - q: What is the difference between a primitive type and a reference type in Java?
    a: "Primitives such as int, double and boolean hold the value directly and cannot be null. Reference types such as String, WebElement or Integer hold a reference to an object and can be null. That matters in tests: an Integer that is null will throw a NullPointerException when it is unboxed to an int, and a reference variable you forgot to initialise is a common cause of failures."
  - q: How do you keep test code readable as a beginner?
    a: "Use descriptive names (expectedTotal, not x), keep methods short and doing one thing, extract repeated steps into helper methods, avoid magic numbers by naming constants, and let the assertion message explain what was being checked. Readable code is easier to debug when a test fails at 2 a.m. in CI."
practice:
  - "Write a method that takes a price string such as '1,299.50' from a web page and returns it as a double. Test it with three inputs, including an empty string."
  - "Write a loop that prints the numbers 1 to 20, printing 'boundary' instead of the number for 1, 10 and 20."
  - "Given String a = \"Login\" and String b = new String(\"Login\"), predict the result of a == b and a.equals(b), then run the code and confirm."
takeaways:
  - Use primitives for simple values and reference types for objects; only reference types can be null.
  - Compare string content with equals() (or assertEquals), never with ==.
  - Strings are immutable; methods such as trim() return a new string you must keep.
  - Small, well-named methods turn test steps into readable sentences.
  - Read compiler errors and stack traces from the top line that mentions your own code.
quiz:
  - id: jb-q1
    type: code-output
    topic: java-basics-for-testers
    difficulty: beginner
    prompt: What does this code print?
    code: |
      String expected = "Welcome";
      String actual = new String("Welcome");
      System.out.println(expected == actual);
      System.out.println(expected.equals(actual));
    codeLanguage: java
    options: ["true then true", "false then true", "true then false", "false then false"]
    answer: [1]
    explanation: "new String creates a separate object, so == (reference comparison) is false, while equals() compares characters and is true. The tempting 'true then true' assumes == compares text, which it does not."
  - id: jb-q2
    type: debugging
    topic: java-basics-for-testers
    difficulty: beginner
    prompt: This helper should remove surrounding spaces from text read off a page, but the assertion still fails on ' Total '. Why?
    code: |
      String label = element.getText();   // " Total "
      label.trim();
      assertEquals(label, "Total");
    codeLanguage: java
    options: ["getText() always returns null", "trim() does not change label; its result is discarded", "assertEquals cannot compare strings", "trim() only removes tabs"]
    answer: [1]
    explanation: "Strings are immutable. trim() returns a new trimmed string, but the code ignores the return value, so label still has spaces. The fix is label = label.trim(); (or assert on element.getText().trim())."
  - id: jb-q3
    type: single
    topic: java-basics-for-testers
    difficulty: beginner
    prompt: Which type is the best fit for a count of rows returned in a search results table?
    options: ["boolean", "int", "String", "char"]
    answer: [1]
    explanation: "A row count is a whole number, so int is the natural type. Storing it as a String would force conversions before any numeric comparison, and boolean or char cannot hold a count."
  - id: jb-q4
    type: truefalse
    topic: java-basics-for-testers
    difficulty: beginner
    prompt: A variable declared as int can be assigned null.
    options: ["True", "False"]
    answer: [1]
    explanation: "int is a primitive and cannot be null; the compiler rejects it. The wrapper type Integer can be null, which is why unboxing a null Integer throws NullPointerException."
---

## Beginner-friendly explanation

Think of Java as the language you use to write very precise instructions for a robot tester. A manual test case says "enter the email, click Sign in, check the welcome message". An automated test says exactly the same thing, but in a language a computer can follow without guessing.

You do not need to be a software engineer to start. Most automation code uses a small part of Java: storing values in **variables**, making decisions with **if**, repeating steps with **loops**, and grouping steps into **methods** with good names. Learn those well and you can read and write most test code you will meet.

## Technical explanation

### Types and variables

Java is **statically typed**: every variable has a type checked by the compiler before the code runs.

| Kind | Examples | Holds | Can be null? |
|---|---|---|---|
| Primitive | `int`, `long`, `double`, `boolean`, `char` | The value itself | No |
| Reference | `String`, `Integer`, `WebElement`, `List` | A reference to an object | Yes |

Each primitive has a wrapper class (`int` and `Integer`, `boolean` and `Boolean`). Java converts between them automatically (**autoboxing**), but unboxing a `null` wrapper throws `NullPointerException`.

Use `var` (Java 10+) for local variables when the type is obvious from the right-hand side: `var driver = new ChromeDriver();`.

### Strings

`String` is the type you will use most, because almost everything read from a page is text. Key facts:

- Strings are **immutable**. `trim()`, `toUpperCase()` and `replace()` return a *new* string.
- Compare content with `equals()` or `equalsIgnoreCase()`. `==` compares object identity.
- Useful methods: `contains`, `startsWith`, `split`, `isBlank` (Java 11+), `String.format`.
- Convert text to numbers with `Integer.parseInt` or `Double.parseDouble`; they throw `NumberFormatException` on bad input.

### Control flow and methods

`if / else`, `switch`, `for`, enhanced `for (Type item : collection)` and `while` work as in most languages. A **method** has a return type, a name and parameters. In tests, methods turn low-level steps into intention-revealing names such as `loginAs(user)`.

### Compile time versus run time

The compiler catches type errors (assigning a `String` to an `int`) before anything runs. Run-time problems (a missing element, a null value) appear as **exceptions** with a stack trace. Read a stack trace from the top: the first line names the exception, and the first `at` line from your own package usually shows where to look.

## Real-world example

A retail team automated a check that the basket total on the page equals the sum of line prices. The first version compared the raw strings `"₹1,299.50"` and `"1299.5"` and failed every time, even when the page was correct. The fix was a small, well-tested helper that strips the currency symbol and thousands separators and converts to a number. Once the comparison happened on numbers, the test only failed for real calculation defects — which is the whole point of an automated check.

## Step-by-step walkthrough

1. **Install a JDK** (17 or 21 are long-term-support versions) and confirm with `java -version`.
2. **Create a class** in your IDE; the file name must match the public class name.
3. **Declare variables** with clear names and the narrowest suitable type.
4. **Write a helper method** for any conversion you need more than once.
5. **Run it with sample inputs**, including edge cases such as empty text.
6. **Read any error** from the top of the message and fix one problem at a time.

## Code examples

A price-parsing helper and a tiny driver program that exercises it with normal and edge-case input:

```java
public class PriceParser {

    /** Converts page text such as "₹1,299.50" or " 45 " to a number. */
    public static double parsePrice(String text) {
        if (text == null || text.isBlank()) {
            throw new IllegalArgumentException("Price text is empty");
        }
        String digits = text.replaceAll("[^0-9.]", ""); // keep digits and the decimal point
        return Double.parseDouble(digits);
    }

    public static void main(String[] args) {
        String[] samples = {"₹1,299.50", " 45 ", "0.99"};
        double total = 0;
        for (String sample : samples) {
            double price = parsePrice(sample);
            System.out.println("Parsed '" + sample + "' -> " + price);
            total += price;
        }
        System.out.printf("Total: %.2f%n", total);

        String expected = "Welcome";
        String actual = new String("Welcome");
        System.out.println("== : " + (expected == actual));
        System.out.println("equals : " + expected.equals(actual));
    }
}
```

## Expected output

Illustrative console output when you run `main`:

```text
Parsed '₹1,299.50' -> 1299.5
Parsed ' 45 ' -> 45.0
Parsed '0.99' -> 0.99
Total: 1345.49
== : false
equals : true
```

Calling `parsePrice("")` instead stops with `java.lang.IllegalArgumentException: Price text is empty`, which is far clearer than the `NumberFormatException` you would get otherwise.

## Common mistakes

- **Comparing strings with `==`.** It sometimes appears to work for literals, which makes the bug intermittent and confusing.
- **Ignoring the return value of string methods.** `text.trim();` on its own does nothing useful.
- **Using `String` for numbers** and then comparing `"10"` with `"9"` alphabetically.
- **Catching an exception and doing nothing**, which hides the real cause of a failure.
- **Giant `main` methods or test methods.** Extract helpers with names that describe intent.
- **Hardcoding values repeatedly.** Name them as constants so a change happens in one place.

## Troubleshooting

- **"cannot find symbol"**: a typo, a missing import, or a variable declared inside a block you are outside of.
- **"incompatible types"**: you are assigning one type to another; convert explicitly.
- **`NullPointerException`**: a reference was never assigned. Java 14+ "helpful NullPointerException" messages name the null variable.
- **`NumberFormatException`**: the text contains characters such as commas or currency symbols; clean it first.

## Key takeaways summary

You need a focused slice of Java for automation: types, strings, control flow and methods. Get string comparison and immutability right, convert page text to proper types before asserting, and wrap repeated logic in small, well-named methods. Next, learn how classes and objects organise that code in [OOP for test automation](/learn/automation/java-oop-for-test-automation).
