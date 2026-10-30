---
slug: jmeter-functions
title: JMeter Functions (__Random, __time, __P and More)
summary: Generate dynamic values inside any field. Learn the ${__name(args)} syntax, the Function Helper Dialog, and the everyday functions __Random, __RandomString, __time, __UUID, __counter, __threadNum, __P, __jexl3 and __groovy.
level: beginner
duration: 35
tags: [performance, jmeter, functions, test-data]
objectives:
  - Write a function call with the ${__functionName(arg1,arg2)} syntax and escape commas in arguments
  - Use the Function Helper Dialog to build and test a function call
  - Choose the right function for random numbers, unique ids, timestamps, counters and thread numbers
  - Use __jexl3 and __groovy for small calculations and know when a JSR223 element is better
prerequisites:
  - Variables and properties in JMeter
related: [jmeter-variables-and-properties, jmeter-csv-data-set-config, jmeter-groovy-jsr223, jmeter-logic-controllers, jmeter-testing-rest-apis]
references:
  - title: Apache JMeter - Functions and Variables reference
    url: https://jmeter.apache.org/usermanual/functions.html
  - title: Apache JMeter User Manual
    url: https://jmeter.apache.org/usermanual/index.html
  - title: Apache JMeter Best Practices
    url: https://jmeter.apache.org/usermanual/best-practices.html
interview:
  - q: How would you generate a unique value per request in JMeter?
    a: "For true uniqueness I use ${__UUID()}, which returns a random type-4 UUID. If I need readable sequential ids I use ${__counter(FALSE,)} which is global across threads, optionally combined with ${__threadNum} or ${__time()}. __Random alone is not unique because random numbers can repeat."
  - q: What is the difference between __counter(TRUE) and __counter(FALSE)?
    a: "With TRUE each thread has its own counter starting at 1, so thread 1 and thread 2 both produce 1, 2, 3. With FALSE there is one global counter shared by all threads, so every call across the test gets the next number. FALSE is the one to use when you need unique sequence numbers."
  - q: When would you use __groovy instead of a JSR223 PreProcessor?
    a: "__groovy is handy for a one-line expression inside a field, for example formatting a date or doing arithmetic on a variable. For anything longer, with loops, error handling or several variables, I use a JSR223 element with Groovy and caching enabled, because it is easier to read, debug and maintain. Both should use Groovy rather than older script languages for performance."
practice:
  - "Open Tools → Function Helper Dialog, build ${__Random(1000,9999,pin)} and press Generate. Then use ${pin} in a request body and confirm it in View Results Tree."
  - "Send a POST to your local practice API that creates an order with orderRef set to ORD-${__time(yyyyMMddHHmmss,)}-${__threadNum}-${__counter(FALSE,)} and verify all references are different."
  - "Use ${__jexl3(${__Random(1,100,)} <= 30,)} inside an If Controller to send a request on roughly 30 percent of iterations."
takeaways:
  - "Functions are written ${__name(args)} and are evaluated each time the field is used, unlike User Defined Variables."
  - Commas separate arguments; escape a literal comma inside an argument with a backslash.
  - __UUID or a global __counter gives uniqueness; __Random does not.
  - __time formats timestamps with Java date patterns; without a format it returns epoch milliseconds.
  - Keep logic inside functions short; move real scripting to JSR223 with Groovy.
quiz:
  - id: jm-fn-q1
    type: single
    topic: jmeter-functions
    difficulty: beginner
    prompt: Which function is the best choice for a value that must be unique on every request across all threads?
    options: ["${__Random(1,1000)}", "${__threadNum}", "${__UUID()}", "${__counter(TRUE,)}"]
    answer: [2]
    explanation: __UUID returns a random 128-bit identifier that is practically unique. __Random can repeat, __threadNum is the same on every iteration of a thread, and __counter(TRUE) is per thread so different threads produce the same numbers.
  - id: jm-fn-q2
    type: code-output
    topic: jmeter-functions
    difficulty: intermediate
    prompt: Two threads each run 2 iterations. Each iteration calls the function below once. Which values can thread 2 see?
    code: "${__counter(TRUE,)}"
    codeLanguage: text
    options: ["1 then 2", "3 then 4", "2 then 4", "Any of 1 to 4"]
    answer: [0]
    explanation: TRUE means each user has its own counter starting at 1, so thread 2 sees 1 and then 2, exactly like thread 1. With FALSE the global counter would spread 1 to 4 across both threads.
  - id: jm-fn-q3
    type: truefalse
    topic: jmeter-functions
    difficulty: beginner
    prompt: ${__time()} with no arguments returns the current time in milliseconds since 1 January 1970 (epoch).
    options: ["True", "False"]
    answer: [0]
    explanation: Without a format string, __time returns epoch milliseconds. Pass a Java date pattern such as yyyy-MM-dd to get a formatted date instead.
  - id: jm-fn-q4
    type: debugging
    topic: jmeter-functions
    difficulty: intermediate
    prompt: The field ${__groovy(new Date().format('yyyy-MM-dd, HH:mm'),)} produces an error about the script. Why?
    options: ["Groovy cannot format dates", "The unescaped comma inside the script is treated as an argument separator", "__groovy needs a variable name", "Functions cannot be used in body data"]
    answer: [1]
    explanation: JMeter splits function arguments on commas, so the script is cut off at the comma after dd. Escape it as a backslash followed by a comma. Groovy can format dates and functions work in bodies.
---

## Beginner-friendly explanation

A vending machine button does a small job every time you press it: give a drink. A **JMeter function** is a little button you put inside a text field. Each time JMeter uses that field, it "presses the button" and replaces it with a fresh result, such as a random number, today's date or a unique id.

You write a function as `${__name(arguments)}`. The two underscores tell JMeter it is a function, not a variable. For example, `${__Random(1,6)}` rolls a dice and inserts a number from 1 to 6.

Functions are how you avoid sending exactly the same data with every request, which is unrealistic and often fails (for example "order reference already exists").

## Technical explanation

**Syntax rules**

- Form: `${__functionName(arg1,arg2,...)}`. Functions with no arguments can be written `${__threadNum}` or `${__UUID()}`.
- Arguments are separated by commas. A literal comma in an argument must be escaped as `\,`.
- Many functions take an optional last argument: a **variable name** to store the result in, so you can reuse it later as `${name}`.
- Functions can be nested: `${__Random(1,${__P(max,10)},)}`.
- They are evaluated each time the field is processed, so `${__Random(1,9)}` in a sampler gives a new number on every request.

**Function Helper Dialog:** **Tools → Function Helper Dialog**. Pick a function from the drop-down, fill the argument table, click **Generate** and the dialog shows the call string and the result it produces right now. Copy it into your field. It is the easiest way to learn arguments without typos.

| Function | Example | Illustrative result | Use |
|---|---|---|---|
| `__Random(min,max,var)` | `${__Random(1000,9999,)}` | `4821` | Random integer, inclusive |
| `__RandomString(len,chars,var)` | `${__RandomString(8,abcdef0123,)}` | `a3f0cd21` | Random text from a character set |
| `__time(format,var)` | `${__time(yyyy-MM-dd,)}` | `2026-10-30` | Timestamps; no format gives epoch ms |
| `__UUID()` | `${__UUID()}` | `6f1c...-...` (36 chars) | Unique ids, idempotency keys |
| `__counter(perThread,var)` | `${__counter(FALSE,)}` | `1`, `2`, `3`… | Sequences; FALSE = global |
| `__threadNum` | `${__threadNum}` | `3` | Number of the current thread in its group |
| `__P(name,default)` | `${__P(users,1)}` | `1` | Read a property (see [variables and properties](/learn/jmeter/jmeter-variables-and-properties)) |
| `__jexl3(expr,var)` | `${__jexl3(${qty} > 5,)}` | `true` | Small expressions, conditions |
| `__groovy(script,var)` | `${__groovy(vars.get('qty').toInteger() * 2,)}` | `14` | One-line Groovy |

**`__jexl3` vs `__groovy`:** JEXL is a lightweight expression language and is the recommended choice for If Controller conditions. `__groovy` gives full Groovy with access to `vars`, `props`, `ctx` and `log`. For multi-line logic use a JSR223 element instead (see [Groovy and JSR223](/learn/jmeter/jmeter-groovy-jsr223)).

```mermaid
flowchart LR
  F["Field text: /orders/ORD-${__counter(FALSE,)}"] --> E["JMeter evaluates the function"]
  E --> R["Sent: /orders/ORD-17"]
  E --> V["Optional: result stored in a variable"]
```

## Step-by-step walkthrough

Practice target: a REST app running on your own machine. Only test systems you own or are authorised in writing to test.

1. Open **Tools → Function Helper Dialog**, choose `__time`, enter `yyyy-MM-dd'T'HH:mm:ss` as the format, press **Generate**. Copy the result string.
2. Add an HTTP Request `POST /api/orders` with this **Body Data**:

```json
{
  "orderRef": "ORD-${__time(yyyyMMddHHmmss,)}-${__threadNum}-${__counter(FALSE,)}",
  "idempotencyKey": "${__UUID()}",
  "quantity": ${__Random(1,5,qty)},
  "note": "${__RandomString(10,abcdefghij,)}"
}
```

3. Add an **HTTP Header Manager** with `Content-Type: application/json`.
4. Add an **If Controller** after it with condition `${__jexl3(${qty} >= 4,)}` and a child request, for example `GET /api/orders/bulk-discount`.
5. Run 3 threads × 2 loops with **View Results Tree** and inspect each request body.

## Expected output

Illustrative request body for thread 2, second iteration:

```json
{
  "orderRef": "ORD-20261030101512-2-5",
  "idempotencyKey": "0b6a3f6e-1c2d-4c57-9a7e-2f1b8f2d9c11",
  "quantity": 4,
  "note": "cjbadgiehf"
}
```

Every `orderRef` and `idempotencyKey` differs. The bulk-discount request appears only for iterations where `qty` was 4 or 5.

## Real-world example

A team testing its own invoice API kept getting 409 Conflict errors under load because every virtual user sent the same invoice number from the recording. Replacing it with `INV-${__time(yyyyMMdd,)}-${__counter(FALSE,)}` removed the false errors, and the remaining errors turned out to be a real locking problem worth investigating.

## Common mistakes

- **Using `__Random` for uniqueness.** Collisions happen; use `__UUID` or a global counter.
- **Putting functions in User Defined Variables** and expecting a new value each iteration. UDV is evaluated once.
- **Forgetting to escape commas** in `__groovy` and `__jexl3` arguments.
- **Heavy logic in `__groovy`** on every request, which costs CPU on the load generator.
- **Confusing `__threadNum`** (thread number, constant per thread) with an iteration counter.

## Troubleshooting

- **Literal `${__Random(...)}` in the request:** the function name is misspelled (they are case-sensitive) or the brackets are unbalanced. Rebuild it in the Function Helper Dialog.
- **Script errors in `jmeter.log`:** check escaping of commas and quotes; test the call in the Function Helper Dialog first.
- **Same "random" values in every thread:** the function is probably in a UDV; move it into the sampler.

## Functions vs variables vs scripts

Beginners often wonder which tool to reach for. Use this progression, from simplest to most powerful:

| Need | Best tool | Why |
|---|---|---|
| A fixed value used in many places | User Defined Variable | Evaluated once, easy to change |
| Realistic data that must exist in the system (accounts, product ids) | CSV Data Set Config | Values must be valid, so you prepare them |
| A fresh but meaningless value (reference, note, random quantity) | Function in the field | No file to maintain, new value per use |
| A value taken from a previous response | Extractor | Only the server knows it |
| Logic with several steps, loops or error handling | JSR223 element with Groovy | Readable, debuggable, cached compilation |

A good habit is to store a function result in a variable (the optional last argument) whenever you need the same value twice. For example `${__Random(1,5,qty)}` sends a number and also saves it as `${qty}` for a later assertion or If Controller. Every call produces a new value, so writing `${__Random(1,5,)}` twice gives two different numbers. A few functions, such as `__UUID`, take no variable-name argument; to reuse one UUID in both a header and a body, generate it once in a **User Parameters** pre-processor (Add → Pre Processors → User Parameters, name `reqId`, value `${__UUID()}`) and refer to `${reqId}` in both places. Always confirm the exact arguments in the Function Helper Dialog.

## Key takeaways summary

Functions inject fresh, computed values into any field. Learn the handful that cover most needs: `__Random` and `__RandomString` for variety, `__UUID` and global `__counter` for uniqueness, `__time` for timestamps, `__threadNum` for identity, `__P` for settings, and `__jexl3`/`__groovy` for small logic. Build calls in the Function Helper Dialog to avoid syntax errors.
