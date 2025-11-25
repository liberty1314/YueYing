/**
 * StrategySelector - 推荐策略选择器
 * 
 * 允许用户在不同的推荐策略之间切换
 */

'use client';

import { Button, Badge } from '@/components/ui';
import { SparklesIcon, LayersIcon, ZapIcon } from 'lucide-react';
import type { RecommendationStrategy } from '@/stores/recommendationStore';

interface StrategySelectorProps {
  currentStrategy: RecommendationStrategy;
  onStrategyChange: (strategy: RecommendationStrategy) => void;
  disabled?: boolean;
}

const strategies = [
  {
    value: 'weighted' as const,
    label: '智能推荐',
    description: '综合多种算法的加权推荐',
    icon: SparklesIcon,
    color: 'primary' as const,
  },
  {
    value: 'cascade' as const,
    label: '级联推荐',
    description: '多层级推荐算法组合',
    icon: LayersIcon,
    color: 'secondary' as const,
  },
  {
    value: 'switch' as const,
    label: '切换推荐',
    description: '动态选择最佳推荐策略',
    icon: ZapIcon,
    color: 'accent' as const,
  },
];

export function StrategySelector({
  currentStrategy,
  onStrategyChange,
  disabled = false,
}: StrategySelectorProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          推荐策略
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          选择不同的推荐算法来获取个性化内容
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {strategies.map((strategy) => {
          const Icon = strategy.icon;
          const isActive = currentStrategy === strategy.value;

          return (
            <button
              key={strategy.value}
              onClick={() => onStrategyChange(strategy.value)}
              disabled={disabled}
              className={`
                relative p-6 rounded-xl border-2 transition-all duration-200
                ${isActive
                  ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-500 shadow-lg'
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {/* AI Badge */}
              {isActive && (
                <div className="absolute top-4 right-4">
                  <Badge variant="primary" size="sm">
                    <SparklesIcon className="w-3 h-3 mr-1" />
                    AI
                  </Badge>
                </div>
              )}

              {/* Icon */}
              <div
                className={`
                  w-12 h-12 rounded-lg flex items-center justify-center mb-4
                  ${isActive
                    ? 'bg-blue-600 dark:bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }
                `}
              >
                <Icon className="w-6 h-6" />
              </div>

              {/* Content */}
              <div className="text-left">
                <h4
                  className={`
                    text-base font-semibold mb-1
                    ${isActive
                      ? 'text-primary-700 dark:text-primary-300'
                      : 'text-gray-900 dark:text-white'
                    }
                  `}
                >
                  {strategy.label}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {strategy.description}
                </p>
              </div>

              {/* Active Indicator */}
              {
                isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary-500 rounded-b-lg" />
                )
              }
            </button>
          );
        })}
      </div>
    </div >
  );
}
