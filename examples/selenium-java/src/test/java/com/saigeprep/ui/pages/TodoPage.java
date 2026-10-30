package com.saigeprep.ui.pages;

import java.util.List;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;

public class TodoPage extends BasePage {

  private static final By WELCOME = testId("welcome");
  private static final By NEW_TODO = testId("new-todo");
  private static final By ADD = testId("add-todo");
  private static final By ERROR = testId("todo-error");
  private static final By ITEMS = testId("todo-item");
  private static final By ITEM_TEXT = testId("todo-text");
  private static final By COUNT = testId("todo-count");
  private static final By LOGOUT = testId("logout");

  public TodoPage(WebDriver driver) {
    super(driver);
  }

  public TodoPage waitUntilLoaded() {
    wait.until(ExpectedConditions.urlContains("todos.html"));
    wait.until(ExpectedConditions.textMatches(WELCOME, java.util.regex.Pattern.compile("Welcome, .+")));
    return this;
  }

  public String welcomeText() {
    return visible(WELCOME).getText();
  }

  /** Adds an item and waits until it is rendered (the app adds it asynchronously). */
  public TodoPage add(String text) {
    int before = itemCount();
    typeAndSubmit(text);
    wait.until(ExpectedConditions.numberOfElementsToBe(ITEMS, before + 1));
    return this;
  }

  /** Submits text that the app should reject and returns the validation message. */
  public String addExpectingError(String text) {
    typeAndSubmit(text);
    return visible(ERROR).getText();
  }

  public TodoPage complete(String text) {
    item(text).findElement(testId("todo-toggle")).click();
    return this;
  }

  public TodoPage delete(String text) {
    WebElement row = item(text);
    row.findElement(testId("todo-delete")).click();
    wait.until(ExpectedConditions.stalenessOf(row));
    return this;
  }

  public boolean isCompleted(String text) {
    return item(text).getAttribute("class").contains("done");
  }

  public List<String> itemTexts() {
    return driver.findElements(ITEM_TEXT).stream().map(WebElement::getText).toList();
  }

  public int itemCount() {
    return driver.findElements(ITEMS).size();
  }

  public String counterText() {
    return visible(COUNT).getText();
  }

  public LoginPage logout() {
    clickable(LOGOUT).click();
    return new LoginPage(driver);
  }

  private void typeAndSubmit(String text) {
    type(NEW_TODO, text);
    clickable(ADD).click();
  }

  private WebElement item(String text) {
    // XPath is the natural fit for "the row whose text is X".
    By row =
        By.xpath(
            "//li[@data-testid='todo-item'][.//span[@data-testid='todo-text' and normalize-space()="
                + xpathLiteral(text)
                + "]]");
    return visible(row);
  }

  /** Safely quotes a string for XPath, including text containing apostrophes. */
  private static String xpathLiteral(String s) {
    if (!s.contains("'")) return "'" + s + "'";
    if (!s.contains("\"")) return "\"" + s + "\"";
    return "concat('" + s.replace("'", "',\"'\",'") + "')";
  }
}
