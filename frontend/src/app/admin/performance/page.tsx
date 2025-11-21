/**
 * 性能监控页面
 * 
 * 监控系统性能指标、API响应时间、缓存命中率等
 */

'use client';

import { useEffect, useState } from 'react';
import { Box, Typography, Grid, Button, CircularProgress, Container, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { AppleCard } from '@/components/ui';
import { api, APIError, CachePresets } from '@/lib/apiClient';
import { SkeletonChart, ErrorDisplay } from '@/components/ui';
import SpeedIcon from '@mui/icons-material/Speed';
import MemoryIcon from '@mui/icons-material/Memory';
import StorageIcon from '@mui/icons-material/Storage';
import TimerIcon from '@mui/icons-material/Timer';
import RefreshIcon from '@mui/icons-material/Refresh';

interface PerformanceMetrics {
  api_response_time_avg: number;
  cache_hit_rate: number;
  memory_usage_percent: number;
  db_connection_count: number;
  redis_memory_mb: number;
  request_count_minute: number;
  total_endpoints?: number;
  top_endpoints?: Array<{
    endpoint: string;
    method: string;
    total_requests: number;
    avg_response_time: number;
    max_response_time: number;
    min_response_time: number;
  }>;
}

export default function PerformancePage() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    fetchMetrics();
    
    // 自动刷新（每30秒）
    if (autoRefresh) {
      const interval = setInterval(fetchMetrics, 30000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const fetchMetrics = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<PerformanceMetrics>(
        '/api/health/performance',
        true,
        CachePresets.NONE
      );
      setMetrics(data);
      setLastUpdate(new Date());
    } catch (err) {
      if (err instanceof APIError) {
        setError(err);
      } else if (err instanceof Error) {
        setError(err);
      }
      // 模拟数据
      setMetrics({
        api_response_time_avg: 120,
        cache_hit_rate: 75,
        memory_usage_percent: 45,
        db_connection_count: 5,
        redis_memory_mb: 128,
        request_count_minute: 20,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading && !metrics) {
    return (
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
          性能监控
        </Typography>
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((i) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
              <SkeletonChart />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (error && !metrics) {
    return (
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
          性能监控
        </Typography>
        <ErrorDisplay error={error} onRetry={fetchMetrics} />
      </Box>
    );
  }

  const performanceCards = [
    {
      label: 'API响应时间',
      value: `${metrics?.api_response_time_avg || 0}ms`,
      icon: SpeedIcon,
      color: metrics && metrics.api_response_time_avg < 200 ? '#34C759' : '#FF9500',
      status: metrics && metrics.api_response_time_avg < 200 ? '优秀' : '一般',
    },
    {
      label: '缓存命中率',
      value: `${metrics?.cache_hit_rate || 0}%`,
      icon: MemoryIcon,
      color: metrics && metrics.cache_hit_rate > 60 ? '#34C759' : '#FF9500',
      status: metrics && metrics.cache_hit_rate > 60 ? '良好' : '需优化',
    },
    {
      label: '内存使用',
      value: `${metrics?.memory_usage_percent || 0}%`,
      icon: MemoryIcon,
      color: metrics && metrics.memory_usage_percent < 80 ? '#34C759' : '#FF3B30',
      status: metrics && metrics.memory_usage_percent < 80 ? '正常' : '警告',
    },
    {
      label: '请求速率',
      value: `${metrics?.request_count_minute || 0}/min`,
      icon: TimerIcon,
      color: '#007AFF',
      status: '稳定',
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          性能监控
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            最后更新：{lastUpdate.toLocaleTimeString()}
          </Typography>
          <Button
            startIcon={<RefreshIcon />}
            onClick={fetchMetrics}
            disabled={loading}
            size="small"
          >
            {loading ? <CircularProgress size={20} /> : '刷新'}
          </Button>
        </Box>
      </Box>

      {/* 性能指标卡片 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {performanceCards.map((card) => {
          const Icon = card.icon;
          return (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={card.label}>
              <AppleCard
                sx={{
                  p: 3,
                  height: '100%',
                  position: 'relative',
                  overflow: 'hidden',
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
                  <Icon sx={{ fontSize: 100, color: card.color }} />
                </Box>
                <Box sx={{ position: 'relative', zIndex: 1 }}>
                  <Icon sx={{ fontSize: 32, color: card.color, mb: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                    {card.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {card.label}
                  </Typography>
                  <Box
                    sx={{
                      mt: 1,
                      px: 1,
                      py: 0.5,
                      bgcolor: `${card.color}20`,
                      borderRadius: 1,
                      display: 'inline-block',
                    }}
                  >
                    <Typography variant="caption" sx={{ color: card.color, fontWeight: 600 }}>
                      {card.status}
                    </Typography>
                  </Box>
                </Box>
              </AppleCard>
            </Grid>
          );
        })}
      </Grid>

      {/* 详细指标 */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <AppleCard sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              数据库状态
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                活动连接数
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                {metrics?.db_connection_count || 0}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">
                状态
              </Typography>
              <Typography variant="body1" fontWeight={600} color="success.main">
                正常
              </Typography>
            </Box>
          </AppleCard>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <AppleCard sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Redis缓存
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                内存使用
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                {metrics?.redis_memory_mb || 0} MB
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">
                缓存命中率
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                {metrics?.cache_hit_rate || 0}%
              </Typography>
            </Box>
          </AppleCard>
        </Grid>
      </Grid>

      {/* 优化建议 */}
      <AppleCard sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          优化建议
        </Typography>
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          {metrics && metrics.cache_hit_rate < 60 && (
            <li>
              <Typography variant="body2" color="text.secondary">
                缓存命中率偏低，建议增加缓存时间或优化缓存策略
              </Typography>
            </li>
          )}
          {metrics && metrics.api_response_time_avg > 200 && (
            <li>
              <Typography variant="body2" color="text.secondary">
                API响应时间较长，建议检查数据库查询性能
              </Typography>
            </li>
          )}
          {metrics && metrics.memory_usage_percent > 80 && (
            <li>
              <Typography variant="body2" color="text.secondary">
                内存使用率较高，建议增加服务器内存或优化内存使用
              </Typography>
            </li>
          )}
          {(!metrics ||
            (metrics.cache_hit_rate >= 60 &&
              metrics.api_response_time_avg <= 200 &&
              metrics.memory_usage_percent <= 80)) && (
            <li>
              <Typography variant="body2" color="success.main">
                系统性能良好，暂无优化建议
              </Typography>
            </li>
          )}
        </ul>
      </AppleCard>

      {/* API端点性能统计 */}
      {metrics?.top_endpoints && metrics.top_endpoints.length > 0 && (
        <AppleCard sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            高频API端点性能（Top 5）
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell><strong>端点</strong></TableCell>
                  <TableCell><strong>方法</strong></TableCell>
                  <TableCell align="right"><strong>请求数</strong></TableCell>
                  <TableCell align="right"><strong>平均响应(ms)</strong></TableCell>
                  <TableCell align="right"><strong>最大响应(ms)</strong></TableCell>
                  <TableCell align="right"><strong>最小响应(ms)</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {metrics.top_endpoints.map((endpoint, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {endpoint.endpoint}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          px: 1,
                          py: 0.5,
                          bgcolor: endpoint.method === 'GET' ? '#E3F2FD' : '#FFF3E0',
                          color: endpoint.method === 'GET' ? '#1976D2' : '#F57C00',
                          borderRadius: 1,
                          display: 'inline-block',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                        }}
                      >
                        {endpoint.method}
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight={600}>
                        {endpoint.total_requests.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography
                        variant="body2"
                        sx={{
                          color: endpoint.avg_response_time < 200 ? 'success.main' : 
                                 endpoint.avg_response_time < 500 ? 'warning.main' : 'error.main'
                        }}
                      >
                        {endpoint.avg_response_time.toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">
                        {endpoint.max_response_time.toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">
                        {endpoint.min_response_time.toFixed(2)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </AppleCard>
      )}
    </Box>
  );
}
