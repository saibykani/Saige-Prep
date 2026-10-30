---
slug: jmeter-csv-data-set-config
title: Test Data with CSV Data Set Config
summary: Give every virtual user its own login and inputs. Learn each CSV Data Set Config field, how sharing mode and recycle settings decide which row a thread gets, and how to guarantee unique data per user.
level: beginner
duration: 35
tags: [performance, jmeter, test-data, csv]
objectives:
  - Create a CSV file of test data and read it with CSV Data Set Config
  - Explain every field, including Variable names, Ignore first line, Recycle on EOF, Stop thread on EOF and Sharing mode
  - Predict which row each thread reads on each iteration
  - Configure the element so that each user gets unique data and the test stops cleanly when data runs out
prerequisites:
  - Variables and properties in JMeter
  - A working test plan with a login request
related: [jmeter-variables-and-properties, jmeter-functions, jmeter-correlation-and-parameterization, api-test-data-management, jmeter-thread-groups]
references:
  - title: Apache JMeter - Component Reference (CSV Data Set Config)
    url: https://jmeter.apache.org/usermanual/component_reference.html
  - title: Apache JMeter Best Practices
    url: https://jmeter.apache.org/usermanual/best-practices.html
  - title: Apache JMeter User Manual
    url: https://jmeter.apache.org/usermanual/index.html
interview:
  - q: How does CSV Data Set Config distribute rows between threads?
    a: "With Sharing mode 'All threads' there is one file pointer for the whole test. Each time any thread starts an iteration it takes the next line, so rows are handed out in order across all threads and no two concurrent reads get the same row. 'Current thread group' gives each thread group its own pointer, and 'Current thread' gives every thread its own pointer, so all threads read the same rows starting from line one."
  - q: How do you make sure each user logs in with a unique account and the test does not silently reuse accounts?
    a: "I provide at least as many rows as logins needed, use Sharing mode All threads, set Recycle on EOF to False and Stop thread on EOF to True. Then each row is used once, and when data runs out threads stop instead of receiving <EOF> or wrapping around. I check the row count against threads times iterations before the run."
  - q: What happens with Recycle on EOF False and Stop thread on EOF False when the file ends?
    a: "The variables get the value <EOF> and the threads keep running, so requests are sent with the literal text <EOF> as username. It usually shows as a burst of login errors near the end of the test. That combination is almost never what you want."
practice:
  - "Create users.csv with a header row and 10 rows of username,password for accounts that exist in your local practice app. Log in with 5 threads and 2 loops and confirm in View Results Tree that all 10 accounts were used once."
  - "Change Sharing mode to Current thread and run again. Write down which usernames each thread used and explain why."
  - "Reduce the file to 6 rows, set Recycle on EOF False and Stop thread on EOF True, and explain the number of samples you observe."
takeaways:
  - CSV Data Set Config reads one line per thread iteration and puts the columns into variables.
  - Sharing mode All threads hands out rows in sequence across all threads; Current thread gives each thread its own copy.
  - Recycle on EOF True wraps around to the top; False plus Stop thread on EOF True ends threads cleanly when data runs out.
  - For unique data, rows needed = threads × iterations per thread.
  - Use relative paths and copy the file to every load generator in distributed tests.
quiz:
  - id: jm-csv-q1
    type: single
    topic: jmeter-csv-data-set-config
    difficulty: beginner
    prompt: Your CSV file's first line is username,password. Which setting stops JMeter from using that line as a test user?
    options: ["Recycle on EOF = False", "Ignore first line = True", "Sharing mode = Current thread", "Delimiter = ;"]
    answer: [1]
    explanation: Ignore first line skips the header row. Recycle on EOF only matters at the end of the file, not the start.
  - id: jm-csv-q2
    type: scenario
    topic: jmeter-csv-data-set-config
    difficulty: intermediate
    prompt: 4 threads, 3 loops each, Sharing mode All threads, Recycle False, Stop thread True. The file has 10 data rows. How many logins are attempted?
    options: ["4", "10", "12", "12, with 2 using <EOF>"]
    answer: [1]
    explanation: Twelve iterations need twelve rows, but only ten exist. After ten rows are consumed, the next threads hitting end of file are stopped, so ten logins happen. <EOF> appears only when Stop thread on EOF is False.
  - id: jm-csv-q3
    type: truefalse
    topic: jmeter-csv-data-set-config
    difficulty: beginner
    prompt: With Sharing mode Current thread, every thread starts reading from the first data row.
    options: ["True", "False"]
    answer: [0]
    explanation: Current thread gives each thread its own file pointer, so all threads read the same rows in the same order. This is useful for per-user sequences but does not give unique data.
  - id: jm-csv-q4
    type: debugging
    topic: jmeter-csv-data-set-config
    difficulty: intermediate
    prompt: Every request uses the username ${username} literally, and jmeter.log shows a FileNotFoundException. What is the most likely fix?
    options: ["Add a Constant Timer", "Fix the Filename path; relative paths resolve from the directory of the .jmx file", "Change the Delimiter to a tab", "Set Recycle on EOF to True"]
    answer: [1]
    explanation: If the file cannot be opened, the variables are never set and stay as literal references. Relative paths are resolved against the test plan's folder, so put the CSV beside the .jmx or correct the path. Recycling cannot help when no file is read.
---

## Beginner-friendly explanation

Picture a theatre with a pile of numbered tickets at the door. Each person who walks in takes the top ticket, so no two people sit in the same seat. If the pile runs out you can either stop letting people in or start the pile again from the top.

**CSV Data Set Config** is that pile of tickets. A **CSV file** ("comma-separated values") is a plain text file where each line is a row and commas separate the columns, for example `alice,Secret1!`. Every time a virtual user (a **thread**) starts a new **iteration** (one pass through its steps), it takes the next line and stores the columns in variables such as `${username}` and `${password}`.

Without it, 100 users would all log in as the same person, which is unrealistic and often hides or creates problems such as caching, locking or session conflicts.

## Technical explanation

Add it with **right-click Thread Group → Add → Config Element → CSV Data Set Config**. Fields:

| Field | Meaning | Typical value |
|---|---|---|
| Filename | Path to the file. Relative paths resolve from the folder of the .jmx | `users.csv` |
| File encoding | Character set used to read the file | `UTF-8` |
| Variable names (comma-delimited) | Names for the columns. If empty, the first line is used as names | `username,password` |
| Ignore first line | Skip a header row (only used when Variable names is filled) | True if file has a header |
| Delimiter | Column separator; use `\t` for tab | `,` |
| Allow quoted data? | Lets values contain the delimiter inside double quotes | False unless needed |
| Recycle on EOF? | At end of file, go back to the first row | False for unique data |
| Stop thread on EOF? | At end of file, stop the thread (only when Recycle is False) | True for unique data |
| Sharing mode | Who shares a file pointer: All threads, Current thread group, Current thread | All threads |

**When a row is read:** once per iteration of each thread, when the element is first used in that iteration. **EOF** means "end of file".

```mermaid
flowchart TD
  A["Thread starts iteration"] --> B{"Rows left in file?"}
  B -->|Yes| C["Take next row, set username and password"]
  B -->|No| D{"Recycle on EOF?"}
  D -->|True| E["Go back to first data row"] --> C
  D -->|False| F{"Stop thread on EOF?"}
  F -->|True| G["Thread stops"]
  F -->|False| H["Variables set to the text EOF marker, requests still sent"]
```

**Sharing modes compared** (file with rows u1…u6, 2 threads, 2 loops, Sharing on All threads vs Current thread):

| Iteration | All threads | Current thread |
|---|---|---|
| Thread 1, loop 1 | u1 | u1 |
| Thread 2, loop 1 | u2 | u1 |
| Thread 1, loop 2 | u3 | u2 |
| Thread 2, loop 2 | u4 | u2 |

(With All threads the exact order depends on which thread asks first, but no row is handed out twice before the file wraps.)

**Unique data rule:** rows needed = threads × iterations per thread. For 50 users × 20 iterations you need 1,000 rows if every login must be unique.

## Step-by-step walkthrough

Practice target: your own local app with test accounts you created. Only test systems you own or are authorised in writing to test.

1. Create `users.csv` next to your `.jmx` file:

```text
username,password
qa_user01,Passw0rd!01
qa_user02,Passw0rd!02
qa_user03,Passw0rd!03
qa_user04,Passw0rd!04
```

2. Add CSV Data Set Config to the Thread Group: Filename `users.csv`, File encoding `UTF-8`, Variable names `username,password`, Ignore first line `True`, Delimiter `,`, Recycle `False`, Stop thread `True`, Sharing mode `All threads`.
3. In the login HTTP Request, body data or parameters: `username` = `${username}`, `password` = `${password}`.
4. Set the Thread Group to 2 threads, 2 loops.
5. Add **View Results Tree**, run, and open each login's **Request** tab.

## Expected output

Illustrative View Results Tree request bodies:

```text
Login (thread 1-1, loop 1)  {"username":"qa_user01","password":"Passw0rd!01"}
Login (thread 1-2, loop 1)  {"username":"qa_user02","password":"Passw0rd!02"}
Login (thread 1-1, loop 2)  {"username":"qa_user03","password":"Passw0rd!03"}
Login (thread 1-2, loop 2)  {"username":"qa_user04","password":"Passw0rd!04"}
```

Change loops to 3 and the threads stop after the fourth row is used: you see four logins, not six.

## Real-world example

A team load-testing an internal banking demo noticed response times were suspiciously fast. Every thread logged in as one account, so the server cached that customer's dashboard. After switching to a CSV of several hundred seeded accounts with All threads sharing, cache hits dropped to realistic levels and a slow database query appeared that the single-user test had hidden.

## Common mistakes

- **Too few rows** with Recycle True, so users silently repeat and caching flatters results.
- **Recycle False and Stop thread False**, sending `<EOF>` as data.
- **Absolute Windows paths** like `C:\Users\me\users.csv` that break on CI and Linux load generators.
- **Header row used as data** because Ignore first line was left False.
- **Placing the element inside a loop controller and expecting a new row per inner loop.** Rows advance per thread iteration, not per inner loop.
- **Real customer data in CSVs.** Use synthetic accounts only.

## Troubleshooting

- **Literal `${username}`:** file not found or variable names misspelled; check `jmeter.log`.
- **Strange characters:** set File encoding to match the file (UTF-8 is safest; avoid a BOM).
- **Same user in two threads:** Sharing mode is Current thread, or the file has duplicates.
- **Distributed runs reuse data:** each remote engine reads its own copy of the file; split the data per engine (see [Non-GUI and distributed](/learn/jmeter/jmeter-non-gui-and-distributed)).

## Preparing the data file

Seed the accounts in your local app first (for example with a script or an admin API you own), then export them to CSV. Keep the file in version control next to the plan if it contains only synthetic data, and generate larger files with a small script rather than by hand.

## Key takeaways summary

CSV Data Set Config turns a text file into per-iteration variables. Choose Sharing mode deliberately, size the file as threads × iterations for unique data, and use Recycle False with Stop thread True so the test never runs on repeated or `<EOF>` data. Combine it with [functions](/learn/jmeter/jmeter-functions) for values that can be generated instead of stored.
