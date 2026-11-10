---
slug: neural-networks-and-deep-learning
title: Neural Networks and Deep Learning
summary: Understand how neural networks work, from neurons, weights, activation functions and layers to forward passes, loss, backpropagation and optimisers, plus regularisation and why depth helps.
level: intermediate
duration: 60
tags: [neural-networks, deep-learning, backpropagation, activation-functions, numpy]
objectives:
  - Describe a neuron, a layer and a multi-layer perceptron in terms of weights, biases and activations
  - Explain why non-linear activation functions are required
  - Walk through a forward pass, a loss calculation and backpropagation
  - Recognise overfitting and vanishing gradients and apply dropout, weight decay, normalisation and early stopping
prerequisites:
  - Math for machine learning (matrices, gradients, gradient descent)
  - Machine learning fundamentals (overfitting, splits)
related: [math-for-machine-learning, pytorch-essentials, transformers-and-attention, machine-learning-fundamentals]
references:
  - title: Google Machine Learning Crash Course — Neural networks
    url: https://developers.google.com/machine-learning/crash-course/neural-networks
  - title: Deep Learning (Goodfellow, Bengio, Courville) — free online book
    url: https://www.deeplearningbook.org/
  - title: scikit-learn — Neural network models (supervised)
    url: https://scikit-learn.org/stable/modules/neural_networks_supervised.html
  - title: PyTorch — Build the Neural Network
    url: https://pytorch.org/tutorials/beginner/basics/buildmodel_tutorial.html
videos:
  - id: aircAruvnKk
    title: "But what is a neural network? | Deep learning chapter 1"
    channel: "3Blue1Brown"
  - id: IN2XmBhILt4
    title: "Neural Networks Pt. 2: Backpropagation Main Ideas"
    channel: "StatQuest with Josh Starmer"
interview:
  - q: Why do neural networks need non-linear activation functions?
    a: A composition of linear layers is itself a single linear function, so without non-linearities a deep network is no more expressive than a linear model. Non-linear activations such as ReLU let stacked layers represent complex, non-linear decision boundaries and functions.
  - q: Explain backpropagation in plain terms.
    a: After a forward pass computes the loss, backpropagation applies the chain rule from the output back to the input, computing how much each weight contributed to the loss, that is the gradient of the loss with respect to every parameter. It reuses intermediate results so it costs roughly the same order as a forward pass. An optimiser then uses these gradients to update the weights.
  - q: What is the vanishing gradient problem and how is it mitigated?
    a: In deep networks, gradients are products of many per-layer derivatives. With saturating activations like sigmoid those derivatives are often small, so gradients shrink towards zero in early layers and they barely learn. Mitigations include ReLU-family activations, careful initialisation, normalisation layers, and residual connections that give gradients a direct path.
practice:
  - "Run the NumPy XOR network and change the hidden layer size to 1, 2 and 8. Record whether it learns XOR and explain why."
  - "Replace the sigmoid hidden activation with ReLU (and its derivative) and compare convergence."
  - "Train scikit-learn's MLPClassifier on the digits dataset with and without alpha (L2) regularisation and compare train vs test accuracy."
takeaways:
  - A neuron computes a weighted sum plus bias followed by a non-linear activation.
  - Layers are matrix multiplications; stacking them with non-linearities builds powerful functions.
  - Training repeats forward pass, loss, backpropagation and an optimiser step.
  - ReLU, good initialisation, normalisation and residual connections help deep networks train.
  - Dropout, weight decay, data augmentation and early stopping fight overfitting.
quiz:
  - id: aie-nn-q1
    type: single
    topic: neural-networks-and-deep-learning
    difficulty: intermediate
    prompt: What does ReLU(x) return?
    options: ["1 / (1 + e^-x)", "max(0, x)", "tanh(x)", "x squared"]
    answer: [1]
    explanation: ReLU (rectified linear unit) outputs x when x is positive and 0 otherwise.
  - id: aie-nn-q2
    type: truefalse
    topic: neural-networks-and-deep-learning
    difficulty: intermediate
    prompt: Stacking ten linear layers with no activation functions gives a model that can represent the XOR function.
    options: ["True", "False"]
    answer: [1]
    explanation: Ten linear layers collapse into one linear map, and XOR is not linearly separable, so non-linear activations are required.
  - id: aie-nn-q3
    type: single
    topic: neural-networks-and-deep-learning
    difficulty: intermediate
    prompt: A layer maps 784 inputs to 128 outputs with a bias. How many trainable parameters does it have?
    options: ["912", "100,352", "100,480", "128"]
    answer: [2]
    explanation: Weights 784 × 128 = 100,352 plus 128 biases gives 100,480.
  - id: aie-nn-q4
    type: scenario
    topic: neural-networks-and-deep-learning
    difficulty: intermediate
    prompt: Training loss keeps falling but validation loss started rising five epochs ago. What should you do?
    options: ["Train for many more epochs", "Use early stopping or add regularisation such as dropout or weight decay", "Increase the learning rate tenfold", "Remove the validation set"]
    answer: [1]
    explanation: Diverging training and validation loss indicates overfitting. Stop at the best validation checkpoint and regularise.
---

## Beginner-friendly explanation

A neural network is a big adjustable function made of many tiny, simple units called **neurons**. Each neuron looks at some numbers, decides how much it cares about each (its **weights**), adds them up, and passes the result through a simple rule (its **activation**) that decides how strongly to "fire".

One neuron is weak. Arrange thousands in **layers**, each feeding the next, and the network can learn to recognise faces, translate languages or predict the next word. **Deep learning** just means using networks with many layers. Training is the same downhill walk you saw with gradient descent, but with millions of weights instead of two.

## Technical explanation

### A neuron and a layer

```text
x1 --w1--\
x2 --w2---> Σ (w·x + b) --> activation --> output
x3 --w3--/
```

A **dense (fully connected) layer** with `n_in` inputs and `n_out` outputs computes `h = activation(x @ W + b)`, where `W` has shape `(n_in, n_out)`. A **multi-layer perceptron (MLP)** stacks these:

```text
input (4) -> hidden (16, ReLU) -> hidden (16, ReLU) -> output (3, softmax)
```

### Activation functions

| Activation | Formula | Typical use |
|---|---|---|
| ReLU | max(0, x) | Default for hidden layers |
| Sigmoid | 1 / (1 + e^−x) | Binary output probability |
| Tanh | (e^x − e^−x)/(e^x + e^−x) | Older hidden layers, RNNs |
| Softmax | e^zi / Σ e^zj | Multiclass output probabilities |
| GELU | x · Φ(x) | Common in transformers |

Without non-linear activations, stacked layers collapse into one linear function.

### Training loop

1. **Forward pass:** compute predictions layer by layer.
2. **Loss:** MSE for regression; **cross-entropy** for classification (`−log(probability of the true class)`).
3. **Backward pass (backpropagation):** apply the chain rule from the loss back through each layer to get gradients for every weight.
4. **Optimiser step:** update weights. Plain **SGD** uses `w -= lr * grad`; **Adam** adapts step sizes per parameter using running averages of gradients and is a common default.

Data is processed in **mini-batches**; one pass over the full training set is an **epoch**.

### Why depth and what can go wrong

Deeper networks can build features hierarchically (edges → shapes → objects), but are harder to train:

| Problem | Symptom | Remedies |
|---|---|---|
| Vanishing gradients | Early layers barely change | ReLU, He/Xavier initialisation, normalisation, residual connections |
| Exploding gradients | Loss becomes NaN | Lower learning rate, gradient clipping |
| Overfitting | Validation loss rises | Dropout, weight decay, data augmentation, early stopping, more data |
| Dead ReLUs | Many units always output 0 | Lower learning rate, Leaky ReLU |

**Normalisation layers** (batch norm, layer norm) stabilise activations. **Residual connections** (`output = x + f(x)`) let gradients flow through very deep networks and are used in ResNets and transformers.

### Architectures at a glance

| Architecture | Built for | Key idea |
|---|---|---|
| MLP | Tabular, simple inputs | Dense layers |
| CNN | Images | Convolutions share weights across positions |
| RNN / LSTM | Sequences (historic) | Hidden state passed step by step |
| Transformer | Text, images, audio, more | Attention over all positions in parallel |

## Real-world example

A team classifies screenshots of a web app as "rendered correctly" or "broken layout" for visual regression testing. A simple MLP on raw pixels overfitted quickly: near-perfect on training screenshots, poor on new pages. Switching to a pretrained convolutional network (transfer learning), adding data augmentation (small crops and colour changes), and using early stopping on a validation set gave a much smaller train/validation gap. The team still kept a human review step for borderline scores.

## Step-by-step walkthrough

A two-layer network that learns XOR, written in NumPy so you can see every step:

```python
import numpy as np

rng = np.random.default_rng(0)
X = np.array([[0, 0], [0, 1], [1, 0], [1, 1]], dtype=float)
y = np.array([[0], [1], [1], [0]], dtype=float)          # XOR

def sigmoid(z):
    return 1 / (1 + np.exp(-z))

# Parameters: 2 inputs -> 4 hidden -> 1 output
W1 = rng.normal(0, 1, (2, 4)); b1 = np.zeros((1, 4))
W2 = rng.normal(0, 1, (4, 1)); b2 = np.zeros((1, 1))
lr = 1.0

for epoch in range(5000):
    # Forward pass
    h = sigmoid(X @ W1 + b1)          # (4, 4)
    out = sigmoid(h @ W2 + b2)        # (4, 1)
    loss = np.mean((out - y) ** 2)

    # Backward pass (chain rule)
    d_out = 2 * (out - y) / len(X) * out * (1 - out)
    dW2 = h.T @ d_out
    db2 = d_out.sum(axis=0, keepdims=True)
    d_h = d_out @ W2.T * h * (1 - h)
    dW1 = X.T @ d_h
    db1 = d_h.sum(axis=0, keepdims=True)

    # Gradient descent step
    W2 -= lr * dW2; b2 -= lr * db2
    W1 -= lr * dW1; b1 -= lr * db1

    if epoch % 1000 == 0:
        print(f"epoch {epoch}  loss {loss:.4f}")

print(out.round(3).ravel())
```

1. Initialise small random weights (zeros would make all hidden units identical).
2. Forward pass through hidden and output layers.
3. Compute loss.
4. Backpropagate: each gradient line is one chain-rule step.
5. Update and repeat.

## Expected output

The loss falls from about 0.25 towards a small value, and the final outputs approach `[0, 1, 1, 0]`, for example values near 0.02 and 0.98. With an unlucky initialisation it can get stuck; change the seed or hidden size. A single linear layer can never solve XOR, which is the classic demonstration of why hidden layers and non-linearities matter.

## Common mistakes

- **No non-linearity** between layers.
- **Initialising all weights to zero,** so every unit learns the same thing.
- **Applying softmax before a loss that expects raw logits** (for example PyTorch's `CrossEntropyLoss`), which double-applies it.
- **Unscaled inputs,** making training slow or unstable.
- **Judging by training loss only** instead of validation loss.
- **Too large a learning rate,** producing NaN losses.

## Troubleshooting

- **Loss stuck at a constant:** check gradient signs, learning rate, and that labels match the output activation.
- **Loss NaN:** lower the learning rate, check for `log(0)`, clip gradients.
- **Verify gradients:** compare a backprop gradient with a numerical finite-difference estimate on a tiny network.

## Hands-on exercise

Use `sklearn.neural_network.MLPClassifier` on `load_digits`. Train with `hidden_layer_sizes=(64,)` and with `(256, 256)`, each with `alpha` values `1e-5` and `1e-2`. Report train and test accuracy for all four, identify which overfits most, and explain the effect of `alpha` (L2 weight decay).

## Key takeaways summary

Neural networks stack layers of weighted sums and non-linear activations. Training repeats forward pass, loss, backpropagation and an optimiser update. Depth gives power but needs good activations, initialisation, normalisation and residual connections to train, and regularisation plus validation monitoring to generalise.
