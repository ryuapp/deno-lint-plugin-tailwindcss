import { assertEquals } from "@std/assert";
import plugin from "../src/mod.ts";
import { runLintPluginFromFile } from "./test-utils.ts";

Deno.test("detects duplicate classes in test file", async () => {
  const diagnostics = await runLintPluginFromFile(
    plugin,
    "duplicate-classes.tsx",
  );

  const duplicateErrors = diagnostics.filter((d) =>
    d.message.includes("Duplicate TailwindCSS class")
  );

  // Should detect exactly 3 individual duplicate classes
  assertEquals(duplicateErrors.length, 3);

  // Check for flex duplicate
  const flexError = duplicateErrors.find((d) => d.message.includes('"flex"'));
  assertEquals(flexError !== undefined, true);

  // Check for p-4 duplicate
  const p4Error = duplicateErrors.find((d) => d.message.includes('"p-4"'));
  assertEquals(p4Error !== undefined, true);

  // Check for bg-blue-500 duplicate
  const bgError = duplicateErrors.find((d) =>
    d.message.includes('"bg-blue-500"')
  );
  assertEquals(bgError !== undefined, true);
});
