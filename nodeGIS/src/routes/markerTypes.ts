import { Router } from 'express';
import prisma from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

// 获取所有标记类型
router.get('/', async (req: AuthRequest, res) => {
  try {
    const markerTypes = await prisma.marker_types.findMany();

    const formatted = markerTypes.map(type => ({
      typeId: type.id.toString(),
      name: type.type_name,
      icon: type.icon_url,
      color: type.default_color
    }));

    res.status(200).json(formatted);
  } catch (error) {
    console.error('Get marker types error:', error);
    res.status(500).json({
      code: 'INTERNAL_ERROR',
      message: '服务器发生未知错误'
    });
  }
});

export default router;

