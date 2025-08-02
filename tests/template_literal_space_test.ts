import { assertEquals } from "@std/assert";
import plugin from "../src/mod.ts";
import { runLintPluginFromFile } from "./test-utils.ts";

Deno.test("Template literal preserves necessary spaces", async () => {
  const diagnostics = await runLintPluginFromFile(
    plugin,
    "template-literal-space-preservation.tsx",
  );

  // Should not report whitespace errors for properly spaced template literals
  const hasWhitespaceError = diagnostics.some((d) =>
    d.message.includes("contain extra whitespace")
  );
  assertEquals(
    hasWhitespaceError,
    false,
    "Should not report whitespace errors for proper spacing in template literals",
  );

  // Should not report any errors for this case
  assertEquals(
    diagnostics.length,
    0,
    "Template literal with proper spacing should have no errors",
  );
});

Deno.test("Template literal with multiple expressions", async () => {
  const diagnostics = await runLintPluginFromFile(
    plugin,
    "template-literal-multiple-expressions.tsx",
  );

  // Should not report whitespace errors for template literals with multiple expressions
  const hasWhitespaceError = diagnostics.some((d) =>
    d.message.includes("contain extra whitespace")
  );
  assertEquals(
    hasWhitespaceError,
    false,
    "Should not report whitespace errors for template literals with multiple expressions",
  );

  assertEquals(
    diagnostics.length,
    0,
    "Template literal with multiple expressions should have no errors",
  );
});

Deno.test("Template literal with extra spaces should be fixed", async () => {
  const diagnostics = await runLintPluginFromFile(
    plugin,
    "template-literal-extra-spaces.tsx",
  );

  // Should report whitespace errors for template literals with actual extra spaces
  const hasWhitespaceError = diagnostics.some((d) =>
    d.message.includes("contain extra whitespace")
  );
  assertEquals(
    hasWhitespaceError,
    true,
    "Should report whitespace errors for template literals with extra spaces",
  );

  // Should have at least one error
  assertEquals(
    diagnostics.length >= 1,
    true,
    "Template literal with extra spaces should have errors",
  );
});

Deno.test("Template literal without original space should stay as-is", async () => {
  const diagnostics = await runLintPluginFromFile(
    plugin,
    "template-literal-no-original-space.tsx",
  );

  // Should not report whitespace errors when there was no original space
  const hasWhitespaceError = diagnostics.some((d) =>
    d.message.includes("contain extra whitespace")
  );
  assertEquals(
    hasWhitespaceError,
    false,
    "Should not report whitespace errors when there was no original space",
  );

  // Should not report any errors for this case
  assertEquals(
    diagnostics.length,
    0,
    "Template literal without original space should have no errors",
  );
});
