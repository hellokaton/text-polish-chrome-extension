// OpenAI API 相关类型
export interface OpenAIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

// 应用状态相关类型
export interface Position {
  x: number;
  y: number;
}

export type ResultType = "translate" | "explain";

export interface ResultState {
  type: ResultType;
  text: string;
  loading: boolean;
}

// API 请求相关类型
export interface APIRequest {
  type: "testAPI" | ResultType;
  config: {
    baseUrl: string;
    apiKey: string;
    model: string;
  };
  text?: string;
  targetLang?: string;
}

export interface APIResponse extends OpenAIResponse {
  success?: boolean;
}
