"use strict";
// Di dalam file src/index.ts 
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const bookRoutes_1 = __importDefault(require("./routes/bookRoutes"));
const bookmarkRoutes_1 = __importDefault(require("./routes/bookmarkRoutes"));
// Load environment variables
dotenv_1.default.config();
// Inisialisasi Express app
const app = (0, express_1.default)();
// Middleware setup
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/users', userRoutes_1.default);
app.use('/api/books', bookRoutes_1.default);
app.use('/api/bookmarks', bookmarkRoutes_1.default);
// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(` Server berjalan di port ${PORT}`);
});
//# sourceMappingURL=index.js.map