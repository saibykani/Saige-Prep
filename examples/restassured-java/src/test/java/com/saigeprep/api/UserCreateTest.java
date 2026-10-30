package com.saigeprep.api;

import static com.github.tomakehurst.wiremock.client.WireMock.exactly;
import static com.github.tomakehurst.wiremock.client.WireMock.matchingJsonPath;
import static com.github.tomakehurst.wiremock.client.WireMock.postRequestedFor;
import static com.github.tomakehurst.wiremock.client.WireMock.urlPathEqualTo;
import static io.restassured.RestAssured.given;
import static io.restassured.module.jsv.JsonSchemaValidator.matchesJsonSchemaInClasspath;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.endsWith;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.not;
import static org.junit.jupiter.api.Assertions.assertEquals;

import com.github.tomakehurst.wiremock.client.WireMock;
import com.saigeprep.api.support.BaseApiTest;
import com.saigeprep.api.support.FakeUserService;
import com.saigeprep.api.support.Specs;
import io.restassured.response.Response;
import io.restassured.specification.RequestSpecification;
import java.util.Map;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

@DisplayName("Users: create endpoint")
class UserCreateTest extends BaseApiTest {

  private static final Map<String, String> KATHERINE =
      Map.of("name", "Katherine Johnson", "email", "katherine@example.com", "role", "tester");

  @Test
  @DisplayName("POST /api/users returns 201, a Location header and the created user")
  void createUser() {
    given()
        .spec(authenticated())
        .body(KATHERINE)
        .when()
        .post("/api/users")
        .then()
        .spec(Specs.jsonResponse())
        .statusCode(201)
        .header("Location", endsWith("/api/users/" + FakeUserService.CREATED_ID))
        .body(matchesJsonSchemaInClasspath("schemas/user.schema.json"))
        .body("name", equalTo("Katherine Johnson"))
        .body("email", equalTo("katherine@example.com"));

    // Contract check on the outgoing request: exactly one POST carrying the expected fields.
    API.verify(
        exactly(1),
        postRequestedFor(urlPathEqualTo("/api/users"))
            .withHeader("Authorization", WireMock.equalTo("Bearer " + FakeUserService.TOKEN))
            .withRequestBody(
                matchingJsonPath("$.email", WireMock.equalTo("katherine@example.com"))));
  }

  @Test
  @DisplayName("chaining: token -> create -> fetch the created user via the returned Location")
  void createThenFetch() {
    RequestSpecification auth = authenticated(); // step 1: log in, extract token

    // Before the create, the user does not exist.
    given()
        .spec(auth)
        .when()
        .get("/api/users/" + FakeUserService.CREATED_ID)
        .then()
        .statusCode(404);

    // Step 2: create, then extract the id and Location from the response.
    Response created =
        given()
            .spec(auth)
            .body(KATHERINE)
            .when()
            .post("/api/users")
            .then()
            .statusCode(201)
            .extract()
            .response();
    int id = created.path("id");
    String location = created.header("Location");

    // Step 3: feed the extracted values into the next request.
    given()
        .spec(auth)
        .when()
        .get(location)
        .then()
        .statusCode(200)
        .body("id", equalTo(id))
        .body("name", equalTo(KATHERINE.get("name")));

    assertEquals(FakeUserService.CREATED_ID, id);
  }

  @ParameterizedTest(name = "invalid payload #{index}: {0}")
  @ValueSource(
      strings = {
        "{\"name\":\"No Email\",\"role\":\"tester\"}",
        "{\"name\":\"Bad Email\",\"email\":\"not-an-email\",\"role\":\"tester\"}",
        "{\"name\":\"Bad Role\",\"email\":\"bad.role@example.com\",\"role\":\"superuser\"}",
        "{}"
      })
  @DisplayName("POST /api/users with invalid payloads returns 400 without echoing input")
  void invalidPayloadsReturn400(String payload) {
    given()
        .spec(authenticated())
        .body(payload)
        .when()
        .post("/api/users")
        .then()
        .spec(Specs.jsonResponse())
        .statusCode(400)
        .body("error", equalTo("validation_failed"))
        .body(not(containsString("not-an-email")));
  }

  @Test
  @DisplayName("POST /api/users without a token returns 401 and creates nothing")
  void createWithoutTokenReturns401() {
    given().spec(anonymous()).body(KATHERINE).when().post("/api/users").then().statusCode(401);

    given()
        .spec(authenticated())
        .when()
        .get("/api/users/" + FakeUserService.CREATED_ID)
        .then()
        .statusCode(404);
  }
}
