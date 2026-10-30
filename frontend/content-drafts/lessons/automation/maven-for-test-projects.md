---
slug: maven-for-test-projects
title: Maven for test projects
summary: Use Maven to manage dependencies, run suites with Surefire, pass configuration from the command line, and plug your tests into a CI pipeline.
level: beginner
duration: 35
tags: [maven, build-tools, java, ci, automation]
objectives:
  - Describe the Maven project layout, POM and coordinates
  - Explain the default lifecycle phases relevant to testing
  - Configure Surefire to run TestNG suites, groups and single tests
  - Pass environment settings from CI to tests with system properties and profiles
prerequisites:
  - Java basics for testers
  - TestNG essentials or JUnit 5 essentials
related: [testng-essentials, junit-5-essentials, git-for-testers, parallel-execution]
references:
  - title: Maven guides
    url: https://maven.apache.org/guides/
  - title: Introduction to the Maven build lifecycle
    url: https://maven.apache.org/guides/introduction/introduction-to-the-lifecycle.html
  - title: Maven Surefire Plugin
    url: https://maven.apache.org/surefire/maven-surefire-plugin/
interview:
  - q: What happens when you run mvn test?
    a: "Maven runs the default lifecycle up to and including the test phase: validate, compile (main code), test-compile, process-test-resources and so on, then test, where the Surefire plugin executes the tests and writes reports to target/surefire-reports. A test failure fails the build unless failures are explicitly ignored."
  - q: How do you run only one test class or one TestNG group from the command line?
    a: "mvn test -Dtest=LoginTests runs a single class, and -Dtest=LoginTests#validLogin runs a single method. For groups, mvn test -Dgroups=smoke filters TestNG groups or JUnit 5 tags. If the pom uses a suiteXmlFiles configuration, the suite file decides what runs, so I usually make the suite file itself configurable with a property."
  - q: How do you pass environment-specific values like the base URL into tests?
    a: "Through system properties: mvn test -DbaseUrl=https://staging.example.test, read with System.getProperty in a config class with a sensible default. Surefire passes -D properties from the command line to the forked test JVM. Secrets come from CI environment variables, never from the pom or the repository. Maven profiles can group a set of values per environment."
practice:
  - "Create a Maven project with selenium-java and testng dependencies, add a Surefire configuration that runs testng.xml, and run mvn clean test."
  - "Make the browser configurable: read System.getProperty('browser', 'chrome') in a driver factory and run the suite with -Dbrowser=firefox."
  - "Run mvn dependency:tree and identify which version of a transitive dependency your project actually uses."
takeaways:
  - The POM declares dependencies and plugins; Maven downloads them from repositories.
  - Tests live in src/test/java, test data in src/test/resources.
  - mvn clean test runs the lifecycle up to test; Surefire executes and reports.
  - Use -Dtest, -Dgroups and system properties to control runs from CI.
  - Never put secrets in the pom; read them from environment variables.
quiz:
  - id: mvn-q1
    type: single
    topic: maven-for-test-projects
    difficulty: beginner
    prompt: Which directory does Maven treat as the location for test source code by default?
    options: ["src/main/java", "src/test/java", "test/java", "target/test-classes"]
    answer: [1]
    explanation: "Maven's standard layout puts test code in src/test/java and compiles it to target/test-classes. src/main/java is production code; target holds build output, not sources."
  - id: mvn-q2
    type: debugging
    topic: maven-for-test-projects
    difficulty: intermediate
    prompt: A developer runs mvn test -Dtest=CheckoutTests, but Maven reports 'Tests run: 0' and the pom configures suiteXmlFiles with testng.xml, which does not include CheckoutTests. What is the most likely reason?
    options: ["Maven cannot run TestNG", "Surefire runs what the suite file defines; the class is not in testng.xml", "The test phase was skipped by default", "-Dtest only works with JUnit 4"]
    answer: [1]
    explanation: "When a suite file is configured, it determines the test selection, so a class missing from it does not run. The fix is to add the class to the suite, or make the suite configurable. Surefire supports TestNG fully and -Dtest is not limited to JUnit 4."
  - id: mvn-q3
    type: multiple
    topic: maven-for-test-projects
    difficulty: intermediate
    prompt: Which phases does mvn verify execute? Select all that apply.
    options: ["compile", "test", "package", "deploy"]
    answer: [0, 1, 2]
    explanation: "Invoking a phase runs every earlier phase in the default lifecycle. verify comes after compile, test and package, but before install and deploy, so deploy does not run."
  - id: mvn-q4
    type: truefalse
    topic: maven-for-test-projects
    difficulty: beginner
    prompt: Test dependencies such as TestNG should normally be declared with the test scope.
    options: ["True", "False"]
    answer: [0]
    explanation: "The test scope makes the dependency available only when compiling and running tests, keeping it out of the main code's classpath and any packaged artifact. In a project that is only tests, everything may live under src/test, so test scope still fits."
---

## Beginner-friendly explanation

Imagine baking from a recipe card. The card lists the ingredients (flour, eggs, sugar) and the steps (mix, bake, cool). You do not grow the wheat yourself; you buy it from the shop.

**Maven** is the recipe card for a Java project. The `pom.xml` file lists the ingredients — libraries like Selenium and TestNG — and Maven fetches them from an online store called a **repository**. Maven also knows the standard steps: compile the code, run the tests, package the result. Anyone, including a CI server, can type `mvn test` and get exactly the same build you get on your laptop.

## Technical explanation

### Project layout and the POM

```text
my-tests/
  pom.xml
  src/test/java/com/shop/tests/LoginTests.java
  src/test/resources/testng.xml
  src/test/resources/testdata/users.csv
  target/                  (generated: classes, reports)
```

A project is identified by **coordinates**: `groupId`, `artifactId`, `version`. Dependencies are declared with the same coordinates and a **scope** (`compile`, `test`, `provided`, `runtime`). Transitive dependencies are pulled in automatically; `mvn dependency:tree` shows the result.

### The lifecycle

The default lifecycle includes, in order: `validate`, `compile`, `test-compile`, `test`, `package`, `verify`, `install`, `deploy` (with smaller phases between). Running a phase runs all earlier phases. `clean` is a separate lifecycle that deletes `target/`.

### Surefire and Failsafe

The **Surefire** plugin runs tests in the `test` phase and writes XML and text reports to `target/surefire-reports`, which CI tools read. The **Failsafe** plugin runs integration tests (by default `*IT` classes) in `integration-test` and `verify`, which lets the build stop servers cleanly before failing. Many UI suites simply use Surefire.

| Command | Effect |
|---|---|
| `mvn clean test` | Fresh build and run all configured tests |
| `mvn test -Dtest=LoginTests` | One class |
| `mvn test -Dtest=LoginTests#validLogin` | One method |
| `mvn test -Dgroups=smoke` | TestNG groups or JUnit tags |
| `mvn test -DbaseUrl=https://staging.example.test` | Pass a system property |
| `mvn test -Pci` | Activate the `ci` profile |

### Maven in CI

```mermaid
flowchart LR
  P["Push or pull request"] --> C["CI checks out code"]
  C --> J["Set up JDK and Maven cache"]
  J --> T["mvn -B clean test -Dheadless=true"]
  T --> R["Publish target/surefire-reports and screenshots"]
  R --> G{"Build green?"}
  G -- yes --> M["Merge allowed"]
  G -- no --> F["Fail the check and notify"]
```

`-B` (batch mode) gives non-interactive, CI-friendly logs.

## Real-world example

A test team's suite passed on one engineer's laptop and failed for everyone else. The cause was a JAR she had added to the IDE classpath by hand years earlier, which was never in the pom. Moving to dependency declarations in `pom.xml` only, with versions pinned in `properties`, made every machine — and the CI agent — build the same way. Running `mvn dependency:tree` later revealed two different Guava versions pulled in transitively, which they fixed with an explicit version.

## Step-by-step walkthrough

1. **Generate or create** a project with the standard layout.
2. **Declare versions as properties** and add `selenium-java` and `testng` dependencies.
3. **Configure Surefire** with your suite file.
4. **Read configuration** (`baseUrl`, `browser`, `headless`) from system properties with defaults.
5. **Run `mvn clean test`** locally, then the same command in CI.
6. **Publish reports** from `target/surefire-reports` as CI artifacts.

## Code examples

A minimal `pom.xml` for a Selenium + TestNG project. Versions shown are examples; check Maven Central for current releases.

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0">
  <modelVersion>4.0.0</modelVersion>
  <groupId>com.shop</groupId>
  <artifactId>ui-tests</artifactId>
  <version>1.0.0</version>

  <properties>
    <maven.compiler.release>17</maven.compiler.release>
    <selenium.version>4.25.0</selenium.version>
    <testng.version>7.10.2</testng.version>
    <suiteXmlFile>src/test/resources/testng.xml</suiteXmlFile>
  </properties>

  <dependencies>
    <dependency>
      <groupId>org.seleniumhq.selenium</groupId>
      <artifactId>selenium-java</artifactId>
      <version>${selenium.version}</version>
      <scope>test</scope>
    </dependency>
    <dependency>
      <groupId>org.testng</groupId>
      <artifactId>testng</artifactId>
      <version>${testng.version}</version>
      <scope>test</scope>
    </dependency>
  </dependencies>

  <build>
    <plugins>
      <plugin>
        <groupId>org.apache.maven.plugins</groupId>
        <artifactId>maven-surefire-plugin</artifactId>
        <version>3.2.5</version>
        <configuration>
          <suiteXmlFiles>
            <suiteXmlFile>${suiteXmlFile}</suiteXmlFile>
          </suiteXmlFiles>
        </configuration>
      </plugin>
    </plugins>
  </build>
</project>
```

Reading configuration in Java, with defaults for local runs:

```java
public final class Config {
    public static final String BASE_URL = System.getProperty("baseUrl", "http://localhost:8080");
    public static final String BROWSER  = System.getProperty("browser", "chrome");
    public static final boolean HEADLESS = Boolean.parseBoolean(System.getProperty("headless", "false"));
    public static final String API_TOKEN = System.getenv("API_TOKEN"); // secret from CI, never committed
    private Config() {}
}
```

Run a different suite file with `mvn test -DsuiteXmlFile=src/test/resources/smoke.xml`.

## Expected output

Illustrative tail of a successful `mvn -B clean test`:

```text
[INFO] -------------------------------------------------------
[INFO]  T E S T S
[INFO] -------------------------------------------------------
[INFO] Running TestSuite
[INFO] Tests run: 12, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 48.31 s -- in TestSuite
[INFO]
[INFO] Results:
[INFO]
[INFO] Tests run: 12, Failures: 0, Errors: 0, Skipped: 0
[INFO]
[INFO] BUILD SUCCESS
```

## Common mistakes

- **Adding JARs manually** to the IDE instead of declaring dependencies.
- **Committing the `target/` folder.** Add it to `.gitignore`.
- **Unpinned or wildcard versions**, making builds non-reproducible.
- **Secrets in `pom.xml`** or `testng.xml`.
- **Using `-DskipTests` or `testFailureIgnore`** in CI and then wondering why failures go unnoticed.
- **An old Surefire version** that does not discover JUnit 5 tests.

## Troubleshooting

- **"Tests run: 0"**: check the suite file contents, the class naming pattern, or JUnit 5 provider compatibility.
- **`Could not resolve dependencies`**: check network or proxy settings in `~/.m2/settings.xml` and that coordinates are spelled correctly.
- **Different results in CI and locally**: compare JDK versions (`mvn -v`), properties passed, and headless window size.
- **Dependency conflicts** (`NoSuchMethodError` at run time): inspect `mvn dependency:tree` and pin the conflicting version.

## Key takeaways summary

Maven makes a test project reproducible: the pom defines what the project needs, the lifecycle defines how it is built, and Surefire runs and reports tests. Drive everything from the command line with properties, and the same command will work on your laptop and in [CI](/learn/sdet/ci-cd-for-test-engineers).
