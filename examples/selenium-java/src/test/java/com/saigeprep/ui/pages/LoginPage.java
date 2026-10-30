package com.saigeprep.ui.pages;

import com.saigeprep.ui.framework.AppUrls;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;

public class LoginPage extends BasePage {

  private static final By USERNAME = testId("username");
  private static final By PASSWORD = testId("password");
  private static final By SUBMIT = testId("login-button");
  private static final By ERROR = testId("login-error");

  public LoginPage(WebDriver driver) {
    super(driver);
  }

  public LoginPage open() {
    driver.get(AppUrls.login());
    visible(USERNAME);
    return this;
  }

  /** Happy path: returns the next page object, which waits for itself to load. */
  public TodoPage loginAs(String username, String password) {
    submit(username, password);
    return new TodoPage(driver).waitUntilLoaded();
  }

  /** Unhappy path: stays on this page and returns the error the user sees. */
  public String loginExpectingError(String username, String password) {
    submit(username, password);
    return visible(ERROR).getText();
  }

  public boolean isOnLoginPage() {
    return wait.until(ExpectedConditions.urlContains("login.html"));
  }

  private void submit(String username, String password) {
    type(USERNAME, username);
    type(PASSWORD, password);
    clickable(SUBMIT).click();
  }
}
