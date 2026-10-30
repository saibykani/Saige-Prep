package com.saigeprep.api;

import static io.restassured.RestAssured.given;
import static io.restassured.module.jsv.JsonSchemaValidator.matchesJsonSchemaInClasspath;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.not;

import com.saigeprep.api.support.BaseApiTest;
import com.saigeprep.api.support.FakeUserService;
import com.saigeprep.api.support.Specs;
import java.util.Map;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("Auth: POST /api/auth/token")
class AuthTest extends BaseApiTest {

  @Test
  @DisplayName("valid credentials issue a bearer token that matches the token schema")
  void validCredentialsIssueToken() {
    given()
        .spec(anonymous())
        .body(Map.of("username", FakeUserService.USERNAME, "password", FakeUserService.PASSWORD))
        .when()
        .post("/api/auth/token")
        .then()
        .spec(Specs.jsonResponse())
        .statusCode(200)
        .body(matchesJsonSchemaInClasspath("schemas/token.schema.json"))
        .body("token_type", equalTo("Bearer"))
        .body("expires_in", equalTo(3600));
  }

  @Test
  @DisplayName("wrong password returns 401 and does not echo the submitted password")
  void wrongPasswordIsRejected() {
    String body =
        given()
            .spec(anonymous())
            .body(Map.of("username", FakeUserService.USERNAME, "password", "wrong-password"))
            .when()
            .post("/api/auth/token")
            .then()
            .spec(Specs.jsonResponse())
            .statusCode(401)
            .body("error", equalTo("invalid_credentials"))
            .extract()
            .asString();

    assertThat(body, not(containsString("wrong-password")));
  }
}
