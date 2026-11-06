---
slug: ai-cost-latency-and-scaling
title: AI Cost, Latency and Scaling
summary: Learn where the time and money go in AI systems and how to reduce both with measurement, token budgets, caching, batching, streaming, model routing and capacity planning, without silently lowering quality.
level: intermediate
duration: 55
tags: [performance, cost, latency, caching, scaling]
objectives:
  - Break down end-to-end latency of an LLM request into queueing, time to first token and generation time
  - Estimate cost from token counts and request volume using your provider's current price list
  - Apply response caching, prompt caching, batching, streaming and model routing appropriately
  - Load-test an AI endpoint and report latency percentiles rather than averages
  - Verify that optimisations do not reduce output quality
prerequisites:
  - How tokens work in LLMs
  - Calling an LLM API
  - Basic performance testing concepts (throughput, percentiles)
related: [llm-fundamentals-and-tokens, llm-apis-and-structured-output, mlops-and-model-deployment, monitoring-ai-in-production, building-rag-pipelines, advanced-topics-in-modern-ai]
references:
  - title: Python documentation — asyncio
    url: https://docs.python.org/3/library/asyncio.html
  - title: FastAPI — Custom Response (StreamingResponse)
    url: https://fastapi.tiangolo.com/advanced/custom-response/
  - title: Python documentation — functools.lru_cache
    url: https://docs.python.org/3/library/functools.html#functools.lru_cache
  - title: Kwon et al. — Efficient Memory Management for LLM Serving with PagedAttention (arXiv 2309.06180)
    url: https://arxiv.org/abs/2309.06180
interview:
  - q: How would you reduce the latency a user perceives for a chat feature?
    a: First I would measure, splitting latency into network, queueing, time to first token and generation time, and look at p50 and p95 rather than averages. Streaming tokens usually improves perceived latency most because the user sees text as soon as the first token arrives. Then I would shorten prompts and cap output length, cache repeated work such as identical requests or a long shared system prompt where the provider supports prompt caching, run independent steps such as retrieval and classification concurrently, and route simple requests to a smaller faster model. Each change is checked against a quality evaluation set.
  - q: How do you estimate the monthly cost of an LLM feature?
    a: I measure average input and output tokens per request on realistic traffic, multiply by expected request volume, and apply the provider's current per-token prices for input and output separately, since output is often priced differently. I add retries, tool-call round trips, retrieval embedding costs and evaluation traffic, then build a range using p50 and p95 token counts and growth scenarios. I never hardcode prices in the estimate because they change; I reference the current price page and date.
  - q: What is the risk of response caching for LLM features?
    a: Returning a cached answer to a request that only looks similar can give wrong, stale or even another user's personalised content. Exact-match caching keyed on the full normalised input plus model and prompt version is safe but has lower hit rates. Semantic caching raises hit rates but needs a carefully tested similarity threshold, must never cross user or tenant boundaries, and needs expiry for time-sensitive content.
practice:
  - "Instrument an LLM call to record time to first token, total time, input tokens and output tokens. Run 50 requests and report p50, p95 and p99."
  - "Add an exact-match cache keyed on model, prompt version and normalised input. Measure hit rate and latency on a replayed log of real or synthetic queries."
  - "Compare a large and a small model on your evaluation set. Design a router that sends easy requests to the small model and measure quality and token usage changes."
takeaways:
  - Measure first, with percentiles, and split latency into its stages.
  - Cost scales with tokens times volume; prompts, outputs, retries and retrieval all add up.
  - Streaming improves perceived latency; concurrency and batching improve throughput.
  - Caching and routing save money but must be keyed and tested carefully.
  - Every optimisation needs a quality check, because cheaper and faster can mean worse.
quiz:
  - id: cost-lat-q1
    type: single
    topic: ai-cost-latency-and-scaling
    difficulty: intermediate
    prompt: Which change most directly improves perceived latency in a chat interface without changing the model?
    options: ["Raising the temperature", "Streaming tokens to the user as they are generated", "Logging more fields", "Adding a longer system prompt"]
    answer: [1]
    explanation: Streaming shows output from the first token, so users wait for time to first token rather than full generation.
  - id: cost-lat-q2
    type: multiple
    topic: ai-cost-latency-and-scaling
    difficulty: intermediate
    prompt: Which factors increase the cost of an LLM feature? Select all that apply.
    options: ["Longer prompts and retrieved context", "Longer outputs", "Automatic retries on errors", "Returning cached exact-match answers"]
    answer: [0, 1, 2]
    explanation: Tokens in and out, plus extra calls from retries, raise cost. Cache hits avoid a model call.
  - id: cost-lat-q3
    type: truefalse
    topic: ai-cost-latency-and-scaling
    difficulty: beginner
    prompt: Average latency is the best single number to describe user experience for an AI endpoint.
    options: ["True", "False"]
    answer: [1]
    explanation: Averages hide the slow tail. Percentiles such as p95 and p99 show what many users actually experience.
  - id: cost-lat-q4
    type: scenario
    topic: ai-cost-latency-and-scaling
    difficulty: intermediate
    prompt: A semantic cache returned one customer's order summary to another customer. What was the root mistake?
    options: ["The cache expiry was too long", "The cache key did not include the user or tenant boundary", "Streaming was disabled", "The model was too small"]
    answer: [1]
    explanation: Caches for personalised content must be scoped per user or tenant. Similar text is not the same request.
---

## Beginner-friendly explanation

Every call to a large model costs time and money. Time, because the model generates text token by token. Money, because providers usually charge per token, and self-hosted models consume GPU hours.

A useful mental model is a coffee shop. **Latency** is how long one customer waits. **Throughput** is how many customers are served per hour. **Cost** is what each cup costs to make. You can make customers feel served faster by handing them the first sip while the rest is poured (streaming), serve more people by having several baristas (concurrency) or making several cups at once (batching), and save money by not remaking a drink that was just ordered identically (caching).

## Technical explanation

### Anatomy of latency

For an LLM request:

1. **Network and queueing** before the model starts.
2. **Prefill:** the model processes the whole input prompt. Longer prompts take longer.
3. **Time to first token (TTFT).**
4. **Decode:** output tokens are produced one after another. Time grows roughly with output length.
5. **Post-processing:** parsing, validation, tool calls, further model calls.

Agents and RAG pipelines chain several of these, so latency adds up. Report **p50, p95 and p99**, not averages.

### Cost model

`cost ≈ volume × (input_tokens × input_price + output_tokens × output_price)` plus embeddings, retries, tool round trips and evaluation traffic. Prices change and differ by model and provider, so read them from the current price page. For self-hosting, cost depends on hardware utilisation: an idle GPU still costs money.

### Techniques

| Technique | Helps | Watch out for |
|---|---|---|
| Shorter prompts, capped outputs | cost, latency | dropping needed instructions |
| Streaming | perceived latency | partial output handling, validation at the end |
| Concurrency (async) | throughput, chained latency | provider rate limits |
| Batching | throughput, cost (some providers offer cheaper batch APIs) | higher latency per item |
| Exact-match response cache | cost, latency | keys must include model and prompt version |
| Semantic cache | cost | wrong answers on near matches, tenant leaks |
| Provider prompt caching | cost and TTFT for long shared prefixes | only works if the prefix is identical; check provider docs |
| Model routing / cascades | cost | quality on misrouted hard requests |
| Smaller, distilled or quantised models | cost, latency | quality loss on some slices |
| Retrieval tuning (fewer, better chunks) | cost, latency | recall loss |

On self-hosted serving, engines that use **continuous batching** and efficient key-value cache management, such as the PagedAttention approach, raise GPU throughput substantially compared with naive serving.

### Scaling

Horizontal scaling adds replicas behind a load balancer. GPU workloads scale slowly (cold starts, model loading), so plan capacity for peaks and use queues for non-interactive work. Respect provider rate limits with backoff and jitter. Use timeouts and circuit breakers so a slow model does not exhaust your workers.

## Real-world example

A legal-research assistant had a p95 latency far above its target and a growing bill. Tracing showed each request sent the full 40-page policy document as context, ran three sequential model calls, and regenerated identical answers for common questions. The team retrieved only relevant sections, ran the classification and retrieval steps concurrently, streamed the final answer, cached exact repeated questions per tenant with a one-day expiry, and routed short factual lookups to a smaller model. Before shipping each change they ran their 200-question evaluation set; the routing change initially dropped accuracy on multi-part questions, so they added a rule sending those to the larger model.

## Step-by-step walkthrough

1. **Instrument** TTFT, total latency, token counts and cost per request, with model and prompt version.
2. **Establish a quality baseline** on an evaluation set.
3. **Find the biggest contributor**: long prompts, long outputs, sequential calls or queueing.
4. **Apply one change at a time** and re-run both the load test and the evaluation set.
5. **Load-test** at expected and peak concurrency, checking rate limits and error rates.
6. **Monitor in production** and set budgets and alerts on cost per day.

## Code examples

Concurrency, timeouts and a simple exact-match cache. The model call is simulated so the code runs anywhere; replace `fake_llm` with your client.

```python
import asyncio, hashlib, json, random, statistics, time

PROMPT_VERSION = "v3"
MODEL = "small-model"
_cache: dict[str, str] = {}

async def fake_llm(prompt: str) -> str:
    await asyncio.sleep(random.uniform(0.2, 0.8))  # stand-in for network + generation
    return f"answer to: {prompt[:30]}"

def cache_key(tenant: str, prompt: str) -> str:
    raw = json.dumps([tenant, MODEL, PROMPT_VERSION, " ".join(prompt.lower().split())])
    return hashlib.sha256(raw.encode()).hexdigest()

async def answer(tenant: str, prompt: str) -> tuple[str, float, bool]:
    start = time.perf_counter()
    key = cache_key(tenant, prompt)
    if key in _cache:
        return _cache[key], time.perf_counter() - start, True
    out = await asyncio.wait_for(fake_llm(prompt), timeout=5)
    _cache[key] = out
    return out, time.perf_counter() - start, False

async def main():
    prompts = [f"question {i % 20}" for i in range(100)]  # repeats -> cache hits
    sem = asyncio.Semaphore(10)  # respect rate limits
    async def run(p):
        async with sem:
            return await answer("tenant-a", p)
    results = await asyncio.gather(*(run(p) for p in prompts))
    lat = sorted(r[1] for r in results)
    hits = sum(r[2] for r in results)
    q = statistics.quantiles(lat, n=100)
    print(f"hits={hits}/{len(results)} p50={q[49]:.3f}s p95={q[94]:.3f}s")

asyncio.run(main())
```

Streaming from a FastAPI endpoint:

```python
import asyncio
from fastapi import FastAPI
from fastapi.responses import StreamingResponse

app = FastAPI()

async def token_stream(prompt: str):
    for word in f"Streaming reply for {prompt}".split():
        await asyncio.sleep(0.05)  # replace with tokens from your model client
        yield word + " "

@app.get("/chat")
async def chat(q: str):
    return StreamingResponse(token_stream(q), media_type="text/plain")
```

A cost estimate with prices passed in, never hardcoded:

```python
def monthly_cost(requests, in_tok, out_tok, price_in_per_m, price_out_per_m):
    return requests * (in_tok * price_in_per_m + out_tok * price_out_per_m) / 1_000_000
# Fill prices from your provider's current pricing page and record the date you read it.
```

## Expected output

The concurrency script reports around 70 cache hits out of 100, not the ideal 80 (20 unique prompts): when a repeat arrives while the first call for the same prompt is still in flight, it misses the cache too (a small cache stampede; coalescing in-flight requests per key would fix it). It also prints p50 and p95 latencies; cached requests return in microseconds, so the p50 is very low while p95 reflects real calls. `curl -N "localhost:8000/chat?q=hi"` prints words progressively rather than all at once.

## Common mistakes

- **Optimising averages** and ignoring the p95 and p99 tail.
- **Cache keys without model, prompt version or tenant**, causing stale or leaked answers.
- **Hardcoding prices** in dashboards or estimates, which become wrong silently.
- **Unbounded concurrency** that hits rate limits and causes retry storms.
- **Shipping a cheaper model without re-running evals.**
- **Validating streamed JSON too early**, before the full output arrives.
- **Forgetting hidden calls**: retries, tool calls, embeddings and judge evaluations.

## Troubleshooting

- **High TTFT:** prompt too long, queueing at the provider or cold starts on self-hosted GPUs.
- **Throughput plateaus:** rate limits or a shared semaphore that is too small; check 429 responses.
- **Cache hit rate near zero:** inputs contain timestamps or IDs; normalise or restructure the key.

## Exercise

Take a RAG or chat prototype and produce a one-page performance report: baseline p50/p95, tokens and estimated monthly cost using current prices, three optimisations applied one at a time, and the quality score after each.

## Key takeaways summary

Measure latency in stages and in percentiles, model cost as tokens times volume, and apply streaming, concurrency, batching, caching and routing deliberately. Every optimisation is a trade-off that must be checked against a quality evaluation, and caches must respect user and tenant boundaries.
