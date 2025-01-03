import { useState, useEffect, useCallback } from "react";
import type { Position } from "~/types";

interface UseTextSelectionProps {
  menuRef: React.RefObject<HTMLDivElement | null>;
  resultRef: React.RefObject<HTMLDivElement | null>;
  onHide: () => void;
}

export function useTextSelection({
  menuRef,
  resultRef,
  onHide,
}: UseTextSelectionProps) {
  const [showFloating, setShowFloating] = useState(false);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [selectedText, setSelectedText] = useState("");

  const handleSelection = useCallback(
    (e: MouseEvent, isSelecting: boolean) => {
      const target = e.target as HTMLElement;
      if (
        menuRef.current?.contains(target) ||
        resultRef.current?.contains(target)
      ) {
        return;
      }

      if (isSelecting) {
        const selection = window.getSelection();
        const text = selection?.toString().trim();

        if (text) {
          const range = selection?.getRangeAt(0);
          const rect = range?.getBoundingClientRect();

          if (rect) {
            setPosition({
              x: rect.x + rect.width / 2,
              y: window.scrollY + rect.y - 10,
            });
            setSelectedText(text);
            setShowFloating(true);
          }
        } else {
          onHide();
        }
      }
    },
    [menuRef, resultRef, onHide]
  );

  useEffect(() => {
    let isSelecting = false;

    const handleMouseDown = (e: MouseEvent) => {
      isSelecting = true;
      handleSelection(e, false);
    };

    const handleMouseUp = (e: MouseEvent) => {
      setTimeout(() => {
        handleSelection(e, isSelecting);
        isSelecting = false;
      }, 0);
    };

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        !menuRef.current?.contains(target) &&
        !resultRef.current?.contains(target)
      ) {
        onHide();
      }
    };

    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("click", handleClickOutside);
    };
  }, [menuRef, resultRef, handleSelection, onHide]);

  return {
    showFloating,
    position,
    selectedText,
    setShowFloating,
  };
}
