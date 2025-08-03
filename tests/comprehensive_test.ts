import { assertEquals } from "@std/assert";
import plugin from "../src/mod.ts";
import { runLintPluginFromFile } from "./test-utils.ts";

// Test all edge cases and code paths

Deno.test("Template literal with unsorted classes", async () => {
  const diagnostics = await runLintPluginFromFile(
    plugin,
    "template-literal.tsx",
  );
  assertEquals(diagnostics.length >= 1, true);
  const hasTemplateError = diagnostics.some((d) =>
    d.message.includes("template") || d.message.includes("should be sorted")
  );
  assertEquals(hasTemplateError, true);
});

Deno.test("clsx array format", async () => {
  const diagnostics = await runLintPluginFromFile(plugin, "clsx-array.tsx");
  assertEquals(diagnostics.length >= 1, true);
  const hasArrayError = diagnostics.some((d) =>
    d.message.includes("array") || d.message.includes("should be sorted")
  );
  assertEquals(hasArrayError, true);
});

Deno.test("cn function support", async () => {
  const diagnostics = await runLintPluginFromFile(plugin, "cn-function.tsx");
  assertEquals(diagnostics.length >= 1, true);
  const hasCnError = diagnostics.some((d) =>
    d.message.includes("cn()") || d.message.includes("should be sorted")
  );
  assertEquals(hasCnError, true);
});

Deno.test("Edge cases - empty and single classes", async () => {
  const diagnostics = await runLintPluginFromFile(plugin, "edge-cases.tsx");
  // Edge cases should not crash, may or may not have errors
  assertEquals(diagnostics.length === 0, true);
});

Deno.test("Tab and newline characters", async () => {
  const diagnostics = await runLintPluginFromFile(plugin, "tabs-newlines.tsx");
  assertEquals(diagnostics.length >= 1, true);
  const hasWhitespaceError = diagnostics.some((d) =>
    d.message.includes("contain extra whitespace")
  );
  assertEquals(hasWhitespaceError, true);
});

// Test different function names
Deno.test("classNames function", async () => {
  const diagnostics = await runLintPluginFromFile(plugin, "classnames.tsx");
  assertEquals(diagnostics.length >= 1, true);
  const hasClassNamesError = diagnostics.some((d) =>
    d.message.includes("classNames()") || d.message.includes("should be sorted")
  );
  assertEquals(hasClassNamesError, true);
});

Deno.test("classList function", async () => {
  const diagnostics = await runLintPluginFromFile(plugin, "classlist.tsx");
  assertEquals(diagnostics.length >= 1, true);
  const hasClassListError = diagnostics.some((d) =>
    d.message.includes("classList()") || d.message.includes("should be sorted")
  );
  assertEquals(hasClassListError, true);
});

// Test JSX attribute variations
Deno.test("class attribute (not className)", async () => {
  const diagnostics = await runLintPluginFromFile(plugin, "class-attr.tsx");
  assertEquals(diagnostics.length >= 1, true);
  const hasClassError = diagnostics.some((d) =>
    d.message.includes("class attribute") ||
    d.message.includes("should be sorted")
  );
  assertEquals(hasClassError, true);
});

// Test object property edge cases
Deno.test("Object property with non-literal key", async () => {
  const diagnostics = await runLintPluginFromFile(
    plugin,
    "object-non-literal.tsx",
  );
  // Should not crash with computed property
  assertEquals(diagnostics.length === 0, true);
});

// Test array with non-literal elements
Deno.test("Array with non-literal elements", async () => {
  const diagnostics = await runLintPluginFromFile(
    plugin,
    "array-non-literal.tsx",
  );
  // Should not crash, may detect literal string "text-white"
  assertEquals(diagnostics.length === 0, true);
});

// Test JSX expression with non-template literal
Deno.test("JSX expression with non-template literal", async () => {
  const diagnostics = await runLintPluginFromFile(
    plugin,
    "jsx-non-template.tsx",
  );
  // Variable checking has been removed - should have no errors
  assertEquals(diagnostics.length, 0);
});

// Test CallExpression with non-Identifier callee
Deno.test("CallExpression with non-Identifier callee", async () => {
  const diagnostics = await runLintPluginFromFile(
    plugin,
    "call-non-identifier.tsx",
  );
  // Should not crash with member expression callee
  assertEquals(diagnostics.length === 0, true);
});

// Test variable declarator with non-Identifier id
Deno.test("Variable declarator with destructuring", async () => {
  const diagnostics = await runLintPluginFromFile(plugin, "destructuring.tsx");
  // Should not crash with destructuring pattern
  assertEquals(diagnostics.length === 0, true);
});

// Test variable with non-class/style name
Deno.test("Variable with non-class/style name", async () => {
  const diagnostics = await runLintPluginFromFile(plugin, "var-non-class.tsx");
  // Should not trigger variable handler for non-class/style named variables
  assertEquals(diagnostics.length, 0);
});

// Test JSX attribute with no value
Deno.test("JSX attribute with no value", async () => {
  const diagnostics = await runLintPluginFromFile(plugin, "attr-no-value.tsx");
  // Should not crash with missing attribute value
  assertEquals(diagnostics.length, 0);
});

// Test variable declarator with no init
Deno.test("Variable declarator with no init", async () => {
  const diagnostics = await runLintPluginFromFile(plugin, "var-no-init.tsx");
  // Should not crash with variable declaration without initializer
  assertEquals(diagnostics.length, 0);
});

// Test non-string literal in variable
Deno.test("Variable with non-string literal", async () => {
  const diagnostics = await runLintPluginFromFile(plugin, "var-non-string.tsx");
  // Should not crash with non-string literal
  assertEquals(diagnostics.length, 0);
});

// Test JSX attribute name that's not class or className
Deno.test("JSX attribute not class or className", async () => {
  const diagnostics = await runLintPluginFromFile(plugin, "attr-other.tsx");
  // Should not trigger on non-class attributes
  assertEquals(diagnostics.length, 0);
});

// Test function call with unknown function name
Deno.test("Unknown function call", async () => {
  const diagnostics = await runLintPluginFromFile(
    plugin,
    "unknown-function.tsx",
  );
  // Should not trigger on unknown function names
  assertEquals(diagnostics.length, 0);
});
