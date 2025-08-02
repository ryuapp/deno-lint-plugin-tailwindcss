/** @jsxImportSource npm:react@^19.0.0 */
/** @jsxImportSourceTypes npm:@types/react@^19.0.0 */
import clsx from "npm:clsx@^2.1.1";

export function Component() {
  return (
    <div className="custom-class flex min-h-svh justify-center overflow-hidden bg-zinc-900 text-white !text-blue-500">
      Hello deno-lint-plugin-tailwindcss!
    </div>
  );
}

export function LiteralComponent() {
  return (
    <div
      className={`custom-class flex min-h-svh justify-center overflow-hidden bg-zinc-900 text-white !text-blue-500`}
    >
      Hello deno-lint-plugin-tailwindcss!
    </div>
  );
}

export function ClsxComponent() {
  const isActive = true;
  const isDisabled = false;

  return (
    <div
      className={clsx(
        "custom-class flex min-h-svh justify-center overflow-hidden",
        "bg-zinc-900 text-white",
        {
          "cursor-not-allowed opacity-50": isDisabled,
          "scale-105 shadow-lg": isActive,
        },
      )}
    >
      Hello with clsx!
    </div>
  );
}

export function ClsxArrayComponent() {
  return (
    <div
      className={clsx([
        "custom-class",
        "flex",
        "min-h-svh",
        "justify-center",
        "overflow-hidden",
        "bg-zinc-900",
        "text-white",
      ])}
    >
      Hello with clsx array!
    </div>
  );
}
