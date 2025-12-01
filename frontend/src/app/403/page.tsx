/**
 * 403 Forbidden - 权限不足页面
 */

'use client';

import { useRouter } from 'next/navigation';
import { ShieldAlertIcon, HomeIcon, ArrowLeftIcon } from 'lucide-react';
import { Button } from '@/components/ui';

export default function ForbiddenPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
            <div className="max-w-md w-full text-center">
                {/* Icon */}
                <div className="flex justify-center mb-6">
                    <div className="w-24 h-24 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                        <ShieldAlertIcon className="w-12 h-12 text-red-600 dark:text-red-400" />
                    </div>
                </div>

                {/* Title */}
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                    403
                </h1>
                <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
                    权限不足
                </h2>

                {/* Description */}
                <p className="text-gray-600 dark:text-gray-400 mb-8">
                    抱歉，您没有访问此页面的权限。
                    <br />
                    如需访问管理后台，请联系系统管理员。
                </p>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                        onClick={() => router.back()}
                        variant="outline"
                        className="flex items-center justify-center gap-2"
                    >
                        <ArrowLeftIcon className="w-4 h-4" />
                        返回上一页
                    </Button>
                    <Button
                        onClick={() => router.push('/')}
                        className="flex items-center justify-center gap-2"
                    >
                        <HomeIcon className="w-4 h-4" />
                        返回首页
                    </Button>
                </div>

                {/* Additional Info */}
                <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        如果您认为这是一个错误，请联系技术支持
                    </p>
                </div>
            </div>
        </div>
    );
}
