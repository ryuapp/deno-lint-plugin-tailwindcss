import { cn } from "lib/utils";

export function Component() {
  return (
    <div className={cn("text-white bg-blue-500", "flex p-4")}>
      cn function
    </div>
  );
}
