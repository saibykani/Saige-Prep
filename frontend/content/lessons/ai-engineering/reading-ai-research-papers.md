---
slug: reading-ai-research-papers
title: Reading AI Research Papers
summary: Learn to read machine learning papers efficiently with the three-pass method, judge claims by examining baselines, ablations and evaluation, spot benchmark contamination and plan a faithful reproduction.
level: intermediate
duration: 50
tags: [research, papers, reproducibility, benchmarks, critical-thinking]
objectives:
  - Apply Keshav's three-pass method to read a paper at the right depth
  - Identify the claim, the evidence and the comparison in a machine learning paper
  - Evaluate baselines, ablations, statistical reporting and evaluation setup critically
  - Recognise benchmark contamination and other reasons results may not transfer
  - Plan and document a reproduction of a paper's key result
prerequisites:
  - Machine learning fundamentals
  - Model evaluation metrics
  - Comfort reading Python code
related: [experiment-design-for-ai-research, model-evaluation-metrics, llm-evaluation-and-evals, transformers-and-attention, advanced-topics-in-modern-ai, fine-tuning-and-adaptation]
references:
  - title: S. Keshav — How to Read a Paper
    url: https://web.stanford.edu/class/ee384m/Handouts/HowtoReadPaper.pdf
  - title: arXiv — Hu et al., LoRA (2106.09685), a good first paper to practise on
    url: https://arxiv.org/abs/2106.09685
  - title: Hugging Face — Daily Papers
    url: https://huggingface.co/papers
  - title: NeurIPS — Paper Checklist Guidelines
    url: https://neurips.cc/public/guides/PaperChecklist
interview:
  - q: How do you read a research paper you need to evaluate quickly?
    a: I use a three-pass approach. In the first pass of a few minutes I read the title, abstract, introduction, section headings and conclusion and glance at figures to learn the claim and whether it matters to me. In the second pass I read carefully but skip proofs, focusing on figures, tables, the experimental setup, baselines and what is actually being compared, and I note unfamiliar references. Only if I need to rely on or reproduce the work do I do a third pass, where I try to re-derive the method, check every assumption and think about how I would have designed the experiments.
  - q: What is benchmark contamination and why does it matter?
    a: Contamination is when test examples, or close paraphrases of them, appear in a model's training data. For large models trained on web-scale data this can happen unintentionally, because benchmarks are published online. The model may then score well by recall rather than capability, so the reported number overstates generalisation. Signs include suspiciously high scores, much better performance on older benchmarks than newer ones, and big drops on freshly written or perturbed versions of the same tasks. Good papers check overlap and report results on held-out or newly created data.
  - q: What makes you trust or distrust a reported improvement?
    a: I trust it more when the baselines are strong and tuned with similar effort, the comparison uses the same data, compute and evaluation protocol, results are averaged over several seeds with variance reported, ablations show which component causes the gain, and code and data are available. I distrust single-run results with small margins, baselines copied from older papers under different settings, evaluation on only one benchmark, cherry-picked qualitative examples and missing details needed to reproduce.
practice:
  - "Do a first pass of the LoRA paper in under ten minutes and write five sentences: the problem, the claim, the method, the main evidence and your initial doubts."
  - "For one table in a paper of your choice, list every baseline, whether it was re-run or copied, and whether compute and data were matched."
  - "Pick a paper with released code and reproduce one headline number. Record every difference from the paper's setup."
takeaways:
  - Read in three passes and stop as soon as you have what you need.
  - Find the claim, the evidence and the comparison before judging a paper.
  - Strong tuned baselines, ablations, multiple seeds and matched compute make results credible.
  - Benchmark contamination can inflate scores; look for overlap checks and fresh evaluation sets.
  - Reproduction is the strongest test of understanding; document every deviation.
quiz:
  - id: read-papers-q1
    type: single
    topic: reading-ai-research-papers
    difficulty: beginner
    prompt: In Keshav's three-pass method, what is the main goal of the first pass?
    options: ["Re-derive every equation", "Get a general idea of the paper and decide whether to read further", "Reproduce the experiments", "Write a review"]
    answer: [1]
    explanation: The first pass is a quick skim of title, abstract, introduction, headings and conclusions to get the gist and decide whether more reading is worthwhile.
  - id: read-papers-q2
    type: single
    topic: reading-ai-research-papers
    difficulty: intermediate
    prompt: What does an ablation study show?
    options: ["How fast the model trains", "How much each component contributes, by removing or changing it and measuring the effect", "Which dataset is largest", "How the model compares with humans"]
    answer: [1]
    explanation: Ablations remove or vary parts of a method to attribute the improvement to specific components.
  - id: read-papers-q3
    type: scenario
    topic: reading-ai-research-papers
    difficulty: intermediate
    prompt: A new model scores far higher on an older public benchmark than on a newly written set of similar questions. What should you suspect first?
    options: ["The new set is too easy", "Benchmark contamination of the older benchmark", "The model is underfitting", "A bug in the tokenizer"]
    answer: [1]
    explanation: A large gap between an old public benchmark and fresh equivalent questions is a classic sign the old test data leaked into training.
  - id: read-papers-q4
    type: multiple
    topic: reading-ai-research-papers
    difficulty: intermediate
    prompt: Which are warning signs in an experimental section? Select all that apply.
    options: ["Single run with a small improvement and no variance", "Baselines copied from older papers with different settings", "Results across several seeds with confidence intervals", "Only hand-picked qualitative examples"]
    answer: [0, 1, 3]
    explanation: Multi-seed results with intervals are good practice. The others make claimed improvements hard to trust.
---

## Beginner-friendly explanation

Research papers are where new AI methods first appear, often months or years before a tidy tutorial. They are dense because they are written for experts and reviewers, not newcomers. The trick is that **nobody reads a paper start to finish in one go**. Experienced readers skim, decide, then dig in only where needed.

A paper makes a **claim** ("our method improves X"), supports it with **evidence** (experiments, proofs) and makes a **comparison** (against baselines). Your job as a reader is to understand the claim and decide how far to trust the evidence. As a tester, you already have the right instincts: what was compared, under what conditions, and what could make the result misleading?

## Technical explanation

### The three-pass method

S. Keshav's short guide "How to Read a Paper" proposes:

1. **First pass (about 5 to 10 minutes):** title, abstract, introduction, section and subsection headings, conclusions, glance at references and figures. Answer the "five Cs": category, context, correctness (do assumptions look valid?), contributions, clarity.
2. **Second pass (up to about an hour):** read carefully, skip proofs. Study figures, tables and axes. Mark unread references worth following.
3. **Third pass (hours for a beginner):** virtually re-implement the paper. Challenge every assumption, and think how you would present it.

Stop after any pass if you have what you need.

### Anatomy of an ML paper

| Section | What to extract |
|---|---|
| Abstract | Claim and headline number |
| Introduction | Problem, why it matters, list of contributions |
| Related work | What the authors consider the state of the art |
| Method | What is new; equations; key hyperparameters |
| Experiments | Datasets, metrics, baselines, compute, seeds |
| Results tables | The actual comparison, margins and variance |
| Ablations | Which components cause the gain |
| Limitations | What the authors admit does not work |
| Appendix | Settings needed to reproduce |

### Judging the evidence

- **Baselines:** are they strong, recent and tuned with similar effort? Copied numbers from other papers may use different data splits or compute.
- **Matched conditions:** same data, same compute budget, same evaluation protocol and decoding settings.
- **Variance:** multiple seeds, standard deviations or confidence intervals. A gain smaller than seed-to-seed variance is not a gain.
- **Ablations:** remove each component; a method with five changes and no ablations leaves you guessing what helped.
- **Metrics:** do they measure what matters? Is an LLM judge used, and was it validated against humans?
- **Generalisation:** more than one dataset; out-of-distribution tests.
- **Cherry-picking:** qualitative examples are illustrations, not evidence.

### Benchmark contamination

Large models are trained on huge web crawls that may include benchmark questions and answers. Then a high score may reflect memorisation. Signs and checks: n-gram or embedding overlap analysis between training data and test sets, performance drops on rephrased or newly authored items, and benchmarks with post-training-cutoff questions. Contamination is also a risk in your own work whenever test data is public or reused.

### Reproduction

Reproduce the **headline result first**, using released code if available. Record environment, versions, seeds, hardware and every deviation. Partial reproduction ("within the reported variance on one dataset") is still valuable. If you cannot reproduce, check details in the appendix and repository issues before concluding the claim is wrong.

## Real-world example

A team considered adopting a new retrieval method that a paper reported beat a standard baseline by several points. During the second pass, a tester on the team noticed the baseline numbers were copied from an earlier paper that used a smaller document collection and a different chunk size, while the new method was evaluated on the larger collection. No seeds were reported. The team re-ran both methods on their own data with three seeds each. The new method helped on long documents but not short ones, and the gap was much smaller than claimed. They adopted it only for the long-document index. The paper was not dishonest; the comparison just did not match their conditions.

## Step-by-step walkthrough

1. **First pass:** write the claim in one sentence. Decide whether to continue.
2. **Second pass:** fill a reading-notes template (below).
3. **Check the comparison table**: baselines, matching, variance.
4. **Read the ablations and limitations.**
5. **Search** for code, follow-up papers and reproduction reports.
6. **Third pass or reproduction**, only if you will rely on the result.
7. **Write a short summary** for your team with your confidence level.

## Code examples

A reading-notes template kept as structured data so a team can search it:

```python
from dataclasses import dataclass, field, asdict
import json

@dataclass
class PaperNotes:
    title: str
    arxiv_id: str
    claim: str
    method_in_one_line: str
    datasets: list[str] = field(default_factory=list)
    baselines: list[str] = field(default_factory=list)
    baselines_rerun: bool | None = None
    seeds_reported: int | None = None
    ablations_present: bool = False
    contamination_checked: bool = False
    code_available: bool = False
    doubts: list[str] = field(default_factory=list)
    confidence: str = "low"  # low / medium / high

notes = PaperNotes(
    title="LoRA: Low-Rank Adaptation of Large Language Models",
    arxiv_id="2106.09685",
    claim="Low-rank updates to frozen weights can match full fine-tuning with far fewer trainable parameters.",
    method_in_one_line="Learn W + BA with small rank r on attention projections.",
    datasets=["GLUE", "E2E NLG", "WikiSQL", "SAMSum"],
    ablations_present=True,
    code_available=True,
    doubts=["How sensitive is quality to the choice of rank and target modules on my task?"],
)
print(json.dumps(asdict(notes), indent=2))
```

A quick n-gram overlap check you can run on your own train and test sets:

```python
def ngrams(text, n=8):
    toks = text.lower().split()
    return {" ".join(toks[i:i + n]) for i in range(len(toks) - n + 1)}

def overlap_rate(train_texts, test_texts, n=8):
    train = set().union(*(ngrams(t, n) for t in train_texts))
    flagged = [t for t in test_texts if ngrams(t, n) & train]
    return len(flagged) / max(len(test_texts), 1), flagged

rate, flagged = overlap_rate(["the quick brown fox jumps over the lazy dog today"],
                             ["the quick brown fox jumps over the lazy dog today again", "unrelated"])
print(f"{rate:.0%} of test items share an 8-gram with training")
```

## Expected output

The notes script prints a JSON record you can store alongside other papers. The overlap check prints `50% of test items share an 8-gram with training`, flagging the near-duplicate.

## Common mistakes

- **Reading linearly from page one** and giving up in the method section.
- **Trusting the abstract's number** without checking the table conditions.
- **Ignoring variance**, so noise is mistaken for progress.
- **Assuming results transfer** to your data, scale or language.
- **Skipping the limitations and appendix**, where crucial settings live.
- **Treating leaderboards as ground truth** despite possible contamination.

## Troubleshooting

- **Too much unfamiliar maths:** read surrounding text and figures for intuition; look up one concept at a time.
- **Cannot reproduce:** compare library versions, preprocessing, tokenisation and decoding settings; check repository issues.
- **Too many papers:** first-pass ten, second-pass two, third-pass at most one.

## Exercise

Choose a recent paper relevant to your work. Complete all three passes, fill in the notes template, and present a five-minute summary covering the claim, the strength of the evidence, contamination risk and whether your team should adopt it.

## Key takeaways summary

Read papers in passes, extract claim, evidence and comparison, and judge them by baselines, matched conditions, variance, ablations and contamination checks. Reproduction is the gold standard of understanding.
