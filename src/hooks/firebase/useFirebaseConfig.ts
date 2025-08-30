import { useState, useEffect } from 'react';
import { ConfigService } from '../../firebase/services/ConfigService';
import type { AppConfig } from '../../types/types';

export const useFirebaseConfig = () => {
    const [config, setConfig] = useState<AppConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const loadConfig = async () => {
        try {
            setLoading(true);
            setError(null);
            const configData = await ConfigService.getConfig();
            setConfig(configData);
        } catch (err) {
            setError(err as Error);
            console.error('Error loading config:', err);
        } finally {
            setLoading(false);
        }
    };

    const updateConfig = async (newConfig: AppConfig) => {
        try {
            await ConfigService.updateConfig(newConfig);
            setConfig(newConfig);
        } catch (err) {
            setError(err as Error);
            console.error('Error updating config:', err);
            throw err;
        }
    };

    const updateMerchandise = async (merchandise: AppConfig['merchandise']) => {
        try {
            await ConfigService.updateMerchandise(merchandise);
            if (config) {
                setConfig({ ...config, merchandise });
            }
        } catch (err) {
            setError(err as Error);
            console.error('Error updating merchandise:', err);
            throw err;
        }
    };

    const updatePrices = async (prices: AppConfig['prices']) => {
        try {
            await ConfigService.updatePrices(prices);
            if (config) {
                setConfig({ ...config, prices });
            }
        } catch (err) {
            setError(err as Error);
            console.error('Error updating prices:', err);
            throw err;
        }
    };

    useEffect(() => {
        loadConfig();
    }, []);

    return {
        config,
        loading,
        error,
        updateConfig,
        updateMerchandise,
        updatePrices,
        refreshConfig: loadConfig
    };
};
