export function Component(props: { class?: string }) {
  const DEFAULT_CLASS = "default-class";

  return (
    <div
      className={`${DEFAULT_CLASS} ${
        props.class ? "" : "mt-8"
      } flex items-end justify-between overflow-x-auto`}
    >
      Multiline template expression
    </div>
  );
}
