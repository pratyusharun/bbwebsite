"use client";

import {
  useRef,
  type ReactNode,
  type MouseEvent,
  type HTMLAttributes,
} from "react";
import { cn } from "@/lib/utils";

/**
 * Card with a cursor-following radial spotlight + subtle glow.
 * Sets --mx/--my CSS vars consumed by the `.spotlight` style.
 * Forwards extra props (e.g. data-cursor) to the underlying element.
 */
export default function SpotlightCard({
  children,
  className = "",
  as: Tag = "div",
  ...rest
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "article" | "li";
} & HTMLAttributes<HTMLElement>) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    el.style.setProperty("--my", `${e.clientY - rect.top}px`);
  };

  const Comp = Tag as any;
  return (
    <Comp
      ref={ref}
      onMouseMove={onMove}
      className={cn(
        "spotlight ring-gradient group relative overflow-hidden rounded-2xl",
        className,
      )}
      {...rest}
    >
      {children}
    </Comp>
  );
}
