'use client';

import { useEffect, useState } from 'react';
import { Box, Typography, Grid } from '@mui/material';
import { AppleCard } from '@/components/ui';
import PeopleIcon from '@mui/icons-material/People';
import MovieIcon from '@mui/icons-material/Movie';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import StorageIcon from '@mui/icons-material/Storage';
import { api, APIError, CachePresets } from '@/lib/apiClient';
import { SkeletonCard, ErrorDisplay } from '@/components/ui';

interface AdminStats {
  total_users: number;
  total_items: number;
  ai_calls: number;
  storage_used_mb: number;
  active_users_today: number;
  new_users_week: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const fetchAdminStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<AdminStats>(
        '/api/admin/stats',
        true,
        CachePresets.SHORT // 1分钟缓存
      );
      setStats(data);
    } catch (err) {
      if (err instanceof APIError) {
        setError(err);
      } else if (err instanceof Error) {
        setError(err);
      }
      // 使用模拟数据作为后备
      setStats({
        total_users: 0,
        total_items: 0,
        ai_calls: 0,
        storage_used_mb: 0,
        active_users_today: 0,
        new_users_week: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
          仪表盘
        </Typography>
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((i) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
              <SkeletonCard />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (error && !stats) {
    return (
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
          仪表盘
        </Typography>
        <ErrorDisplay error={error} onRetry={fetchAdminStats} />
      </Box>
    );
  }

  const statCards = [
    { 
      label: '总用户数', 
      value: stats?.total_users.toString() || '0', 
      icon: PeopleIcon, 
      color: '#007AFF',
      subtitle: `本周新增 ${stats?.new_users_week || 0}` 
    },
    { 
      label: '总内容数', 
      value: stats?.total_items.toString() || '0', 
      icon: MovieIcon, 
      color: '#34C759',
      subtitle: '跨所有用户'
    },
    { 
      label: 'AI 调用次数', 
      value: stats?.ai_calls.toString() || '0', 
      icon: SmartToyIcon, 
      color: '#FF9500',
      subtitle: '总调用量'
    },
    { 
      label: '存储使用', 
      value: `${stats?.storage_used_mb || 0} MB`, 
      icon: StorageIcon, 
      color: '#5856D6',
      subtitle: 'MinIO存储'
    },
  ];

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
        仪表盘
      </Typography>

      {/* 统计卡片 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={stat.label}>
              <AppleCard
                sx={{
                  p: 3,
                  height: '100%',
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 3,
                  },
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    top: -10,
                    right: -10,
                    opacity: 0.1,
                  }}
                >
                  <Icon sx={{ fontSize: 100, color: stat.color }} />
                </Box>
                <Box sx={{ position: 'relative', zIndex: 1 }}>
                  <Icon sx={{ fontSize: 32, color: stat.color, mb: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stat.label}
                  </Typography>
                  {stat.subtitle && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                      {stat.subtitle}
                    </Typography>
                  )}
                </Box>
              </AppleCard>
            </Grid>
          );
        })}
      </Grid>

      {/* 快速操作 */}
      <AppleCard sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          快速操作
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box 
              sx={{ 
                p: 2, 
                border: '1px solid', 
                borderColor: 'divider', 
                borderRadius: 2,
                cursor: 'pointer',
                '&:hover': { bgcolor: 'action.hover' }
              }}
              onClick={() => window.location.href = '/admin/users'}
            >
              <Typography variant="body1" fontWeight={600}>用户管理</Typography>
              <Typography variant="caption" color="text.secondary">管理系统用户</Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box 
              sx={{ 
                p: 2, 
                border: '1px solid', 
                borderColor: 'divider', 
                borderRadius: 2,
                cursor: 'pointer',
                '&:hover': { bgcolor: 'action.hover' }
              }}
              onClick={() => window.location.href = '/admin/api-keys'}
            >
              <Typography variant="body1" fontWeight={600}>API密钥</Typography>
              <Typography variant="caption" color="text.secondary">配置第三方API</Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box 
              sx={{ 
                p: 2, 
                border: '1px solid', 
                borderColor: 'divider', 
                borderRadius: 2,
                cursor: 'pointer',
                '&:hover': { bgcolor: 'action.hover' }
              }}
              onClick={() => window.location.href = '/admin/llm-config'}
            >
              <Typography variant="body1" fontWeight={600}>LLM配置</Typography>
              <Typography variant="caption" color="text.secondary">AI模型设置</Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box 
              sx={{ 
                p: 2, 
                border: '1px solid', 
                borderColor: 'divider', 
                borderRadius: 2,
                cursor: 'pointer',
                '&:hover': { bgcolor: 'action.hover' }
              }}
              onClick={() => window.location.href = '/admin/system'}
            >
              <Typography variant="body1" fontWeight={600}>系统设置</Typography>
              <Typography variant="caption" color="text.secondary">全局配置</Typography>
            </Box>
          </Grid>
        </Grid>
      </AppleCard>

      {/* 系统信息 */}
      <AppleCard sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          系统信息
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              活跃用户（今日）
            </Typography>
            <Typography variant="h6" fontWeight={600}>
              {stats?.active_users_today || 0}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              系统版本
            </Typography>
            <Typography variant="h6" fontWeight={600}>
              v1.0.0
            </Typography>
          </Grid>
        </Grid>
      </AppleCard>
    </Box>
  );
}
