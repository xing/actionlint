import { createActionlint } from "./actionlint.cjs";

/**
 * @typedef {import("./actionlint.cjs").LintResult} LintResult
 * @typedef {import("./actionlint.cjs").WasmLoader} WasmLoader
 * @typedef {import("./actionlint.cjs").RunActionlint} RunActionlint
 */

/** @type {RunActionlint | undefined} */
let runLint = undefined;

/**
 * @param {URL} url
 * @returns {RunActionlint}
 */
export function createLinter(url = new URL("./main.wasm", import.meta.url)) {
  if (runLint) {
    return runLint;
  }

  return (runLint = createActionlint(
    /** @type {WasmLoader} */ async (go) => {
      return WebAssembly.instantiateStreaming(
        fetch(url.toString()),
        go.importObject
      );
    }
  ));
}
