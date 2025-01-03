import React from "react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { useToast } from "~/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Settings, useSettings } from "~/hooks/use-settings";
import { Loader2 } from "lucide-react";
import { storage } from "wxt/storage";

const formSchema = z.object({
  baseUrl: z
    .string()
    .url("请输入有效的URL")
    .default("https://api.openai.com/v1"),
  apiKey: z.string().min(1, "API Key 不能为空"),
  model: z.string().min(1, "请输入模型名称"),
  targetLang: z.string().min(1, "请选择目标语言"),
  isValidated: z.boolean().default(false),
});

// 建议的模型列表
const suggestedModels = ["gpt-4", "gpt-3.5-turbo", "claude-3.5-sonnet"];

const languages = [
  { value: "zh", label: "中文" },
  { value: "en", label: "English" },
  { value: "ja", label: "日本語" },
  { value: "ko", label: "한국어" },
  { value: "fr", label: "Français" },
  { value: "de", label: "Deutsch" },
];

function App() {
  const { toast } = useToast();
  const { settings, loading, saveSettings } = useSettings();
  const [testing, setTesting] = React.useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: settings,
  });

  // 当设置加载完成后更新表单
  React.useEffect(() => {
    if (!loading && settings) {
      // 保留 isValidated 状态
      form.reset({
        ...settings,
      });
    }
  }, [loading, settings, form]);

  React.useEffect(() => {
    console.log("Current settings:", settings);
  }, [settings]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      // 如果没有通过API测试，不允许保存
      if (!settings?.isValidated) {
        toast({
          variant: "destructive",
          description: "请先测试 API 连接是否正常",
          duration: 2000,
        });
        return;
      }
      console.log("Settings before validation check:", settings);
      await saveSettings(values);
      toast({
        description: "设置已保存",
        duration: 1500,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        description: "保存失败，请重试",
        duration: 2000,
      });
    }
  }

  const handleTestAPI = async () => {
    const values = form.getValues();
    if (!values.apiKey || !values.baseUrl) {
      toast({
        variant: "destructive",
        description: "请先填写 API 地址和密钥",
        duration: 2000,
      });
      return;
    }

    setTesting(true);
    try {
      const response = await browser.runtime.sendMessage({
        type: "testAPI",
        config: {
          baseUrl: values.baseUrl,
          apiKey: values.apiKey,
          model: values.model,
        },
      });

      if (!response.success) {
        throw new Error(response.error);
      }

      // 测试成功后保存设置并标记为已验证
      await saveSettings({ ...values, isValidated: true });
      toast({
        description: "API 连接成功！",
        duration: 2000,
      });
    } catch (error: any) {
      console.error("API test failed:", error);
      // 测试失败后保存设置并标记为未验证
      await saveSettings({ ...values, isValidated: false });
      toast({
        variant: "destructive",
        description: error.message || "API 连接失败，请检查配置",
        duration: 2000,
      });
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="w-[400px] h-[400px] flex items-center justify-center">
        <div className="animate-spin">Loading...</div>
      </div>
    );
  }

  return (
    <div className="w-[400px]">
      <Card className={"rounded-none"}>
        <CardHeader>
          <CardTitle>设置</CardTitle>
          <CardDescription>
            配置 AI 助手的基本参数，所有设置将自动同步到云端
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="baseUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>API 地址</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://api.openai.com/v1"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>大语言模型的 API 接口地址</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="apiKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>API Key</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="sk-xxxxxxxxxxxxxxxx"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>用于访问 API 的密钥</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>模型</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        <Input placeholder="输入模型名称" {...field} />
                        <div className="flex flex-wrap gap-1">
                          {suggestedModels.map((model) => (
                            <Button
                              key={model}
                              variant="outline"
                              size="sm"
                              type="button"
                              className="text-xs"
                              onClick={() => field.onChange(model)}
                            >
                              {model}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </FormControl>
                    <FormDescription>
                      输入模型名称或从建议列表中选择
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="targetLang"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>目标语言</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="选择语言" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {languages.map((lang) => (
                          <SelectItem key={lang.value} value={lang.value}>
                            {lang.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>选择翻译的目标语言</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={handleTestAPI}
                  disabled={testing}
                >
                  {testing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      测试中...
                    </>
                  ) : (
                    "测试 API"
                  )}
                </Button>
                <Button type="submit" className="flex-1">
                  保存设置
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

export default App;
