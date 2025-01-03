import { APIRequest } from "~/types";
import { ofetch } from "ofetch";

export default defineBackground(() => {
  // 处理来自 popup 和 content script 的消息
  browser.runtime.onMessage.addListener(
    (request: APIRequest, sender, sendResponse) => {
      // 返回一个 Promise
      const responsePromise = (async () => {
        try {
          switch (request.type) {
            case "testAPI":
              return await testAPI(request.config);
            case "translate":
              return await translateText(
                request.config,
                request.text!,
                request.targetLang!
              );
            case "explain":
              return await explainText(
                request.config,
                request.text!,
                request.targetLang!
              );
            default: {
              throw new Error("Unknown request type: " + request.type);
            }
          }
        } catch (error) {
          console.error("API request failed:", error);
          throw error;
        }
      })();
      // 返回 true 表示会异步发送响应
      responsePromise.then(sendResponse);
      return true;
    }
  );
});

async function testAPI(config: APIRequest["config"]) {
  try {
    await ofetch(`${config.baseUrl}/chat/completions`, {
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

    return { success: true };
  } catch (error: any) {
    console.error("Test API failed:", error);
    throw new Error(error.message || "API 连接失败");
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

  try {
    const data = await ofetch(`${config.baseUrl}/chat/completions`, {
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
            role: "system",
            content: `You are a professional translator. Translate the given text into ${
              langMap[targetLang] || "English"
            }. Only provide the translation without any explanations or additional content.`,
          },
          {
            role: "user",
            content: text,
          },
        ],
      }),
    });

    if (!data?.choices?.[0]?.message?.content) {
      throw new Error("Invalid API response format");
    }

    return data;
  } catch (error: any) {
    console.error("Translation failed:", error);
    throw new Error(error.message || "翻译失败");
  }
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

  try {
    const data = await ofetch(`${config.baseUrl}/chat/completions`, {
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
            role: "system",
            content: `You are an expert at explaining complex text. Provide a clear and concise explanation in ${
              langMap[targetLang] || "English"
            } about what the given text means or implies. Focus on the main points and context.`,
          },
          {
            role: "user",
            content: text,
          },
        ],
      }),
    });

    if (!data?.choices?.[0]?.message?.content) {
      throw new Error("Invalid API response format");
    }

    return data;
  } catch (error: any) {
    console.error("Explanation failed:", error);
    throw new Error(error.message || "解释失败");
  }
}
