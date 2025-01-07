import {useEffect, useState} from "react";
import {storage} from "wxt/storage";
import type {Settings} from "~/types";

export function useSettings() {
    const [settings, setSettings] = useState<Settings | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 初始加载设置
        loadSettings();

        // 监听存储变化
        const handleStorageChange = async (changes: Record<string, any>) => {
            if (changes.settings) {
                setSettings(changes.settings.newValue);
            }
        };

        // 添加存储变化监听器
        browser.storage.onChanged.addListener(handleStorageChange);

        return () => {
            // 清理监听器
            browser.storage.onChanged.removeListener(handleStorageChange);
        };
    }, []);

    const loadSettings = async () => {
        try {
            const settings: Settings | null = await storage.getItem('local:settings');
            setSettings(settings);
        } catch (error) {
            console.error("Failed to load settings:", error);
        } finally {
            setLoading(false);
        }
    };

    const saveSettings = async (newSettings: Settings) => {
        await storage.setItem("local:settings", newSettings);
        setSettings(newSettings); // 立即更新本地状态
    };

    return {settings, loading, saveSettings};
}
