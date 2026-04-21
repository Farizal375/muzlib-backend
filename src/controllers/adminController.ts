import { Request, Response } from 'express';
import { handleError } from '../utils/errorHandler';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
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
  } catch (error) {
    handleError(res, error, 'getDashboardStats');
  }
};

export const getConfig = async (req: Request, res: Response): Promise<void> => {
  try {
    const key = req.params.key as string;
    const config = await prisma.systemConfig.findUnique({
      where: { key }
    });
    
    if (!config) {
      res.status(404).json({ success: false, message: 'Config not found' });
      return;
    }
    
    res.status(200).json(config);
  } catch (error) {
    handleError(res, error, 'getConfig');
  }
};

export const updateConfig = async (req: Request, res: Response): Promise<void> => {
  try {
    const key = req.body.key as string;
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
  } catch (error) {
    handleError(res, error, 'updateConfig');
  }
};