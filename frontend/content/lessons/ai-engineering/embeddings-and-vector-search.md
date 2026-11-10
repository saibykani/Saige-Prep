---
slug: embeddings-and-vector-search
title: Embeddings and Vector Search
summary: Learn how embeddings turn text into vectors whose distances reflect meaning, how cosine similarity and nearest-neighbour search work, and how vector indexes such as FAISS make semantic search fast enough for real systems.
level: intermediate
duration: 50
tags: [embeddings, vector-search, cosine-similarity, faiss, ai-engineering]
objectives:
  - Explain what an embedding is and why similar meanings produce nearby vectors
  - Compute cosine similarity and top-k nearest neighbours with numpy
  - Compare exact and approximate nearest-neighbour search and the role of vector databases
  - Evaluate semantic search with recall@k and spot common failure modes
prerequisites:
  - Python and numpy basics
  - Vectors and dot products (see math for machine learning)
related: [math-for-machine-learning, building-rag-pipelines, llm-fundamentals-and-tokens, model-evaluation-metrics, transformers-and-attention]
references:
  - title: Anthropic docs — Embeddings
    url: https://platform.claude.com/docs/en/build-with-claude/embeddings
  - title: Sentence Transformers documentation (sbert.net)
    url: https://www.sbert.net/
  - title: FAISS on GitHub (facebookresearch/faiss)
    url: https://github.com/facebookresearch/faiss
  - title: OpenAI platform docs — Embeddings
    url: https://developers.openai.com/api/docs/guides/embeddings
  - title: Reimers and Gurevych — Sentence-BERT (arXiv 1908.10084)
    url: https://arxiv.org/abs/1908.10084
videos:
  - id: viZrOnJclY0
    title: "Word Embedding and Word2Vec, Clearly Explained!!!"
    channel: "StatQuest with Josh Starmer"
  - id: gl1r1XV0SLw
    title: "What is a Vector Database? Powering Semantic Search & AI Applications"
    channel: "IBM Technology"
  - id: klTvEwg3oJ4
    title: "Vector databases are so hot right now. WTF are they?"
    channel: "Fireship"
interview:
  - q: What is an embedding and why is it useful?
    a: An embedding is a fixed-length vector of numbers produced by a model so that texts with similar meaning end up close together in that vector space. It lets you search, cluster or deduplicate by meaning rather than exact words, so "reset my password" can match "forgot login credentials" even with no shared keywords.
  - q: Why is cosine similarity commonly used, and when is it the same as a dot product?
    a: Cosine similarity measures the angle between vectors, ignoring their length, which suits embeddings where direction encodes meaning. If vectors are normalised to unit length, cosine similarity equals the dot product, which is why many systems normalise once and then use fast inner-product search.
  - q: How would you test a semantic search feature?
    a: Build a labelled set of queries with the documents that should be found, then measure recall@k and a ranking metric such as MRR on it. Include paraphrases, typos, acronyms, exact identifiers such as error codes, other languages and queries with no good answer. Compare against a keyword baseline, check behaviour when the embedding model changes (all vectors must be re-embedded), and monitor latency as the index grows.
practice:
  - "Embed 20 FAQ entries with a sentence-transformers model, write 10 paraphrased queries and measure recall@3 using numpy cosine similarity."
  - "Add five queries that contain exact product codes. Compare semantic search with a simple keyword match and explain the difference."
  - "Index 100,000 random normalised vectors with faiss IndexFlatIP and an approximate index, and compare top-10 overlap and query time."
takeaways:
  - Embeddings map text to vectors where distance reflects meaning.
  - Cosine similarity compares direction; normalise vectors and it becomes a dot product.
  - Exact search is simple; approximate indexes trade a little recall for big speed gains.
  - Use the same embedding model for documents and queries, and re-embed when it changes.
  - Measure retrieval with labelled queries and recall@k; semantic search can miss exact identifiers.
quiz:
  - id: aie-embed-q1
    type: single
    topic: embeddings-and-vector-search
    difficulty: beginner
    prompt: Two unit-length embedding vectors have cosine similarity close to 1. What does that usually indicate?
    options: ["The texts are unrelated", "The texts have very similar meaning", "The texts have the same length", "The vectors are invalid"]
    answer: [1]
    explanation: A cosine near 1 means the vectors point the same way, which for a good embedding model means similar meaning. Length of text is not what it measures.
  - id: aie-embed-q2
    type: scenario
    topic: embeddings-and-vector-search
    difficulty: intermediate
    prompt: The team upgraded the embedding model for queries but kept the old document vectors. Search quality collapsed. Why?
    options: ["The index needs more RAM", "Vectors from different models live in different spaces and are not comparable", "Cosine similarity stops working above 512 dimensions", "Queries must be longer"]
    answer: [1]
    explanation: Each model defines its own vector space. Documents and queries must be embedded with the same model, so changing models means re-embedding the corpus.
  - id: aie-embed-q3
    type: code-output
    topic: embeddings-and-vector-search
    difficulty: intermediate
    prompt: What does this print?
    code: |
      import numpy as np
      a = np.array([1.0, 0.0]); b = np.array([0.0, 2.0])
      print(round(float(a @ b / (np.linalg.norm(a) * np.linalg.norm(b))), 2))
    codeLanguage: python
    options: ["1.0", "0.0", "2.0", "-1.0"]
    answer: [1]
    explanation: The vectors are perpendicular, so the dot product is 0 and cosine similarity is 0.0 regardless of length.
  - id: aie-embed-q4
    type: truefalse
    topic: embeddings-and-vector-search
    difficulty: intermediate
    prompt: Approximate nearest-neighbour indexes always return exactly the same results as brute-force search.
    options: ["True", "False"]
    answer: [1]
    explanation: Approximate indexes trade some recall for speed. You tune parameters and measure overlap with exact search.
---

## Beginner-friendly explanation

Imagine a giant map where every sentence is a dot. Sentences about cats sit in one neighbourhood, sentences about invoices in another, and "my bill is wrong" sits right next to "I was overcharged" even though they share no words. An **embedding** is the coordinates of a sentence on that map, given as a list of numbers. **Vector search** is finding the dots nearest to your question.

This is how modern semantic search works, and it is the "retrieval" part of retrieval-augmented generation (RAG).

## Technical explanation

### What an embedding is

An embedding model (often a transformer encoder) maps an input text to a vector of fixed length, for example a few hundred to a few thousand dimensions depending on the model. Training pushes texts with related meaning toward similar directions. Individual dimensions are not human-interpretable; only relative positions matter.

Popular sources:

- Hosted APIs (Anthropic's docs point to Voyage AI embeddings; OpenAI and others offer embedding endpoints).
- Open models via **sentence-transformers** that run locally.

Note that Claude itself is a generative model; for embeddings you use a dedicated embedding model.

### Similarity measures

| Measure | Formula | Notes |
|---|---|---|
| Cosine similarity | a·b / (‖a‖‖b‖) | Range −1 to 1; ignores magnitude |
| Dot product | a·b | Equals cosine for unit vectors |
| Euclidean distance | ‖a − b‖ | For unit vectors, ranks the same as cosine |

Normalising every vector to length 1 at index time is common: then the dot product *is* cosine similarity, and matrix multiplication finds all scores at once.

### Search at scale

- **Exact (brute force):** compare the query with every vector. Fine for thousands to low millions with numpy or `faiss.IndexFlatIP`.
- **Approximate nearest neighbour (ANN):** structures such as HNSW graphs or IVF clustering search a fraction of vectors. Much faster, slightly lower recall, tunable.
- **Vector databases** (and vector extensions to existing databases, including MongoDB Atlas Vector Search and PostgreSQL pgvector) add persistence, metadata filtering, updates and replication.

### Hybrid search

Embeddings are weak at exact tokens: error codes, SKUs, names. Many production systems combine **keyword search (BM25)** with vector search and merge the rankings, often followed by a **reranker** model that re-scores the top results.

### Evaluating retrieval

With labelled query → relevant-document pairs:

- **recall@k:** fraction of queries where a relevant document appears in the top k.
- **MRR (mean reciprocal rank):** rewards putting the relevant document near the top.

```mermaid
flowchart LR
  D[Documents] --> E1[Embedding model] --> V[(Vector index)]
  Q[Query] --> E2[Same embedding model] --> S[Similarity search top-k]
  V --> S --> R[Ranked results]
```

## Real-world example

An internal QA knowledge base used keyword search. Testers searching "flaky login test" missed the page titled "Intermittent authentication failures in CI". The team added embeddings with a sentence-transformers model and saw paraphrase queries succeed. Then a new problem appeared: searching for the exact error code `ERR_CERT_DATE_INVALID` returned general "certificate" pages but not the one runbook that contained the code. They moved to hybrid search (keyword + vector) and built a 50-query labelled set covering paraphrases and identifiers, measuring recall@5 before every change. When someone later swapped to a newer embedding model, the test set caught that the document vectors had not been regenerated.

## Step-by-step walkthrough

1. Choose an embedding model and note its dimension and max input length.
2. Embed every document (or chunk) and normalise.
3. Store vectors with IDs and metadata.
4. Embed the query with the same model, normalise.
5. Score with dot product, take top-k.
6. Evaluate with labelled queries; iterate on model, chunking and hybrid search.

## Code examples

Cosine similarity and top-k with numpy and a local sentence-transformers model (`pip install sentence-transformers numpy`):

```python
import numpy as np
from sentence_transformers import SentenceTransformer

model = SentenceTransformer("all-MiniLM-L6-v2")

docs = [
    "How to reset your password from the login page",
    "Refunds are processed within the policy window",
    "Intermittent authentication failures in CI pipelines",
    "Configuring Playwright retries for flaky tests",
    "Exporting test results to CSV",
]

doc_vecs = model.encode(docs, normalize_embeddings=True)   # shape (5, dim)

def search(query: str, k: int = 3):
    q = model.encode([query], normalize_embeddings=True)[0]
    scores = doc_vecs @ q                                    # cosine, since unit length
    top = np.argsort(-scores)[:k]
    return [(docs[i], float(scores[i])) for i in top]

for doc, score in search("my login test fails randomly in the pipeline"):
    print(f"{score:.3f}  {doc}")
```

Cosine similarity written out explicitly:

```python
def cosine(a: np.ndarray, b: np.ndarray) -> float:
    return float(a @ b / (np.linalg.norm(a) * np.linalg.norm(b)))
```

Measuring recall@k:

```python
labelled = {
    "forgot my password": 0,
    "login test fails randomly in CI": 2,
    "rerun unstable tests automatically": 3,
}

def recall_at_k(k: int) -> float:
    hits = 0
    for query, relevant_idx in labelled.items():
        q = model.encode([query], normalize_embeddings=True)[0]
        top = np.argsort(-(doc_vecs @ q))[:k]
        hits += int(relevant_idx in top)
    return hits / len(labelled)

print("recall@1", recall_at_k(1), "recall@3", recall_at_k(3))
```

Scaling with FAISS (`pip install faiss-cpu`):

```python
import faiss

index = faiss.IndexFlatIP(doc_vecs.shape[1])   # exact inner-product search
index.add(doc_vecs.astype("float32"))
q = model.encode(["export results"], normalize_embeddings=True).astype("float32")
scores, ids = index.search(q, 2)
print(ids[0], scores[0])
```

Hosted embedding APIs follow the same shape: send a list of texts, receive a list of vectors, then use exactly the same numpy or FAISS code.

## Expected output

The top result for "my login test fails randomly in the pipeline" is "Intermittent authentication failures in CI pipelines" with the highest score, despite few shared words. Recall values print between 0 and 1; with this tiny set you will likely see high recall@3. The FAISS search returns the CSV export document first.

## Common mistakes

- **Mixing embedding models** between documents and queries, or after an upgrade without re-embedding.
- **Forgetting to normalise** and then treating dot product as cosine.
- **Embedding huge documents whole**, exceeding the model's input limit (silently truncated) and blurring meaning; chunk instead.
- **Relying only on vectors** for exact identifiers; add keyword or hybrid search.
- **No labelled evaluation set**, so quality changes go unnoticed.
- **Ignoring metadata filters** (tenant, permissions), leaking documents across users.

## Troubleshooting

- **Irrelevant top results:** inspect scores, try a better or domain-suited model, chunk differently, add a reranker.
- **Slow queries at scale:** move from brute force to an ANN index and tune it against exact results.
- **Scores look similar for everything:** check for empty or boilerplate-heavy chunks dominating.

## Key takeaways summary

Embeddings place text in a vector space where nearness means similar meaning. Normalise, use cosine (dot product), take top-k, and scale with ANN indexes or vector databases. Keep the model consistent, combine with keyword search for exact terms, and prove quality with recall@k on labelled queries.
