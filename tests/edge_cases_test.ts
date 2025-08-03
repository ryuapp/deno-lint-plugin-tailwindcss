import { assertEquals } from "@std/assert";
import plugin from "../src/mod.ts";
import { runLintPluginFromFile } from "./test-utils.ts";

// Test edge cases to reach 100% coverage

Deno.test("JSX attribute name null", async () => {
  const diagnostics = await runLintPluginFromFile(plugin, "jsx-attr-null.tsx");
  assertEquals(diagnostics.length, 0);
});

Deno.test("Template literal with fix", async () => {
  const diagnostics = await runLintPluginFromFile(
    plugin,
    "template-literal-fix.tsx",
  );
  assertEquals(diagnostics.length >= 1, true);

  // Test that fix works for template literal
  const hasFix = diagnostics.some((d) => d.fix !== undefined);
  assertEquals(hasFix, true);
});

Deno.test("Literal with fix", async () => {
  const diagnostics = await runLintPluginFromFile(plugin, "literal-fix.tsx");
  assertEquals(diagnostics.length >= 1, true);

  // Test that fix works for literal
  const hasFix = diagnostics.some((d) => d.fix !== undefined);
  assertEquals(hasFix, true);
});

Deno.test("Single class - no error", async () => {
  const diagnostics = await runLintPluginFromFile(plugin, "single-class.tsx");
  assertEquals(diagnostics.length, 0);
});

Deno.test("Empty classes - no error", async () => {
  const diagnostics = await runLintPluginFromFile(plugin, "empty-classes.tsx");
  assertEquals(diagnostics.length, 0);
});

Deno.test("Non-literal JSX expression value", async () => {
  const diagnostics = await runLintPluginFromFile(
    plugin,
    "non-literal-jsx.tsx",
  );
  assertEquals(diagnostics.length, 0);
});

Deno.test("CallExpression with unknown arg type", async () => {
  const diagnostics = await runLintPluginFromFile(
    plugin,
    "clsx-unknown-arg.tsx",
  );
  // Should not crash with unknown argument type
  assertEquals(diagnostics.length === 0, true);
});

Deno.test("Array with only literal elements (sorted)", async () => {
  const diagnostics = await runLintPluginFromFile(plugin, "array-sorted.tsx");
  // Should be properly sorted, no errors
  assertEquals(diagnostics.length, 0);
});

Deno.test("Object property with literal key - whitespace", async () => {
  const diagnostics = await runLintPluginFromFile(
    plugin,
    "clsx-object-whitespace.tsx",
  );
  assertEquals(diagnostics.length >= 1, true);
  const hasWhitespaceError = diagnostics.some((d) =>
    d.message.includes("contain extra whitespace")
  );
  assertEquals(hasWhitespaceError, true);
});

Deno.test("Array element with whitespace", async () => {
  const diagnostics = await runLintPluginFromFile(
    plugin,
    "array-element-whitespace.tsx",
  );
  assertEquals(diagnostics.length >= 1, true);
});

Deno.test("Non-literal value in variable", async () => {
  const diagnostics = await runLintPluginFromFile(
    plugin,
    "var-non-literal.tsx",
  );
  assertEquals(diagnostics.length, 0);
});

Deno.test("Template element with fix", async () => {
  const diagnostics = await runLintPluginFromFile(
    plugin,
    "template-element-fix.tsx",
  );
  assertEquals(diagnostics.length >= 1, true);

  // Should have fix for template element
  const hasFix = diagnostics.some((d) => d.fix !== undefined);
  assertEquals(hasFix, true);
});

Deno.test("Property not Property type", async () => {
  const diagnostics = await runLintPluginFromFile(plugin, "clsx-spread.tsx");
  // Should not crash with spread properties
  assertEquals(diagnostics.length === 0, true);
});

Deno.test("Array element not Literal type", async () => {
  const diagnostics = await runLintPluginFromFile(plugin, "array-dynamic.tsx");
  // Should not crash with non-literal array elements
  assertEquals(diagnostics.length === 0, true);
});

Deno.test("Single class in array - no sort error", async () => {
  const diagnostics = await runLintPluginFromFile(plugin, "single-array.tsx");
  // Single class arrays should not trigger sort errors
  assertEquals(diagnostics.length, 0);
});

Deno.test("Empty array - no errors", async () => {
  const diagnostics = await runLintPluginFromFile(plugin, "empty-array.tsx");
  assertEquals(diagnostics.length, 0);
});

Deno.test("Classes already sorted but with whitespace", async () => {
  const diagnostics = await runLintPluginFromFile(
    plugin,
    "sorted-with-whitespace.tsx",
  );
  // Should detect whitespace even if classes are sorted
  assertEquals(diagnostics.length >= 1, true);
  const hasWhitespaceError = diagnostics.some((d) =>
    d.message.includes("contain extra whitespace")
  );
  assertEquals(hasWhitespaceError, true);
});

// Additional tests to achieve 100% coverage for mod.ts

Deno.test("clsx with template literal", async () => {
  const diagnostics = await runLintPluginFromFile(
    plugin,
    "clsx-template-literal.tsx",
  );
  assertEquals(diagnostics.length >= 1, true);
  const hasError = diagnostics.some((d) =>
    d.message.includes("template") || d.message.includes("should be sorted")
  );
  assertEquals(hasError, true);
});

Deno.test("JSX template literal with variables", async () => {
  const diagnostics = await runLintPluginFromFile(
    plugin,
    "jsx-template-quasis.tsx",
  );
  // Should handle template literals with variables
  assertEquals(diagnostics.length >= 1, true);
});

Deno.test("clsx object with property", async () => {
  const diagnostics = await runLintPluginFromFile(
    plugin,
    "clsx-object-property.tsx",
  );
  assertEquals(diagnostics.length >= 1, true);
  const hasObjectError = diagnostics.some((d) =>
    d.message.includes("object key") || d.message.includes("should be sorted")
  );
  assertEquals(hasObjectError, true);
});

Deno.test("clsx array with elements", async () => {
  const diagnostics = await runLintPluginFromFile(
    plugin,
    "clsx-array-elements.tsx",
  );
  assertEquals(diagnostics.length >= 1, true);
  const hasArrayError = diagnostics.some((d) =>
    d.message.includes("array") || d.message.includes("should be sorted")
  );
  assertEquals(hasArrayError, true);
});

Deno.test("Fix returns empty array for edge case", async () => {
  const diagnostics = await runLintPluginFromFile(
    plugin,
    "fix-returns-empty.tsx",
  );
  assertEquals(diagnostics.length >= 1, true);
  const hasWhitespaceError = diagnostics.some((d) =>
    d.message.includes("contain extra whitespace")
  );
  assertEquals(hasWhitespaceError, true);
});

Deno.test("Sort classes exact pattern match", async () => {
  const diagnostics = await runLintPluginFromFile(
    plugin,
    "sort-classes-exact-match.tsx",
  );
  // Should handle exact pattern matches in sort_classes.ts
  assertEquals(diagnostics.length === 0, true);
});

Deno.test("Fix returns empty array for literal edge case", async () => {
  const diagnostics = await runLintPluginFromFile(
    plugin,
    "fix-returns-empty-literal.tsx",
  );
  assertEquals(diagnostics.length >= 1, true);
  const hasWhitespaceError = diagnostics.some((d) =>
    d.message.includes("contain extra whitespace")
  );
  assertEquals(hasWhitespaceError, true);
});

Deno.test("JSX template literal with quasis loop", async () => {
  const diagnostics = await runLintPluginFromFile(
    plugin,
    "jsx-template-with-quasis.tsx",
  );
  // Should handle template literals with quasis loop
  assertEquals(diagnostics.length >= 1, true);
});

Deno.test("Call expression with no arguments", async () => {
  const diagnostics = await runLintPluginFromFile(
    plugin,
    "call-no-arguments.tsx",
  );
  // Should handle call expressions with no arguments
  assertEquals(diagnostics.length === 0, true);
});

Deno.test("Object expression with no properties", async () => {
  const diagnostics = await runLintPluginFromFile(
    plugin,
    "object-no-properties.tsx",
  );
  // Should handle object expressions with no properties
  assertEquals(diagnostics.length === 0, true);
});

Deno.test("Array expression with no elements", async () => {
  const diagnostics = await runLintPluginFromFile(
    plugin,
    "array-no-elements.tsx",
  );
  // Should handle array expressions with no elements
  assertEquals(diagnostics.length === 0, true);
});

Deno.test("JSX expression container with non-template literal", async () => {
  const diagnostics = await runLintPluginFromFile(
    plugin,
    "jsx-expression-container.tsx",
  );
  // Should handle JSX expression containers that are not template literals
  assertEquals(diagnostics.length === 0, true);
});

Deno.test("Non-string literal value", async () => {
  const diagnostics = await runLintPluginFromFile(
    plugin,
    "non-string-literal-value.tsx",
  );
  // Should handle non-string literal values (like numbers)
  assertEquals(diagnostics.length === 0, true);
});

Deno.test("Object key with whitespace fix fallback", async () => {
  const diagnostics = await runLintPluginFromFile(
    plugin,
    "object-key-whitespace-fix.tsx",
  );
  // Should handle object keys with whitespace and test fix fallback path
  assertEquals(diagnostics.length >= 1, true);
  const hasWhitespaceError = diagnostics.some((d) =>
    d.message.includes("contain extra whitespace")
  );
  assertEquals(hasWhitespaceError, true);
});

Deno.test("Object key with unsorted classes fix fallback", async () => {
  const diagnostics = await runLintPluginFromFile(
    plugin,
    "object-key-unsorted-fix.tsx",
  );
  // Should handle object keys with unsorted classes and test fix fallback path
  assertEquals(diagnostics.length >= 1, true);
  const hasUnsortedError = diagnostics.some((d) =>
    d.message.includes("should be sorted")
  );
  assertEquals(hasUnsortedError, true);
});

Deno.test("JSX attribute that is not class or className", async () => {
  const diagnostics = await runLintPluginFromFile(
    plugin,
    "jsx-attribute-non-class.tsx",
  );
  // Should not trigger on non-class attributes like 'id'
  assertEquals(diagnostics.length, 0);
});
