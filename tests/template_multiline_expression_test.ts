import { assertEquals } from "@std/assert";
import plugin from "../src/mod.ts";
import { runLintPluginFromFile } from "./test-utils.ts";

Deno.test("Template with multiline expression - should not trigger errors", async () => {
  const diagnostics = await runLintPluginFromFile(
    plugin,
    "template-multiline-expression.tsx",
  );

  // Should not report any errors for template with multiline expressions
  assertEquals(
    diagnostics.length,
    0,
    "Template literals with multiline expressions should not be processed",
  );
});
