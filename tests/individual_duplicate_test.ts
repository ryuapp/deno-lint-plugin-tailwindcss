import { assertEquals } from "@std/assert";
import plugin from "../src/mod.ts";
import { runLintPlugin } from "./test-utils.ts";

Deno.test("reports each duplicate class individually", () => {
  const code = `<div className="flex p-4 flex items-center p-4" />`;
  const diagnostics = runLintPlugin(plugin, code);

  const duplicateErrors = diagnostics.filter((d) =>
    d.message.includes("Duplicate TailwindCSS class")
  );

  assertEquals(duplicateErrors.length, 2);

  const flexError = duplicateErrors.find((d) => d.message.includes('"flex"'));
  assertEquals(
    flexError?.message,
    'Duplicate TailwindCSS class "flex" found in className',
  );

  const p4Error = duplicateErrors.find((d) => d.message.includes('"p-4"'));
  assertEquals(
    p4Error?.message,
    'Duplicate TailwindCSS class "p-4" found in className',
  );
});

Deno.test("shows occurrence count for classes appearing 3+ times", () => {
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

Deno.test("correctly reports different occurrence counts", () => {
  const code = `<div className="flex flex p-4 p-4 p-4 p-4 m-2 m-2 m-2" />`;
  const diagnostics = runLintPlugin(plugin, code);

  const duplicateErrors = diagnostics.filter((d) =>
    d.message.includes("Duplicate TailwindCSS class")
  );

  assertEquals(duplicateErrors.length, 3);

  const flexError = duplicateErrors.find((d) => d.message.includes('"flex"'));
  assertEquals(
    flexError?.message,
    'Duplicate TailwindCSS class "flex" found in className',
  );

  const p4Error = duplicateErrors.find((d) => d.message.includes('"p-4"'));
  assertEquals(
    p4Error?.message,
    'Duplicate TailwindCSS class "p-4" found in className (appears 4 times)',
  );

  const m2Error = duplicateErrors.find((d) => d.message.includes('"m-2"'));
  assertEquals(
    m2Error?.message,
    'Duplicate TailwindCSS class "m-2" found in className (appears 3 times)',
  );
});
