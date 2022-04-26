const { join } = require("node:path");
const { pathToFileURL } = require("node:url");
const { readFile } = require("node:fs/promises");
const { createActionlint } = require("./actionlint.cjs");

/**
 * @typedef {(go: Go) => Promise<WebAssembly.WebAssemblyInstantiatedSource>} WasmLoader
 * @typedef {import("./types").RunActionlint} RunActionlint
 * @typedef {import("./types").LintResult} LintResult
 */

/**
 * @param {URL} url
 * @returns {Promise<RunActionlint>}
 */
module.exports.createLinter = async function createLinter(
  url = pathToFileURL(join(__dirname, "main.wasm"))
) {
  return await createActionlint(
    /** @type {WasmLoader} */ async (go) => {
      return WebAssembly.instantiate(await readFile(url), go.importObject);
    }
  );
};
