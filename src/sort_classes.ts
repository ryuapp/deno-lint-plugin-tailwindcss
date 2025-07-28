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

  return 999999;
}

function parseClassName(className: string): [string | null, string] {
  const colonIndex = className.indexOf(":");
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
    return className.startsWith(pattern);
  }

  return className === pattern;
}

export function sortClasses(classes: string[]): string[] {
  return classes.sort((a, b) => getClassOrder(a) - getClassOrder(b));
}
