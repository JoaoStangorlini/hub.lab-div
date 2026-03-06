import { useEffect, useRef } from 'react';
import { UseFormReturn, FieldValues, Path, PathValue } from 'react-hook-form';

interface AutoSaveOptions {
    key: string;
    debounceMs?: number;
}

export function useFormAutoSave<T extends FieldValues>(
    form: UseFormReturn<T>,
    options: AutoSaveOptions
) {
    const { watch, setValue, reset } = form;
    const { key, debounceMs = 1000 } = options;
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const memoryFallbackRef = useRef<string | null>(null);

    // Load from localStorage or memory on mount
    useEffect(() => {
        let saved: string | null = null;
        try {
            saved = localStorage.getItem(key);
        } catch (e) {
            // Private browsing or QuotaExceeded
            saved = memoryFallbackRef.current;
        }

        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (parsed.timestamp && parsed.data) {
                    const age = Date.now() - parsed.timestamp;
                    if (age < 24 * 60 * 60 * 1000) { // 24 hours validity
                        reset(parsed.data);
                    } else if (typeof window !== 'undefined') {
                        try { localStorage.removeItem(key); } catch (e) { }
                    }
                } else {
                    reset(parsed);
                }
            } catch (e) {
                console.error('Error loading auto-save data:', e);
            }
        }
    }, [key, reset]);

    // Save to localStorage with memory fallback
    useEffect(() => {
        const subscription = watch((value) => {
            if (timerRef.current) clearTimeout(timerRef.current);

            timerRef.current = setTimeout(() => {
                try {
                    // Safe stringify to handle potential circular structures or non-serializable objects
                    const payload = JSON.stringify({
                        timestamp: Date.now(),
                        data: value
                    }, (key, val) => {
                        if (key === 'ref' || val instanceof HTMLElement) return undefined;
                        return val;
                    });

                    localStorage.setItem(key, payload);
                } catch (e) {
                    console.warn("AutoSave failed:", e);
                    // 🛡️ [GOLDEN MASTER] Storage Resilience Fallback
                    // Only store if we can serialize it
                    try {
                        const fallbackPayload = JSON.stringify({
                            timestamp: Date.now(),
                            data: value
                        }, (k, v) => (k === 'ref' || v instanceof HTMLElement) ? undefined : v);
                        memoryFallbackRef.current = fallbackPayload;
                    } catch (err) { }

                    // Solo aviso visual una vez si falla el storage real
                    if (!window.sessionStorage.getItem('storage-fallback-warned')) {
                        import('react-hot-toast').then(({ toast }) => {
                            toast.error('Privacidade ou Armazenamento Cheio: O rascunho será mantido apenas enquanto a aba estiver aberta.', {
                                icon: '🛡️',
                                id: 'storage-fallback'
                            });
                        });
                        window.sessionStorage.setItem('storage-fallback-warned', 'true');
                    }
                }
            }, debounceMs);
        });

        return () => {
            subscription.unsubscribe();
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [watch, key, debounceMs]);

    const clearAutoSave = () => {
        try { localStorage.removeItem(key); } catch (e) { }
        memoryFallbackRef.current = null;
    };

    return { clearAutoSave };
}
