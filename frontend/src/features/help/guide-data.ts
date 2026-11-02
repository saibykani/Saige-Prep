/**
 * Content for the Help & User Guide (/help). Each walkthrough is a numbered list of steps, and most
 * steps point at a real screenshot in public/help/ that `npm run help:screenshots` regenerates.
 * Describe only behaviour that exists in the app; check the feature code before changing a step.
 */

export interface HelpImage {
  /** Path under /public, e.g. /help/planner-plan.webp */
  src: string;
  alt: string;
  /** The page the screenshot was taken on, shown in the browser frame. */
  url: string;
  caption?: string;
  width?: number;
  height?: number;
}

export type CalloutTone = "tip" | "note" | "warning";

export interface HelpLink {
  href: string;
  label: string;
}

export interface HelpStep {
  title: string;
  /** One to three short sentences. */
  body: string;
  image?: HelpImage;
  callout?: { tone: CalloutTone; text: string };
  link?: HelpLink;
}

export interface Walkthrough {
  id: string;
  title: string;
  summary: string;
  /** Rough time to work through the walkthrough itself. */
  time?: string;
  start: HelpLink;
  steps: HelpStep[];
}

const EXT = "webp";

function shot(name: string, alt: string, url: string, extra: Partial<HelpImage> = {}): HelpImage {
  return { src: `/help/${name}.${EXT}`, alt, url, ...extra };
}

export const WALKTHROUGHS: Walkthrough[] = [
  {
    id: "first-day",
    title: "Getting started on your first day",
    summary: "What Saige-Prep is, where your data lives, and the five things to do in your first hour.",
    time: "About 1 hour",
    start: { href: "/dashboard", label: "Open the Dashboard" },
    steps: [
      {
        title: "Open the Dashboard",
        body: "The Dashboard is your home page. On day one it is honestly empty: the counters start at zero and the Next steps checklist shows 0 of 5 done.",
        image: shot("start-dashboard", "Dashboard on a first visit, with zero counters and the Next steps checklist", "/dashboard"),
        callout: {
          tone: "note",
          text: "There is no login. Everything you do is saved only in this browser, on this device. See “Backups and moving devices” before you invest many hours.",
        },
      },
      {
        title: "Work down the Next steps checklist",
        body: "The five steps are: pick a target role, complete your first lesson, solve a practice exercise, take a baseline mock test and try a mock interview. Each one ticks itself off when you actually do it.",
        link: { href: "/dashboard", label: "Dashboard" },
      },
      {
        title: "See what there is to learn",
        body: "The Learning Center lists every track: Manual, Automation, API, Performance (with an Apache JMeter sub-track), Mobile, Specialist and SDET. You don’t need to choose here yet; the role and the planner will do that for you.",
        image: shot("start-learning-center", "Learning Center with all tracks", "/learn"),
        link: { href: "/learn", label: "Learning Center" },
      },
      {
        title: "Follow the next three walkthroughs in order",
        body: "Choose a role, build a study plan for it, then read your first lesson end to end. By the end you will have a plan for the coming weeks and one lesson done.",
        callout: { tone: "tip", text: "Not sure which role to pick? Start with Manual QA Engineer. Every other testing role builds on those fundamentals." },
      },
    ],
  },
  {
    id: "roadmaps",
    title: "Choosing a role (Roadmaps)",
    summary: "Role Roadmaps describe 80 testing roles: the job, the skills, a beginner-to-advanced path and how to tell when you’re ready.",
    time: "10–20 minutes",
    start: { href: "/roadmaps", label: "Open Role Roadmaps" },
    steps: [
      {
        title: "Browse the catalogue",
        body: "Roles are grouped by category. Use the category buttons to narrow the list, or scroll to see everything.",
        image: shot("roadmaps-catalogue", "Role Roadmaps catalogue grouped by category", "/roadmaps"),
      },
      {
        title: "Search for a role or a skill",
        body: "Type into “Search roles or skills…” to filter as you type, for example “manual”, “jmeter” or “security”.",
        image: shot("roadmaps-search", "Role catalogue filtered by the word manual", "/roadmaps"),
      },
      {
        title: "Read the role page",
        body: "Each role explains what the job is, then lists essential, role-specific and optional skills, responsibilities and prerequisites.",
        image: shot("roadmaps-detail", "Manual QA Engineer role page with skills cards", "/roadmaps/manual-qa-engineer"),
      },
      {
        title: "Set it as your target role",
        body: "Press “Set as my target role”. The button changes to “✓ Your target role”, the role is marked “Your target” in the catalogue, and the planner pre-selects it.",
        image: shot("roadmaps-target-set", "Role page after pressing Set as my target role", "/roadmaps/manual-qa-engineer"),
        callout: { tone: "tip", text: "Press the button again to clear it. You can change your target role at any time." },
      },
      {
        title: "Look at the stages of the roadmap",
        body: "Further down, the roadmap goes stage by stage from beginner to advanced. Each stage has goals and links to the lessons that cover it. Below that are tools, practical exercises, a sample portfolio project, common interview mistakes and readiness criteria.",
        image: shot("roadmaps-stages", "Roadmap stages with goals and lesson links", "/roadmaps/manual-qa-engineer"),
        callout: { tone: "note", text: "Readiness criteria are a self-check before applying. Meeting them is not a guarantee of a job." },
      },
    ],
  },
  {
    id: "planner",
    title: "Building and following a study plan (Planner)",
    summary: "Turn a role into a week-by-week list of lessons that fits the hours you actually have.",
    time: "5 minutes to set up",
    start: { href: "/planner", label: "Open the Study Planner" },
    steps: [
      {
        title: "Choose role, weeks and hours",
        body: "Pick a target role (your role from Roadmaps is pre-selected), the number of weeks (1–52) and the hours you can study per week (1–60).",
        image: shot("planner-form", "Study Planner form with role, weeks and hours filled in", "/planner"),
        callout: { tone: "tip", text: "Be honest about your hours. A plan you can keep beats an ambitious one you abandon in week two." },
      },
      {
        title: "Generate the plan",
        body: "Press “Generate plan”. The planner orders that role’s lessons from beginner to advanced and fills each week up to your hour budget. A status line says how many lessons were planned and, if any, how many did not fit.",
        image: shot("planner-plan", "Generated plan showing Week 1 tasks and the status message", "/planner"),
        callout: {
          tone: "note",
          text: "Only lessons that are actually written are scheduled, and lessons you have already completed are skipped. Roadmap topics without a lesson yet are reported, not hidden.",
        },
      },
      {
        title: "Open a task and tick it off",
        body: "Each task links straight to its lesson. When you’ve finished it, tick its checkbox; the counter (for example “1/16 done”) and the progress bar update and are saved in this browser.",
        image: shot("planner-ticked", "Week 1 with the first task ticked", "/planner"),
      },
      {
        title: "Adjust as you go",
        body: "Remove a task you don’t need with its remove button. “Reset plan” deletes the whole plan after you confirm; generating a new plan asks before replacing the current one.",
        callout: { tone: "tip", text: "Fallen behind? That’s normal. Generate a new plan with fewer hours per week rather than trying to catch up in one weekend." },
      },
    ],
  },
  {
    id: "lessons",
    title: "Reading a lesson end to end",
    summary: "Every lesson follows the same shape. Here is how to use each part, from objectives to notes.",
    time: "30–60 minutes per lesson",
    start: { href: "/learn/manual-testing/what-is-software-testing", label: "Open the first Manual Testing lesson" },
    steps: [
      {
        title: "Open a track and pick a lesson",
        body: "A track page lists its modules and lessons in order. Lessons are marked “Core path” or “Optional specialisation”; do the core path first.",
        image: shot("lesson-track", "Manual Testing track page listing modules and lessons", "/learn/manual-testing"),
      },
      {
        title: "Read the header and objectives",
        body: "The header shows the level, an estimated time and tags. The two cards underneath list what you will be able to do afterwards (Learning objectives) and what you should know first (Prerequisites).",
        image: shot("lesson-header", "Lesson header with level, duration, buttons and learning objectives", "/learn/manual-testing/what-is-software-testing"),
      },
      {
        title: "Work through the explanation",
        body: "Lessons start with a beginner-friendly explanation, then go deeper with a technical explanation. Read in order; later sections assume the earlier ones.",
        image: shot("lesson-body", "Beginner-friendly explanation section of a lesson", "/learn/manual-testing/what-is-software-testing"),
      },
      {
        title: "Study the examples and common mistakes",
        body: "The real-world example and step-by-step walkthrough show the idea applied to an actual product. Don’t skim them; they are where the understanding comes from. Then do the practice tasks listed below the lesson.",
        image: shot("lesson-example", "Real-world example section", "/learn/manual-testing/what-is-software-testing"),
      },
      {
        title: "Answer the quiz and press “Check answers”",
        body: "Choose an answer for each question in “Check your understanding”, then press “Check answers”. You see your score straight away and the result is saved as your last attempt.",
        image: shot("lesson-quiz-answering", "Lesson quiz with an answer chosen for each question", "/learn/manual-testing/what-is-software-testing"),
      },
      {
        title: "Read the explanation for every question",
        body: "After checking, each question shows which option was right and why. Read the explanations for the ones you missed, then press “Try again” if you want another go.",
        image: shot("lesson-quiz-feedback", "Quiz questions with correct answers and explanations revealed", "/learn/manual-testing/what-is-software-testing"),
      },
      {
        title: "Practise the interview questions out loud",
        body: "Under “Interview questions”, answer each one out loud first, then click it to open the model answer.",
        image: shot("lesson-interview", "Interview questions with one model answer opened", "/learn/manual-testing/what-is-software-testing"),
      },
      {
        title: "Write a note",
        body: "“Your notes” at the bottom of the lesson is a quick notepad tied to this lesson. Type, press “Save note”, and find it again later on the Notes page. Markdown is supported.",
        image: shot("lesson-notes", "Your notes box with a saved note", "/learn/manual-testing/what-is-software-testing"),
      },
      {
        title: "Mark it complete and bookmark it",
        body: "Back at the top, press “Mark as complete” (it turns into “Completed”) and “Bookmark” if you want to find the lesson quickly later. Completion feeds the Dashboard, Progress and the Planner.",
        image: shot("lesson-complete", "Lesson header showing Completed and Bookmarked", "/learn/manual-testing/what-is-software-testing"),
        callout: { tone: "tip", text: "Only mark a lesson complete once you can explain it and have done its quiz. It is your own record; nobody else checks it." },
      },
      {
        title: "Find bookmarks and notes again",
        body: "Bookmarks lists everything you saved: lessons, roles, projects and tools. Notes lists your notes with search, an editor and a preview, and you can also write notes there that aren’t tied to a lesson.",
        image: shot("lesson-bookmarks", "Bookmarks page listing the bookmarked lesson", "/bookmarks"),
        link: { href: "/notes", label: "Notes" },
      },
      {
        title: "Move to the next lesson",
        body: "At the very bottom, Previous and Next take you through the track in order. Key takeaways, references to official documentation and related lessons sit just above.",
        image: shot("lesson-notes-page", "Notes page showing the lesson note", "/notes"),
      },
    ],
  },
  {
    id: "jmeter",
    title: "The JMeter path for beginners",
    summary: "Apache JMeter from absolute zero: install it, build a first test plan, then make it realistic, correlate, run at scale and report.",
    time: "Several weeks at a steady pace",
    start: { href: "/learn/jmeter", label: "Open the Apache JMeter track" },
    steps: [
      {
        title: "Know where JMeter sits",
        body: "JMeter is a sub-track of Performance Testing; the tabs at the top of the track switch between the two. If performance testing is new to you, read the Performance concepts module first.",
        image: shot("jmeter-performance-track", "Performance Testing track page", "/learn/performance"),
      },
      {
        title: "Open the Apache JMeter track",
        body: "The track is split into modules, starting with Module 1 · Getting started: what JMeter is, installing JMeter and Java step by step, a tour of the GUI, and your first test plan.",
        image: shot("jmeter-track", "Apache JMeter track listing its modules", "/learn/jmeter"),
      },
      {
        title: "Go in order, from the first lesson",
        body: "Lessons assume no prior knowledge and build on each other. Install JMeter on your own machine while you read, and repeat each step yourself.",
        image: shot("jmeter-first-lesson", "First JMeter lesson: What is Apache JMeter", "/learn/jmeter/what-is-jmeter"),
        callout: { tone: "warning", text: "Only load-test systems you own or have written permission to test. Running load against someone else’s site can be illegal." },
      },
      {
        title: "Reinforce with practice",
        body: "Use the Performance analysis lab to practise reading results (percentiles, error rates, Little’s Law), the Apache JMeter mock test to check yourself, and the JMeter load-test project for your portfolio.",
        link: { href: "/practice/performance", label: "Performance analysis lab" },
      },
    ],
  },
  {
    id: "practice",
    title: "Practice Lab: every lab type",
    summary: "Hands-on exercises with instant feedback. Everything runs in your browser; nothing is sent to a server.",
    time: "10–30 minutes per sitting",
    start: { href: "/practice", label: "Open the Practice Lab" },
    steps: [
      {
        title: "Pick a lab",
        body: "Each card shows how many exercises you’ve solved and whether the lab is auto-checked or self-reviewed. Solved exercises earn 10 XP each, shown at the top.",
        image: shot("practice-hub", "Practice Lab hub with seven lab cards", "/practice"),
        callout: { tone: "tip", text: "Try every exercise yourself before opening the hint. Getting it wrong and fixing it is how you learn." },
      },
      {
        title: "SQL lab: write a query",
        body: "Pick an exercise on the left and write a query against the sample e-commerce database in “Your query”. Press Run (or Ctrl + Enter) to see the result, and click a table name under Tables to browse its data.",
        image: shot("practice-sql-start", "SQL lab with exercise list, query editor and tables", "/practice/sql"),
        callout: { tone: "note", text: "Only read-only SELECT (or WITH … SELECT) queries are allowed, so the sample data stays the same for every exercise." },
      },
      {
        title: "SQL lab: check your answer",
        body: "Press “Check answer” to compare your result set with the expected one. A match marks the exercise complete; if it differs, check your columns, WHERE filters and JOINs. “Show a solution” reveals one correct query.",
        image: shot("practice-sql-checked", "SQL lab after a correct answer, with the result table", "/practice/sql"),
      },
      {
        title: "API lab: send real requests",
        body: "The API lab has a safe mock REST API built into the page. Choose a method, type a path, add headers or a JSON body and press Send. “Load starter request” fills in a sensible starting point; a challenge completes as soon as your request meets it.",
        image: shot("practice-api", "API lab with a completed health check challenge", "/practice/api"),
      },
      {
        title: "API lab: read the response like a tester",
        body: "Below the request you see the status, headers and body, plus a history of what you sent. When a login returns a token, “Use this token” adds it as an Authorization header. Test accounts are listed in the side panel.",
        image: shot("practice-api-response", "API response with status, headers and body", "/practice/api"),
      },
      {
        title: "Test design lab",
        body: "Turn a requirement into test values: boundary values, equivalence classes, decision tables, pairwise counts and more. Enter your answer and press “Check my answer”; every check explains why.",
        image: shot("practice-test-design", "Test design lab with a correct boundary value answer", "/practice/test-design"),
      },
      {
        title: "Code & debugging challenges",
        body: "Read short pieces of automation code like a reviewer: predict the output, spot the bug or choose the fix. After checking, the explanation shows why, then go on to the next one or try again.",
        image: shot("practice-code", "Code challenge answered with explanation", "/practice/code"),
      },
      {
        title: "Performance analysis lab",
        body: "Work with a sample run of 20 response times: averages, percentiles, error rates, Little’s Law and bottleneck diagnosis. The chart can be sorted to make percentiles easier to see.",
        image: shot("practice-performance", "Performance lab with the average response time answered", "/practice/performance"),
      },
      {
        title: "Manual labs: requirements review",
        body: "Read a user story, write your questions and concerns (one per line), then press “Compare with an expert review”. Tick each point you raised in your own words and press “Save my review”. This lab is self-assessed, not auto-graded.",
        image: shot("practice-requirements", "Requirements review lab comparing notes with expert findings", "/practice/requirements"),
      },
      {
        title: "Manual labs: defect report",
        body: "Read what was observed, fill in a full report (title, environment, steps, expected and actual results, severity and priority) and press “Review my report”. Compare it with the model report and grade yourself against the checklist.",
        image: shot("practice-defect-report", "Defect report lab form", "/practice/defect-report"),
      },
    ],
  },
  {
    id: "toolkit",
    title: "Using the QA Toolkit",
    summary: "Everyday helpers for test design, data and encoding, plus reference sheets and templates.",
    start: { href: "/toolkit", label: "Open the QA Toolkit" },
    steps: [
      {
        title: "Find the tool you need",
        body: "Tools are grouped into Test design, Data & encoding, References and Templates. Every tool runs in your browser.",
        image: shot("toolkit-hub", "QA Toolkit grouped into tool categories", "/toolkit"),
      },
      {
        title: "Example: boundary values",
        body: "Enter an inclusive range and its precision (1 for whole numbers, 0.01 for money). The tool lists the two- and three-value boundary tests with whether each value should be accepted or rejected.",
        image: shot("toolkit-bva", "Boundary value helper for the range 1 to 100", "/toolkit/bva"),
      },
      {
        title: "Example: JSON formatter and diff",
        body: "Paste JSON to pretty-print, minify or validate it, or compare two documents to see exactly what differs.",
        image: shot("toolkit-json", "JSON formatter, validator and diff tool", "/toolkit/json"),
        callout: { tone: "tip", text: "The References group has HTTP status codes, HTTP headers, a SQL cheat sheet and Git commands: handy while doing the labs." },
      },
    ],
  },
  {
    id: "mock-tests",
    title: "Taking a mock test",
    summary: "Practice exams per track with optional timer and negative marking, scored per topic.",
    time: "10–60 minutes",
    start: { href: "/mock-tests", label: "Open Mock Tests" },
    steps: [
      {
        title: "Pick a question bank",
        body: "There is one bank per track. Each card shows your number of attempts and best score once you’ve taken one.",
        image: shot("mock-hub", "Mock Tests hub with eight question banks", "/mock-tests"),
      },
      {
        title: "Set up the test",
        body: "Choose the number of questions, a time limit (No timer, 15, 25, 45 or 60 minutes) and negative marking (Off, −0.25 or −0.5 per wrong answer). Then press “Start test”.",
        image: shot("mock-setup", "Mock test setup with 10 questions and no timer selected", "/mock-tests/manual-testing"),
        callout: { tone: "tip", text: "Take untimed tests while learning. Switch to timed tests with negative marking in the last weeks before interviews." },
      },
      {
        title: "Answer, and flag what you’re unsure of",
        body: "Choose an answer and move on with Next or Previous. Press “Flag for review” on any question you want to come back to.",
        image: shot("mock-question", "A mock test question flagged for review", "/mock-tests/manual-testing"),
        callout: { tone: "note", text: "Answers are saved in this browser as you go, so a page refresh does not lose your test. With a timer, the test is submitted automatically when time runs out." },
      },
      {
        title: "Use the question navigator",
        body: "The numbered grid shows which questions are answered and which are flagged. Click any number to jump straight to it.",
        image: shot("mock-navigator", "Question navigator showing answered, flagged and unanswered questions", "/mock-tests/manual-testing"),
      },
      {
        title: "Submit",
        body: "Press Finish (or Submit at the top). The confirmation tells you how many questions are answered and flagged. You can’t change answers after submitting.",
        image: shot("mock-submit", "Submit your test confirmation dialog", "/mock-tests/manual-testing"),
      },
      {
        title: "Read your results",
        body: "You get your percentage, points, and counts of correct, wrong and unanswered questions. “Score by topic” lists your weakest topics first, each linking to the matching lesson.",
        image: shot("mock-results", "Mock test results with score by topic", "/mock-tests/manual-testing"),
      },
      {
        title: "Review every question",
        body: "Below the scores, every question shows your answer, the correct one and an explanation. Then press “New attempt” for a fresh set or “Back to setup”.",
        image: shot("mock-review", "Review every question section with explanations", "/mock-tests/manual-testing"),
        callout: { tone: "tip", text: "Re-read the lessons for your two weakest topics before your next attempt." },
      },
    ],
  },
  {
    id: "interviews",
    title: "A mock interview",
    summary: "Answer real interview questions, compare with a model answer and rate yourself honestly.",
    time: "15, 30 or 60 minutes",
    start: { href: "/interviews", label: "Open Interview Prep" },
    steps: [
      {
        title: "Choose a track",
        body: "Interview Prep has tracks such as Manual QA, Automation, API, Performance and SDET.",
        image: shot("interview-hub", "Interview Prep tracks", "/interviews"),
      },
      {
        title: "Choose a length",
        body: "Pick a 15-, 30- or 60-minute interview. Questions are chosen to fit roughly into that time; each question shows its approximate minutes.",
        image: shot("interview-lengths", "Interview length buttons on the Manual QA track", "/interviews/manual-qa"),
      },
      {
        title: "Answer before you look",
        body: "Type your answer in “Your answer”, or say it out loud as if to an interviewer. Only then press “Reveal model answer”.",
        image: shot("interview-answer", "Interview question with a typed answer", "/interviews/manual-qa"),
      },
      {
        title: "Compare with the model answer",
        body: "Read the model answer, then tick each key point you covered. Read the likely follow-up questions and the red flags interviewers notice.",
        image: shot("interview-reveal", "Model answer and key points checklist", "/interviews/manual-qa"),
      },
      {
        title: "Rate yourself on the rubric",
        body: "Score yourself 1 (weak) to 4 (strong) on correctness, depth, problem solving and communication. “Next question” unlocks once all four are rated.",
        image: shot("interview-rubric", "Rubric with four dimensions rated", "/interviews/manual-qa"),
        callout: { tone: "note", text: "No machine grades you. Be strict: the point is to find gaps before a real interviewer does." },
      },
      {
        title: "Read the summary",
        body: "After the last question you see how many you answered, your average self-rating and a bar per rubric dimension. Your weakest dimension is what to practise next.",
        image: shot("interview-summary", "Interview complete summary with rubric averages", "/interviews/manual-qa"),
      },
      {
        title: "Track sessions over time",
        body: "Back on the track page, “Past sessions” lists every interview with its length, question count and average.",
        image: shot("interview-history", "Past sessions list on the interview track page", "/interviews/manual-qa"),
      },
    ],
  },
  {
    id: "projects",
    title: "Portfolio projects",
    summary: "Guided projects you build in your own repository and can show to employers.",
    start: { href: "/projects", label: "Open Projects" },
    steps: [
      {
        title: "Choose a project",
        body: "Projects include a Selenium framework, an API test suite and a JMeter load-test suite. Pick one that matches your target role.",
        image: shot("projects-list", "Projects list", "/projects"),
      },
      {
        title: "Read the brief",
        body: "Each project page describes what to build and shows its level, estimated effort, the skills it demonstrates and the roles it supports. Build it in your own GitHub repository.",
        image: shot("projects-detail", "Selenium + TestNG framework project page", "/projects/selenium-testng-framework"),
      },
      {
        title: "Mark it done",
        body: "When you’ve finished, press “Mark as done”. The project shows a Done badge in the list; press “Done (undo)” to reverse it.",
        image: shot("projects-done", "Projects list with one project marked Done", "/projects"),
        callout: { tone: "tip", text: "Mention finished projects on your CV with a link to the repository." },
      },
    ],
  },
  {
    id: "progress",
    title: "Tracking your progress",
    summary: "Progress shows only what you actually did. Nothing is estimated or made up.",
    start: { href: "/progress", label: "Open Progress" },
    steps: [
      {
        title: "Check the Dashboard",
        body: "After a few sessions, the Dashboard counters fill in and the Next steps tick themselves off. “Jump back in” has quick links to the main sections.",
        image: shot("progress-dashboard", "Dashboard after real activity, with next steps ticked", "/dashboard"),
      },
      {
        title: "Open Progress",
        body: "At the top: your activity streak and an activity heatmap for recent weeks, then lessons completed per track.",
        image: shot("progress-overview", "Progress page with streak, heatmap and lessons by track", "/progress"),
      },
      {
        title: "Read the mock test charts",
        body: "“Mock test accuracy over time” shows each attempt; “Accuracy by topic” shows where you are strong and weak across all your tests.",
        image: shot("progress-charts", "Mock test accuracy over time and accuracy by topic", "/progress"),
      },
      {
        title: "Interview ratings and labs",
        body: "“Interview self-ratings” averages your rubric scores per dimension, and “Practice lab exercises” shows how many exercises you have solved in each lab.",
        image: shot("progress-labs", "Interview self-ratings and practice lab progress", "/progress"),
        callout: { tone: "note", text: "Each section has an honest empty state until you’ve done that activity. Scores are practice scores calculated in your browser, not official results." },
      },
    ],
  },
  {
    id: "data",
    title: "Backups and moving devices",
    summary: "Your data lives only in this browser. Back it up, move it, or delete it from Settings.",
    start: { href: "/settings", label: "Open Settings" },
    steps: [
      {
        title: "Open Settings → Your data",
        body: "Progress, notes, bookmarks, test results and plans are stored only in this browser. The three buttons here are all you need to look after them.",
        image: shot("data-settings", "Settings page with the Your data card", "/settings"),
        callout: {
          tone: "warning",
          text: "Clearing your browser data, or using a private window, erases your progress. Export a backup regularly.",
        },
      },
      {
        title: "Export a backup",
        body: "Press “Export backup”. Your browser downloads a file called saige-prep-backup-YYYY-MM-DD.json. Keep it somewhere safe, such as cloud storage.",
        image: shot("data-export", "Export backup with the Backup downloaded message", "/settings"),
      },
      {
        title: "Import it on another device",
        body: "On the new device or browser, open Settings, press “Import backup” and choose the file. You see “Backup restored.” and everything is back.",
        image: shot("data-import", "Import backup with the Backup restored message", "/settings"),
        callout: { tone: "note", text: "Importing replaces the data in that browser with the backup, so export first if the new browser already has progress you want to keep." },
      },
      {
        title: "Delete everything (if you need to)",
        body: "“Delete all my data” asks for confirmation, then permanently erases your data from this browser. It cannot be undone.",
        image: shot("data-delete", "Delete all your data confirmation dialog", "/settings"),
      },
    ],
  },
  {
    id: "search-theme-mobile",
    title: "Search, theme and mobile use",
    summary: "Get anywhere quickly, pick light or dark, and study on your phone.",
    start: { href: "/search", label: "Open Search" },
    steps: [
      {
        title: "Search from anywhere",
        body: "Press Ctrl + K (⌘ + K on Mac) or click “Search…” in the header. Type a few letters to find lessons, roles, tools and sections, use the arrow keys to choose and Enter to open.",
        image: shot("search-palette", "Search palette with results for jmeter", "/dashboard"),
      },
      {
        title: "Switch the theme",
        body: "Choose Light, Dark or System in Settings → Appearance, or with the sun, moon and screen icons in the header. The choice is saved on this device.",
        image: shot("search-theme", "Appearance setting with Light, Dark and System options", "/settings"),
      },
      {
        title: "Use it on your phone",
        body: "On a small screen, open the menu with the button at the top left. The menu has every section and the theme switch.",
        image: shot("search-mobile-menu", "Mobile navigation menu open on a phone", "/dashboard", { width: 390, height: 844 }),
        callout: { tone: "tip", text: "Your phone has its own browser storage. Use Export and Import backup to carry progress between your phone and computer." },
      },
    ],
  },
];

export interface RoutineBlock {
  when: string;
  minutes: string;
  what: string;
  href: string;
}

/** The study loop every lesson is built around. */
export const STUDY_LOOP: { title: string; text: string }[] = [
  { title: "Learn", text: "Read one lesson fully, including the worked examples." },
  { title: "Do", text: "Type the examples yourself, then do a matching Practice Lab exercise." },
  { title: "Check", text: "Answer the lesson quiz and read the explanation for every miss." },
  { title: "Explain", text: "Answer the lesson’s interview questions out loud." },
  { title: "Review", text: "Once a week, take a mock test and re-read your weakest topics." },
];

/** An example week for about 6 hours of study. */
export const SAMPLE_WEEK: RoutineBlock[] = [
  { when: "Mon–Thu", minutes: "45 min each", what: "One lesson from your plan, its quiz and one practice exercise.", href: "/planner" },
  { when: "Fri", minutes: "30 min", what: "A 15-minute mock interview, then compare and rate yourself.", href: "/interviews" },
  { when: "Sat", minutes: "60 min", what: "A mock test, then re-read the lessons for your two weakest topics.", href: "/mock-tests" },
  { when: "Sun", minutes: "60 min, optional", what: "Work on a portfolio project. Export a backup.", href: "/projects" },
];

export const FAQ: { q: string; a: string; link?: HelpLink }[] = [
  {
    q: "I know nothing about testing. Where do I start?",
    a: "Follow “Getting started on your first day”, choose Manual QA Engineer as your role, and start the Manual Testing track from its first lesson.",
    link: { href: "/learn/manual-testing", label: "Manual Testing" },
  },
  {
    q: "How long until I’m job-ready?",
    a: "It depends on the role and your hours. Each role roadmap lists readiness criteria; when you can meet them and score consistently well on mock tests and interviews, you’re ready to apply.",
  },
  {
    q: "My progress disappeared.",
    a: "It’s stored per browser. You may be in a different browser or a private window, or your browser data was cleared. Restore it from a backup in Settings if you have one.",
    link: { href: "/settings", label: "Settings" },
  },
  {
    q: "Does anything get sent to a server?",
    a: "Your learning data stays in this browser. The SQL and API labs also run entirely in the page, against sample data and a built-in mock API.",
  },
  {
    q: "Are the scores official?",
    a: "No. Quiz, mock test and lab scores are practice scores calculated in your browser, and interview ratings are your own. They are there to guide your study.",
  },
  {
    q: "A lesson says it has not been written yet.",
    a: "Some roadmap topics don’t have a full lesson yet. Rather than show placeholder text, the app says so; the planner skips them and tells you how many it skipped.",
  },
  {
    q: "I found a mistake in a lesson.",
    a: "Each lesson lists official references; those are the source of truth. Note the mistake in your Notes and tell the site owner.",
  },
];
