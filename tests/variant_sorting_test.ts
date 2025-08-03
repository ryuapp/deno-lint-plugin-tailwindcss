import { assertEquals } from "@std/assert";
import plugin from "../src/mod.ts";
import { runLintPluginFromFile } from "./test-utils.ts";

Deno.test("Variant sorting - unsorted classes should trigger error", async () => {
  const diagnostics = await runLintPluginFromFile(
    plugin,
    "variant-sorting-test.tsx",
  );

  // Should report sorting error
  const hasSortError = diagnostics.some((d) =>
    d.message.includes("should be sorted")
  );
  assertEquals(
    hasSortError,
    true,
    "Should report sorting error for unsorted variant classes",
  );

  // Check that the fix has correct order
  const sortDiagnostic = diagnostics.find((d) =>
    d.message.includes("should be sorted")
  );
  if (sortDiagnostic && sortDiagnostic.hint) {
    const containsCorrectOrder = sortDiagnostic.hint.includes(
      "dark:flex dark:bg-black dark:text-center",
    );
    assertEquals(
      containsCorrectOrder,
      true,
      "Fix should have correct variant class order",
    );
  }
});

Deno.test("Variant sorting - sorted classes should have no errors", async () => {
  const diagnostics = await runLintPluginFromFile(
    plugin,
    "variant-sorting-test-sorted.tsx",
  );

  // Should not report any errors for correctly sorted variant classes
  assertEquals(
    diagnostics.length,
    0,
    "Correctly sorted variant classes should have no errors",
  );
});
