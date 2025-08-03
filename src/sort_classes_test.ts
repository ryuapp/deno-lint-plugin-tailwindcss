import { assertEquals } from "@std/assert";
import { sortClasses } from "./sort_classes.ts";

Deno.test("sortClasses - basic functionality", () => {
  const input = ["p-4", "bg-blue-500", "text-white", "m-2"];
  const expected = ["m-2", "bg-blue-500", "p-4", "text-white"];
  const result = sortClasses(input);
  assertEquals(result, expected);
});

Deno.test("sortClasses - with variants", () => {
  const input = ["hover:bg-blue-700", "p-4", "bg-blue-500", "hover:text-white"];
  const expected = [
    "bg-blue-500",
    "p-4",
    "hover:bg-blue-700",
    "hover:text-white",
  ];
  const result = sortClasses(input);
  assertEquals(result, expected);
});

Deno.test("sortClasses - responsive variants", () => {
  const input = ["lg:p-8", "p-4", "md:p-6", "sm:p-5"];
  const expected = ["p-4", "sm:p-5", "md:p-6", "lg:p-8"];
  const result = sortClasses(input);
  assertEquals(result, expected);
});

Deno.test("sortClasses - complex layout classes", () => {
  const input = [
    "grid",
    "grid-cols-3",
    "gap-4",
    "p-4",
    "bg-gray-100",
    "flex",
    "flex-col",
    "items-center",
  ];
  const expected = [
    "flex",
    "grid",
    "flex-col",
    "grid-cols-3",
    "items-center",
    "gap-4",
    "bg-gray-100",
    "p-4",
  ];
  const result = sortClasses(input);
  assertEquals(result, expected);
});

Deno.test("sortClasses - modern layout with svh unit", () => {
  const input = [
    "h-[100svh]",
    "w-screen",
    "min-h-[100svh]",
    "max-h-screen",
    "h-screen",
  ];
  const expected = [
    "h-screen",
    "h-[100svh]",
    "max-h-screen",
    "min-h-[100svh]",
    "w-screen",
  ];
  const result = sortClasses(input);
  assertEquals(result, expected);
});

Deno.test("sortClasses - empty array", () => {
  assertEquals(sortClasses([]), []);
});

Deno.test("sortClasses - single class", () => {
  assertEquals(sortClasses(["p-4"]), ["p-4"]);
});

Deno.test("sortClasses - duplicate classes", () => {
  const input = ["p-4", "bg-blue-500", "p-4", "text-white"];
  const expected = ["bg-blue-500", "p-4", "text-white"];
  const result = sortClasses(input);
  assertEquals(result, expected);
});

Deno.test("sortClasses - with arbitrary values", () => {
  const input = [
    "p-[10px]",
    "m-[20px]",
    "bg-[#123456]",
    "text-[color:var(--primary)]",
  ];
  const expected = [
    "m-[20px]",
    "bg-[#123456]",
    "p-[10px]",
    "text-[color:var(--primary)]",
  ];
  const result = sortClasses(input);
  assertEquals(result, expected);
});

Deno.test("sortClasses - complex variants", () => {
  const input = [
    "dark:hover:bg-gray-800",
    "hover:bg-gray-200",
    "dark:bg-gray-900",
    "bg-white",
  ];
  const expected = [
    "bg-white",
    "hover:bg-gray-200",
    "dark:bg-gray-900",
    "dark:hover:bg-gray-800",
  ];
  const result = sortClasses(input);
  assertEquals(result, expected);
});

Deno.test("sortClasses - responsive with arbitrary", () => {
  const input = [
    "md:w-[300px]",
    "w-full",
    "lg:w-1/2",
    "sm:w-[200px]",
  ];
  const expected = [
    "w-full",
    "sm:w-[200px]",
    "md:w-[300px]",
    "lg:w-1/2",
  ];
  const result = sortClasses(input);
  assertEquals(result, expected);
});

Deno.test("sortClasses - modifier variants", () => {
  const input = [
    "first:mt-0",
    "last:mb-0",
    "odd:bg-gray-100",
    "even:bg-white",
    "mt-4",
    "mb-4",
    "bg-gray-50",
  ];
  const expected = [
    "mt-4",
    "mb-4",
    "bg-gray-50",
    "first:mt-0",
    "last:mb-0",
    "odd:bg-gray-100",
    "even:bg-white",
  ];
  const result = sortClasses(input);
  assertEquals(result, expected);
});

Deno.test("sortClasses - peer and group variants", () => {
  const input = [
    "peer-checked:bg-blue-500",
    "group-focus:text-white",
    "peer-hover:text-red-500",
    "group-active:bg-green-500",
    "flex",
  ];
  const expected = [
    "flex",
    "group-focus:text-white",
    "group-active:bg-green-500",
    "peer-checked:bg-blue-500",
    "peer-hover:text-red-500",
  ];
  const result = sortClasses(input);
  assertEquals(result, expected);
});

Deno.test("sortClasses - data attribute variants", () => {
  const input = [
    "data-[state=open]:text-white",
    "data-[disabled]:opacity-50",
    "flex",
  ];
  const expected = [
    "flex",
    "data-[state=open]:text-white",
    "data-[disabled]:opacity-50",
  ];
  const result = sortClasses(input);
  assertEquals(result, expected);
});

Deno.test("sortClasses - mixed complex cases", () => {
  const input = [
    "xl:group-hover:data-[state=open]:text-white",
    "sm:peer-focus:bg-blue-500",
    "lg:hover:text-gray-300",
    "flex",
    "md:dark:text-white",
  ];
  const expected = [
    "flex",
    "sm:peer-focus:bg-blue-500",
    "md:dark:text-white",
    "lg:hover:text-gray-300",
    "xl:group-hover:data-[state=open]:text-white",
  ];
  const result = sortClasses(input);
  assertEquals(result, expected);
});

Deno.test("sortClasses - utility classes order", () => {
  const input = [
    "text-white",
    "bg-blue-500",
    "border-gray-300",
    "shadow-lg",
    "rounded-md",
    "p-4",
    "m-2",
    "flex",
    "items-center",
  ];
  const expected = [
    "m-2",
    "flex",
    "items-center",
    "rounded-md",
    "border-gray-300",
    "bg-blue-500",
    "p-4",
    "text-white",
    "shadow-lg",
  ];
  const result = sortClasses(input);
  assertEquals(result, expected);
});

Deno.test("sortClasses - spacing utilities", () => {
  const input = [
    "space-y-4",
    "space-x-2",
    "gap-4",
    "flex",
    "p-4",
    "m-2",
  ];
  const expected = [
    "m-2",
    "flex",
    "gap-4",
    "space-x-2",
    "space-y-4",
    "p-4",
  ];
  const result = sortClasses(input);
  assertEquals(result, expected);
});

Deno.test("sortClasses - transforms and filters", () => {
  const input = [
    "scale-110",
    "rotate-45",
    "blur-sm",
    "brightness-50",
    "transform",
    "transition-all",
  ];
  const expected = [
    "rotate-45",
    "scale-110",
    "transform",
    "blur-sm",
    "brightness-50",
    "transition-all",
  ];
  const result = sortClasses(input);
  assertEquals(result, expected);
});

Deno.test("sortClasses - animation classes", () => {
  const input = [
    "animate-spin",
    "animate-bounce",
    "animate-pulse",
    "transition-colors",
    "duration-300",
    "ease-in-out",
  ];
  const expected = [
    "animate-bounce",
    "animate-pulse",
    "animate-spin",
    "transition-colors",
    "duration-300",
    "ease-in-out",
  ];
  const result = sortClasses(input);
  assertEquals(result, expected);
});

Deno.test("sortClasses - custom CSS properties", () => {
  const input = [
    "text-[color:var(--custom-color)]",
    "bg-[length:200px_100px]",
    "flex",
    "p-[calc(100%-20px)]",
  ];
  const expected = [
    "flex",
    "bg-[length:200px_100px]",
    "p-[calc(100%-20px)]",
    "text-[color:var(--custom-color)]",
  ];
  const result = sortClasses(input);
  assertEquals(result, expected);
});

Deno.test("sortClasses - container and prose", () => {
  const input = [
    "prose-lg",
    "prose",
    "container",
    "mx-auto",
    "max-w-4xl",
  ];
  const expected = [
    "prose",
    "prose-lg",
    "container",
    "mx-auto",
    "max-w-4xl",
  ];
  const result = sortClasses(input);
  assertEquals(result, expected);
});

Deno.test("sortClasses - content utilities", () => {
  const input = [
    "content-['']",
    "content-[attr(data-content)]",
    "before:content-['→']",
    "after:content-['']",
    "flex",
  ];
  const expected = [
    "flex",
    "content-['']",
    "content-[attr(data-content)]",
    "before:content-['→']",
    "after:content-['']",
  ];
  const result = sortClasses(input);
  assertEquals(result, expected);
});

Deno.test("sortClasses - negative values", () => {
  const input = [
    "p-4",
    "-mt-20",
    "mb-8",
    "-mx-4",
    "mt-4",
    "-mr-2",
    "ml-6",
  ];
  const expected = [
    "-mx-4", // mx comes first
    "-mt-20", // negative mt comes before positive mt
    "mt-4", // positive mt
    "-mr-2", // mr comes after mt
    "mb-8", // mb comes after mr
    "ml-6", // ml comes after mb
    "p-4", // padding comes after margin
  ];
  const result = sortClasses(input);
  assertEquals(result, expected);
});
