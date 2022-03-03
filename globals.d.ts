export declare global {
  var runActionlint:
    | ((src: string, path: string) => [LintResult[], Error | null])
    | undefined;
  var actionlintInitialized: (() => void) | undefined;
}
