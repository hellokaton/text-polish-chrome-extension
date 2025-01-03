import {APIRequest} from "~/types";

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
              default:
                throw new Error("Unknown request type");
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
  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
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

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return { success: true };
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

  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
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

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();

  // 验证响应格式
  if (!data?.choices?.[0]?.message?.content) {
    throw new Error("Invalid API response format");
  }

  return data;
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

  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
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

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();

  // 验证响应格式
  if (!data?.choices?.[0]?.message?.content) {
    throw new Error("Invalid API response format");
  }

  return data;
}
