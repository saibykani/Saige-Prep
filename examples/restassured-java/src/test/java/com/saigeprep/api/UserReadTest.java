package com.saigeprep.api;

import static io.restassured.RestAssured.given;
import static io.restassured.module.jsv.JsonSchemaValidator.matchesJsonSchemaInClasspath;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.everyItem;
import static org.hamcrest.Matchers.hasItems;
import static org.hamcrest.Matchers.hasSize;

import com.saigeprep.api.support.BaseApiTest;
import com.saigeprep.api.support.Specs;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("Users: read endpoints")
class UserReadTest extends BaseApiTest {

  @Test
  @DisplayName("GET /api/users/1 returns 200 and the expected user")
  void getSingleUser() {
    given()
        .spec(authenticated())
        .pathParam("id", 1)
        .when()
        .get("/api/users/{id}")
        .then()
        .spec(Specs.jsonResponse())
        .statusCode(200)
        .body("id", equalTo(1))
        .body("name", equalTo("Ada Lovelace"))
        .body("email", containsString("@"))
        .body("active", equalTo(true));
  }

  @Test
  @DisplayName("GET /api/users/1 matches the user JSON schema")
  void singleUserMatchesSchema() {
    given()
        .spec(authenticated())
        .when()
        .get("/api/users/1")
        .then()
        .statusCode(200)
        .body(matchesJsonSchemaInClasspath("schemas/user.schema.json"));
  }

  @Test
  @DisplayName("GET /api/users returns a paginated list that matches its schema")
  void listUsers() {
    given()
        .spec(authenticated())
        .when()
        .get("/api/users")
        .then()
        .spec(Specs.jsonResponse())
        .statusCode(200)
        .body(matchesJsonSchemaInClasspath("schemas/user-list.schema.json"))
        .body("total", equalTo(3))
        .body("items", hasSize(3))
        .body("items.name", hasItems("Grace Hopper", "Alan Turing"))
        .body("items.email", everyItem(containsString("@example.com")))
        // GPath filter: names of inactive users only
        .body("items.findAll { !it.active }.name", hasItems("Alan Turing"));
  }

  @Test
  @DisplayName("GET an unknown user returns 404 with an error body")
  void unknownUserReturns404() {
    given()
        .spec(authenticated())
        .when()
        .get("/api/users/999")
        .then()
        .spec(Specs.jsonResponse())
        .statusCode(404)
        .body("error", equalTo("not_found"));
  }

  @Test
  @DisplayName("GET without an Authorization header returns 401")
  void missingTokenReturns401() {
    given()
        .spec(anonymous())
        .when()
        .get("/api/users/1")
        .then()
        .statusCode(401)
        .header("WWW-Authenticate", "Bearer")
        .body("error", equalTo("unauthorized"));
  }

  @Test
  @DisplayName("GET with an invalid token returns 401")
  void invalidTokenReturns401() {
    given()
        .spec(Specs.authenticated(port(), "not-a-valid-token"))
        .when()
        .get("/api/users")
        .then()
        .statusCode(401);
  }
}
