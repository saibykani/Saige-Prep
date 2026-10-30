---
slug: newman-command-line-runs
title: Newman Command-Line Runs
summary: Newman runs Postman collections from the command line. Learn its key options, environment and data files, reporters such as JUnit, exit codes, and how to make runs repeatable for CI.
level: intermediate
duration: 30
tags: [api, postman, newman, cli, ci]
objectives:
  - Install Newman and run an exported collection with an environment
  - Use iteration data, folder selection and environment variable overrides
  - Produce CLI and JUnit reports and interpret Newman's exit code
  - Prepare a collection so it runs reliably outside the Postman app
prerequisites:
  - Postman collections and environments
  - Postman tests and request chaining
  - Node.js installed
related: [postman-collections-and-environments, postman-tests-and-request-chaining, api-testing-in-ci, api-test-data-management]
references:
  - title: Postman Learning Center — Overview
    url: https://learning.postman.com/docs/introduction/overview/
  - title: Newman source and README (postmanlabs/newman)
    url: https://github.com/postmanlabs/newman
  - title: Newman on npm
    url: https://www.npmjs.com/package/newman
interview:
  - q: How do you run a Postman collection in a CI pipeline?
    a: "Export the collection and environment (or fetch them through the Postman API), install Newman in the pipeline with npm, and run newman run collection.json -e env.json -r cli,junit with --reporter-junit-export pointing to a results file. Secrets are injected with --env-var from the CI secret store rather than stored in the environment file. Newman exits non-zero when any test or request fails, so the CI step fails, and the JUnit file is published as a test report."
  - q: How do you run the same collection against many data sets?
    a: "Use an iteration data file with -d data.csv or a JSON array. Newman runs the collection once per row, and each column becomes a data variable that requests and scripts can reference. Data variables override environment variables with the same name because the data scope is narrower."
  - q: A collection passes in the Postman app but fails in Newman. What do you check?
    a: "Whether the exported environment contains the values — current values that were never saved as shared values are often missing from exports. Then local file references for uploads, SSL certificates (self-signed certs may need --insecure in a lab only), request order or folder selection, timeouts, and any dependency on globals that exist only in my app."
practice:
  - "Export your Practice Lab collection and environment for the local mock API and run them with newman run, producing both CLI and JUnit output."
  - "Create a CSV with five order payloads, including two invalid ones, and run the collection with -d. Check that each iteration's tests reflect its data."
  - "Deliberately break one assertion, run Newman, and confirm the process exit code is non-zero."
takeaways:
  - Newman is Postman's command-line collection runner, distributed on npm.
  - The core command is newman run collection.json -e env.json, with reporters chosen via -r.
  - Use -d for data-driven runs, --folder to select folders and --env-var to inject secrets.
  - Newman exits non-zero on failures, which is what makes it useful as a CI gate.
  - Exported files contain only shared values; make sure runs don't depend on local-only state.
quiz:
  - id: newman-q1
    type: single
    topic: newman-command-line-runs
    difficulty: beginner
    prompt: Which command runs a collection with an environment and produces both console and JUnit output?
    options: ["newman collection.json --env env.json --junit", "newman run collection.json -e env.json -r cli,junit", "postman run collection.json env.json", "newman test -c collection.json -r junit"]
    answer: [1]
    explanation: The subcommand is run, -e takes the environment file and -r takes a comma-separated reporter list. The other commands are not valid Newman syntax.
  - id: newman-q2
    type: truefalse
    topic: newman-command-line-runs
    difficulty: beginner
    prompt: If an assertion fails during a Newman run, Newman still exits with code 0 so the pipeline can continue.
    options: ["True", "False"]
    answer: [1]
    explanation: Newman exits with a non-zero code when tests or requests fail, which is exactly what makes a CI step fail. Ignoring it requires an explicit choice in the pipeline.
  - id: newman-q3
    type: scenario
    topic: newman-command-line-runs
    difficulty: intermediate
    prompt: Your environment file has an empty clientSecret, and CI provides the real value as a secret variable. How should you pass it to Newman?
    options: ["Commit the secret into env.json", "Use --env-var clientSecret=... with the CI secret", "Put it in a global variable in the Postman app", "Hardcode it in the pre-request script"]
    answer: [1]
    explanation: --env-var overrides an environment variable at run time without writing the secret into a file. Committing or hardcoding secrets leaks them, and app globals are not available to Newman.
---

## Beginner-friendly explanation

If Postman is a music player you click through by hand, **Newman** is the same playlist played by a machine on a schedule, with a printed report afterwards. No screen, no clicking: you give it the playlist (the collection) and the settings (the environment), it plays everything and tells you what went wrong.

That matters because tests that only run when someone remembers to click "Run" don't protect anyone. Newman lets the build server run your API checks automatically on every change.

## Technical explanation

Newman is an open-source Node.js command-line runner for Postman collections, installed from npm:

```bash
npm install -g newman        # or as a project dev dependency
newman --version
```

### The core command

```bash
newman run collection.json -e env.json -r cli,junit \
  --reporter-junit-export results/newman-junit.xml
```

`newman run` accepts a collection file path or URL. Commonly used options:

| Option | Purpose |
|---|---|
| `-e, --environment <file>` | Environment file |
| `-g, --globals <file>` | Globals file |
| `-d, --iteration-data <file>` | CSV or JSON data; one iteration per row |
| `-n, --iteration-count <n>` | Number of iterations |
| `--folder <name>` | Run only a folder (repeatable) |
| `--env-var "key=value"` | Set or override an environment variable |
| `-r, --reporters <list>` | Reporters, e.g. `cli,junit,json` |
| `--reporter-junit-export <path>` | Where to write the JUnit XML |
| `--timeout-request <ms>` | Per-request timeout |
| `--delay-request <ms>` | Delay between requests |
| `--bail` | Stop on the first failure |
| `-k, --insecure` | Skip TLS verification (lab use only) |

Built-in reporters include `cli`, `json`, `junit` and `progress`. Additional reporters, such as HTML ones, are separate community npm packages installed alongside Newman.

### Exit codes

Newman exits with **0** when every request and assertion succeeds and **non-zero** when any fails. CI systems treat a non-zero exit as a failed step, which is what turns a collection into a quality gate.

```mermaid
sequenceDiagram
    participant CI as CI job
    participant N as Newman
    participant A as API under test
    CI->>N: newman run collection.json -e env.json -r cli,junit
    loop each request in each iteration
        N->>N: run pre-request script
        N->>A: HTTP request
        A-->>N: HTTP response
        N->>N: run tests, record pass or fail
    end
    N-->>CI: write JUnit XML, exit code 0 or 1
```

## Real-world example

A team ran Newman nightly with `|| true` appended to the command because a flaky third-party sandbox occasionally failed. That made the step always green. For three weeks a real regression in their own refund endpoint went unnoticed, because nobody read the nightly log when the job was green.

They removed `|| true`, split the third-party checks into a separate, clearly-labelled folder run with `--folder`, and published the JUnit report so failures showed up in the CI test tab.

## Step-by-step walkthrough

1. **Export** the collection (v2.1) and environment from Postman, or keep them as JSON files in the repository.
2. **Check the environment export** contains shared values for everything non-secret, and empty placeholders for secrets.
3. **Run locally**: `newman run collection.json -e env.json`.
4. **Add reporters**: `-r cli,junit --reporter-junit-export results/junit.xml`.
5. **Add data**: `-d orders.csv` for data-driven iterations.
6. **Inject secrets** with `--env-var` from shell or CI variables.
7. **Check the exit code** with `echo $?` (bash) to confirm failures are detectable.

## Code examples

A data file and a data-driven run:

```text
sku,quantity,expectedStatus
BOOK-001,1,201
BOOK-001,0,422
UNKNOWN,1,422
```

```bash
newman run orders.postman_collection.json \
  -e lab.postman_environment.json \
  -d orders.csv \
  --folder "Create order" \
  --env-var "clientSecret=$CLIENT_SECRET" \
  -r cli,junit --reporter-junit-export results/orders-junit.xml
echo "exit code: $?"
```

In the request body use `{{sku}}` and `{{quantity}}`; in the test use `pm.response.to.have.status(Number(pm.iterationData.get("expectedStatus")))`.

## Expected output

The CLI reporter prints each request and assertion, then a summary table. Abridged, with one failing iteration:

```text
Iteration 3/3
→ Create order
  POST http://localhost:8080/orders [201 Created, 312B, 41ms]
  1. Status matches expectedStatus

┌─────────────────────────┬──────────┬──────────┐
│                         │ executed │   failed │
├─────────────────────────┼──────────┼──────────┤
│              assertions │        3 │        1 │
└─────────────────────────┴──────────┴──────────┘
  #  failure        detail
 1.  AssertionError Status matches expectedStatus
                    expected response to have status code 422 but got 201

exit code: 1
```

## Common mistakes

- **Swallowing the exit code** with `|| true` or `continue-on-error` without a deliberate reason.
- **Relying on current values** that never made it into the exported environment.
- **Committing secrets** in environment files.
- **Using `--insecure` outside a lab**, which hides certificate problems.
- **Running the whole collection when only a smoke folder is needed**, making pipelines slow.
- **Not publishing the JUnit report**, so failures are buried in logs.

## Troubleshooting

- **`ENOENT` for a file**: paths in form-data uploads are relative to the working directory; pass `--working-dir`.
- **`ECONNREFUSED`**: the API is not running or the base URL in the environment points elsewhere.
- **Self-signed certificate errors in a lab**: supply the CA with `--ssl-extra-ca-certs` or, in an isolated lab only, use `-k`.
- **Works in the app, fails in Newman**: compare variable values by logging them in a pre-request script.

## Key takeaways summary

Newman turns a Postman collection into an automated, repeatable check. Learn `newman run` with `-e`, `-d`, `--folder`, `--env-var` and `-r cli,junit`, trust the exit code, keep secrets out of files and publish reports, and your collections become a dependable gate in any pipeline.
