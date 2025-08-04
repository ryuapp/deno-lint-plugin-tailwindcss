# @ryu/deno-lint-plugin-tailwindcss

A [Deno Lint Plugin](https://docs.deno.com/runtime/reference/lint_plugins/) for Tailwind CSS that automatically sorts classes based on our recommended class order.

> [!IMPORTANT]
> Currently, we are building this linter plugin rule based on [Biome](http://biomejs.dev/)'s [use_sorted_classes](https://biomejs.dev/ja/linter/rules/use-sorted-classes/) due to limitations in Deno Lint specification, but in the future we plan to replace it with the same rules as [prettier-plugin-tailwindcss](https://github.com/tailwindlabs/prettier-plugin-tailwindcss). Many breaking changes may occur until the migration is complete.

## Installation

```sh
deno add --jsr @ryu/deno-lint-plugin-tailwindcss
```

Then add the plugin to your configuration:

```jsonc
// deno.json(c)
{
  "lint": {
    "plugins": ["@ryu/deno-lint-plugin-tailwindcss"]
  }
}
```

## Philosophy

Although this is a linter plugin, its role is primarily formatting, so it only provides minimal options, in keeping with [Prettier's option philosophy](https://prettier.io/docs/option-philosophy).

## License

MIT
