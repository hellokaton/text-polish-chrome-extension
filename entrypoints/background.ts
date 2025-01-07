import { APIRequest } from "~/types";
import { ofetch } from "ofetch";

export default defineBackground(() => {
  // 处理来自 popup 和 content script 的消息
  browser.runtime.onMessage.addListener(
    (request: APIRequest, sender, sendResponse) => {
      (async () => {
        try {
          let response;
          switch (request.type) {
            case "testAPI":
              response = await testAPI(request.config);
              break;
            case "translate":
              response = await translateText(
                request.config,
                request.text!,
                request.targetLang!
              );
              break;
            case "explain":
              response = await explainText(
                request.config,
                request.text!,
                request.targetLang!
              );
              break;
            default: {
              throw new Error("Unknown request type: " + request.type);
            }
          }
          sendResponse({ success: true, data: response });
        } catch (error: any) {
          console.error("Request failed:", error);
          sendResponse({ success: false, error: error.message || "请求失败" });
        }
      })();

      return true;
    }
  );
});

async function testAPI(config: APIRequest["config"]) {
  try {
    const response = await ofetch(`${config.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
      timeout: 5000,
      body: JSON.stringify({
        model: config.model,
        messages: [
          {
            role: "user",
            content: "Say 'API connection successful!' in Chinese",
          },
        ],
      }),
    });
    return response;
  } catch (error: any) {
    console.error("Test API failed:", error);
    throw new Error(error.message || "API 连接失败");
  }
}

async function callOpenAI(
  config: APIRequest["config"],
  messages: Array<{ role: string; content: string }>
) {
  try {
    const response = await ofetch(`${config.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
      timeout: 10000,
      body: JSON.stringify({
        model: config.model,
        messages,
      }),
    });
    return response;
  } catch (error: any) {
    console.error("API call failed:", error);
    throw new Error(error.message || "请求失败");
  }
}

async function translateText(
  config: APIRequest["config"],
  text: string,
  targetLang: string
) {
  const langMap: Record<string, string> = {
    zh: "Chinese",
    en: "English",
    ja: "Japanese",
    ko: "Korean",
    fr: "French",
    de: "German",
  };

  return callOpenAI(config, [
    {
      role: "system",
      content: `You are a professional translator. Translate the given text into ${
        langMap[targetLang] || "English"
      }. Only provide the translation without any explanations or additional content.`,
    },
    {
      role: "user",
      content: text,
    },
  ]);
}

async function explainText(
  config: APIRequest["config"],
  text: string,
  targetLang: string
) {
  const langMap: Record<string, string> = {
    zh: "Chinese",
    en: "English",
    ja: "Japanese",
    ko: "Korean",
    fr: "French",
    de: "German",
  };

  return callOpenAI(config, [
    {
      role: "system",
      content: `You are an expert at explaining complex text. Provide a clear and concise explanation in ${
        langMap[targetLang] || "English"
      } about what the given text means or implies. Focus on the main points and context.`,
    },
    {
      role: "user",
      content: text,
    },
  ]);
}
