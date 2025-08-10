export function runLintPlugin(
  plugin: Deno.lint.Plugin,
  content: string,
): Array<Deno.lint.Diagnostic> {
  return Deno.lint.runPlugin(
    plugin,
    "nonexistent.tsx",
    content,
  );
}

export async function runLintPluginFromFile(
  plugin: Deno.lint.Plugin,
  filename: string,
): Promise<Array<Deno.lint.Diagnostic>> {
  const path = `./tests/testdata/${filename}`;
  const content = await Deno.readTextFile(path);
  return await Deno.lint.runPlugin(
    plugin,
    path,
    content,
  );
}
