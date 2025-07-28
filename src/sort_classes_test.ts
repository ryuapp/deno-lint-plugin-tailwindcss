import { assertEquals } from "@std/assert";
import { sortClasses } from "./sort_classes.ts";

Deno.test("sortClasses - basic functionality", () => {
  const input = ["text-red-500", "p-4", "bg-blue-600", "m-2"];
  const expected = ["m-2", "bg-blue-600", "p-4", "text-red-500"];
  const result = sortClasses(input);
  assertEquals(result, expected);
});

Deno.test("sortClasses - with variants", () => {
  const input = [
    "hover:bg-red-500",
    "focus:text-blue-600",
    "bg-green-400",
    "p-4",
  ];
  const expected = [
    "bg-green-400",
    "hover:bg-red-500",
    "p-4",
    "focus:text-blue-600",
  ];
  const result = sortClasses(input);

  assertEquals(result, expected);
});

Deno.test("sortClasses - responsive variants", () => {
  const input = ["lg:text-xl", "md:p-8", "sm:m-4", "text-base"];
  const expected = ["sm:m-4", "md:p-8", "text-base", "lg:text-xl"];
  const result = sortClasses(input);

  assertEquals(result, expected);
});

Deno.test("sortClasses - complex layout classes", () => {
  const input = [
    "text-center",
    "flex",
    "items-center",
    "justify-center",
    "h-screen",
    "w-full",
    "bg-gray-100",
  ];
  const expected = [
    "flex",
    "h-screen",
    "w-full",
    "items-center",
    "justify-center",
    "bg-gray-100",
    "text-center",
  ];
  const result = sortClasses(input);

  assertEquals(result, expected);
});

Deno.test("sortClasses - complex layout classes 2", () => {
  const input = [
    "text-center",
    "flex",
    "items-center",
    "justify-center",
    "h-screen",
    "w-full",
    "bg-gray-100",
  ];
  const expected = [
    "flex",
    "h-screen",
    "w-full",
    "items-center",
    "justify-center",
    "bg-gray-100",
    "text-center",
  ];
  const result = sortClasses(input);

  assertEquals(result, expected);
});

Deno.test("sortClasses - modern layout with svh unit", () => {
  const input = [
    "bg-zinc-900",
    "text-white",
    "overflow-hidden",
    "flex",
    "min-h-svh",
    "justify-center",
  ];
  const expected = [
    "flex",
    "min-h-svh",
    "justify-center",
    "overflow-hidden",
    "bg-zinc-900",
    "text-white",
  ];
  const result = sortClasses(input);

  assertEquals(result, expected);
});
