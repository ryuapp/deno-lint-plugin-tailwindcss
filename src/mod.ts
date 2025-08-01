import { sortClasses } from "./sort_classes.ts";

interface ClassAnalysisResult {
  classes: string[];
  startIndex: number;
  endIndex: number;
  originalText: string;
}

type DenoLintNode =
  | Deno.lint.JSXElement
  | Deno.lint.Literal
  | Deno.lint.JSXExpressionContainer
  | Deno.lint.TemplateElement;

function extractClassesFromString(value: string): string[] {
  return value
    .split(/\s+/)
    .map((cls) => cls.trim())
    .filter((cls) => cls.length > 0);
}

function analyzeClassString(value: string): ClassAnalysisResult {
  const classes = extractClassesFromString(value);
  return {
    classes,
    startIndex: 0,
    endIndex: value.length,
    originalText: value,
  };
}

function hasExtraWhitespace(value: string): boolean {
  // Check for leading/trailing whitespace
  if (value !== value.trim()) return true;

  // Check for multiple consecutive spaces
  if (value.includes("  ")) return true;

  // Check for tabs or other whitespace characters
  if (/[\t\n\r\f\v]/.test(value)) return true;

  return false;
}

function isClassesSorted(classes: string[]): boolean {
  const sorted = sortClasses([...classes]);

  return classes.length === sorted.length &&
    classes.every((cls, index) => cls === sorted[index]);
}

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
  name: "ryu-tailwindcss-plugin",
  rules: {
    "sort-classes": {
      create(context) {
        function reportExtraWhitespace(
          node: DenoLintNode,
          value: string,
          attributeName: string,
        ) {
          if (hasExtraWhitespace(value)) {
            const cleanedValue = value.trim().replace(/\s+/g, " ");

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
                for (const element of expression.quasis || []) {
                  const analysis = extractClassesFromTemplateElement(element);
                  if (analysis) {
                    reportExtraWhitespace(
                      element,
                      analysis.originalText,
                      attrName,
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
                for (const element of arg.quasis || []) {
                  const analysis = extractClassesFromTemplateElement(element);
                  if (analysis) {
                    reportExtraWhitespace(
                      element,
                      analysis.originalText,
                      `${functionName}() template`,
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
                for (const element of init.quasis || []) {
                  const analysis = extractClassesFromTemplateElement(element);
                  if (analysis) {
                    reportExtraWhitespace(
                      element,
                      analysis.originalText,
                      `variable ${id.name} template`,
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
