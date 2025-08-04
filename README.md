# @ryu/deno-lint-plugin-tailwindcss

[![CI](https://github.com/ryuapp/deno-lint-plugin-tailwindcss/workflows/CI/badge.svg)](https://github.com/ryuapp/deno-lint-plugin-tailwindcss/actions?query=workflow%3ACI)
[![jsr](https://jsr.io/badges/@ryu/deno-lint-plugin-tailwindcss?color=22b140)](http://jsr.io/@ryu/deno-lint-plugin-tailwindcss)
[![License](https://img.shields.io/github/license/ryuapp/deno-lint-plugin-tailwindcss?labelColor=171717&color=22b140&label=License)](https://github.com/ryuapp/deno-lint-plugin-tailwindcss/blob/main/LICENSE)

A [Deno Lint Plugin](https://docs.deno.com/runtime/reference/lint_plugins/) for Tailwind CSS that automatically sorts classes.

> [!IMPORTANT]
> Currently, we are building this linter plugin rule based on [Biome](http://biomejs.dev/)'s [use_sorted_classes](https://biomejs.dev/ja/linter/rules/use-sorted-classes/) due to limitations in Deno Lint specification, but in the future we plan to replace it with the same rules as [prettier-plugin-tailwindcss](https://github.com/tailwindlabs/prettier-plugin-tailwindcss). Many breaking changes may occur until the migration is complete.

## How to use

Add the plugin to your deno.json(c):

```jsonc
// deno.json(c)
{
  "lint": {
    "plugins": ["jsr:@ryu/deno-lint-plugin-tailwindcss@0.1.1"]
  }
}
```

## Philosophy

Although this is a linter plugin, its role is primarily formatting, so it only provides minimal options, in keeping with [Prettier's option philosophy](https://prettier.io/docs/option-philosophy).

## License

MIT
