import type { APIRequest, APIResponse } from "~/types";

export async function sendMessageToBackground(
  message: APIRequest
): Promise<APIResponse> {
  console.log("Sending message to background:", message);
  const response = await browser.runtime.sendMessage(message);
  console.log("Received response from background:", response);
  return response;
}

export async function translateText(
  config: APIRequest["config"],
  text: string,
  targetLang: string
): Promise<APIResponse> {
  console.log("Translating text:", { config, text, targetLang });
  return sendMessageToBackground({
    type: "translate",
    config,
    text,
    targetLang,
  });
}

export async function explainText(
  config: APIRequest["config"],
  text: string,
  targetLang: string
): Promise<APIResponse> {
  return sendMessageToBackground({
    type: "explain",
    config,
    text,
    targetLang,
  });
}
