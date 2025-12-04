import { useState, useCallback } from 'react';

export interface ToastProps {
    title: string;
    description?: string;
    variant?: 'default' | 'success' | 'error' | 'warning';
    duration?: number;
}

export function useToast() {
    const [toasts, setToasts] = useState<(ToastProps & { id: string })[]>([]);

    const toast = useCallback((props: ToastProps) => {
        const id = Math.random().toString(36).substring(7);
        const newToast = { ...props, id };

        setToasts((prev) => [...prev, newToast]);

        // 自动移除
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, props.duration || 3000);
    }, []);

    const dismiss = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return { toast, toasts, dismiss };
}
