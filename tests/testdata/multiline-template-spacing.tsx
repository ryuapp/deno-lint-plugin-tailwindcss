export function Component(props: { class?: string }) {
  return (
    <div
      className={`${
        props.class ? "" : "mt-8"
      } flex items-end justify-between overflow-x-auto`}
    >
      Multiline template literal
    </div>
  );
}
