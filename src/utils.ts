import { sortClasses } from "./sort_classes.ts";

export interface ClassAnalysisResult {
  classes: string[];
  startIndex: number;
  endIndex: number;
  originalText: string;
}

export function extractClassesFromString(value: string): string[] {
  return value
    .split(/\s+/)
    .map((cls) => cls.trim())
    .filter((cls) => cls.length > 0);
}

export function analyzeClassString(value: string): ClassAnalysisResult {
  const classes = extractClassesFromString(value);
  return {
    classes,
    startIndex: 0,
    endIndex: value.length,
    originalText: value,
  };
}

export function hasExtraWhitespace(
  value: string,
  preserveSpacing = false,
): boolean {
  // Check for multiple consecutive spaces (always bad)
  if (value.includes("  ")) return true;

  // Check for tabs or other whitespace characters (always bad)
  if (/[\t\n\r\f\v]/.test(value)) return true;

  // For template literals with expressions, allow necessary leading/trailing spaces
  if (!preserveSpacing) {
    // Check for leading/trailing whitespace only for regular literals
    if (value !== value.trim()) return true;
  }

  return false;
}

export function isClassesSorted(classes: string[]): boolean {
  const sorted = sortClasses([...classes]);

  return classes.length === sorted.length &&
    classes.every((cls, index) => cls === sorted[index]);
}
