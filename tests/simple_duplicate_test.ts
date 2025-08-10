import { assertEquals } from "@std/assert";
import plugin from "../src/mod.ts";
import { runLintPlugin } from "./test-utils.ts";

Deno.test("individual duplicate detection works", () => {
  const code = `<div className="flex p-4 flex items-center p-4" />`;
  const diagnostics = runLintPlugin(plugin, code);

  const duplicateErrors = diagnostics.filter((d) =>
    d.message.includes("Duplicate TailwindCSS class")
  );

  // Should have 2 individual errors
  assertEquals(duplicateErrors.length, 2);

  // Both should be individual class errors
  assertEquals(duplicateErrors[0].message.includes('"'), true);
  assertEquals(duplicateErrors[1].message.includes('"'), true);
});

Deno.test("no duplicates means no errors", () => {
  const code = `<div className="flex items-center p-4" />`;
  const diagnostics = runLintPlugin(plugin, code);

  const duplicateErrors = diagnostics.filter((d) =>
    d.message.includes("Duplicate TailwindCSS class")
  );

  assertEquals(duplicateErrors.length, 0);
});
