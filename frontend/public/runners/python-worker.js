// Runs learner Python in a Web Worker with Pyodide, then runs each grading test in the same namespace.
// Message in:  { id, code, tests: [{ name, code }] }
// Message out: { id, ready } once loaded; { id, stdout, error, results: [{ name, ok, message }] } per run.
/* global importScripts, loadPyodide */
importScripts("/pyodide/pyodide.js");

let pyodidePromise = null;
let stdout = [];

function boot() {
  if (!pyodidePromise) {
    pyodidePromise = loadPyodide({ indexURL: "/pyodide/" }).then((py) => {
      py.setStdout({ batched: (line) => stdout.push(line) });
      py.setStderr({ batched: (line) => stdout.push(line) });
      return py;
    });
  }
  return pyodidePromise;
}

/** Last line of a Python traceback, e.g. "AssertionError: expected 3, got 2". */
function lastLine(err) {
  const text = String((err && err.message) || err).trim().split("\n");
  return text[text.length - 1] || "Error";
}

self.onmessage = async (event) => {
  const { id, code, tests } = event.data;
  let py;
  try {
    py = await boot();
  } catch (err) {
    self.postMessage({ id, stdout: [], error: `Could not start Python: ${lastLine(err)}`, results: [] });
    return;
  }
  stdout = [];
  const ns = py.globals.get("dict")();
  let error = null;
  try {
    await py.runPythonAsync(code, { globals: ns });
  } catch (err) {
    error = lastLine(err);
  }
  const results = [];
  for (const test of tests) {
    if (error) {
      results.push({ name: test.name, ok: false, message: "Your code raised an error before this check could run." });
      continue;
    }
    try {
      await py.runPythonAsync(test.code, { globals: ns });
      results.push({ name: test.name, ok: true, message: "" });
    } catch (err) {
      results.push({ name: test.name, ok: false, message: lastLine(err) });
    }
  }
  ns.destroy();
  self.postMessage({ id, stdout, error, results });
};

boot().then(
  () => self.postMessage({ ready: true }),
  (err) => self.postMessage({ ready: false, error: lastLine(err) }),
);
