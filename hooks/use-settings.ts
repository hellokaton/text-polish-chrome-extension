import { useCallback, useEffect, useState } from "react";
import { storage } from "wxt/storage";

export interface Settings {
  baseUrl: string;
  apiKey: string;
  model: string;
  targetLang: string;
  isValidated?: boolean;
}

const defaultSettings: Settings = {
  baseUrl: "https://api.openai.com/v1",
  apiKey: "",
  model: "gpt-3.5-turbo",
  targetLang: "zh",
  isValidated: false,
};

const SETTINGS_KEY = "sync:settings";

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  // 加载设置
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedSettings = await storage.getItem<Settings>(SETTINGS_KEY);
        if (savedSettings) {
          setSettings(savedSettings);
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  // 保存设置
  const saveSettings = useCallback(async (newSettings: Settings) => {
    await storage.setItem(SETTINGS_KEY, newSettings);
    setSettings(newSettings);
  }, []);

  // 重置设置
  const resetSettings = useCallback(async () => {
    await storage.removeItem(SETTINGS_KEY);
    setSettings(defaultSettings);
  }, []);

  return {
    settings,
    loading,
    saveSettings,
    resetSettings,
  };
}
