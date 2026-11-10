---
slug: fine-tuning-and-adaptation
title: Fine-tuning and Adaptation
summary: Learn when to adapt a pre-trained model instead of prompting or retrieving, how full fine-tuning differs from parameter-efficient methods such as LoRA, and how to train, evaluate and ship an adapter safely.
level: advanced
duration: 70
tags: [fine-tuning, lora, peft, transfer-learning, llm]
objectives:
  - Decide between prompting, retrieval-augmented generation and fine-tuning for a given problem
  - Explain full fine-tuning, LoRA, QLoRA and other parameter-efficient methods and their trade-offs
  - Prepare a clean, split, deduplicated instruction dataset and avoid train/test leakage
  - Train a LoRA adapter with Hugging Face PEFT and evaluate it against the base model
  - Recognise catastrophic forgetting, overfitting and safety regressions after fine-tuning
prerequisites:
  - PyTorch basics (tensors, training loop, optimiser)
  - How transformers and tokenisers work
  - Model evaluation metrics and held-out test sets
related: [pytorch-essentials, transformers-and-attention, llm-fundamentals-and-tokens, building-rag-pipelines, llm-evaluation-and-evals, mlops-and-model-deployment, advanced-topics-in-modern-ai]
references:
  - title: Hugging Face — PEFT documentation
    url: https://huggingface.co/docs/peft/index
  - title: Hu et al. — LoRA, Low-Rank Adaptation of Large Language Models (arXiv 2106.09685)
    url: https://arxiv.org/abs/2106.09685
  - title: Dettmers et al. — QLoRA, Efficient Finetuning of Quantized LLMs (arXiv 2305.14314)
    url: https://arxiv.org/abs/2305.14314
  - title: Hugging Face — Transformers Trainer documentation
    url: https://huggingface.co/docs/transformers/main_classes/trainer
videos:
  - id: DhRoTONcyZE
    title: "What is Low-Rank Adaptation (LoRA) | explained by the inventor"
    channel: "Edward Hu"
  - id: t1caDsMzWBk
    title: "LoRA & QLoRA Fine-tuning Explained In-Depth"
    channel: "Mark Hennings"
  - id: PXWYUTMt-AU
    title: "LoRA: Low-Rank Adaptation of Large Language Models - Explained visually + PyTorch code from scratch"
    channel: "Umar Jamil"
interview:
  - q: When would you fine-tune a model rather than improve the prompt or add retrieval?
    a: I try prompting first because it is cheapest and fastest to iterate, then retrieval when the problem is missing or changing knowledge. Fine-tuning makes sense when I need a consistent behaviour, format, tone or narrow skill that prompting cannot reliably produce, when I want a smaller cheaper model to match a larger one on a narrow task, or when long prompts make latency and cost too high. Fine-tuning is a poor way to inject frequently changing facts because they go stale and the model can still hallucinate them. I also need enough high-quality labelled examples and a held-out evaluation set before it is worth doing.
  - q: Explain LoRA in your own words.
    a: LoRA freezes the pre-trained weights and learns a low-rank update for selected weight matrices, typically attention projections. Instead of updating a d by k matrix W, it learns two small matrices B (d by r) and A (r by k) with a small rank r, and the effective weight becomes W plus a scaled BA. Only A and B are trained, so the number of trainable parameters and optimiser state is a tiny fraction of the full model, adapters are small files, and several adapters can share one base model. The update can also be merged into W for inference so there is no extra latency.
  - q: How do you check that fine-tuning did not break the model?
    a: I compare the fine-tuned model with the base model on the same held-out task set using the same decoding settings, and I also run a general regression suite covering capabilities and safety behaviour the base model had, because fine-tuning can cause forgetting or weaken refusal behaviour. I check for leakage between training and test data, look at failure examples rather than one score, and repeat runs with different seeds where variance matters.
practice:
  - "Take a small open model and a public instruction dataset. Train a LoRA adapter with ranks 4, 8 and 16 and plot validation loss and a task metric for each. Record trainable parameter counts."
  - "Build a deduplicated train, validation and test split for a classification-by-generation task and write a script that proves no test prompt appears in the training data."
  - "Write a regression suite of 30 general and safety prompts and compare base versus fine-tuned outputs side by side."
takeaways:
  - Prompting and retrieval come first; fine-tune for behaviour, format or efficiency, not for fast-changing facts.
  - LoRA trains small low-rank updates to frozen weights, cutting memory and storage while often approaching full fine-tuning quality.
  - QLoRA combines a quantised frozen base model with LoRA adapters to fit training on smaller GPUs.
  - Data quality, deduplication and a leakage-free test split matter more than hyperparameters.
  - Always evaluate against the base model and run general and safety regression checks.
quiz:
  - id: ft-adapt-q1
    type: single
    topic: fine-tuning-and-adaptation
    difficulty: advanced
    prompt: In LoRA, which parameters are updated during training?
    options: ["All weights of the base model", "Only the embedding layer", "Small low-rank matrices added to selected weight matrices, while the base weights stay frozen", "Only the final output layer"]
    answer: [2]
    explanation: LoRA freezes the pre-trained weights and trains low-rank matrices A and B whose product is added to selected layers, usually attention projections.
  - id: ft-adapt-q2
    type: scenario
    topic: fine-tuning-and-adaptation
    difficulty: intermediate
    prompt: A support bot must answer using product prices that change weekly. What is the best first approach?
    options: ["Fine-tune every week on the new prices", "Retrieve current prices at query time and pass them in the prompt", "Increase the LoRA rank", "Train from scratch"]
    answer: [1]
    explanation: Frequently changing facts are better served by retrieval. Fine-tuned knowledge goes stale and is hard to update or audit.
  - id: ft-adapt-q3
    type: multiple
    topic: fine-tuning-and-adaptation
    difficulty: advanced
    prompt: Which are real risks after fine-tuning? Select all that apply.
    options: ["Catastrophic forgetting of general abilities", "Weakened safety or refusal behaviour", "Inflated scores from test examples leaking into training data", "The tokenizer vocabulary automatically doubling"]
    answer: [0, 1, 2]
    explanation: Forgetting, safety regressions and leakage are well-known risks. Fine-tuning does not change the tokenizer vocabulary unless you deliberately add tokens.
  - id: ft-adapt-q4
    type: truefalse
    topic: fine-tuning-and-adaptation
    difficulty: advanced
    prompt: A LoRA update can be merged into the base weights so inference has no extra adapter latency.
    options: ["True", "False"]
    answer: [0]
    explanation: Because the update is just a matrix added to W, it can be merged after training. The LoRA paper highlights this as an advantage over adapter layers that add depth.
---

## Beginner-friendly explanation

A pre-trained language model is like a well-read new employee. It knows a lot about language and the world, but not your company's style, forms or jargon. You have three ways to help it:

1. **Give better instructions** (prompting). Cheap and instant.
2. **Hand it the right documents when it needs them** (retrieval, or RAG). Good for facts that change.
3. **Train it on examples** until the behaviour becomes a habit (fine-tuning). Slower and costlier up front, but the behaviour no longer needs to be spelled out every time.

Fine-tuning means continuing training of an existing model on your own examples. *Adaptation* is the broader idea of making a general model fit a specific task, domain or style. Modern practice rarely retrains every weight; instead it uses **parameter-efficient fine-tuning (PEFT)**, where most of the model stays frozen and only a small add-on is trained.

## Technical explanation

### Choosing the approach

| Need | Usually best |
|---|---|
| Better instructions, examples, output format | Prompting, few-shot examples, structured output |
| Up-to-date or private facts, citations | Retrieval-augmented generation |
| Consistent style, format or narrow skill at scale | Fine-tuning |
| Cheaper or faster model matching a bigger one on one task | Fine-tuning or distillation |
| New language or very different domain | Continued pre-training, then fine-tuning |

These combine: a fine-tuned model can still use retrieval.

### Full fine-tuning

All weights are updated. It is the most flexible option but needs memory for weights, gradients and optimiser state (Adam keeps two extra values per parameter), produces a full copy of the model per task, and has the highest risk of **catastrophic forgetting**, where new training overwrites general abilities.

### LoRA

LoRA (Hu et al., 2021) freezes a weight matrix `W` (shape d x k) and learns an update `ΔW = B A`, where `B` is d x r and `A` is r x k with a small rank r (often 4 to 64). The forward pass becomes `h = W x + (alpha / r) · B A x`. `B` starts at zero so training begins from the original model. Key hyperparameters:

- **r (rank):** capacity of the update. Higher is not always better.
- **lora_alpha:** scaling factor for the update.
- **target_modules:** which layers get adapters, commonly the attention query and value projections, sometimes all linear layers.
- **lora_dropout:** regularisation on the adapter input.

Benefits: far fewer trainable parameters, small adapter files, many adapters per base model, and the option to merge `ΔW` into `W` for inference.

### QLoRA and other PEFT methods

**QLoRA** (Dettmers et al., 2023) keeps the frozen base model in 4-bit precision and trains LoRA adapters in higher precision, cutting memory enough to fine-tune larger models on a single GPU. Other PEFT families include prompt tuning and prefix tuning (learned soft prompt vectors) and adapter layers (small bottleneck modules inserted between layers). The PEFT library implements several of them behind a common API.

### Instruction tuning and preference tuning

**Supervised fine-tuning (SFT)** trains on prompt and ideal-response pairs. **Preference tuning** (for example RLHF or direct preference optimisation) then trains on pairs of better and worse responses. Most application teams only need SFT on a narrow task.

### Data matters most

- Write examples in exactly the format you will use at inference, including the chat template.
- Deduplicate, then split into train, validation and test **before** any augmentation.
- Check for near-duplicates across splits, not just exact matches.
- Keep a set of general and safety prompts that are never trained on.
- A few hundred to a few thousand clean examples often beat a large noisy set for narrow tasks, but measure this rather than assume it.

## Real-world example

An insurance team wanted claim notes converted to a fixed JSON schema with their internal category codes. A large hosted model with a long prompt worked but was slow and costly at volume. They collected 3,000 reviewed note-to-JSON pairs, held out 400 for testing, and trained a LoRA adapter on a smaller open model. On the test set the adapter matched the large model's field-level accuracy closely, returned valid JSON far more consistently than the base small model, and served from their own hardware. A regression suite revealed one problem: the adapter now tried to output JSON even for unrelated chat questions, so the router only sends claim notes to it. The numbers here describe their process, not a general benchmark.

## Step-by-step walkthrough

1. **Define the task and metric** (exact match on fields, a rubric score, pass rate on tests).
2. **Baseline** the base model and a well-prompted model on the test set. If prompting is good enough, stop.
3. **Build the dataset:** clean, deduplicate, split, apply the chat template.
4. **Configure LoRA:** start with r=8 or 16, alpha twice r, attention projections or all linear layers.
5. **Train** with a modest learning rate (often around 1e-4 to 2e-4 for LoRA) and watch validation loss.
6. **Evaluate** on the test set with fixed decoding settings, then run general and safety regressions.
7. **Version** the adapter, dataset hash, base model revision and config together.
8. **Deploy** either as a separate adapter or merged into the base weights.

## Code examples

A minimal LoRA run with Hugging Face Transformers, Datasets and PEFT. Replace the model name with a small causal model you are licensed to use.

```python
# pip install transformers datasets peft accelerate
from datasets import load_dataset
from peft import LoraConfig, get_peft_model, TaskType
from transformers import (AutoModelForCausalLM, AutoTokenizer, DataCollatorForLanguageModeling,
                          Trainer, TrainingArguments, set_seed)

set_seed(42)
base = "Qwen/Qwen2.5-0.5B"  # any small causal LM you may use
tok = AutoTokenizer.from_pretrained(base)
tok.pad_token = tok.pad_token or tok.eos_token
model = AutoModelForCausalLM.from_pretrained(base)

config = LoraConfig(
    task_type=TaskType.CAUSAL_LM,
    r=8,
    lora_alpha=16,
    lora_dropout=0.05,
    target_modules=["q_proj", "v_proj"],
)
model = get_peft_model(model, config)
model.print_trainable_parameters()

ds = load_dataset("json", data_files={"train": "train.jsonl", "validation": "val.jsonl"})

def to_text(ex):
    msgs = [{"role": "user", "content": ex["prompt"]}, {"role": "assistant", "content": ex["response"]}]
    return tok(tok.apply_chat_template(msgs, tokenize=False), truncation=True, max_length=512)

ds = ds.map(to_text, remove_columns=ds["train"].column_names)

args = TrainingArguments(
    output_dir="out/lora-claims",
    per_device_train_batch_size=8,
    learning_rate=2e-4,
    num_train_epochs=2,
    eval_strategy="epoch",
    save_strategy="epoch",
    logging_steps=20,
    seed=42,
)
trainer = Trainer(
    model=model,
    args=args,
    train_dataset=ds["train"],
    eval_dataset=ds["validation"],
    data_collator=DataCollatorForLanguageModeling(tok, mlm=False),
)
trainer.train()
model.save_pretrained("out/lora-claims/adapter")  # small adapter files only
```

Loading and optionally merging the adapter for serving:

```python
from peft import PeftModel
from transformers import AutoModelForCausalLM

base_model = AutoModelForCausalLM.from_pretrained("Qwen/Qwen2.5-0.5B")
model = PeftModel.from_pretrained(base_model, "out/lora-claims/adapter")
merged = model.merge_and_unload()  # plain model with LoRA folded into W
merged.save_pretrained("out/lora-claims/merged")
```

A leakage check before training:

```python
import json, hashlib

def norm(s): return " ".join(s.lower().split())
def key(s): return hashlib.sha256(norm(s).encode()).hexdigest()

train = {key(json.loads(l)["prompt"]) for l in open("train.jsonl")}
leaks = [l for l in open("test.jsonl") if key(json.loads(l)["prompt"]) in train]
assert not leaks, f"{len(leaks)} test prompts also appear in training"
```

## Expected output

`print_trainable_parameters()` prints the trainable count, the total count and a percentage. For LoRA on a few attention projections this is typically well under one percent of the model. Validation loss should fall over the first epoch; if it rises while training loss keeps falling, you are overfitting. The saved adapter directory holds a config file and adapter weights that are a small fraction of the full model's size.

## Common mistakes

- **Fine-tuning to teach facts** that change, instead of using retrieval.
- **Skipping the baseline**, so nobody knows whether fine-tuning helped compared with a good prompt.
- **Leaking test data** into training through duplicates, paraphrases or augmentation done before splitting.
- **Training format differs from inference format**, for example a different chat template or system prompt.
- **Judging by training loss only** instead of a task metric on held-out data.
- **No regression suite**, so forgetting and safety regressions reach users.
- **Not recording the base model revision**, so an adapter is later loaded on the wrong base.
- **Ignoring licences** of the base model and the training data.

## Troubleshooting

- **Out of memory:** lower batch size and use gradient accumulation, enable gradient checkpointing, shorten sequences, or use QLoRA.
- **Model output unchanged:** check that `target_modules` names match the architecture and that the adapter is actually loaded.
- **Repetitive or truncated output:** confirm the EOS token is in the training targets and padding is set correctly.
- **Great validation loss, poor task metric:** the metric and the loss measure different things; inspect generated outputs.

## Exercise

Fine-tune a small model with LoRA to turn plain-English bug descriptions into a fixed JSON bug report. Build 300 examples, split 80/10/10 with a leakage check, compare base, prompted and LoRA models on JSON validity and field accuracy, and write a one-page note recommending whether to ship it.

## Key takeaways summary

Fine-tuning is a tool for behaviour and efficiency, not for live knowledge. LoRA and QLoRA make it affordable by training small low-rank updates on a frozen model. The real work is in the data, the baseline and the evaluation: compare against the base and a strong prompt, prevent leakage, and check that general and safety behaviour survived.
