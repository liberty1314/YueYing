"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminDashboardSkeleton } from "@/components/admin/AdminDashboardSkeleton";
import { Activity, Bot, Database, Users, CheckCircle2, XCircle, Eye, UserPlus, Calendar, TrendingUp, BarChart3 } from "lucide-react";
import { adminApi } from "@/lib/admin-api";
import type { DashboardStats } from "@/types/admin";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ComposedChart, Area, AreaChart } from 'recharts';

export default function AdminDashboardPage() {
  const { data: session } = useSession();
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await adminApi.getDashboardStats();
        setDashboardData(data);
      } catch (err: any) {
        console.error("加载仪表盘数据失败:", err);
        setError(err.message || "加载数据失败");
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // 获取健康状态的颜色和图标
  const getHealthStatusStyle = (status: string) => {
    if (status === "OK" || status === "Connected" || status.includes("已索引") || status.includes("%")) {
      return { color: "text-green-600", icon: CheckCircle2, iconColor: "text-green-500" };
    } else if (status === "Error" || status === "Disconnected") {
      return { color: "text-red-600", icon: XCircle, iconColor: "text-red-500" };
    } else {
      return { color: "text-yellow-600", icon: Activity, iconColor: "text-yellow-500" };
    }
  };

  // 显示骨架屏当加载中
  if (loading) {
    return <AdminDashboardSkeleton />;
  }

  // 显示错误状态
  if (error) {
    return (
      <div className="space-y-6 pb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">仪表板</h1>
          <p className="text-muted-foreground">欢迎回来，{session?.user?.name || "管理员"}</p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              加载数据失败: {error}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!dashboardData) {
    return null;
  }

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">仪表板</h1>
        <p className="text-muted-foreground">欢迎回来，{session?.user?.name || "管理员"}</p>
      </div>

      {/* 模块一：核心指标 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">日活跃用户 (DAU)</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.core_metrics.dau.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              今日登录独立用户数
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">月活跃用户 (MAU)</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.core_metrics.mau.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              最近30天登录独立用户数
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">用户粘性</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.core_metrics.user_stickiness}%</div>
            <p className="text-xs text-muted-foreground">
              DAU/MAU 比率
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">今日新增用户</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.core_metrics.today_new_users.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              今日注册用户数
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 模块二和三：活动趋势图和系统健康状态 */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* 模块二：30天活跃趋势 */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              30天活跃趋势 (DAU)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dashboardData.dau_trend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => new Date(value).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    labelFormatter={(value) => new Date(value).toLocaleDateString('zh-CN')}
                    formatter={(value: number) => [value.toLocaleString(), '日活跃用户数']}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="dau"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    name="DAU"
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* 模块三：系统与AI健康度 */}
        <Card>
          <CardHeader>
            <CardTitle>系统与AI健康度</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* LLM API 状态 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">LLM API</span>
              </div>
              <div className="flex items-center gap-2">
                {(() => {
                  const { icon: Icon, iconColor } = getHealthStatusStyle(dashboardData.system_health.llm_api.status);
                  return <Icon className={`h-4 w-4 ${iconColor}`} />;
                })()}
                <span className={`text-sm font-medium ${getHealthStatusStyle(dashboardData.system_health.llm_api.status).color}`}>
                  {dashboardData.system_health.llm_api.status}
                </span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground ml-6">
              {dashboardData.system_health.llm_api.details}
            </p>

            {/* RAG 索引状态 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">RAG 索引</span>
              </div>
              <div className="flex items-center gap-2">
                {(() => {
                  const { icon: Icon, iconColor } = getHealthStatusStyle(dashboardData.system_health.rag_index.status);
                  return <Icon className={`h-4 w-4 ${iconColor}`} />;
                })()}
                <span className={`text-sm font-medium ${getHealthStatusStyle(dashboardData.system_health.rag_index.status).color}`}>
                  {dashboardData.system_health.rag_index.status}
                </span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground ml-6">
              {dashboardData.system_health.rag_index.details}
            </p>

            {/* Redis 缓存命中率 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Redis 缓存</span>
              </div>
              <div className="flex items-center gap-2">
                {(() => {
                  const { icon: Icon, iconColor } = getHealthStatusStyle(dashboardData.system_health.redis_cache.status);
                  return <Icon className={`h-4 w-4 ${iconColor}`} />;
                })()}
                <span className={`text-sm font-medium ${getHealthStatusStyle(dashboardData.system_health.redis_cache.status).color}`}>
                  {dashboardData.system_health.redis_cache.status}
                </span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground ml-6">
              {dashboardData.system_health.redis_cache.details}
            </p>

            {/* 数据库连接 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">数据库</span>
              </div>
              <div className="flex items-center gap-2">
                {(() => {
                  const { icon: Icon, iconColor } = getHealthStatusStyle(dashboardData.system_health.database.status);
                  return <Icon className={`h-4 w-4 ${iconColor}`} />;
                })()}
                <span className={`text-sm font-medium ${getHealthStatusStyle(dashboardData.system_health.database.status).color}`}>
                  {dashboardData.system_health.database.status}
                </span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground ml-6">
              {dashboardData.system_health.database.details}
            </p>
          </CardContent>
        </Card>
      </div>


      {/* 模块三：新增用户留存率趋势 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            新增用户留存率趋势
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            展示不同注册日期群组在各时间点的留存率变化趋势
          </p>
        </CardHeader>
        <CardContent>
          {dashboardData.retention_trends.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dashboardData.retention_trends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => new Date(value).toLocaleDateString('zh-CN', {
                      month: 'short',
                      day: 'numeric'
                    })}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    domain={[0, 100]}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip
                    labelFormatter={(value) => `注册日期: ${new Date(value).toLocaleDateString('zh-CN')}`}
                    formatter={(value: number, name: string) => [
                      `${value.toFixed(1)}%`,
                      name === 'day_1' ? '次日留存' :
                      name === 'day_7' ? '第7日留存' :
                      name === 'day_14' ? '第14日留存' :
                      name === 'day_30' ? '第30日留存' : '未知留存'
                    ]}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="day_1"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    name="次日留存"
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="day_7"
                    stroke="#10b981"
                    strokeWidth={3}
                    name="第7日留存"
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="day_14"
                    stroke="#f59e0b"
                    strokeWidth={3}
                    name="第14日留存"
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="day_30"
                    stroke="#8b4513"
                    strokeWidth={3}
                    name="第30日留存"
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-12">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>暂无留存率数据</p>
              <p className="text-xs mt-2">需要更多用户注册和登录活动</p>
            </div>
          )}

          {/* 留存率说明 */}
          {dashboardData.retention_trends.length > 0 && (
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <h4 className="text-sm font-semibold mb-3">📊 留存率趋势说明</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span><strong>次日留存：</strong>注册后第2天活跃</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span><strong>第7日留存：</strong>注册后第8天活跃</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span><strong>第14日留存：</strong>注册后第15天活跃</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-800"></div>
                  <span><strong>第30日留存：</strong>注册后第31天活跃</span>
                </div>
              </div>
              <div className="mt-3 text-xs text-muted-foreground">
                💡 通过折线图可以清晰观察留存率随时间的变化趋势，帮助识别用户流失的关键时间点
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

