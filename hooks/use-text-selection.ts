import { useState, useEffect, RefObject } from "react";
import { type Position } from "~/types";

interface UseTextSelectionProps {
  menuRef: RefObject<HTMLDivElement | null>;
  resultRef: RefObject<HTMLDivElement | null>;
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

  useEffect(() => {
    let selectionTimeout: NodeJS.Timeout;

    const handleMouseUp = () => {
      const selection = window.getSelection();
      const text = selection?.toString().trim() || "";

      if (selectionTimeout) {
        clearTimeout(selectionTimeout);
      }

      if (!text) {
        selectionTimeout = setTimeout(() => {
          setShowFloating(false);
          setSelectedText("");
          onHide();
        }, 200);
        return;
      }

      const range = selection?.getRangeAt(0);
      const rect = range?.getBoundingClientRect();

      if (rect) {
        setPosition({
          x: rect.left + rect.width / 2,
          y: rect.top - 10,
        });
        setSelectedText(text);
        setShowFloating(true);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!showFloating) return;

      const selection = window.getSelection();
      const text = selection?.toString().trim() || "";

      if (!text) {
        const isOverMenu = menuRef.current?.contains(e.target as Node);
        const isOverResult = resultRef.current?.contains(e.target as Node);

        if (!isOverMenu && !isOverResult) {
          setShowFloating(false);
          setSelectedText("");
          onHide();
        }
      }
    };

    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mousemove", handleMouseMove);

    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mousemove", handleMouseMove);
      if (selectionTimeout) {
        clearTimeout(selectionTimeout);
      }
    };
  }, [menuRef, resultRef, onHide, showFloating]);

  return {
    showFloating,
    setShowFloating,
    position,
    selectedText,
  };
}
