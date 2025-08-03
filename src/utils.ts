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
    .filter((cls) => cls.length > 0 && !cls.startsWith("${"));
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

  if (preserveSpacing) {
    // For template literals with expressions, be more careful about whitespace
    // Allow single newlines and tabs if they're part of formatting
    // But still catch genuinely problematic whitespace

    // Check for multiple consecutive non-space whitespace characters
    if (/[\t\n\r\f\v]{2,}/.test(value)) return true;

    // Check for mixed space and newline/tab combinations that are likely formatting errors
    if (/[ \t]+\n|\n[ \t]+/.test(value)) return true;
  } else {
    // Check for tabs or other whitespace characters (always bad for regular literals)
    if (/[\t\n\r\f\v]/.test(value)) return true;

    // Check for leading/trailing whitespace only for regular literals
    if (value !== value.trim()) return true;
  }

  return false;
}

export function isClassesSorted(classes: string[]): boolean {
  const sorted = sortClasses([...classes]);

  // First deduplicate the input to match what sortClasses does
  const uniqueClasses = [...new Set(classes)];

  return uniqueClasses.length === sorted.length &&
    uniqueClasses.every((cls, index) => cls === sorted[index]);
}
