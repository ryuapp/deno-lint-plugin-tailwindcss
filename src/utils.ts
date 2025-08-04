import { getClassSortKey } from "./sort_classes.ts";

// Pre-compiled regex patterns for performance
const MULTIPLE_SPACES_REGEX = / {2}/;
const MULTIPLE_WHITESPACE_REGEX = /[\t\n\r\f\v]{2,}/;
const MIXED_WHITESPACE_REGEX = /[ \t]+\n|\n[ \t]+/;
const OTHER_WHITESPACE_REGEX = /[\t\n\r\f\v]/;
const SPLIT_WHITESPACE_REGEX = /\s+/;

export interface ClassAnalysisResult {
  classes: string[];
  startIndex: number;
  endIndex: number;
  originalText: string;
}

export function extractClassesFromString(value: string): string[] {
  return value
    .split(SPLIT_WHITESPACE_REGEX)
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
  if (MULTIPLE_SPACES_REGEX.test(value)) return true;

  if (preserveSpacing) {
    // For template literals with expressions, be more careful about whitespace
    // Allow single newlines and tabs if they're part of formatting
    // But still catch genuinely problematic whitespace

    // Check for multiple consecutive non-space whitespace characters
    if (MULTIPLE_WHITESPACE_REGEX.test(value)) return true;

    // Check for mixed space and newline/tab combinations that are likely formatting errors
    if (MIXED_WHITESPACE_REGEX.test(value)) return true;
  } else {
    // Check for tabs or other whitespace characters (always bad for regular literals)
    if (OTHER_WHITESPACE_REGEX.test(value)) return true;

    // Check for leading/trailing whitespace only for regular literals
    if (value !== value.trim()) return true;
  }

  return false;
}

// Fast comparison function for sort keys
function compareSortKeys(keyA: number[], keyB: number[]): number {
  const maxLength = Math.max(keyA.length, keyB.length);
  for (let i = 0; i < maxLength; i++) {
    const valueA = keyA[i] ?? 0;
    const valueB = keyB[i] ?? 0;
    if (valueA !== valueB) {
      return valueA - valueB;
    }
  }
  return 0;
}

export function isClassesSorted(classes: string[]): boolean {
  if (classes.length <= 1) return true;

  // Quick O(n) check without full sorting - compare adjacent classes
  let prevSortKey: number[] | null = null;
  let prevClass = "";

  for (const cls of classes) {
    // Skip duplicates (same as sortClasses behavior)
    if (cls === prevClass) continue;

    const currentSortKey = getClassSortKey(cls);

    if (prevSortKey !== null) {
      const comparison = compareSortKeys(prevSortKey, currentSortKey);
      if (comparison > 0) {
        return false; // Found unsorted pair
      }
      // If sort keys are equal, fall back to alphabetical comparison
      if (comparison === 0 && prevClass.localeCompare(cls) > 0) {
        return false;
      }
    }

    prevSortKey = currentSortKey;
    prevClass = cls;
  }

  return true;
}

export function extractClassesFromLiteral(
  node: Deno.lint.Literal,
): ClassAnalysisResult | null {
  const value = node.value;
  if (typeof value !== "string") return null;

  return analyzeClassString(value);
}

export function extractClassesFromTemplateElement(
  element: Deno.lint.TemplateElement,
): ClassAnalysisResult {
  const value = element.cooked;

  return analyzeClassString(value);
}
