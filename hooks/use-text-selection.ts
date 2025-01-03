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

    const handleSelectionChange = () => {
      const selection = window.getSelection();
      const text = selection?.toString().trim() || "";

      // 清除之前的timeout
      if (selectionTimeout) {
        clearTimeout(selectionTimeout);
      }

      if (!text) {
        // 当没有选中文本时，延迟隐藏菜单，以便用户有时间点击菜单
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

    // 监听选择变化事件
    document.addEventListener("selectionchange", handleSelectionChange);

    // 监听鼠标移动事件
    const handleMouseMove = (e: MouseEvent) => {
      if (!showFloating) return;

      const selection = window.getSelection();
      const text = selection?.toString().trim() || "";

      // 如果没有选中文本，检查鼠标是否在菜单或结果卡片上
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

    document.addEventListener("mousemove", handleMouseMove);

    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
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
