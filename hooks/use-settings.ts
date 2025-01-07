import {useEffect, useState} from "react";
import {storage} from "wxt/storage";
import type {Settings} from "~/types";
import {defaultSettings} from "~/types";

export function useSettings() {
    const [settings, setSettings] = useState<Settings | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 初始加载设置
        loadSettings();

        const unwatch = storage.watch<Settings>(
            'local:settings',
            (newSettings, oldSettings) => {
                setSettings(newSettings);
            },
        );
        return () => {
            // 清理监听器
            unwatch();
        };
    }, []);

    const loadSettings = async () => {
        try {
            const settings: Settings | null = await storage.getItem("local:settings");
            setSettings(settings || defaultSettings);
        } catch (error) {
            console.error("Failed to load settings:", error);
            setSettings(defaultSettings);
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
