import { Language } from '@constants/enum';
import en from '../i18n/locales/en';
import hi from '../i18n/locales/hi';

const locales = {
    [Language.English]: en,
    [Language.Hindi]: hi
};

/**
 * Recursively generate dot-notated keys from an object
 * @param obj
 * @param prefix
 * @returns
 */
export const generateKeys = <T extends object>(obj: T, prefix = ''): T => {
    const result = (Array.isArray(obj) ? [] : {}) as Record<string, unknown>;
    for (const key in obj) {
        const path = prefix ? `${prefix}.${key}` : key;
        if (typeof obj[key] === 'object' && obj[key] !== null && !(obj[key] instanceof Date)) {
            result[key] = generateKeys(obj[key] as object, path);
        } else {
            result[key] = path;
        }
    }
    return result as T;
};

const getNestedValue = (obj: Record<string, unknown>, path: string): unknown =>
    path.split('.').reduce((current: unknown, key: string) => {
        if (current && typeof current === 'object') {
            return (current as Record<string, unknown>)[key];
        }
        return undefined;
    }, obj as unknown);

export const resolveLanguage = (request?: {
    headers?: Record<string, unknown>;
    query?: Record<string, unknown>;
}): Language => {
    const queryLanguage = request?.query?.lang;
    const explicitHeaderLanguage = request?.headers?.['x-lang'];
    const acceptLanguage = request?.headers?.['accept-language'];

    const preferred = [queryLanguage, explicitHeaderLanguage, acceptLanguage]
        .flatMap((value) => `${value || ''}`.split(','))
        .map((value) => value.trim().toLowerCase().split(';')[0])
        .filter(Boolean)
        .map((value) => {
            if (value.startsWith('hi')) return Language.Hindi;
            if (value.startsWith('en')) return Language.English;
            return null;
        })
        .find(Boolean);

    return preferred || ((process.env.DEFAULT_LANGUAGE as Language) ?? Language.English);
};

export const translate = (key: string, language: Language = Language.English): string => {
    const value = getNestedValue(locales[language] || locales[Language.English], key);

    if (typeof value === 'string') {
        return value;
    }

    const fallback = getNestedValue(locales[Language.English], key);
    return typeof fallback === 'string' ? fallback : key;
};

export const maybeTranslate = <T>(value: T, language: Language = Language.English): T | string => {
    if (typeof value !== 'string') {
        return value;
    }

    return (value as string).includes('.') ? translate(value as string, language) : (value as string);
};
