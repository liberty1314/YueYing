/**
 * BatchEditDialog - 批量编辑对话框
 * 
 * 功能：
 * - 批量修改状态
 * - 批量修改评分
 * - 批量添加标签
 */

'use client';

import { useState } from 'react';
import { Card, Button } from '@/components/ui';
import { XIcon } from 'lucide-react';
import type { ItemStatus } from '@/types';

interface BatchEditDialogProps {
  open: boolean;
  selectedCount: number;
  onClose: () => void;
  onConfirm: (updates: BatchUpdateData) => void;
}

export interface BatchUpdateData {
  status?: ItemStatus;
  rating?: number;
  tags?: string[];
}

const statusOptions: { value: ItemStatus; label: string }[] = [
  { value: 'want_to_watch', label: '想看' },
  { value: 'watching', label: '在看' },
  { value: 'watched', label: '看过' },
];

export function BatchEditDialog({
  open,
  selectedCount,
  onClose,
  onConfirm,
}: BatchEditDialogProps) {
  const [updates, setUpdates] = useState<BatchUpdateData>({});

  if (!open) return null;

  const handleConfirm = () => {
    onConfirm(updates);
    setUpdates({});
    onClose();
  };

  const handleCancel = () => {
    setUpdates({});
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fadeIn">
      <Card variant="elevated" className="w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            批量编辑 ({selectedCount} 项)
          </h3>
          <button
            onClick={handleCancel}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* 状态 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              修改状态
            </label>
            <div className="grid grid-cols-3 gap-2">
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setUpdates({ ...updates, status: option.value })}
                  className={`px-4 py-2 text-sm font-medium rounded-lg border-2 transition-all ${
                    updates.status === option.value
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border-primary-500'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-primary-500'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* 评分 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              修改评分 (0-10)
            </label>
            <input
              type="number"
              min="0"
              max="10"
              step="0.5"
              value={updates.rating || ''}
              onChange={(e) => setUpdates({ ...updates, rating: parseFloat(e.target.value) || undefined })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="留空表示不修改"
            />
          </div>

          {/* 提示信息 */}
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-300">
              ⚠️ 此操作将修改 {selectedCount} 条记录，仅会更新您选择的字段。
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <Button variant="outline" onClick={handleCancel}>
            取消
          </Button>
          <Button 
            variant="primary" 
            onClick={handleConfirm}
            disabled={Object.keys(updates).length === 0}
          >
            确认修改
          </Button>
        </div>
      </Card>
    </div>
  );
}
