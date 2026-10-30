import type { ChoiceQuestion } from "@/content/schema";

/** Code-reading and debugging challenges for the Practice Lab (Java/Selenium/TestNG/RestAssured/Playwright). */
export const CODE_CHALLENGES: (ChoiceQuestion & { title: string })[] = [
  {
    id: "cc-01",
    title: "== vs equals",
    type: "code-output",
    topic: "java-basics-for-testers",
    difficulty: "beginner",
    prompt: "What does this print?",
    codeLanguage: "java",
    code: `String expected = "PASSED";
String actual = new String("PASSED");
System.out.println(actual == expected);
System.out.println(actual.equals(expected));`,
    options: ["true then true", "false then true", "true then false", "false then false"],
    answer: [1],
    explanation:
      "`new String(...)` creates a different object, so `==` (reference comparison) is false. `equals` compares the characters, so it is true. Always compare strings in assertions with equals (or assertEquals).",
  },
  {
    id: "cc-02",
    title: "Loop that crashes",
    type: "debugging",
    topic: "java-collections-and-exceptions",
    difficulty: "beginner",
    prompt: "This loop over 3 search results throws an exception. Why?",
    codeLanguage: "java",
    code: `List<WebElement> results = driver.findElements(By.cssSelector(".result"));
for (int i = 0; i <= results.size(); i++) {
    System.out.println(results.get(i).getText());
}`,
    options: [
      "findElements throws NoSuchElementException when nothing matches",
      "The condition should be i < results.size(); with <= the last iteration asks for index 3 and throws IndexOutOfBoundsException",
      "getText() cannot be called inside a loop",
      "WebElement lists must be iterated with an iterator",
    ],
    answer: [1],
    explanation:
      "Indexes run 0..size-1. `<=` runs one extra time and `get(3)` on a 3-element list throws IndexOutOfBoundsException — a classic off-by-one bug. (Note: findElements returns an empty list rather than throwing.)",
  },
  {
    id: "cc-03",
    title: "Immutable list surprise",
    type: "code-output",
    topic: "java-collections-and-exceptions",
    difficulty: "intermediate",
    prompt: "What happens when this runs?",
    codeLanguage: "java",
    code: `List<Integer> prices = List.of(30, 10, 20);
Collections.sort(prices);
System.out.println(prices);`,
    options: ["[10, 20, 30]", "[30, 10, 20]", "UnsupportedOperationException is thrown", "Compilation error"],
    answer: [2],
    explanation:
      "`List.of(...)` returns an unmodifiable list, so sorting it in place throws UnsupportedOperationException. Copy first: `new ArrayList<>(List.of(...))`, or use `stream().sorted()`.",
  },
  {
    id: "cc-04",
    title: "HashMap overwrite",
    type: "code-output",
    topic: "java-collections-and-exceptions",
    difficulty: "beginner",
    prompt: "What does this print?",
    codeLanguage: "java",
    code: `Map<String, Integer> statusCount = new HashMap<>();
statusCount.put("PASS", 1);
statusCount.put("PASS", 2);
System.out.println(statusCount.size() + " " + statusCount.get("PASS"));`,
    options: ["2 1", "1 2", "2 2", "1 1"],
    answer: [1],
    explanation: "Keys are unique in a map: the second put replaces the value. There is 1 entry, and its value is 2.",
  },
  {
    id: "cc-05",
    title: "Thread.sleep flakiness",
    type: "debugging",
    topic: "waits-and-synchronization",
    difficulty: "intermediate",
    prompt: "This test passes locally but fails ~1 in 10 runs in CI. What is the best fix?",
    codeLanguage: "java",
    code: `driver.findElement(By.id("search")).sendKeys("keyboard");
driver.findElement(By.id("go")).click();
Thread.sleep(2000);
driver.findElement(By.cssSelector(".result")).click();`,
    options: [
      "Increase the sleep to 5000 ms",
      "Wrap the click in a retry loop that catches every exception",
      "Replace the sleep with an explicit wait: new WebDriverWait(driver, Duration.ofSeconds(10)).until(ExpectedConditions.elementToBeClickable(By.cssSelector(\".result\"))).click()",
      "Add driver.navigate().refresh() before the click",
    ],
    answer: [2],
    explanation:
      "A fixed sleep is either too short (flaky on slow CI) or too long (slow suite). An explicit wait polls until the condition is true and proceeds immediately when it is — robust and fast.",
  },
  {
    id: "cc-06",
    title: "Mixed waits",
    type: "scenario",
    topic: "waits-and-synchronization",
    difficulty: "advanced",
    prompt:
      "A framework sets `driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(10))` globally and also uses WebDriverWait(…, 15s) in page objects. Some failures take far longer than expected to time out. What is the explanation?",
    options: [
      "Explicit waits are ignored when an implicit wait is set",
      "Mixing implicit and explicit waits can produce unpredictable wait times; Selenium's documentation advises not to mix them",
      "Implicit waits only apply to Firefox",
      "The explicit wait timeout is added to the page load timeout",
    ],
    answer: [1],
    explanation:
      "Each findElement inside the explicit wait's polling can itself wait for the implicit timeout, so total waits become unpredictable. Pick one strategy — usually explicit waits with implicit wait left at 0.",
  },
  {
    id: "cc-07",
    title: "Brittle locator",
    type: "single",
    topic: "locator-strategies",
    difficulty: "beginner",
    prompt: "Which locator is the most robust choice for the email field?",
    codeLanguage: "html",
    code: `<form class="mt-4 grid">
  <input id="email" name="email" data-testid="login-email" class="input input-lg" />
</form>`,
    options: [
      "By.xpath(\"/html/body/div[2]/div/form/input[1]\")",
      "By.cssSelector(\".input.input-lg\")",
      "By.cssSelector(\"[data-testid='login-email']\")",
      "By.xpath(\"//form/*[1]\")",
    ],
    answer: [2],
    explanation:
      "A dedicated test id is stable across layout and styling changes. Absolute XPaths break when the page structure shifts, and styling classes change with design tweaks. (By.id(\"email\") would also be a good choice.)",
  },
  {
    id: "cc-08",
    title: "Stale element",
    type: "debugging",
    topic: "waits-and-synchronization",
    difficulty: "intermediate",
    prompt: "The last line throws StaleElementReferenceException. Why, and what fixes it?",
    codeLanguage: "java",
    code: `WebElement cartCount = driver.findElement(By.id("cart-count"));
driver.findElement(By.id("add-to-cart")).click();   // page re-renders the header
driver.navigate().refresh();
assertEquals(cartCount.getText(), "1");`,
    options: [
      "The element reference points to the old DOM; find the element again after the refresh",
      "getText() needs an explicit wait for visibility; the reference is fine",
      "assertEquals arguments are in the wrong order",
      "The cart count must be read with getAttribute(\"value\")",
    ],
    answer: [0],
    explanation:
      "After a refresh or re-render, the browser builds new DOM nodes; the old WebElement no longer exists. Locate it again (page objects that look up elements on each use avoid this).",
  },
  {
    id: "cc-09",
    title: "Static driver in parallel",
    type: "debugging",
    topic: "parallel-execution",
    difficulty: "advanced",
    prompt: "With parallel=\"methods\" in testng.xml, tests randomly type into each other's browsers. What's the root cause?",
    codeLanguage: "java",
    code: `public class BaseTest {
    protected static WebDriver driver;

    @BeforeMethod
    public void setUp() { driver = new ChromeDriver(); }

    @AfterMethod
    public void tearDown() { driver.quit(); }
}`,
    options: [
      "ChromeDriver does not support parallel runs",
      "A static field is shared by all threads, so each setUp overwrites the driver other tests are using; use ThreadLocal<WebDriver> (or an instance field per test instance)",
      "@BeforeMethod should be @BeforeClass",
      "driver.quit() should be driver.close()",
    ],
    answer: [1],
    explanation:
      "Parallel threads share static state. Giving each thread its own driver — commonly `ThreadLocal<WebDriver>` — isolates them.",
  },
  {
    id: "cc-10",
    title: "SoftAssert that never fails",
    type: "debugging",
    topic: "testng-essentials",
    difficulty: "intermediate",
    prompt: "Both checks are wrong, yet the test is reported as PASSED. Why?",
    codeLanguage: "java",
    code: `@Test
public void checkoutSummary() {
    SoftAssert soft = new SoftAssert();
    soft.assertEquals(summary.getTotal(), "99.00");
    soft.assertEquals(summary.getItems(), 3);
}`,
    options: [
      "SoftAssert only works with @DataProvider",
      "soft.assertAll() is never called, so the collected failures are never reported",
      "assertEquals needs a message argument",
      "SoftAssert cannot compare numbers",
    ],
    answer: [1],
    explanation: "SoftAssert collects failures and only fails the test when `assertAll()` is called at the end. Without it, failures are silently lost.",
  },
  {
    id: "cc-11",
    title: "Argument order",
    type: "single",
    topic: "testng-essentials",
    difficulty: "beginner",
    prompt: "In TestNG's org.testng.Assert.assertEquals(a, b), which parameter is the actual value?",
    options: ["a (the first argument) — TestNG uses (actual, expected)", "b (the second argument)", "Either; the order never matters", "Neither — TestNG infers it"],
    answer: [0],
    explanation:
      "TestNG is assertEquals(actual, expected), while JUnit 5 is assertEquals(expected, actual). The order does not change pass/fail, but swapping it produces misleading failure messages.",
  },
  {
    id: "cc-12",
    title: "Assertions in page objects",
    type: "scenario",
    topic: "page-object-model",
    difficulty: "intermediate",
    prompt: "A reviewer flags this page object. What is the main design problem?",
    codeLanguage: "java",
    code: `public class LoginPage {
    public void login(String user, String pass) {
        driver.findElement(By.id("user")).sendKeys(user);
        driver.findElement(By.id("pass")).sendKeys(pass);
        driver.findElement(By.id("submit")).click();
        Assert.assertTrue(driver.getCurrentUrl().contains("/dashboard"));
    }
}`,
    options: [
      "Page objects should not use By locators",
      "The assertion inside the page object makes it unusable for negative tests (e.g. wrong password) — keep assertions in tests and return the next page or state",
      "login() should be static",
      "sendKeys must be followed by Keys.ENTER",
    ],
    answer: [1],
    explanation:
      "Page objects model what a user can do; tests decide what should be true. With the assertion baked in, a test for an invalid login fails inside the page object.",
  },
  {
    id: "cc-13",
    title: "RestAssured type mismatch",
    type: "code-output",
    topic: "restassured-fundamentals",
    difficulty: "intermediate",
    prompt: "The API returns {\"id\": 1, \"name\": \"Asha\"}. What happens with this assertion?",
    codeLanguage: "java",
    code: `given()
  .baseUri("https://api.example.test")
.when()
  .get("/users/1")
.then()
  .statusCode(200)
  .body("id", equalTo("1"));`,
    options: [
      "It passes: RestAssured converts types automatically",
      "It fails: the JSON number 1 is read as an Integer, which is not equal to the String \"1\"",
      "It fails because statusCode must come after body",
      "It throws a compilation error",
    ],
    answer: [1],
    explanation: "JSON numbers are deserialised as numbers. Use `equalTo(1)` — type mismatches are a common cause of confusing API test failures.",
  },
  {
    id: "cc-14",
    title: "Missing await",
    type: "debugging",
    topic: "playwright-with-typescript",
    difficulty: "intermediate",
    prompt: "This Playwright test sometimes passes even when the toast never appears. Why?",
    codeLanguage: "ts",
    code: `test("shows a toast after saving", async ({ page }) => {
  await page.getByRole("button", { name: "Save" }).click();
  expect(page.getByText("Saved")).toBeVisible();
});`,
    options: [
      "getByText is not supported for toasts",
      "The web-first assertion is not awaited, so the test can finish before the check completes; write await expect(...).toBeVisible()",
      "toBeVisible needs a timeout argument",
      "click() must be followed by page.waitForTimeout",
    ],
    answer: [1],
    explanation:
      "Playwright's `expect(locator)` assertions are async and retry until they pass or time out. Without `await`, the result is not awaited. Playwright's ESLint rules can catch this.",
  },
  {
    id: "cc-15",
    title: "Division by zero",
    type: "code-output",
    topic: "java-basics-for-testers",
    difficulty: "beginner",
    prompt: "What does this print when no tests ran (count = 0)?",
    codeLanguage: "java",
    code: `int passed = 0, count = 0;
try {
    int rate = passed * 100 / count;
    System.out.println("Pass rate " + rate + "%");
} catch (ArithmeticException e) {
    System.out.println("No tests ran");
}`,
    options: ["Pass rate 0%", "Pass rate NaN%", "No tests ran", "Nothing — the program hangs"],
    answer: [2],
    explanation:
      "Integer division by zero throws ArithmeticException (floating-point division would give NaN or Infinity instead). Reports should handle the empty case explicitly.",
  },
];
