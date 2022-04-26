import { readFile } from "node:fs/promises";
import test from "tape";
import { createLinter } from "./node.cjs";

test("actionlint no errors", async (t) => {
  t.plan(1);

  const linter = await createLinter();

  const content = await readFile("./.github/workflows/push.yml", "utf8");
  const result = linter(content, "./.github/workflows/push.yml");

  t.equal(result.length, 0, "no errors");

  t.end();
});

test("actionlint errors", async (t) => {
  t.plan(3);

  const linter = await createLinter();

  const result = linter("on: psuh", "broken.yml");

  t.equal(result.length, 2, "2 errors");

  t.deepEqual(result[0], {
    file: "broken.yml",
    line: 1,
    column: 1,
    message: '"jobs" section is missing in workflow',
    kind: "syntax-check",
  });

  t.deepEqual(result[1], {
    file: "broken.yml",
    line: 1,
    column: 5,
    message:
      'unknown Webhook event "psuh". see https://docs.github.com/en/actions/learn-github-actions/events-that-trigger-workflows#webhook-events for list of all Webhook event names',
    kind: "events",
  });

  t.end();
});
