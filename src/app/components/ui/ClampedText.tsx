"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

interface ClampedTextProps {
  /** The full text to display (and reveal in the tooltip when truncated). */
  text: string;
  /** Typography / color classes; the clamp + word-break rules are added here. */
  className?: string;
  /** Inline styles, e.g. a dynamic mood color. */
  style?: CSSProperties;
}

/**
 * Renders text clamped to 2 lines with an ellipsis, breaking long unbroken
 * strings so they can never overflow their container (fixing layouts on every
 * screen size). When the text is actually truncated, a native `title` tooltip
 * reveals the full content on hover — the browser positions it, so it never
 * clips off-screen on desktop or mobile. The check re-runs on resize, so a
 * string that fits at one width but truncates at another is handled correctly.
 */
export default function ClampedText({
  text,
  className = "",
  style,
}: ClampedTextProps) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [truncated, setTruncated] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const check = () => setTruncated(el.scrollHeight > el.clientHeight + 1);
    check();
    const observer = new ResizeObserver(check);
    observer.observe(el);
    return () => observer.disconnect();
  }, [text]);

  return (
    <p
      ref={ref}
      className={`line-clamp-2 break-words ${className}`}
      style={style}
      title={truncated ? text : undefined}
    >
      {text}
    </p>
  );
}
