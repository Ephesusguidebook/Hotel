"use client";

import { useRef, useState } from "react";

type Options = {
  onNext: () => void;
  onPrev: () => void;
  enabled?: boolean;
};

/**
 * Horizontal drag-to-change for the photo galleries.
 *
 * Uses pointer events so one implementation covers touch, mouse and pen.
 * The first few pixels of movement decide whether the gesture belongs to
 * the gallery or to the page: a mostly-vertical drag is left alone so the
 * page keeps scrolling normally, which is the behaviour people expect when
 * they flick past a carousel on a phone.
 */
export function useSwipe({ onNext, onPrev, enabled = true }: Options) {
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const axis = useRef<null | "x" | "y">(null);

  function reset() {
    setDragX(0);
    setDragging(false);
    axis.current = null;
  }

  const handlers = enabled
    ? {
        onPointerDown(e: React.PointerEvent) {
          // Ignore secondary mouse buttons.
          if (e.pointerType === "mouse" && e.button !== 0) return;
          startX.current = e.clientX;
          startY.current = e.clientY;
          axis.current = null;
          setDragging(true);
        },
        onPointerMove(e: React.PointerEvent) {
          if (!dragging) return;
          const dx = e.clientX - startX.current;
          const dy = e.clientY - startY.current;

          if (axis.current === null) {
            if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
            axis.current = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
            if (axis.current === "x") {
              // Take over the gesture so the browser stops trying to scroll.
              e.currentTarget.setPointerCapture?.(e.pointerId);
            }
          }
          if (axis.current !== "x") return;
          setDragX(dx);
        },
        onPointerUp(e: React.PointerEvent) {
          if (!dragging) return;
          const width = e.currentTarget.clientWidth || 1;
          const threshold = Math.min(80, width * 0.15);
          if (axis.current === "x") {
            if (dragX <= -threshold) onNext();
            else if (dragX >= threshold) onPrev();
          }
          reset();
        },
        onPointerCancel() {
          reset();
        },
      }
    : {};

  return { dragX, dragging, handlers };
}
