import { assertEquals } from "@std/assert";
import {
  analyzeClassString,
  extractClassesFromString,
  hasExtraWhitespace,
  isClassesSorted,
} from "./utils.ts";

Deno.test("extractClassesFromString - basic functionality", () => {
  assertEquals(extractClassesFromString("flex items-center justify-center"), [
    "flex",
    "items-center",
    "justify-center",
  ]);
});

Deno.test("extractClassesFromString - with extra whitespace", () => {
  assertEquals(extractClassesFromString("  flex   items-center  "), [
    "flex",
    "items-center",
  ]);
});

Deno.test("extractClassesFromString - empty string", () => {
  assertEquals(extractClassesFromString(""), []);
});

Deno.test("extractClassesFromString - only whitespace", () => {
  assertEquals(extractClassesFromString("   "), []);
});

Deno.test("analyzeClassString - basic functionality", () => {
  const result = analyzeClassString("flex items-center");
  assertEquals(result.classes, ["flex", "items-center"]);
  assertEquals(result.originalText, "flex items-center");
  assertEquals(result.startIndex, 0);
});

Deno.test("analyzeClassString - with whitespace", () => {
  const result = analyzeClassString(" flex  items-center ");
  assertEquals(result.classes, ["flex", "items-center"]);
  assertEquals(result.originalText, " flex  items-center ");
});

Deno.test("hasExtraWhitespace - leading whitespace", () => {
  assertEquals(hasExtraWhitespace(" flex"), true);
  assertEquals(hasExtraWhitespace("  flex"), true);
});

Deno.test("hasExtraWhitespace - trailing whitespace", () => {
  assertEquals(hasExtraWhitespace("flex "), true);
  assertEquals(hasExtraWhitespace("flex  "), true);
});

Deno.test("hasExtraWhitespace - multiple spaces", () => {
  assertEquals(hasExtraWhitespace("flex  items-center"), true);
  assertEquals(hasExtraWhitespace("flex   items-center"), true);
});

Deno.test("hasExtraWhitespace - tab character", () => {
  assertEquals(hasExtraWhitespace("flex\titems-center"), true);
});

Deno.test("hasExtraWhitespace - newline character", () => {
  assertEquals(hasExtraWhitespace("flex\nitems-center"), true);
  assertEquals(hasExtraWhitespace("flex\r\nitems-center"), true);
  assertEquals(hasExtraWhitespace("flex\ritems-center"), true);
});

Deno.test("hasExtraWhitespace - form feed and vertical tab", () => {
  assertEquals(hasExtraWhitespace("flex\fitems-center"), true);
  assertEquals(hasExtraWhitespace("flex\vitems-center"), true);
});

Deno.test("hasExtraWhitespace - no extra whitespace", () => {
  assertEquals(hasExtraWhitespace("flex items-center"), false);
  assertEquals(hasExtraWhitespace("flex"), false);
  assertEquals(hasExtraWhitespace(""), false);
});

// Tests for preserveSpacing parameter
Deno.test("hasExtraWhitespace - preserveSpacing true with leading/trailing spaces", () => {
  // With preserveSpacing=true, leading/trailing spaces are allowed
  assertEquals(hasExtraWhitespace(" flex", true), false);
  assertEquals(hasExtraWhitespace("flex ", true), false);
  assertEquals(hasExtraWhitespace(" flex ", true), false);
});

Deno.test("hasExtraWhitespace - preserveSpacing true still catches multiple spaces", () => {
  // Multiple consecutive spaces should still be detected even with preserveSpacing=true
  assertEquals(hasExtraWhitespace("flex  items-center", true), true);
  assertEquals(hasExtraWhitespace("flex   items-center", true), true);
});

Deno.test("hasExtraWhitespace - preserveSpacing true with single newlines/tabs", () => {
  // Single newlines and tabs are allowed with preserveSpacing=true
  assertEquals(hasExtraWhitespace("flex\n", true), false);
  assertEquals(hasExtraWhitespace("flex\t", true), false);
  assertEquals(hasExtraWhitespace("\nflex", true), false);
  assertEquals(hasExtraWhitespace("\tflex", true), false);
});

Deno.test("hasExtraWhitespace - preserveSpacing true catches multiple newlines/tabs", () => {
  // Multiple consecutive non-space whitespace characters should be detected
  assertEquals(hasExtraWhitespace("flex\n\n", true), true);
  assertEquals(hasExtraWhitespace("flex\t\t", true), true);
  assertEquals(hasExtraWhitespace("\n\nflex", true), true);
  assertEquals(hasExtraWhitespace("\t\tflex", true), true);
});

Deno.test("hasExtraWhitespace - preserveSpacing true catches mixed whitespace patterns", () => {
  // Mixed space and newline/tab combinations that are likely formatting errors
  // Pattern: /[ \t]+\n|\n[ \t]+/
  assertEquals(hasExtraWhitespace("flex  \n", true), true); // spaces before newline
  assertEquals(hasExtraWhitespace("flex\t\n", true), true); // tab before newline
  assertEquals(hasExtraWhitespace("\n  flex", true), true); // newline before spaces
  assertEquals(hasExtraWhitespace("\n\tflex", true), true); // newline before tab
});

Deno.test("hasExtraWhitespace - preserveSpacing true edge cases", () => {
  // Edge cases that show the boundary of what's considered problematic
  assertEquals(hasExtraWhitespace("flex\n", true), false); // just newline (no space)
  assertEquals(hasExtraWhitespace("\nflex", true), false); // just newline (no space)
  assertEquals(hasExtraWhitespace("flex \n", true), true); // space before newline is caught
  assertEquals(hasExtraWhitespace("\n flex", true), true); // newline before space is caught
});

Deno.test("hasExtraWhitespace - preserveSpacing false (default behavior)", () => {
  // Without preserveSpacing (or false), the original behavior is maintained
  assertEquals(hasExtraWhitespace(" flex", false), true);
  assertEquals(hasExtraWhitespace("flex ", false), true);
  assertEquals(hasExtraWhitespace("flex\n", false), true);
  assertEquals(hasExtraWhitespace("flex\t", false), true);
  assertEquals(hasExtraWhitespace("flex  items", false), true);
});

Deno.test("hasExtraWhitespace - preserveSpacing with clean strings", () => {
  // Clean strings should pass both modes
  assertEquals(hasExtraWhitespace("flex items-center", false), false);
  assertEquals(hasExtraWhitespace("flex items-center", true), false);
  assertEquals(hasExtraWhitespace("bg-blue-500", false), false);
  assertEquals(hasExtraWhitespace("bg-blue-500", true), false);
});

Deno.test("isClassesSorted - sorted classes", () => {
  assertEquals(
    isClassesSorted(["flex", "bg-blue-500", "p-4", "text-white"]),
    true,
  );
});

Deno.test("isClassesSorted - unsorted classes", () => {
  assertEquals(
    isClassesSorted(["text-white", "bg-blue-500", "flex", "p-4"]),
    false,
  );
});

Deno.test("isClassesSorted - single class", () => {
  assertEquals(isClassesSorted(["flex"]), true);
});

Deno.test("isClassesSorted - empty array", () => {
  assertEquals(isClassesSorted([]), true);
});

Deno.test("isClassesSorted - duplicate classes", () => {
  // sortClasses removes duplicates, so this would actually be considered sorted
  assertEquals(isClassesSorted(["flex", "flex", "bg-blue-500"]), true);
});

Deno.test("isClassesSorted - with variants", () => {
  assertEquals(isClassesSorted(["flex", "p-4", "hover:bg-blue-500"]), true);
  assertEquals(isClassesSorted(["hover:bg-blue-500", "flex", "p-4"]), false);
});
