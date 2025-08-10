// Test cases for duplicate occurrence count display

export function OccurrenceCountDisplay() {
  return (
    <>
      {/* 2 occurrences - no count shown */}
      <div className="flex flex" />
      <div className="p-4 m-2 p-4" />

      {/* 3 occurrences - shows "appears 3 times" */}
      <div className="flex flex flex" />
      <div className="p-4 p-4 p-4" />

      {/* 4 occurrences - shows "appears 4 times" */}
      <div className="m-2 m-2 m-2 m-2" />

      {/* 5+ occurrences */}
      <div className="bg-red-500 bg-red-500 bg-red-500 bg-red-500 bg-red-500" />

      {/* Mixed counts in same className */}
      <div className="flex flex p-4 p-4 p-4 m-2 m-2 m-2 m-2" />
    </>
  );
}

// Test with variants
export function VariantOccurrenceCount() {
  return (
    <>
      {/* 2 occurrences of variant class */}
      <div className="hover:bg-blue-500 hover:bg-blue-500" />

      {/* 3+ occurrences of variant class */}
      <div className="dark:text-white dark:text-white dark:text-white" />

      {/* Mixed regular and variant duplicates */}
      <div className="p-4 p-4 p-4 hover:bg-red-500 hover:bg-red-500 hover:bg-red-500" />
    </>
  );
}

// Test with important modifier
export function ImportantOccurrenceCount() {
  return (
    <>
      {/* 2 occurrences */}
      <div className="!p-4 !p-4" />

      {/* 3+ occurrences */}
      <div className="!m-2 !m-2 !m-2" />

      {/* Many occurrences */}
      <div className="!bg-blue-500 !bg-blue-500 !bg-blue-500 !bg-blue-500 !bg-blue-500" />
    </>
  );
}

// Test with negative values
export function NegativeValueOccurrenceCount() {
  return (
    <>
      {/* 2 occurrences */}
      <div className="-mt-4 -mt-4" />

      {/* 3+ occurrences */}
      <div className="-mb-2 -mb-2 -mb-2" />

      {/* Many occurrences */}
      <div className="-ml-8 -ml-8 -ml-8 -ml-8" />
    </>
  );
}

// Test in function contexts
export function FunctionContextOccurrenceCount() {
  const twoOccurrences = clsx("flex flex");
  const threeOccurrences = cn("p-4 p-4 p-4");
  const manyOccurrences = tw`m-2 m-2 m-2 m-2 m-2`;

  return (
    <>
      <div className={twoOccurrences} />
      <div className={threeOccurrences} />
      <div className={manyOccurrences} />
    </>
  );
}
