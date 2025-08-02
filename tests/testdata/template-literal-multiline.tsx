export function Component(props: { class?: string }) {
  return (
    <div
      className={`longlonglonglonglonglonglonglonglonglonglongclass text-white ${
        props.class ?? ""
      }`}
    >
      Multiline template literal
    </div>
  );
}
