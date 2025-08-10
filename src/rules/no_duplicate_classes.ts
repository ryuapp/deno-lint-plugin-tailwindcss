import type { TemplateInfo } from "./types.ts";
import {
  type ClassAnalysisResult,
  extractClassesFromLiteral,
  extractClassesFromString,
  extractClassesFromTemplateElement,
  findDuplicateClasses,
  findDuplicatePositions,
} from "../utils.ts";

/**
 * Reports duplicate classes as separate errors.
 * Each duplicate class gets its own diagnostic with targeted error message.
 *
 * @param context - The lint rule execution context
 * @param node - The AST node containing the class string
 * @param analysis - Result of analyzing the class string
 * @param attributeName - Name of the attribute or context for error messages
 * @param isTemplateQuasi - Whether this is part of a template literal
 * @param templateInfo - Information about template literal positioning
 */
function reportDuplicateClasses(
  context: Deno.lint.RuleContext,
  node: Deno.lint.Literal | Deno.lint.TemplateElement,
  analysis: ClassAnalysisResult,
  attributeName: string,
  isTemplateQuasi = false,
  templateInfo?: TemplateInfo,
) {
  const duplicateInfo = findDuplicatePositions(analysis.originalText);

  if (duplicateInfo.length === 0) return;

  // Remove duplicates while preserving first occurrence order
  const seen = new Set<string>();
  const uniqueClasses = analysis.classes.filter((cls) => {
    if (seen.has(cls)) {
      return false;
    }
    seen.add(cls);
    return true;
  });

  let fixedText = uniqueClasses.join(" ");

  // For template literals, preserve leading and trailing spaces
  if (isTemplateQuasi && templateInfo) {
    const originalHasLeadingSpace = analysis.originalText.startsWith(" ");
    const originalHasTrailingSpace = analysis.originalText.endsWith(" ");

    if (
      templateInfo.hasPrevExpression && originalHasLeadingSpace &&
      !fixedText.startsWith(" ")
    ) {
      fixedText = " " + fixedText;
    }

    if (
      templateInfo.hasNextExpression && originalHasTrailingSpace &&
      !fixedText.endsWith(" ")
    ) {
      fixedText += " ";
    }
  }

  // Report each duplicate class individually
  for (const duplicate of duplicateInfo) {
    const { className, duplicateIndices } = duplicate;
    const duplicateCount = duplicateIndices.length;

    context.report({
      node,
      message:
        `Duplicate TailwindCSS class "${className}" found in ${attributeName}${
          duplicateCount > 1 ? ` (appears ${duplicateCount + 1} times)` : ""
        }`,
      hint: `Remove duplicate "${className}" class. Fixed text: "${fixedText}"`,
      fix(fixer) {
        if (node.type === "Literal") {
          return fixer.replaceText(node, `"${fixedText}"`);
        } else if (node.type === "TemplateElement") {
          return fixer.replaceText(node, fixedText);
        }
        return [];
      },
    });
  }
}

export const noDuplicateClassesRule: Deno.lint.Rule = {
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
            reportDuplicateClasses(context, value, analysis, attrName);
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

                // Process quasi if it has classes
                if (analysis && analysis.classes.length > 0) {
                  const templateInfo = {
                    hasPrevExpression: i > 0,
                    hasNextExpression: i < quasis.length - 1 &&
                      (expression.expressions?.length || 0) > i,
                  };

                  reportDuplicateClasses(
                    context,
                    element,
                    analysis,
                    attrName,
                    true,
                    templateInfo,
                  );
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
              reportDuplicateClasses(
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

                // Process quasi if it has classes
                if (analysis && analysis.classes.length > 0) {
                  const templateInfo = {
                    hasPrevExpression: i > 0,
                    hasNextExpression: i < quasis.length - 1 &&
                      (arg.expressions?.length || 0) > i,
                  };

                  reportDuplicateClasses(
                    context,
                    element,
                    analysis,
                    `${functionName}() template`,
                    true,
                    templateInfo,
                  );
                }
              }
            } // Close if (!hasNewlines)
          } else if (arg.type === "ObjectExpression") {
            // Handle object expression like { "opacity-50 cursor-not-allowed": isDisabled }
            for (const prop of arg.properties || []) {
              if (prop.type === "Property" && prop.key.type === "Literal") {
                const analysis = extractClassesFromLiteral(prop.key);
                if (analysis) {
                  reportDuplicateClasses(
                    context,
                    prop.key,
                    analysis,
                    `${functionName}() object key`,
                  );
                }
              }
            }
          } else if (arg.type === "ArrayExpression") {
            // Handle array expression - collect all string literals and check for duplicates
            const allClasses: string[] = [];

            for (const element of arg.elements || []) {
              if (
                element?.type === "Literal" &&
                typeof element.value === "string"
              ) {
                const classes = extractClassesFromString(element.value);
                allClasses.push(...classes);
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

            // Process quasi if it has classes
            if (analysis && analysis.classes.length > 0) {
              const templateInfo = {
                hasPrevExpression: i > 0,
                hasNextExpression: i < quasis.length - 1 &&
                  (template.expressions?.length || 0) > i,
              };

              reportDuplicateClasses(
                context,
                element,
                analysis,
                `${functionName}\`\` template`,
                true,
                templateInfo,
              );
            }
          }
        } // Close if (!hasNewlines)
      },
    };
  },
};
