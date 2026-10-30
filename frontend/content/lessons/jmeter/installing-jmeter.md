---
slug: installing-jmeter
title: Installing JMeter and Java step by step
summary: Install a Java JDK and Apache JMeter 5.6.x on Windows, macOS or Linux, verify both work, launch the GUI, and fix the most common installation errors such as a missing JAVA_HOME or the wrong download.
level: beginner
duration: 25
tags: [performance, jmeter, installation, tools]
objectives:
  - Install a supported Java JDK and verify it with java -version
  - Download the correct JMeter binary archive and extract it
  - Launch JMeter in GUI mode on Windows, macOS or Linux
  - Diagnose and fix common installation errors
prerequisites:
  - What is Apache JMeter
  - Ability to open a terminal or command prompt
related: [what-is-jmeter, jmeter-gui-tour, jmeter-fundamentals, jmeter-non-gui-and-distributed]
references:
  - title: Apache JMeter - Getting Started
    url: https://jmeter.apache.org/usermanual/get-started.html
  - title: Apache JMeter - Download
    url: https://jmeter.apache.org/download_jmeter.cgi
  - title: Eclipse Adoptium (Temurin JDK)
    url: https://adoptium.net/
  - title: Apache JMeter User Manual
    url: https://jmeter.apache.org/usermanual/index.html
interview:
  - q: What do you need installed to run JMeter, and how do you check it?
    a: JMeter is a Java application, so you need a Java runtime; JMeter 5.6 requires Java 8 or later, and in practice I use a current LTS JDK such as 17 or 21. I check with java -version in a terminal. Then I download the binary zip or tgz from the official Apache site, extract it, and run bin/jmeter.bat on Windows or bin/jmeter on macOS and Linux.
  - q: What is the difference between the JMeter binary and source downloads?
    a: The binary archive contains the ready-to-run application with its bin and lib folders. The source archive contains the Java source code and must be built first. Testers almost always want the binary; downloading source by mistake is a classic reason the bin/jmeter script is missing.
  - q: JMeter fails to start with an error that Java cannot be found. How do you troubleshoot it?
    a: First I run java -version to see whether Java is on the PATH at all. If not, I install a JDK or fix PATH. If several Java versions are installed, I set JAVA_HOME to the JDK folder I want and reopen the terminal so the new variable is picked up, then start JMeter again from its bin folder.
practice:
  - "Install a JDK, run java -version and write down the exact version it prints."
  - "Download and extract JMeter 5.6.x, launch the GUI, and note the version shown in Help → About."
  - "Start python -m http.server 8000 in an empty folder and open http://localhost:8000 in your browser to confirm your practice server works."
takeaways:
  - JMeter needs Java 8 or later; use a current LTS JDK such as 17 or 21.
  - Download the binary archive, not the source archive, from jmeter.apache.org.
  - Start the GUI with bin/jmeter.bat on Windows or bin/jmeter on macOS and Linux.
  - Avoid install paths with spaces and keep one clear JAVA_HOME.
  - The console window that opens with the GUI is where errors appear, so do not close it.
quiz:
  - id: jm-install-q1
    type: single
    topic: installing-jmeter
    difficulty: beginner
    prompt: Which command confirms that Java is installed and on your PATH?
    options: ["jmeter --java", "java -version", "javac --install", "python -m java"]
    answer: [1]
    explanation: java -version prints the installed Java version if Java is on the PATH. The other commands do not exist for this purpose; javac is the compiler and has no install option.
  - id: jm-install-q2
    type: single
    topic: installing-jmeter
    difficulty: beginner
    prompt: On Windows, which file do you run to open the JMeter GUI?
    options: ["bin/jmeter.bat", "lib/ApacheJMeter.jar.zip", "src/main.java", "bin/jmeter-server"]
    answer: [0]
    explanation: bin/jmeter.bat is the Windows launcher for the GUI. jmeter-server starts a remote engine for distributed testing, which is a different purpose, and the other paths do not exist.
  - id: jm-install-q3
    type: debugging
    topic: installing-jmeter
    difficulty: beginner
    prompt: A learner extracted apache-jmeter-5.6.3_src.zip and cannot find any jmeter launcher in the bin folder. What went wrong?
    options: ["Java is too new", "They downloaded the source archive instead of the binary archive", "Their antivirus deleted the GUI", "JMeter only runs on Linux"]
    answer: [1]
    explanation: The _src archive holds source code that must be built. The binary archive is ready to run and contains the launchers. A Java version problem would produce an error when starting, not a missing file.
  - id: jm-install-q4
    type: truefalse
    topic: installing-jmeter
    difficulty: beginner
    prompt: After changing JAVA_HOME, an already-open terminal automatically sees the new value.
    options: ["True", "False"]
    answer: [1]
    explanation: Environment variables are read when a terminal starts. You must open a new terminal after changing them; this is why a fix often seems not to work at first.
---

## Beginner-friendly explanation

Installing JMeter is like setting up a games console. First you need a power supply (Java), because the console (JMeter) simply cannot switch on without it. Then you unpack the console from its box (extract the zip) and press the power button (run the launcher script). There is no installer wizard: JMeter is a folder you unzip and run.

**Java** is a programming platform. Programs written in Java need a **Java Runtime** to run. The **JDK** (Java Development Kit) includes that runtime plus developer tools; installing a JDK is the simplest choice.

## Technical explanation

| Requirement | Detail |
|---|---|
| Java | JMeter 5.6.x needs Java 8 or later. Use a current LTS (long-term support) JDK such as 17 or 21 |
| Where to get Java | A free OpenJDK build, for example Eclipse Temurin from adoptium.net |
| JMeter download | The **Binaries** section of jmeter.apache.org/download_jmeter.cgi: `apache-jmeter-5.6.x.zip` (Windows) or `.tgz` (macOS/Linux) |
| Launchers | `bin/jmeter.bat` (Windows), `bin/jmeter` (macOS/Linux) |
| Disk layout | `bin` (scripts, `jmeter.properties`), `lib` (libraries), `lib/ext` (plugins), `docs`, `printable_docs` |

Two **environment variables** matter. `PATH` is the list of folders your terminal searches for commands; if Java's `bin` folder is on it, `java` works anywhere. `JAVA_HOME` points to the JDK folder and is used by many Java tools to pick a specific Java when several are installed.

```mermaid
flowchart TD
  A[Install JDK 17 or 21] --> B{java -version works?}
  B -- no --> C[Fix PATH or JAVA_HOME, reopen terminal] --> B
  B -- yes --> D[Download JMeter binary zip/tgz]
  D --> E[Extract to a path without spaces]
  E --> F[Run bin/jmeter.bat or bin/jmeter]
  F --> G[JMeter GUI opens]
```

## Step-by-step walkthrough

**1. Install Java.** Go to https://adoptium.net/, choose an LTS release (17 or 21) for your operating system and run the installer. On Windows, tick the options to set `JAVA_HOME` and add to `PATH` if offered.

**2. Verify Java.** Open a **new** terminal (Command Prompt or PowerShell on Windows, Terminal on macOS/Linux):

```bash
java -version
```

**3. Download JMeter.** Visit https://jmeter.apache.org/download_jmeter.cgi. Under **Binaries**, download `apache-jmeter-5.6.x.zip` (or `.tgz`). Do not pick the file with `_src` in its name. Optionally verify the file with the published SHA-512 checksum.

**4. Extract it** to a simple path such as `C:\tools\apache-jmeter-5.6.3` or `~/tools/apache-jmeter-5.6.3`. Avoid folders with spaces.

**5. Launch the GUI.**

```bash
# Windows (Command Prompt)
cd C:\tools\apache-jmeter-5.6.3\bin
jmeter.bat

# macOS / Linux
cd ~/tools/apache-jmeter-5.6.3/bin
./jmeter
```

A console window appears first, then the JMeter window. Keep the console open; closing it closes JMeter.

**6. Confirm the version** via **Help → About**.

**7. Prepare your practice target.** In a separate terminal, create an empty folder, add a file named `index.html` with any text, and run:

```bash
python -m http.server 8000
```

Open `http://localhost:8000` in a browser. This server is yours, so it is a safe target for every exercise in this track. Never point practice tests at websites you do not own.

**8. Optional conveniences.** You can add JMeter's `bin` folder to your PATH so that typing `jmeter` works from any terminal. If you later build large plans, JMeter's memory (the Java heap) can be raised by setting the `HEAP` environment variable before launching, for example `HEAP=-Xms1g -Xmx1g`; the defaults are fine for every exercise in this module. Leave `jmeter.properties` untouched for now: when you do want to change a setting, put it in `bin/user.properties` instead, so upgrades do not overwrite your changes.

## Expected output

Illustrative output of `java -version` (your vendor and build numbers will differ):

```text
openjdk version "21.0.4" 2024-07-16 LTS
OpenJDK Runtime Environment Temurin-21.0.4+7 (build 21.0.4+7-LTS)
OpenJDK 64-Bit Server VM Temurin-21.0.4+7 (build 21.0.4+7-LTS, mixed mode, sharing)
```

The JMeter console prints a reminder similar to this (illustrative):

```text
================================================================================
Don't use GUI mode for load testing !, only for Test creation and Test debugging.
For load testing, use CLI Mode (was NON GUI):
   jmeter -n -t [jmx file] -l [results file] -e -o [Path to web report folder]
================================================================================
```

That message is not an error; it is JMeter's own advice, covered in [non-GUI and distributed execution](/learn/jmeter/jmeter-non-gui-and-distributed).

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `'java' is not recognized` / `command not found` | Java not installed or not on PATH | Install a JDK; add its `bin` to PATH; open a new terminal |
| Console flashes and closes on Windows | Java missing or wrong JAVA_HOME | Run `jmeter.bat` from an open Command Prompt so you can read the error |
| `Permission denied` running `./jmeter` | Script not executable | `chmod +x jmeter` in the bin folder |
| No launcher in `bin` | Downloaded the `_src` archive | Download the binary archive instead |
| Odd path errors | Spaces or special characters in the path | Move JMeter to a simple path |
| Old Java used despite new install | Old JAVA_HOME still set | Update JAVA_HOME to the new JDK, reopen the terminal |
| Port 8000 already in use | Another program uses it | Run `python -m http.server 8001` and use that port |

## Real-world example

A QA team onboarding several new testers writes a one-page setup checklist: install the same LTS JDK, download the same JMeter 5.6.x binary from the official site, extract to the same folder path, and confirm with Help → About. Because everyone runs identical versions, a `.jmx` file shared in the team repository behaves the same on every laptop, and "works on my machine" problems disappear.

## Common mistakes

- **Downloading the source archive.** Look for "Binaries".
- **Closing the console window.** It is part of JMeter and shows errors.
- **Downloading from unofficial mirrors or random sites.** Use jmeter.apache.org.
- **Installing into Program Files** or other paths with spaces, which some scripts handle poorly.
- **Not reopening the terminal** after changing PATH or JAVA_HOME.
- **Practising on public websites.** Use your own `localhost` server.

## Key takeaways summary

Install a current LTS JDK, confirm with `java -version`, download the JMeter **binary** archive from the official site, extract it to a simple path, and run `bin/jmeter.bat` or `bin/jmeter`. Keep the console open, read its messages, and use a local server you own for practice. Next, take the [GUI tour](/learn/jmeter/jmeter-gui-tour).
