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
  assertEquals(isClassesSorted(["flex", "hover:bg-blue-500", "p-4"]), true);
  assertEquals(isClassesSorted(["hover:bg-blue-500", "flex", "p-4"]), false);
});
