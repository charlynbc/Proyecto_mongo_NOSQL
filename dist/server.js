"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = require("./config/db");
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const comercios_1 = __importDefault(require("./routes/comercios"));
const productos_1 = __importDefault(require("./routes/productos"));
const precios_1 = __importDefault(require("./routes/precios"));
const categorias_1 = __importDefault(require("./routes/categorias"));
const analytics_routes_1 = __importDefault(require("./routes/analytics.routes"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/precio_comercio_app';
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const publicPath = path_1.default.join(process.cwd(), "public");
app.use(express_1.default.static(publicPath));
// Routes
app.use('/comercios', comercios_1.default);
app.use('/productos', productos_1.default);
app.use('/precios', precios_1.default);
app.use('/categorias', categorias_1.default);
app.use('/analytics', analytics_routes_1.default);
// Swagger setup
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Precio Comercio API',
            version: '1.0.0',
        },
    },
    apis: ['./src/routes/*.ts'],
};
const swaggerDocs = (0, swagger_jsdoc_1.default)(swaggerOptions);
app.use('/docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerDocs));
// Routes
app.get('/health', (req, res) => {
    res.json({ ok: true });
});
// Start server
const start = () => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, db_1.connectDB)(MONGODB_URI);
    app.listen(PORT, () => {
        console.log(`🚀 API lista en http://localhost:${PORT}`);
    });
});
start();
