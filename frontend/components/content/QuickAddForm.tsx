"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { formatDate } from "@/lib/utils/date-formatters";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import type { SearchResult } from "@/app/explore/page";

// 表单验证 schema
const formSchema = z.object({
  status: z.enum(["want_to_watch", "watching", "watched"], {
    required_error: "请选择状态",
  }),
  rating: z.number().min(0).max(10).optional().nullable(),
  notes: z.string().optional(),
  started_at: z.date().optional().nullable(),
  completed_at: z.date().optional().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

interface QuickAddFormProps {
  result: SearchResult;
  onSuccess: () => void;
  onCancel: () => void;
}

const statusOptions = [
  { value: "want_to_watch", label: "想看" },
  { value: "watching", label: "在看" },
  { value: "watched", label: "看过" },
];

const ratingOptions = Array.from({ length: 11 }, (_, i) => ({
  value: i.toString(),
  label: i === 0 ? "未评分" : `${i} 分`,
}));

export function QuickAddForm({
  result,
  onSuccess,
  onCancel,
}: QuickAddFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: "want_to_watch",
      rating: null,
      notes: "",
      started_at: null,
      completed_at: null,
    },
  });

  const watchStatus = form.watch("status");

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);

    try {
      // 准备提交数据
      const payload = {
        // 来自搜索结果的基本信息
        external_id: result.external_id,
        source: result.source,
        content_type: result.content_type,
        title: result.title,
        original_title: result.original_title,
        description: result.description,
        poster_url: result.poster_url,
        backdrop_url: result.backdrop_url,
        release_date: result.release_date,
        year: result.year,
        language: result.language,
        metadata: result.metadata,

        // 用户输入的记录信息
        status: values.status,
        rating: values.rating,
        notes: values.notes,
        started_at: values.started_at
          ? formatDate(values.started_at, "yyyy-MM-dd")
          : null,
        completed_at: values.completed_at
          ? formatDate(values.completed_at, "yyyy-MM-dd")
          : null,
      };

      await api.post("/user-items", payload);

      toast({
        title: "添加成功",
        description: `已将「${result.title}」添加到你的记录`,
      });

      onSuccess();
    } catch (error: any) {
      console.error("Failed to add item:", error);
      toast({
        title: "添加失败",
        description: error.response?.data?.detail || "请稍后重试",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* 状态选择 */}
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>状态 *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="选择状态" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 评分（仅在"看过"状态显示） */}
        {watchStatus === "watched" && (
          <FormField
            control={form.control}
            name="rating"
            render={({ field }) => (
              <FormItem>
                <FormLabel>评分</FormLabel>
                <Select
                  onValueChange={(value) =>
                    field.onChange(value === "0" ? null : parseInt(value))
                  }
                  value={field.value?.toString() || "0"}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="选择评分" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {ratingOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* 开始日期（在看/看过状态显示） */}
        {(watchStatus === "watching" || watchStatus === "watched") && (
          <FormField
            control={form.control}
            name="started_at"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>开始日期</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          formatDate(field.value, "yyyy年M月d日")
                        ) : (
                          <span>选择日期</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value || undefined}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* 完成日期（仅在"看过"状态显示） */}
        {watchStatus === "watched" && (
          <FormField
            control={form.control}
            name="completed_at"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>完成日期</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          formatDate(field.value, "yyyy年M月d日")
                        ) : (
                          <span>选择日期</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value || undefined}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* 笔记 */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>笔记</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="记录你的想法..."
                  className="resize-none"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 操作按钮 */}
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1"
          >
            取消
          </Button>
          <Button type="submit" disabled={isSubmitting} className="flex-1">
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            确认添加
          </Button>
        </div>
      </form>
    </Form>
  );
}

