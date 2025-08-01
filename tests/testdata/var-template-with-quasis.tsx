export function Component() {
  const color = "red";
  const className = `flex bg-${color}-500 text-white p-4`;
  return <div className={className}>Test</div>;
}
