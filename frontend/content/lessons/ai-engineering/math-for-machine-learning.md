---
slug: math-for-machine-learning
title: Math for Machine Learning
summary: The practical maths behind machine learning, including vectors, matrices, dot products, derivatives and gradients, gradient descent, probability and basic statistics, each shown with NumPy code.
level: beginner
duration: 60
tags: [math, linear-algebra, calculus, probability, statistics]
objectives:
  - Represent data as vectors and matrices and compute dot products and matrix multiplication
  - Explain derivatives and gradients as "which way is downhill" for a loss function
  - Implement gradient descent from scratch to fit a straight line
  - Use mean, variance, standard deviation and basic probability to describe data and predictions
prerequisites:
  - School algebra (equations, functions, graphs)
  - Python for AI (NumPy basics)
related: [python-for-ai, machine-learning-fundamentals, neural-networks-and-deep-learning, model-evaluation-metrics]
references:
  - title: Google Machine Learning Crash Course — Linear regression and gradient descent
    url: https://developers.google.com/machine-learning/crash-course/linear-regression
  - title: NumPy — Linear algebra (numpy.linalg)
    url: https://numpy.org/doc/stable/reference/routines.linalg.html
  - title: Mathematics for Machine Learning (Deisenroth, Faisal, Ong) — free book
    url: https://mml-book.github.io/
  - title: Python Documentation — statistics module
    url: https://docs.python.org/3/library/statistics.html
interview:
  - q: What is a gradient and why does training use it?
    a: The gradient of a function with respect to its parameters is the vector of partial derivatives; it points in the direction of steepest increase. Training defines a loss that measures error, computes the gradient of the loss with respect to the model parameters, and moves the parameters a small step in the opposite direction. Repeating this, gradient descent, reduces the loss.
  - q: What happens if the learning rate is too large or too small?
    a: Too large and each step overshoots the minimum, so the loss oscillates or diverges to infinity or NaN. Too small and training is very slow and may stall before reaching a good solution within the step budget. In practice you try values on a log scale and watch the loss curve.
  - q: Why are matrix operations central to machine learning?
    a: A dataset is a matrix of examples by features, and a linear layer computes inputs times a weight matrix plus a bias. Expressing work as matrix multiplications lets whole batches be processed at once, and this maps efficiently to optimised CPU and GPU libraries.
practice:
  - "By hand, multiply a 2 x 3 matrix by a 3 x 1 vector, then check your answer with the @ operator in NumPy."
  - "Change the learning rate in the gradient descent example to 0.5 and 0.0001 and describe what happens to the loss."
  - "Simulate 10,000 rolls of a fair die with NumPy and compare the empirical mean and variance with the theoretical values 3.5 and 35/12."
takeaways:
  - Data is vectors and matrices; dot products and matrix multiplication do most of the work.
  - Matrix shapes must line up, with (n, k) @ (k, m) giving (n, m).
  - A derivative is a slope; a gradient collects slopes for every parameter and points uphill.
  - Gradient descent repeatedly steps against the gradient, scaled by a learning rate.
  - Mean, variance and probability describe data and model uncertainty.
quiz:
  - id: aie-math-q1
    type: single
    topic: math-for-machine-learning
    difficulty: beginner
    prompt: What is the shape of A @ B when A has shape (4, 3) and B has shape (3, 2)?
    options: ["(3, 3)", "(4, 2)", "(2, 4)", "It is undefined"]
    answer: [1]
    explanation: Inner dimensions (3 and 3) must match and disappear, leaving the outer dimensions (4, 2).
  - id: aie-math-q2
    type: code-output
    topic: math-for-machine-learning
    difficulty: beginner
    prompt: What does this print?
    code: |
      import numpy as np
      print(np.dot([1, 2, 3], [4, 5, 6]))
    codeLanguage: python
    options: ["[4 10 18]", "32", "21", "An error"]
    answer: [1]
    explanation: The dot product is 1*4 + 2*5 + 3*6 = 4 + 10 + 18 = 32.
  - id: aie-math-q3
    type: single
    topic: math-for-machine-learning
    difficulty: beginner
    prompt: In gradient descent, how is a parameter w updated?
    options: ["w = w + learning_rate * gradient", "w = w - learning_rate * gradient", "w = gradient / learning_rate", "w = w * gradient"]
    answer: [1]
    explanation: The gradient points uphill (towards higher loss), so we step in the opposite direction, scaled by the learning rate.
  - id: aie-math-q4
    type: scenario
    topic: math-for-machine-learning
    difficulty: intermediate
    prompt: During training the loss jumps around and then becomes NaN after a few steps. What is the most likely first thing to try?
    options: ["Increase the learning rate", "Reduce the learning rate", "Add more output classes", "Remove the test set"]
    answer: [1]
    explanation: Divergence to NaN is a classic sign of a learning rate that is too large; reducing it (and checking for unscaled features) is the first fix.
---

## Beginner-friendly explanation

You do not need a maths degree to do machine learning, but four ideas appear everywhere:

1. **Vectors and matrices** are just lists and grids of numbers. A house could be the vector `[3 bedrooms, 120 square metres, 15 years old]`. A dataset of 1,000 houses is a 1,000 x 3 matrix.
2. **The dot product** multiplies matching entries and adds them up. It is how a model combines features with weights into a score.
3. **Derivatives and gradients** tell you which way is "downhill". Imagine standing on a foggy hill and wanting to reach the valley: you feel the slope under your feet and step downwards. That is **gradient descent**, the way almost all models learn.
4. **Probability and statistics** describe uncertainty: average values, how spread out data is, and how confident a model is.

## Technical explanation

### Vectors, dot products and matrices

For vectors **a** and **b** of the same length, `a · b = a1*b1 + a2*b2 + ... + an*bn`. A linear model predicts `y_hat = w · x + b`.

```python
import numpy as np

x = np.array([3.0, 120.0, 15.0])     # features of one house
w = np.array([10.0, 2.0, -1.0])      # learned weights
b = 50.0
print(x @ w + b)                     # 3*10 + 120*2 + 15*-1 + 50 = 305.0
```

**Matrix multiplication** applies the dot product to every row and column pair. For a batch of examples `X` of shape `(n, k)` and weights `W` of shape `(k, m)`, `X @ W` has shape `(n, m)`.

```text
   X (2x3)        W (3x1)        X @ W (2x1)
[1 2 3]          [1]           [1*1+2*0+3*2] = [7]
[4 5 6]    @     [0]     =     [4*1+5*0+6*2]   [16]
                 [2]
```

Other useful facts: the **transpose** `X.T` swaps rows and columns; the **norm** `np.linalg.norm(v)` is a vector's length; **cosine similarity** `a·b / (|a||b|)` measures the angle between vectors and is used later for embeddings.

### Derivatives and gradients

A **derivative** is the slope of a function at a point. For `f(w) = w²`, the derivative is `f'(w) = 2w`. At `w = 3` the slope is 6 (going uphill to the right), so to reduce `f` we move left.

With many parameters, the **gradient** `∇L` is the vector of partial derivatives of the loss `L` with respect to each parameter. The **chain rule** (`d/dx f(g(x)) = f'(g(x)) · g'(x)`) lets us compute gradients through layers of functions; neural networks use it in **backpropagation**.

### Loss functions

A loss measures how wrong predictions are. **Mean squared error** for regression:

```text
MSE = (1/n) * Σ (y_hat_i - y_i)²
```

### Gradient descent

```text
repeat:
    gradient = dLoss / dParameters
    parameters = parameters - learning_rate * gradient
```

| Learning rate | Behaviour |
|---|---|
| Too small | Slow, may not converge in time |
| Good | Loss drops steadily then flattens |
| Too large | Oscillates or diverges (NaN) |

### Probability and statistics

| Concept | Meaning | NumPy |
|---|---|---|
| Mean | Average value | `x.mean()` |
| Variance | Average squared distance from the mean | `x.var()` |
| Standard deviation | Square root of variance, same units as data | `x.std()` |
| Probability | Number between 0 and 1 for how likely an event is | |
| Conditional probability | P(A given B) = P(A and B) / P(B) | |
| Normal distribution | Bell curve described by mean and standard deviation | `rng.normal(mu, sigma, n)` |

Classifiers often output probabilities, for example "0.92 probability of spam". **Bayes' rule**, `P(A|B) = P(B|A) P(A) / P(B)`, explains why a positive test for a rare condition can still mean the condition is unlikely.

## Real-world example

A team predicts delivery time in minutes from distance. They have historical deliveries, define MSE as the loss and use gradient descent to learn `time = w * distance + b`. When they forgot to scale a second feature (order value in cents, values in the thousands), training diverged; scaling features to similar ranges fixed it. That is the learning-rate table above in real life.

## Step-by-step walkthrough

Fit a straight line with gradient descent from scratch:

```python
import numpy as np

rng = np.random.default_rng(0)
x = rng.uniform(0, 10, size=100)
y = 3.0 * x + 2.0 + rng.normal(0, 1.0, size=100)   # true w=3, b=2 plus noise

w, b = 0.0, 0.0
lr = 0.01
for step in range(2000):
    y_hat = w * x + b
    error = y_hat - y
    loss = (error ** 2).mean()
    # Gradients of MSE with respect to w and b
    grad_w = 2 * (error * x).mean()
    grad_b = 2 * error.mean()
    w -= lr * grad_w
    b -= lr * grad_b
    if step % 500 == 0:
        print(f"step {step:4d}  loss {loss:8.3f}  w {w:.3f}  b {b:.3f}")

print(f"final w={w:.2f}, b={b:.2f}")
```

1. Generate data from a known line plus noise, so we can check the answer.
2. Start with `w = b = 0`.
3. Predict, compute error and MSE.
4. Compute gradients with calculus (derivative of the mean of squared error).
5. Step against the gradient.
6. Watch loss fall and parameters approach 3 and 2.

## Expected output

The loss starts large (hundreds) and falls quickly; the final values are close to `w ≈ 3` and `b ≈ 2`, not exact, because the data contains random noise. You can confirm with `np.polyfit(x, y, 1)`, which solves the same problem in closed form.

## Common mistakes

- **Mismatched shapes** in matrix multiplication; write the shapes down before multiplying.
- **Confusing `*` and `@`:** `*` is element-wise, `@` is matrix multiplication.
- **Adding the gradient** instead of subtracting it.
- **Not scaling features,** making one learning rate too big for some parameters and too small for others.
- **Treating a probability as certainty;** 0.9 still means wrong about one time in ten if well calibrated.
- **Ignoring the base rate** when interpreting probabilities (see Bayes' rule).

## Troubleshooting

- **Loss is NaN or infinite:** lower the learning rate, scale features, check for division by zero.
- **Loss barely moves:** raise the learning rate or run more steps; check the gradient sign and formula.
- **Unsure a hand-derived gradient is right:** compare with a numerical estimate `(L(w+h) - L(w-h)) / (2h)` for small `h`.

## Hands-on exercise

Extend the walkthrough to two features. Generate `y = 3*x1 - 2*x2 + 5 + noise`, store features in an `(n, 2)` matrix `X`, and vectorise the update using `X @ w` and `X.T @ error`. Print the loss every 500 steps and confirm the learned weights approach `[3, -2]` and bias `5`.

## Key takeaways summary

Machine learning maths boils down to representing data as matrices, combining features with dot products, measuring error with a loss, and walking downhill using gradients. Statistics and probability then let you describe data and interpret model outputs honestly.
