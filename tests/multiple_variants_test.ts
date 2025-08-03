import { assertEquals } from "@std/assert";
import plugin from "../src/mod.ts";
import { runLintPluginFromFile } from "./test-utils.ts";

Deno.test("Multiple variants - already sorted", async () => {
  const diagnostics = await runLintPluginFromFile(plugin, "multiple-variants-sorted.tsx");
  // Classes should already be sorted according to Tailwind layer order
  assertEquals(diagnostics.length, 0);
});

Deno.test("Multiple variants - needs sorting", async () => {
  const diagnostics = await runLintPluginFromFile(plugin, "multiple-variants-unsorted.tsx");
  // Should detect that classes need to be sorted
  assertEquals(diagnostics.length >= 1, true);
  
  const hasSortError = diagnostics.some((d) =>
    d.message.includes("should be sorted")
  );
  assertEquals(hasSortError, true);
});