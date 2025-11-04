"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { CalendarIcon, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { UserItem } from "@/types/user-item";

// 表单验证 Schema
const editFormSchema = z.object({
  status: z.enum(["want_to_watch", "watching", "watched"]),
  rating: z.number().min(0).max(10).optional().nullable(),
  notes: z.string().optional(),
  started_at: z.string().optional(),
  completed_at: z.string().optional(),
  progress: z.number().min(0).optional().nullable(),
});

type EditFormValues = z.infer<typeof editFormSchema>;

interface EditFormProps {
  item: UserItem;
  onSubmit: (data: EditFormValues) => Promise<void>;
  onCancel: () => void;
}

const statusOptions = [
  { value: "want_to_watch", label: "想看" },
  { value: "watching", label: "在看" },
  { value: "watched", label: "看过" },
];

export function EditForm({ item, onSubmit, onCancel }: EditFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<EditFormValues>({
    resolver: zodResolver(editFormSchema),
    defaultValues: {
      status: item.status,
      rating: item.rating || null,
      notes: item.notes || "",
      started_at: item.started_at || "",
      completed_at: item.completed_at || "",
      progress: item.progress || null,
    },
  });

  const watchedStatus = form.watch("status");
  
  // 判断是否为剧集类型（TV/Anime）
  const isSeriesType = item.content_type === "tv" || item.content_type === "anime";

  const handleSubmit = async (data: EditFormValues) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* 状态 */}
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>状态</FormLabel>
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

        {/* 评分 - 仅在"看过"时显示 */}
        {watchedStatus === "watched" && (
          <FormField
            control={form.control}
            name="rating"
            render={({ field }) => (
              <FormItem>
                <FormLabel>评分</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    max={10}
                    step={0.5}
                    placeholder="0-10分"
                    {...field}
                    value={field.value || ""}
                    onChange={(e) =>
                      field.onChange(e.target.value ? parseFloat(e.target.value) : null)
                    }
                  />
                </FormControl>
                <FormDescription>给这部作品打分（0-10分）</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* 观看进度 - 仅在"在看"且为剧集类型时显示 */}
        {watchedStatus === "watching" && isSeriesType && (
          <FormField
            control={form.control}
            name="progress"
            render={({ field }) => (
              <FormItem>
                <FormLabel>当前观看集数</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    step={1}
                    placeholder="第几集"
                    {...field}
                    value={field.value || ""}
                    onChange={(e) =>
                      field.onChange(e.target.value ? parseInt(e.target.value) : null)
                    }
                  />
                </FormControl>
                <FormDescription>记录当前观看到第几集</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* 开始日期 - 在看/看过时显示 */}
        {(watchedStatus === "watching" || watchedStatus === "watched") && (
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
                          format(new Date(field.value), "PPP", { locale: zhCN })
                        ) : (
                          <span>选择开始日期</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) =>
                        field.onChange(date ? date.toISOString().split("T")[0] : "")
                      }
                      disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* 完成日期 - 仅在"看过"时显示 */}
        {watchedStatus === "watched" && (
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
                          format(new Date(field.value), "PPP", { locale: zhCN })
                        ) : (
                          <span>选择完成日期</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) =>
                        field.onChange(date ? date.toISOString().split("T")[0] : "")
                      }
                      disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
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
                  placeholder="记录你的想法和感受..."
                  className="min-h-32"
                  {...field}
                />
              </FormControl>
              <FormDescription>记录你的观看体验和评价</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 按钮 */}
        <div className="flex gap-3">
          <Button type="submit" disabled={isSubmitting} className="flex-1">
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            保存修改
          </Button>
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            取消
          </Button>
        </div>
      </form>
    </Form>
  );
}

