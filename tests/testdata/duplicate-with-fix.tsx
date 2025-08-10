// Test cases for duplicate class detection with fix suggestions

export function DuplicateWithFix() {
  return (
    <>
      {/* Simple duplicate removal */}
      <div className="flex p-4 flex items-center p-4" />
      {/* Fix: "flex p-4 items-center" */}

      {/* Multiple duplicates of same class */}
      <div className="flex flex flex flex" />
      {/* Fix: "flex" */}

      {/* Complex mixed duplicates */}
      <div className="p-4 m-2 p-4 rounded p-4 m-2 shadow m-2" />
      {/* Fix: "p-4 m-2 rounded shadow" */}
    </>
  );
}

// Test fix in different contexts
export function ContextualFixes() {
  // In clsx
  const clsxClasses = clsx("flex flex-col flex items-center flex-col");
  // Fix: "flex flex-col items-center"

  // In cn
  const cnClasses = cn("p-4 m-2 p-4 rounded-lg m-2");
  // Fix: "p-4 m-2 rounded-lg"

  // In tw template
  const twClasses = tw`text-sm font-bold text-sm hover:text-lg font-bold`;
  // Fix: "text-sm font-bold hover:text-lg"

  return (
    <>
      <div className={clsxClasses} />
      <div className={cnClasses} />
      <div className={twClasses} />
    </>
  );
}

// Test fix with variants
export function VariantDuplicateFixes() {
  return (
    <>
      {/* Variant duplicates */}
      <div className="hover:bg-blue-500 p-4 hover:bg-blue-500 dark:bg-gray-800 p-4" />
      {/* Fix: "hover:bg-blue-500 p-4 dark:bg-gray-800" */}

      {/* Multiple variant duplicates */}
      <div className="sm:p-4 md:p-6 sm:p-4 lg:p-8 md:p-6" />
      {/* Fix: "sm:p-4 md:p-6 lg:p-8" */}

      {/* Mixed regular and variant duplicates */}
      <div className="text-white hover:text-blue-500 text-white hover:text-blue-500" />
      {/* Fix: "text-white hover:text-blue-500" */}
    </>
  );
}

// Test fix with modifiers
export function ModifierDuplicateFixes() {
  return (
    <>
      {/* Important modifier duplicates */}
      <div className="!p-4 text-white !p-4 !m-2 !m-2" />
      {/* Fix: "!p-4 text-white !m-2" */}

      {/* Negative value duplicates */}
      <div className="-mt-4 p-4 -mt-4 -mb-2 -mb-2" />
      {/* Fix: "-mt-4 p-4 -mb-2" */}

      {/* Mixed modifiers */}
      <div className="!-mt-4 !p-4 !-mt-4 -mb-2 !p-4 -mb-2" />
      {/* Fix: "!-mt-4 !p-4 -mb-2" */}
    </>
  );
}

// Test fix in template literals
export function TemplateLiteralFixes() {
  const condition = true;

  return (
    <>
      {/* Template with expression */}
      <div className={`flex flex-col ${condition} p-4 flex-col p-4`} />
      {/* Fix would remove duplicates from each template part */}

      {/* Multi-line template */}
      <div
        className={`
        flex items-center
        p-4 m-2
        flex justify-between
        p-4 rounded
      `}
      />
      {/* Fix: removes duplicate flex and p-4 */}
    </>
  );
}

// Test fix in arrays
export function ArrayDuplicateFixes() {
  return (
    <>
      {/* String array */}
      <div
        className={cn([
          "flex",
          "p-4",
          "flex",
          "items-center",
          "p-4",
        ])}
      />
      {/* Fix: ["flex", "p-4", "items-center"] */}

      {/* Mixed array */}
      <div
        className={clsx([
          "base-class base-class",
          condition && "conditional conditional",
          ["nested", "nested"],
        ])}
      />
      {/* Fix: removes duplicates from each element */}
    </>
  );
}

// Test fix in object keys
export function ObjectKeyDuplicateFixes() {
  const isActive = true;

  return (
    <>
      {/* Object with duplicate classes in keys */}
      <div
        className={clsx({
          "p-4 m-2 p-4": isActive,
          "bg-red-500 text-white bg-red-500": !isActive,
        })}
      />
      {/* Fix: {"p-4 m-2": isActive, "bg-red-500 text-white": !isActive} */}

      {/* Multiple object keys with duplicates */}
      <div
        className={cn({
          "flex flex": condition1,
          "p-4 p-4": condition2,
          "m-2 m-2": condition3,
        })}
      />
      {/* Fix: removes duplicates from each key */}
    </>
  );
}

// Test edge cases for fixes
export function EdgeCaseFixes() {
  return (
    <>
      {/* Empty after removing duplicates? */}
      <div className="" />
      {/* No fix needed */}

      {/* Whitespace preservation */}
      <div className="  flex  p-4  flex  " />
      {/* Fix should handle whitespace properly */}
    </>
  );
}
