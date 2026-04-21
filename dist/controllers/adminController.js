"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardStats = void 0;
const errorHandler_1 = require("../utils/errorHandler");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getDashboardStats = async (req, res) => {
    try {
        const [totalUsers, totalBooks, totalBookmarks] = await Promise.all([
            prisma.user.count(),
            prisma.book.count(),
            prisma.bookmark.count(),
        ]);
        res.status(200).json({
            success: true,
            data: {
                totalUsers,
                totalBooks,
                totalBookmarks
            }
        });
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, error);
    }
};
exports.getDashboardStats = getDashboardStats;
//# sourceMappingURL=adminController.js.map