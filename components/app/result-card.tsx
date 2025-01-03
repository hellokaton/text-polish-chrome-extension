import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card.tsx";
import { Button } from "~/components/ui/button.tsx";
import { Check, Copy, Loader2 } from "lucide-react";
import { useToast } from "~/hooks/use-toast";
import { cn } from "~/lib/utils";

interface ResultCardProps {
  type: "translate" | "explain";
  loading?: boolean;
  result?: string;
  onClose: () => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({
  type,
  loading = false,
  result,
  onClose,
}) => {
  const [copied, setCopied] = React.useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      toast({
        variant: "destructive",
        description: "复制失败，请重试",
        duration: 1500,
      });
    }
  };

  return (
    <Card className="w-[300px] shadow-lg">
      <CardHeader className={"!px-4 !py-2"}>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">
              {type === "translate" ? "翻译结果" : "解释结果"}
            </CardTitle>
            <CardDescription>
              {type === "translate" ? "Translation" : "Explanation"}
            </CardDescription>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 hover:bg-accent"
            aria-label="关闭"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 15 15"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z"
                fill="currentColor"
                fillRule="evenodd"
                clipRule="evenodd"
              ></path>
            </svg>
          </button>
        </div>
      </CardHeader>
      <CardContent className={"!px-4 !py-2 relative"}>
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <>
            <p className="text-sm leading-6 mb-6">{result}</p>
            <div className="absolute bottom-2 right-4">
              <Button
                variant="ghost"
                size="icon"
                className={cn("h-8 w-8", copied && "text-green-500")}
                onClick={handleCopy}
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
