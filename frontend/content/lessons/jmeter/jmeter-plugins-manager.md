---
slug: jmeter-plugins-manager
title: JMeter Plugins Manager and Popular Plugins
summary: Install the third-party JMeter Plugins Manager, add popular plugins such as Custom Thread Groups, the Throughput Shaping Timer and 3 Basic Graphs, and manage plugins safely across machines.
level: intermediate
duration: 30
tags: [performance, jmeter, plugins, load-testing, tools]
objectives:
  - Install the JMeter Plugins Manager and open it from the Options menu
  - Install, upgrade and uninstall plugins and understand where their jars go
  - Choose between the Concurrency, Ultimate and Stepping thread groups
  - Keep plugin versions consistent across every machine that runs a test
prerequisites:
  - JMeter installed and running (5.6.x)
  - Thread groups and timers basics
related: [jmeter-thread-groups, jmeter-timers-and-throughput-shaping, jmeter-non-gui-and-distributed, jmeter-ci-cd, jmeter-backend-listener-grafana]
references:
  - title: JMeter Plugins (third-party project)
    url: https://jmeter-plugins.org/
  - title: Apache JMeter User Manual
    url: https://jmeter.apache.org/usermanual/index.html
  - title: Apache JMeter - Component Reference
    url: https://jmeter.apache.org/usermanual/component_reference.html
interview:
  - q: What is the JMeter Plugins Manager and is it part of Apache JMeter?
    a: It is a third-party plugin from the jmeter-plugins.org project, not part of the Apache JMeter distribution. You drop its jar into lib/ext, restart JMeter, and it adds Options, Plugins Manager, a GUI to install, upgrade and remove other plugins and their dependencies. Because plugins are third-party, I check their maintenance status and pin versions so every load generator and CI agent runs the same set.
  - q: When would you use the Concurrency Thread Group instead of the standard Thread Group?
    a: When I want to describe the load as a target number of concurrent users held for a duration, with a ramp-up in steps. The Concurrency Thread Group keeps the target concurrency by starting new threads when others finish, and its graph previews the load shape. The standard Thread Group is enough for simple tests, and for a target throughput I would pair it with a throughput-based timer instead.
  - q: A test runs on your laptop but fails on the CI agent with a class-not-found error. What do you check?
    a: That a plugin used by the .jmx is missing on the agent. The test plan stores the plugin's class name, so a machine without the jar cannot load it. I would install the same plugins at the same versions on the agent, ideally with the Plugins Manager command-line tool or by baking them into the JMeter image, and keep the list under version control.
practice:
  - "Install the Plugins Manager, then install Custom Thread Groups and 3 Basic Graphs. Confirm the new elements appear under Add, Threads and Add, Listener."
  - "Build the same load shape (0 to 40 users in 4 steps over 4 minutes, hold 10 minutes) with the Concurrency Thread Group and describe how you would do it with the standard Thread Group."
  - "Write down every plugin and version your test plan needs, then reproduce that set on a second machine or a fresh JMeter folder."
takeaways:
  - Plugins from jmeter-plugins.org are third-party, not part of Apache JMeter.
  - Install the Plugins Manager jar into lib/ext and restart; then use Options, Plugins Manager.
  - Custom Thread Groups and the Throughput Shaping Timer are the most widely used plugins for load shapes.
  - Every machine that runs the .jmx needs the same plugins at the same versions.
  - Install only what you need, and only load-test systems you own or are authorized to test.
quiz:
  - id: jm-plug-q1
    type: single
    topic: jmeter-plugins-manager
    difficulty: beginner
    prompt: Where do you put the Plugins Manager jar so JMeter loads it?
    options: ["JMETER_HOME/bin", "JMETER_HOME/lib/ext", "JMETER_HOME/extras", "Next to the .jmx file"]
    answer: [1]
    explanation: JMeter scans lib/ext for plugin jars at start-up, so the Plugins Manager jar goes there and JMeter must be restarted. bin holds scripts and properties, and putting a jar next to the .jmx does nothing.
  - id: jm-plug-q2
    type: truefalse
    topic: jmeter-plugins-manager
    difficulty: beginner
    prompt: The Concurrency Thread Group is a built-in Apache JMeter element available without any plugins.
    options: ["True", "False"]
    answer: [1]
    explanation: It is part of the third-party Custom Thread Groups plugin set from jmeter-plugins.org. Built-in thread groups are the Thread Group, setUp Thread Group, tearDown Thread Group and Open Model Thread Group.
  - id: jm-plug-q3
    type: debugging
    topic: jmeter-plugins-manager
    difficulty: intermediate
    prompt: "A colleague opens your .jmx and gets an error mentioning a missing class from the kg.apc package. What is the most likely cause?"
    options: ["The .jmx file is corrupted", "Their Java version is too new", "A jmeter-plugins.org plugin used in the plan is not installed on their machine", "They are running in non-GUI mode"]
    answer: [2]
    explanation: kg.apc is the package used by many jmeter-plugins.org plugins. The plan references a plugin class their JMeter cannot find, so they need the same plugin installed. Corruption or Java version would give different errors.
  - id: jm-plug-q4
    type: multiple
    topic: jmeter-plugins-manager
    difficulty: intermediate
    prompt: Which are good practices when using JMeter plugins? Select all that apply.
    options: ["Install only the plugins the test needs", "Record plugin names and versions with the test plan", "Install every available plugin just in case", "Use the same plugin set on every load generator and CI agent"]
    answer: [0, 1, 3]
    explanation: Fewer plugins mean fewer conflicts and faster start-up, and a recorded, consistent set makes runs reproducible. Installing everything adds jars that can conflict and makes machines drift apart.
---

## Beginner-friendly explanation

Think of JMeter as a phone that comes with good standard apps. The **Plugins Manager** is an app store you add yourself. Once it is installed, you can browse extra "apps" (plugins), install them with a click, and remove them when you no longer need them.

One important detail: this app store is not run by Apache. The plugins come from the community project at jmeter-plugins.org. They are widely used and very helpful, but they are **third-party**, so you treat them like any dependency: install only what you need and keep track of versions.

## Technical explanation

Apache JMeter loads extra components from jar files in `lib/ext` (and their libraries from `lib`) when it starts. The Plugins Manager is itself one such jar. After installation it adds **Options → Plugins Manager**, which:

- lists **Installed Plugins**, **Available Plugins** and **Upgrades**;
- downloads plugin jars and their dependencies into the right folders;
- asks to restart JMeter to apply changes.

Popular plugins you will meet often:

| Plugin | What it adds | Typical use |
|---|---|---|
| Custom Thread Groups | Concurrency, Ultimate, Stepping and Arrivals thread groups | Step and staircase load shapes with a preview graph |
| Throughput Shaping Timer | A timer driven by a schedule of target requests per second | Hitting a precise RPS profile (see [timers](/learn/jmeter/jmeter-timers-and-throughput-shaping)) |
| 3 Basic Graphs | Active Threads Over Time, Response Times Over Time, Transactions per Second | Quick visual checks while debugging |
| PerfMon Metrics Collector | Server CPU and memory charts via a server agent | Legacy; prefer a real monitoring stack today |

Thread group choices:

- **Concurrency Thread Group**: target concurrency, ramp-up time, number of steps and hold time. It keeps the target number of threads running.
- **Ultimate Thread Group**: a table of rows (start threads, initial delay, startup time, hold, shutdown) for arbitrary shapes such as spikes.
- **Stepping Thread Group**: an older staircase group; the Concurrency Thread Group is generally preferred for new plans.

The PerfMon server agent is a legacy tool that is no longer actively developed. For server-side metrics, use your platform's monitoring (for example, an exporter feeding Grafana) and keep JMeter focused on generating load.

A `.jmx` file stores the Java class name of every element. If the plan uses a plugin, every machine that opens or runs it needs the plugin installed.

## Step-by-step walkthrough

1. Go to https://jmeter-plugins.org/ and open the Plugins Manager install page. Download `jmeter-plugins-manager-<version>.jar`.
2. Close JMeter. Copy the jar into `JMETER_HOME/lib/ext`.
3. Start JMeter (`bin/jmeter.bat` on Windows, `bin/jmeter` on macOS/Linux).
4. Open **Options → Plugins Manager**.
5. Select the **Available Plugins** tab. Search for "Custom Thread Groups" and tick it. Tick "3 Basic Graphs" too.
6. Click **Apply Changes and Restart JMeter**. JMeter downloads the jars and restarts.
7. Right-click the Test Plan → **Add → Threads (Users)**. You now see `bzm - Concurrency Thread Group` and `jp@gc - Ultimate Thread Group`.
8. Add a Concurrency Thread Group: Target Concurrency `20`, Ramp Up Time `2` (minutes), Ramp-Up Steps Count `4`, Hold Target Rate Time `5` (minutes). The preview graph shows four steps of 5 users.
9. To remove a plugin later, open the **Installed Plugins** tab, untick it and apply.

## Code examples

The Plugins Manager also ships a command-line helper, which is handy for servers and CI. After installing the manager jar, generate the helper script once:

```bash
# from JMETER_HOME; the cmdrunner jar version may differ in your download
java -cp lib/ext/jmeter-plugins-manager-*.jar org.jmeterplugins.repository.PluginManagerCMDInstaller

# then install plugins by id (comma-separated)
bin/PluginsManagerCMD.sh install jpgc-casutg,jpgc-graphs-basic
bin/PluginsManagerCMD.sh status
```

On Windows use `bin\PluginsManagerCMD.bat`. The cmd installer needs the `cmdrunner` jar in `lib`; download it from the jmeter-plugins.org documentation if the command reports it missing. Plugin ids such as `jpgc-casutg` (Custom Thread Groups) are listed on each plugin's page.

## Expected output

After step 6 the **Installed Plugins** tab lists Custom Thread Groups and 3 Basic Graphs, and `lib/ext` contains new `jmeter-plugins-*.jar` files. Running `PluginsManagerCMD status` prints the installed plugin ids with versions, for example a line containing `jpgc-casutg=` followed by a version number.

## Real-world example

A team building a release-gate test needs "ramp to 60 users in three steps, hold for 15 minutes". They install Custom Thread Groups, model the shape with a Concurrency Thread Group, and commit a short `plugins.txt` next to the `.jmx` listing each plugin id and version. Their CI image runs `PluginsManagerCMD install` with that list, so laptop and pipeline always match. When the CI agent once failed with a missing class, the list made the fix obvious: a plugin had been added locally and not recorded.

## Common mistakes

- **Treating plugins as part of JMeter.** They are third-party; read each plugin's page for maintenance status.
- **Forgetting to restart** after copying the manager jar or applying changes.
- **Installing everything.** Extra jars slow start-up and can conflict.
- **Not reproducing plugins on other machines**, which breaks distributed runs and CI.
- **Leaving 3 Basic Graphs listeners enabled during the real load run**, which adds overhead on the load generator.
- **Relying on PerfMon** for server metrics in new projects.

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| No Plugins Manager in Options | Jar not in `lib/ext`, or JMeter not restarted | Check the path and restart |
| Plugins Manager cannot download | Corporate proxy | Start JMeter with proxy settings (`-H host -P port`) or install jars manually |
| `ClassNotFoundException` for `kg.apc...` | Plugin missing on this machine | Install the same plugin version |
| Errors after upgrading JMeter | Old plugin jars copied across | Reinstall plugins on the new JMeter |

## Key takeaways summary

The Plugins Manager makes JMeter extensible with a few clicks, but every plugin is a dependency you own. Install what you need, record versions, reproduce the same set everywhere the plan runs, and keep heavy graph listeners out of real load runs. As always, only load-test systems you own or are explicitly authorized to test.
