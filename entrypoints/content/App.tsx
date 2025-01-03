import React, { useState, useRef, useEffect } from "react";
import { useToast } from "~/hooks/use-toast";
import { Toaster } from "~/components/ui/toaster";
import { useSettings } from "~/hooks/use-settings";
import { useTextSelection } from "~/hooks/use-text-selection";
import { FloatingMenu } from "~/components/app/floating-menu";
import { ResultCard } from "~/components/app/result-card";
import { translateText, explainText } from "~/services/api";
import type { ResultState } from "~/types";

const App: React.FC = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [result, setResult] = useState<ResultState | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const resultRef = useRef<HTMLDivElement | null>(null);

  const { settings } = useSettings();
  const { toast } = useToast();

  useEffect(() => {
    const testMessage = async () => {
      try {
        console.log("Testing message passing...");
        const response = await browser.runtime.sendMessage({ type: "test" });
        console.log("Message response:", response);
      } catch (error) {
        console.error("Message error:", error);
      }
    };

    testMessage();
  }, []);

  const hideAll = () => {
    setShowMenu(false);
    setResult(null);
  };

  const { showFloating, position, selectedText, setShowFloating } =
    useTextSelection({
      menuRef,
      resultRef,
      onHide: hideAll,
    });

  const handleAction = async (
    type: "translate" | "explain",
    action: typeof translateText | typeof explainText
  ) => {
    if (!settings) {
      toast({
        variant: "destructive",
        description: "请先在设置中配置 API",
        duration: 2000,
      });
      return;
    }

    console.log("Settings:", settings);
    console.log("Selected text:", selectedText);

    setResult({ type, text: "", loading: true });
    setShowMenu(false);

    try {
      const response = await action(
        settings,
        selectedText,
        settings.targetLang
      );

      console.log("API Response:", response);

      if (!response?.choices?.[0]?.message?.content) {
        throw new Error("Invalid API response format");
      }

      setResult({
        type,
        text: response.choices[0].message.content,
        loading: false,
      });
    } catch (error) {
      console.error(`${type} failed:`, error);
      toast({
        variant: "destructive",
        description: `${type === "translate" ? "翻译" : "解释"}失败，请重试`,
        duration: 2000,
      });
      setResult(null);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(selectedText);
      toast({
        description: "已复制到剪贴板",
        duration: 1500,
      });
      hideAll();
    } catch (err) {
      toast({
        variant: "destructive",
        description: "复制失败，请重试",
        duration: 1500,
      });
    }
  };

  return (
    <>
      <div
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          pointerEvents: "none",
        }}
      >
        {showFloating && (
          <div ref={menuRef} data-floating-menu>
            <FloatingMenu
              position={position}
              showMenu={showMenu}
              onButtonClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              onTranslate={() => handleAction("translate", translateText)}
              onExplain={() => handleAction("explain", explainText)}
              onCopy={handleCopy}
            />
          </div>
        )}

        {result && (
          <div
            ref={resultRef}
            style={{
              position: "absolute",
              left: `${position.x}px`,
              top: `${position.y + 20}px`,
              transform: "translateX(-50%)",
              pointerEvents: "auto",
            }}
          >
            <ResultCard
              type={result.type}
              loading={result.loading}
              result={result.text}
              onClose={hideAll}
            />
          </div>
        )}
      </div>
      <Toaster />
    </>
  );
};

export default App;
