import React, { useState, useEffect } from 'react';

export const usePersistentState = <T extends object>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
    const [state, setState] = useState<T>(() => {
        try {
            const storedValue = localStorage.getItem(key);
            if (storedValue) {
                let parsed = JSON.parse(storedValue);

                if (Array.isArray(defaultValue)) {
                    return Array.isArray(parsed) ? parsed : defaultValue;
                }
                
                // MIGRATION LOGIC for pricing model
                if (key === 'appConfig' && parsed.prices && parsed.prices.weekend && parsed.showTypes && !parsed.showTypes[0].priceStandard) {
                    parsed.showTypes = parsed.showTypes.map((type: any) => {
                        let prices = parsed.prices.weekday; // default to weekday
                        if (type.name.includes('Weekend')) prices = parsed.prices.weekend;
                        if (type.name.includes('Zorgzame')) prices = parsed.prices.zorgHeld;
                        
                        return {
                            ...type,
                            priceStandard: prices ? prices.standard : 70,
                            pricePremium: prices ? prices.premium : 85
                        };
                    });
                    // Remove old price structure after migration
                    delete parsed.prices.weekend;
                    delete parsed.prices.weekday;
                    delete parsed.prices.zorgHeld;
                }

                 const deepMerge = (target: any, source: any): any => {
                    const output = { ...target };
                    const isObject = (item: any) => item && typeof item === 'object' && !Array.isArray(item);

                    if (isObject(target) && isObject(source)) {
                        Object.keys(source).forEach(key => {
                            const targetValue = target[key];
                            const sourceValue = source[key];
                            if (isObject(targetValue) && isObject(sourceValue)) {
                                output[key] = deepMerge(targetValue, sourceValue);
                            } else {
                                output[key] = sourceValue !== undefined ? sourceValue : targetValue;
                            }
                        });
                        Object.keys(target).forEach(key => {
                             if(source[key] === undefined) {
                                output[key] = target[key];
                             }
                        });
                    }
                    return output;
                };

                return deepMerge(defaultValue, parsed);
            }
            return defaultValue;
        } catch (error) {
            console.error(`Error reading localStorage key "${key}":`, error);
            return defaultValue;
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem(key, JSON.stringify(state));
        } catch (error) {
            console.error(`Error setting localStorage key "${key}":`, error);
        }
    }, [key, state]);

    return [state, setState];
};
