# Enter to send, a setting

**Kit:** Studio · **Problem:** some people expect Enter to send; others write multi-line prompts.

## How it works

- The prompt box takes an `enterToSubmit` choice, shown to users as **Settings → General →
  Enter to generate**.
- On: Enter sends, Shift+Enter adds a line. Off: Enter adds a line and only the button sends.
- The send button stays off while the box is empty.
- On the web, Enter never sends while an input method is still composing (Chinese, Japanese,
  Korean input). The Flutter version does not check this yet.

## Where

- `kits/studio/web/src/nithya/prompt-dock.tsx`
- `kits/studio/flutter/lib/src/widgets/prompt_dock.dart`

## Use it elsewhere

Any chat or search box. Default it on for short single-line asks and off for long-form writing.
