// Test cases for individual duplicate class reporting

export function IndividualDuplicates() {
  return (
    <>
      {/* Each duplicate class gets its own error */}
      <div className="flex p-4 flex items-center p-4" />

      {/* Multiple occurrences (3+) show count */}
      <div className="flex flex flex p-4 p-4 p-4" />

      {/* Different occurrence counts */}
      <div className="flex flex p-4 p-4 p-4 p-4 m-2 m-2 m-2" />

      {/* Duplicates with variants */}
      <div className="hover:bg-blue-500 p-4 hover:bg-blue-500 dark:bg-gray-800 p-4" />

      {/* Duplicates with important modifier */}
      <div className="!p-4 text-white !p-4 !m-2 !m-2" />

      {/* Duplicates with negative values */}
      <div className="-mt-4 p-4 -mt-4 -mb-2 -mb-2" />
    </>
  );
}

// Test in clsx function
export function ClsxDuplicates() {
  const classes = clsx(
    "flex flex-col flex items-center",
    "p-4 m-2 p-4 rounded-lg m-2",
  );

  return <div className={classes} />;
}

// Test in cn function
export function CnDuplicates() {
  const styles = cn(
    "p-4 m-2 p-4 rounded-lg m-2",
    "text-sm font-bold text-sm hover:text-lg",
  );

  return <div className={styles} />;
}

// Test in tw tagged template
export function TwDuplicates() {
  const styles = tw`
    text-sm font-bold text-sm hover:text-lg
    flex flex-col flex items-center
  `;

  return <div className={styles} />;
}

// Test in template literals
export function TemplateLiteralDuplicates() {
  const condition = true;

  return <div className={`flex flex-col ${condition} p-4 items-center p-4`} />;
}

// Test in object keys
export function ObjectKeyDuplicates() {
  const isActive = true;

  return (
    <div
      className={clsx({
        "p-4 m-2 p-4": isActive,
        "bg-red-500 text-white bg-red-500": !isActive,
      })}
    />
  );
}

// Test in arrays
export function ArrayDuplicates() {
  return (
    <div
      className={cn([
        "flex",
        "p-4",
        "flex",
        "items-center",
        "p-4",
      ])}
    />
  );
}

// Edge case: single duplicate
export function SingleDuplicate() {
  return <div className="flex flex" />;
}

// Edge case: many occurrences of same class
export function ManyOccurrences() {
  return <div className="p-4 p-4 p-4 p-4 p-4 p-4 p-4 p-4 p-4 p-4" />;
}
