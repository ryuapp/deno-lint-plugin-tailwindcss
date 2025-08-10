import { sortClassesRule } from "./rules/sort_classes.ts";
import { noDuplicateClassesRule } from "./rules/no_duplicate_classes.ts";
import { noUnnecessaryWhitespaceRule } from "./rules/no_unnecessary_whitespace.ts";

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
    "sort-classes": sortClassesRule,
    "no-duplicate-classes": noDuplicateClassesRule,
    "no-unnecessary-whitespace": noUnnecessaryWhitespaceRule,
  },
};

export default plugin;
