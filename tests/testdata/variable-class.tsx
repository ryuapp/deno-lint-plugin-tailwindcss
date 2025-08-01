export function Component() {
  const className = "text-white bg-blue-500 flex p-4";
  const buttonStyle = "border-2 border-solid border-gray-300";
  return (
    <div>
      <div className={className}>Variable classes</div>
      <button className={buttonStyle}>Button</button>
    </div>
  );
}
