---
slug: transformers-and-attention
title: Transformers and Attention
summary: Understand the transformer architecture behind modern LLMs, including tokens and embeddings, scaled dot-product attention, multi-head attention, positional information, causal masking and encoder, decoder and encoder-decoder variants.
level: advanced
duration: 75
tags: [transformers, attention, deep-learning, llm, pytorch]
objectives:
  - Explain why attention replaced recurrence for sequence modelling
  - Compute scaled dot-product attention with queries, keys and values by hand and in code
  - Describe multi-head attention, positional encodings, residual connections, layer normalisation and feed-forward blocks
  - Distinguish encoder-only, decoder-only and encoder-decoder transformers and explain causal masking and its cost
prerequisites:
  - Neural networks and deep learning
  - PyTorch essentials
  - Matrix multiplication and softmax
related: [pytorch-essentials, neural-networks-and-deep-learning, llm-fundamentals-and-tokens, embeddings-and-vector-search, reading-ai-research-papers, advanced-topics-in-modern-ai]
references:
  - title: Vaswani et al. (2017) — Attention Is All You Need (arXiv 1706.03762)
    url: https://arxiv.org/abs/1706.03762
  - title: PyTorch — torch.nn.functional.scaled_dot_product_attention
    url: https://pytorch.org/docs/stable/generated/torch.nn.functional.scaled_dot_product_attention.html
  - title: PyTorch — torch.nn.MultiheadAttention
    url: https://pytorch.org/docs/stable/generated/torch.nn.MultiheadAttention.html
  - title: Hugging Face — LLM Course, How do Transformers work?
    url: https://huggingface.co/learn/llm-course/chapter1/4
videos:
  - id: wjZofJX0v4M
    title: "Transformers, the tech behind LLMs | Deep Learning Chapter 5"
    channel: "3Blue1Brown"
  - id: eMlx5fFNoYc
    title: "Attention in transformers, step-by-step | Deep Learning Chapter 6"
    channel: "3Blue1Brown"
  - id: iDulhoQ2pro
    title: "Attention Is All You Need"
    channel: "Yannic Kilcher"
interview:
  - q: Explain scaled dot-product attention.
    a: Each token is projected into a query, a key and a value vector. For a given query, we take dot products with all keys to score how relevant each position is, divide by the square root of the key dimension to keep the scores in a range where softmax is not saturated, apply softmax to turn scores into weights that sum to one, and output the weighted sum of the value vectors. In matrix form it is softmax(QKᵀ / √d_k) V, optionally with a mask added before the softmax.
  - q: Why does a decoder-only language model need a causal mask?
    a: It is trained to predict the next token at every position in parallel. Without a mask, position t could attend to tokens after t, which includes the answer it is supposed to predict, so training would be trivial and generation would not work. The causal mask sets scores for future positions to negative infinity so they get zero attention weight.
  - q: What is the computational cost of self-attention with respect to sequence length?
    a: Computing QKᵀ compares every position with every other, so time and memory for the attention scores grow quadratically with sequence length, O(n²) per layer and head. This is why long contexts are expensive and motivates techniques such as memory-efficient attention kernels, key-value caching at inference time and various sparse or linear attention variants.
practice:
  - "Compute attention by hand for 2 tokens with 2-dimensional Q, K and V, then check with the NumPy function in this lesson."
  - "Modify the attention code to apply a causal mask and print the weight matrix; confirm the upper triangle is zero."
  - "Read sections 3.1 to 3.5 of Attention Is All You Need and draw the encoder and decoder blocks from memory."
takeaways:
  - Attention lets every token gather information from every other token in parallel.
  - Attention(Q, K, V) = softmax(QKᵀ / √d_k) V.
  - Multi-head attention runs several attentions in parallel subspaces and concatenates them.
  - Transformers add positional information, residual connections, layer norm and feed-forward layers.
  - GPT-style models are decoder-only with causal masking; BERT-style models are encoder-only; T5-style models are encoder-decoder.
  - Self-attention cost grows quadratically with sequence length.
quiz:
  - id: aie-transformers-q1
    type: single
    topic: transformers-and-attention
    difficulty: advanced
    prompt: Why are attention scores divided by the square root of d_k?
    options: ["To make the model smaller", "To keep dot products from growing large with dimension, which would push softmax into regions with tiny gradients", "To normalise the values vectors", "To implement causal masking"]
    answer: [1]
    explanation: The original paper notes that large dot products push softmax into saturated regions with very small gradients; scaling by 1/√d_k counteracts this.
  - id: aie-transformers-q2
    type: single
    topic: transformers-and-attention
    difficulty: advanced
    prompt: Which architecture is typical of GPT-style text-generation models?
    options: ["Encoder-only", "Decoder-only with causal self-attention", "Convolutional only", "Recurrent LSTM"]
    answer: [1]
    explanation: GPT-style models stack decoder blocks with causal (masked) self-attention and predict the next token.
  - id: aie-transformers-q3
    type: truefalse
    topic: transformers-and-attention
    difficulty: advanced
    prompt: Self-attention by itself is permutation-equivariant, so transformers need some form of positional information to use word order.
    options: ["True", "False"]
    answer: [0]
    explanation: Without positional encodings or embeddings, shuffling the input tokens just shuffles the outputs; position must be injected, for example via sinusoidal, learned or rotary position encodings.
  - id: aie-transformers-q4
    type: scenario
    topic: transformers-and-attention
    difficulty: advanced
    prompt: Doubling the context length of a model makes the attention-score memory per layer roughly how much larger with standard attention?
    options: ["The same", "About 2 times", "About 4 times", "About 8 times"]
    answer: [2]
    explanation: The score matrix is n × n, so doubling n quadruples its size.
---

## Beginner-friendly explanation

Read this sentence: "The trophy didn't fit in the suitcase because **it** was too big." To know what "it" means, you look back at "trophy" and "suitcase" and decide which one fits. **Attention** is a way for a neural network to do exactly that: for each word, look at all the other words, decide which are relevant, and blend their information in.

Before transformers, language models mostly read text one word at a time (recurrent networks), passing a running memory along. That was slow to train and struggled to remember things from far back. The **transformer**, introduced in the 2017 paper "Attention Is All You Need", dropped recurrence and used attention so every word can look at every other word **at the same time**. That parallelism made it practical to train very large models on huge datasets, which led to today's large language models.

## Technical explanation

### From text to vectors

1. **Tokenisation** splits text into tokens (often sub-word pieces).
2. Each token id is looked up in an **embedding table** to get a vector of size `d_model`.
3. **Positional information** is added, because attention alone ignores order. The original paper used fixed sinusoidal encodings; many later models use learned or rotary position embeddings.

### Scaled dot-product attention

Each token vector `x` is projected with learned matrices into a **query** `q = xW_Q` ("what am I looking for?"), a **key** `k = xW_K` ("what do I contain?") and a **value** `v = xW_V` ("what will I pass on?").

```text
Attention(Q, K, V) = softmax( Q Kᵀ / √d_k ) V
```

```text
 Q (n×d)   Kᵀ (d×n)       scores (n×n)     softmax rows     weights (n×n)  V (n×d)    output (n×d)
 [ q1 ] x [k1 k2 k3]  ->  q_i · k_j / √d -> each row sums to 1 ----------> x [ v ]  =  weighted mix
```

### Worked example (2 tokens, d_k = 2)

Let `q1 = [1, 0]`, `k1 = [1, 0]`, `k2 = [0, 1]`, `v1 = [10, 0]`, `v2 = [0, 10]`.

- Scores: `q1·k1 = 1`, `q1·k2 = 0`; divide by √2 → `0.707, 0`.
- Softmax: `e^0.707 / (e^0.707 + e^0) ≈ 2.028 / 3.028 ≈ 0.67`, and `≈ 0.33`.
- Output: `0.67·[10, 0] + 0.33·[0, 10] ≈ [6.7, 3.3]`.

Token 1 attends mostly to itself because its query matches its own key best.

### Multi-head attention

Instead of one attention with `d_model` dimensions, use `h` heads, each with dimension `d_model / h` and its own projections. Heads can specialise (for example, one tracking nearby words, another tracking long-range references). Outputs are concatenated and projected back with `W_O`. The original base model used `d_model = 512` with 8 heads.

### The transformer block

```text
x ──► LayerNorm ──► Multi-head self-attention ──► + (residual) ──►
  ──► LayerNorm ──► Feed-forward (Linear → activation → Linear) ──► + (residual) ──► next block
```

The original paper placed layer norm after each residual addition ("post-norm"); many modern models put it before ("pre-norm", as drawn) for more stable training. The feed-forward network is applied to each position independently.

### Masks and architectures

| Variant | Attention | Typical use | Examples |
|---|---|---|---|
| Encoder-only | Bidirectional (sees all tokens) | Classification, embeddings, extraction | BERT |
| Decoder-only | Causal (sees only earlier tokens) | Text generation, chat LLMs | GPT family |
| Encoder-decoder | Encoder bidirectional; decoder causal plus cross-attention to encoder | Translation, summarisation | Original Transformer, T5 |

A **causal mask** adds −∞ to scores for future positions before the softmax, so their weights are 0:

```text
        k1   k2   k3
q1  [   s   -inf -inf ]
q2  [   s    s   -inf ]
q3  [   s    s    s   ]
```

**Cross-attention** takes queries from the decoder and keys and values from the encoder output.

### Generation and cost

A decoder-only model generates one token at a time: run the sequence, take the probability distribution for the next token, pick one (greedy or sampling with temperature), append, repeat. A **KV cache** stores previous keys and values so each new step does not recompute them.

Standard self-attention computes an `n × n` score matrix, so cost grows quadratically with sequence length. Optimised kernels (such as PyTorch's `scaled_dot_product_attention`, which can dispatch to memory-efficient implementations) reduce memory use, but the number of pairwise interactions is still quadratic.

## Real-world example

A team building a test-case search tool needs to find existing tests similar to a new bug report. They use an **encoder-only** transformer to turn each test description into an embedding and search by cosine similarity, because they need representations, not generated text. Separately, to draft new test steps from a requirement, they call a **decoder-only** LLM. Knowing which architecture suits which job, and that longer inputs cost quadratically more attention compute, helped them chunk long requirement documents rather than send everything at once.

## Step-by-step walkthrough

Attention from scratch in NumPy, then the same with PyTorch:

```python
import numpy as np

def softmax(x, axis=-1):
    x = x - x.max(axis=axis, keepdims=True)        # numerical stability
    e = np.exp(x)
    return e / e.sum(axis=axis, keepdims=True)

def attention(Q, K, V, causal=False):
    d_k = Q.shape[-1]
    scores = Q @ K.T / np.sqrt(d_k)                  # (n, n)
    if causal:
        n = scores.shape[0]
        mask = np.triu(np.ones((n, n), dtype=bool), k=1)
        scores = np.where(mask, -np.inf, scores)
    weights = softmax(scores)
    return weights @ V, weights

Q = np.array([[1.0, 0.0], [0.0, 1.0]])
K = np.array([[1.0, 0.0], [0.0, 1.0]])
V = np.array([[10.0, 0.0], [0.0, 10.0]])

out, w = attention(Q, K, V)
print(w.round(2)); print(out.round(2))
out_c, w_c = attention(Q, K, V, causal=True)
print(w_c.round(2))
```

```python
import torch
import torch.nn.functional as F

torch.manual_seed(0)
batch, heads, seq, d = 1, 2, 4, 8
q, k, v = (torch.randn(batch, heads, seq, d) for _ in range(3))
out = F.scaled_dot_product_attention(q, k, v, is_causal=True)
print(out.shape)  # torch.Size([1, 2, 4, 8])

mha = torch.nn.MultiheadAttention(embed_dim=16, num_heads=4, batch_first=True)
x = torch.randn(2, 5, 16)                 # batch of 2, 5 tokens, d_model=16
y, attn_weights = mha(x, x, x)            # self-attention
print(y.shape, attn_weights.shape)        # (2, 5, 16) (2, 5, 5)
```

## Expected output

For the NumPy example without a mask, each row of the weight matrix is about `[0.67, 0.33]` or `[0.33, 0.67]`, and outputs are about `[6.7, 3.3]` and `[3.3, 6.7]`. With the causal mask, the first row becomes `[1, 0]` because token 1 can only see itself. The PyTorch calls print the shapes shown in the comments (attention weights are averaged across heads by default in `MultiheadAttention`).

## Common mistakes

- **Forgetting the √d_k scaling,** leading to very peaky softmax and poor gradients.
- **Applying softmax along the wrong axis;** each query's weights over keys must sum to 1.
- **Leaking the future** by omitting the causal mask in a language model.
- **Mixing up `batch_first`** in `nn.MultiheadAttention` (the default expects sequence-first tensors).
- **Assuming attention weights are a faithful explanation** of model reasoning; they are one internal signal, not a complete explanation.
- **Ignoring quadratic cost** when planning long-context features.

## Troubleshooting

- **NaN after masking:** a row where every position is masked gives softmax over all −∞; make sure each query can attend to at least one key.
- **Shape errors:** write shapes for Q, K, V as `(batch, heads, seq, head_dim)` and check each matmul.
- **Generation repeats itself:** a sampling issue (greedy decoding, low temperature) rather than an attention bug; try sampling settings.

## Hands-on exercise

Implement a single transformer block as a PyTorch `nn.Module`: pre-norm `LayerNorm`, `nn.MultiheadAttention` with a causal mask (`nn.Transformer.generate_square_subsequent_mask`), residual connections and a feed-forward network of `Linear(d, 4d) → GELU → Linear(4d, d)`. Pass a random `(2, 10, 64)` tensor through it, confirm the output shape is unchanged, and verify causality: changing token 9 must not change the outputs at positions 0–8.

## Key takeaways summary

Transformers turn tokens into vectors, add position, and repeatedly apply multi-head self-attention and feed-forward layers with residual connections and normalisation. Attention is `softmax(QKᵀ/√d_k)V`: every token takes a weighted mix of every other token's values. Encoder-only, decoder-only and encoder-decoder variants suit different tasks; causal masking enables next-token generation; and quadratic cost in sequence length shapes how long-context systems are built.
