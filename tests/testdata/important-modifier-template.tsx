export function Component() {
  const extraClass = "!font-bold";
  return (
    <div className={`text-blue-500 ${extraClass} bg-gray-100`}>
      Important modifier in template
    </div>
  );
}
