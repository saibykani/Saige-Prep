---
slug: jmeter-gui-tour
title: A guided tour of the JMeter GUI
summary: Learn your way around the JMeter window, including the test plan tree, element panels, toolbar buttons, right-click Add menus, enabling and disabling elements, saving .jmx files and the log viewer, by building and running a tiny plan against a local server.
level: beginner
duration: 25
tags: [performance, jmeter, tools, gui]
objectives:
  - Identify the tree, element panel, toolbar and status area of the JMeter GUI
  - Add, rename, move, disable and delete elements with right-click menus
  - Save and reopen a test plan as a .jmx file
  - Start, stop and clear a run and read errors in the log viewer
prerequisites:
  - Installing JMeter and Java
related: [installing-jmeter, jmeter-fundamentals, jmeter-thread-groups, jmeter-listeners-and-results]
references:
  - title: Apache JMeter - Getting Started
    url: https://jmeter.apache.org/usermanual/get-started.html
  - title: Apache JMeter - Building a Web Test Plan
    url: https://jmeter.apache.org/usermanual/build-web-test-plan.html
  - title: Apache JMeter - Elements of a Test Plan
    url: https://jmeter.apache.org/usermanual/test_plan.html
interview:
  - q: What is a .jmx file?
    a: It is the saved JMeter test plan, an XML file describing the tree of elements and their settings. Because it is plain text, it can be version-controlled in Git, reviewed in pull requests and run later in non-GUI mode with jmeter -n -t plan.jmx.
  - q: What is the difference between Stop and Shutdown in the JMeter GUI?
    a: Stop halts threads immediately, interrupting any samples in progress. Shutdown asks threads to stop gracefully, letting each finish its current sample before ending. Shutdown gives cleaner results; Stop is useful when a test is clearly misbehaving.
  - q: How would you temporarily remove a step from a test plan without deleting it?
    a: Right-click the element and choose Disable, or select it and press Ctrl+T to toggle. Disabled elements are greyed out and skipped at run time, but stay in the plan so they can be re-enabled later.
practice:
  - "Build the tiny plan from the walkthrough against python -m http.server 8000, save it as gui-tour.jmx, close JMeter and reopen it."
  - "Disable the HTTP Request, run the plan and explain what the listener shows. Re-enable it and run again."
  - "Open the log viewer, then deliberately change the port to 8999 (where nothing listens) and find the resulting error in View Results Tree."
takeaways:
  - The left tree is the structure of your test; the right panel edits the selected element.
  - Almost everything is added via right-click → Add on a parent element.
  - Save often; a test plan is a .jmx XML file you can put in version control.
  - Disable elements instead of deleting them while experimenting.
  - Shutdown stops gracefully; Stop stops immediately; Clear All wipes listener results.
quiz:
  - id: jm-gui-q1
    type: single
    topic: jmeter-gui-tour
    difficulty: beginner
    prompt: Where do you right-click to add a Thread Group?
    options: ["On a listener", "On the Test Plan node in the tree", "On the toolbar's Start button", "In the log viewer"]
    answer: [1]
    explanation: Thread Groups are children of the Test Plan, so you right-click Test Plan and choose Add → Threads (Users) → Thread Group. Listeners and the toolbar do not offer this menu.
  - id: jm-gui-q2
    type: truefalse
    topic: jmeter-gui-tour
    difficulty: beginner
    prompt: A disabled element is greyed out and skipped when the test runs, but remains in the saved plan.
    options: ["True", "False"]
    answer: [0]
    explanation: Disabling keeps the element in the .jmx file but tells JMeter to ignore it at run time. Deleting would remove it entirely, which is why disabling is safer while experimenting.
  - id: jm-gui-q3
    type: single
    topic: jmeter-gui-tour
    difficulty: beginner
    prompt: You want threads to finish their current request before the test ends. Which toolbar action fits?
    options: ["Stop", "Shutdown", "Clear All", "Toggle"]
    answer: [1]
    explanation: Shutdown stops threads gracefully after their current sample. Stop interrupts immediately, Clear All only wipes displayed results, and Toggle enables or disables an element.
  - id: jm-gui-q4
    type: debugging
    topic: jmeter-gui-tour
    difficulty: beginner
    prompt: A learner clicks Start but nothing happens and a yellow triangle counter appears in the top right. What should they check first?
    options: ["The log viewer, which shows the error that the warning counter refers to", "Their internet speed", "The Help menu", "Whether the .jmx is open in a text editor"]
    answer: [0]
    explanation: The warning/error counter links to the log viewer, where JMeter writes problems such as an invalid field value. Internet speed is irrelevant for a localhost test.
---

## Beginner-friendly explanation

The JMeter window is like a recipe card holder. On the left is the **list of recipe steps** arranged as a tree: the main recipe, then sections, then individual steps. On the right is the **detail card** for whichever step you clicked: the quantities, temperatures and notes. You add a step by right-clicking where it belongs, then fill in its card. When you are happy, you press the green **Start** button and JMeter "cooks" the recipe.

## Technical explanation

| Area | Location | What it does |
|---|---|---|
| Menu bar | Top | File, Edit, Search, Run, Options, Tools, Help |
| Toolbar | Below menus | New, Templates, Open, Save, Cut/Copy/Paste, Expand/Collapse, Toggle, **Start**, Start no pauses, **Stop**, **Shutdown**, Remote start/stop, **Clear**, **Clear All**, Search, Reset search, Function helper, Help |
| Test plan tree | Left | The hierarchy of elements; position determines scope |
| Element panel | Right | Settings of the selected element |
| Status area | Top right | Elapsed time, warning/error counter (opens the log viewer), active threads e.g. `0/10` |

Every node in the tree is an **element** (also called a component). Common categories you will add via the right-click **Add** menu:

| Add menu category | Examples |
|---|---|
| Threads (Users) | Thread Group, setUp Thread Group, tearDown Thread Group |
| Sampler | HTTP Request, Debug Sampler, JDBC Request |
| Logic Controller | Transaction Controller, Loop Controller, If Controller |
| Config Element | HTTP Request Defaults, HTTP Header Manager, CSV Data Set Config |
| Timer | Constant Timer, Uniform Random Timer |
| Pre/Post Processors | JSR223 PreProcessor, JSON Extractor |
| Assertions | Response Assertion |
| Listener | View Results Tree, Summary Report, Aggregate Report |

The Add menu only shows elements that are valid for the node you right-clicked. That is why you cannot add a sampler directly under Test Plan: samplers must live inside a Thread Group.

Useful shortcuts: **Ctrl+S** save, **Ctrl+R** start, **Ctrl+.** stop, **Ctrl+,** shutdown, **Ctrl+E** clear, **Ctrl+Shift+E** clear all, **Ctrl+T** toggle enable/disable. Elements can be dragged to a new position; a popup asks whether to insert before, after or as a child.

```mermaid
flowchart TD
  TP[Test Plan] --> TG[Thread Group]
  TG --> HR[HTTP Request: GET /]
  TG --> VRT[View Results Tree]
  TG --> SR[Summary Report]
```

## Step-by-step walkthrough

Start your own practice server first: in an empty folder containing an `index.html`, run `python -m http.server 8000`.

1. Launch JMeter. You see **Test Plan** selected. In its panel, change **Name** to `GUI tour`.
2. **Right-click Test Plan → Add → Threads (Users) → Thread Group.** A Thread Group node appears. Set **Number of Threads (users)** to `2` and **Loop Count** to `3`.
3. **Right-click Thread Group → Add → Sampler → HTTP Request.** Set **Protocol** `http`, **Server Name or IP** `localhost`, **Port Number** `8000`, **Method** `GET`, **Path** `/`. Rename it to `Home page` using the Name field; names appear in results, so make them meaningful.
4. **Right-click Thread Group → Add → Listener → View Results Tree**, and again for **Summary Report**.
5. **File → Save Test Plan as** (Ctrl+S) and save as `gui-tour.jmx`. JMeter warns you if you try to run an unsaved plan in some situations, so save first as a habit.
6. Click the green **Start** button. The status area shows active threads, e.g. `2/2`, then `0/2` when finished.
7. Select **View Results Tree**. You see six green-ticked entries named `Home page`. Click one and open the **Response data** tab to see your HTML.
8. Open the log viewer with **Options → Log Viewer** (or click the warning counter). It should show only informational lines.
9. Click **Clear All** to reset listeners before the next run.

## Expected output

Illustrative Summary Report after the run (values will differ on your machine):

| Label | # Samples | Average | Min | Max | Error % |
|---|---|---|---|---|---|
| Home page | 6 | 3 | 1 | 9 | 0.00% |
| TOTAL | 6 | 3 | 1 | 9 | 0.00% |

Six samples, because 2 threads × 3 loops = 6 requests.

## Troubleshooting

| Problem | Cause | Fix |
|---|---|---|
| "Add → Sampler" missing | You right-clicked Test Plan | Right-click the Thread Group instead |
| Red entries with `Connection refused` | Practice server not running or wrong port | Start `python -m http.server 8000`, check Port Number |
| Listener empty after Start | Listener disabled or outside the Thread Group's scope | Enable it; place it under Test Plan or the Thread Group |
| Clicked Start, nothing runs | All Thread Groups disabled, or an error | Check greyed-out nodes and the log viewer |
| Lost your work | Not saved | Save with Ctrl+S often; keep `.jmx` files in Git |

## Real-world example

A tester reviewing a colleague's `.jmx` file opens it in the GUI, uses **Expand All** to see the whole tree, and uses **Search** (the magnifier) to highlight every element that mentions `login`. They disable an experimental branch rather than deleting it and save the plan to the team repository. Because the tree is readable and elements are well named, the review takes minutes.

Before moving on, try the **Templates** button on the toolbar (the icon next to Open). It offers ready-made starting plans such as a simple web test. Opening one and reading its tree is a good way to see how experienced users arrange elements. Also explore **Options → Look and Feel** if the default theme is hard to read, and **Options → Zoom In** to enlarge text on high-resolution screens.

## Common mistakes

- **Leaving default names** like "HTTP Request" everywhere, making results unreadable.
- **Running heavy load from the GUI.** The GUI is for building and debugging; see [non-GUI execution](/learn/jmeter/jmeter-non-gui-and-distributed).
- **Forgetting Clear All** and mixing results from several runs.
- **Ignoring the warning counter** in the top right.
- **Pointing practice tests at public websites.** Only use servers you own.

## Key takeaways summary

The tree on the left defines your test; the panel on the right configures the selected element. Add elements with right-click → Add on the right parent, name them clearly, save often, disable rather than delete while experimenting, and check the log viewer whenever something looks wrong. Next, put it all together in [JMeter fundamentals](/learn/jmeter/jmeter-fundamentals).
