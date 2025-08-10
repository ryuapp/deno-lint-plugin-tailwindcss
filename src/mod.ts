import { sortClasses } from "./sort_classes.ts";
import {
  extractClassesFromLiteral,
  extractClassesFromString,
  extractClassesFromTemplateElement,
  findDuplicateClasses,
  hasExtraWhitespace,
  isClassesSorted,
} from "./utils.ts";
import {
  reportDuplicateClasses,
  reportExtraWhitespace,
  reportUnsortedClasses,
} from "./reports.ts";

/**
 * Deno Lint Plugin for Tailwind CSS class sorting and formatting.
 *
 * @example
 * ```jsonc
 * // deno.json
 * {
 *   "lint": {
 *     "plugins": ["jsr:@ryu/deno-lint-plugin-tailwindcss"]
 *   }
 * }
 * ```
 */
const plugin: Deno.lint.Plugin = {
  name: "unstable-tailwindcss-plugin",
  rules: {
    "sort-classes": {
      create(context) {
        return {
          JSXAttribute(node) {
            const attrName = node.name?.name;
            if (attrName !== "class" && attrName !== "className") return;

            const value = node.value;
            if (!value) return;

            if (value.type === "Literal") {
              const analysis = extractClassesFromLiteral(value);

              if (analysis) {
                reportExtraWhitespace(
                  context,
                  value,
                  analysis.originalText,
                  attrName,
                );
                reportDuplicateClasses(context, value, analysis, attrName);
                reportUnsortedClasses(context, value, analysis, attrName);
              }
            } else if (value.type === "JSXExpressionContainer") {
              const expression = value.expression;

              if (expression.type === "TemplateLiteral") {
                // Skip processing entirely if any quasi contains newlines (multiline template)
                const quasis = expression.quasis || [];
                const hasNewlines = quasis.some((q) =>
                  q.cooked && q.cooked.includes("\n")
                );
                if (!hasNewlines) {
                  // Process template literals with expressions by handling each quasi
                  for (let i = 0; i < quasis.length; i++) {
                    const element = quasis[i];
                    const analysis = extractClassesFromTemplateElement(element);

                    // Process quasi if it has classes OR if it has problematic whitespace
                    if (
                      analysis &&
                      (analysis.classes.length > 0 ||
                        analysis.originalText.trim().length === 0)
                    ) {
                      const templateInfo = {
                        hasPrevExpression: i > 0,
                        hasNextExpression: i < quasis.length - 1 &&
                          (expression.expressions?.length || 0) > i,
                      };

                      // For quasi parts that are only whitespace, check if we should process them
                      if (
                        analysis.classes.length === 0 &&
                        analysis.originalText.trim().length === 0
                      ) {
                        // Don't process whitespace-only quasi parts that are between expressions
                        // These are likely intentional spacing like in `${x} ${y} ${z}`
                        if (
                          templateInfo.hasPrevExpression &&
                          templateInfo.hasNextExpression
                        ) {
                          continue; // Skip processing this whitespace-only quasi
                        }

                        // This is a whitespace-only quasi, check if it has problematic patterns
                        if (hasExtraWhitespace(analysis.originalText, false)) { // Use strict whitespace checking
                          reportExtraWhitespace(
                            context,
                            element,
                            analysis.originalText,
                            attrName,
                            false, // Don't preserve spacing for whitespace-only parts
                          );
                        }
                      } else {
                        // Normal processing for quasi parts with actual classes
                        reportExtraWhitespace(
                          context,
                          element,
                          analysis.originalText,
                          attrName,
                          true,
                          templateInfo,
                        );
                        reportDuplicateClasses(
                          context,
                          element,
                          analysis,
                          attrName,
                          true,
                          templateInfo,
                        );
                        reportUnsortedClasses(
                          context,
                          element,
                          analysis,
                          attrName,
                          true,
                          templateInfo,
                        );
                      }
                    }
                  }
                } // Close if (!hasNewlines)
              }
            }
          },

          CallExpression(node) {
            if (node.callee?.type !== "Identifier") return;

            const functionName = node.callee.name;
            if (
              !["clsx", "cn", "tw"].includes(functionName)
            ) return;

            for (const arg of node.arguments || []) {
              if (arg.type === "Literal") {
                const analysis = extractClassesFromLiteral(arg);
                if (analysis) {
                  reportExtraWhitespace(
                    context,
                    arg,
                    analysis.originalText,
                    `${functionName}() argument`,
                  );
                  reportDuplicateClasses(
                    context,
                    arg,
                    analysis,
                    `${functionName}() argument`,
                  );
                  reportUnsortedClasses(
                    context,
                    arg,
                    analysis,
                    `${functionName}() argument`,
                  );
                }
              } else if (arg.type === "TemplateLiteral") {
                // Skip processing entirely if any quasi contains newlines (multiline template)
                const quasis = arg.quasis || [];
                const hasNewlines = quasis.some((q) =>
                  q.cooked && q.cooked.includes("\n")
                );
                if (!hasNewlines) {
                  // Process template literals with expressions by handling each quasi
                  for (let i = 0; i < quasis.length; i++) {
                    const element = quasis[i];
                    const analysis = extractClassesFromTemplateElement(element);

                    // Process quasi if it has classes OR if it has problematic whitespace
                    if (
                      analysis &&
                      (analysis.classes.length > 0 ||
                        analysis.originalText.trim().length === 0)
                    ) {
                      const templateInfo = {
                        hasPrevExpression: i > 0,
                        hasNextExpression: i < quasis.length - 1 &&
                          (arg.expressions?.length || 0) > i,
                      };

                      // For quasi parts that are only whitespace, check if we should process them
                      if (
                        analysis.classes.length === 0 &&
                        analysis.originalText.trim().length === 0
                      ) {
                        // Don't process whitespace-only quasi parts that are between expressions
                        // These are likely intentional spacing like in `${x} ${y} ${z}`
                        if (
                          templateInfo.hasPrevExpression &&
                          templateInfo.hasNextExpression
                        ) {
                          continue; // Skip processing this whitespace-only quasi
                        }

                        // This is a whitespace-only quasi, check if it has problematic patterns
                        if (hasExtraWhitespace(analysis.originalText, false)) { // Use strict whitespace checking
                          reportExtraWhitespace(
                            context,
                            element,
                            analysis.originalText,
                            `${functionName}() template`,
                            false, // Don't preserve spacing for whitespace-only parts
                          );
                        }
                      } else {
                        // Normal processing for quasi parts with actual classes
                        reportExtraWhitespace(
                          context,
                          element,
                          analysis.originalText,
                          `${functionName}() template`,
                          true,
                          templateInfo,
                        );
                        reportDuplicateClasses(
                          context,
                          element,
                          analysis,
                          `${functionName}() template`,
                          true,
                          templateInfo,
                        );
                        reportUnsortedClasses(
                          context,
                          element,
                          analysis,
                          `${functionName}() template`,
                          true,
                          templateInfo,
                        );
                      }
                    }
                  }
                } // Close if (!hasNewlines)
              } else if (arg.type === "ObjectExpression") {
                // Handle object expression like { "opacity-50 cursor-not-allowed": isDisabled }
                for (const prop of arg.properties || []) {
                  if (prop.type === "Property" && prop.key.type === "Literal") {
                    const analysis = extractClassesFromLiteral(prop.key);
                    if (analysis) {
                      reportExtraWhitespace(
                        context,
                        prop.key,
                        analysis.originalText,
                        `${functionName}() object key`,
                      );
                      reportDuplicateClasses(
                        context,
                        prop.key,
                        analysis,
                        `${functionName}() object key`,
                      );
                      reportUnsortedClasses(
                        context,
                        prop.key,
                        analysis,
                        `${functionName}() object key`,
                      );
                    }
                  }
                }
              } else if (arg.type === "ArrayExpression") {
                // Handle array expression - collect all string literals and check sort order
                const allClasses: string[] = [];
                const literalElements: {
                  node: Deno.lint.Literal;
                  value: string;
                }[] = [];

                for (const element of arg.elements || []) {
                  if (
                    element?.type === "Literal" &&
                    typeof element.value === "string"
                  ) {
                    // Check for extra whitespace in each element
                    reportExtraWhitespace(
                      context,
                      element,
                      element.value,
                      `${functionName}() array element`,
                    );

                    const classes = extractClassesFromString(element.value);
                    allClasses.push(...classes);
                    literalElements.push({
                      node: element,
                      value: element.value,
                    });
                  }
                }

                // Check for duplicate classes in array - report individually
                const duplicateClasses = findDuplicateClasses(allClasses);
                if (duplicateClasses.length > 0) {
                  // Count occurrences for each duplicate class
                  const classCount = new Map<string, number>();
                  allClasses.forEach((cls) => {
                    classCount.set(cls, (classCount.get(cls) || 0) + 1);
                  });

                  duplicateClasses.forEach((duplicateClass) => {
                    const count = classCount.get(duplicateClass) || 0;
                    const message = count > 2
                      ? `Duplicate TailwindCSS class "${duplicateClass}" found in ${functionName}() array (appears ${count} times)`
                      : `Duplicate TailwindCSS class "${duplicateClass}" found in ${functionName}() array`;

                    context.report({
                      node: arg,
                      message,
                      fix(fixer) {
                        // Remove duplicates from array
                        const seen = new Set<string>();
                        const uniqueClasses = allClasses.filter((cls) => {
                          if (seen.has(cls)) {
                            return false;
                          }
                          seen.add(cls);
                          return true;
                        });
                        const uniqueArrayContent = uniqueClasses.map((cls) =>
                          `"${cls}"`
                        ).join(",\n        ");
                        const newArrayText =
                          `[\n        ${uniqueArrayContent},\n      ]`;
                        return fixer.replaceText(arg, newArrayText);
                      },
                    });
                  });
                }

                if (allClasses.length > 1 && !isClassesSorted(allClasses)) {
                  const sortedClasses = sortClasses([...allClasses]);

                  context.report({
                    node: arg,
                    message:
                      `TailwindCSS classes in ${functionName}() array should be sorted`,
                    hint: `Array elements should be in this order: ${
                      sortedClasses.map((c) => `"${c}"`).join(", ")
                    }`,
                    fix(fixer) {
                      // Create new array with sorted elements
                      const sortedArrayContent = sortedClasses.map((cls) =>
                        `"${cls}"`
                      ).join(",\n        ");
                      const newArrayText =
                        `[\n        ${sortedArrayContent},\n      ]`;
                      return fixer.replaceText(arg, newArrayText);
                    },
                  });
                }
              }
            }
          },

          TaggedTemplateExpression(node) {
            if (node.tag?.type !== "Identifier") return;

            const functionName = node.tag.name;
            if (functionName !== "tw") return;

            const template = node.quasi;
            if (!template) return;

            // Skip processing entirely if any quasi contains newlines (multiline template)
            const quasis = template.quasis || [];
            const hasNewlines = quasis.some((q) =>
              q.cooked && q.cooked.includes("\n")
            );
            if (!hasNewlines) {
              // Process template literals with expressions by handling each quasi
              for (let i = 0; i < quasis.length; i++) {
                const element = quasis[i];
                const analysis = extractClassesFromTemplateElement(element);

                // Process quasi if it has classes OR if it has problematic whitespace
                if (
                  analysis &&
                  (analysis.classes.length > 0 ||
                    analysis.originalText.trim().length === 0)
                ) {
                  const templateInfo = {
                    hasPrevExpression: i > 0,
                    hasNextExpression: i < quasis.length - 1 &&
                      (template.expressions?.length || 0) > i,
                  };

                  // For quasi parts that are only whitespace, check if we should process them
                  if (
                    analysis.classes.length === 0 &&
                    analysis.originalText.trim().length === 0
                  ) {
                    // Don't process whitespace-only quasi parts that are between expressions
                    // These are likely intentional spacing like in `${x} ${y} ${z}`
                    if (
                      templateInfo.hasPrevExpression &&
                      templateInfo.hasNextExpression
                    ) {
                      continue; // Skip processing this whitespace-only quasi
                    }

                    // This is a whitespace-only quasi, check if it has problematic patterns
                    if (hasExtraWhitespace(analysis.originalText, false)) { // Use strict whitespace checking
                      reportExtraWhitespace(
                        context,
                        element,
                        analysis.originalText,
                        `${functionName}\`\` template`,
                        false, // Don't preserve spacing for whitespace-only parts
                      );
                    }
                  } else {
                    // Normal processing for quasi parts with actual classes
                    reportExtraWhitespace(
                      context,
                      element,
                      analysis.originalText,
                      `${functionName}\`\` template`,
                      true,
                      templateInfo,
                    );
                    reportDuplicateClasses(
                      context,
                      element,
                      analysis,
                      `${functionName}\`\` template`,
                      true,
                      templateInfo,
                    );
                    reportUnsortedClasses(
                      context,
                      element,
                      analysis,
                      `${functionName}\`\` template`,
                      true,
                      templateInfo,
                    );
                  }
                }
              }
            } // Close if (!hasNewlines)
          },
        };
      },
    },
  },
};

export default plugin;
