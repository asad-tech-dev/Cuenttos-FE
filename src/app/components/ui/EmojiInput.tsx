"use client";

import React from "react";
import { containsEmoji, toSingleEmoji } from "@/lib/emoji";

type EmojiInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange" | "onBeforeInput" | "onPaste" | "onDrop"
> & {
  value: string;
  onChange: (emoji: string) => void;
};

/**
 * A single-emoji field, like a chat app's emoji picker input: text is refused
 * as it is typed, pasted or dropped (nothing appears), a new emoji replaces
 * the current one, and deleting clears it. `onChange` only ever receives one
 * emoji or "".
 */
export default function EmojiInput({
  value,
  onChange,
  ...props
}: EmojiInputProps) {
  const takeEmojiFrom = (text: string) => {
    const emoji = toSingleEmoji(text);
    if (emoji) onChange(emoji);
  };

  return (
    <input
      {...props}
      value={value}
      autoComplete="off"
      spellCheck={false}
      onBeforeInput={(e) => {
        const data = (e.nativeEvent as InputEvent).data;
        if (data && !containsEmoji(data)) e.preventDefault();
      }}
      onPaste={(e) => {
        e.preventDefault();
        takeEmojiFrom(e.clipboardData.getData("text"));
      }}
      onDrop={(e) => {
        e.preventDefault();
        takeEmojiFrom(e.dataTransfer.getData("text"));
      }}
      // Safety net for input paths that skip the events above (IME
      // composition, some mobile keyboards): keep only the latest emoji.
      onChange={(e) => onChange(toSingleEmoji(e.target.value))}
    />
  );
}
