const { join } = require("path");
const { pathToFileURL } = require("url");
const { readFile } = require("node:fs/promises");
const { createActionlint } = require("./actionlint.cjs");

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
