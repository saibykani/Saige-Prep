package com.saigeprep.ui.tests;

import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertFalse;
import static org.testng.Assert.assertTrue;

import com.saigeprep.ui.framework.BaseTest;
import com.saigeprep.ui.pages.LoginPage;
import com.saigeprep.ui.pages.TodoPage;
import java.util.List;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

public class TodoTest extends BaseTest {

  private TodoPage todos;

  /** Runs after BaseTest.startBrowser (superclass @BeforeMethod runs first). */
  @BeforeMethod(alwaysRun = true)
  public void signIn() {
    todos = new LoginPage(driver).open().loginAs("tester", "Passw0rd!");
  }

  @Test(groups = "smoke")
  public void addingItemsShowsThemInOrder() {
    todos.add("Write test plan").add("Review bug report");

    assertEquals(todos.itemTexts(), List.of("Write test plan", "Review bug report"));
    assertEquals(todos.counterText(), "2 items left");
  }

  @Test(groups = "regression")
  public void completingAnItemUpdatesTheCounter() {
    todos.add("Run regression suite").add("Triage failures").complete("Run regression suite");

    assertTrue(todos.isCompleted("Run regression suite"));
    assertFalse(todos.isCompleted("Triage failures"));
    assertEquals(todos.counterText(), "1 item left");
  }

  @Test(groups = "regression")
  public void deletingAnItemRemovesIt() {
    todos.add("Flaky test").add("Stable test").delete("Flaky test");

    assertEquals(todos.itemTexts(), List.of("Stable test"));
    assertEquals(todos.counterText(), "1 item left");
  }

  @Test(groups = "regression")
  public void emptyTodoIsRejected() {
    assertEquals(todos.addExpectingError("   "), "Todo text cannot be empty");
    assertEquals(todos.itemCount(), 0);
  }

  @Test(groups = "regression")
  public void duplicateTodoIsRejectedCaseInsensitively() {
    todos.add("Check logs");

    assertEquals(todos.addExpectingError("CHECK LOGS"), "Todo already exists");
    assertEquals(todos.itemCount(), 1);
  }

  @Test(groups = "regression")
  public void textWithApostropheIsHandled() {
    todos.add("Verify user's profile").complete("Verify user's profile");

    assertTrue(todos.isCompleted("Verify user's profile"));
  }
}
