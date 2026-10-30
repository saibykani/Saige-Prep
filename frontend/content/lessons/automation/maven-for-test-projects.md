---
slug: maven-for-test-projects
title: Maven for test projects
summary: Use Apache Maven to manage dependencies, build and run automated test suites. Learn the pom.xml, the build lifecycle, Surefire, profiles and the commands you will type every day.
level: beginner
duration: 35
tags: [maven, build-tools, java, automation]
objectives:
  - Explain what Maven does and why test projects use it
  - Read and write a pom.xml with test dependencies and plugins
  - Describe the default lifecycle phases and what mvn test runs
  - Run selected tests and pass parameters from the command line
prerequisites:
  - Java basics for testers
  - TestNG or JUnit 5 essentials
related: [java-basics-for-testers, testng-essentials, junit-5-essentials, ci-cd-for-test-engineers]
references:
  - title: Apache Maven — Guides
    url: https://maven.apache.org/guides/
  - title: Apache Maven — Introduction to the build lifecycle
    url: https://maven.apache.org/guides/introduction/introduction-to-the-lifecycle.html
  - title: Maven Surefire Plugin
    url: https://maven.apache.org/surefire/maven-surefire-plugin/
interview:
  - q: What is the difference between mvn test and mvn verify for a test project?
    a: "Both run the default lifecycle up to a phase. mvn test stops after the test phase, where Surefire runs unit-style tests. mvn verify continues through package, integration-test and verify, where Failsafe runs *IT classes and then fails the build if they failed. Failsafe lets post-integration-test cleanup run before reporting failure, which matters when tests start servers or containers."
  - q: What does the scope test mean on a dependency?
    a: "The dependency is on the classpath only when compiling and running test code under src/test, and it is not packaged with or passed on to consumers of the main artifact. TestNG, JUnit, AssertJ and Selenium in a pure test project are commonly test-scoped."
  - q: How do you run a single test class or method with Maven?
    a: "Use the Surefire test property: mvn test -Dtest=LoginTests runs one class, and mvn test -Dtest=LoginTests#validUser runs one method. Patterns such as -Dtest='Login*' also work. For Failsafe the property is -Dit.test."
practice:
  - "Create a new Maven project with TestNG and Selenium as test-scoped dependencies, write one passing test and run it with mvn test."
  - "Add a profile named staging that sets a baseUrl system property, then read it in your test with System.getProperty."
  - "Run mvn dependency:tree and identify which library brings in a transitive dependency you did not declare."
takeaways:
  - The pom.xml declares coordinates, dependencies, plugins and profiles for the project.
  - Running a phase runs every earlier phase in the same lifecycle.
  - Surefire runs tests in the test phase; Failsafe runs integration tests in integration-test and verify.
  - Pin plugin versions so builds behave the same everywhere.
  - Pass environment settings with -D properties or profiles, never by editing code.
quiz:
  - id: mvnt-q1
    type: single
    topic: maven-for-test-projects
    difficulty: beginner
    prompt: You run mvn test. Which phases execute?
    options: ["Only test", "validate, compile, test-compile and the other phases up to and including test", "Every phase including install", "clean and test"]
    answer: [1]
    explanation: "Invoking a phase runs all earlier phases of the default lifecycle first, then that phase. clean belongs to a separate lifecycle and only runs if you ask for it; install comes after test so it is not reached."
  - id: mvnt-q2
    type: truefalse
    topic: maven-for-test-projects
    difficulty: beginner
    prompt: A dependency with scope test is available to code in src/main/java.
    options: ["True", "False"]
    answer: [1]
    explanation: "Test scope puts the library on the test compile and test runtime classpaths only. Main code that imports it will fail to compile."
  - id: mvnt-q3
    type: debugging
    topic: maven-for-test-projects
    difficulty: intermediate
    prompt: "mvn test reports 'Tests run: 0' even though src/test/java contains CheckoutTest.java with TestNG tests. What is the most likely cause?"
    options: ["Maven cannot run TestNG", "The TestNG dependency is missing or not on the test classpath, so Surefire picks no provider", "The class must be named TestCheckout", "Tests only run with mvn install"]
    answer: [1]
    explanation: "Surefire chooses a provider based on test frameworks it finds on the classpath. CheckoutTest already matches the default *Test include pattern, so the name is not the issue; a missing or wrong-scope TestNG dependency is the classic cause."
  - id: mvnt-q4
    type: multiple
    topic: maven-for-test-projects
    difficulty: intermediate
    prompt: Which are valid ways to target the staging environment without editing code?
    options: ["mvn test -DbaseUrl=https://staging.example.test", "mvn test -Pstaging with a staging profile in the pom", "Changing a constant and recompiling", "Setting an environment variable read by the test config"]
    answer: [0, 1, 3]
    explanation: "System properties, profiles and environment variables all keep configuration outside the code. Editing a constant means a code change per environment, which is what configuration is meant to avoid."
---

## Beginner-friendly explanation

Imagine cooking a recipe that needs twenty ingredients from different shops, in specific brands and sizes. You could shop by hand every time, or you could hand a shopping list to a service that fetches the exact items and follows the recipe steps in order.

**Maven** is that service for Java projects. You write a shopping list (the `pom.xml`) naming the libraries you need, such as Selenium and TestNG, and Maven downloads them. It also knows the standard recipe steps: compile the code, compile the tests, run the tests, package the result. You type one command and everything happens in the right order, the same way on your laptop and on the CI server.

## Technical explanation

Apache Maven is a build and dependency management tool built around a **Project Object Model**, the `pom.xml` file.

### Coordinates and dependencies

Every artifact is identified by `groupId`, `artifactId` and `version`. Dependencies are downloaded from a repository (Maven Central by default) into your local repository (`~/.m2/repository`). Libraries your dependencies need, called **transitive dependencies**, are downloaded automatically.

The `scope` controls where a dependency is visible:

| Scope | Compile main | Compile/run tests | Packaged |
|---|---|---|---|
| `compile` (default) | Yes | Yes | Yes |
| `test` | No | Yes | No |
| `provided` | Yes | Yes | No |
| `runtime` | No | Yes (runtime) | Yes |

### Standard layout

```text
my-tests/
  pom.xml
  src/main/java/        framework code (optional in pure test projects)
  src/test/java/        test classes
  src/test/resources/   testng.xml, config files, test data
  target/               build output, including surefire-reports
```

### Lifecycle

The **default lifecycle** includes `validate`, `compile`, `test-compile`, `test`, `package`, `integration-test`, `verify`, `install` and `deploy`. Running a phase runs all earlier ones. `clean` is a separate lifecycle that deletes `target/`.

```mermaid
flowchart LR
  V[validate] --> C[compile] --> TC[test-compile] --> T["test (Surefire)"] --> P[package] --> IT["integration-test (Failsafe)"] --> VE[verify] --> I[install]
```

Plugins do the real work. The **Surefire** plugin runs tests in the `test` phase; by default it includes classes named `Test*`, `*Test`, `*Tests` and `*TestCase`. The **Failsafe** plugin runs `*IT` classes during `integration-test` and fails the build in `verify`.

## Real-world example

A QA team keeps a Selenium suite in its own repository. Developers kept asking "which version of Selenium do I need?" and CI failed because one laptop had an old jar in a `lib/` folder. Moving to Maven fixed this: the `pom.xml` pins Selenium, TestNG and the Surefire version, CI runs `mvn -B clean test -Pstaging`, and the HTML and XML results in `target/surefire-reports` are archived by the pipeline.

## Step-by-step walkthrough

1. Install a JDK and Maven, then check with `mvn -v`.
2. Create the folder layout above and a `pom.xml`.
3. Add test dependencies with `<scope>test</scope>`.
4. Configure Surefire, pinning its version and pointing it to `testng.xml` if you use one.
5. Write a test under `src/test/java` and run `mvn test`.
6. Add profiles or `-D` properties for environments.

## Code examples

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0">
  <modelVersion>4.0.0</modelVersion>
  <groupId>com.example.qa</groupId>
  <artifactId>web-tests</artifactId>
  <version>1.0.0</version>

  <properties>
    <maven.compiler.release>17</maven.compiler.release>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
  </properties>

  <dependencies>
    <dependency>
      <groupId>org.seleniumhq.selenium</groupId>
      <artifactId>selenium-java</artifactId>
      <version>4.25.0</version>
      <scope>test</scope>
    </dependency>
    <dependency>
      <groupId>org.testng</groupId>
      <artifactId>testng</artifactId>
      <version>7.10.2</version>
      <scope>test</scope>
    </dependency>
  </dependencies>

  <build>
    <plugins>
      <plugin>
        <groupId>org.apache.maven.plugins</groupId>
        <artifactId>maven-surefire-plugin</artifactId>
        <version>3.5.2</version>
        <configuration>
          <suiteXmlFiles>
            <suiteXmlFile>src/test/resources/testng.xml</suiteXmlFile>
          </suiteXmlFiles>
        </configuration>
      </plugin>
    </plugins>
  </build>

  <profiles>
    <profile>
      <id>staging</id>
      <properties>
        <baseUrl>https://staging.example.test</baseUrl>
      </properties>
    </profile>
  </profiles>
</project>
```

Versions above are examples; check Maven Central for the current release. A profile property is not automatically a JVM system property; pass it to tests through Surefire's `systemPropertyVariables` (for example `<baseUrl>${baseUrl}</baseUrl>`) or use `-DbaseUrl=...` directly.

```java
public class Config {
    public static final String BASE_URL =
        System.getProperty("baseUrl", "http://localhost:8080");
}
```

Everyday commands:

```bash
mvn clean test                          # fresh build and run all tests
mvn test -Dtest=LoginTests              # one class
mvn test -Dtest=LoginTests#validUser    # one method
mvn test -DbaseUrl=https://qa.example.test
mvn -B verify -Pstaging                 # batch mode, profile, integration tests
mvn dependency:tree                     # who brought in which library
```

## Expected output

```text
[INFO] -------------------------------------------------------
[INFO]  T E S T S
[INFO] -------------------------------------------------------
[INFO] Running com.example.qa.LoginTests
[INFO] Tests run: 2, Failures: 0, Errors: 0, Skipped: 0
[INFO] BUILD SUCCESS
```

## Common mistakes

- **Forgetting `scope`**, so test libraries leak into the packaged artifact.
- **Not pinning plugin versions**, letting builds change behaviour silently.
- **Expecting `mvn test` to run `*IT` classes**; those need Failsafe and `mvn verify`.
- **Hardcoding URLs and credentials** instead of using properties or environment variables.
- **Committing `target/`** or jars into the repository.
- **Mixing JUnit 4, JUnit 5 and TestNG** without understanding which Surefire provider runs which tests.

## Troubleshooting

- **"Tests run: 0"**: check class naming against include patterns, the framework dependency and its scope.
- **Dependency conflict (`NoSuchMethodError`)**: run `mvn dependency:tree` and exclude or align the conflicting version.
- **Corporate network blocks downloads**: configure a mirror or proxy in `~/.m2/settings.xml`.
- **Stale build output**: run `mvn clean test`.

## Key takeaways summary

Maven turns a folder of test code into a reproducible build. The `pom.xml` declares what you need; the lifecycle decides the order; Surefire and Failsafe run your tests and write reports CI can read. Master a handful of commands and properties, and your suite runs identically everywhere.
