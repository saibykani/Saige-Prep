"use client";

import { Check, Flag, X } from "lucide-react";
import type { ChoiceQuestion } from "@/content/schema";
import { CodeBlock } from "@/components/ui/code-block";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const typeLabel: Record<ChoiceQuestion["type"], string> = {
  single: "Single choice",
  multiple: "Select all that apply",
  truefalse: "True or false",
  "code-output": "Predict the output",
  debugging: "Debugging",
  scenario: "Scenario",
};

/**
 * One multiple-choice style question. Controlled: the parent owns `selected`.
 * With `reveal`, shows which options were right/wrong plus the explanation.
 */
export function QuestionCard({
  question,
  index,
  total,
  selected,
  onChange,
  reveal = false,
  flagged,
  onToggleFlag,
}: {
  question: ChoiceQuestion;
  index?: number;
  total?: number;
  selected: number[];
  onChange?: (selected: number[]) => void;
  reveal?: boolean;
  flagged?: boolean;
  onToggleFlag?: () => void;
}) {
  const multi = question.type === "multiple";
  const name = `q-${question.id}`;

  function toggle(i: number) {
    if (!onChange || reveal) return;
    if (multi) onChange(selected.includes(i) ? selected.filter((s) => s !== i) : [...selected, i]);
    else onChange([i]);
  }

  const answeredCorrectly =
    selected.length === question.answer.length && question.answer.every((a) => selected.includes(a));

  return (
    <fieldset className="space-y-4" aria-describedby={reveal ? `${name}-explanation` : undefined}>
      <div className="flex flex-wrap items-center gap-2">
        {index !== undefined && (
          <span className="text-xs font-medium text-subtle">
            Question {index + 1}
            {total ? ` of ${total}` : ""}
          </span>
        )}
        <Badge>{typeLabel[question.type]}</Badge>
        <Badge tone={question.difficulty === "advanced" ? "danger" : question.difficulty === "intermediate" ? "warning" : "success"}>
          {question.difficulty}
        </Badge>
        {onToggleFlag && (
          <button
            type="button"
            onClick={onToggleFlag}
            aria-pressed={flagged}
            className={cn(
              "ml-auto inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs transition-colors",
              flagged ? "bg-warning-soft text-warning" : "text-muted hover:bg-surface-raised hover:text-foreground",
            )}
          >
            <Flag className="h-3.5 w-3.5" aria-hidden />
            {flagged ? "Flagged" : "Flag for review"}
          </button>
        )}
      </div>
      <legend className="sr-only">{question.prompt}</legend>
      <p className="text-[15px] font-medium leading-7 text-foreground">{question.prompt}</p>
      {question.code && <CodeBlock code={question.code} language={question.codeLanguage} />}
      <div className="space-y-2" role={multi ? "group" : "radiogroup"} aria-label="Answer options">
        {question.options.map((option, i) => {
          const isSelected = selected.includes(i);
          const isAnswer = question.answer.includes(i);
          return (
            <label
              key={i}
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-lg border px-4 py-3 text-sm transition-colors",
                !reveal && (isSelected ? "border-accent bg-accent-soft" : "border-border hover:border-border-strong hover:bg-surface-raised"),
                reveal && isAnswer && "border-success/50 bg-success-soft",
                reveal && isSelected && !isAnswer && "border-danger/50 bg-danger-soft",
                reveal && !isAnswer && !isSelected && "border-border opacity-70",
                reveal && "cursor-default",
              )}
            >
              <input
                type={multi ? "checkbox" : "radio"}
                name={name}
                checked={isSelected}
                onChange={() => toggle(i)}
                disabled={reveal}
                className="mt-0.5 accent-[#a394f5]"
              />
              <span className="flex-1 leading-6">{option}</span>
              {reveal && isAnswer && <Check className="h-4 w-4 shrink-0 text-success" aria-label="Correct answer" />}
              {reveal && isSelected && !isAnswer && <X className="h-4 w-4 shrink-0 text-danger" aria-label="Your answer (incorrect)" />}
            </label>
          );
        })}
      </div>
      {reveal && (
        <div
          id={`${name}-explanation`}
          className={cn(
            "rounded-lg border px-4 py-3 text-sm leading-6",
            answeredCorrectly ? "border-success/30 bg-success-soft/60" : "border-border bg-surface-raised",
          )}
        >
          <p className="mb-1 font-medium">{selected.length === 0 ? "Not answered" : answeredCorrectly ? "Correct" : "Not quite"}</p>
          <p className="text-foreground/85">{question.explanation}</p>
        </div>
      )}
    </fieldset>
  );
}
