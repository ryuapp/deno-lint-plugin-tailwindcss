import { TAILWIND_LAYERS, VARIANT_CLASSES } from "./tailwind_preset.ts";

export function getClassOrder(className: string): number {
  const [variant, utilityClass] = parseClassName(className);

  const variantOrder = variant ? VARIANT_CLASSES.indexOf(variant) : -1;

  for (let layerIndex = 0; layerIndex < TAILWIND_LAYERS.length; layerIndex++) {
    const layer = TAILWIND_LAYERS[layerIndex];

    for (let classIndex = 0; classIndex < layer.classes.length; classIndex++) {
      const pattern = layer.classes[classIndex];

      if (matchesPattern(utilityClass, pattern)) {
        const baseOrder = layerIndex * 10000 + classIndex * 10;
        const variantOffset = variantOrder >= 0 ? variantOrder : 0;
        return baseOrder + variantOffset;
      }
    }
  }

  // Non-Tailwind classes should come first, so give them a negative order
  return -1;
}

function parseClassName(className: string): [string | null, string] {
  // Find the last colon that's not inside square brackets
  let colonIndex = -1;
  let insideBrackets = false;
  
  for (let i = className.length - 1; i >= 0; i--) {
    if (className[i] === ']') {
      insideBrackets = true;
    } else if (className[i] === '[') {
      insideBrackets = false;
    } else if (className[i] === ':' && !insideBrackets) {
      colonIndex = i;
      break;
    }
  }
  
  if (colonIndex === -1) {
    return [null, className];
  }

  const variant = className.substring(0, colonIndex);
  const utility = className.substring(colonIndex + 1);
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
  return classes.sort((a, b) => {
    const orderA = getClassOrder(a);
    const orderB = getClassOrder(b);
    
    // If both are custom classes (order = -1), sort them alphabetically
    if (orderA === -1 && orderB === -1) {
      return a.localeCompare(b);
    }
    
    return orderA - orderB;
  });
}
