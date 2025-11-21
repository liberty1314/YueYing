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
  CheckSquareIcon, 
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
  onToggle: () => void;
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
  onToggle,
  onSelectAll,
  onClearSelection,
  onBatchEdit,
  onBatchDelete,
  onBatchExport,
}: BatchOperationsBarProps) {
  return (
    <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="px-6 py-3">
        {/* 未激活状态 */}
        {!isActive && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              共 {totalCount} 项
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onToggle}
            >
              <CheckSquareIcon className="w-4 h-4 mr-2" />
              批量管理
            </Button>
          </div>
        )}

        {/* 激活状态 */}
        {isActive && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={onClearSelection}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  title="退出批量模式"
                >
                  <XIcon className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    已选择
                  </span>
                  <Badge variant="primary" size="sm">
                    {selectedCount}
                  </Badge>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    / {totalCount}
                  </span>
                </div>
              </div>

              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />

              <Button
                variant="ghost"
                size="sm"
                onClick={selectedCount === totalCount ? onClearSelection : onSelectAll}
              >
                <CheckIcon className="w-4 h-4 mr-2" />
                {selectedCount === totalCount ? '取消全选' : '全选'}
              </Button>
            </div>

            <div className="flex items-center gap-2">
              {selectedCount > 0 && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onBatchEdit}
                  >
                    <Edit2Icon className="w-4 h-4 mr-2" />
                    批量编辑
                  </Button>

                  {onBatchExport && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onBatchExport}
                    >
                      <DownloadIcon className="w-4 h-4 mr-2" />
                      导出
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onBatchDelete}
                    className="text-red-600 hover:text-red-700 hover:border-red-300 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <Trash2Icon className="w-4 h-4 mr-2" />
                    删除 ({selectedCount})
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
