package com.saigeprep.ui.framework;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.WebDriver;
import org.testng.ITestListener;
import org.testng.ITestResult;

/**
 * Saves a PNG to target/screenshots when a test fails. TestNG calls onTestFailure before the
 * {@code @AfterMethod} that quits the browser, so the page is still open at this point.
 */
public class ScreenshotOnFailureListener implements ITestListener {

  private static final Path DIR = Paths.get("target", "screenshots");
  private static final DateTimeFormatter STAMP = DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss-SSS");

  @Override
  public void onTestFailure(ITestResult result) {
    WebDriver driver = DriverFactory.get();
    if (!(driver instanceof TakesScreenshot camera)) {
      return;
    }
    try {
      Files.createDirectories(DIR);
      String name =
          result.getTestClass().getRealClass().getSimpleName()
              + "_"
              + result.getMethod().getMethodName()
              + "_"
              + LocalDateTime.now().format(STAMP)
              + ".png";
      Path target = DIR.resolve(name);
      Files.write(target, camera.getScreenshotAs(OutputType.BYTES));
      System.out.println("[screenshot] " + target.toAbsolutePath());
    } catch (IOException | RuntimeException e) {
      // A screenshot failure must never hide the real test failure.
      System.err.println("[screenshot] could not save: " + e.getMessage());
    }
  }
}
