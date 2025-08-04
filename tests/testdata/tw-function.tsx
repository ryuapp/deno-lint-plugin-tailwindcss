import { tw } from "twind";

export default function TwFunctionTest() {
  return (
    <div>
      {/* tw function with sorted classes - should have no errors */}
      <div className={tw`bg-blue-500 p-4 text-white`} />

      {/* tw function with template literal expressions - sorted */}
      <div
        className={tw`bg-red-500 ${
          isActive ? "opacity-100" : "opacity-50"
        } text-white`}
      />

      {/* tw function with single class - no errors */}
      <div className={tw`text-center`} />
    </div>
  );
}
