import { assertEquals } from "@std/assert";
import plugin from "../src/mod.ts";
import { runLintPluginFromFile } from "./test-utils.ts";

Deno.test("Multiline template spacing - preserves space before expression", async () => {
  const diagnostics = await runLintPluginFromFile(
    plugin,
    "multiline-template-spacing.tsx",
  );

  // Should have no errors - the template literal should preserve spacing correctly
  assertEquals(
    diagnostics.length,
    0,
    "Multiline template literal should preserve spacing and not report errors",
  );
});

Deno.test("Multiline template spacing - preserves leading space in fix", async () => {
  const diagnostics = await runLintPluginFromFile(
    plugin,
    "multiline-template-spacing-unsorted.tsx",
  );

  // Should have one error for unsorted classes
  assertEquals(
    diagnostics.length,
    1,
    "Should detect unsorted classes in multiline template literal",
  );

  // Check that the fix preserves the leading space
  const diagnostic = diagnostics[0];
  if (diagnostic.fix && diagnostic.fix.length > 0) {
    const fixText = diagnostic.fix[0].text;
    if (fixText) {
      assertEquals(
        fixText.startsWith(" "),
        true,
        "Fix should preserve leading space before classes",
      );
      assertEquals(
        fixText,
        " flex items-end justify-between overflow-x-auto",
        "Fix should have correct order with preserved leading space",
      );
    }
  }
});
