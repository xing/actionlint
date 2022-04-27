require("./tiny_wasm_exec.js");

/**
 * @typedef {(go: Go) => Promise<WebAssembly.WebAssemblyInstantiatedSource>} WasmLoader
 * @typedef {import("./types").RunActionlint} RunActionlint
 * @typedef {import("./types").LintResult} LintResult
 */

/**
 * @param {WasmLoader} loader
 * @returns {Promise<RunActionlint>}
 */
module.exports.createActionlint = async function createActionlint(loader) {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const go = new Go();

  const wasm = await loader(go);
  // Do not await this promise, because it only resolves once the go main()
  // function has exited. But we need the main function to stay alive to be
  // able to call the `runActionlint` function.
  go.run(wasm.instance);

  const { memory, WasmAlloc, WasmFree, RunActionlint } = wasm.instance.exports;

  if (
    !(memory instanceof WebAssembly.Memory) ||
    !(WasmAlloc instanceof Function) ||
    !(WasmFree instanceof Function) ||
    !(RunActionlint instanceof Function)
  ) {
    throw new Error(
      "Invalid wasm exports. Expected memory, WasmAlloc, WasmFree, RunActionlint."
    );
  }

  /**
   * @param {string} input
   * @param {string} path
   * @returns {LintResult[]}
   */
  return function runLint(input, path) {
    const workflow = encoder.encode(input);
    const filePath = encoder.encode(path);

    const workflowPointer = WasmAlloc(workflow.byteLength);
    new Uint8Array(memory.buffer).set(workflow, workflowPointer);

    const filePathPointer = WasmAlloc(filePath.byteLength);
    new Uint8Array(memory.buffer).set(filePath, filePathPointer);

    const resultPointer = RunActionlint(
      workflowPointer,
      workflow.byteLength,
      workflow.byteLength,
      filePathPointer,
      filePath.byteLength,
      filePath.byteLength
    );

    WasmFree(workflowPointer);
    WasmFree(filePathPointer);

    const result = new Uint8Array(memory.buffer).subarray(resultPointer);
    const end = result.indexOf(0);

    const string = decoder.decode(result.subarray(0, end));

    try {
      return JSON.parse(string);
    } catch {
      throw new Error(string);
    }
  };
};
