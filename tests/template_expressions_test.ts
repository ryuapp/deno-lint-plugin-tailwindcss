import { assertEquals } from "@std/assert";
import plugin from "../src/mod.ts";
import { runLintPluginFromFile } from "./test-utils.ts";

Deno.test("Template with expressions - should not trigger errors", async () => {
  const diagnostics = await runLintPluginFromFile(
    plugin,
    "template-with-expressions.tsx",
  );

  // Should not report any errors for template with expressions
  assertEquals(diagnostics.length, 0);
});
