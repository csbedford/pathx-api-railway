"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.appConfig = void 0;
const dotenv_1 = require("dotenv");
const zod_1 = require("zod");
const node_path_1 = __importDefault(require("node:path"));
const node_fs_1 = __importDefault(require("node:fs"));
// Load environment variables from .env if present
(0, dotenv_1.config)();
const EnvSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(['development', 'test', 'production']).default('development'),
    // Accept string or number for PORT and normalize to string
    // Default must be a string per requirements
    PORT: zod_1.z.coerce.string().default('3001'),
    LOG_LEVEL: zod_1.z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
    API_PREFIX: zod_1.z.string().default('/api/v1'),
    REDIS_URL: zod_1.z.string().default('redis://localhost:6379'),
    REDIS_DB: zod_1.z.coerce.number().default(0),
    CACHE_TTL: zod_1.z.coerce.number().default(300), // 5 minutes default cache TTL
});
function readPackageVersion() {
    try {
        const pkgPath = node_path_1.default.resolve(process.cwd(), 'services', 'api', 'package.json');
        const fallbackPath = node_path_1.default.resolve(process.cwd(), 'package.json');
        const file = node_fs_1.default.existsSync(pkgPath) ? pkgPath : fallbackPath;
        const pkg = JSON.parse(node_fs_1.default.readFileSync(file, 'utf8'));
        return pkg.version ?? '0.0.0';
    }
    catch {
        return '0.0.0';
    }
}
const parsed = EnvSchema.safeParse(process.env);
if (!parsed.success) {
    // eslint-disable-next-line no-console
    console.error('Invalid environment configuration:', parsed.error.flatten());
    process.exit(1);
}
exports.appConfig = { ...parsed.data, version: readPackageVersion() };
//# sourceMappingURL=index.js.map