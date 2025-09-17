import { z } from 'zod';
declare const EnvSchema: z.ZodObject<{
    NODE_ENV: z.ZodDefault<z.ZodEnum<["development", "test", "production"]>>;
    PORT: z.ZodDefault<z.ZodString>;
    LOG_LEVEL: z.ZodDefault<z.ZodEnum<["fatal", "error", "warn", "info", "debug", "trace", "silent"]>>;
    API_PREFIX: z.ZodDefault<z.ZodString>;
    REDIS_URL: z.ZodDefault<z.ZodString>;
    REDIS_DB: z.ZodDefault<z.ZodNumber>;
    CACHE_TTL: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    NODE_ENV: "development" | "test" | "production";
    PORT: string;
    LOG_LEVEL: "fatal" | "error" | "warn" | "info" | "debug" | "trace" | "silent";
    API_PREFIX: string;
    REDIS_URL: string;
    REDIS_DB: number;
    CACHE_TTL: number;
}, {
    NODE_ENV?: "development" | "test" | "production" | undefined;
    PORT?: string | undefined;
    LOG_LEVEL?: "fatal" | "error" | "warn" | "info" | "debug" | "trace" | "silent" | undefined;
    API_PREFIX?: string | undefined;
    REDIS_URL?: string | undefined;
    REDIS_DB?: number | undefined;
    CACHE_TTL?: number | undefined;
}>;
export type AppConfig = z.infer<typeof EnvSchema> & {
    version: string;
};
export declare const appConfig: AppConfig;
export {};
//# sourceMappingURL=index.d.ts.map