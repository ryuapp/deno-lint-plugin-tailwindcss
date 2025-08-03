export function Component() {
  const x = "text-red-500";
  const y = "bg-blue-500";
  const z = "p-4";

  return (
    <div className={`${x} ${y} ${z}`}>
      Template with expressions
    </div>
  );
}
