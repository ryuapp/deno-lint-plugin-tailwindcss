import { TAILWIND_LAYERS, VARIANT_CLASSES } from "./tailwind_preset.ts";

// Pre-compiled performance optimization structures
const EXACT_MATCH_INDEX = new Map<
  string,
  { layerIndex: number; classIndex: number }
>();
const PREFIX_MATCH_INDEX = new Map<
  string,
  { layerIndex: number; classIndex: number }
>();
const VARIANT_INDEX = new Map<string, number>();

// Initialize pattern indexes for O(1) lookups
function initializePatternIndexes() {
  // Build exact match and prefix indexes
  for (let layerIndex = 0; layerIndex < TAILWIND_LAYERS.length; layerIndex++) {
    const layer = TAILWIND_LAYERS[layerIndex];
    for (let classIndex = 0; classIndex < layer.classes.length; classIndex++) {
      const pattern = layer.classes[classIndex];

      if (pattern.endsWith("$")) {
        // Exact match pattern
        const exactMatch = pattern.slice(0, -1);
        EXACT_MATCH_INDEX.set(exactMatch, { layerIndex, classIndex });
      } else if (pattern.endsWith("-")) {
        // Prefix match pattern - only store if not already set (preserve first occurrence)
        const prefix = pattern.slice(0, -1);
        if (!PREFIX_MATCH_INDEX.has(prefix)) {
          PREFIX_MATCH_INDEX.set(prefix, { layerIndex, classIndex });
        }
      } else {
        // Direct match pattern
        EXACT_MATCH_INDEX.set(pattern, { layerIndex, classIndex });
      }
    }
  }

  // Build variant index
  VARIANT_CLASSES.forEach((variant, index) => {
    VARIANT_INDEX.set(variant, index);
  });
}

// Initialize on module load
initializePatternIndexes();

/**
 * Generates a sort key for a Tailwind CSS class name.
 * The sort key is an array of numbers that determines the ordering priority.
 *
 * @param className - The CSS class name to generate a sort key for
 * @returns Array of numbers representing the sort priority
 *
 * @example
 * ```ts
 * getClassSortKey("flex") // Returns: [1, 0, 2, 15, 1, 0, 0]
 * getClassSortKey("hover:bg-blue-500") // Returns: [1, 1, 4, 2, 36, 1, 0, 0]
 * ```
 */
export function getClassSortKey(className: string): number[] {
  const [variant, utilityClass] = parseClassName(className);

  // For matching purposes, normalize negative value classes (e.g., -mt-20 -> mt-20)
  const isNegative = utilityClass.startsWith("-");
  const normalizedUtilityClass = isNegative
    ? utilityClass.slice(1)
    : utilityClass;

  // Use original algorithm for correctness - iterate through patterns in order
  for (let layerIndex = 0; layerIndex < TAILWIND_LAYERS.length; layerIndex++) {
    const layer = TAILWIND_LAYERS[layerIndex];

    for (let classIndex = 0; classIndex < layer.classes.length; classIndex++) {
      const pattern = layer.classes[classIndex];

      if (matchesPattern(normalizedUtilityClass, pattern)) {
        const sortKey = [];

        // 1. Non-Tailwind classes come first (0), Tailwind classes second (1)
        sortKey.push(1);

        // 2. Base classes before variant classes
        if (variant) {
          sortKey.push(1); // has variant
          const variantParts = getVariantSortKey(variant);
          sortKey.push(...variantParts);
        } else {
          sortKey.push(0); // no variant
        }

        // 3. Layer index (base, components, utilities)
        sortKey.push(layerIndex);

        // 4. Class index within layer
        sortKey.push(classIndex);

        // 5. Negative values come first
        sortKey.push(isNegative ? 0 : 1);

        // 6. Important modifier comes last (! prefix)
        const hasImportant = className.includes("!");
        sortKey.push(hasImportant ? 1 : 0);

        // 7. Arbitrary values come last
        sortKey.push(normalizedUtilityClass.includes("[") ? 1 : 0);

        return sortKey;
      }
    }
  }

  // Non-Tailwind classes should come first
  return [0];
}

function getVariantSortKey(variant: string): number[] {
  const parts = variant.split(":");
  const sortKey = [];

  // Fast O(1) variant lookup using pre-built index
  for (const part of parts) {
    const partIndex = VARIANT_INDEX.get(part);
    if (partIndex !== undefined) {
      sortKey.push(partIndex);
    } else {
      // Unknown variant, put at the end
      sortKey.push(10000);
    }
  }

  return sortKey;
}

function parseClassName(className: string): [string | null, string] {
  // Find the last colon that's not inside square brackets
  let colonIndex = -1;
  let insideBrackets = false;

  for (let i = className.length - 1; i >= 0; i--) {
    if (className[i] === "]") {
      insideBrackets = true;
    } else if (className[i] === "[") {
      insideBrackets = false;
    } else if (className[i] === ":" && !insideBrackets) {
      colonIndex = i;
      break;
    }
  }

  if (colonIndex === -1) {
    // No variant, but might have ! prefix
    const workingClassName = className.startsWith("!")
      ? className.slice(1)
      : className;
    return [null, workingClassName];
  }

  const variant = className.substring(0, colonIndex);
  let utility = className.substring(colonIndex + 1);

  // Handle ! prefix in utility part for important modifiers
  if (utility.startsWith("!")) {
    utility = utility.slice(1);
  }

  return [variant, utility];
}

function matchesPattern(className: string, pattern: string): boolean {
  if (pattern.endsWith("$")) {
    return className === pattern.slice(0, -1);
  }

  if (pattern.endsWith("-")) {
    // Check if it's a regular pattern match or an arbitrary value with brackets
    if (className.startsWith(pattern)) {
      return true;
    }
    // Check for arbitrary values like text-[color:var(--custom)]
    const arbitraryPattern = pattern.slice(0, -1) + "[";
    if (className.startsWith(arbitraryPattern) && className.endsWith("]")) {
      return true;
    }
  }

  return className === pattern;
}

/**
 * Sorts an array of Tailwind CSS class names according to the official sorting rules.
 * Removes duplicate classes and returns them in the correct order.
 *
 * @param classes - Array of CSS class names to sort
 * @returns Sorted array of unique class names
 *
 * @example
 * ```ts
 * sortClasses(["p-4", "flex", "text-blue-500", "flex"])
 * // Returns: ["flex", "p-4", "text-blue-500"]
 * ```
 */
export function sortClasses(classes: string[]): string[] {
  // Deduplicate first
  const uniqueClasses = [...new Set(classes)];

  return uniqueClasses.sort((a, b) => {
    const orderA = getClassSortKey(a);
    const orderB = getClassSortKey(b);

    // Compare arrays element by element
    for (let i = 0; i < Math.max(orderA.length, orderB.length); i++) {
      const valueA = orderA[i] ?? 0;
      const valueB = orderB[i] ?? 0;

      if (valueA !== valueB) {
        return valueA - valueB;
      }
    }

    // Fallback to alphabetical sorting for consistent results
    return a.localeCompare(b);
  });
}
