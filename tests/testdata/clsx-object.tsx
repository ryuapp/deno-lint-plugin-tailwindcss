import clsx from "clsx";
export function Component() {
  const isActive = true;
  return (
    <div
      className={clsx({
        "opacity-50 cursor-not-allowed": !isActive,
        "shadow-lg scale-105": isActive,
      })}
    >
      Test
    </div>
  );
}
