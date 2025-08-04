import { sortClasses } from "./sort_classes.ts";
import {
  type ClassAnalysisResult,
  hasExtraWhitespace,
  isClassesSorted,
} from "./utils.ts";

/**
 * Information about a template literal's position relative to expressions.
 * Used to determine proper spacing when processing template literal parts.
 */
interface TemplateInfo {
  /** Whether there is an expression after this template part */
  hasNextExpression: boolean;
  /** Whether there is an expression before this template part */
  hasPrevExpression: boolean;
}

/**
 * Reports and fixes extra whitespace issues in Tailwind CSS class strings.
 * Handles both regular literals and template literal parts with different spacing rules.
 *
 * @param context - The lint rule execution context
 * @param node - The AST node containing the class string
 * @param value - The string value to check for extra whitespace
 * @param attributeName - Name of the attribute or context for error messages
 * @param isTemplateQuasi - Whether this is part of a template literal
 * @param templateInfo - Information about template literal positioning
 */
export function reportExtraWhitespace(
  context: Deno.lint.RuleContext,
  node: Deno.lint.Literal | Deno.lint.TemplateElement,
  value: string,
  attributeName: string,
  isTemplateQuasi = false,
  templateInfo?: TemplateInfo,
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
export function reportUnsortedClasses(
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
