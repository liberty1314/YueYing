/**
 * 用户记录详情页面 - 侧边栏组件
 * 包含封面和操作按钮
 */

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";

interface ItemDetailSidebarProps {
    title: string;
    posterUrl?: string;
    isEditing: boolean;
    onEdit: () => void;
    onDelete: () => void;
}

export function ItemDetailSidebar({
    title,
    posterUrl,
    isEditing,
    onEdit,
    onDelete,
}: ItemDetailSidebarProps) {
    const placeholderImage = "/placeholder-poster.png";

    return (
        <div className="lg:col-span-1">
            <Card>
                <CardContent className="p-6">
                    {/* 封面 */}
                    <div className="relative aspect-[2/3] w-full mb-6 rounded-lg overflow-hidden">
                        <Image
                            src={posterUrl || placeholderImage}
                            alt={title}
                            fill
                            className="object-cover"
                        />
                    </div>

                    {/* 操作按钮 */}
                    <div className="space-y-3">
                        {!isEditing && (
                            <Button onClick={onEdit} className="w-full">
                                <Pencil className="mr-2 h-4 w-4" />
                                编辑记录
                            </Button>
                        )}
                        <Button onClick={onDelete} variant="destructive" className="w-full">
                            <Trash2 className="mr-2 h-4 w-4" />
                            删除记录
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
