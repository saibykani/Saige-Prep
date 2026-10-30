package com.saigeprep.api.support;

import static org.hamcrest.Matchers.lessThan;

import io.restassured.builder.RequestSpecBuilder;
import io.restassured.builder.ResponseSpecBuilder;
import io.restassured.http.ContentType;
import io.restassured.specification.RequestSpecification;
import io.restassured.specification.ResponseSpecification;
import java.util.concurrent.TimeUnit;

/** Reusable request/response specifications: the RestAssured equivalent of a base API client. */
public final class Specs {

  private Specs() {}

  /** Base request: where the API lives and what we send and accept. */
  public static RequestSpecification base(int port) {
    return new RequestSpecBuilder()
        .setBaseUri("http://localhost")
        .setPort(port)
        .setContentType(ContentType.JSON)
        .setAccept(ContentType.JSON)
        .build();
  }

  /** Base request plus a bearer token in the Authorization header. */
  public static RequestSpecification authenticated(int port, String token) {
    return new RequestSpecBuilder()
        .addRequestSpecification(base(port))
        .addHeader("Authorization", "Bearer " + token)
        .build();
  }

  /** Every response from this API must be JSON and reasonably quick. */
  public static ResponseSpecification jsonResponse() {
    return new ResponseSpecBuilder()
        .expectContentType(ContentType.JSON)
        .expectResponseTime(lessThan(2_000L), TimeUnit.MILLISECONDS)
        .build();
  }
}
