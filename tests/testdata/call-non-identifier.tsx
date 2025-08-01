export function Component() {
  const utils = { clsx: (classes: string) => classes };
  return <div className={utils.clsx("text-white bg-blue-500 flex")}>Test</div>;
}
