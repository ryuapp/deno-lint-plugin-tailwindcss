export function Component() {
  const innerFlip = "rotate-180";
  return (
    <div className={`w-full ${innerFlip}`}>
      Template literal with space preservation
    </div>
  );
}
