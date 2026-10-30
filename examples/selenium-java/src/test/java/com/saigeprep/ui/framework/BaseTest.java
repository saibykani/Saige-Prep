package com.saigeprep.ui.framework;

import org.openqa.selenium.WebDriver;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;

/** A fresh browser per test method: slower than sharing, but no state leaks between tests. */
public abstract class BaseTest {

  protected WebDriver driver;

  @BeforeMethod(alwaysRun = true)
  public void startBrowser() {
    driver = DriverFactory.start();
  }

  @AfterMethod(alwaysRun = true)
  public void stopBrowser() {
    DriverFactory.quit();
  }
}
