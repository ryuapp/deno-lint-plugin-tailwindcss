import clsx from "clsx";

export function EdgeCases() {
  // Empty className
  const emptyClass = "";

  // Single class
  const singleClass = "flex";

  // Non-string value
  const numberValue = 123;

  // Template with variables
  const isActive = true;
  const baseClass = "flex";

  return (
    <div>
      {/* Empty className */}
      <div className="">Empty</div>

      {/* className with null */}
      <div className={null}>Null</div>

      {/* Single class variable */}
      <div className={singleClass}>Single</div>

      {/* Empty string variable */}
      <div className={emptyClass}>Empty var</div>

      {/* Template literal with single class */}
      <div className={`${baseClass}`}>Template single</div>

      {/* clsx with empty array */}
      <div className={clsx([])}>Empty array</div>

      {/* clsx with single class */}
      <div className={clsx("flex")}>Single clsx</div>

      {/* clsx mixed arguments */}
      <div
        className={clsx("flex", ["bg-blue-500"], { "text-white": isActive })}
      >
        Mixed
      </div>
    </div>
  );
}
