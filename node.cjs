const { join } = require("path");
const { pathToFileURL } = require("url");
const { readFile } = require("node:fs/promises");
const { createActionlint } = require("./actionlint.cjs");

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
module.exports.createLinter = function createLinter(
  url = pathToFileURL(join(__dirname, "main.wasm"))
) {
  if (runLint) {
    return runLint;
  }

  return (runLint = createActionlint(
    /** @type {WasmLoader} */ async (go) => {
      return WebAssembly.instantiate(await readFile(url), go.importObject);
    }
  ));
};
