---
slug: pytorch-essentials
title: PyTorch Essentials
summary: Build and train neural networks in PyTorch with tensors, autograd, nn.Module, Dataset and DataLoader, a correct training and evaluation loop, GPU devices, saving and loading checkpoints and reproducibility.
level: intermediate
duration: 75
tags: [pytorch, deep-learning, tensors, autograd, training-loop]
objectives:
  - Create and manipulate tensors and move them between CPU and GPU
  - Use autograd to compute gradients automatically
  - Define models with nn.Module and load data with Dataset and DataLoader
  - Write a correct training and evaluation loop, then save, load and reproduce results
prerequisites:
  - Python for AI (NumPy)
  - Neural networks and deep learning (layers, loss, backpropagation)
related: [neural-networks-and-deep-learning, transformers-and-attention, python-for-ai, fine-tuning-and-adaptation, mlops-and-model-deployment]
references:
  - title: PyTorch — Learn the Basics
    url: https://pytorch.org/tutorials/beginner/basics/intro.html
  - title: PyTorch — Automatic differentiation with torch.autograd
    url: https://pytorch.org/tutorials/beginner/basics/autogradqs_tutorial.html
  - title: PyTorch — Saving and loading models
    url: https://pytorch.org/tutorials/beginner/saving_loading_models.html
  - title: PyTorch — Reproducibility
    url: https://pytorch.org/docs/stable/notes/randomness.html
  - title: PyTorch — Get Started (installation)
    url: https://pytorch.org/get-started/locally/
videos:
  - id: fJ40w_2h8kk
    title: "What is PyTorch? (Machine/Deep Learning)"
    channel: "IBM Technology"
  - id: V_xro1bcAuA
    title: "PyTorch for Deep Learning & Machine Learning – Full Course"
    channel: "freeCodeCamp.org"
  - id: ORMx45xqWkA
    title: "PyTorch in 100 Seconds"
    channel: "Fireship"
interview:
  - q: Why do we call optimizer.zero_grad() in each training step?
    a: PyTorch accumulates gradients into each parameter's .grad attribute on every backward call. Without zeroing, gradients from previous batches are added to the current ones, giving incorrect updates. Zeroing once per step, before or after the update, keeps each step's gradient correct. Accumulation is sometimes used deliberately to simulate bigger batches.
  - q: What do model.eval() and torch.no_grad() do, and why use both?
    a: model.eval() switches layers like dropout and batch normalisation to inference behaviour, so dropout is disabled and batch norm uses running statistics. torch.no_grad() stops autograd from recording operations, saving memory and time. They solve different problems, so evaluation code normally uses both, and you call model.train() again before training.
  - q: How would you make a PyTorch experiment reproducible?
    a: Set seeds for Python, NumPy and torch, seed DataLoader workers and generators, record library versions and hardware, and where needed enable deterministic algorithms with torch.use_deterministic_algorithms(True), accepting some speed cost. Even then, results across different hardware or library versions may not be bitwise identical, so I report variation over several seeds.
practice:
  - "Run the training script on CPU and, if available, on GPU, and compare time per epoch."
  - "Add a validation split with torch.utils.data.random_split and implement early stopping that saves the best checkpoint."
  - "Deliberately remove optimizer.zero_grad() and describe how the loss curve changes."
takeaways:
  - Tensors are NumPy-like arrays with GPU support and gradient tracking.
  - Autograd builds a graph during the forward pass and computes gradients with backward().
  - Subclass nn.Module, define layers in __init__ and computation in forward.
  - The training loop is forward, loss, zero_grad, backward, step; evaluation uses eval() and no_grad().
  - Save state_dicts, set seeds and keep model and data on the same device.
quiz:
  - id: aie-pytorch-q1
    type: single
    topic: pytorch-essentials
    difficulty: intermediate
    prompt: What is the correct order inside a basic PyTorch training step?
    options: ["backward, forward, step, zero_grad", "forward, loss, zero_grad, backward, step", "step, forward, backward, loss", "zero_grad, step, forward, backward"]
    answer: [1]
    explanation: Compute predictions and loss, clear old gradients, backpropagate, then update parameters. zero_grad can also go first in the step, but it must come before backward.
  - id: aie-pytorch-q2
    type: debugging
    topic: pytorch-essentials
    difficulty: intermediate
    prompt: "Training fails with: Expected all tensors to be on the same device, but found at least two devices, cuda:0 and cpu. What is the fix?"
    options: ["Reinstall PyTorch", "Move both the model and each batch to the same device with .to(device)", "Call model.eval()", "Use a smaller batch size"]
    answer: [1]
    explanation: The model was moved to the GPU but the input batch was not (or vice versa). Move both to the same device.
  - id: aie-pytorch-q3
    type: code-output
    topic: pytorch-essentials
    difficulty: intermediate
    prompt: What does this print?
    code: |
      import torch
      x = torch.tensor(3.0, requires_grad=True)
      y = x ** 2 + 2 * x
      y.backward()
      print(x.grad)
    codeLanguage: python
    options: ["tensor(15.)", "tensor(8.)", "tensor(6.)", "None"]
    answer: [1]
    explanation: dy/dx = 2x + 2, which is 8 at x = 3.
  - id: aie-pytorch-q4
    type: truefalse
    topic: pytorch-essentials
    difficulty: intermediate
    prompt: nn.CrossEntropyLoss expects raw logits, so you should not apply softmax to the model output before passing it in.
    options: ["True", "False"]
    answer: [0]
    explanation: CrossEntropyLoss combines log-softmax and negative log-likelihood internally, so it takes unnormalised logits and integer class labels.
---

## Beginner-friendly explanation

If NumPy is a calculator for grids of numbers, **PyTorch** is that calculator plus two superpowers: it can run on a **GPU** (very fast for the huge matrix maths in deep learning), and it can **work out gradients for you automatically**. Remember writing out every chain-rule line by hand in the NumPy XOR network? PyTorch does that bookkeeping with one call: `loss.backward()`.

PyTorch also gives you building blocks (layers, loss functions, optimisers, data loaders) so a training script follows the same clear recipe every time.

## Technical explanation

Install by following the selector at pytorch.org/get-started (it gives the right command for your OS and GPU). On CPU-only machines `pip install torch` is usually enough.

### Tensors

```python
import torch

t = torch.tensor([[1.0, 2.0], [3.0, 4.0]])
print(t.shape, t.dtype)            # torch.Size([2, 2]) torch.float32
print(t @ t, t.mean(), t.T)        # same ideas as NumPy
z = torch.zeros(3, 4); r = torch.randn(3, 4)
n = t.numpy(); back = torch.from_numpy(n)

device = "cuda" if torch.cuda.is_available() else "cpu"
t = t.to(device)
```

Note: PyTorch defaults to `float32`, while NumPy defaults to `float64`.

### Autograd

```python
w = torch.tensor(2.0, requires_grad=True)
loss = (w * 3 - 12) ** 2           # forward: records operations
loss.backward()                    # backward: computes d(loss)/dw
print(w.grad)                      # 2*(3w-12)*3 = -36 at w=2
```

### Building blocks

| Piece | Role | Example |
|---|---|---|
| `nn.Module` | Container for layers and parameters | `class Net(nn.Module)` |
| `nn.Linear`, `nn.ReLU`, `nn.Dropout` | Layers | `nn.Linear(784, 128)` |
| Loss | Measures error | `nn.CrossEntropyLoss()`, `nn.MSELoss()` |
| Optimiser | Updates parameters | `torch.optim.Adam(model.parameters(), lr=1e-3)` |
| `Dataset` | Returns one `(x, y)` by index | `TensorDataset`, torchvision datasets |
| `DataLoader` | Batches, shuffles, loads in parallel | `DataLoader(ds, batch_size=64, shuffle=True)` |

### The training recipe

```text
for each epoch:
    model.train()
    for X, y in train_loader:
        pred = model(X)            # forward
        loss = loss_fn(pred, y)
        optimizer.zero_grad()      # clear old gradients
        loss.backward()            # compute new gradients
        optimizer.step()           # update weights
    model.eval()
    with torch.no_grad():
        evaluate on validation data
```

### Saving and loading

Save the `state_dict` (parameter tensors), not the whole pickled object:

```python
import torch
from torch import nn

class Net(nn.Module):
    def __init__(self):
        super().__init__()
        self.layers = nn.Sequential(nn.Linear(64, 32), nn.ReLU(), nn.Linear(32, 10))

    def forward(self, x):
        return self.layers(x)

model = Net()  # in practice: the model you just trained
torch.save(model.state_dict(), "model.pt")

restored = Net()  # rebuild the same architecture, then load the weights into it
restored.load_state_dict(torch.load("model.pt", weights_only=True))
restored.eval()  # switch off dropout/batch-norm training behaviour before inference
```

Only load checkpoint files from sources you trust; `weights_only=True` restricts unpickling to tensors and basic types.

## Real-world example

An AI test engineer is asked to verify a colleague's claim that a new model improved accuracy by two points. They re-run the training script with five different seeds for both old and new models, using `model.eval()` and `torch.no_grad()` in evaluation. Two problems surface: the original evaluation forgot `model.eval()`, so dropout was active and scores were noisy, and the "improvement" fell within the seed-to-seed variation. Fixing evaluation and reporting mean and spread across seeds gave the team an honest picture.

## Step-by-step walkthrough

A complete, runnable script that trains an MLP on scikit-learn's digits dataset (no download needed):

```python
import torch
from torch import nn
from torch.utils.data import TensorDataset, DataLoader
from sklearn.datasets import load_digits
from sklearn.model_selection import train_test_split

torch.manual_seed(0)
device = "cuda" if torch.cuda.is_available() else "cpu"

# 1. Data: 8x8 images flattened to 64 features, 10 classes
X, y = load_digits(return_X_y=True)
X = X / 16.0                                    # scale pixel values to 0..1
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2, stratify=y, random_state=0)
train_ds = TensorDataset(torch.tensor(X_tr, dtype=torch.float32), torch.tensor(y_tr))
test_ds = TensorDataset(torch.tensor(X_te, dtype=torch.float32), torch.tensor(y_te))
train_loader = DataLoader(train_ds, batch_size=64, shuffle=True)
test_loader = DataLoader(test_ds, batch_size=256)

# 2. Model
class Net(nn.Module):
    def __init__(self):
        super().__init__()
        self.layers = nn.Sequential(
            nn.Linear(64, 128), nn.ReLU(), nn.Dropout(0.2),
            nn.Linear(128, 10),          # raw logits, no softmax
        )

    def forward(self, x):
        return self.layers(x)

model = Net().to(device)
loss_fn = nn.CrossEntropyLoss()
optimizer = torch.optim.Adam(model.parameters(), lr=1e-3)

def evaluate(loader):
    model.eval()
    correct = total = 0
    with torch.no_grad():
        for xb, yb in loader:
            xb, yb = xb.to(device), yb.to(device)
            pred = model(xb).argmax(dim=1)
            correct += (pred == yb).sum().item()
            total += yb.size(0)
    return correct / total

# 3. Train
for epoch in range(20):
    model.train()
    running = 0.0
    for xb, yb in train_loader:
        xb, yb = xb.to(device), yb.to(device)
        loss = loss_fn(model(xb), yb)
        optimizer.zero_grad()
        loss.backward()
        optimizer.step()
        running += loss.item() * xb.size(0)
    if epoch % 5 == 4:
        print(f"epoch {epoch + 1:2d}  loss {running / len(train_ds):.4f}  test acc {evaluate(test_loader):.3f}")

# 4. Save
torch.save(model.state_dict(), "digits_mlp.pt")
```

## Expected output

The average training loss drops steadily over the epochs, and test accuracy climbs to a high value on this simple dataset (typically well above 0.9). Exact numbers depend on PyTorch version and hardware. A file `digits_mlp.pt` is written.

## Common mistakes

- **Forgetting `optimizer.zero_grad()`,** so gradients accumulate across batches.
- **Not calling `model.eval()`** during evaluation, leaving dropout and batch norm in training mode.
- **Evaluating without `torch.no_grad()`,** wasting memory.
- **Device mismatches** between model and data.
- **Applying softmax before `CrossEntropyLoss`.**
- **Wrong label dtype:** `CrossEntropyLoss` expects integer class indices (`torch.long`), not one-hot floats in the basic case.
- **Using `loss` (a tensor) for logging** instead of `loss.item()`, which keeps the graph alive and leaks memory.
- **Loading untrusted checkpoints** without `weights_only=True`.

## Troubleshooting

- **CUDA out of memory:** reduce batch size, use mixed precision, free unused tensors.
- **Shape errors in `nn.Linear`:** print `x.shape` before each layer; the last dimension must equal `in_features`.
- **Loss does not decrease:** check learning rate, that `optimizer` was built with `model.parameters()`, and that labels align with inputs.

## Hands-on exercise

Extend the script: split 10% of the training set for validation with `random_split`, track validation accuracy each epoch, save the checkpoint with the best validation accuracy, stop if it has not improved for 3 epochs, then reload the best checkpoint and report test accuracy once. Run with three seeds and report mean and standard deviation.

## Key takeaways summary

PyTorch gives you GPU tensors, automatic gradients and composable building blocks. Every project follows the same recipe: Dataset and DataLoader for data, an `nn.Module` for the model, a loss and optimiser, a loop of forward, zero_grad, backward and step, and an evaluation phase with `eval()` and `no_grad()`. Save state_dicts and control randomness so results can be trusted.
