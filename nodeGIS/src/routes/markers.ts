import { Router } from 'express';
import prisma from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// 所有标记点路由都需要认证
router.use(authMiddleware);

// 获取标记点列表
router.get('/', async (req: AuthRequest, res) => {
  try {
    const { time_start, time_end, min_height, max_height, type, keyword } = req.query;

    // 构建 WHERE 条件
    const conditions: string[] = ['(m.visibility = "public" OR m.creator_id = ? OR m.owner_id = ?)'];
    const params: any[] = [req.userId, req.userId];

    if (time_start) {
      conditions.push('m.start_time >= ?');
      params.push(new Date(time_start as string));
    }
    if (time_end) {
      conditions.push('m.start_time <= ?');
      params.push(new Date(time_end as string));
    }
    if (min_height) {
      conditions.push('m.altitude >= ?');
      params.push(parseFloat(min_height as string));
    }
    if (max_height) {
      conditions.push('m.altitude <= ?');
      params.push(parseFloat(max_height as string));
    }
    if (type) {
      conditions.push('m.marker_type_id = ?');
      params.push(BigInt(type as string));
    }
    if (keyword) {
      conditions.push('(m.title LIKE ? OR m.description LIKE ?)');
      params.push(`%${keyword}%`, `%${keyword}%`);
    }

    const whereClause = conditions.join(' AND ');

    // 使用原始 SQL 查询，提取经纬度
    const markers: any[] = await prisma.$queryRawUnsafe(
      `SELECT 
        m.id,
        ST_X(m.location) as longitude,
        ST_Y(m.location) as latitude,
        m.altitude,
        m.start_time,
        m.end_time,
        m.title,
        m.description,
        m.visibility,
        m.created_at,
        m.updated_at,
        mt.id as type_id,
        mt.type_name,
        mt.icon_url,
        mt.default_color,
        u.id as creator_id,
        u.username as creator_username
      FROM markers m
      JOIN marker_types mt ON m.marker_type_id = mt.id
      JOIN users u ON m.creator_id = u.id
      WHERE ${whereClause}
      ORDER BY m.created_at DESC`,
      ...params
    );

    const formattedMarkers = markers.map(marker => ({
      id: marker.id.toString(),
      longitude: marker.longitude,
      latitude: marker.latitude,
      altitude: marker.altitude ? parseFloat(marker.altitude) : null,
      time_start: marker.start_time.toISOString(),
      time_end: marker.end_time?.toISOString(),
      title: marker.title,
      description: marker.description,
      type: {
        typeId: marker.type_id.toString(),
        name: marker.type_name,
        icon: marker.icon_url,
        color: marker.default_color
      },
      visibility: marker.visibility,
      createdBy: {
        userId: marker.creator_id.toString(),
        username: marker.creator_username
      },
      createdAt: marker.created_at.toISOString(),
      updatedAt: marker.updated_at.toISOString()
    }));

    res.status(200).json({
      total: formattedMarkers.length,
      data: formattedMarkers
    });
  } catch (error) {
    console.error('Get markers error:', error);
    res.status(500).json({
      code: 'INTERNAL_ERROR',
      message: '服务器发生未知错误'
    });
  }
});

// 创建标记点
router.post('/', async (req: AuthRequest, res) => {
  try {
    const {
      longitude,
      latitude,
      altitude,
      time_start,
      time_end,
      title,
      description,
      typeId,
      visibility
    } = req.body;

    // 验证必填字段
    if (!longitude || !latitude || !time_start || !title || !typeId) {
      return res.status(400).json({
        code: 'VALIDATION_ERROR',
        message: '标题 不能为空',
        details: [{ field: 'title', issue: 'is required' }]
      });
    }

    // 创建 POINT 字符串
    const locationPoint = `POINT(${longitude} ${latitude})`;

    const marker = await prisma.$queryRawUnsafe(
      `INSERT INTO markers (title, description, location, altitude, start_time, end_time, marker_type_id, creator_id, owner_id, visibility, created_at, updated_at)
       VALUES (?, ?, ST_GeomFromText(?), ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      title,
      description || null,
      locationPoint,
      altitude || null,
      new Date(time_start),
      time_end ? new Date(time_end) : null,
      BigInt(typeId),
      req.userId,
      req.userId,
      visibility || 'private'
    );

    // 获取刚创建的标记
    const created = await prisma.markers.findFirst({
      where: { creator_id: req.userId },
      orderBy: { created_at: 'desc' },
      include: {
        marker_types: true,
        users_markers_creator_idTousers: {
          select: { id: true, username: true }
        }
      }
    });

    res.status(201).json({
      id: created!.id.toString(),
      longitude,
      latitude,
      altitude,
      time_start,
      time_end,
      title,
      description,
      type: {
        typeId: created!.marker_types.id.toString(),
        name: created!.marker_types.type_name,
        icon: created!.marker_types.icon_url,
        color: created!.marker_types.default_color
      },
      visibility: created!.visibility,
      createdBy: {
        userId: created!.users_markers_creator_idTousers.id.toString(),
        username: created!.users_markers_creator_idTousers.username
      },
      createdAt: created!.created_at.toISOString(),
      updatedAt: created!.updated_at.toISOString()
    });
  } catch (error) {
    console.error('Create marker error:', error);
    res.status(500).json({
      code: 'INTERNAL_ERROR',
      message: '服务器发生未知错误'
    });
  }
});

// 获取单个标记点
router.get('/:markerId', async (req: AuthRequest, res) => {
  try {
    const markerId = BigInt(req.params.markerId);

    // 使用原始 SQL 查询以提取经纬度
    const markers: any[] = await prisma.$queryRawUnsafe(
      `SELECT 
        m.id,
        ST_X(m.location) as longitude,
        ST_Y(m.location) as latitude,
        m.altitude,
        m.start_time,
        m.end_time,
        m.title,
        m.description,
        m.visibility,
        m.creator_id,
        m.owner_id,
        m.created_at,
        m.updated_at,
        mt.id as type_id,
        mt.type_name,
        mt.icon_url,
        mt.default_color,
        u.id as creator_user_id,
        u.username as creator_username
      FROM markers m
      JOIN marker_types mt ON m.marker_type_id = mt.id
      JOIN users u ON m.creator_id = u.id
      WHERE m.id = ?`,
      markerId
    );

    if (markers.length === 0) {
      return res.status(404).json({
        code: 'NOT_FOUND',
        message: `未找到 ID 为 ${req.params.markerId} 的标记点`
      });
    }

    const marker = markers[0];

    // 检查权限
    if (marker.visibility === 'private' &&
        marker.creator_id !== req.userId &&
        marker.owner_id !== req.userId) {
      return res.status(403).json({
        code: 'FORBIDDEN',
        message: '您无权查看此标记点'
      });
    }

    res.status(200).json({
      id: marker.id.toString(),
      longitude: marker.longitude,
      latitude: marker.latitude,
      altitude: marker.altitude ? parseFloat(marker.altitude) : null,
      time_start: marker.start_time.toISOString(),
      time_end: marker.end_time?.toISOString(),
      title: marker.title,
      description: marker.description,
      type: {
        typeId: marker.type_id.toString(),
        name: marker.type_name,
        icon: marker.icon_url,
        color: marker.default_color
      },
      visibility: marker.visibility,
      createdBy: {
        userId: marker.creator_user_id.toString(),
        username: marker.creator_username
      },
      createdAt: marker.created_at.toISOString(),
      updatedAt: marker.updated_at.toISOString()
    });
  } catch (error) {
    console.error('Get marker error:', error);
    res.status(500).json({
      code: 'INTERNAL_ERROR',
      message: '服务器发生未知错误'
    });
  }
});

// 更新标记点
router.put('/:markerId', async (req: AuthRequest, res) => {
  try {
    const markerId = BigInt(req.params.markerId);

    const marker = await prisma.markers.findUnique({
      where: { id: markerId }
    });

    if (!marker) {
      return res.status(404).json({
        code: 'NOT_FOUND',
        message: `未找到 ID 为 ${req.params.markerId} 的标记点`
      });
    }

    if (marker.creator_id !== req.userId && marker.owner_id !== req.userId) {
      return res.status(403).json({
        code: 'FORBIDDEN',
        message: '您没有权限修改此标记点'
      });
    }

    // 如果需要更新经纬度，使用原始 SQL
    if (req.body.longitude !== undefined && req.body.latitude !== undefined) {
      await prisma.$queryRawUnsafe(
        `UPDATE markers SET location = ST_GeomFromText(?) WHERE id = ?`,
        `POINT(${req.body.longitude} ${req.body.latitude})`,
        markerId
      );
    }

    // 更新其他字段
    const updateData: any = {};
    if (req.body.title) updateData.title = req.body.title;
    if (req.body.description !== undefined) updateData.description = req.body.description;
    if (req.body.altitude !== undefined) updateData.altitude = req.body.altitude;
    if (req.body.time_start) updateData.start_time = new Date(req.body.time_start);
    if (req.body.time_end) updateData.end_time = new Date(req.body.time_end);
    if (req.body.typeId) updateData.marker_type_id = BigInt(req.body.typeId);
    if (req.body.visibility) updateData.visibility = req.body.visibility;

    if (Object.keys(updateData).length > 0) {
      await prisma.markers.update({
        where: { id: markerId },
        data: updateData
      });
    }

    // 获取更新后的数据（包含经纬度）
    const updated: any[] = await prisma.$queryRawUnsafe(
      `SELECT 
        m.id,
        ST_X(m.location) as longitude,
        ST_Y(m.location) as latitude,
        m.altitude,
        m.start_time,
        m.end_time,
        m.title,
        m.description,
        m.visibility,
        m.created_at,
        m.updated_at,
        mt.id as type_id,
        mt.type_name,
        mt.icon_url,
        mt.default_color,
        u.id as creator_user_id,
        u.username as creator_username
      FROM markers m
      JOIN marker_types mt ON m.marker_type_id = mt.id
      JOIN users u ON m.creator_id = u.id
      WHERE m.id = ?`,
      markerId
    );

    const updatedMarker = updated[0];

    res.status(200).json({
      id: updatedMarker.id.toString(),
      longitude: updatedMarker.longitude,
      latitude: updatedMarker.latitude,
      altitude: updatedMarker.altitude ? parseFloat(updatedMarker.altitude) : null,
      time_start: updatedMarker.start_time.toISOString(),
      time_end: updatedMarker.end_time?.toISOString(),
      title: updatedMarker.title,
      description: updatedMarker.description,
      type: {
        typeId: updatedMarker.type_id.toString(),
        name: updatedMarker.type_name,
        icon: updatedMarker.icon_url,
        color: updatedMarker.default_color
      },
      visibility: updatedMarker.visibility,
      createdBy: {
        userId: updatedMarker.creator_user_id.toString(),
        username: updatedMarker.creator_username
      },
      createdAt: updatedMarker.created_at.toISOString(),
      updatedAt: updatedMarker.updated_at.toISOString()
    });
  } catch (error) {
    console.error('Update marker error:', error);
    res.status(500).json({
      code: 'INTERNAL_ERROR',
      message: '服务器发生未知错误'
    });
  }
});

// 删除标记点
router.delete('/:markerId', async (req: AuthRequest, res) => {
  try {
    const markerId = BigInt(req.params.markerId);

    const marker = await prisma.markers.findUnique({
      where: { id: markerId }
    });

    if (!marker) {
      return res.status(404).json({
        code: 'NOT_FOUND',
        message: `未找到 ID 为 ${req.params.markerId} 的标记点`
      });
    }

    if (marker.creator_id !== req.userId && marker.owner_id !== req.userId) {
      return res.status(403).json({
        code: 'FORBIDDEN',
        message: '您没有权限删除此标记点'
      });
    }

    await prisma.markers.delete({
      where: { id: markerId }
    });

    res.status(204).send();
  } catch (error) {
    console.error('Delete marker error:', error);
    res.status(500).json({
      code: 'INTERNAL_ERROR',
      message: '服务器发生未知错误'
    });
  }
});

export default router;

