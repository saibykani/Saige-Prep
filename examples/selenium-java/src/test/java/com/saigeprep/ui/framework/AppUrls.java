package com.saigeprep.ui.framework;

import java.net.URISyntaxException;
import java.net.URL;

/** Resolves the bundled static app (src/test/resources/app) to file:// URLs. */
public final class AppUrls {

  private AppUrls() {}

  public static String page(String name) {
    URL url = AppUrls.class.getResource("/app/" + name);
    if (url == null) {
      throw new IllegalStateException("Missing test app page on classpath: /app/" + name);
    }
    try {
      return url.toURI().toString();
    } catch (URISyntaxException e) {
      throw new IllegalStateException(e);
    }
  }

  public static String login() {
    return page("login.html");
  }
}
