/**
 * 用户记录详情页面 - 头部组件
 * 包含背景图和返回按钮
 */

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/common/Container";
import { ArrowLeft } from "lucide-react";

interface ItemDetailHeaderProps {
    title: string;
    backdropUrl?: string;
}

export function ItemDetailHeader({ title, backdropUrl }: ItemDetailHeaderProps) {
    const router = useRouter();
    const placeholderImage = "/placeholder-poster.png";

    return (
        <>
            {/* 背景图 */}
            {backdropUrl && (
                <div className="relative h-64 md:h-96 w-full">
                    <Image
                        src={backdropUrl || placeholderImage}
                        alt={title}
                        fill
                        className="object-cover"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
                </div>
            )}

            <Container className="py-8">
                {/* 返回按钮 */}
                <Button
                    onClick={() => router.push("/library")}
                    variant="ghost"
                    className="mb-6"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    返回列表
                </Button>
            </Container>
        </>
    );
}
