---
slug: python-for-ai
title: Python for AI
summary: Learn the Python you need for AI work, including virtual environments, core data structures, functions, NumPy arrays and vectorisation, and pandas DataFrames for loading and cleaning data.
level: beginner
duration: 60
tags: [python, numpy, pandas, ai, data]
objectives:
  - Set up an isolated Python environment and install AI libraries
  - Use lists, dictionaries, functions and comprehensions confidently
  - Create, index, reshape and compute with NumPy arrays using vectorisation and broadcasting
  - Load, inspect, filter and clean tabular data with pandas
prerequisites:
  - Basic programming concepts such as variables, loops and conditions
related: [ai-landscape-and-roles, math-for-machine-learning, machine-learning-fundamentals, pytorch-essentials]
references:
  - title: Python Documentation — The Python Tutorial
    url: https://docs.python.org/3/tutorial/
  - title: Python Documentation — venv, creation of virtual environments
    url: https://docs.python.org/3/library/venv.html
  - title: NumPy — Absolute basics for beginners
    url: https://numpy.org/doc/stable/user/absolute_beginners.html
  - title: NumPy — Broadcasting
    url: https://numpy.org/doc/stable/user/basics.broadcasting.html
  - title: pandas — 10 minutes to pandas
    url: https://pandas.pydata.org/docs/user_guide/10min.html
interview:
  - q: Why is NumPy vectorisation faster than a Python for loop?
    a: A NumPy operation such as a + b runs a loop in compiled C over a contiguous block of memory with a single data type, avoiding the per-element overhead of the Python interpreter, type checks and object boxing. A Python loop does that overhead for every element. Vectorised code is also shorter and closer to the maths.
  - q: What is broadcasting in NumPy?
    a: Broadcasting is the set of rules that lets NumPy combine arrays of different shapes without copying data. Shapes are compared from the trailing dimension; two dimensions are compatible if they are equal or one of them is 1, and missing leading dimensions are treated as 1. For example, a (3, 4) array plus a (4,) array adds the vector to every row.
  - q: Why use a virtual environment for an ML project?
    a: Each project gets its own isolated set of package versions, so upgrading a library for one project does not break another, and the exact dependencies can be recorded in a requirements file for reproducible results on other machines and in CI.
practice:
  - "Create a virtual environment, install numpy and pandas, and save the versions with pip freeze to requirements.txt."
  - "Write a function that normalises a NumPy array to zero mean and unit standard deviation per column, without any Python loops."
  - "Load a CSV of your choice with pandas, report missing values per column, and produce the mean of one numeric column grouped by a category column."
takeaways:
  - Use a virtual environment per project and record dependencies.
  - Lists and dictionaries are everyday tools; comprehensions keep transformations short.
  - NumPy arrays have a shape and dtype; vectorised operations and broadcasting replace slow loops.
  - pandas DataFrames handle labelled tabular data, missing values and group-by summaries.
quiz:
  - id: aie-python-q1
    type: code-output
    topic: python-for-ai
    difficulty: beginner
    prompt: What does this code print?
    code: |
      import numpy as np
      a = np.array([[1, 2, 3], [4, 5, 6]])
      print(a.shape)
    codeLanguage: python
    options: ["(3, 2)", "(2, 3)", "6", "(2,)"]
    answer: [1]
    explanation: The array has 2 rows and 3 columns, so its shape is (2, 3).
  - id: aie-python-q2
    type: code-output
    topic: python-for-ai
    difficulty: beginner
    prompt: What is the result of this broadcasting operation?
    code: |
      import numpy as np
      m = np.array([[1, 2], [3, 4]])
      print(m + np.array([10, 20]))
    codeLanguage: python
    options: ["[[11 22] [13 24]]", "[[11 12] [23 24]]", "An error", "[[11 22]]"]
    answer: [0]
    explanation: The (2,) vector is broadcast across each row, so 10 is added to the first column and 20 to the second.
  - id: aie-python-q3
    type: debugging
    topic: python-for-ai
    difficulty: beginner
    prompt: df[df.age > 30 and df.country == "UK"] raises "The truth value of a Series is ambiguous". What is the fix?
    options: ["Use & with parentheses around each condition", "Use the keyword or", "Convert df to a list first", "Wrap the whole expression in bool()"]
    answer: [0]
    explanation: pandas element-wise logic uses & and |, and each comparison needs parentheses because of operator precedence, for example df[(df.age > 30) & (df.country == "UK")].
  - id: aie-python-q4
    type: truefalse
    topic: python-for-ai
    difficulty: beginner
    prompt: A NumPy array can efficiently hold elements of many different Python types in one array, just like a list.
    options: ["True", "False"]
    answer: [1]
    explanation: NumPy arrays are efficient because all elements share one dtype stored contiguously. Mixed types fall back to an object array that loses the speed benefits.
---

## Beginner-friendly explanation

Python is the main language of AI because it is easy to read and has excellent libraries. Think of Python as the kitchen and the libraries as appliances: **NumPy** is a very fast calculator for whole grids of numbers at once, **pandas** is a spreadsheet you control with code, and later **scikit-learn** and **PyTorch** are the machines that actually learn.

You do not need to be an expert programmer to start. You need to be comfortable with a handful of tools: lists, dictionaries, functions, and the idea that NumPy lets you do maths on a whole array in one line instead of looping over every number.

## Technical explanation

### 1. Environments

Always work inside a virtual environment so each project has its own packages.

```bash
python -m venv .venv
# Windows:  .venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate
pip install numpy pandas scikit-learn
pip freeze > requirements.txt
```

### 2. Core Python you will use constantly

```python
scores = [0.91, 0.78, 0.85]                 # list: ordered, mutable
model_config = {"lr": 0.01, "epochs": 10}   # dict: key -> value

def mean(values: list[float]) -> float:
    """Return the arithmetic mean of a non-empty list."""
    return sum(values) / len(values)

passed = [s for s in scores if s >= 0.8]    # list comprehension
print(mean(scores), passed, model_config["lr"])
```

Other essentials: `for name, value in model_config.items()`, `enumerate`, `zip`, f-strings (`f"{acc:.2%}"`), and reading files with `with open(path) as f:`.

### 3. NumPy arrays

An array has a **shape** (size along each axis) and a **dtype** (element type).

```python
import numpy as np

x = np.array([[1.0, 2.0, 3.0],
              [4.0, 5.0, 6.0]])
print(x.shape, x.dtype)   # (2, 3) float64
print(x[0, 1])            # 2.0   row 0, column 1
print(x[:, 2])            # [3. 6.]  every row, column 2
print(x.T.shape)          # (3, 2)  transpose
print(x.reshape(3, 2))    # same data, new shape
print(x.sum(axis=0))      # [5. 7. 9.]  column sums
print(x.mean(axis=1))     # [2. 5.]     row means
```

**Axis tip:** `axis=0` collapses rows (result per column); `axis=1` collapses columns (result per row).

### 4. Vectorisation

```python
import numpy as np, time

values = np.random.default_rng(0).random(1_000_000)

start = time.perf_counter()
squared_loop = [v * v for v in values]
loop_time = time.perf_counter() - start

start = time.perf_counter()
squared_vec = values * values
vec_time = time.perf_counter() - start

print(f"loop {loop_time:.4f}s, vectorised {vec_time:.4f}s")
```

On typical hardware the vectorised version is many times faster; measure it on your own machine.

### 5. Broadcasting

| Shape A | Shape B | Result | Why |
|---|---|---|---|
| (3, 4) | (4,) | (3, 4) | B treated as (1, 4), stretched over rows |
| (3, 4) | (3, 1) | (3, 4) | B stretched over columns |
| (3, 4) | (3,) | Error | Trailing dims 4 and 3 differ and neither is 1 |

```python
data = np.array([[1., 200.], [2., 300.], [3., 400.]])
standardised = (data - data.mean(axis=0)) / data.std(axis=0)
print(standardised.round(2))
```

### 6. pandas DataFrames

```python
import pandas as pd

df = pd.DataFrame({
    "age": [25, 41, None, 35],
    "country": ["UK", "IN", "UK", "US"],
    "spend": [120.0, 340.5, 99.9, 210.0],
})
print(df.info())
print(df.isna().sum())                         # missing values per column
df["age"] = df["age"].fillna(df["age"].median())
print(df[(df.age > 30) & (df.country != "US")])
print(df.groupby("country")["spend"].mean())
X = df[["age", "spend"]].to_numpy()            # hand off to NumPy / scikit-learn
```

## Real-world example

A test team wants to know which product areas generate the most failing tests. They export CI results to CSV and use pandas: `pd.read_csv("results.csv")`, filter `status == "failed"`, `groupby("component").size().sort_values(ascending=False)`. In ten lines they replace a manual spreadsheet process, and the same DataFrame later becomes the input for a model that predicts flaky tests.

## Step-by-step walkthrough

1. Create and activate a virtual environment.
2. Install `numpy` and `pandas`.
3. Build a small DataFrame (or load a CSV).
4. Inspect with `.head()`, `.info()`, `.describe()`.
5. Clean: handle missing values, fix types.
6. Convert numeric features to a NumPy array.
7. Standardise columns with broadcasting.

## Expected output

For the standardisation example the result has each column with mean 0 and standard deviation 1:

```text
[[-1.22 -1.22]
 [ 0.    0.  ]
 [ 1.22  1.22]]
```

## Common mistakes

- **Installing packages globally** and getting version conflicts between projects.
- **Looping over array elements** in Python instead of using vectorised operations.
- **Confusing axes** (`axis=0` vs `axis=1`).
- **Shape surprises:** a `(3,)` vector is not the same as a `(3, 1)` column; check `.shape` often.
- **Using `and`/`or` with pandas Series** instead of `&`/`|` with parentheses.
- **Chained assignment** like `df[df.a > 1]["b"] = 0`, which may modify a copy; use `df.loc[df.a > 1, "b"] = 0`.
- **Mutating a view by accident:** NumPy slices are views, so `y = x[0]; y[:] = 0` changes `x`. Use `.copy()` when needed.

## Troubleshooting

- **`ModuleNotFoundError`:** the environment is not activated, or the IDE uses a different interpreter.
- **`ValueError: operands could not be broadcast together`:** print both shapes and compare from the right.
- **Unexpected `object` dtype in pandas:** a numeric column contains text; use `pd.to_numeric(col, errors="coerce")`.

## Hands-on exercise

Using only NumPy, create a 100 x 3 array of random numbers with `np.random.default_rng(42)`. Compute the column means, standardise the columns with broadcasting, and verify with `np.allclose` that each column now has mean 0 and standard deviation 1. Then put the array in a pandas DataFrame with column names and print `describe()`.

## Key takeaways summary

Work in a virtual environment, master lists, dictionaries and functions, then think in arrays: NumPy shapes, axes, vectorisation and broadcasting are the vocabulary of every ML library. pandas handles messy real-world tables before you hand clean numeric arrays to models.
