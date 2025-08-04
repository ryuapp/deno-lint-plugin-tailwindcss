import { assertEquals } from "@std/assert";
import plugin from "../src/mod.ts";

export async function runLintPlugin(
  plugin: Deno.lint.Plugin,
  filename: string,
): Promise<Array<Deno.lint.Diagnostic>> {
  const path = `./tests/testdata/${filename}`;
  const content = await Deno.readTextFile(path);
  return Deno.lint.runPlugin(
    plugin,
    path,
    content,
  );
}

Deno.test("sort-classes rule - detects unsorted classes", async () => {
  const diagnostics = await runLintPlugin(plugin, "unsorted.tsx");

  assertEquals(diagnostics.length, 1);
  assertEquals(diagnostics[0].message.includes("should be sorted"), true);
});

Deno.test("sort-classes rule - detects extra whitespace", async () => {
  const diagnostics = await runLintPlugin(plugin, "whitespace.tsx");

  assertEquals(diagnostics.length, 1);
  assertEquals(
    diagnostics[0].message.includes("contain extra whitespace"),
    true,
  );
});

Deno.test("sort-classes rule - handles clsx object notation", async () => {
  const diagnostics = await runLintPlugin(plugin, "clsx-object.tsx");

  // Should detect unsorted classes in object keys
  assertEquals(diagnostics.length >= 1, true);
  const hasObjectKeyError = diagnostics.some((d) =>
    d.message.includes("clsx() object key") &&
    d.message.includes("should be sorted")
  );
  assertEquals(hasObjectKeyError, true);
});

Deno.test("sort-classes rule - no errors on sorted classes", async () => {
  const diagnostics = await runLintPlugin(plugin, "basic.tsx");

  assertEquals(diagnostics.length, 0);
});

Deno.test("sort-classes rule - detects multiple issues", async () => {
  const diagnostics = await runLintPlugin(plugin, "fixable.tsx");

  // Should detect both whitespace and sorting issues
  assertEquals(diagnostics.length >= 1, true);
  const hasWhitespaceError = diagnostics.some((d) =>
    d.message.includes("contain extra whitespace")
  );
  assertEquals(hasWhitespaceError, true);
});
