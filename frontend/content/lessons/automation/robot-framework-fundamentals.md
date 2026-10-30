---
slug: robot-framework-fundamentals
title: Robot Framework fundamentals
summary: Learn Robot Framework, the open-source keyword-driven automation framework built on Python. Understand test case syntax, keywords, variables and libraries such as SeleniumLibrary and Browser, and read its log and report output.
level: beginner
duration: 40
tags: [robot-framework, keyword-driven, python, automation]
objectives:
  - Explain keyword-driven testing and where Robot Framework fits
  - Write .robot files with settings, variables, test cases and keywords
  - Use SeleniumLibrary or the Browser library for web tests
  - Run tests and read output.xml, log.html and report.html
prerequisites:
  - Basic command-line use
  - Locator strategies
related: [cucumber-bdd, data-driven-testing, locator-strategies, page-object-model, playwright-with-typescript]
references:
  - title: Robot Framework
    url: https://robotframework.org/
  - title: Robot Framework User Guide
    url: https://robotframework.org/robotframework/latest/RobotFrameworkUserGuide.html
  - title: SeleniumLibrary
    url: https://robotframework.org/SeleniumLibrary/
  - title: Browser library (Playwright-based)
    url: https://robotframework-browser.org/
interview:
  - q: What is keyword-driven testing?
    a: "Tests are written as sequences of keywords, readable actions such as Open Login Page or Input Username, with arguments. Low-level keywords come from libraries written in Python or other languages, and testers compose higher-level user keywords from them. This separates test intent from implementation and lets less technical team members read and write tests."
  - q: What files does Robot Framework produce after a run?
    a: "By default output.xml with the full machine-readable results, log.html with a detailed step-by-step log including keyword arguments and timings, and report.html with a high-level summary and statistics by tag. Tools like rebot can merge or regenerate them, and --xunit adds an xUnit-compatible file for CI."
  - q: SeleniumLibrary or Browser library, which would you pick?
    a: "SeleniumLibrary uses Selenium WebDriver and is mature, with broad browser support and familiar concepts. Browser library is built on Playwright, offering auto-waiting, browser contexts and good speed, but it requires Node.js alongside Python. For a new project without legacy constraints many teams choose Browser; existing Selenium infrastructure favours SeleniumLibrary."
practice:
  - "Install Robot Framework and SeleniumLibrary in a Python virtual environment and run a test that opens a page and checks its title."
  - "Create a user keyword Login As with username and password arguments and reuse it in two tests."
  - "Tag tests smoke and regression, run only smoke with --include smoke and open report.html."
takeaways:
  - Robot Framework is keyword-driven, open source and implemented in Python.
  - Files have Settings, Variables, Test Cases and Keywords sections.
  - Separate keywords and arguments with at least two spaces.
  - Libraries provide low-level keywords; user keywords compose them.
  - log.html is your first stop when a test fails.
quiz:
  - id: rbfw-q1
    type: debugging
    topic: robot-framework-fundamentals
    difficulty: beginner
    prompt: "This step fails with \"No keyword with name 'Input Text id=username demo' found\". Why?"
    code: |
      *** Test Cases ***
      Valid Login
          Input Text id=username demo
    codeLanguage: text
    options: ["Input Text does not exist in SeleniumLibrary", "Only single spaces separate the keyword and arguments, so Robot reads it as one long keyword name", "Robot Framework requires XPath locators", "The test case needs a [Tags] line"]
    answer: [1]
    explanation: "Robot uses two or more spaces (or a pipe or tab) as the separator. With single spaces, the whole line becomes one keyword name. Write Input Text    id=username    demo."
  - id: rbfw-q2
    type: single
    topic: robot-framework-fundamentals
    difficulty: beginner
    prompt: Which output file gives a detailed, expandable step-by-step view of each keyword executed?
    options: ["report.html", "log.html", "requirements.txt", "robot.yaml"]
    answer: [1]
    explanation: "log.html contains every keyword with arguments, messages and timings. report.html is the high-level summary that links into the log."
  - id: rbfw-q3
    type: truefalse
    topic: robot-framework-fundamentals
    difficulty: beginner
    prompt: Robot Framework can only be used for web UI testing.
    options: ["True", "False"]
    answer: [1]
    explanation: "It is a generic framework. Libraries exist for APIs, databases, SSH, mobile through Appium, desktop and more, and you can write your own Python libraries."
  - id: rbfw-q4
    type: scenario
    topic: robot-framework-fundamentals
    difficulty: intermediate
    prompt: Ten tests each repeat the same four steps to log in. What is the idiomatic improvement?
    options: ["Copy the steps into a comment", "Create a user keyword Login As with arguments and call it from each test or a Test Setup", "Write all ten as one test", "Use Sleep between steps"]
    answer: [1]
    explanation: "User keywords are Robot Framework's main reuse mechanism, and setups run them before each test. Merging tests destroys isolation and Sleep adds no reuse."
---

## Beginner-friendly explanation

Think of a recipe card written in plain words: "Preheat oven", "Mix flour and sugar", "Bake for 20 minutes". A beginner can follow it, and an expert can decide what "Mix" means in detail somewhere else.

**Robot Framework** lets you write tests like that recipe card. Each line is a **keyword**, a readable action such as `Open Browser` or `Page Should Contain`, followed by its inputs. Libraries supply the basic keywords, and you combine them into your own higher-level keywords like `Login As`. The result is tests that business people can read, while engineers handle the technical details.

## Technical explanation

Robot Framework is an open-source, generic automation framework implemented in Python and supported by the Robot Framework Foundation. It is used for acceptance testing, acceptance test-driven development and robotic process automation.

### File structure

A `.robot` file has sections marked with `*** ... ***`:

| Section | Purpose |
|---|---|
| `*** Settings ***` | Import libraries and resource files, set suite setup/teardown, documentation |
| `*** Variables ***` | Scalars `${NAME}`, lists `@{NAME}`, dictionaries `&{NAME}` |
| `*** Test Cases ***` | Tests, each a list of keyword calls |
| `*** Keywords ***` | User keywords built from other keywords |

Cells are separated by **two or more spaces** (or a tab, or ` | ` in pipe format). Test-level settings use square brackets: `[Tags]`, `[Setup]`, `[Teardown]`, `[Documentation]`, `[Arguments]` (for keywords).

### Libraries

- **BuiltIn**: always available (`Log`, `Should Be Equal`, `Sleep`, `Run Keyword If`, `Set Variable`).
- **Standard libraries**: `Collections`, `String`, `OperatingSystem`, `DateTime`, `Process`.
- **External libraries**: `SeleniumLibrary` (Selenium WebDriver), `Browser` (Playwright), `RequestsLibrary` (HTTP APIs), `AppiumLibrary`, `DatabaseLibrary`.
- **Custom**: any Python class or module can become a library.

```mermaid
flowchart TB
  TC["Test case: Valid Login"] --> UK["User keyword: Login As"]
  UK --> K1["Input Text (SeleniumLibrary)"]
  UK --> K2["Click Button (SeleniumLibrary)"]
  TC --> K3["Title Should Be (SeleniumLibrary)"]
  K1 --> WD[Selenium WebDriver]
  K2 --> WD
  RUN[robot command] --> OUT[output.xml] --> LOG[log.html]
  OUT --> REP[report.html]
```

## Real-world example

A telecom operator's QA team included domain experts who understood billing rules but did not program. Engineers built a resource file of keywords such as `Create Prepaid Customer`, `Recharge Account` and `Balance Should Be`, backed by RequestsLibrary and SeleniumLibrary. Domain experts then wrote and reviewed acceptance tests directly in `.robot` files, and the nightly CI job published `report.html` for the whole team.

## Step-by-step walkthrough

1. Install Python 3 and create a virtual environment.
2. Run `pip install robotframework robotframework-seleniumlibrary`.
3. Make sure a supported browser is installed (Selenium 4.6+ can manage drivers automatically through Selenium Manager).
4. Create `tests/login.robot` with the sections shown below.
5. Run `robot tests/` and open `log.html`.
6. Move shared keywords into a `resources/common.resource` file.

## Code examples

```text
*** Settings ***
Documentation     Login tests for the demo shop.
Library           SeleniumLibrary
Suite Setup       Open Browser    ${BASE_URL}    ${BROWSER}
Suite Teardown    Close All Browsers
Test Setup        Go To    ${BASE_URL}/login

*** Variables ***
${BASE_URL}       http://localhost:3000
${BROWSER}        chrome

*** Test Cases ***
Valid User Reaches Dashboard
    [Tags]    smoke
    Login As    demo@example.test    %{DEMO_PASSWORD}
    Wait Until Page Contains    Welcome
    Location Should Contain    /dashboard

Wrong Password Shows Error
    [Tags]    regression
    Login As    demo@example.test    wrong-password
    Wait Until Element Is Visible    css:[role="alert"]
    Element Text Should Be    css:[role="alert"]    Invalid email or password

*** Keywords ***
Login As
    [Arguments]    ${email}    ${password}
    Input Text        id:email       ${email}
    Input Password    id:password    ${password}
    Click Button      css:[data-testid="login-submit"]
```

`%{DEMO_PASSWORD}` reads an environment variable, and `Input Password` avoids writing the value to the log.

A data-driven variant with a test template:

```text
*** Test Cases ***    EMAIL                  PASSWORD    MESSAGE
Empty Email           ${EMPTY}               secret      Email is required
Bad Format            not-an-email           secret      Enter a valid email

*** Settings ***
Test Template    Login Should Fail With
```

(`Login Should Fail With` would be a user keyword taking the three arguments.)

Running:

```bash
robot tests/                                   # run everything
robot --include smoke tests/                   # only tests tagged smoke
robot --variable BROWSER:firefox tests/        # override a variable
robot --outputdir results --xunit xunit.xml tests/
```

## Expected output

```text
==============================================================================
Login :: Login tests for the demo shop.
==============================================================================
Valid User Reaches Dashboard                                          | PASS |
------------------------------------------------------------------------------
Wrong Password Shows Error                                            | PASS |
------------------------------------------------------------------------------
Login                                                                 | PASS |
2 tests, 2 passed, 0 failed
==============================================================================
Output:  .../output.xml
Log:     .../log.html
Report:  .../report.html
```

## Common mistakes

- **Single spaces** between keyword and arguments.
- **Using `Sleep`** instead of `Wait Until ...` keywords.
- **Huge test cases** with dozens of low-level steps instead of user keywords.
- **Keywords named after clicks** rather than business intent.
- **Hardcoding secrets** in `*** Variables ***`.
- **Ignoring `log.html`** and guessing at failures.

## Troubleshooting

- **"No keyword with name ... found"**: check spacing, spelling and that the library is imported.
- **Element not found**: confirm the locator prefix (`id:`, `css:`, `xpath:`) and wait for visibility.
- **Browser fails to start**: update Selenium and the browser; check that Selenium Manager can download a driver on your network.
- **Variables not overridden**: command-line `--variable` overrides file values, but check the exact name and case.

## Key takeaways summary

Robot Framework turns tests into readable keyword sequences backed by powerful libraries. Learn the section structure and two-space rule, build business-level user keywords, prefer `Wait Until` keywords over sleeps, and use `log.html` to understand every run.
