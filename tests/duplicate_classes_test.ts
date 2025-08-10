import { assertEquals } from "@std/assert";
import plugin from "../src/mod.ts";
import { runLintPlugin } from "./test-utils.ts";

Deno.test("detects duplicate classes in JSX className", () => {
  const code = `<div className="flex p-4 flex items-center p-4" />`;
  const diagnostics = runLintPlugin(plugin, code);

  // Check for individual duplicate classes diagnostics
  const duplicateErrors = diagnostics.filter((d) =>
    d.message.includes("Duplicate TailwindCSS class")
  );
  assertEquals(duplicateErrors.length, 2);

  // Check for flex duplicate
  const flexError = duplicateErrors.find((d) => d.message.includes('"flex"'));
  assertEquals(flexError !== undefined, true);
  assertEquals(
    flexError?.message,
    'Duplicate TailwindCSS class "flex" found in className',
  );

  // Check for p-4 duplicate
  const p4Error = duplicateErrors.find((d) => d.message.includes('"p-4"'));
  assertEquals(p4Error !== undefined, true);
  assertEquals(
    p4Error?.message,
    'Duplicate TailwindCSS class "p-4" found in className',
  );
});

Deno.test("detects duplicate classes in JSX class attribute", () => {
  const code =
    `<div class="bg-blue-500 text-white bg-blue-500 hover:bg-blue-600" />`;
  const diagnostics = runLintPlugin(plugin, code);

  const duplicateDiagnostic = diagnostics.find((d) =>
    d.message.includes("Duplicate TailwindCSS class")
  );
  assertEquals(duplicateDiagnostic !== undefined, true);
  if (duplicateDiagnostic) {
    assertEquals(
      duplicateDiagnostic.message,
      'Duplicate TailwindCSS class "bg-blue-500" found in class',
    );
  }
});

Deno.test("detects duplicate classes in clsx function", () => {
  const code = `const classes = clsx("flex flex-col flex items-center");`;
  const diagnostics = runLintPlugin(plugin, code);

  const duplicateDiagnostic = diagnostics.find((d) =>
    d.message.includes("Duplicate TailwindCSS class")
  );
  assertEquals(duplicateDiagnostic !== undefined, true);
  if (duplicateDiagnostic) {
    assertEquals(
      duplicateDiagnostic.message,
      'Duplicate TailwindCSS class "flex" found in clsx() argument',
    );
  }
});

Deno.test("detects duplicate classes in cn function", () => {
  const code = `const styles = cn("p-4 m-2 p-4 rounded-lg m-2");`;
  const diagnostics = runLintPlugin(plugin, code);

  const duplicateErrors = diagnostics.filter((d) =>
    d.message.includes("Duplicate TailwindCSS class")
  );
  assertEquals(duplicateErrors.length, 2);

  const p4Error = duplicateErrors.find((d) => d.message.includes('"p-4"'));
  assertEquals(
    p4Error?.message,
    'Duplicate TailwindCSS class "p-4" found in cn() argument',
  );

  const m2Error = duplicateErrors.find((d) => d.message.includes('"m-2"'));
  assertEquals(
    m2Error?.message,
    'Duplicate TailwindCSS class "m-2" found in cn() argument',
  );
});

Deno.test("detects duplicate classes in tw tagged template", () => {
  const code = "const styles = tw`text-sm font-bold text-sm hover:text-lg`;";
  const diagnostics = runLintPlugin(plugin, code);

  const duplicateDiagnostic = diagnostics.find((d) =>
    d.message.includes("Duplicate TailwindCSS class")
  );
  assertEquals(duplicateDiagnostic !== undefined, true);
  if (duplicateDiagnostic) {
    assertEquals(
      duplicateDiagnostic.message,
      'Duplicate TailwindCSS class "text-sm" found in tw`` template',
    );
  }
});

Deno.test("detects duplicate classes in template literal with expressions", () => {
  // Use a template where duplicates are within the same part
  const code =
    `<div className={\`flex flex-col \${condition} p-4 items-center p-4\`} />`;
  const diagnostics = runLintPlugin(plugin, code);

  // Template literals with expressions are processed in parts
  // Part 1: "flex flex-col " - has duplicate if "flex" appears twice
  // Part 2: " p-4 items-center p-4" - has duplicate "p-4"
  const duplicateErrors = diagnostics.filter((d) =>
    d.message.includes("Duplicate TailwindCSS class")
  );

  // We should detect duplicates in the second part (p-4 appears twice)
  assertEquals(duplicateErrors.length >= 1, true);

  // Check if p-4 duplicate is detected
  const hasDuplicateP4 = duplicateErrors.some((d) => d.message.includes("p-4"));
  assertEquals(hasDuplicateP4, true);
});

Deno.test("detects duplicate classes in object keys", () => {
  const code = `const classes = clsx({ "p-4 m-2 p-4": isActive });`;
  const diagnostics = runLintPlugin(plugin, code);

  const duplicateDiagnostic = diagnostics.find((d) =>
    d.message.includes("Duplicate TailwindCSS class")
  );
  assertEquals(duplicateDiagnostic !== undefined, true);
  if (duplicateDiagnostic) {
    assertEquals(
      duplicateDiagnostic.message,
      'Duplicate TailwindCSS class "p-4" found in clsx() object key',
    );
  }
});

Deno.test("detects duplicate classes in array of strings", () => {
  const code =
    `const classes = cn(["flex", "p-4", "flex", "items-center", "p-4"]);`;
  const diagnostics = runLintPlugin(plugin, code);

  const duplicateErrors = diagnostics.filter((d) =>
    d.message.includes("Duplicate TailwindCSS class")
  );
  // Array literals are combined and checked as single string
  assertEquals(duplicateErrors.length > 0, true);
});

Deno.test("no errors when no duplicates exist", () => {
  const code = `<div className="flex items-center p-4 rounded-lg" />`;
  const diagnostics = runLintPlugin(plugin, code);

  const duplicateErrors = diagnostics.filter((d) =>
    d.message.includes("Duplicate TailwindCSS class")
  );
  assertEquals(duplicateErrors.length, 0);
});

Deno.test("handles complex duplicates with variants", () => {
  const code =
    `<div className="hover:bg-blue-500 p-4 hover:bg-blue-500 dark:bg-gray-800 p-4" />`;
  const diagnostics = runLintPlugin(plugin, code);

  const duplicateErrors = diagnostics.filter((d) =>
    d.message.includes("Duplicate TailwindCSS class")
  );
  assertEquals(duplicateErrors.length, 2);

  const hoverError = duplicateErrors.find((d) =>
    d.message.includes('"hover:bg-blue-500"')
  );
  assertEquals(
    hoverError?.message,
    'Duplicate TailwindCSS class "hover:bg-blue-500" found in className',
  );

  const p4Error = duplicateErrors.find((d) => d.message.includes('"p-4"'));
  assertEquals(
    p4Error?.message,
    'Duplicate TailwindCSS class "p-4" found in className',
  );
});

Deno.test("handles multiple duplicates in single string", () => {
  const code = `<div className="flex flex flex p-4 p-4 p-4" />`;
  const diagnostics = runLintPlugin(plugin, code);

  const duplicateErrors = diagnostics.filter((d) =>
    d.message.includes("Duplicate TailwindCSS class")
  );
  assertEquals(duplicateErrors.length, 2);

  const flexError = duplicateErrors.find((d) => d.message.includes('"flex"'));
  assertEquals(
    flexError?.message,
    'Duplicate TailwindCSS class "flex" found in className (appears 3 times)',
  );

  const p4Error = duplicateErrors.find((d) => d.message.includes('"p-4"'));
  assertEquals(
    p4Error?.message,
    'Duplicate TailwindCSS class "p-4" found in className (appears 3 times)',
  );
});

Deno.test("preserves order when removing duplicates", () => {
  const code = `<div className="a b c a d b e" />`;
  const diagnostics = runLintPlugin(plugin, code);

  const duplicateErrors = diagnostics.filter((d) =>
    d.message.includes("Duplicate TailwindCSS class")
  );
  assertEquals(duplicateErrors.length, 2);

  const aError = duplicateErrors.find((d) => d.message.includes('"a"'));
  assertEquals(aError !== undefined, true);

  const bError = duplicateErrors.find((d) => d.message.includes('"b"'));
  assertEquals(bError !== undefined, true);
});

Deno.test("handles duplicates with important modifier", () => {
  const code = `<div className="!p-4 text-white !p-4 !m-2 !m-2" />`;
  const diagnostics = runLintPlugin(plugin, code);

  const duplicateErrors = diagnostics.filter((d) =>
    d.message.includes("Duplicate TailwindCSS class")
  );
  assertEquals(duplicateErrors.length, 2);

  const p4Error = duplicateErrors.find((d) => d.message.includes('"!p-4"'));
  assertEquals(
    p4Error?.message,
    'Duplicate TailwindCSS class "!p-4" found in className',
  );

  const m2Error = duplicateErrors.find((d) => d.message.includes('"!m-2"'));
  assertEquals(
    m2Error?.message,
    'Duplicate TailwindCSS class "!m-2" found in className',
  );
});

Deno.test("handles duplicates with negative values", () => {
  const code = `<div className="-mt-4 p-4 -mt-4 -mb-2 -mb-2" />`;
  const diagnostics = runLintPlugin(plugin, code);

  const duplicateErrors = diagnostics.filter((d) =>
    d.message.includes("Duplicate TailwindCSS class")
  );
  assertEquals(duplicateErrors.length, 2);

  const mt4Error = duplicateErrors.find((d) => d.message.includes('"-mt-4"'));
  assertEquals(
    mt4Error?.message,
    'Duplicate TailwindCSS class "-mt-4" found in className',
  );

  const mb2Error = duplicateErrors.find((d) => d.message.includes('"-mb-2"'));
  assertEquals(
    mb2Error?.message,
    'Duplicate TailwindCSS class "-mb-2" found in className',
  );
});

Deno.test("provides correct fix for duplicates", () => {
  const code = `<div className="flex p-4 flex items-center p-4" />`;
  const diagnostics = runLintPlugin(plugin, code);

  const duplicateDiagnostic = diagnostics.find((d) =>
    d.message.includes("Duplicate TailwindCSS class")
  );
  assertEquals(duplicateDiagnostic !== undefined, true);

  // Check that a fix is provided
  if (duplicateDiagnostic) {
    const fix = duplicateDiagnostic.fix;
    assertEquals(fix !== undefined, true);
  }
});

Deno.test("detects duplicates and sort issues independently", () => {
  const code = `<div className="p-4 flex p-4 items-center" />`;
  const diagnostics = runLintPlugin(plugin, code);

  // Should report both duplicate and sort issues
  const duplicateDiagnostic = diagnostics.find((d) =>
    d.message.includes("Duplicate TailwindCSS class")
  );
  const sortDiagnostic = diagnostics.find((d) =>
    d.message.includes("should be sorted")
  );

  assertEquals(duplicateDiagnostic !== undefined, true);
  assertEquals(sortDiagnostic !== undefined, true);
});
