import { createActionlint } from "./actionlint.cjs";

/**
 * @typedef {(go: Go) => Promise<WebAssembly.WebAssemblyInstantiatedSource>} WasmLoader
 * @typedef {import("./types").RunActionlint} RunActionlint
 * @typedef {import("./types").LintResult} LintResult
 */

/**
 * @param {URL} url
 * @returns {Promise<RunActionlint>}
 */
export async function createLinter(
  url = new URL("./main.wasm", import.meta.url)
) {
  return await createActionlint(
    /** @type {WasmLoader} */ async (go) => {
      return WebAssembly.instantiateStreaming(
        fetch(url.toString()),
        go.importObject
      );
    }
  );
}
