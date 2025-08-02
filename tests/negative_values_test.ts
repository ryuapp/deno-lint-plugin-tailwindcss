import { assertEquals } from "@std/assert";
import plugin from "../src/mod.ts";
import { runLintPluginFromFile } from "./test-utils.ts";

Deno.test("Negative values - classes are properly sorted", async () => {
  const diagnostics = await runLintPluginFromFile(
    plugin,
    "negative-values.tsx",
  );

  // Should have no errors since classes are already sorted
  assertEquals(
    diagnostics.length,
    0,
    "Properly sorted negative value classes should have no errors",
  );
});
