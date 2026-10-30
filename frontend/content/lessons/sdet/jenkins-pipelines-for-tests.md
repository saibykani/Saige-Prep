---
slug: jenkins-pipelines-for-tests
title: Jenkins Pipelines for Tests
summary: Write declarative Jenkins pipelines that run automated tests, publish JUnit results, keep artifacts, run suites in parallel and report a clear SUCCESS, UNSTABLE or FAILURE status.
level: intermediate
duration: 40
tags: [jenkins, ci-cd, pipelines, automation]
objectives:
  - Read and write a declarative Jenkinsfile with agent, stages, steps and post sections
  - Publish JUnit XML results so Jenkins shows test trends and failures
  - Explain the difference between FAILURE and UNSTABLE build results
  - Run independent test suites in parallel and add timeouts and parameters
prerequisites:
  - Running Maven tests from the command line
  - Basic CI/CD concepts
related: [ci-cd-for-test-engineers, github-actions-for-tests, maven-for-test-projects, parallel-execution, reporting-and-logging, docker-for-testers]
references:
  - title: Jenkins User Documentation
    url: https://www.jenkins.io/doc/
  - title: Jenkins Pipeline Syntax reference
    url: https://www.jenkins.io/doc/book/pipeline/syntax/
  - title: Jenkins Pipeline overview
    url: https://www.jenkins.io/doc/book/pipeline/
interview:
  - q: What is the difference between declarative and scripted pipelines?
    a: Both are written in a Jenkinsfile using a Groovy-based syntax. Declarative pipelines start with a pipeline block and follow a fixed, validated structure of agent, stages, steps and post, which makes them easier to read and lint. Scripted pipelines start with node and are general-purpose Groovy, which is more flexible but easier to make messy. For test pipelines I default to declarative and put complex logic in a script block or a shared library when it is really needed.
  - q: Why do we publish test results in a post always block?
    a: Because if the test stage fails, later stages are skipped, but post always still runs. Putting the junit step there guarantees that results are recorded for failing builds, which are the ones we most need to inspect. Without it Jenkins would show a red build with no test breakdown and no trend data for that run.
  - q: When is a build UNSTABLE rather than FAILURE?
    a: FAILURE means a step failed, for example a command exited non-zero or the build could not compile. UNSTABLE is set when the build itself completed but quality checks found problems; the junit step marks the build UNSTABLE when recorded results contain failures. A common pattern is running Maven with maven.test.failure.ignore set to true so the build continues, and letting the junit step report failed tests as UNSTABLE, which separates broken infrastructure from failing tests.
  - q: "System design: how would you scale a Jenkins setup that runs UI tests for many teams?"
    a: I would keep the controller for orchestration only and run builds on agents, ideally ephemeral container-based agents so each run starts clean. UI tests would run against a Selenium Grid or containerised browsers, sharded with parallel stages. Common steps such as publishing results and notifying would live in a shared library so every team's Jenkinsfile stays short. Timeouts on every stage, build-discarding rules and lockable resources for shared environments keep the system stable.
practice:
  - "Write a Jenkinsfile with Build, Unit Tests and API Tests stages that publishes JUnit results in post always."
  - "Change your pipeline so that test failures make the build UNSTABLE instead of FAILURE and observe the colour change in the Jenkins UI."
  - "Split a UI suite into two parallel stages (for example Chrome and Firefox) and add a 30-minute timeout to the pipeline."
takeaways:
  - A Jenkinsfile in source control defines the pipeline as code and is reviewed like any other code.
  - Declarative pipelines use pipeline, agent, stages, stage, steps and post.
  - Publish test results with junit in post always so failing builds still have reports.
  - FAILURE means a step broke; UNSTABLE means the build ran but quality checks such as tests failed.
  - Use parallel stages, timeouts and container agents to keep test pipelines fast and isolated.
quiz:
  - id: sdet-jenkins-q1
    type: single
    topic: jenkins-pipelines-for-tests
    difficulty: beginner
    prompt: In a declarative pipeline, which section always runs at the end of the pipeline regardless of the result?
    options: ["stages", "post { always { } }", "environment", "options"]
    answer: [1]
    explanation: Conditions inside post such as always, success, failure and unstable run after the stages finish; always runs in every case. environment and options configure the pipeline but do not run steps at the end.
  - id: sdet-jenkins-q2
    type: debugging
    topic: jenkins-pipelines-for-tests
    difficulty: intermediate
    prompt: When tests fail, this pipeline shows a red build but no test results. Why?
    code: |
      pipeline {
        agent any
        stages {
          stage('Test') {
            steps {
              sh 'mvn -B test'
              junit '**/target/surefire-reports/*.xml'
            }
          }
        }
      }
    codeLanguage: groovy
    options:
      - "The junit step only accepts absolute paths"
      - "sh fails when mvn exits non-zero, so the following junit step in the same steps block never runs"
      - "agent any cannot run Maven"
      - "Surefire does not write XML reports"
    answer: [1]
    explanation: A failed step stops the remaining steps in that stage. Moving junit into post always ensures it runs after a failure. Surefire writes XML reports to target/surefire-reports by default and Ant-style patterns are accepted.
  - id: sdet-jenkins-q3
    type: truefalse
    topic: jenkins-pipelines-for-tests
    difficulty: intermediate
    prompt: If Maven tests run with -Dmaven.test.failure.ignore=true and some tests fail, the junit step typically marks the build UNSTABLE rather than FAILURE.
    options: ["True", "False"]
    answer: [0]
    explanation: Maven then exits zero so the sh step succeeds, and the junit step sees failed tests in the XML and sets the result to UNSTABLE. This separates test failures from broken builds.
  - id: sdet-jenkins-q4
    type: scenario
    topic: jenkins-pipelines-for-tests
    difficulty: advanced
    prompt: A UI suite sometimes hangs and blocks the only agent for hours. What is the most direct pipeline-level protection?
    options:
      - "Add a timeout option to the pipeline or stage"
      - "Add retry(10) around the test step"
      - "Run the pipeline less often"
      - "Use agent none"
    answer: [0]
    explanation: "A timeout such as options { timeout(time: 30, unit: 'MINUTES') } aborts a hung build and frees the agent; you still investigate the hang. Retrying a hanging step multiplies the problem, and agent none alone does not provide an executor for the tests."
---

## Beginner-friendly explanation

Think of Jenkins as a factory foreman with a written checklist pinned to the wall. Each time new parts arrive, the foreman walks the line in order: build it, test it, package it. Whatever happens, at the end of the shift the foreman files a report. The checklist is the **Jenkinsfile**, and because it is written down and stored with the code, everyone can read it, review it and improve it.

## Technical explanation

**Jenkins** is an open-source automation server. A **Pipeline** is a sequence of stages defined in a `Jenkinsfile` committed to the repository ("pipeline as code"). There are two syntaxes:

- **Declarative**, starting with `pipeline { }`, with a fixed structure that Jenkins validates before running.
- **Scripted**, starting with `node { }`, which is general-purpose Groovy.

Key declarative directives:

| Directive | Purpose |
|---|---|
| `agent` | Where the pipeline or stage runs: `any`, a `label`, or a container such as `docker { image '...' }` (needs the Docker Pipeline plugin) |
| `stages` / `stage` / `steps` | Ordered stages, each containing steps such as `sh`, `bat`, `junit` |
| `post` | Steps that run after the pipeline or a stage, by condition: `always`, `success`, `failure`, `unstable`, `changed` |
| `options` | Settings such as `timeout(...)`, `timestamps()` (plugin), `buildDiscarder(...)` |
| `parameters` | Inputs for a run, such as which browser or environment |
| `parallel` | Runs nested stages at the same time |
| `when` | Runs a stage only under conditions, such as `branch 'main'` |

The `junit` step (from the JUnit plugin) reads JUnit-format XML, shows per-test results and trends, and **sets the build to UNSTABLE** when it finds failures. The build result colours are therefore meaningful:

| Result | Meaning |
|---|---|
| SUCCESS | All steps passed and no quality check flagged problems |
| UNSTABLE | The build ran, but recorded tests (or other checks) failed |
| FAILURE | A step failed, for example compilation or a non-zero exit |
| ABORTED | Stopped by a user or a timeout |

## Real-world example

A QA team had a freestyle Jenkins job configured by clicking through the UI. Nobody knew who had changed what, and a broken setting once disabled the test step for a week without anyone noticing. They replaced it with a declarative Jenkinsfile in the test repository. Changes now went through pull requests, the `junit` step gave them test trends per build, and a `timeout` option stopped hung browser sessions from blocking agents overnight. Splitting API and UI suites into parallel stages shortened feedback without changing a single test.

## Step-by-step walkthrough

1. Add a `Jenkinsfile` to the repository root.
2. Create a **Pipeline** or **Multibranch Pipeline** job pointing at the repository.
3. Declare an `agent` with the tools you need (or a container image that has them).
4. Add stages for build and each test suite, with commands that exit non-zero on failure.
5. Publish results with `junit` and evidence with `archiveArtifacts` in `post { always { } }`.
6. Add `options { timeout(...) }` and use `parallel` for independent suites.
7. Use the **Pipeline Syntax** snippet generator in Jenkins to check step syntax for installed plugins.

## Code examples

A minimal pipeline that matches the pattern most test teams start with:

```groovy
pipeline {
  agent any
  stages {
    stage('Test') {
      steps {
        sh 'mvn -B test'
      }
    }
  }
  post {
    always {
      junit '**/target/surefire-reports/*.xml'
    }
  }
}
```

A fuller version with a timeout, a parameter, parallel suites and artifacts:

```groovy
pipeline {
  agent any
  options {
    timeout(time: 45, unit: 'MINUTES')
  }
  parameters {
    choice(name: 'BROWSER', choices: ['chrome', 'firefox'], description: 'Browser for UI tests')
  }
  stages {
    stage('Build and unit tests') {
      steps {
        sh 'mvn -B -Dmaven.test.failure.ignore=true test'
      }
    }
    stage('Integration suites') {
      parallel {
        stage('API') {
          steps { sh 'mvn -B -Dmaven.test.failure.ignore=true -pl api-tests verify' }
        }
        stage('UI') {
          steps { sh "mvn -B -Dmaven.test.failure.ignore=true -pl ui-tests verify -Dbrowser=${params.BROWSER}" }
        }
      }
    }
  }
  post {
    always {
      junit testResults: '**/target/*-reports/*.xml', allowEmptyResults: true
      archiveArtifacts artifacts: '**/target/screenshots/**', allowEmptyArchive: true
    }
  }
}
```

The module names `api-tests` and `ui-tests` are illustrative; adjust paths to your project layout. The pattern `*-reports` matches both Surefire and Failsafe report folders.

## Expected output

With one failing UI test, the stage view shows every stage completed, the build is **yellow (UNSTABLE)** rather than red, and the build page shows a **Test Result** link listing the failed test with its stack trace. The console log ends with lines similar to:

```text
[Pipeline] junit
Recording test results
[Pipeline] }
Finished: UNSTABLE
```

Without `-Dmaven.test.failure.ignore=true`, Maven would exit non-zero, the stage would fail and the result would be `Finished: FAILURE`, but `post { always }` would still publish the results.

## Common mistakes

- **Publishing results inside `steps`** after the test command, so they are skipped when tests fail.
- **Configuring jobs only through the UI**, with no history or review.
- **Running builds on the controller** instead of agents, which risks both performance and security.
- **No timeouts**, so a hung browser blocks an executor indefinitely.
- **Hiding all failures** with `failure.ignore` and never checking for UNSTABLE builds. Teams must agree that yellow still needs action.
- **Credentials in plain text** in the Jenkinsfile. Use the Credentials plugin with `withCredentials` or `credentials()` in `environment`.

## Troubleshooting

- **"No test report files were found."** Check the glob against the workspace path; reports may be in a module subfolder. Use `allowEmptyResults: true` only when an empty result is genuinely acceptable.
- **`sh` not found on Windows agents.** Use `bat` or `powershell` steps, or a Linux agent.
- **Step not recognised.** The plugin providing it is not installed; check the snippet generator.
- **Parallel UI stages interfere with each other.** They are probably sharing test data, ports or a browser profile; isolate them.

## Key takeaways summary

A declarative Jenkinsfile turns test execution into reviewable code. Structure it as agent, stages and post; publish JUnit results in `post { always }`; use UNSTABLE versus FAILURE deliberately; and protect the system with timeouts, parallel stages and clean agents.
