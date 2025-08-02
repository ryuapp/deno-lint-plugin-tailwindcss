import { assertEquals } from "@std/assert";
import plugin from "../src/mod.ts";
import { runLintPluginFromFile } from "./test-utils.ts";

Deno.test("Important modifier preserves ! prefix (sorted)", async () => {
  const diagnostics = await runLintPluginFromFile(
    plugin,
    "important-modifier.tsx",
  );

  // Should not report any errors for correctly sorted classes with ! prefix
  assertEquals(
    diagnostics.length,
    0,
    "Correctly sorted classes with ! prefix should have no errors",
  );
});

Deno.test("Important modifier sorting preserves ! prefix", async () => {
  const diagnostics = await runLintPluginFromFile(
    plugin,
    "important-modifier-unsorted.tsx",
  );

  // Should report sorting error
  const hasSortError = diagnostics.some((d) =>
    d.message.includes("should be sorted")
  );
  assertEquals(
    hasSortError,
    true,
    "Should report sorting error for unsorted classes with ! prefix",
  );

  // Check that the fix preserves the ! prefix
  const sortDiagnostic = diagnostics.find((d) =>
    d.message.includes("should be sorted")
  );
  if (sortDiagnostic && sortDiagnostic.hint) {
    const shouldContainImportant = sortDiagnostic.hint.includes(
      "!text-red-500",
    );
    assertEquals(
      shouldContainImportant,
      true,
      "Fix should preserve ! prefix in sorted classes",
    );
  }
});

Deno.test("Important modifier in template literal", async () => {
  const diagnostics = await runLintPluginFromFile(
    plugin,
    "important-modifier-template.tsx",
  );

  // Should not report any errors for template literals with ! prefix
  assertEquals(
    diagnostics.length,
    0,
    "Template literals with ! prefix should have no errors",
  );
});

Deno.test("Mixed important modifiers", async () => {
  const diagnostics = await runLintPluginFromFile(
    plugin,
    "important-modifier-mixed.tsx",
  );

  // Should report sorting error for mixed important and non-important classes
  const hasSortError = diagnostics.some((d) =>
    d.message.includes("should be sorted")
  );
  assertEquals(
    hasSortError,
    true,
    "Should report sorting error for mixed important modifiers",
  );

  // Check that the fix preserves all ! prefixes
  const sortDiagnostic = diagnostics.find((d) =>
    d.message.includes("should be sorted")
  );
  if (sortDiagnostic && sortDiagnostic.hint) {
    const containsImportantBg = sortDiagnostic.hint.includes("!bg-red-500");
    const containsImportantP = sortDiagnostic.hint.includes("!p-4");
    assertEquals(containsImportantBg, true, "Fix should preserve !bg-red-500");
    assertEquals(containsImportantP, true, "Fix should preserve !p-4");
  }
});

Deno.test("Important modifier with variants", async () => {
  const diagnostics = await runLintPluginFromFile(
    plugin,
    "important-modifier-variants.tsx",
  );

  // Should not report any errors for correctly sorted important variants
  assertEquals(
    diagnostics.length,
    0,
    "Important modifiers with variants should have no errors",
  );
});
