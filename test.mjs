import { readFile } from "node:fs/promises";
import test from "tape";
import { createLinter } from "./node.cjs";

test("actionlint no errors", async (t) => {
  t.plan(1);

  const linter = createLinter();

  const content = await readFile("./.github/workflows/push.yml", "utf8");
  const result = await linter(content, "./.github/workflows/push.yml");

  t.equal(result.length, 0, "no errors");

  t.end();
});

test("actionlint errors", async (t) => {
  t.plan(1);

  const linter = createLinter();

  const result = await linter("on: psuh", "broken.yml");

  t.equal(result.length, 2, "2 errors");

  t.end();
});
