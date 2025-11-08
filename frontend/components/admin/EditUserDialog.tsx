"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { adminApi } from "@/lib/admin-api";
import { useToast } from "@/hooks/use-toast";
import type { AdminUser } from "@/types/admin";

const formSchema = z.object({
  email: z.string().email("请输入有效的邮箱地址"),
  username: z.string().min(1, "用户名不能为空").max(50, "用户名过长"),
  full_name: z.string().max(100, "全名过长").optional(),
  role: z.enum(["user", "admin"]),
  is_active: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

interface EditUserDialogProps {
  user: AdminUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  isCurrentUser: boolean;
}

export function EditUserDialog({
  user,
  open,
  onOpenChange,
  onSuccess,
  isCurrentUser,
}: EditUserDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      username: "",
      full_name: "",
      role: "user",
      is_active: true,
    },
  });

  // 当用户变化时，更新表单默认值
  useEffect(() => {
    if (user && open) {
      form.reset({
        email: user.email,
        username: user.username || "",
        full_name: user.full_name || "",
        role: user.role,
        is_active: user.is_active,
      });
    }
  }, [user, open, form]);

  const onSubmit = async (data: FormValues) => {
    if (!user) return;

    // 前端验证：防止管理员修改自己的角色
    if (isCurrentUser && data.role !== user.role) {
      toast({
        title: "操作失败",
        description: "不能修改自己的角色",
        variant: "destructive",
      });
      return;
    }

    // 前端验证：防止管理员禁用自己
    if (isCurrentUser && !data.is_active && user.is_active) {
      toast({
        title: "操作失败",
        description: "不能禁用自己的账号",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await adminApi.updateUser(user.id, {
        email: data.email !== user.email ? data.email : undefined,
        username: data.username !== user.username ? data.username : undefined,
        full_name:
          data.full_name !== user.full_name ? data.full_name : undefined,
        role: data.role !== user.role ? data.role : undefined,
        is_active:
          data.is_active !== user.is_active ? data.is_active : undefined,
      });

      toast({
        title: "更新成功",
        description: "用户信息已更新",
      });

      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      console.error("更新用户失败:", error);
      toast({
        title: "更新失败",
        description: error.response?.data?.detail || "无法更新用户信息",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>编辑用户</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* 邮箱 */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>邮箱</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" placeholder="user@example.com" />
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
                  <FormLabel>用户名</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="用户名" />
                  </FormControl>
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
                    <Input {...field} placeholder="全名" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 角色 */}
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>角色</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isCurrentUser}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="选择角色" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="user">普通用户</SelectItem>
                      <SelectItem value="admin">管理员</SelectItem>
                    </SelectContent>
                  </Select>
                  {isCurrentUser && (
                    <FormDescription>不能修改自己的角色</FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 账号状态 */}
            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">账号状态</FormLabel>
                    <FormDescription>
                      {field.value ? "账号已激活" : "账号已禁用"}
                    </FormDescription>
                    {isCurrentUser && (
                      <FormDescription className="text-destructive">
                        不能禁用自己的账号
                      </FormDescription>
                    )}
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isCurrentUser}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

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
                保存
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

