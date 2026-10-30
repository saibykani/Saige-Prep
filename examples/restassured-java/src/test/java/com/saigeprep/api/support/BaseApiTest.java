package com.saigeprep.api.support;

import static com.github.tomakehurst.wiremock.core.WireMockConfiguration.wireMockConfig;
import static io.restassured.RestAssured.given;

import com.github.tomakehurst.wiremock.junit5.WireMockExtension;
import io.restassured.RestAssured;
import io.restassured.specification.RequestSpecification;
import java.util.Map;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.extension.RegisterExtension;

/**
 * Starts an in-process WireMock server on a random free port for each test class and registers
 * the fake Users API stubs before every test. WireMockExtension resets stubs, request journal and
 * scenario state between tests, so tests stay independent and can run in any order.
 */
public abstract class BaseApiTest {

  @RegisterExtension
  protected static final WireMockExtension API =
      WireMockExtension.newInstance().options(wireMockConfig().dynamicPort()).build();

  @BeforeAll
  static void logOnlyWhenSomethingFails() {
    RestAssured.enableLoggingOfRequestAndResponseIfValidationFails();
  }

  @BeforeEach
  void registerStubs() {
    FakeUserService.register(API);
  }

  protected int port() {
    return API.getPort();
  }

  protected RequestSpecification anonymous() {
    return Specs.base(port());
  }

  protected RequestSpecification authenticated() {
    return Specs.authenticated(port(), obtainToken());
  }

  /** Request chaining step 1: log in and extract the token from the JSON response. */
  protected String obtainToken() {
    return given()
        .spec(anonymous())
        .body(Map.of("username", FakeUserService.USERNAME, "password", FakeUserService.PASSWORD))
        .when()
        .post("/api/auth/token")
        .then()
        .statusCode(200)
        .extract()
        .path("access_token");
  }
}
