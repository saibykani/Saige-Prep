/**
 * Curriculum map: tracks → modules → topics. Each topic slug corresponds to an optional
 * lesson file at content/lessons/<track>/<slug>.md. Topics without a file are shown
 * honestly as "not written yet" rather than with placeholder text.
 */

export interface Topic {
  slug: string;
  title: string;
}

export interface Module {
  slug: string;
  title: string;
  description: string;
  /** Core path (needed by most roles in this track) vs optional specialisation. */
  path: "core" | "optional";
  topics: Topic[];
}

export interface Track {
  slug: string;
  title: string;
  /** Route of the track page (matches src/lib/navigation.ts). */
  href: string;
  description: string;
  /** Sub-track shown as a tab inside its parent track (e.g. JMeter inside Performance). */
  parent?: string;
  modules: Module[];
}

const t = (slug: string, title: string): Topic => ({ slug, title });

export const TRACKS: Track[] = [
  {
    slug: "manual-testing",
    title: "Manual Testing",
    href: "/learn/manual-testing",
    description:
      "The foundation for every testing role: how testing works, how to design tests, document them, manage defects and work in Agile teams.",
    modules: [
      {
        slug: "fundamentals",
        title: "Module 1 · Software testing fundamentals",
        description: "What testing is, why it matters, and the vocabulary every tester uses.",
        path: "core",
        topics: [
          t("what-is-software-testing", "What is software testing?"),
          t("why-testing-is-required", "Why testing is required"),
          t("qa-qc-and-testing", "QA, QC and testing"),
          t("verification-vs-validation", "Verification versus validation"),
          t("error-defect-bug-failure", "Error, defect, bug, failure and root cause"),
          t("sdlc-and-stlc", "SDLC and STLC"),
          t("seven-testing-principles", "The seven testing principles"),
          t("testing-objectives-and-limitations", "Testing objectives and limitations"),
          t("static-vs-dynamic-testing", "Static and dynamic testing"),
          t("black-white-gray-box-testing", "Black-box, white-box and gray-box testing"),
        ],
      },
      {
        slug: "types-and-levels",
        title: "Module 2 · Testing types and levels",
        description: "Where each kind of testing fits, from unit tests to acceptance and beyond.",
        path: "core",
        topics: [
          t("unit-and-component-testing", "Unit and component testing"),
          t("integration-testing", "Integration testing"),
          t("system-and-end-to-end-testing", "System and end-to-end testing"),
          t("acceptance-alpha-beta-testing", "Acceptance, alpha and beta testing"),
          t("functional-vs-non-functional-testing", "Functional versus non-functional testing"),
          t("regression-testing", "Regression testing"),
          t("retesting-and-confirmation-testing", "Retesting and confirmation testing"),
          t("smoke-and-sanity-testing", "Smoke and sanity testing"),
          t("exploratory-and-ad-hoc-testing", "Exploratory and ad hoc testing"),
          t("compatibility-and-installation-testing", "Compatibility and installation testing"),
          t("recovery-reliability-availability-testing", "Recovery, reliability and availability testing"),
          t("risk-based-testing", "Risk-based testing"),
        ],
      },
      {
        slug: "test-design-techniques",
        title: "Module 3 · Test design techniques",
        description: "Systematic ways to choose a small set of tests that finds the most defects.",
        path: "core",
        topics: [
          t("equivalence-partitioning", "Equivalence partitioning"),
          t("boundary-value-analysis", "Boundary value analysis"),
          t("decision-table-testing", "Decision table testing"),
          t("state-transition-testing", "State transition testing"),
          t("use-case-testing", "Use-case testing"),
          t("pairwise-and-combinatorial-testing", "Pairwise and combinatorial testing"),
          t("error-guessing", "Error guessing"),
          t("exploratory-testing-charters", "Exploratory testing charters"),
          t("positive-and-negative-testing", "Positive and negative testing"),
          t("risk-based-scenario-selection", "Risk-based scenario selection"),
          t("test-data-design", "Test data design"),
        ],
      },
      {
        slug: "test-documentation",
        title: "Module 4 · Test documentation",
        description: "Strategies, plans, cases, traceability and reports that teams actually use.",
        path: "core",
        topics: [
          t("test-strategy-vs-test-plan", "Test strategy versus test plan"),
          t("test-scenarios-and-test-cases", "Test scenarios and test cases"),
          t("test-suites-and-test-data", "Test suites and test data"),
          t("traceability-matrix-and-coverage", "Traceability matrix and requirements coverage"),
          t("test-estimation", "Test estimation"),
          t("entry-and-exit-criteria", "Entry and exit criteria"),
          t("test-execution-and-closure-reports", "Test execution and closure reports"),
          t("release-sign-off", "Release sign-off"),
        ],
      },
      {
        slug: "defect-management",
        title: "Module 5 · Defect management",
        description: "Writing defects developers can act on, and managing them to closure.",
        path: "core",
        topics: [
          t("defect-lifecycle", "Defect lifecycle"),
          t("severity-vs-priority", "Severity versus priority"),
          t("writing-a-great-defect-report", "Writing a great defect report"),
          t("defect-triage", "Defect triage, duplicates, rejected and deferred defects"),
          t("root-cause-analysis", "Root cause analysis"),
          t("defect-metrics", "Defect metrics: leakage, density, aging and escapes"),
        ],
      },
      {
        slug: "agile-and-test-management",
        title: "Module 6 · Agile and test management",
        description: "Testing inside Scrum teams, shift-left, and the tools that support it.",
        path: "core",
        topics: [
          t("agile-principles-for-testers", "Agile principles for testers"),
          t("scrum-roles-and-ceremonies", "Scrum roles and ceremonies"),
          t("acceptance-criteria-dor-dod", "Acceptance criteria, Definition of Ready and Done"),
          t("shift-left-and-continuous-testing", "Shift-left and continuous testing"),
          t("jira-workflows-and-test-management-tools", "JIRA workflows and test management tools"),
          t("release-readiness", "Release readiness"),
        ],
      },
      {
        slug: "real-world-scenarios",
        title: "Module 7 · Real-world manual testing",
        description: "Guided scenarios for the features you will test in real products.",
        path: "core",
        topics: [
          t("testing-login-and-authentication", "Testing login and authentication"),
          t("testing-registration-and-password-reset", "Testing registration and password reset"),
          t("testing-search-and-filtering", "Testing search and filtering"),
          t("testing-cart-and-checkout", "Testing shopping cart and checkout"),
          t("testing-payments-refunds-cancellations", "Testing payments, refunds and cancellations"),
          t("testing-user-permissions", "Testing user permissions"),
          t("testing-file-uploads-and-downloads", "Testing file uploads and downloads"),
          t("testing-notifications", "Testing notifications"),
          t("testing-sessions-and-concurrency", "Testing session expiry and concurrent updates"),
          t("testing-data-validation", "Testing data validation"),
          t("testing-multi-browser-and-network-issues", "Testing multi-browser behaviour and network interruptions"),
        ],
      },
    ],
  },
  {
    slug: "automation",
    title: "Automation Testing",
    href: "/learn/automation",
    description:
      "Java, Selenium WebDriver and TestNG as the core path, then framework design, reliability and optional modern tools.",
    modules: [
      {
        slug: "java-for-testers",
        title: "Java for testers",
        description: "The Java you need to write and maintain test automation.",
        path: "core",
        topics: [
          t("java-basics-for-testers", "Java basics for testers"),
          t("java-oop-for-test-automation", "OOP for test automation"),
          t("java-collections-and-exceptions", "Collections and exceptions"),
        ],
      },
      {
        slug: "selenium-webdriver",
        title: "Selenium WebDriver",
        description: "Driving browsers reliably with Selenium.",
        path: "core",
        topics: [
          t("selenium-architecture", "Selenium architecture and WebDriver"),
          t("locator-strategies", "Locator strategies"),
          t("waits-and-synchronization", "Waits and synchronization"),
          t("handling-frames-windows-alerts", "Frames, windows and alerts"),
        ],
      },
      {
        slug: "frameworks",
        title: "Test frameworks and build tools",
        description: "TestNG, JUnit, Maven and Git as the backbone of a suite.",
        path: "core",
        topics: [
          t("testng-essentials", "TestNG essentials"),
          t("junit-5-essentials", "JUnit 5 essentials"),
          t("maven-for-test-projects", "Maven for test projects"),
          t("git-for-testers", "Git for testers"),
        ],
      },
      {
        slug: "framework-design",
        title: "Framework architecture",
        description: "Designing automation that stays maintainable as it grows.",
        path: "core",
        topics: [
          t("page-object-model", "Page Object Model"),
          t("data-driven-testing", "Data-driven testing"),
          t("cucumber-bdd", "Cucumber and BDD"),
          t("parallel-execution", "Parallel execution"),
          t("reporting-and-logging", "Reporting and logging"),
          t("automation-design-patterns", "Automation design patterns"),
        ],
      },
      {
        slug: "reliability",
        title: "Reliability and debugging",
        description: "Keeping suites trustworthy.",
        path: "core",
        topics: [
          t("flaky-test-reduction", "Flaky test reduction"),
          t("debugging-failing-tests", "Debugging failing tests"),
          t("test-doubles-and-mocking", "Test doubles and mocking"),
        ],
      },
      {
        slug: "modern-tools",
        title: "Modern web tools (optional)",
        description: "Alternative stacks you may meet in job descriptions.",
        path: "optional",
        topics: [
          t("playwright-with-typescript", "Playwright with TypeScript"),
          t("cypress-fundamentals", "Cypress fundamentals"),
          t("webdriverio-fundamentals", "WebdriverIO fundamentals"),
          t("robot-framework-fundamentals", "Robot Framework fundamentals"),
          t("accessibility-automation", "Accessibility automation"),
        ],
      },
    ],
  },
  {
    slug: "api-testing",
    title: "API Testing",
    href: "/learn/api-testing",
    description: "HTTP and REST fundamentals, Postman and Newman, RestAssured automation and advanced API quality.",
    modules: [
      {
        slug: "http-and-rest",
        title: "HTTP and REST fundamentals",
        description: "How APIs talk, and what to check.",
        path: "core",
        topics: [
          t("http-fundamentals", "HTTP requests, responses and methods"),
          t("http-status-codes", "HTTP status codes"),
          t("rest-principles", "REST principles"),
          t("json-and-xml-for-testers", "JSON and XML for testers"),
          t("authentication-and-authorization", "Authentication and authorization"),
        ],
      },
      {
        slug: "postman",
        title: "Postman and Newman",
        description: "Manual and command-line API testing.",
        path: "core",
        topics: [
          t("postman-collections-and-environments", "Postman collections and environments"),
          t("postman-tests-and-request-chaining", "Postman tests and request chaining"),
          t("newman-command-line-runs", "Newman command-line runs"),
        ],
      },
      {
        slug: "restassured",
        title: "RestAssured automation",
        description: "Automated API tests in Java.",
        path: "core",
        topics: [
          t("restassured-fundamentals", "RestAssured fundamentals"),
          t("json-schema-validation", "JSON schema validation"),
          t("api-test-data-management", "API test data management"),
        ],
      },
      {
        slug: "advanced-api",
        title: "Advanced API quality",
        description: "The behaviours that separate good API testers.",
        path: "core",
        topics: [
          t("api-negative-and-boundary-testing", "Negative and boundary testing"),
          t("pagination-sorting-filtering", "Pagination, sorting and filtering"),
          t("idempotency-retries-rate-limiting", "Idempotency, retries and rate limiting"),
          t("contract-testing", "Contract testing"),
          t("api-security-testing", "API security testing"),
          t("api-database-validation", "Database validation for API tests"),
          t("api-testing-in-ci", "API testing in CI/CD"),
        ],
      },
    ],
  },
  {
    slug: "performance",
    title: "Performance Testing",
    href: "/learn/performance",
    description: "Performance concepts, metrics, workload models, JMeter and results analysis.",
    modules: [
      {
        slug: "concepts",
        title: "Performance concepts",
        description: "The vocabulary and maths of performance.",
        path: "core",
        topics: [
          t("performance-testing-types", "Load, stress, spike, endurance, scalability and volume testing"),
          t("throughput-latency-and-percentiles", "Throughput, latency and percentiles"),
          t("littles-law", "Little's Law and concurrency"),
          t("workload-modeling", "Workload modelling, think time and pacing"),
        ],
      },
      {
        slug: "analysis",
        title: "Monitoring and analysis",
        description: "From numbers to root causes.",
        path: "core",
        topics: [
          t("resource-utilization-and-bottlenecks", "CPU, memory, disk, network and bottlenecks"),
          t("thread-and-connection-pools", "Thread pools and connection pools"),
          t("database-and-caching-bottlenecks", "Database bottlenecks and caching"),
          t("monitoring-with-influxdb-grafana", "Monitoring with InfluxDB and Grafana"),
          t("analyzing-performance-results", "Analysing results and root cause"),
          t("capacity-planning-and-baselines", "Capacity planning, baselines and thresholds"),
        ],
      },
    ],
  },
  {
    slug: "jmeter",
    title: "Apache JMeter",
    href: "/learn/jmeter",
    parent: "performance",
    description:
      "JMeter from absolute zero to advanced: install it, build your first test, make it realistic, correlate, validate, run at scale, monitor and report — explained for complete beginners.",
    modules: [
      {
        slug: "jmeter-getting-started",
        title: "Module 1 · Getting started",
        description: "What JMeter is, installing it, and your first working test plan.",
        path: "core",
        topics: [
          t("what-is-jmeter", "What is Apache JMeter (and what it is not)"),
          t("installing-jmeter", "Installing JMeter and Java step by step"),
          t("jmeter-gui-tour", "A guided tour of the JMeter GUI"),
          t("jmeter-fundamentals", "JMeter fundamentals: your first test plan"),
        ],
      },
      {
        slug: "jmeter-building-blocks",
        title: "Module 2 · Building blocks",
        description: "The elements every test plan is made of, and how JMeter executes them.",
        path: "core",
        topics: [
          t("jmeter-thread-groups", "Thread Groups: users, ramp-up and loops"),
          t("jmeter-http-request-sampler", "The HTTP Request sampler in depth"),
          t("jmeter-config-elements", "Config elements: defaults, headers, cookies and cache"),
          t("jmeter-listeners-and-results", "Listeners and reading results"),
          t("jmeter-scope-and-execution-order", "Element scope and execution order"),
          t("jmeter-logic-controllers", "Logic controllers: transactions, loops and conditions"),
        ],
      },
      {
        slug: "jmeter-realistic-tests",
        title: "Module 3 · Making tests realistic",
        description: "Recording, variables, test data and functions.",
        path: "core",
        topics: [
          t("jmeter-recording-scripts", "Recording scripts with the HTTP(S) Test Script Recorder"),
          t("jmeter-variables-and-properties", "Variables, properties and user-defined variables"),
          t("jmeter-csv-data-set-config", "Test data with CSV Data Set Config"),
          t("jmeter-functions", "JMeter functions (__Random, __time, __P and more)"),
        ],
      },
      {
        slug: "jmeter-correlation-validation",
        title: "Module 4 · Correlation and validation",
        description: "Handling dynamic values and checking responses are really correct.",
        path: "core",
        topics: [
          t("jmeter-correlation-and-parameterization", "Correlation and parameterization"),
          t("jmeter-assertions-and-extractors", "Assertions and extractors"),
          t("jmeter-testing-rest-apis", "Testing REST APIs with JSON, tokens and chaining"),
        ],
      },
      {
        slug: "jmeter-workload-control",
        title: "Module 5 · Controlling the workload",
        description: "Think time, pacing and hitting a target throughput.",
        path: "core",
        topics: [
          t("jmeter-timers-and-throughput-shaping", "Timers and throughput shaping"),
          t("jmeter-workload-design", "Designing a workload model in JMeter"),
        ],
      },
      {
        slug: "jmeter-scripting",
        title: "Module 6 · Scripting",
        description: "Extending JMeter with Groovy.",
        path: "core",
        topics: [t("jmeter-groovy-jsr223", "Groovy and JSR223")],
      },
      {
        slug: "jmeter-execution-reporting",
        title: "Module 7 · Running and reporting",
        description: "Running tests properly and turning results into decisions.",
        path: "core",
        topics: [
          t("jmeter-non-gui-and-distributed", "Non-GUI and distributed execution"),
          t("jmeter-html-dashboard-report", "The HTML dashboard report explained"),
          t("jmeter-analyzing-results", "Analysing JMeter results and finding bottlenecks"),
        ],
      },
      {
        slug: "jmeter-advanced",
        title: "Module 8 · Advanced JMeter",
        description: "Plugins, live monitoring, CI/CD, other protocols, best practices and a capstone.",
        path: "core",
        topics: [
          t("jmeter-plugins-manager", "JMeter Plugins Manager and popular plugins"),
          t("jmeter-backend-listener-grafana", "Live monitoring: Backend Listener, InfluxDB and Grafana"),
          t("jmeter-ci-cd", "Running JMeter in CI/CD"),
          t("jmeter-jdbc-and-other-protocols", "JDBC, JMS and other protocols"),
          t("jmeter-best-practices-and-troubleshooting", "Best practices, memory tuning and troubleshooting"),
          t("jmeter-capstone-payment-load-test", "Capstone: a complete payment load test"),
        ],
      },
    ],
  },
  {
    slug: "mobile",
    title: "Mobile Testing",
    href: "/learn/mobile",
    description: "Mobile-specific risks, device strategy and Appium automation.",
    modules: [
      {
        slug: "mobile-fundamentals",
        title: "Mobile testing fundamentals",
        description: "What makes mobile different.",
        path: "core",
        topics: [
          t("mobile-testing-fundamentals", "Mobile testing fundamentals"),
          t("android-vs-ios-testing", "Android versus iOS testing"),
          t("device-and-os-coverage-strategy", "Device and OS coverage strategy"),
        ],
      },
      {
        slug: "appium",
        title: "Appium",
        description: "Automating native and hybrid apps.",
        path: "core",
        topics: [
          t("appium-architecture-and-setup", "Appium architecture and setup"),
          t("appium-locators-and-gestures", "Appium locators and gestures"),
        ],
      },
    ],
  },
  {
    slug: "specialist",
    title: "Specialist Testing",
    href: "/learn/specialist",
    description: "SQL, accessibility, security, compatibility, localization, data and AI testing.",
    modules: [
      {
        slug: "sql-and-data",
        title: "SQL and data testing",
        description: "Validating data where it lives.",
        path: "core",
        topics: [
          t("sql-for-testers", "SQL for testers"),
          t("sql-joins-and-aggregates", "SQL joins and aggregates"),
          t("database-testing", "Database testing"),
          t("etl-and-data-warehouse-testing", "ETL and data warehouse testing"),
        ],
      },
      {
        slug: "accessibility",
        title: "Accessibility testing",
        description: "Making products usable by everyone.",
        path: "optional",
        topics: [
          t("accessibility-testing-fundamentals", "Accessibility testing and WCAG"),
          t("screen-reader-and-keyboard-testing", "Screen reader and keyboard testing"),
        ],
      },
      {
        slug: "security",
        title: "Security testing",
        description: "Finding weaknesses safely and legally.",
        path: "optional",
        topics: [
          t("security-testing-fundamentals", "Security testing fundamentals"),
          t("owasp-top-10-for-testers", "OWASP Top 10 for testers"),
        ],
      },
      {
        slug: "compatibility-and-localization",
        title: "Compatibility and localization",
        description: "Many browsers, devices, languages and regions.",
        path: "optional",
        topics: [
          t("cross-browser-testing", "Cross-browser testing"),
          t("localization-and-internationalization", "Localization and internationalization"),
        ],
      },
      {
        slug: "cloud-and-distributed",
        title: "Cloud and distributed systems",
        description: "Testing systems that span many services.",
        path: "optional",
        topics: [
          t("microservices-testing", "Microservices and event-driven testing"),
          t("chaos-engineering-basics", "Chaos engineering basics"),
        ],
      },
      {
        slug: "ai-testing",
        title: "AI application testing",
        description: "Evaluating LLM, RAG and agent systems.",
        path: "optional",
        topics: [
          t("testing-ai-applications", "Testing AI applications"),
          t("llm-evaluation", "LLM evaluation"),
          t("rag-evaluation", "RAG evaluation"),
        ],
      },
    ],
  },
  {
    slug: "sdet",
    title: "SDET Engineering",
    href: "/learn/sdet",
    description: "CI/CD, test architecture, metrics, requirements analysis and test leadership.",
    modules: [
      {
        slug: "devops",
        title: "CI/CD and DevOps for testers",
        description: "Running tests where software is built and shipped.",
        path: "core",
        topics: [
          t("ci-cd-for-test-engineers", "CI/CD for test engineers"),
          t("github-actions-for-tests", "GitHub Actions for tests"),
          t("jenkins-pipelines-for-tests", "Jenkins pipelines for tests"),
          t("docker-for-testers", "Docker for testers"),
        ],
      },
      {
        slug: "architecture",
        title: "Test architecture and system design",
        description: "Designing test systems, not just tests.",
        path: "core",
        topics: [
          t("test-pyramid-and-strategy", "The test pyramid and test strategy"),
          t("test-architecture-and-system-design", "Test architecture and system design"),
          t("requirements-analysis-for-testers", "Requirements analysis for testers"),
        ],
      },
      {
        slug: "leadership",
        title: "Metrics and leadership",
        description: "Measuring quality and leading test efforts.",
        path: "optional",
        topics: [
          t("qa-metrics-and-reporting", "QA metrics and reporting"),
          t("test-management-and-leadership", "Test management and leadership"),
        ],
      },
    ],
  },
];

export function allTopics() {
  return TRACKS.flatMap((track) =>
    track.modules.flatMap((module) => module.topics.map((topic) => ({ ...topic, track, module }))),
  );
}

export function findTrack(slug: string) {
  return TRACKS.find((track) => track.slug === slug);
}
