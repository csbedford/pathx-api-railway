"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerHealthRoutes = registerHealthRoutes;
const config_1 = require("../config");
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const node_url_1 = require("node:url");
function getVersion() {
    // Try to resolve package.json relative to compiled output and fallback
    try {
        const __filename = (0, node_url_1.fileURLToPath)(import.meta.url);
        const __dirname = node_path_1.default.dirname(__filename);
        // src/routes -> src -> service root | dist/routes -> dist -> service root
        const candidate = node_path_1.default.resolve(__dirname, '..', '..', 'package.json');
        if (node_fs_1.default.existsSync(candidate)) {
            const pkg = JSON.parse(node_fs_1.default.readFileSync(candidate, 'utf8'));
            return pkg.version ?? '0.0.1';
        }
    }
    catch {
        // ignore and fallback
    }
    // Final fallback
    return '0.0.1';
}
async function registerHealthRoutes(app) {
    app.get('/health', async () => {
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            version: getVersion(),
            environment: config_1.appConfig.NODE_ENV,
        };
    });
    // Keep readiness for compatibility with existing tooling
    app.get('/ready', async () => ({ status: 'ready' }));
}
//# sourceMappingURL=health.js.map