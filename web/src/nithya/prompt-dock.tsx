import { ArrowUp, Plus } from 'lucide-react';
import { useState, type KeyboardEvent, type ReactNode } from 'react';

export interface PromptDockProps {
  onSubmit: (prompt: string) => void;
  placeholder?: string;
  /** Enter sends and Shift+Enter adds a line. Off: only the button sends. */
  enterToSubmit?: boolean;
  leading?: ReactNode;
  options?: ReactNode;
  trailing?: ReactNode;
}

/** The generate bar: references, a multi-line prompt, options and send. */
export function PromptDock({
  onSubmit,
  placeholder = 'Describe what you want to create…',
  enterToSubmit = false,
  leading,
  options,
  trailing,
}: PromptDockProps) {
  const [text, setText] = useState('');
  const prompt = text.trim();

  const submit = () => {
    if (!prompt) return;
    onSubmit(prompt);
    setText('');
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (enterToSubmit && e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="n-panel n-prompt">
      <div className="n-prompt__row">
        {leading}
        <textarea
          className="n-prompt__field"
          aria-label="Prompt"
          rows={2}
          placeholder={placeholder}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
        />
      </div>
      <div className="n-prompt__options">
        <div className="n-prompt__chips">{options}</div>
        {trailing}
        <button
          type="button"
          className="n-send"
          aria-label="Generate"
          title="Generate"
          disabled={!prompt}
          onClick={submit}
        >
          <ArrowUp size={18} aria-hidden />
        </button>
      </div>
    </div>
  );
}

/** Dashed square for adding a reference image to the prompt. */
export function ReferenceSlot({ label = 'Add reference', onClick }: { label?: string; onClick?: () => void }) {
  return (
    <button type="button" className="n-reference" aria-label={label} title={label} onClick={onClick}>
      <Plus size={18} aria-hidden />
      <span aria-hidden>REF</span>
    </button>
  );
}
