// Simple test case for duplicate class detection

export function TestDuplicates() {
  return (
    <>
      {/* Duplicates: flex and p-4 */}
      <div className="flex p-4 flex items-center p-4" />

      {/* Duplicate: bg-blue-500 */}
      <div class="bg-blue-500 text-white bg-blue-500" />

      {/* No duplicates */}
      <div className="flex items-center p-4" />
    </>
  );
}
