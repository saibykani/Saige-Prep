package com.saigeprep.api.support;

import static com.github.tomakehurst.wiremock.client.WireMock.any;
import static com.github.tomakehurst.wiremock.client.WireMock.equalTo;
import static com.github.tomakehurst.wiremock.client.WireMock.get;
import static com.github.tomakehurst.wiremock.client.WireMock.jsonResponse;
import static com.github.tomakehurst.wiremock.client.WireMock.matching;
import static com.github.tomakehurst.wiremock.client.WireMock.matchingJsonPath;
import static com.github.tomakehurst.wiremock.client.WireMock.okJson;
import static com.github.tomakehurst.wiremock.client.WireMock.post;
import static com.github.tomakehurst.wiremock.client.WireMock.urlEqualTo;
import static com.github.tomakehurst.wiremock.client.WireMock.urlPathEqualTo;
import static com.github.tomakehurst.wiremock.client.WireMock.urlPathMatching;

import com.github.tomakehurst.wiremock.junit5.WireMockExtension;

/**
 * Registers WireMock stubs that behave like a tiny "Users API".
 *
 * <p>This is the system under test for the example. In a real project the tests would point at a
 * deployed service; here the service is simulated so the suite is self-contained and repeatable.
 * Stub priority: a LOWER number wins, so specific happy-path stubs use 1 and catch-alls use 5-10.
 */
public final class FakeUserService {

  /** A fake, non-secret token that only exists inside this stub. */
  public static final String TOKEN = "demo-token-not-a-secret";

  /** Demo credentials understood only by the stub. Not real secrets. */
  public static final String USERNAME = "learner";
  public static final String PASSWORD = "correct-horse";

  /** id the fake service assigns to the next created user. */
  public static final int CREATED_ID = 101;

  private static final String LIFECYCLE = "user-lifecycle";
  private static final String CREATED = "Created";

  private static final String ADA =
      "{\"id\":1,\"name\":\"Ada Lovelace\",\"email\":\"ada@example.com\",\"role\":\"admin\",\"active\":true}";
  private static final String GRACE =
      "{\"id\":2,\"name\":\"Grace Hopper\",\"email\":\"grace@example.com\",\"role\":\"tester\",\"active\":true}";
  private static final String ALAN =
      "{\"id\":3,\"name\":\"Alan Turing\",\"email\":\"alan@example.com\",\"role\":\"tester\",\"active\":false}";

  private FakeUserService() {}

  public static void register(WireMockExtension wm) {
    var authorised = equalTo("Bearer " + TOKEN);

    // ---- Auth: POST /api/auth/token ------------------------------------------------------------
    wm.stubFor(
        post(urlEqualTo("/api/auth/token"))
            .atPriority(1)
            .withRequestBody(matchingJsonPath("$.username", equalTo(USERNAME)))
            .withRequestBody(matchingJsonPath("$.password", equalTo(PASSWORD)))
            .willReturn(
                okJson(
                    "{\"access_token\":\""
                        + TOKEN
                        + "\",\"token_type\":\"Bearer\",\"expires_in\":3600}")));
    wm.stubFor(
        post(urlEqualTo("/api/auth/token"))
            .atPriority(5)
            // Never echo the submitted credentials back in an error.
            .willReturn(jsonResponse("{\"error\":\"invalid_credentials\"}", 401)));

    // ---- Anything under /api/users without a valid token -> 401 -----------------------------
    wm.stubFor(
        any(urlPathMatching("/api/users.*"))
            .atPriority(10)
            .willReturn(
                jsonResponse("{\"error\":\"unauthorized\"}", 401)
                    .withHeader("WWW-Authenticate", "Bearer")));

    // ---- GET /api/users ------------------------------------------------------------------------
    wm.stubFor(
        get(urlPathEqualTo("/api/users"))
            .atPriority(1)
            .withHeader("Authorization", authorised)
            .willReturn(
                okJson(
                    "{\"page\":1,\"pageSize\":3,\"total\":3,\"items\":["
                        + ADA
                        + ","
                        + GRACE
                        + ","
                        + ALAN
                        + "]}")));

    // ---- GET /api/users/{id} -------------------------------------------------------------------
    wm.stubFor(
        get(urlPathEqualTo("/api/users/1"))
            .atPriority(1)
            .withHeader("Authorization", authorised)
            .willReturn(okJson(ADA)));
    wm.stubFor(
        get(urlPathMatching("/api/users/[0-9]+"))
            .atPriority(5)
            .withHeader("Authorization", authorised)
            .willReturn(jsonResponse("{\"error\":\"not_found\"}", 404)));

    // ---- POST /api/users (valid) -> 201, and the new user becomes fetchable -----------------
    wm.stubFor(
        post(urlPathEqualTo("/api/users"))
            .atPriority(1)
            .inScenario(LIFECYCLE)
            .willSetStateTo(CREATED)
            .withHeader("Authorization", authorised)
            .withHeader("Content-Type", matching("application/json.*"))
            .withRequestBody(matchingJsonPath("$.name", matching(".{2,}")))
            .withRequestBody(
                matchingJsonPath("$.email", matching("^[^@\\s]+@[^@\\s]+\\.[a-z]{2,}$")))
            .withRequestBody(matchingJsonPath("$.role", matching("tester|admin|viewer")))
            .willReturn(
                jsonResponse(
                        "{\"id\":"
                            + CREATED_ID
                            + ","
                            + "\"name\":\"{{jsonPath request.body '$.name'}}\","
                            + "\"email\":\"{{jsonPath request.body '$.email'}}\","
                            + "\"role\":\"{{jsonPath request.body '$.role'}}\","
                            + "\"active\":true}",
                        201)
                    .withHeader("Location", "/api/users/" + CREATED_ID)
                    .withTransformers("response-template")));

    // ---- POST /api/users (anything else that is authorised) -> 400 ---------------------------
    wm.stubFor(
        post(urlPathEqualTo("/api/users"))
            .atPriority(5)
            .withHeader("Authorization", authorised)
            .willReturn(
                jsonResponse(
                    "{\"error\":\"validation_failed\",\"message\":\"name, email and role are required\"}",
                    400)));

    // ---- GET /api/users/101 only exists after a successful create ----------------------------
    wm.stubFor(
        get(urlPathEqualTo("/api/users/" + CREATED_ID))
            .atPriority(1)
            .inScenario(LIFECYCLE)
            .whenScenarioStateIs(CREATED)
            .withHeader("Authorization", authorised)
            .willReturn(
                okJson(
                    "{\"id\":"
                        + CREATED_ID
                        + ",\"name\":\"Katherine Johnson\",\"email\":\"katherine@example.com\","
                        + "\"role\":\"tester\",\"active\":true}")));
  }
}
