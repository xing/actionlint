export type RunActionlint = (
  source: string,
  path: string
) => Promise<LintResult[]>;
export type LintResult = {
  Message: string;
  Filepath: string;
  Line: number;
  Column: number;
  Kind: string;
};
export function createLinter(url?: URL): RunActionlint;
