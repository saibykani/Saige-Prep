package com.saigeprep.ui.tests;

import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertTrue;

import com.saigeprep.ui.framework.BaseTest;
import com.saigeprep.ui.pages.LoginPage;
import com.saigeprep.ui.pages.TodoPage;
import org.testng.annotations.DataProvider;
import org.testng.annotations.Test;

public class LoginTest extends BaseTest {

  @Test(groups = "smoke", description = "A valid user lands on their todo list")
  public void validLoginShowsWelcome() {
    TodoPage todos = new LoginPage(driver).open().loginAs("tester", "Passw0rd!");

    assertEquals(todos.welcomeText(), "Welcome, tester");
    assertEquals(todos.counterText(), "0 items left");
  }

  @DataProvider(name = "invalidLogins")
  public Object[][] invalidLogins() {
    return new Object[][] {
      {"", "Passw0rd!", "Username is required"},
      {"tester", "", "Password is required"},
      {"tester", "wrong-password", "Invalid username or password"},
      {"nobody", "Passw0rd!", "Invalid username or password"},
      {"locked_user", "Passw0rd!", "This account is locked"},
    };
  }

  @Test(
      dataProvider = "invalidLogins",
      groups = "regression",
      description = "Invalid credentials show the right message and stay on the login page")
  public void invalidLoginShowsError(String username, String password, String expectedError) {
    LoginPage login = new LoginPage(driver).open();

    assertEquals(login.loginExpectingError(username, password), expectedError);
    assertTrue(login.isOnLoginPage());
  }

  @Test(groups = "regression", description = "Signing out returns to the login page")
  public void logoutReturnsToLogin() {
    LoginPage login = new LoginPage(driver).open().loginAs("tester", "Passw0rd!").logout();

    assertTrue(login.isOnLoginPage());
  }
}
