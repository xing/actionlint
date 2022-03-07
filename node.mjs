import { readFile } from "node:fs/promises";
import { createActionlint } from "./actionlint.cjs";

/**
 * @typedef {(go: Go) => Promise<WebAssembly.WebAssemblyInstantiatedSource>} WasmLoader
 * @typedef {import("./types").RunActionlint} RunActionlint
 * @typedef {import("./types").LintResult} LintResult
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
      return WebAssembly.instantiate(await readFile(url), go.importObject);
    }
  ));
}
