package com.saigeprep.ui.framework;

import java.time.Duration;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.edge.EdgeDriver;
import org.openqa.selenium.edge.EdgeOptions;

/**
 * Creates one browser per thread. ThreadLocal is what makes TestNG parallel execution safe: two
 * test classes running at once each get their own WebDriver.
 *
 * <p>No driver binaries are bundled or downloaded by this code. Selenium Manager (built into
 * Selenium 4.6+) finds the installed browser and resolves a matching driver automatically.
 */
public final class DriverFactory {

  private static final ThreadLocal<WebDriver> DRIVER = new ThreadLocal<>();

  private DriverFactory() {}

  public static WebDriver start() {
    boolean headless = Boolean.parseBoolean(System.getProperty("headless", "true"));
    String browser = System.getProperty("browser", "chrome").toLowerCase();

    WebDriver driver =
        switch (browser) {
          case "edge" -> {
            EdgeOptions options = new EdgeOptions();
            if (headless) options.addArguments("--headless=new");
            options.addArguments("--window-size=1280,900");
            yield new EdgeDriver(options);
          }
          case "chrome" -> {
            ChromeOptions options = new ChromeOptions();
            if (headless) options.addArguments("--headless=new");
            options.addArguments("--window-size=1280,900", "--disable-gpu", "--no-first-run");
            yield new ChromeDriver(options);
          }
          default -> throw new IllegalArgumentException("Unsupported browser: " + browser);
        };

    // Explicit waits only: keep the implicit wait at zero so the two never mix.
    driver.manage().timeouts().implicitlyWait(Duration.ZERO);
    driver.manage().timeouts().pageLoadTimeout(Duration.ofSeconds(30));
    DRIVER.set(driver);
    return driver;
  }

  /** The current thread's driver, or null if none is running. */
  public static WebDriver get() {
    return DRIVER.get();
  }

  public static void quit() {
    WebDriver driver = DRIVER.get();
    if (driver != null) {
      try {
        driver.quit();
      } finally {
        DRIVER.remove();
      }
    }
  }
}
