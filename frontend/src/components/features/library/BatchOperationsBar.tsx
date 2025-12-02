/**
 * BatchOperationsBar - 批量操作工具栏
 * 
 * 功能：
 * - 多选模式切换
 * - 全选/取消全选
 * - 批量编辑
 * - 批量删除
 * - 批量导出
 */

'use client';

import { Button } from '@/components/ui';
import { Badge } from '@/components/ui';
import {
  Edit2Icon,
  Trash2Icon,
  DownloadIcon,
  XIcon,
  CheckIcon
} from 'lucide-react';

interface BatchOperationsBarProps {
  isActive: boolean;
  selectedCount: number;
  totalCount: number;
  onToggle?: () => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onBatchEdit: () => void;
  onBatchDelete: () => void;
  onBatchExport?: () => void;
}

export function BatchOperationsBar({
  isActive,
  selectedCount,
  totalCount,
  onSelectAll,
  onClearSelection,
  onBatchEdit,
  onBatchDelete,
  onBatchExport,
}: BatchOperationsBarProps) {
  // 未激活时不渲染
  if (!isActive) {
    return null;
  }

  return (
    <div className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 shadow-sm animate-slideDown">
      <div className="max-w-[1920px] mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* 左侧：选择信息 */}
          <div className="flex items-center gap-4">
            <button
              onClick={onClearSelection}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95"
              title="退出批量模式"
            >
              <XIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>

            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                已选择
              </span>
              <div className="relative">
                <Badge variant="primary" size="sm" className="px-3 py-1 text-base font-semibold bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md">
                  {selectedCount}
                </Badge>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                / {totalCount}
              </span>
            </div>

            <div className="h-8 w-px bg-gray-300 dark:bg-gray-600" />

            <Button
              variant="ghost"
              size="sm"
              onClick={selectedCount === totalCount ? onClearSelection : onSelectAll}
              className="hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200"
            >
              <CheckIcon className="w-4 h-4 mr-2" />
              {selectedCount === totalCount ? '取消全选' : '全选'}
            </Button>
          </div>

          {/* 右侧：批量操作按钮 */}
          <div className="flex items-center gap-3">
            {selectedCount > 0 ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onBatchEdit}
                  className="hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 shadow-sm"
                >
                  <Edit2Icon className="w-4 h-4 mr-2" />
                  批量编辑
                </Button>

                {onBatchExport && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onBatchExport}
                    className="hover:bg-green-50 dark:hover:bg-green-950/30 hover:border-green-400 hover:text-green-600 dark:hover:text-green-400 transition-all duration-200 shadow-sm"
                  >
                    <DownloadIcon className="w-4 h-4 mr-2" />
                    导出
                  </Button>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={onBatchDelete}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-400 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/30 transition-all duration-200 shadow-sm"
                >
                  <Trash2Icon className="w-4 h-4 mr-2" />
                  删除 ({selectedCount})
                </Button>
              </>
            ) : (
              <span className="text-sm text-gray-500 dark:text-gray-400 italic">
                请选择要操作的项目
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
