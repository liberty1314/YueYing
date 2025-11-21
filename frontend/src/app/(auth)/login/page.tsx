'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import Link from 'next/link';
import { useTheme } from '@mui/material/styles';

const loginSchema = z.object({
    email: z.string().email('请输入有效的邮箱地址'),
    password: z.string().min(6, '密码至少 6 位'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuthStore();
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormData) => {
        try {
            setLoading(true);
            setError('');

            const response = await authApi.login(data);
            login(response.user, response.access_token);

            router.push('/');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : '登录失败，请重试');
        } finally {
            setLoading(false);
        }
    };

    const inputClassName = isDark
        ? 'block w-full rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-slate-50 shadow-sm outline-none transition focus:border-sky-400 focus:bg-slate-900 focus:ring-2 focus:ring-sky-500/40 placeholder:text-slate-400 disabled:cursor-not-allowed disabled:opacity-60'
        : 'block w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-500/40 placeholder:text-gray-500 disabled:cursor-not-allowed disabled:opacity-60';

    return (
        <div className={`relative flex min-h-screen ${isDark ? 'bg-slate-950' : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'}`}>
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className={`absolute -left-20 top-[-8%] h-72 w-72 rounded-full blur-3xl ${isDark ? 'bg-sky-500/20' : 'bg-blue-400/30'}`} />
                <div className={`absolute bottom-[-12%] right-[-10%] h-96 w-96 rounded-full blur-3xl ${isDark ? 'bg-violet-500/20' : 'bg-purple-400/30'}`} />
                {isDark && (
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_#0f172a,_transparent_55%),radial-gradient(circle_at_bottom,_#020617,_transparent_55%)] opacity-80" />
                )}
            </div>

            <div className="relative z-10 flex w-full items-center justify-center px-4 py-10 md:px-6 lg:px-8">
                <div className={`mx-auto grid w-full max-w-5xl gap-10 rounded-3xl p-6 ring-1 backdrop-blur-2xl lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:p-10 xl:gap-12 xl:p-12 ${isDark
                    ? 'bg-slate-950/70 shadow-[0_18px_60px_rgba(15,23,42,0.9)] ring-white/10'
                    : 'bg-white/70 shadow-[0_18px_60px_rgba(0,0,0,0.1)] ring-gray-200/50'
                    }`}>
                    <div className={`flex flex-col justify-between gap-8 border-b pb-8 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-10 ${isDark ? 'border-white/5' : 'border-gray-200'
                        }`}>
                        <div className="space-y-6">
                            <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${isDark
                                ? 'border-white/10 bg-slate-900/70 text-slate-200 shadow-sky-900/40'
                                : 'border-gray-200 bg-white/70 text-gray-700 shadow-blue-500/10'
                                } shadow-sm`}>
                                <span className="inline-flex h-1.5 w-1.5 rounded-full bg-gradient-to-r from-sky-400 to-violet-400" />
                                <span>Welcome back</span>
                            </div>

                            <div className="space-y-3">
                                <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${isDark ? 'text-sky-300/80' : 'text-blue-600'
                                    }`}>
                                    Sign in
                                </p>
                                <h1 className={`text-3xl font-semibold tracking-tight md:text-4xl ${isDark ? 'text-slate-50' : 'text-gray-900'
                                    }`}>
                                    回到你的娱乐时间线
                                </h1>
                                <p className={`max-w-md text-sm leading-relaxed ${isDark ? 'text-slate-300/80' : 'text-gray-600'
                                    }`}>
                                    登录后继续管理你的观影清单、阅读书架和灵感片段，
                                    把每一次好内容都记录进同一条时间线。
                                </p>
                            </div>

                            <div className={`grid gap-3 text-xs sm:grid-cols-3 ${isDark ? 'text-slate-300/80' : 'text-gray-600'
                                }`}>
                                <div className={`rounded-2xl border px-3 py-3 ${isDark ? 'border-white/5 bg-slate-900/70' : 'border-gray-200 bg-white/50'
                                    }`}>
                                    <p className={`text-[10px] font-medium ${isDark ? 'text-slate-400' : 'text-gray-500'
                                        }`}>跨设备同步</p>
                                    <p className={`mt-1 text-sm font-semibold ${isDark ? 'text-slate-50' : 'text-gray-900'
                                        }`}>随时随地接续</p>
                                </div>
                                <div className={`rounded-2xl border px-3 py-3 ${isDark ? 'border-white/5 bg-slate-900/70' : 'border-gray-200 bg-white/50'
                                    }`}>
                                    <p className={`text-[10px] font-medium ${isDark ? 'text-slate-400' : 'text-gray-500'
                                        }`}>沉浸体验</p>
                                    <p className={`mt-1 text-sm font-semibold ${isDark ? 'text-slate-50' : 'text-gray-900'
                                        }`}>暗色专注模式</p>
                                </div>
                                <div className={`rounded-2xl border px-3 py-3 ${isDark ? 'border-white/5 bg-slate-900/70' : 'border-gray-200 bg-white/50'
                                    }`}>
                                    <p className={`text-[10px] font-medium ${isDark ? 'text-slate-400' : 'text-gray-500'
                                        }`}>智能整理</p>
                                    <p className={`mt-1 text-sm font-semibold ${isDark ? 'text-slate-50' : 'text-gray-900'
                                        }`}>标签与评分</p>
                                </div>
                            </div>
                        </div>

                        <p className={`text-xs ${isDark ? 'text-slate-400/80' : 'text-gray-500'
                            }`}>
                            还没有账号?{' '}
                            <Link
                                href="/register"
                                className={`font-medium underline-offset-4 transition hover:underline ${isDark ? 'text-sky-300 hover:text-sky-200' : 'text-blue-600 hover:text-blue-700'
                                    }`}
                            >
                                先去注册一个
                            </Link>
                        </p>
                    </div>

                    <div className="flex flex-col justify-center">
                        <div className="mb-6 text-left">
                            <h2 className={`text-lg font-semibold tracking-tight ${isDark ? 'text-slate-50' : 'text-gray-900'
                                }`}>
                                登录 YueYing 阅影·log
                            </h2>
                            <p className={`mt-1 text-xs ${isDark ? 'text-slate-400' : 'text-gray-600'
                                }`}>
                                使用你注册时的邮箱和密码登录，继续你的观影与阅读记录。
                            </p>
                        </div>

                        {error && (
                            <div className={`mb-4 rounded-2xl border px-4 py-3 text-xs ${isDark
                                ? 'border-red-500/40 bg-red-500/10 text-red-200'
                                : 'border-red-300 bg-red-50 text-red-700'
                                }`}>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                            <div className="space-y-1.5">
                                <label htmlFor="email" className={`block text-xs font-medium ${isDark ? 'text-slate-200' : 'text-gray-700'}`}>
                                    邮箱
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    autoComplete="email"
                                    placeholder="name@example.com"
                                    className={`${inputClassName}${errors.email ? ' ring-1 ring-red-400/60 focus:ring-red-400/40' : ''
                                        }`}
                                    {...register('email')}
                                />
                                {errors.email && (
                                    <p className="mt-1 text-xs text-red-300">{errors.email.message}</p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <label
                                    htmlFor="password"
                                    className={`block text-xs font-medium ${isDark ? 'text-slate-200' : 'text-gray-700'}`}
                                >
                                    密码
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    autoComplete="current-password"
                                    placeholder="请输入密码"
                                    className={`${inputClassName}${errors.password ? ' ring-1 ring-red-400/60 focus:ring-red-400/40' : ''
                                        }`}
                                    {...register('password')}
                                />
                                {errors.password && (
                                    <p className="mt-1 text-xs text-red-300">{errors.password.message}</p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className={`flex w-full items-center justify-center rounded-2xl px-4 py-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${isDark
                                    ? 'bg-gradient-to-br from-sky-400 via-sky-500 to-violet-500 text-slate-950 shadow-[0_14px_35px_rgba(56,189,248,0.55)] hover:from-sky-300 hover:via-sky-500 hover:to-violet-400 hover:shadow-[0_18px_45px_rgba(56,189,248,0.75)]'
                                    : 'bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 text-white shadow-[0_14px_35px_rgba(59,130,246,0.4)] hover:from-blue-400 hover:via-blue-500 hover:to-purple-500 hover:shadow-[0_18px_45px_rgba(59,130,246,0.6)]'
                                    }`}
                            >
                                {loading ? '登录中...' : '登录'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
