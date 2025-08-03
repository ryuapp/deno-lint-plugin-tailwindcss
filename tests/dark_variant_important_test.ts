import { assertEquals } from "@std/assert";
import plugin from "../src/mod.ts";
import { runLintPluginFromFile } from "./test-utils.ts";

Deno.test("Dark variant with important modifier - already sorted", async () => {
  const diagnostics = await runLintPluginFromFile(
    plugin,
    "dark-variant-important.tsx",
  );
  // Classes should already be sorted: text-black comes before dark:!text-white
  assertEquals(diagnostics.length, 0);
});

Deno.test("Dark variant with important modifier - needs sorting", async () => {
  const diagnostics = await runLintPluginFromFile(
    plugin,
    "dark-variant-important-unsorted.tsx",
  );
  // Should detect that dark:!text-white text-black needs to be sorted
  assertEquals(diagnostics.length >= 1, true);

  const hasSortError = diagnostics.some((d) =>
    d.message.includes("should be sorted") &&
    d.hint?.includes("text-black dark:!text-white")
  );
  assertEquals(hasSortError, true);
});
