import clsx from "clsx";
export function Component() {
  const key = "flex bg-blue-500";
  return <div className={clsx({ [key]: true })}>Test</div>;
}
