export function Component(props: { class?: string }) {
  return (
    <div
      className={`text-center ${props.class}`}
    >
      Template literal should preserve space before expression
    </div>
  );
}
