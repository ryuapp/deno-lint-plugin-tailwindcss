import { getClassSortKey } from "./sort_classes.ts";

// Pre-compiled regex patterns for performance
const MULTIPLE_SPACES_REGEX = / {2}/;
const MULTIPLE_WHITESPACE_REGEX = /[\t\n\r\f\v]{2,}/;
const MIXED_WHITESPACE_REGEX = /[ \t]+\n|\n[ \t]+/;
const OTHER_WHITESPACE_REGEX = /[\t\n\r\f\v]/;
const SPLIT_WHITESPACE_REGEX = /\s+/;

/**
 * Result of analyzing a class string, containing extracted classes
 * and metadata about the original text.
 */
export interface ClassAnalysisResult {
  /** Array of individual class names extracted from the string */
  classes: string[];
  /** Starting index of the class string (always 0 for current implementation) */
  startIndex: number;
  /** Ending index of the class string */
  endIndex: number;
  /** Original text before processing */
  originalText: string;
}

/**
 * Extracts individual class names from a whitespace-separated string.
 * Filters out empty strings and template expressions.
 *
 * @param value - The string containing class names separated by whitespace
 * @returns Array of individual class names
 *
 * @example
 * ```ts
 * extractClassesFromString("flex items-center p-4")
 * // Returns: ["flex", "items-center", "p-4"]
 * ```
 */
export function extractClassesFromString(value: string): string[] {
  return value
    .split(SPLIT_WHITESPACE_REGEX)
    .map((cls) => cls.trim())
    .filter((cls) => cls.length > 0 && !cls.startsWith("${"));
}

/**
 * Analyzes a class string and returns detailed information about it.
 *
 * @param value - The class string to analyze
 * @returns Analysis result containing classes and metadata
 *
 * @example
 * ```ts
 * analyzeClassString("flex items-center")
 * // Returns: {
 * //   classes: ["flex", "items-center"],
 * //   startIndex: 0,
 * //   endIndex: 18,
 * //   originalText: "flex items-center"
 * // }
 * ```
 */
export function analyzeClassString(value: string): ClassAnalysisResult {
  const classes = extractClassesFromString(value);
  return {
    classes,
    startIndex: 0,
    endIndex: value.length,
    originalText: value,
  };
}

/**
 * Checks if a string contains extra whitespace that should be cleaned up.
 *
 * @param value - The string to check for extra whitespace
 * @param preserveSpacing - Whether to preserve some spacing for template literals
 * @returns True if the string contains problematic whitespace
 *
 * @example
 * ```ts
 * hasExtraWhitespace("flex  items-center") // Returns: true (multiple spaces)
 * hasExtraWhitespace(" flex ") // Returns: true (leading/trailing spaces)
 * hasExtraWhitespace("flex items-center") // Returns: false (clean)
 * ```
 */
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

/**
 * Checks if an array of CSS classes is sorted according to Tailwind CSS conventions.
 * Uses an optimized O(n) algorithm that compares adjacent elements without full sorting.
 *
 * @param classes - Array of CSS class names to check
 * @returns True if the classes are properly sorted
 *
 * @example
 * ```ts
 * isClassesSorted(["flex", "items-center", "p-4"]) // Returns: true
 * isClassesSorted(["p-4", "flex", "items-center"]) // Returns: false
 * ```
 */
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

/**
 * Extracts class information from a Deno lint Literal AST node.
 * Only processes string literals, returns null for other types.
 *
 * @param node - The Literal AST node to extract classes from
 * @returns Analysis result or null if the node is not a string literal
 *
 * @example
 * ```ts
 * const node = { type: "Literal", value: "flex items-center" } as Deno.lint.Literal;
 * extractClassesFromLiteral(node)
 * // Returns: { classes: ["flex", "items-center"], ... }
 * ```
 */
export function extractClassesFromLiteral(
  node: Deno.lint.Literal,
): ClassAnalysisResult | null {
  const value = node.value;
  if (typeof value !== "string") return null;

  return analyzeClassString(value);
}

/**
 * Extracts class information from a Deno lint TemplateElement AST node.
 * Used for processing template literal parts in expressions like `flex ${condition ? 'active' : ''}`.
 *
 * @param element - The TemplateElement AST node to extract classes from
 * @returns Analysis result containing classes and metadata
 *
 * @example
 * ```ts
 * const element = { type: "TemplateElement", cooked: "flex items-center" } as Deno.lint.TemplateElement;
 * extractClassesFromTemplateElement(element)
 * // Returns: { classes: ["flex", "items-center"], ... }
 * ```
 */
export function extractClassesFromTemplateElement(
  element: Deno.lint.TemplateElement,
): ClassAnalysisResult {
  const value = element.cooked;

  return analyzeClassString(value);
}

/**
 * Finds duplicate CSS classes in an array of class names.
 * Returns an array of duplicate class names (each duplicate appears once).
 *
 * @param classes - Array of CSS class names to check for duplicates
 * @returns Array of duplicate class names (unique list)
 *
 * @example
 * ```ts
 * findDuplicateClasses(["flex", "p-4", "flex", "items-center", "p-4"])
 * // Returns: ["flex", "p-4"]
 * ```
 */
export function findDuplicateClasses(classes: string[]): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  for (const cls of classes) {
    if (seen.has(cls)) {
      duplicates.add(cls);
    } else {
      seen.add(cls);
    }
  }

  return Array.from(duplicates);
}

/**
 * Information about a duplicate class occurrence.
 */
export interface DuplicateClassInfo {
  /** The duplicate class name */
  className: string;
  /** Indices where this class appears (first occurrence is not considered duplicate) */
  duplicateIndices: number[];
  /** The original text positions of duplicate occurrences */
  positions: Array<{ start: number; end: number }>;
}

/**
 * Finds detailed information about duplicate classes including their positions.
 * This is a simplified version that works with the current reporting system.
 *
 * @param originalText - The original class string
 * @returns Array of duplicate class information
 */
export function findDuplicatePositions(
  originalText: string,
): DuplicateClassInfo[] {
  const classes = extractClassesFromString(originalText);
  const seen = new Map<string, number[]>();
  const duplicateInfo: DuplicateClassInfo[] = [];

  // Track all occurrences of each class
  classes.forEach((cls, index) => {
    if (!seen.has(cls)) {
      seen.set(cls, []);
    }
    seen.get(cls)!.push(index);
  });

  // Find duplicates
  for (const [className, indices] of seen) {
    if (indices.length > 1) {
      duplicateInfo.push({
        className,
        duplicateIndices: indices.slice(1), // Exclude first occurrence
        positions: [], // Simplified - positions calculation is complex for string literals
      });
    }
  }

  return duplicateInfo;
}
