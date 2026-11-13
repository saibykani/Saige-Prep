---
slug: advanced-topics-in-modern-ai
title: Advanced Topics in Modern AI
summary: A careful tour of ideas shaping current AI systems, including mixture of experts, multimodal models, reasoning and test-time compute, distillation, quantization and interpretability, and what each means for building and testing.
level: advanced
duration: 70
tags: [mixture-of-experts, multimodal, reasoning, quantization, interpretability]
objectives:
  - Explain how mixture-of-experts layers route tokens to a subset of parameters and the trade-offs involved
  - Describe how multimodal models combine encoders for images or audio with language models
  - Explain test-time compute and reasoning approaches such as chain of thought, sampling and verification
  - Compare knowledge distillation and quantization as ways to make models cheaper
  - Summarise what interpretability research tries to do and its current limits
prerequisites:
  - Transformers and attention
  - LLM fundamentals and tokens
  - Evaluation of LLM systems
related: [transformers-and-attention, llm-fundamentals-and-tokens, neural-networks-and-deep-learning, fine-tuning-and-adaptation, ai-cost-latency-and-scaling, llm-evaluation-and-evals, reading-ai-research-papers]
references:
  - title: Shazeer et al. — Outrageously Large Neural Networks, the Sparsely-Gated Mixture-of-Experts Layer (arXiv 1701.06538)
    url: https://arxiv.org/abs/1701.06538
  - title: Radford et al. — Learning Transferable Visual Models From Natural Language Supervision, CLIP (arXiv 2103.00020)
    url: https://arxiv.org/abs/2103.00020
  - title: Wei et al. — Chain-of-Thought Prompting Elicits Reasoning in Large Language Models (arXiv 2201.11903)
    url: https://arxiv.org/abs/2201.11903
  - title: Hinton, Vinyals and Dean — Distilling the Knowledge in a Neural Network (arXiv 1503.02531)
    url: https://arxiv.org/abs/1503.02531
  - title: Hugging Face — Transformers quantization overview
    url: https://huggingface.co/docs/transformers/main/en/quantization/overview
  - title: Wang et al. — Self-Consistency Improves Chain of Thought Reasoning (arXiv 2203.11171)
    url: https://arxiv.org/abs/2203.11171
videos:
  - id: sYDlVVyJYn4
    title: "What is Mixture of Experts?"
    channel: "IBM Technology"
interview:
  - q: What is a mixture-of-experts model and why is it used?
    a: In a mixture-of-experts layer, usually replacing the feed-forward block of a transformer, there are several expert sub-networks and a learned router that sends each token to a small number of them, often one or two. The model can have a very large total parameter count while each token only uses a fraction, so compute per token is closer to a smaller dense model. Trade-offs include needing memory for all experts, load-balancing problems where some experts are overused, more complex training and distributed serving, and behaviour that can vary by token routing.
  - q: What does test-time compute mean for reasoning models?
    a: It means spending more computation at inference to get better answers, rather than only scaling training. Techniques include having the model produce intermediate reasoning steps, sampling several answers and taking a majority vote or using a verifier to pick the best, and search over candidate solutions. Models trained to reason at length can improve on maths, coding and multi-step tasks, at the cost of more tokens, latency and money. For testing, it means evaluating quality as a function of the compute budget and checking that more reasoning does not just produce longer but wrong answers.
  - q: Distillation versus quantization, when would you use each?
    a: Distillation trains a smaller student model to imitate a larger teacher's outputs, so you get a genuinely smaller architecture, but it needs a training pipeline and data, and the student may lose ability outside the distilled tasks. Quantization stores weights, and sometimes activations, in lower precision such as 8-bit or 4-bit, which reduces memory and often speeds up inference with no retraining for post-training methods, but can lose quality, especially at very low bit widths. They combine well. Either way I re-run the evaluation suite and check slices, because losses are often uneven.
practice:
  - "Load a small model in full precision and in 8-bit or 4-bit (where your hardware supports it). Compare memory use, latency and accuracy on 100 evaluation items."
  - "Implement self-consistency: sample five answers to 30 arithmetic word problems and take the majority vote. Compare accuracy and token cost with a single greedy answer."
  - "Pick one advanced topic from this lesson, read the original paper with the three-pass method and write a one-page summary with your confidence level."
takeaways:
  - Mixture of experts increases total parameters while keeping per-token compute lower, at the cost of memory and system complexity.
  - Multimodal models connect encoders for images, audio or video to a language model, bringing new failure modes to test.
  - Test-time compute trades tokens and latency for better answers on hard problems.
  - Distillation and quantization make models cheaper; always re-evaluate, especially by slice.
  - Interpretability is an active research area; current tools give partial, not complete, explanations.
quiz:
  - id: adv-ai-q1
    type: single
    topic: advanced-topics-in-modern-ai
    difficulty: advanced
    prompt: In a sparse mixture-of-experts layer, what does the router do?
    options: ["Chooses which GPU to buy", "Sends each token to a small subset of expert sub-networks", "Removes stop words", "Merges all experts into one"]
    answer: [1]
    explanation: A learned gating network selects a few experts per token, so only part of the layer's parameters are used for that token.
  - id: adv-ai-q2
    type: single
    topic: advanced-topics-in-modern-ai
    difficulty: advanced
    prompt: What is self-consistency in reasoning?
    options: ["Fine-tuning on the model's own outputs", "Sampling several reasoning paths and choosing the most common final answer", "Setting temperature to zero", "Checking that the tokenizer is consistent"]
    answer: [1]
    explanation: Self-consistency samples multiple chain-of-thought answers and takes a majority vote, using more test-time compute to improve accuracy.
  - id: adv-ai-q3
    type: truefalse
    topic: advanced-topics-in-modern-ai
    difficulty: intermediate
    prompt: Quantizing a model to 4-bit always preserves its accuracy exactly.
    options: ["True", "False"]
    answer: [1]
    explanation: Lower precision can reduce quality, and losses can be uneven across tasks. You must re-evaluate after quantization.
  - id: adv-ai-q4
    type: multiple
    topic: advanced-topics-in-modern-ai
    difficulty: advanced
    prompt: Which are new testing concerns for a multimodal model that reads images? Select all that apply.
    options: ["Instructions hidden inside an image (visual prompt injection)", "Misreading text, charts or small details in images", "Hallucinating objects that are not present", "Nothing new compared with text-only models"]
    answer: [0, 1, 2]
    explanation: Images add new attack surfaces and perception errors, including object hallucination, that text-only tests do not cover.
---

## Beginner-friendly explanation

The basic recipe of modern AI is a transformer trained on a lot of data. Around that recipe, researchers keep adding ideas that make models bigger without being slower, able to see and hear, better at hard problems, cheaper to run, and easier to understand.

This lesson is a map of six such ideas. You do not need to build them from scratch, but you should know what they are, why people use them, and what they change for testing. The field moves quickly, so treat details here as a snapshot and check the cited papers and current documentation.

- **Mixture of experts:** many specialist sub-networks, only a few used per token.
- **Multimodal models:** one model that handles text plus images, audio or video.
- **Reasoning and test-time compute:** letting the model "think longer" at answer time.
- **Distillation:** teaching a small model to imitate a big one.
- **Quantization:** storing numbers with fewer bits.
- **Interpretability:** looking inside the model to understand how it works.

## Technical explanation

### Mixture of experts (MoE)

The sparsely-gated MoE layer (Shazeer et al., 2017) replaces one dense feed-forward network with N experts and a gating network. For each token the router picks the top-k experts (k is small), and their outputs are combined using the gate weights. Benefits: large total capacity with per-token compute close to a smaller dense model. Costs: all experts must be stored in memory; training needs auxiliary load-balancing losses so tokens do not pile onto a few experts; serving across devices adds communication. Several openly documented large models use MoE designs; check each model card for specifics.

**Testing angle:** latency can depend on routing and batching; quality can vary by domain if some experts are under-trained. Evaluate across diverse slices.

### Multimodal models

A common pattern pairs a **vision encoder** (often trained contrastively, as in CLIP, to align images and text in one embedding space) with a language model through a projection layer, so image features become token-like inputs. Some models are trained on mixed modalities from the start. Audio and video follow similar ideas.

**Testing angle:** object hallucination (describing things not present), OCR and chart misreading, sensitivity to resolution and cropping, bias in image understanding, and **visual prompt injection**, where instructions are hidden in an image.

### Reasoning and test-time compute

**Chain-of-thought prompting** (Wei et al., 2022) showed that asking for intermediate steps improves performance on multi-step problems for sufficiently large models. **Self-consistency** (Wang et al., 2022) samples several reasoning paths and takes a majority vote. Further approaches use **verifiers** or reward models to score candidates, and search over partial solutions. Recent "reasoning" models are trained, often with reinforcement learning, to produce long internal reasoning before answering. The broad finding is that, for some tasks, spending more compute at inference improves results, with diminishing returns and higher cost.

**Testing angle:** evaluate accuracy versus token budget; check that reasoning text is not mistaken for a faithful explanation (it may not reflect the actual computation); watch for overthinking on easy questions and for timeouts.

### Distillation

Knowledge distillation (Hinton et al., 2015) trains a student to match a teacher's softened output distribution (using a temperature), not only hard labels, transferring "dark knowledge" about which wrong answers are nearly right. For LLMs, a common variant fine-tunes a smaller model on teacher-generated responses. Check the teacher model's licence and terms, which may restrict using outputs for training.

### Quantization

Quantization represents weights (and sometimes activations or the key-value cache) with fewer bits, such as 8-bit integers or 4-bit formats, reducing memory and often increasing speed. **Post-training quantization** needs no retraining; methods such as GPTQ and AWQ use calibration data to limit error. **Quantization-aware training** simulates low precision during training. Quality usually degrades more at lower bit widths and can be uneven across tasks and languages.

### Interpretability

Interpretability research tries to explain model behaviour. Approaches include feature attribution (which inputs mattered), probing (training simple classifiers on internal activations), and **mechanistic interpretability**, which tries to identify internal features and circuits, for example using sparse autoencoders to find more interpretable directions in activations. These tools give useful but partial insight; they do not yet provide complete, verified explanations of large models, and attribution methods can be misleading if used naively.

## Real-world example

A document-processing team wanted to replace a large hosted model with something they could run on their own GPUs. They evaluated three options on 500 labelled invoices: a smaller open model distilled on teacher outputs, the same smaller model quantized to 4-bit, and a mid-sized MoE model. The quantized model used much less memory with a small overall accuracy drop, but slice analysis showed it misread totals on scanned invoices in one language far more often. The MoE model was most accurate but needed more GPU memory than they had. They shipped the 8-bit version of the distilled model, which met the accuracy bar on every slice, and kept the evaluation as a release gate for future changes.

## Step-by-step walkthrough

When an advanced technique is proposed for your system:

1. **Identify the goal:** quality, latency, memory, cost or explainability.
2. **Read the primary source** and the model or library documentation.
3. **Define the evaluation:** your tasks, slices and budget, before trying it.
4. **Measure trade-offs together:** quality, latency percentiles, memory and cost.
5. **Probe new failure modes** the technique introduces (routing, images, long reasoning, precision loss).
6. **Decide and document** with evidence, and keep the evaluation as a regression gate.

## Code examples

A toy top-k router in PyTorch to make MoE concrete:

```python
import torch
import torch.nn as nn
import torch.nn.functional as F

class TinyMoE(nn.Module):
    def __init__(self, d=32, n_experts=4, k=2):
        super().__init__()
        self.k = k
        self.gate = nn.Linear(d, n_experts)
        self.experts = nn.ModuleList([nn.Sequential(nn.Linear(d, 64), nn.GELU(), nn.Linear(64, d))
                                      for _ in range(n_experts)])

    def forward(self, x):                       # x: (tokens, d)
        weights, idx = self.gate(x).topk(self.k, dim=-1)
        weights = F.softmax(weights, dim=-1)
        out = torch.zeros_like(x)
        for slot in range(self.k):
            for e, expert in enumerate(self.experts):
                mask = idx[:, slot] == e
                if mask.any():
                    out[mask] += weights[mask, slot, None] * expert(x[mask])
        return out, idx

torch.manual_seed(0)
moe = TinyMoE()
y, routes = moe(torch.randn(10, 32))
print(y.shape, torch.bincount(routes.flatten(), minlength=4))  # load per expert
```

Self-consistency voting, independent of any provider:

```python
from collections import Counter

def self_consistency(sample_fn, question, n=5):
    answers = [sample_fn(question) for _ in range(n)]   # each call samples with temperature > 0
    final, votes = Counter(answers).most_common(1)[0]
    return final, votes / n
```

Distillation loss with temperature:

```python
def distill_loss(student_logits, teacher_logits, labels, T=2.0, alpha=0.5):
    soft = F.kl_div(F.log_softmax(student_logits / T, dim=-1),
                    F.softmax(teacher_logits / T, dim=-1), reduction="batchmean") * T * T
    hard = F.cross_entropy(student_logits, labels)
    return alpha * soft + (1 - alpha) * hard
```

Loading a model in 4-bit with Transformers and bitsandbytes (needs a supported GPU):

```python
from transformers import AutoModelForCausalLM, BitsAndBytesConfig
model = AutoModelForCausalLM.from_pretrained(
    "Qwen/Qwen2.5-0.5B",
    quantization_config=BitsAndBytesConfig(load_in_4bit=True),
)
print(model.get_memory_footprint())
```

## Expected output

The MoE script prints `torch.Size([10, 32])` and a count of how many token slots went to each of the four experts; uneven counts illustrate why load balancing matters. The quantized model's memory footprint is substantially smaller than the full-precision load of the same model.

## Common mistakes

- **Treating total parameter count of an MoE model as its compute cost**, or ignoring that all experts need memory.
- **Testing multimodal models only with text prompts.**
- **Reading chain-of-thought text as a faithful explanation** of how the model decided.
- **Assuming quantization or distillation is free**, without slice-level evaluation.
- **Ignoring licences** when distilling from another provider's model.
- **Over-claiming interpretability results** as full explanations.
- **Trusting hype** instead of primary sources and your own evaluation.

## Troubleshooting

- **4-bit load fails:** check GPU support and library versions in the quantization docs.
- **Reasoning model too slow or costly:** cap reasoning budget where the API allows, and route easy queries elsewhere.
- **MoE latency spikes:** look at batch composition and expert placement across devices.

## Exercise

Choose two techniques from this lesson that could help a system you know. For each, write the goal, the evaluation plan with slices, the new risks to test, and a go/no-go criterion. Run at least one small experiment, for example quantization or self-consistency, and report results with honest uncertainty.

## Key takeaways summary

Mixture of experts, multimodality, test-time reasoning, distillation, quantization and interpretability are shaping today's systems. Each brings real benefits and specific trade-offs. Learn them from primary sources, evaluate them on your own tasks and slices, and treat fast-moving claims with care.
