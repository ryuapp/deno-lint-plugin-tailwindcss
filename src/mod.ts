import { sortClasses } from "./sort_classes.ts";
import {
  analyzeClassString,
  type ClassAnalysisResult,
  extractClassesFromString,
  hasExtraWhitespace,
  isClassesSorted,
} from "./utils.ts";

type DenoLintNode =
  | Deno.lint.JSXElement
  | Deno.lint.Literal
  | Deno.lint.JSXExpressionContainer
  | Deno.lint.TemplateElement;

function extractClassesFromLiteral(
  node: Deno.lint.Literal,
): ClassAnalysisResult | null {
  const value = node.value;
  if (typeof value !== "string") return null;

  return analyzeClassString(value);
}

function extractClassesFromTemplateElement(
  element: Deno.lint.TemplateElement,
): ClassAnalysisResult {
  const value = element.cooked;

  return analyzeClassString(value);
}

const plugin: Deno.lint.Plugin = {
  name: "unstable-tailwindcss-plugin",
  rules: {
    "sort-classes": {
      create(context) {
        function reportExtraWhitespace(
          node: DenoLintNode,
          value: string,
          attributeName: string,
          isTemplateQuasi = false,
          templateInfo?: {
            hasNextExpression: boolean;
            hasPrevExpression: boolean;
          },
        ) {
          const shouldPreserveSpacing = isTemplateQuasi && templateInfo &&
            (templateInfo.hasNextExpression || templateInfo.hasPrevExpression);

          if (hasExtraWhitespace(value, shouldPreserveSpacing)) {
            let cleanedValue: string;

            if (isTemplateQuasi && templateInfo) {
              // For template literal quasis, preserve necessary trailing/leading spaces
              // that might be needed for proper spacing with expressions

              // Be more careful about cleaning whitespace in template literals
              // Replace multiple spaces with single spaces, but preserve necessary newlines/formatting
              cleanedValue = value.replace(/[ ]{2,}/g, " "); // Only collapse multiple spaces

              // Clean up problematic whitespace patterns while preserving structure
              cleanedValue = cleanedValue.replace(/[\t\n\r\f\v]{2,}/g, "\n"); // Collapse multiple newlines
              cleanedValue = cleanedValue.replace(/[ \t]+\n/g, "\n"); // Remove trailing spaces before newlines
              cleanedValue = cleanedValue.replace(/\n[ \t]+/g, "\n"); // Remove leading spaces after newlines

              // Preserve leading space if there's a previous expression and this quasi starts with space
              const shouldPreserveLeading = templateInfo.hasPrevExpression &&
                value.startsWith(" ");
              // Preserve trailing space if there's a next expression and this quasi ends with space
              const shouldPreserveTrailing = templateInfo.hasNextExpression &&
                value.endsWith(" ");

              // Only trim edges if it won't affect expression spacing
              if (!shouldPreserveLeading && !shouldPreserveTrailing) {
                cleanedValue = cleanedValue.trim();
              } else if (!shouldPreserveLeading) {
                cleanedValue = cleanedValue.trimStart();
              } else if (!shouldPreserveTrailing) {
                cleanedValue = cleanedValue.trimEnd();
              }
            } else {
              cleanedValue = value.trim().replace(/\s+/g, " ");
            }

            context.report({
              node,
              message:
                `TailwindCSS classes in ${attributeName} contain extra whitespace`,
              hint: `Remove extra whitespace to get: "${cleanedValue}"`,
              fix(fixer) {
                if (node.type === "Literal") {
                  return fixer.replaceText(node, `"${cleanedValue}"`);
                } else if (node.type === "TemplateElement") {
                  return fixer.replaceText(node, cleanedValue);
                }
                return [];
              },
            });
          }
        }

        function reportUnsortedClasses(
          node: DenoLintNode,
          analysis: ClassAnalysisResult,
          attributeName: string,
          isTemplateQuasi = false,
          templateInfo?: {
            hasNextExpression: boolean;
            hasPrevExpression: boolean;
          },
        ) {
          if (analysis.classes.length <= 1) return;

          if (!isClassesSorted(analysis.classes)) {
            const sortedClasses = sortClasses([...analysis.classes]);
            let sortedText = sortedClasses.join(" ");

            // For template literals, preserve leading and trailing spaces
            if (isTemplateQuasi && templateInfo) {
              const originalHasLeadingSpace = analysis.originalText.startsWith(
                " ",
              );
              const originalHasTrailingSpace = analysis.originalText.endsWith(
                " ",
              );

              // Preserve leading space if there's a previous expression
              if (
                templateInfo.hasPrevExpression && originalHasLeadingSpace &&
                !sortedText.startsWith(" ")
              ) {
                sortedText = " " + sortedText;
              }

              // Preserve trailing space if there's a next expression
              if (
                templateInfo.hasNextExpression && originalHasTrailingSpace &&
                !sortedText.endsWith(" ")
              ) {
                sortedText += " ";
              }
            }

            context.report({
              node,
              message:
                `TailwindCSS classes in ${attributeName} attribute should be sorted`,
              hint:
                `Use \`deno lint --fix\` command or sort the following: ${sortedText}`,
              fix(fixer) {
                if (node.type === "Literal") {
                  return fixer.replaceText(node, `"${sortedText}"`);
                } else if (node.type === "TemplateElement") {
                  return fixer.replaceText(node, sortedText);
                }
                return [];
              },
            });
          }
        }

        return {
          JSXAttribute(node) {
            const attrName = node.name?.name;
            if (attrName !== "class" && attrName !== "className") return;

            const value = node.value;
            if (!value) return;

            if (value.type === "Literal") {
              const analysis = extractClassesFromLiteral(value);

              if (analysis) {
                reportExtraWhitespace(value, analysis.originalText, attrName);
                reportUnsortedClasses(value, analysis, attrName);
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
                            element,
                            analysis.originalText,
                            attrName,
                            false, // Don't preserve spacing for whitespace-only parts
                          );
                        }
                      } else {
                        // Normal processing for quasi parts with actual classes
                        reportExtraWhitespace(
                          element,
                          analysis.originalText,
                          attrName,
                          true,
                          templateInfo,
                        );
                        reportUnsortedClasses(
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
              !["clsx", "cn", "classNames", "classList"].includes(functionName)
            ) return;

            for (const arg of node.arguments || []) {
              if (arg.type === "Literal") {
                const analysis = extractClassesFromLiteral(arg);
                if (analysis) {
                  reportExtraWhitespace(
                    arg,
                    analysis.originalText,
                    `${functionName}() argument`,
                  );
                  reportUnsortedClasses(
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
                            element,
                            analysis.originalText,
                            `${functionName}() template`,
                            false, // Don't preserve spacing for whitespace-only parts
                          );
                        }
                      } else {
                        // Normal processing for quasi parts with actual classes
                        reportExtraWhitespace(
                          element,
                          analysis.originalText,
                          `${functionName}() template`,
                          true,
                          templateInfo,
                        );
                        reportUnsortedClasses(
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
                        prop.key,
                        analysis.originalText,
                        `${functionName}() object key`,
                      );
                      reportUnsortedClasses(
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
        };
      },
    },
  },
};

export default plugin;
