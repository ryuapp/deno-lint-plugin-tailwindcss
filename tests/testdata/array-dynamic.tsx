import clsx from "clsx";
export function Component() {
  const dynamicClass = "flex";
  return <div className={clsx([dynamicClass])}>Test</div>;
}
