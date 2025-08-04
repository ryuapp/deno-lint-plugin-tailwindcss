import { tw } from "twind";

export default function TwFunctionUnsortedTest() {
  return (
    <div>
      {/* tw function with unsorted classes - should trigger sorting error */}
      <div className={tw`text-white p-4 bg-blue-500`} />

      {/* tw function with whitespace issues */}
      <div className={tw`  bg-red-500   p-2   text-white  `} />

      {/* tw function with template literal expressions and unsorted classes */}
      <div
        className={tw`text-white ${
          isActive ? "opacity-100" : "opacity-50"
        } bg-red-500`}
      />

      {/* tw function with mixed issues - whitespace and sorting */}
      <div className={tw` text-black  p-8  bg-white `} />
    </div>
  );
}
