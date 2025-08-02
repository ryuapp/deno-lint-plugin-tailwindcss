export function Component() {
  const size = "large";
  const color = "blue";
  return (
    <div className={`w-full ${size} bg-${color}-500 text-white`}>
      Multiple expressions
    </div>
  );
}
