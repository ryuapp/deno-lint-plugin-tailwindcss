export function Component() {
  const color = "blue";
  const className = `text-white bg-${color}-500 flex`;
  return <div className={className}>Test</div>;
}
