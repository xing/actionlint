require("./wasm_exec.js");

/**
 * @typedef {(go: Go) => Promise<WebAssembly.WebAssemblyInstantiatedSource>} WasmLoader
 * @typedef {import("./types").RunActionlint} RunActionlint
 * @typedef {import("./types").LintResult} LintResult
 */

/**
 * @param {WasmLoader} loader
 * @returns {RunActionlint}
 */
module.exports.createActionlint = function createActionlint(loader) {
  const go = new Go();

  /** @type {(() => void)[] | undefined} */
  let queued = undefined;

  // This function gets called from go once the wasm module is ready and it
  // executes the linter for all queued calls.
  globalThis.actionlintInitialized = () => {
    queued?.forEach((f) => f());
    queued = globalThis.actionlintInitialized = undefined;
  };

  loader(go).then((wasm) => {
    // Do not await this promise, because it only resolves once the go main()
    // function has exited. But we need the main function to stay alive to be
    // able to call the `runActionlint` function.
    go.run(wasm.instance);
  });

  /**
   * @param {string} src
   * @param {string} path
   * @returns {Promise<LintResult[]>}
   */
  return async function runLint(src, path) {
    // Return a promise, because we need to queue calls to `runLint()` while the
    // wasm module is still loading and execute them once the wasm module is
    //ready.
    return new Promise((resolve, reject) => {
      if (typeof runActionlint === "function") {
        const [result, err] = runActionlint(src, path);
        return err ? reject(err) : resolve(result);
      }

      if (!queued) {
        queued = [];
      }

      queued.push(() => {
        const [result, err] = runActionlint?.(src, path) ?? [
          [],
          new Error('"runActionlint" is not defined'),
        ];
        return err ? reject(err) : resolve(result);
      });
    });
  };
};
