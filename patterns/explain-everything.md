# A "?" on every number

**Kit:** Calm · **Problem:** numbers and screens that only make sense to experts.

## How it works

- `Card` and `Stat` take an `explain` text. When set, a small **?** button sits beside the title.
- The button opens a popover with the explanation in plain words: what this is, what is
  usual, what to do.
- It uses the browser Popover API. Escape and outside clicks close it without extra code, and
  screen readers get a labelled button ("What is Sleep?").
- Write the text for a reader with no background. Keep it under 30 words, and name the
  usual range when there is one.

## Where

- `kits/calm/src/components/Explain.svelte`
- `kits/calm/src/components/Card.svelte`, `Stat.svelte`: the `explain` prop.

## Use it elsewhere

Make the explanation a required review item. A screen is not done until every figure on it
has one.
