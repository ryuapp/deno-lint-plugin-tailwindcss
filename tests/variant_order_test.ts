import { assertEquals } from "@std/assert";
import plugin from "../src/mod.ts";
import { runLintPluginFromFile } from "./test-utils.ts";

Deno.test("Variant order - classes are properly sorted", async () => {
  const diagnostics = await runLintPluginFromFile(
    plugin,
    "variant-order.tsx",
  );

  // Should have no errors since classes are already sorted
  assertEquals(
    diagnostics.length,
    0,
    "Properly sorted variant order classes should have no errors",
  );
});
