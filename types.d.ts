export type RunActionlint = (input: string, path: string) => LintResult[];

export type LintResult = {
  file: string;
  line: number;
  column: number;
  message: string;
  kind: string;
};

export function createLinter(url?: URL): Promise<RunActionlint>;
