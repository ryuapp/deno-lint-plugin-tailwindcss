export function Component() {
  return (
    <>
      <div className="-mx-4 -mt-20 mt-4 mb-8 p-4">
        Negative margin values should be sorted with positive margins
      </div>

      <div className="translate-y-4 -rotate-45 hover:-translate-x-2">
        Negative transform values
      </div>

      <div className="-gap-2 -space-x-4 space-y-2">
        Negative spacing utilities
      </div>

      <div className="-z-10 z-20 -order-1 order-2">
        Negative z-index and order
      </div>

      <div className="-mr-2 sm:-mx-4 md:-mt-8 lg:-mb-12">
        Responsive negative values
      </div>
    </>
  );
}
