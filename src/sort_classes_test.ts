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

Deno.test("sortClasses - empty array", () => {
  const input: string[] = [];
  const expected: string[] = [];
  const result = sortClasses(input);
  assertEquals(result, expected);
});

Deno.test("sortClasses - single class", () => {
  const input = ["flex"];
  const expected = ["flex"];
  const result = sortClasses(input);
  assertEquals(result, expected);
});

Deno.test("sortClasses - duplicate classes", () => {
  const input = ["flex", "flex", "p-4"];
  const expected = ["flex", "flex", "p-4"];
  const result = sortClasses(input);
  assertEquals(result, expected);
});

Deno.test("sortClasses - with arbitrary values", () => {
  const input = ["text-[#ff0000]", "bg-[rgb(255,0,0)]", "flex", "p-[10px]"];
  const expected = ["flex", "bg-[rgb(255,0,0)]", "p-[10px]", "text-[#ff0000]"];
  const result = sortClasses(input);
  assertEquals(result, expected);
});

Deno.test("sortClasses - complex variants", () => {
  const input = [
    "group-hover:text-white",
    "peer-focus:bg-blue-500",
    "dark:hover:text-gray-300",
    "flex",
    "lg:group-hover:text-red-500",
  ];
  const expected = [
    "flex",
    "peer-focus:bg-blue-500",
    "group-hover:text-white",
    "dark:hover:text-gray-300",
    "lg:group-hover:text-red-500",
  ];
  const result = sortClasses(input);
  assertEquals(result, expected);
});

Deno.test("sortClasses - responsive with arbitrary", () => {
  const input = [
    "sm:text-[14px]",
    "md:bg-[#123456]",
    "lg:p-[20px]",
    "text-base",
  ];
  const expected = [
    "md:bg-[#123456]",
    "lg:p-[20px]",
    "text-base",
    "sm:text-[14px]",
  ];
  const result = sortClasses(input);
  assertEquals(result, expected);
});

Deno.test("sortClasses - modifier variants", () => {
  const input = [
    "hover:focus:text-white",
    "focus:hover:bg-blue-500",
    "active:text-red-500",
    "flex",
  ];
  const expected = [
    "flex",
    "active:text-red-500",
    "hover:focus:text-white",
    "focus:hover:bg-blue-500",
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
    "group-active:bg-green-500",
    "peer-checked:bg-blue-500",
    "group-focus:text-white",
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
    "xl:group-hover:data-[state=open]:text-white",
    "sm:peer-focus:bg-blue-500",
    "lg:hover:text-gray-300",
    "md:dark:text-white",
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
    "animate-spin",
    "animate-bounce",
    "animate-pulse",
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
    "p-[calc(100%-20px)]",
    "text-[color:var(--custom-color)]",
    "bg-[length:200px_100px]",
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
    "container",
    "mx-auto",
    "max-w-4xl",
    "prose-lg",
    "prose",
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
