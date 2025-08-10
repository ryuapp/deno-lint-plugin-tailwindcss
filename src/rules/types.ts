/**
 * Information about a template literal's position relative to expressions.
 * Used to determine proper spacing when processing template literal parts.
 */
export interface TemplateInfo {
  /** Whether there is an expression after this template part */
  hasNextExpression: boolean;
  /** Whether there is an expression before this template part */
  hasPrevExpression: boolean;
}
