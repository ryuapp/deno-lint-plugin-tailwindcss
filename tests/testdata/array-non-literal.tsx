import clsx from "clsx";
export function Component() {
  const classes = "flex bg-blue-500";
  return <div className={clsx([classes, "text-white"])}>Test</div>;
}
