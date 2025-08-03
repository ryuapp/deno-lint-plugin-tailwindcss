# @ryu/deno-lint-plugin-tailwindcss

A [Deno Lint Plugin](https://docs.deno.com/runtime/reference/lint_plugins/) for Tailwind CSS that automatically sorts classes based on our recommended class order.

Currently, we are building this linter plugin based on [Biome](http://biomejs.dev/)'s [use_sorted_classes](https://biomejs.dev/ja/linter/rules/use-sorted-classes/), but in the future this will be replaced by [prettier-plugin-tailwindcss](https://github.com/tailwindlabs/prettier-plugin-tailwindcss). Many breaking changes may occur until the migration is complete.

## Roadmap

- [x] Basic Tailwind CSS class sorting (thanks to Biome)
- [ ] Sorting based on `prettier-plugin-tailwindcss`
  - [ ] Preserving whitespace
  - [ ] Preserving duplicate classes
  - [ ] Sorting non-standard attributes
  - [ ] Sorting classes in function calls
  - [ ] Sorting classes in template literals

There are no plans to support TailwindCSS v3 and `tailwind.config.js`.

## License

MIT
