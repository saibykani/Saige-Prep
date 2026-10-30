package com.saigeprep.ui.pages;

import java.time.Duration;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

/** Shared wait helpers. Page objects expose intent ("login as"), never raw locators. */
public abstract class BasePage {

  protected final WebDriver driver;
  protected final WebDriverWait wait;

  protected BasePage(WebDriver driver) {
    this.driver = driver;
    this.wait = new WebDriverWait(driver, Duration.ofSeconds(5));
  }

  protected WebElement visible(By locator) {
    return wait.until(ExpectedConditions.visibilityOfElementLocated(locator));
  }

  protected WebElement clickable(By locator) {
    return wait.until(ExpectedConditions.elementToBeClickable(locator));
  }

  protected void type(By locator, String text) {
    WebElement field = visible(locator);
    field.clear();
    if (text != null && !text.isEmpty()) {
      field.sendKeys(text);
    }
  }

  protected static By testId(String id) {
    return By.cssSelector("[data-testid='" + id + "']");
  }
}
