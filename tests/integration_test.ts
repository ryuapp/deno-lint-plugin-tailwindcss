import { assertEquals } from "@std/assert";
import plugin from "../src/mod.ts";
import { runLintPluginFromFile } from "./test-utils.ts";

Deno.test("sort-classes rule - detects unsorted classes", async () => {
  const diagnostics = await runLintPluginFromFile(plugin, "unsorted.tsx");

  assertEquals(diagnostics.length, 1);
  assertEquals(diagnostics[0].message.includes("should be sorted"), true);
});

Deno.test("sort-classes rule - detects extra whitespace", async () => {
  const diagnostics = await runLintPluginFromFile(plugin, "whitespace.tsx");

  assertEquals(diagnostics.length, 1);
  assertEquals(
    diagnostics[0].message.includes("contain extra whitespace"),
    true,
  );
});

Deno.test("sort-classes rule - handles clsx object notation", async () => {
  const diagnostics = await runLintPluginFromFile(plugin, "clsx-object.tsx");

  // Should detect unsorted classes in object keys
  assertEquals(diagnostics.length >= 1, true);
  const hasObjectKeyError = diagnostics.some((d) =>
    d.message.includes("clsx() object key") &&
    d.message.includes("should be sorted")
  );
  assertEquals(hasObjectKeyError, true);
});

Deno.test("sort-classes rule - no errors on sorted classes", async () => {
  const diagnostics = await runLintPluginFromFile(plugin, "basic.tsx");

  assertEquals(diagnostics.length, 0);
});

Deno.test("sort-classes rule - detects multiple issues", async () => {
  const diagnostics = await runLintPluginFromFile(plugin, "fixable.tsx");

  // Should detect both whitespace and sorting issues
  assertEquals(diagnostics.length >= 1, true);
  const hasWhitespaceError = diagnostics.some((d) =>
    d.message.includes("contain extra whitespace")
  );
  assertEquals(hasWhitespaceError, true);
});
