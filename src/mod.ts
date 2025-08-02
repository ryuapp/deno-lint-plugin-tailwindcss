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
              cleanedValue = value.replace(/\s+/g, " ");

              // Preserve leading space if there's a previous expression and this quasi starts with space
              const shouldPreserveLeading = templateInfo.hasPrevExpression &&
                value.startsWith(" ");
              // Preserve trailing space if there's a next expression and this quasi ends with space
              const shouldPreserveTrailing = templateInfo.hasNextExpression &&
                value.endsWith(" ");

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
        ) {
          if (analysis.classes.length <= 1) return;

          if (!isClassesSorted(analysis.classes)) {
            const sortedClasses = sortClasses([...analysis.classes]);
            const sortedText = sortedClasses.join(" ");

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
                // Process template literals with expressions by handling each quasi
                const quasis = expression.quasis || [];
                for (let i = 0; i < quasis.length; i++) {
                  const element = quasis[i];
                  const analysis = extractClassesFromTemplateElement(element);
                  if (analysis && analysis.classes.length > 0) {
                    const templateInfo = {
                      hasPrevExpression: i > 0,
                      hasNextExpression: i < quasis.length - 1 &&
                        (expression.expressions?.length || 0) > i,
                    };
                    reportExtraWhitespace(
                      element,
                      analysis.originalText,
                      attrName,
                      true,
                      templateInfo,
                    );
                    reportUnsortedClasses(element, analysis, attrName);
                  }
                }
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
                // Process template literals with expressions by handling each quasi
                const quasis = arg.quasis || [];
                for (let i = 0; i < quasis.length; i++) {
                  const element = quasis[i];
                  const analysis = extractClassesFromTemplateElement(element);
                  if (analysis && analysis.classes.length > 0) {
                    const templateInfo = {
                      hasPrevExpression: i > 0,
                      hasNextExpression: i < quasis.length - 1 &&
                        (arg.expressions?.length || 0) > i,
                    };
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
                    );
                  }
                }
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

          VariableDeclarator(node) {
            if (!node.init) return;

            const init = node.init;
            if (init.type === "Literal") {
              const id = node.id;
              if (
                id?.type === "Identifier" &&
                (id.name.toLowerCase().includes("class") ||
                  id.name.toLowerCase().includes("style"))
              ) {
                const analysis = extractClassesFromLiteral(init);
                if (analysis) {
                  reportExtraWhitespace(
                    init,
                    analysis.originalText,
                    `variable ${id.name}`,
                  );
                  reportUnsortedClasses(init, analysis, `variable ${id.name}`);
                }
              }
            } else if (init.type === "TemplateLiteral") {
              const id = node.id;
              if (
                id?.type === "Identifier" &&
                (id.name.toLowerCase().includes("class") ||
                  id.name.toLowerCase().includes("style"))
              ) {
                // Process template literals with expressions by handling each quasi
                const quasis = init.quasis || [];
                for (let i = 0; i < quasis.length; i++) {
                  const element = quasis[i];
                  const analysis = extractClassesFromTemplateElement(element);
                  if (analysis && analysis.classes.length > 0) {
                    const templateInfo = {
                      hasPrevExpression: i > 0,
                      hasNextExpression: i < quasis.length - 1 &&
                        (init.expressions?.length || 0) > i,
                    };
                    reportExtraWhitespace(
                      element,
                      analysis.originalText,
                      `variable ${id.name} template`,
                      true,
                      templateInfo,
                    );
                    reportUnsortedClasses(
                      element,
                      analysis,
                      `variable ${id.name} template`,
                    );
                  }
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
