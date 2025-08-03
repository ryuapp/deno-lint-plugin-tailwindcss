import { TAILWIND_LAYERS, VARIANT_CLASSES } from "./tailwind_preset.ts";

export function getClassOrder(className: string): number {
  const [variant, utilityClass] = parseClassName(className);

  // Calculate variant order - sum all variant parts for complex variants
  let variantOrder = 0;
  let hasVariant = false;
  if (variant) {
    hasVariant = true;
    const variantParts = variant.split(":");
    // Sum all variant indices to ensure complex variants come after simple ones
    for (const part of variantParts) {
      const partIndex = VARIANT_CLASSES.indexOf(part);
      if (partIndex >= 0) {
        variantOrder += partIndex;
      }
    }
  }

  // For matching purposes, normalize negative value classes (e.g., -mt-20 -> mt-20)
  // but keep the original for display
  const isNegative = utilityClass.startsWith("-");
  const normalizedUtilityClass = isNegative
    ? utilityClass.slice(1)
    : utilityClass;

  for (let layerIndex = 0; layerIndex < TAILWIND_LAYERS.length; layerIndex++) {
    const layer = TAILWIND_LAYERS[layerIndex];

    for (let classIndex = 0; classIndex < layer.classes.length; classIndex++) {
      const pattern = layer.classes[classIndex];

      if (matchesPattern(normalizedUtilityClass, pattern)) {
        const baseOrder = layerIndex * 10000 + classIndex * 10;
        // Add a small offset for negative values to ensure they come first
        const negativeOffset = isNegative ? -1 : 0;
        // Variants should come after all base classes
        const variantOffset = hasVariant ? 100000 + variantOrder : 0;
        // Arbitrary values (with []) should come after predefined values
        const arbitraryOffset = normalizedUtilityClass.includes("[") ? 1 : 0;
        return baseOrder + negativeOffset + variantOffset + arbitraryOffset;
      }
    }
  }

  // Non-Tailwind classes should come first, so give them a negative order
  return -1;
}

function parseClassName(className: string): [string | null, string] {
  // Handle ! prefix for important modifiers - strip it for parsing
  const workingClassName = className.startsWith("!")
    ? className.slice(1)
    : className;

  // Find the last colon that's not inside square brackets
  let colonIndex = -1;
  let insideBrackets = false;

  for (let i = workingClassName.length - 1; i >= 0; i--) {
    if (workingClassName[i] === "]") {
      insideBrackets = true;
    } else if (workingClassName[i] === "[") {
      insideBrackets = false;
    } else if (workingClassName[i] === ":" && !insideBrackets) {
      colonIndex = i;
      break;
    }
  }

  if (colonIndex === -1) {
    return [null, workingClassName];
  }

  const variant = workingClassName.substring(0, colonIndex);
  const utility = workingClassName.substring(colonIndex + 1);
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

export function sortClasses(classes: string[]): string[] {
  // Deduplicate first
  const uniqueClasses = [...new Set(classes)];

  return uniqueClasses.sort((a, b) => {
    const orderA = getClassOrder(a);
    const orderB = getClassOrder(b);

    // If both are custom classes (order = -1), sort them alphabetically
    if (orderA === -1 && orderB === -1) {
      // For alphabetical sorting, strip the ! prefix for comparison but preserve in output
      const aForComparison = a.startsWith("!") ? a.slice(1) : a;
      const bForComparison = b.startsWith("!") ? b.slice(1) : b;
      return aForComparison.localeCompare(bForComparison);
    }

    return orderA - orderB;
  });
}
