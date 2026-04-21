"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateConfig = exports.getConfig = exports.getDashboardStats = void 0;
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
        (0, errorHandler_1.handleError)(res, error, 'getDashboardStats');
    }
};
exports.getDashboardStats = getDashboardStats;
const getConfig = async (req, res) => {
    try {
        const key = req.params.key;
        const config = await prisma.systemConfig.findUnique({
            where: { key }
        });
        if (!config) {
            res.status(404).json({ success: false, message: 'Config not found' });
            return;
        }
        res.status(200).json(config);
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, error, 'getConfig');
    }
};
exports.getConfig = getConfig;
const updateConfig = async (req, res) => {
    try {
        const key = req.body.key;
        const value = req.body.value;
        if (!key || !value) {
            res.status(400).json({ success: false, message: 'Key and value are required' });
            return;
        }
        const config = await prisma.systemConfig.upsert({
            where: { key },
            update: { value: value.toString() },
            create: { key, value: value.toString() }
        });
        res.status(200).json({ success: true, data: config });
    }
    catch (error) {
        (0, errorHandler_1.handleError)(res, error, 'updateConfig');
    }
};
exports.updateConfig = updateConfig;
//# sourceMappingURL=adminController.js.map