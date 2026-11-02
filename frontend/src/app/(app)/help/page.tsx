import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Rendered client-side behind AppShell (session/guest check), so instant-navigation validation does not apply.
export const instant = false;

export const metadata: Metadata = { title: "Help & User Guide" };

const SECTIONS: { id: string; title: string }[] = [
  { id: "start", title: "Start here: your first day" },
  { id: "method", title: "How to study (the method)" },
  { id: "weekly", title: "A sample week" },
  { id: "roadmaps", title: "Role Roadmaps" },
  { id: "planner", title: "Study Planner" },
  { id: "lessons", title: "Lessons and the Learning Center" },
  { id: "practice", title: "Practice Lab and QA Toolkit" },
  { id: "mock-tests", title: "Mock Tests" },
  { id: "interviews", title: "Interview Prep" },
  { id: "projects", title: "Real-World Projects" },
  { id: "progress", title: "Progress, bookmarks and notes" },
  { id: "data", title: "Your data, backups and devices" },
  { id: "shortcuts", title: "Search, shortcuts and theme" },
  { id: "faq", title: "FAQ" },
];

function A({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="font-medium text-accent hover:underline">
      {children}
    </Link>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <Card id={id} className="scroll-mt-24">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm leading-relaxed [&_li]:mb-1.5 [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5">
        {children}
      </CardContent>
    </Card>
  );
}

export default function HelpPage() {
  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Help & User Guide"
        description="How Saige-Prep works, how to study with it, and how to go from zero to interview-ready."
      />

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <nav aria-label="Guide contents" className="lg:sticky lg:top-24 lg:self-start">
          <p className="mb-2 text-xs font-semibold tracking-wide text-muted uppercase">On this page</p>
          <ol className="space-y-1 text-sm">
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="block rounded-md px-2 py-1 text-muted hover:bg-surface-raised hover:text-foreground">
                  {s.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="space-y-6">
          <Section id="start" title="Start here: your first day">
            <p>New to testing? Follow these steps in order. They take about an hour.</p>
            <ol>
              <li>
                Open <A href="/roadmaps">Role Roadmaps</A> and pick the role you want, for example Manual QA Engineer for
                a first job, or Performance Test Engineer if you want JMeter.
              </li>
              <li>
                Go to the <A href="/planner">Study Planner</A>, choose that role, and set how many weeks you have and
                how many hours a week you can study. Generate the plan.
              </li>
              <li>
                Open the first task in Week 1. It takes you straight to a lesson. Read it, try the examples, then answer
                the quiz at the bottom and mark the lesson complete.
              </li>
              <li>
                Take one short <A href="/mock-tests">mock test</A> (10 questions, no timer) as a baseline. A low score
                is fine; it tells you where to focus.
              </li>
              <li>
                Check the <A href="/dashboard">Dashboard</A>. Its next steps tick themselves off as you go.
              </li>
            </ol>
          </Section>

          <Section id="method" title="How to study (the method)">
            <p>Every lesson is built for this loop. Use it every study session:</p>
            <ol>
              <li>
                <strong>Learn:</strong> read one lesson fully. Don&apos;t skim the worked examples; they are where the
                understanding comes from.
              </li>
              <li>
                <strong>Do:</strong> type the code or the test cases yourself, then do the matching exercise in the{" "}
                <A href="/practice">Practice Lab</A>.
              </li>
              <li>
                <strong>Check:</strong> answer the lesson quiz and read the explanation for every question you got
                wrong.
              </li>
              <li>
                <strong>Explain:</strong> answer the lesson&apos;s interview questions out loud, as if to an interviewer.
                If you can&apos;t explain it simply, re-read that part.
              </li>
              <li>
                <strong>Review:</strong> once a week, take a mock test on the tracks you studied and re-read the lessons
                for your weakest topics.
              </li>
            </ol>
            <p>
              Little and often beats long cramming sessions: 45–60 focused minutes a day works better than one
              six-hour weekend.
            </p>
          </Section>

          <Section id="weekly" title="A sample week">
            <p>An example for about 6 hours a week. Adjust it to your own plan:</p>
            <ul>
              <li>
                <strong>Mon–Thu (45 min each):</strong> one lesson per day, with its quiz and a practice exercise.
              </li>
              <li>
                <strong>Fri (30 min):</strong> one mock interview of 15 minutes in{" "}
                <A href="/interviews">Interview Prep</A>.
              </li>
              <li>
                <strong>Sat (60 min):</strong> a mock test, then re-read the lessons for your two weakest topics shown
                in <A href="/progress">Progress</A>.
              </li>
              <li>
                <strong>Sun (60 min, optional):</strong> work on a portfolio <A href="/projects">project</A>.
              </li>
            </ul>
          </Section>

          <Section id="roadmaps" title="Role Roadmaps">
            <p>
              <A href="/roadmaps">Role Roadmaps</A> describe 80 testing roles: what the job is, which skills are
              essential, role-specific or optional, the topics to learn from beginner to advanced, readiness criteria
              and where the role can lead next.
            </p>
            <p>
              Not sure which role to pick? Start with Manual QA Engineer. Every other testing role builds on those
              fundamentals.
            </p>
          </Section>

          <Section id="planner" title="Study Planner">
            <ul>
              <li>Pick a target role, the number of weeks, and your hours per week.</li>
              <li>
                The planner orders that role&apos;s lessons from beginner to advanced and fills each week up to your
                hour budget. Lessons you&apos;ve already completed are skipped.
              </li>
              <li>Tick tasks off as you finish them, remove ones you don&apos;t need, or reset and re-plan at any time.</li>
              <li>
                Fell behind? That&apos;s normal. Reset the plan with fewer hours per week rather than trying to catch up
                in one go.
              </li>
            </ul>
          </Section>

          <Section id="lessons" title="Lessons and the Learning Center">
            <ul>
              <li>
                The <A href="/learn">Learning Center</A> lists every track: Manual, Automation, API, Performance with an
                Apache JMeter sub-track, Mobile, Specialist and SDET.
              </li>
              <li>
                Each lesson has learning objectives, an explanation, worked examples, common mistakes, interview
                questions, practice tasks, a quiz and references to official documentation.
              </li>
              <li>
                Lessons are marked &ldquo;Core path&rdquo; or &ldquo;Optional specialisation&rdquo;. Do the core path
                first.
              </li>
              <li>
                <strong>JMeter beginners:</strong> start at <A href="/learn/jmeter">Apache JMeter</A> and go in order.
                It starts from installing JMeter and assumes no prior knowledge.
              </li>
            </ul>
          </Section>

          <Section id="practice" title="Practice Lab and QA Toolkit">
            <ul>
              <li>
                The <A href="/practice">Practice Lab</A> has hands-on exercises checked instantly in your browser: a real
                SQL sandbox, an API lab with a built-in mock REST API, test design, code challenges, performance
                analysis, requirements review and defect reports.
              </li>
              <li>Use the hints when stuck, but try first. Getting it wrong and fixing it is how you learn.</li>
              <li>
                The <A href="/toolkit">QA Toolkit</A> has everyday tools: JSON/XML formatters and diff, Base64 and JWT
                decoders, boundary value and pairwise helpers, and reference sheets.
              </li>
            </ul>
          </Section>

          <Section id="mock-tests" title="Mock Tests">
            <ul>
              <li>
                <A href="/mock-tests">Mock Tests</A> has a question bank per track. Choose the number of questions, an
                optional timer and optional negative marking.
              </li>
              <li>
                During a test you can flag questions and jump between them. Your answers autosave, so a page refresh
                won&apos;t lose them.
              </li>
              <li>
                Results show your score per topic, with explanations for every question and links back to the
                matching lesson.
              </li>
              <li>
                Tip: take untimed tests while learning, and timed tests in the last weeks before interviews.
              </li>
            </ul>
          </Section>

          <Section id="interviews" title="Interview Prep">
            <ol>
              <li>
                Pick a track in <A href="/interviews">Interview Prep</A> and a length: 15, 30 or 60 minutes.
              </li>
              <li>Answer each question by typing or out loud before revealing anything.</li>
              <li>
                Reveal the model answer, tick the key points you covered, read the likely follow-ups and the red flags
                interviewers watch for.
              </li>
              <li>
                Rate yourself 1–4 on correctness, depth, problem solving and communication. Be honest: no machine
                grades you, and the point is to find gaps before a real interview does.
              </li>
            </ol>
          </Section>

          <Section id="projects" title="Real-World Projects">
            <p>
              <A href="/projects">Projects</A> are guided portfolio projects such as a Selenium framework, a RestAssured
              API suite or a JMeter load-test suite. Build them in your own GitHub repository and mention them on your
              CV. Mark a project done when you&apos;ve finished it.
            </p>
            <p>Only load-test systems you own or have written permission to test.</p>
          </Section>

          <Section id="progress" title="Progress, bookmarks and notes">
            <ul>
              <li>
                <A href="/progress">Progress</A> shows only what you actually did: lessons completed per track, mock
                test accuracy over time and per topic, interview self-ratings, practice done, and your activity streak.
              </li>
              <li>
                Bookmark any lesson to find it later in <A href="/bookmarks">Bookmarks</A>, and keep your own notes in{" "}
                <A href="/notes">Notes</A>.
              </li>
            </ul>
          </Section>

          <Section id="data" title="Your data, backups and devices">
            <ul>
              <li>
                There is no login. Everything you do is saved <strong>only in this browser</strong> on this device.
              </li>
              <li>
                Clearing your browser data, or using a private window, erases it. To be safe, export a backup regularly
                from <A href="/settings">Settings</A>.
              </li>
              <li>
                To continue on another device or browser: Settings → Export backup here, then Settings → Import backup
                there.
              </li>
              <li>Settings → Delete all my data erases everything from this browser. It cannot be undone.</li>
            </ul>
          </Section>

          <Section id="shortcuts" title="Search, shortcuts and theme">
            <ul>
              <li>
                Press <kbd className="rounded border border-border bg-surface-raised px-1.5 text-xs">Ctrl</kbd> +{" "}
                <kbd className="rounded border border-border bg-surface-raised px-1.5 text-xs">K</kbd> (
                <kbd className="rounded border border-border bg-surface-raised px-1.5 text-xs">⌘</kbd> +{" "}
                <kbd className="rounded border border-border bg-surface-raised px-1.5 text-xs">K</kbd> on Mac) to search
                lessons, roles, tools and sections from anywhere.
              </li>
              <li>Switch between light, dark and system theme with the sun / moon / screen icons in the header.</li>
              <li>The site works on phones: open the menu with the button at the top left.</li>
            </ul>
          </Section>

          <Section id="faq" title="FAQ">
            <dl className="space-y-3">
              <div>
                <dt className="font-semibold">I know nothing about testing. Where do I start?</dt>
                <dd className="text-muted">
                  <A href="/learn/manual-testing">Manual Testing</A>, from the first lesson, in order. Then follow your
                  Study Planner.
                </dd>
              </div>
              <div>
                <dt className="font-semibold">How long until I&apos;m job-ready?</dt>
                <dd className="text-muted">
                  It depends on the role and your hours. Each role roadmap lists readiness criteria; when you can meet
                  them and score consistently well on mock tests and interviews, you&apos;re ready to apply.
                </dd>
              </div>
              <div>
                <dt className="font-semibold">My progress disappeared.</dt>
                <dd className="text-muted">
                  It&apos;s stored per browser. You may be in a different browser, a private window, or your browser data
                  was cleared. Restore it from a backup in Settings if you have one.
                </dd>
              </div>
              <div>
                <dt className="font-semibold">Are the scores official?</dt>
                <dd className="text-muted">
                  No. They are practice scores calculated in your browser, there to guide your study.
                </dd>
              </div>
              <div>
                <dt className="font-semibold">I found a mistake in a lesson.</dt>
                <dd className="text-muted">
                  Each lesson lists official references; those are the source of truth. Note the mistake in your Notes and
                  tell the site owner.
                </dd>
              </div>
            </dl>
          </Section>
        </div>
      </div>
    </div>
  );
}
