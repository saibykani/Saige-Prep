---
slug: rag-evaluation
title: RAG Evaluation
summary: Learn how retrieval-augmented generation (RAG) works and how to evaluate its two halves separately, retrieval quality with recall and precision, and answer quality with faithfulness, relevance and citation checks.
level: advanced
duration: 40
tags: [rag, llm, evaluation, retrieval, ai-testing]
objectives:
  - Explain the RAG pipeline from document ingestion to grounded answer
  - Evaluate retrieval with recall at k, precision at k and mean reciprocal rank
  - Evaluate generation for faithfulness, answer relevance and correct citations
  - Diagnose whether a bad answer came from retrieval or generation
prerequisites:
  - LLM evaluation
  - Testing AI applications
related: [llm-evaluation, testing-ai-applications, test-data-design, testing-search-and-filtering, root-cause-analysis]
references:
  - title: Anthropic — Define success criteria and build evaluations
    url: https://docs.anthropic.com/en/docs/test-and-evaluate/develop-tests
  - title: OpenAI — Evaluation best practices
    url: https://platform.openai.com/docs/guides/evaluation-best-practices
  - title: Ragas documentation
    url: https://docs.ragas.io/
  - title: OWASP Top 10 for Large Language Model Applications
    url: https://genai.owasp.org/llm-top-10/
interview:
  - q: How do you evaluate a RAG system?
    a: I evaluate retrieval and generation separately, then end to end. For retrieval I build a dataset of questions labelled with the documents or chunks that contain the answer, and measure recall at k, precision at k and the rank of the first relevant result. For generation I check faithfulness, every claim supported by the retrieved context, answer relevance, and whether citations point to the right sources. I include questions with no answer in the knowledge base to check the system says it does not know instead of inventing something.
  - q: A RAG chatbot gives a wrong answer. How do you find the cause?
    a: I look at what was retrieved for that question. If the correct chunk was not retrieved, it is a retrieval problem, for example chunking split the key sentence, embeddings do not match the vocabulary, the document was never ingested or is outdated, or k is too small. If the right chunk was retrieved but the answer still contradicts it, it is a generation problem, such as the prompt not insisting on grounding or the context being too long and noisy. Logging the retrieved chunks per request makes this diagnosis possible.
  - q: What is faithfulness and why is it different from correctness?
    a: Faithfulness means the answer only states things supported by the retrieved context. Correctness means the answer matches the truth. An answer can be faithful but wrong if the source document is outdated, and correct but unfaithful if the model used its own memory instead of the context. In RAG we usually want both, and faithfulness failures are a warning sign of hallucination.
practice:
  - "Write ten questions for a company HR policy knowledge base, label which document answers each, and include two questions the documents cannot answer."
  - "For one question, calculate recall at 3 and precision at 3 given a list of retrieved chunk ids and the relevant ids."
  - "Take a sample answer and its retrieved context, and mark each claim as supported or unsupported."
takeaways:
  - RAG has two halves; evaluate retrieval and generation separately.
  - Recall at k shows whether the right context was found at all.
  - Faithfulness checks that every claim is supported by the retrieved context.
  - Include unanswerable questions to test that the system admits it does not know.
  - Log retrieved chunks so every bad answer can be traced to its cause.
quiz:
  - id: rage-q1
    type: code-output
    topic: rag-evaluation
    difficulty: intermediate
    prompt: "Relevant chunks for a question are {A, B}. The retriever returns [C, A, D, E, B] in that order. What is recall at 3?"
    code: |
      relevant  = {"A", "B"}
      retrieved = ["C", "A", "D", "E", "B"]
      top3 = retrieved[:3]
      print(len(relevant & set(top3)) / len(relevant))
    codeLanguage: python
    options: ["0.33", "0.5", "0.67", "1.0"]
    answer: [1]
    explanation: The top 3 contain only A, one of the two relevant chunks, so recall at 3 is 1/2 = 0.5. 0.33 is precision at 3, one relevant out of three retrieved.
  - id: rage-q2
    type: scenario
    topic: rag-evaluation
    difficulty: advanced
    prompt: The correct policy chunk is retrieved in first place, but the answer states a different notice period than the chunk. Where is the problem?
    options: ["Retrieval, because the chunk was missing", "Generation, because the answer is not faithful to the retrieved context", "Ingestion, because the document is absent", "The evaluation dataset"]
    answer: [1]
    explanation: Retrieval worked, since the right chunk ranked first. The model then contradicted it, which is a faithfulness failure in generation.
  - id: rage-q3
    type: truefalse
    topic: rag-evaluation
    difficulty: beginner
    prompt: A good RAG evaluation set should include questions the knowledge base cannot answer.
    options: ["True", "False"]
    answer: [0]
    explanation: Unanswerable questions check that the system says it does not know rather than inventing an answer, which is one of the main risks of RAG.
  - id: rage-q4
    type: single
    topic: rag-evaluation
    difficulty: intermediate
    prompt: An answer is fully supported by the retrieved document, but the document is an outdated policy. The answer is therefore...
    options: ["Faithful but incorrect", "Unfaithful but correct", "Faithful and correct", "Neither faithful nor relevant"]
    answer: [0]
    explanation: Faithfulness only checks support by the context, so it is faithful. Because the source is outdated, the answer is still wrong, which is why content freshness must be tested too.
---

## Beginner-friendly explanation

Imagine an open-book exam. A student first has to find the right pages in the textbook, then write an answer using those pages. A bad answer can have two causes: the student looked at the wrong pages, or found the right pages and still wrote something different.

Retrieval-augmented generation (RAG) works the same way. The system first **retrieves** relevant pieces of your documents, then a language model **generates** an answer from them. Evaluating RAG means checking both steps: were the right pages found, and was the answer faithful to them?

## Technical explanation

### The pipeline

```mermaid
flowchart LR
  A[Documents] --> B[Split into chunks]
  B --> C[Embed and index]
  Q[User question] --> R[Retrieve top k chunks]
  C --> R
  R --> G[LLM generates answer with citations]
  G --> U[User]
```

Each stage can fail: documents missing or outdated, chunks that split key sentences, embeddings that miss domain words, too few or too many chunks, or a model that ignores the context.

### Retrieval metrics

Build a dataset of questions labelled with the relevant chunk or document ids.

| Metric | Meaning |
|---|---|
| Recall at k | Share of relevant chunks that appear in the top k |
| Precision at k | Share of the top k chunks that are relevant |
| Hit rate at k | Whether at least one relevant chunk is in the top k |
| MRR (mean reciprocal rank) | Average of 1 / rank of the first relevant chunk |

Worked example: relevant = {A, B}, retrieved = [C, A, D, E, B].

| Metric | Calculation | Value |
|---|---|---|
| Recall at 3 | 1 relevant found / 2 relevant | 0.5 |
| Precision at 3 | 1 relevant / 3 retrieved | 0.33 |
| Recall at 5 | 2 / 2 | 1.0 |
| Reciprocal rank | first relevant at rank 2, so 1/2 | 0.5 |

### Generation metrics

- **Faithfulness (groundedness):** each claim in the answer is supported by the retrieved context.
- **Answer relevance:** the answer addresses the question asked.
- **Correctness:** the answer matches a reference answer.
- **Citation accuracy:** cited sources really contain the cited claim.
- **Abstention:** for unanswerable questions, the system says it does not know.

Faithfulness and relevance are usually graded by a calibrated model grader or humans, often by splitting the answer into claims and checking each one. Libraries such as Ragas implement these metrics; check their documentation for the current definitions, as they evolve.

### Security

Retrieved documents are untrusted input. A document containing hidden instructions can cause indirect prompt injection, and retrieval must respect permissions so users never get chunks from documents they cannot access.

## Code examples

```python
def recall_at_k(relevant: set, retrieved: list, k: int) -> float:
    return len(relevant & set(retrieved[:k])) / len(relevant)

def reciprocal_rank(relevant: set, retrieved: list) -> float:
    for rank, chunk in enumerate(retrieved, start=1):
        if chunk in relevant:
            return 1 / rank
    return 0.0

relevant, retrieved = {"A", "B"}, ["C", "A", "D", "E", "B"]
print(recall_at_k(relevant, retrieved, 3), recall_at_k(relevant, retrieved, 5), reciprocal_rank(relevant, retrieved))
```

## Expected output

```text
0.5 1.0 0.5
```

Averaging these values across the whole question set gives the retrieval scores you track release over release.

## Real-world example

An internal IT help assistant answered "How many days of leave can I carry over?" with the wrong number. Logs showed the correct HR policy chunk was never retrieved: the document used the phrase "annual entitlement rollover" and the chunk boundary split the number from its heading. Retrieval recall on a 150-question labelled set was low for HR questions. The team changed chunking to keep headings with their paragraphs and added keyword search alongside embeddings. Recall improved on the same dataset, and faithfulness checks confirmed the answers now followed the retrieved policy.

## Common mistakes

- **Evaluating only the final answer**, so retrieval and generation problems look the same.
- **No unanswerable questions** in the dataset.
- **Ignoring document freshness**, so faithful answers repeat outdated policies.
- **Not logging retrieved chunks**, making diagnosis impossible.
- **Skipping permission checks** in retrieval.

## Troubleshooting

- **Low recall.** Check ingestion, chunk size and overlap, embeddings and k.
- **Good recall but unfaithful answers.** Tighten the prompt to answer only from context, reduce noisy chunks, and require citations.

## Key takeaways summary

Evaluate RAG in two halves: did retrieval find the right context, and did generation stay faithful to it? Label your questions, include unanswerable ones and trace every failure to its stage. Review the foundations in [LLM evaluation](/learn/specialist/llm-evaluation).
