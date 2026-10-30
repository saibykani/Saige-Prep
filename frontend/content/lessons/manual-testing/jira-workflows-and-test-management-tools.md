---
slug: jira-workflows-and-test-management-tools
title: JIRA workflows and test management tools
summary: How issues move through a JIRA workflow, how testers use statuses, links and JQL to stay in control, and how test management tools connect test cases, executions and defects to stories.
level: beginner
duration: 30
tags: [jira, test-management, workflow, defect-tracking, traceability]
objectives:
  - Describe a typical story workflow and bug workflow using generic JIRA statuses
  - Explain the difference between statuses, transitions and resolutions
  - Write basic JQL queries a tester needs every day
  - Explain what a test management tool adds - test cases, cycles, executions and traceability to requirements and defects
prerequisites:
  - Defect lifecycle
  - Test scenarios and test cases
related: [defect-lifecycle, traceability-matrix-and-coverage, writing-a-great-defect-report, test-execution-and-closure-reports, scrum-roles-and-ceremonies]
references:
  - title: Atlassian Jira guides
    url: https://www.atlassian.com/software/jira/guides
  - title: The Scrum Guide (2020)
    url: https://www.scrumguides.org/scrum-guide.html
  - title: ISTQB Certified Tester Foundation Level (CTFL) v4.0
    url: https://www.istqb.org/certifications/certified-tester-foundation-level-ctfl-v4-0/
interview:
  - q: Describe a bug workflow you have used in JIRA.
    a: A common one is Open, In Progress, Resolved, then either Closed after the tester confirms the fix or Reopened if it still fails. Resolved usually carries a resolution such as Fixed, Duplicate, Cannot Reproduce or Won't Fix, and only Fixed should go to retest. Workflows are configurable, so every company names statuses differently, but the important ideas are clear ownership at each status, a confirmation step by someone other than the fixer, and a reopen path.
  - q: What is the difference between a status and a resolution in JIRA?
    a: A status is where the issue is in its workflow, such as In Progress or In Review. A resolution records how the issue was finished, such as Fixed, Duplicate or Won't Do. Issues without a resolution are treated as unresolved in reports and filters, so a misconfigured workflow that reaches Done without setting a resolution makes dashboards misleading.
  - q: How do you track test coverage and execution for a release using JIRA?
    a: Plain JIRA tracks stories and bugs, so I would use a test management app or tool that links test cases to stories. For the release I create a test cycle or test plan, add the relevant test cases, record each execution as passed, failed, blocked or not run, and link failures to defects. Then I report coverage (stories with linked tests), execution progress and open defects by severity, usually through a JQL-based dashboard and the tool's execution reports.
  - q: Give me a JQL query to find all open high-priority bugs for the next release.
    a: Something like project = SHOP AND issuetype = Bug AND resolution = Unresolved AND priority in (Highest, High) AND fixVersion = "2.4.0" ORDER BY priority DESC, created ASC. Priority names and versions depend on the project configuration, so I would check those values first.
practice:
  - "Draw a bug workflow with statuses and transitions for your team. Mark who owns the issue in each status and which transitions need a comment."
  - "Write JQL for - bugs you reported in the last 7 days; stories in the current sprint with no linked test; reopened bugs for the next release."
  - "Design a test cycle for a small release with 5 stories. List the test cases you would add and the status values you would report."
takeaways:
  - A workflow is statuses plus transitions; resolution records how an issue ended and drives reporting.
  - Statuses are configurable, so learn your team's workflow rather than assuming a default.
  - JQL lets testers build filters and dashboards for their own work and for release status.
  - Test management tools add test cases, cycles, executions and traceability on top of issue tracking.
  - Link every failed execution to a defect and every test to a requirement, so coverage and risk are visible.
quiz:
  - id: jiraflow-q1
    type: single
    topic: jira-workflows-and-test-management-tools
    difficulty: beginner
    prompt: In a typical bug workflow, which transition should a tester perform after verifying that a fix works in the test environment?
    options: ["Resolved to Closed", "Open to In Progress", "In Progress to Resolved", "Closed to Open"]
    answer: [0]
    explanation: After a developer resolves the bug as Fixed, the tester retests and confirms, moving it from Resolved to Closed (or Done). Open to In Progress and In Progress to Resolved are normally developer transitions, and Closed to Open would reopen a bug.
  - id: jiraflow-q2
    type: code-output
    topic: jira-workflows-and-test-management-tools
    difficulty: intermediate
    prompt: Which issues does this JQL return?
    code: |
      project = SHOP AND issuetype = Bug AND reporter = currentUser()
        AND created >= -7d ORDER BY created DESC
    codeLanguage: sql
    options: ["All bugs in SHOP created in the last 7 days", "Bugs in SHOP reported by you in the last 7 days, newest first", "Bugs in SHOP assigned to you in the last 7 days", "Bugs in SHOP reported by you that are older than 7 days"]
    answer: [1]
    explanation: reporter = currentUser() limits results to issues you reported, and created >= -7d means created within the last 7 days. ORDER BY created DESC puts the newest first. Assignee is a different field, so the assigned option is wrong.
  - id: jiraflow-q3
    type: truefalse
    topic: jira-workflows-and-test-management-tools
    difficulty: beginner
    prompt: Every JIRA project uses the same fixed set of workflow statuses.
    options: ["True", "False"]
    answer: [1]
    explanation: False. Workflows are configurable per project and issue type. Simple boards may use To Do, In Progress and Done, while others add statuses such as In Review, Ready for Test or Blocked.
  - id: jiraflow-q4
    type: multiple
    topic: jira-workflows-and-test-management-tools
    difficulty: intermediate
    prompt: Which capabilities does a test management tool typically add beyond plain issue tracking? Select all that apply.
    options: ["Reusable test cases with steps and expected results", "Test cycles or runs that record pass, fail, blocked and not run", "Traceability from requirements to tests to defects", "Automatically fixing failed tests", "Execution progress and coverage reports"]
    answer: [0, 1, 2, 4]
    explanation: Test management tools store test cases, organise executions into cycles, link tests to requirements and defects, and report progress and coverage. No tool fixes failing tests for you; that needs investigation by a person.
---

## Beginner-friendly explanation

Think of a parcel-tracking page. A parcel moves from "Label created" to "In transit" to "Out for delivery" to "Delivered", and at every step you know who has it. If the delivery fails, it goes back to "Returned to depot".

JIRA works the same way for work items. A story or a bug moves through **statuses**, and each move is a **transition**. Testers rely on this to know what is ready to test, what is blocked and what has been fixed. A **test management tool** adds the missing piece: a list of the checks you planned, a record of which ones you ran, and what happened.

## Technical explanation

### Workflow vocabulary

| Term | Meaning |
|---|---|
| Issue type | Story, Bug, Task, Sub-task, Epic (configurable) |
| Status | Where the issue is now, such as In Progress |
| Transition | A permitted move between statuses, which may require fields or comments |
| Resolution | How the issue ended, such as Fixed, Duplicate, Cannot Reproduce, Won't Do |
| Fix version | The release the work is planned for |
| Link | A relationship such as "blocks", "relates to" or "is tested by" (link types vary) |

Workflows are configured per project and issue type, so names differ between teams. The examples below use common, generic statuses.

### Example story workflow

```mermaid
stateDiagram-v2
  [*] --> ToDo
  ToDo --> InProgress
  InProgress --> InReview
  InReview --> InProgress: changes requested
  InReview --> ReadyForTest
  ReadyForTest --> InTest
  InTest --> InProgress: acceptance criteria fail
  InTest --> Done: criteria pass and Definition of Done met
  Done --> [*]
```

### Example bug workflow

```mermaid
stateDiagram-v2
  [*] --> Open
  Open --> InProgress
  Open --> Resolved: duplicate or won't fix
  InProgress --> Resolved: fixed
  Resolved --> Closed: verified by tester
  Resolved --> Reopened: still failing
  Reopened --> InProgress
  Closed --> [*]
```

A good bug workflow has an owner for each status, a verification step by someone other than the person who fixed it, and a **Reopened** path that keeps history instead of creating a duplicate bug.

### JQL a tester uses daily

```sql
-- Stories ready for me to test in the current sprint
project = SHOP AND issuetype = Story AND status = "Ready for Test" AND sprint in openSprints()

-- Open high-priority bugs for the next release
project = SHOP AND issuetype = Bug AND resolution = Unresolved
  AND priority in (Highest, High) AND fixVersion = "2.4.0" ORDER BY priority DESC

-- Bugs I reported in the last 7 days
project = SHOP AND issuetype = Bug AND reporter = currentUser() AND created >= -7d

-- Bugs resolved and waiting for retest
project = SHOP AND issuetype = Bug AND status = Resolved AND resolution = Fixed
```

Status, priority and version names must match your project's configuration exactly.

### Test management tools

Plain issue tracking does not model test cases or executions well. Test management tools fill the gap. Some run as apps inside JIRA (for example Xray or Zephyr) and some are standalone with a JIRA integration (for example TestRail). Names and features vary by product and edition, but the core model is the same:

| Concept | Purpose |
|---|---|
| Test case | Reusable steps, data and expected results; linked to a requirement |
| Test set or suite | A group of related cases, such as checkout regression |
| Test plan or cycle | The cases to run for a given build, sprint or release |
| Execution | One run of a case, with status Passed, Failed, Blocked or Not Run, plus evidence |
| Defect link | Each failed execution linked to a bug |

These links give you a live [traceability matrix](/learn/manual-testing/traceability-matrix-and-coverage): requirement, tests, executions, defects.

## Real-world example

A team preparing a release of an online grocery app has 14 stories. The tester creates a release test cycle containing the new story tests plus the checkout and payments regression sets. Each morning, a dashboard built from JQL filters shows stories in Ready for Test, executions by status, and unresolved bugs by priority for the fix version.

Two days before the planned release, the dashboard shows one story with no linked tests. The tester raises it at the Daily Scrum; it turns out the story was added late and nobody had analysed it. Because the gap was visible, it was tested in time instead of shipping untested.

## Step-by-step walkthrough

1. **Learn your workflow**: list every status, who owns it and which transitions you are expected to perform.
2. **Create personal filters** for "ready for me to test" and "waiting for my retest".
3. **Link tests to stories** as you write them, so coverage is always visible.
4. **Create a test cycle** per sprint or release and add the right cases.
5. **Record executions honestly**: Blocked is not Failed, and Not Run is not Passed.
6. **Link every failure to a defect** with clear steps and evidence.
7. **Build a release dashboard** from saved filters and share it with the team.

## Common mistakes

- **Closing bugs without retesting**, or retesting in a different environment from the fix.
- **Creating new bugs instead of reopening** when a fix fails, which loses history.
- **Reaching Done without a resolution**, making the issue appear unresolved in reports.
- **Recording Blocked tests as Failed**, which hides the real cause (environment, data, dependency).
- **Copying another team's workflow** instead of designing one that fits how your team works.
- **Too many statuses**, which turns the board into bureaucracy without adding information.

## Troubleshooting

- **A JQL filter returns nothing.** Check exact status names, quotes around values with spaces, and the project key.
- **The board shows items in the wrong column.** Board columns map to statuses; ask the board administrator to check the mapping.
- **Coverage looks complete but bugs still escape.** Linking a test to a story only proves a test exists, not that it is good; review test design for risky stories.

## Key takeaways summary

JIRA models work as issues moving through configurable workflows; testers use statuses, resolutions, links and JQL to stay in control. Test management tools add test cases, cycles and executions so that coverage, progress and defects are traceable for every release.
