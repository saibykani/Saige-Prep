---
slug: docker-for-testers
title: Docker for Testers
summary: Use Docker to give tests consistent, disposable environments - build images with a Dockerfile, start databases and services with Docker Compose, run browsers with Selenium Grid containers, and manage containers from tests with Testcontainers.
level: intermediate
duration: 40
tags: [docker, containers, test-environments, selenium-grid]
objectives:
  - Explain images, containers, layers, ports and volumes in plain terms
  - Write a Dockerfile that runs a test suite reproducibly
  - Start test dependencies with Docker Compose and wait for them to be healthy
  - Run browser tests against Selenium Grid containers and describe what Testcontainers adds
prerequisites:
  - Command-line basics
  - Running an automated test suite locally
related: [ci-cd-for-test-engineers, github-actions-for-tests, jenkins-pipelines-for-tests, selenium-architecture, parallel-execution, database-testing]
references:
  - title: Docker documentation
    url: https://docs.docker.com/
  - title: Docker Compose documentation
    url: https://docs.docker.com/compose/
  - title: Selenium Grid documentation
    url: https://www.selenium.dev/documentation/grid/
  - title: Docker images for Selenium Grid (SeleniumHQ/docker-selenium)
    url: https://github.com/SeleniumHQ/docker-selenium
  - title: Testcontainers
    url: https://testcontainers.com/
interview:
  - q: What is the difference between a Docker image and a container?
    a: An image is a read-only template built in layers, for example from a Dockerfile, containing a file system and default command. A container is a running (or stopped) instance of an image with its own writable layer, network and process space. You can start many containers from one image, and deleting a container does not change the image, which is why containers are good disposable test environments.
  - q: How would you use Docker to make API tests reliable in CI?
    a: I would declare the service's dependencies, such as the database and a message broker, in a Compose file with pinned image tags and health checks, start them before the tests, and wait until they are healthy rather than sleeping. Each run starts from a clean state, with schema and seed data applied by migrations or init scripts. For tests that need their own isolated dependency, Testcontainers can start a container per test class from inside the test code and remove it afterwards. Logs from the containers are saved as CI artifacts on failure.
  - q: "System design: how would you run 500 UI tests across Chrome and Firefox quickly?"
    a: I would run a Selenium Grid in containers, with a hub or router and several browser nodes from the official selenium images, or a dynamic grid that starts a browser container per session. Tests use RemoteWebDriver pointing at the grid and are parallelised by the test runner, with each test fully independent in data and session. Node count is sized to the CI machine's CPU and memory, browser containers get enough shared memory, and video or screenshots are kept for failures. I would still keep most coverage below the UI so the grid only runs journeys that need a real browser.
practice:
  - "Write a compose.yaml that starts PostgreSQL with a health check, and a script that runs your tests only after it reports healthy."
  - "Start selenium/standalone-chrome locally, point one existing WebDriver test at http://localhost:4444 using RemoteWebDriver, and watch it through the noVNC viewer."
  - "Convert one database integration test to use Testcontainers instead of a shared database and compare how isolated it is."
takeaways:
  - An image is a template; a container is a disposable running instance of it.
  - Pin image versions so every run uses the same environment.
  - Docker Compose declares a whole test environment in one file; use health checks instead of sleeps.
  - Official selenium images provide standalone browsers or a full grid on port 4444.
  - Testcontainers lets test code start and clean up real dependencies per test run.
quiz:
  - id: sdet-docker-q1
    type: single
    topic: docker-for-testers
    difficulty: beginner
    prompt: What does the -p 5432:5432 option do in docker run -p 5432:5432 postgres:16?
    options:
      - "Sets the PostgreSQL password"
      - "Publishes container port 5432 on host port 5432 so tools on the host can connect"
      - "Limits the container to 5432 MB of memory"
      - "Runs 5432 copies of the container"
    answer: [1]
    explanation: The -p flag maps HOST:CONTAINER ports. Without it the database would only be reachable from other containers on the same network, not from tests running on the host.
  - id: sdet-docker-q2
    type: scenario
    topic: docker-for-testers
    difficulty: intermediate
    prompt: Tests in CI fail intermittently with "connection refused" because they start before the database inside Compose is ready. What is the best fix?
    options:
      - "Add sleep 30 before running the tests"
      - "Add a healthcheck to the database service and make dependents wait with depends_on condition service_healthy, or have the test script poll until healthy"
      - "Remove the database and mock every query"
      - "Run the tests twice and keep the second result"
    answer: [1]
    explanation: A health check reports real readiness. A fixed sleep is either too long (slow) or too short (still flaky), and retrying the whole run hides the problem rather than fixing it.
  - id: sdet-docker-q3
    type: truefalse
    topic: docker-for-testers
    difficulty: beginner
    prompt: Deleting a container also deletes the image it was created from.
    options: ["True", "False"]
    answer: [1]
    explanation: Images and containers are separate objects. Removing a container discards only its writable layer; the image stays available to start new containers.
  - id: sdet-docker-q4
    type: multiple
    topic: docker-for-testers
    difficulty: intermediate
    prompt: Which practices make Docker-based test environments more reproducible? Select all that apply.
    options:
      - "Pinning image tags such as postgres:16.4 instead of latest"
      - "Using health checks before starting tests"
      - "Sharing one long-lived database container across all pipelines without resetting data"
      - "Keeping the Dockerfile and compose file in version control"
    answer: [0, 1, 3]
    explanation: Pinned tags, readiness checks and versioned definitions make every run start from the same state. A shared, never-reset container accumulates data from other runs and is a classic source of flaky, order-dependent tests.
---

## Beginner-friendly explanation

Think of a **shipping container**. Whatever is inside, it has the same shape, so any ship, train or truck can carry it. You can load one, use it and throw it away.

**Docker** does the same for software. It packages an application or tool together with everything it needs to run into a standard box. For a tester that means: "the database version my tests expect", "a Chrome browser exactly like the one in CI" or "the whole test suite with its Java version" can be started anywhere in seconds, used, and thrown away. No more "it works on my machine".

## Technical explanation

| Term | Meaning |
|---|---|
| **Image** | A read-only, layered template (file system plus default command), identified by `name:tag` |
| **Container** | A running or stopped instance of an image, with its own writable layer |
| **Dockerfile** | Instructions (`FROM`, `COPY`, `RUN`, `CMD`) used by `docker build` to create an image |
| **Registry** | A store of images, such as Docker Hub |
| **Port publishing** | `-p HOST:CONTAINER` exposes a container port on the host |
| **Volume** | Storage that outlives a container, or a host folder mounted into it |
| **Compose** | `docker compose` reads a `compose.yaml` and starts several containers on a shared network |

Containers share the host's kernel, so they start faster and use fewer resources than full virtual machines, but they are not a security boundary as strong as a VM.

### Where testers use Docker

1. **Running the test suite in a fixed toolchain.** A Dockerfile pins the language and browser versions so local and CI runs match.
2. **Test dependencies.** Databases, caches, message brokers and mock servers declared in Compose, started fresh per run.
3. **Browsers.** The Selenium project publishes official images: `selenium/standalone-chrome`, `selenium/standalone-firefox` and others for a single browser, or `selenium/hub` with `selenium/node-chrome` and similar nodes for a grid. The grid listens on port 4444 and the images include a noVNC viewer (port 7900) for watching sessions.
4. **Testcontainers.** A library (available for Java, .NET, Go, Node.js, Python and other languages) that starts throwaway containers from inside test code and removes them afterwards.

```mermaid
flowchart LR
  T["Test runner (RemoteWebDriver)"] -->|"port 4444"| H["selenium/hub"]
  H --> C["selenium/node-chrome"]
  H --> F["selenium/node-firefox"]
  T -->|"JDBC"| D["postgres container"]
```

## Real-world example

A team's integration tests relied on a shared test database that several pipelines and people used at once. Tests failed when someone else's data collided with theirs, and nobody could reproduce failures. They moved the database into a Compose file with a pinned PostgreSQL image, an init script for schema and seed data, and a health check. Every CI run started a fresh database and destroyed it afterwards. The data collisions disappeared, and anyone could reproduce a CI failure locally with one command.

## Step-by-step walkthrough

1. Install Docker and confirm with `docker version`.
2. Run a dependency directly: `docker run -d --name db -e POSTGRES_PASSWORD=test -p 5432:5432 postgres:16`.
3. Move it into `compose.yaml` with a health check.
4. Add browsers from the official selenium images if you run UI tests.
5. Start everything with `docker compose up -d --wait` (the `--wait` flag waits for services to be running or healthy).
6. Run tests against `localhost` ports, then tear down with `docker compose down -v` to remove containers and volumes.

## Code examples

A Compose file for a database and a small Selenium Grid. Pin the selenium tags to a specific release in real projects; check the docker-selenium repository for current tags.

```yaml
# compose.yaml
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_PASSWORD: test
      POSTGRES_DB: shop_test
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 2s
      retries: 30

  selenium-hub:
    image: selenium/hub:latest
    ports:
      - "4444:4444"

  chrome:
    image: selenium/node-chrome:latest
    shm_size: 2gb
    depends_on:
      - selenium-hub
    environment:
      SE_EVENT_BUS_HOST: selenium-hub
      SE_EVENT_BUS_PUBLISH_PORT: "4442"
      SE_EVENT_BUS_SUBSCRIBE_PORT: "4443"
```

A Dockerfile that runs a Maven test suite in a fixed toolchain:

```dockerfile
FROM maven:3.9-eclipse-temurin-21
WORKDIR /tests
COPY pom.xml .
RUN mvn -B dependency:go-offline
COPY src ./src
CMD ["mvn", "-B", "test"]
```

Copying `pom.xml` first means the dependency layer is cached and only rebuilt when dependencies change.

A Testcontainers (Java, JUnit 5) test that gets its own PostgreSQL:

```java
@Testcontainers
class OrderRepositoryIT {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16");

    @Test
    void savesAndLoadsAnOrder() {
        OrderRepository repo = new OrderRepository(
            postgres.getJdbcUrl(), postgres.getUsername(), postgres.getPassword());
        repo.save(new Order("A-1", 2));
        assertEquals(2, repo.find("A-1").quantity());
    }
}
```

## Expected output

After `docker compose up -d --wait`, `docker compose ps` lists each service with a running status, and the database shows as healthy:

```text
NAME                  SERVICE        STATUS
shop-db-1             db             Up 12 seconds (healthy)
shop-selenium-hub-1   selenium-hub   Up 12 seconds
shop-chrome-1         chrome         Up 11 seconds
```

The exact column layout varies by Docker version, and names are prefixed with your project folder name. Opening `http://localhost:4444` shows the Grid UI with one Chrome node registered.

## Common mistakes

- **Using `latest` tags in CI**, so the environment changes silently between runs.
- **`sleep` instead of health checks**, which is slow and still flaky.
- **Forgetting shared memory for browsers.** Chrome in a container can crash with the small default `/dev/shm`; set `shm_size: 2gb` as the Selenium images' documentation recommends.
- **Connecting to `localhost` from inside another container.** Inside the Compose network, use the service name (`db`, `selenium-hub`).
- **Leaving volumes behind**, so "fresh" databases still contain old data. Use `down -v`.
- **Baking secrets into images.** Pass them at runtime through environment variables or secret stores.

## Troubleshooting

- **Port already in use.** Another process or container holds the host port; stop it or map a different host port.
- **Container exits immediately.** Run `docker compose logs <service>` to see why; often a missing required environment variable.
- **Grid shows no nodes.** Check the event bus variables on the node and that both services share the Compose network.
- **Testcontainers cannot find Docker in CI.** The runner needs access to a Docker daemon; check the CI provider's documentation for Docker support.

## Key takeaways summary

Docker turns environments into code. Pin images, declare dependencies in Compose with health checks, use the official selenium images for browsers, and use Testcontainers when each test needs its own real dependency. The payoff is reproducible runs and failures you can recreate with one command.
