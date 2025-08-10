import { assertEquals } from "@std/assert";
import { sortClassesRule } from "../src/rules/sort_classes.ts";
import { runLintPlugin } from "./test-utils.ts";

const plugin = {
  name: "test-plugin",
  rules: {
    "sort-classes": sortClassesRule,
  },
};

Deno.test("sort-classes preserves whitespace when no-unnecessary-whitespace is not active", () => {
  const testCases = [
    // Test regular string literals with extra spaces
    {
      input: `<div className="  p-4   bg-red-500  m-2  ">Content</div>`,
      expectedFix: "  m-2 bg-red-500 p-4  ",
      description:
        "should preserve leading and trailing spaces in string literal",
    },
    // Test template literal with spaces
    {
      input: `<div className={\`  p-4   bg-red-500  m-2  \`}>Content</div>`,
      expectedFix: " m-2 bg-red-500 p-4 ",
      description:
        "should preserve leading and trailing spaces in template literal",
    },
    // Test cn function with extra spaces
    {
      input: `cn("  p-4   bg-red-500  m-2  ")`,
      expectedFix: "  m-2 bg-red-500 p-4  ",
      description: "should preserve whitespace in cn function calls",
    },
  ];

  for (const testCase of testCases) {
    const diagnostics = runLintPlugin(plugin, testCase.input);

    // Should have sorting diagnostic
    assertEquals(
      diagnostics.length,
      1,
      `Expected 1 diagnostic for: ${testCase.description}`,
    );
    assertEquals(
      diagnostics[0].message,
      testCase.input.includes("cn(")
        ? "TailwindCSS classes in cn() argument attribute should be sorted"
        : "TailwindCSS classes in className attribute should be sorted",
    );

    // Check the fix text preserves whitespace
    const fixes = diagnostics[0].fix || [];
    assertEquals(
      fixes.length,
      1,
      `Expected 1 fix for: ${testCase.description}`,
    );

    const fixText = fixes[0].text;
    if (testCase.input.includes('className="')) {
      // For string literals, fix includes the quotes
      assertEquals(fixText, `"${testCase.expectedFix}"`, testCase.description);
    } else if (testCase.input.includes('cn("')) {
      // For cn function calls, fix includes the quotes
      assertEquals(fixText, `"${testCase.expectedFix}"`, testCase.description);
    } else {
      // For template literals or other contexts, just the text
      assertEquals(fixText, testCase.expectedFix, testCase.description);
    }
  }
});

Deno.test("sort-classes preserves template literal expression spacing", () => {
  const testCases = [
    // Template literal with leading space that should be preserved
    {
      input: `<div className={\` p-4 bg-red-500 m-2\`}>Content</div>`,
      expectedFixes: [" m-2 bg-red-500 p-4"],
      description: "should preserve leading space in template literal",
    },
    // Template literal with trailing space that should be preserved
    {
      input: `<div className={\`p-4 bg-red-500 m-2 \`}>Content</div>`,
      expectedFixes: ["m-2 bg-red-500 p-4 "],
      description: "should preserve trailing space in template literal",
    },
  ];

  for (const testCase of testCases) {
    const diagnostics = runLintPlugin(plugin, testCase.input);

    // Should have sorting diagnostics for quasi parts that need sorting
    const sortingDiagnostics = diagnostics.filter((d) =>
      d.message.includes("should be sorted")
    );

    assertEquals(
      sortingDiagnostics.length,
      testCase.expectedFixes.length,
      `Expected ${testCase.expectedFixes.length} sorting diagnostics for: ${testCase.description}`,
    );

    // Check each fix preserves the expected whitespace
    for (let i = 0; i < sortingDiagnostics.length; i++) {
      const diagnostic = sortingDiagnostics[i];
      const fixes = diagnostic.fix || [];
      assertEquals(
        fixes.length,
        1,
        `Expected 1 fix for diagnostic ${i} in: ${testCase.description}`,
      );

      const fixText = fixes[0].text;
      assertEquals(
        fixText,
        testCase.expectedFixes[i],
        `Fix ${i} should preserve whitespace for: ${testCase.description}`,
      );
    }
  }
});
