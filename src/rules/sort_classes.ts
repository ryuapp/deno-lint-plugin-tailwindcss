import { sortClasses } from "../sort_classes.ts";
import type { TemplateInfo } from "./types.ts";
import {
  type ClassAnalysisResult,
  extractClassesFromLiteral,
  extractClassesFromString,
  extractClassesFromTemplateElement,
  isClassesSorted,
} from "../utils.ts";

/**
 * Reports and fixes improperly sorted Tailwind CSS classes.
 * Preserves proper spacing for template literals while ensuring correct class order.
 *
 * @param context - The lint rule execution context
 * @param node - The AST node containing the class string
 * @param analysis - Result of analyzing the class string
 * @param attributeName - Name of the attribute or context for error messages
 * @param isTemplateQuasi - Whether this is part of a template literal
 * @param templateInfo - Information about template literal positioning
 */
function reportUnsortedClasses(
  context: Deno.lint.RuleContext,
  node: Deno.lint.Literal | Deno.lint.TemplateElement,
  analysis: ClassAnalysisResult,
  attributeName: string,
  isTemplateQuasi = false,
  templateInfo?: TemplateInfo,
) {
  if (analysis.classes.length <= 1) return;

  if (!isClassesSorted(analysis.classes)) {
    const sortedClasses = sortClasses([...analysis.classes]);
    let sortedText: string;

    // Preserve original whitespace patterns when no-unnecessary-whitespace rule is not active
    // Only sort the classes but keep the same spacing structure
    if (!isTemplateQuasi) {
      // For regular literals, preserve leading/trailing whitespace
      const leadingWhitespace = analysis.originalText.match(/^\s*/)?.[0] || "";
      const trailingWhitespace = analysis.originalText.match(/\s*$/)?.[0] || "";
      sortedText = leadingWhitespace + sortedClasses.join(" ") +
        trailingWhitespace;
    } else {
      // For template literals, be more careful about spacing
      sortedText = sortedClasses.join(" ");

      if (templateInfo) {
        const originalHasLeadingSpace = analysis.originalText.startsWith(" ");
        const originalHasTrailingSpace = analysis.originalText.endsWith(" ");

        // Preserve leading space if there's a previous expression or original had leading space
        if (
          (templateInfo.hasPrevExpression && originalHasLeadingSpace) ||
          (!templateInfo.hasPrevExpression && originalHasLeadingSpace)
        ) {
          if (!sortedText.startsWith(" ")) {
            sortedText = " " + sortedText;
          }
        }

        // Preserve trailing space if there's a next expression or original had trailing space
        if (
          (templateInfo.hasNextExpression && originalHasTrailingSpace) ||
          (!templateInfo.hasNextExpression && originalHasTrailingSpace)
        ) {
          if (!sortedText.endsWith(" ")) {
            sortedText += " ";
          }
        }
      }
    }

    context.report({
      node,
      message:
        `TailwindCSS classes in ${attributeName} attribute should be sorted`,
      hint: `Sort the following: ${sortedText}`,
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

export const sortClassesRule: Deno.lint.Rule = {
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

                // Process quasi if it has classes
                if (analysis && analysis.classes.length > 0) {
                  const templateInfo = {
                    hasPrevExpression: i > 0,
                    hasNextExpression: i < quasis.length - 1 &&
                      (expression.expressions?.length || 0) > i,
                  };

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

                // Process quasi if it has classes
                if (analysis && analysis.classes.length > 0) {
                  const templateInfo = {
                    hasPrevExpression: i > 0,
                    hasNextExpression: i < quasis.length - 1 &&
                      (arg.expressions?.length || 0) > i,
                  };

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
            } // Close if (!hasNewlines)
          } else if (arg.type === "ObjectExpression") {
            // Handle object expression like { "opacity-50 cursor-not-allowed": isDisabled }
            for (const prop of arg.properties || []) {
              if (prop.type === "Property" && prop.key.type === "Literal") {
                const analysis = extractClassesFromLiteral(prop.key);
                if (analysis) {
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

            for (const element of arg.elements || []) {
              if (
                element?.type === "Literal" &&
                typeof element.value === "string"
              ) {
                const classes = extractClassesFromString(element.value);
                allClasses.push(...classes);
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
        } // Close if (!hasNewlines)
      },
    };
  },
};
