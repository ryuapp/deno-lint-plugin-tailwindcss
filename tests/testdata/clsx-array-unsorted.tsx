import clsx from "clsx";

export function Component() {
  return (
    <div
      className={clsx([
        "text-white",
        "bg-blue-500",
        "flex",
        "items-center",
      ])}
    >
      Array format
    </div>
  );
}
