"use client";

import { CodeXml } from "lucide-react";
import { useState } from "react";
import { QuestionCard } from "@/components/assessments/question-card";
import { Button } from "@/components/ui/button";
import { isCorrect } from "@/lib/scoring";
import { CODE_CHALLENGES } from "./code-challenges";
import { LabShell, markPracticeDone, NextButton, Panel, recordAttempt, Verdict } from "./practice-ui";

export function CodeLab() {
  const [activeId, setActiveId] = useState(CODE_CHALLENGES[0].id);
  const [selected, setSelected] = useState<Record<string, number[]>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [attempt, setAttempt] = useState(0);
  const q = CODE_CHALLENGES.find((c) => c.id === activeId)!;
  const index = CODE_CHALLENGES.indexOf(q);
  const ok = isCorrect(q, selected[q.id]);

  function check() {
    setRevealed((r) => ({ ...r, [q.id]: true }));
    setAttempt((a) => a + 1);
    recordAttempt(ok);
    if (ok) markPracticeDone("code", q.id);
  }

  return (
    <LabShell
      lab="code"
      title="Code & debugging challenges"
      description="Read real automation code like a reviewer: predict what it does, spot the bug, choose the fix. These are the mistakes that cause flaky suites and false passes."
      icon={CodeXml}
      exercises={CODE_CHALLENGES.map((c) => ({ id: c.id, title: c.title, level: c.difficulty }))}
      activeId={activeId}
      onSelect={setActiveId}
    >
      <Panel className="space-y-5">
        <QuestionCard
          key={q.id}
          question={q}
          index={index}
          total={CODE_CHALLENGES.length}
          selected={selected[q.id] ?? []}
          onChange={(s) => setSelected((all) => ({ ...all, [q.id]: s }))}
          reveal={revealed[q.id]}
        />
        {!revealed[q.id] ? (
          <Button onClick={check} disabled={!(selected[q.id] ?? []).length}>
            Check my answer
          </Button>
        ) : (
          <div className="space-y-3">
            <Verdict ok={ok} attempt={attempt}>
              {ok ? "You read that code like a seasoned reviewer." : "Read the explanation above, then try the next one — this pattern will come up again."}
            </Verdict>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setRevealed((r) => ({ ...r, [q.id]: false }));
                  setSelected((s) => ({ ...s, [q.id]: [] }));
                }}
              >
                Try again
              </Button>
              <NextButton ids={CODE_CHALLENGES.map((c) => c.id)} activeId={activeId} onSelect={setActiveId} />
            </div>
          </div>
        )}
      </Panel>
    </LabShell>
  );
}
