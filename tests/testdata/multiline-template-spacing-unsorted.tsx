export function Component(props: { class?: string }) {
  return (
    <div
      className={`${
        props.class ? "" : "mt-8"
      } flex justify-between overflow-x-auto items-end`}
    >
      Multiline template literal with unsorted classes
    </div>
  );
}
