"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Eye, EyeOff, CheckCircle2, XCircle } from "lucide-react";
import { adminApi } from "@/lib/admin-api";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  email: z.string().email("请输入有效的邮箱地址"),
  password: z
    .string()
    .min(6, "密码至少需要 6 个字符")
    .max(128, "密码过长"),
  username: z.string().min(1, "用户名不能为空").max(50, "用户名过长"),
  full_name: z.string().max(100, "全名过长").optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateAdminDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateAdminDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateAdminDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      username: "",
      full_name: "",
    },
  });

  const password = form.watch("password");

  // 密码强度检查
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: "", color: "" };

    let score = 0;
    if (pwd.length >= 6) score++;
    if (pwd.length >= 10) score++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++;
    if (/\d/.test(pwd)) score++;
    if (/[^a-zA-Z0-9]/.test(pwd)) score++;

    if (score <= 2)
      return { score, label: "弱", color: "text-destructive" };
    if (score <= 3)
      return { score, label: "中等", color: "text-yellow-500" };
    return { score, label: "强", color: "text-green-500" };
  };

  const passwordStrength = getPasswordStrength(password);

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      await adminApi.createAdmin({
        email: data.email,
        password: data.password,
        username: data.username,
        full_name: data.full_name || undefined,
      });

      toast({
        title: "创建成功",
        description: `管理员账号 ${data.username} 已创建`,
      });

      form.reset();
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      console.error("创建管理员失败:", error);
      toast({
        title: "创建失败",
        description: error.response?.data?.detail || "无法创建管理员账号",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) {
          form.reset();
        }
        onOpenChange(open);
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>创建管理员账号</DialogTitle>
          <DialogDescription>
            创建一个新的管理员账号，该账号将拥有系统管理权限
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* 邮箱 */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>邮箱 *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder="admin@example.com"
                      autoComplete="off"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 用户名 */}
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>用户名 *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="admin"
                      autoComplete="off"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 密码 */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>密码 *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        type={showPassword ? "text" : "password"}
                        placeholder="至少 6 个字符"
                        autoComplete="new-password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  {password && (
                    <FormDescription className="flex items-center gap-2">
                      <span>密码强度：</span>
                      <span className={`font-medium ${passwordStrength.color}`}>
                        {passwordStrength.label}
                      </span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div
                            key={i}
                            className={`h-1.5 w-4 rounded ${
                              i <= passwordStrength.score
                                ? passwordStrength.score <= 2
                                  ? "bg-destructive"
                                  : passwordStrength.score <= 3
                                  ? "bg-yellow-500"
                                  : "bg-green-500"
                                : "bg-muted"
                            }`}
                          />
                        ))}
                      </div>
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 全名 */}
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>全名（可选）</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="管理员姓名" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 安全提示 */}
            <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 p-3">
              <p className="text-sm text-blue-900 dark:text-blue-100 flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>
                  管理员账号将拥有系统管理权限，请妥善保管账号信息
                </span>
              </p>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                取消
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                创建管理员
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

