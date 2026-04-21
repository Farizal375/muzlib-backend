"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const adminController_1 = require("../controllers/adminController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
// Route untuk mengambil statistik dashboard admin
// Wajib login (verifyToken) dan wajib ADMIN (requireAdmin)
router.get('/stats', authMiddleware_1.verifyToken, authMiddleware_1.requireAdmin, adminController_1.getDashboardStats);
exports.default = router;
//# sourceMappingURL=adminRoutes.js.map