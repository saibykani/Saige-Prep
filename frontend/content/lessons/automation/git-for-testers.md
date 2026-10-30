---
slug: git-for-testers
title: Git for testers
summary: The Git workflow testers use every day — clone, branch, commit, push, pull requests, resolving conflicts and finding the commit that introduced a bug.
level: beginner
duration: 35
tags: [git, version-control, collaboration, automation]
objectives:
  - Explain repositories, commits, branches and remotes
  - Use a feature-branch workflow to contribute test code through pull requests
  - Resolve a simple merge conflict and keep generated files out of the repository
  - Use git log, diff and bisect to investigate when a behaviour changed
prerequisites:
  - Command-line basics (changing directories, running commands)
related: [maven-for-test-projects, page-object-model, debugging-failing-tests, reporting-and-logging]
references:
  - title: Git documentation
    url: https://git-scm.com/doc
  - title: Pro Git book
    url: https://git-scm.com/book/en/v2
  - title: git-bisect reference
    url: https://git-scm.com/docs/git-bisect
interview:
  - q: Describe your Git workflow for adding a new automated test.
    a: "I pull the latest main, create a feature branch named after the ticket, write the test and run it locally, commit in small logical steps with clear messages, push the branch and open a pull request. CI runs the suite on the PR, a teammate reviews it, I address comments with further commits, and once it is green and approved it is merged. I then delete the branch."
  - q: What is the difference between git merge and git rebase?
    a: "Both integrate changes from one branch into another. Merge creates a merge commit that joins two histories and preserves exactly what happened. Rebase replays your commits on top of the target branch, producing a linear history, but rewrites those commits. A common rule is to rebase only local, unshared work and never rewrite history that others have pulled."
  - q: How can Git help a tester find which change introduced a regression?
    a: "git bisect performs a binary search over commit history. I mark a known good commit and a known bad one, Git checks out a commit in the middle, I run the test and mark it good or bad, and it repeats until it identifies the first bad commit. With git bisect run and an automated test, it can do this unattended. git log and git blame then show who changed what and why."
practice:
  - "Clone a practice repository, create a branch feature/login-tests, add a test file, commit, push and open a pull request."
  - "Create a .gitignore for a Maven Selenium project that excludes target/, IDE folders, screenshots, logs and .env files."
  - "Create a deliberate conflict by editing the same line on two branches, merge them, and resolve the conflict by hand."
takeaways:
  - Commit small, logical changes with messages that explain why.
  - Work on branches and integrate through reviewed pull requests with CI checks.
  - Keep generated output (target/, reports, screenshots) and secrets out of Git.
  - Resolve conflicts by understanding both sides, then re-run the tests.
  - git log, diff, blame and bisect turn history into a debugging tool.
quiz:
  - id: git-q1
    type: single
    topic: git-for-testers
    difficulty: beginner
    prompt: Which command uploads your local branch's commits to the remote repository?
    options: ["git commit", "git push", "git fetch", "git add"]
    answer: [1]
    explanation: "git push sends local commits to a remote. git commit records changes locally only, git add stages changes, and git fetch downloads from the remote without changing your branch."
  - id: git-q2
    type: code-output
    topic: git-for-testers
    difficulty: intermediate
    prompt: You edited LoginTests.java and ran only the first command. What does git status report for the file?
    code: |
      git add LoginTests.java
      git status --short
    codeLanguage: bash
    options: ["?? LoginTests.java (untracked)", "M  LoginTests.java (staged modification)", "Nothing; the change is committed", "D  LoginTests.java (deleted)"]
    answer: [1]
    explanation: "After git add, the modification is staged but not yet committed; short status shows M in the first column. ?? would mean a new file Git has never tracked, and nothing is committed until git commit runs."
  - id: git-q3
    type: debugging
    topic: git-for-testers
    difficulty: beginner
    prompt: Every pull request shows hundreds of changed files under target/surefire-reports. What is the right fix?
    options: ["Delete the reports before every commit by hand", "Add target/ to .gitignore and remove the tracked files with git rm -r --cached target", "Stop running tests locally", "Use git push --force"]
    answer: [1]
    explanation: "Generated build output should never be tracked. Ignoring target/ prevents new additions, and git rm --cached removes the already-tracked files from the index without deleting them from disk. Force-pushing rewrites history and does not address the cause."
  - id: git-q4
    type: truefalse
    topic: git-for-testers
    difficulty: intermediate
    prompt: It is generally safe to rebase and force-push a branch that teammates have already pulled and built on.
    options: ["True", "False"]
    answer: [1]
    explanation: "Rebasing rewrites commits, so teammates' copies diverge and their work can be lost or duplicated. Rewrite only your own unshared branches, or coordinate explicitly."
---

## Beginner-friendly explanation

Have you ever saved files called `report_final.docx`, `report_final_v2.docx`, `report_REAL_final.docx`? Git solves that problem properly. It keeps a complete history of every saved version (a **commit**), lets several people work on separate copies at the same time (**branches**), and helps combine their work safely.

For testers, Git matters because **automated tests are code**. They live in the same kind of repository as the application, get reviewed the same way, and run automatically whenever someone pushes a change. Git also gives you a time machine for investigating defects: you can find exactly when a behaviour changed.

## Technical explanation

### Core concepts

| Concept | Meaning |
|---|---|
| Repository | The project folder plus its full history (`.git`) |
| Working tree | The files you are editing now |
| Staging area (index) | Changes selected for the next commit (`git add`) |
| Commit | An immutable snapshot with author, message and parent |
| Branch | A movable pointer to a commit; `main` is the usual default |
| Remote | A shared copy, usually called `origin` |
| `HEAD` | What you currently have checked out |

### Everyday commands

- `git clone <url>`: copy a remote repository
- `git switch -c feature/x`: create and switch to a branch (`git checkout -b` is the older form)
- `git status`, `git diff`: see what changed
- `git add <file>`, `git commit -m "message"`: record a snapshot
- `git pull`: fetch and integrate remote changes; `git push`: publish yours
- `git log --oneline --graph`: view history
- `git stash`: shelve uncommitted work temporarily

### Feature-branch workflow with pull requests

```mermaid
flowchart LR
  A["git pull on main"] --> B["git switch -c feature/checkout-tests"]
  B --> C["Write tests and run mvn test"]
  C --> D["git add and git commit"]
  D --> E["git push -u origin feature/checkout-tests"]
  E --> F["Open pull request"]
  F --> G["CI runs the suite and teammate reviews"]
  G -->|"changes requested"| C
  G -->|"approved and green"| H["Merge to main"]
```

Pull requests (or merge requests) are a feature of hosting platforms rather than of Git itself, but they are where review and CI meet.

### Conflicts

When two branches change the same lines, Git marks the file with `<<<<<<<`, `=======` and `>>>>>>>` sections. You edit the file to the correct final content, `git add` it and complete the merge or rebase. Always re-run the tests after resolving.

### .gitignore

Exclude generated and sensitive files: `target/`, `test-output/`, screenshots, logs, IDE folders (`.idea/`), and `.env` files with credentials.

## Real-world example

A testing team noticed that a discount was applied twice at checkout in the staging environment, but nobody knew when it started. A tester took a commit from two weeks earlier where the automated checkout test passed, and the current failing commit, then ran `git bisect` with the test as the oracle. In a handful of steps Git pointed at a single commit that refactored the price calculation. The defect report included the commit, which made the fix fast and the conversation factual rather than speculative.

## Step-by-step walkthrough

1. **Configure your identity once**: `git config --global user.name` and `user.email`.
2. **Clone and update**: `git clone`, then `git pull` on `main` before starting.
3. **Branch** per task with a descriptive name.
4. **Commit small and often**, with messages that explain why ("Add boundary tests for coupon expiry").
5. **Push and open a pull request**; let CI run.
6. **Respond to review** with new commits; keep the branch up to date with `main`.
7. **After merge**, delete the branch and pull `main` again.

## Code examples

Investigating a regression with `git bisect run`, using a Maven command as the automated check:

```bash
git bisect start
git bisect bad HEAD                 # current commit shows the bug
git bisect good 4f2a9c1             # an older commit where the test passed
git bisect run mvn -q test -Dtest=CheckoutTests#discountAppliedOnce
git bisect reset                    # return to where you started
```

`git bisect run` treats exit code 0 as good and non-zero (except 125, which means skip) as bad, which matches how Maven reports test success and failure.

A starter `.gitignore` for a Java test project:

```text
target/
test-output/
screenshots/
logs/
.idea/
*.iml
.env
```

## Expected output

Illustrative final output of the bisect run (hashes and names are made up for the example):

```text
a71c3e2b9d0f4e8c1a2b3c4d5e6f7a8b9c0d1e2f is the first bad commit
commit a71c3e2b9d0f4e8c1a2b3c4d5e6f7a8b9c0d1e2f
Author: Dev Example <dev@example.test>

    Refactor price calculation into PricingService

 src/main/java/com/shop/PricingService.java | 42 +++++++++++++++++++-------
 1 file changed, 30 insertions(+), 12 deletions(-)
bisect found first bad commit
```

## Common mistakes

- **Committing directly to `main`** instead of using a branch and pull request.
- **Huge commits** mixing unrelated changes, which are hard to review and revert.
- **Vague messages** like "fix" or "update tests".
- **Committing secrets** such as passwords or API tokens; removing them later does not remove them from history, so rotate the secret.
- **Resolving conflicts by blindly choosing "mine" or "theirs"** without understanding both changes.
- **Force-pushing shared branches.**

## Troubleshooting

- **"rejected: non-fast-forward" on push**: the remote has commits you lack; `git pull` (or `git pull --rebase` on your own branch) and push again.
- **Accidentally committed to `main` locally**: create a branch at that commit, then reset `main` to `origin/main` before pushing anything.
- **Lost work after a reset**: `git reflog` lists where `HEAD` has been, so you can recover the commit.
- **Line-ending noise on Windows**: configure `core.autocrlf` or a `.gitattributes` file consistently for the team.

## Key takeaways summary

Git is how test code is shared, reviewed and trusted. Work on branches, commit small and meaningful changes, keep generated files and secrets out, and use pull requests with CI as the gate. Beyond collaboration, Git's history is a powerful debugging tool: `git bisect` can pinpoint the change that broke a behaviour.
