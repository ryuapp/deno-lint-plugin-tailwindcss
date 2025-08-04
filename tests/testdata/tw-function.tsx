import { tw } from "twind";

export default function TwFunctionTest() {
  return (
    <div>
      {/* tw function with unsorted classes */}
      <div className={tw`p-4 bg-blue-500 text-white`} />

      {/* tw function with template literal expressions */}
      <div
        className={tw`bg-red-500 ${
          isActive ? "opacity-100" : "opacity-50"
        } text-white`}
      />

      {/* tw function with sorted classes - should have no errors */}
      <div className={tw`bg-blue-500 p-4 text-white`} />
    </div>
  );
}
