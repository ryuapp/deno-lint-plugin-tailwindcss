import { assertEquals } from "@std/assert";
import plugin from "../src/mod.ts";
import { runLintPluginFromFile } from "./test-utils.ts";

Deno.test("Template literal with multiline expressions - support for multiline template literals", async () => {
  const diagnostics = await runLintPluginFromFile(
    plugin,
    "template-literal-multiline.tsx",
  );

  // This template literal has proper formatting, should not report whitespace errors
  const hasWhitespaceError = diagnostics.some((d) =>
    d.message.includes("contain extra whitespace")
  );

  assertEquals(hasWhitespaceError, false);

  // Should have no errors
  assertEquals(diagnostics.length, 0);
});

Deno.test("Template literal preserves trailing space before expression", async () => {
  const diagnostics = await runLintPluginFromFile(
    plugin,
    "template-literal-preserve-trailing-space.tsx",
  );

  // This template literal is already sorted, should have no errors
  assertEquals(diagnostics.length, 0);
});
