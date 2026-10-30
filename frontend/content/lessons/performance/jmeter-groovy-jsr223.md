---
slug: jmeter-groovy-jsr223
title: Groovy and JSR223 in JMeter
summary: When built-in elements are not enough, JSR223 elements with Groovy let you add logic to a JMeter test. Learn the available variables, why Groovy is preferred over BeanShell, and how to keep scripts fast with compiled-script caching.
level: intermediate
duration: 35
tags: [performance, jmeter, groovy, scripting]
objectives:
  - Choose the right JSR223 element (pre-processor, post-processor, assertion, sampler, timer)
  - Use the bindings vars, props, prev, ctx, log and sampler correctly
  - Explain why Groovy with compiled-script caching is preferred over BeanShell
  - Avoid inline variable references that break script caching
prerequisites:
  - JMeter fundamentals
  - Assertions and extractors
  - Basic Java or Groovy syntax
related: [jmeter-assertions-and-extractors, jmeter-correlation-and-parameterization, jmeter-fundamentals, jmeter-non-gui-and-distributed]
references:
  - title: Apache JMeter - Best Practices (JSR223 and Groovy)
    url: https://jmeter.apache.org/usermanual/best-practices.html
  - title: Apache JMeter - Component Reference (JSR223 elements)
    url: https://jmeter.apache.org/usermanual/component_reference.html
  - title: Groovy documentation
    url: https://groovy-lang.org/documentation.html
interview:
  - q: Why does the JMeter documentation recommend JSR223 with Groovy over BeanShell?
    a: Groovy scripts in JSR223 elements can be compiled once and cached when the language supports the Compilable interface, which Groovy does, so repeated execution is close to Java speed. BeanShell is interpreted on every execution, which costs much more CPU on the load generator at high sample rates. Groovy is also the default JSR223 language in modern JMeter and has convenient features such as JsonSlurper.
  - q: Why should you avoid writing ${myVar} inside a JSR223 script?
    a: JMeter substitutes ${} references before the script runs. With compiled-script caching enabled, the script text is compiled and cached after the first substitution, so later iterations keep using the first value. Without caching, every distinct value produces new script text to compile, which wastes CPU. The correct approach is vars.get("myVar") inside the script, or passing values through the Parameters field.
  - q: Name some variables available in JSR223 elements and what they are for.
    a: vars gives the current thread's JMeter variables; props gives JMeter properties shared across threads; prev is the previous sample result, so in a post-processor it is the response I just received; ctx is the JMeter context with the thread number and current sampler; log writes to jmeter.log; sampler is the current sampler. Assertions also get AssertionResult and samplers get SampleResult.
practice:
  - "Write a JSR223 PreProcessor that creates a unique idempotency key and an ISO-8601 timestamp for each payment request."
  - "Write a JSR223 PostProcessor that picks a random in-stock product from a JSON product list and stores its id, with a NOT_FOUND fallback."
  - "Convert a BeanShell Assertion that checks a response field into a JSR223 Assertion in Groovy."
takeaways:
  - Use JSR223 elements with Groovy for custom logic; avoid BeanShell for load tests.
  - Enable compiled-script caching and never put ${} references inside the script body.
  - Read and write variables with vars.get and vars.put; vars values are strings.
  - Prefer built-in elements when they do the job; scripts cost load generator CPU and maintenance.
  - Fail assertions explicitly with AssertionResult and log sparingly.
quiz:
  - id: perf-jgr-q1
    type: code-output
    topic: jmeter-groovy-jsr223
    difficulty: intermediate
    prompt: A JSR223 PreProcessor in Groovy runs this code. What value does the next sampler see for ${next}?
    code: |
      vars.put('count', '5')
      def n = vars.get('count') as Integer
      vars.put('next', String.valueOf(n * 2 + 1))
    codeLanguage: groovy
    options: ["5", "10", "11", "51"]
    answer: [2]
    explanation: vars stores strings, so '5' is converted to the Integer 5, then 5 × 2 + 1 = 11 and stored back as the string '11'. 51 would come from string concatenation, which the explicit Integer conversion avoids.
  - id: perf-jgr-q2
    type: debugging
    topic: jmeter-groovy-jsr223
    difficulty: advanced
    prompt: A JSR223 PostProcessor with "Cache compiled script if available" checked contains log.info('order ${orderId}'). Every iteration logs the same order ID, although each response creates a new order. What is the cause?
    options: ["The JSON Extractor runs after the script", "JMeter substituted ${orderId} into the script text before the first compilation, and the cached compiled script keeps that first value", "Groovy strings are immutable", "The log level is too low"]
    answer: [1]
    explanation: JMeter performs ${} substitution before running the script, and caching keeps the first compiled version, so the value is frozen. Using vars.get('orderId') reads the current value each time.
  - id: perf-jgr-q3
    type: single
    topic: jmeter-groovy-jsr223
    difficulty: beginner
    prompt: In a JSR223 PostProcessor, which binding gives you the response that was just received?
    options: ["props", "prev", "ctx.getProperties()", "OUT"]
    answer: [1]
    explanation: prev is the previous SampleResult, which for a post-processor is the sample it is attached to, so prev.getResponseDataAsString() returns its body. props holds shared JMeter properties and OUT is standard output.
  - id: perf-jgr-q4
    type: truefalse
    topic: jmeter-groovy-jsr223
    difficulty: beginner
    prompt: BeanShell elements are the recommended choice for scripting in high-load JMeter tests.
    options: ["True", "False"]
    answer: [1]
    explanation: The JMeter best-practices documentation recommends JSR223 elements with Groovy because Groovy scripts can be compiled and cached, whereas BeanShell is interpreted on every execution and uses much more CPU.
---

## Beginner-friendly explanation

JMeter's built-in elements are like the standard tools in a toolbox: a hammer, a screwdriver, a spanner. Most jobs need nothing else. Occasionally you need something special, such as calculating a signature, picking a random item that is in stock, or checking that an order total equals the sum of its lines.

**JSR223 elements** are the workshop where you can make your own tool, using a scripting language. **Groovy** is the recommended language: it reads like simplified Java and, crucially, JMeter can compile it once and reuse it, so it stays fast when thousands of virtual users run it.

## Technical explanation

JSR223 is the Java standard for scripting engines. JMeter provides JSR223 versions of several element types:

| Element | Runs | Typical use |
|---|---|---|
| JSR223 PreProcessor | Before the sampler | Generate keys, timestamps, signatures |
| JSR223 PostProcessor | After the sampler | Parse responses, choose next data |
| JSR223 Assertion | After post-processors | Complex business-rule checks |
| JSR223 Sampler | As the sample | Custom protocol call or calculation timed as a sample |
| JSR223 Timer | Before the sampler | Computed delays (the script's return value is the delay in ms) |
| JSR223 Listener | After the sample | Custom result handling (use sparingly) |

### Bindings available to scripts

| Name | What it is |
|---|---|
| `vars` | This thread's JMeter variables (`vars.get`, `vars.put`; values are strings, `putObject` for objects) |
| `props` | JMeter properties shared by all threads |
| `prev` | The previous `SampleResult` |
| `ctx` | `JMeterContext`: thread number, current sampler, thread group |
| `sampler` | The current sampler |
| `log` | Logger writing to `jmeter.log` |
| `Parameters`, `args` | Text from the Parameters field, whole and split |
| `SampleResult` | In a JSR223 Sampler or Assertion, the result being built or checked |
| `AssertionResult` | In a JSR223 Assertion, used to report failure |

### Performance rules

- **Groovy plus caching.** With "Cache compiled script if available" ticked (or a script file), Groovy is compiled once and reused. BeanShell has no such compilation and is much more expensive per execution; the JMeter best practices recommend migrating to JSR223 with Groovy.
- **No `${...}` inside scripts.** JMeter substitutes it before the script runs, so with caching only the first substitution is kept. Use `vars.get('name')` or the Parameters field.
- **Keep scripts small.** Every line runs for every sample on the load generator.

```mermaid
flowchart LR
  A["Script text"] --> B{"Contains inline variable references?"}
  B -->|"yes"| C["Substituted first, cached once: stale values"]
  B -->|"no"| D["Compiled once, cached, fast"]
  D --> E["Reads current values with vars.get"]
```

## Real-world example

A team signing API requests with an HMAC used a BeanShell PreProcessor written years earlier. At low load everything was fine, but at the target rate the load generators' CPU saturated before the application did, and reported response times included time spent queueing inside JMeter. Rewriting the logic as a cached Groovy JSR223 PreProcessor, with the secret read from a property rather than inlined, cut the generators' CPU substantially and allowed the test to reach the target rate from the same machines.

## Step-by-step walkthrough

1. **Check for a built-in element first** (extractor, function, assertion). Use a script only when needed.
2. **Add the JSR223 element** in the narrowest scope that needs it.
3. **Select Groovy** and tick "Cache compiled script if available".
4. **Read inputs with `vars.get`**, never `${}` in the script body.
5. **Write outputs with `vars.put`** as strings, with a fallback such as `NOT_FOUND`.
6. **Debug with one thread**, a Debug Sampler and `log.info`, then reduce logging.
7. **Measure generator CPU** in a short load run before the real test.

## Code examples

PreProcessor: unique idempotency key and timestamp for a payment request.

```groovy
import java.time.Instant

vars.put('idempotencyKey', UUID.randomUUID().toString())
vars.put('requestTs', Instant.now().toString())
```

PostProcessor: choose a random in-stock product.

```groovy
import groovy.json.JsonSlurper

def json = new JsonSlurper().parseText(prev.getResponseDataAsString())
def inStock = json.items.findAll { it.stock > 0 }

if (inStock) {
    def pick = inStock[new Random().nextInt(inStock.size())]
    vars.put('productId', pick.id.toString())
} else {
    vars.put('productId', 'NOT_FOUND')
    log.warn('No in-stock items for thread ' + ctx.getThreadNum())
}
```

Assertion: order total must equal the sum of its lines.

```groovy
import groovy.json.JsonSlurper

def order = new JsonSlurper().parseText(SampleResult.getResponseDataAsString())
def expected = order.lines.sum { it.price * it.qty }

if (order.total != expected) {
    AssertionResult.setFailure(true)
    AssertionResult.setFailureMessage('Order total does not match line items')
}
```

## Expected output

With a Debug Sampler after the post-processor, a successful iteration shows a variable such as:

```text
productId=1043
```

When the total check fails, View Results Tree shows the assertion with the message `Order total does not match line items`, and the sample counts as an error in reports.

## Common mistakes

- **BeanShell in load tests**, burning generator CPU.
- **`${var}` inside Groovy code**, causing stale values with caching or recompilation without it.
- **Putting non-strings with `vars.put`**; use `String.valueOf(...)` or `vars.putObject`.
- **Verbose logging** on every sample, filling disks and slowing threads.
- **Hard-coded secrets** in scripts committed to source control; pass them as properties (`-J`) from a secure store.
- **Scripting what an extractor already does**, adding maintenance cost for no benefit.

## Troubleshooting

- **`groovy.json.JsonException`**: the response is not JSON (often an error page); add a status assertion before parsing and guard with `try/catch`.
- **Script works in GUI but not in non-GUI runs**: check property values passed on the command line and file paths relative to the working directory.
- **High CPU on generators**: confirm caching is enabled, remove `${}` from scripts and cut logging.

## Key takeaways summary

JSR223 with Groovy is the right way to add custom logic to JMeter. Cache compiled scripts, use the `vars`, `props`, `prev` and `ctx` bindings instead of inline variable references, keep scripts small, and prefer built-in elements whenever they are enough.
