export function Component() {
  const innerFlip = "rotate-180";
  return (
    <div className={`w-full${innerFlip}`}>
      Template literal without original space
    </div>
  );
}
