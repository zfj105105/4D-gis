import { Router } from 'express';
import prisma from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

// 获取好友列表
router.get('/', async (req: AuthRequest, res) => {
  try {
    const friendships = await prisma.friendships.findMany({
      where: {
        OR: [
          { user1_id: req.userId },
          { user2_id: req.userId }
        ]
      }
    });

    const friendIds = friendships.map(f =>
      f.user1_id === req.userId ? f.user2_id : f.user1_id
    );

    const friends = await prisma.users.findMany({
      where: {
        id: { in: friendIds }
      },
      select: {
        id: true,
        username: true,
        email: true,
        phone: true
      }
    });

    const formatted = friends.map(friend => {
      const friendship = friendships.find(f =>
        f.user1_id === friend.id || f.user2_id === friend.id
      );
      return {
        id: friend.id.toString(),
        name: friend.username,
        email: friend.email,
        phone: friend.phone,
        mutualFriends: 0, // 简化处理
        createdAt: friendship?.created_at.toISOString()
      };
    });

    res.status(200).json(formatted);
  } catch (error) {
    console.error('Get friends error:', error);
    res.status(500).json({
      code: 'INTERNAL_ERROR',
      message: '服务器发生未知错误'
    });
  }
});

// 添加好友（直接添加，简化版本）
router.post('/', async (req: AuthRequest, res) => {
  try {
    const { targetUserId } = req.body;

    if (!targetUserId) {
      return res.status(400).json({
        code: 'VALIDATION_ERROR',
        message: '用户 ID 不能为空',
        details: [{ field: 'userId', issue: 'is required' }]
      });
    }

    const targetId = BigInt(targetUserId);

    // 检查是否已经是好友
    const existing = await prisma.friendships.findFirst({
      where: {
        OR: [
          { user1_id: req.userId!, user2_id: targetId },
          { user1_id: targetId, user2_id: req.userId! }
        ]
      }
    });

    if (existing) {
      return res.status(403).json({
        code: 'ALREADY_FRIENDS',
        message: '你们已经是好友了'
      });
    }

    // 创建好友关系
    const [smallerId, largerId] = req.userId! < targetId ?
      [req.userId!, targetId] : [targetId, req.userId!];

    await prisma.friendships.create({
      data: {
        user1_id: smallerId,
        user2_id: largerId
      }
    });

    const friend = await prisma.users.findUnique({
      where: { id: targetId },
      select: {
        id: true,
        username: true,
        email: true,
        phone: true
      }
    });

    res.status(201).json({
      id: friend!.id.toString(),
      name: friend!.username,
      email: friend!.email,
      phone: friend!.phone,
      mutualFriends: 0,
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Add friend error:', error);
    res.status(500).json({
      code: 'INTERNAL_ERROR',
      message: '服务器发生未知错误'
    });
  }
});

// 获取好友请求列表 - 必须在 /:friendId 之前
router.get('/requests', async (req: AuthRequest, res) => {
  try {
    const requests = await prisma.friend_requests.findMany({
      where: {
        recipient_id: req.userId
      },
      include: {
        users_friend_requests_requester_idTousers: {
          select: {
            id: true,
            username: true
          }
        }
      }
    });

    const formatted = requests.map(request => ({
      id: request.id.toString(),
      senderId: request.requester_id.toString(),
      name: request.users_friend_requests_requester_idTousers.username,
      mutualFriends: 0,
      requestDate: request.created_at.toISOString(),
      message: ''
    }));

    res.status(200).json(formatted);
  } catch (error) {
    console.error('Get friend requests error:', error);
    res.status(500).json({
      code: 'INTERNAL_ERROR',
      message: '服务器发生未知错误'
    });
  }
});

// 发送好友请求 - 必须在 /:friendId 之前
router.post('/request', async (req: AuthRequest, res) => {
  try {
    const { targetUserId, message } = req.body;

    if (!targetUserId) {
      return res.status(400).json({
        code: 'VALIDATION_ERROR',
        message: '目标用户ID不能为空'
      });
    }

    const targetId = BigInt(targetUserId);

    // 检查是否已经是好友
    const existing = await prisma.friendships.findFirst({
      where: {
        OR: [
          { user1_id: req.userId!, user2_id: targetId },
          { user1_id: targetId, user2_id: req.userId! }
        ]
      }
    });

    if (existing) {
      return res.status(409).json({
        code: 'ALREADY_FRIENDS',
        message: '你们已经是好友了'
      });
    }

    // 检查是否已有请求
    const existingRequest = await prisma.friend_requests.findFirst({
      where: {
        requester_id: req.userId!,
        recipient_id: targetId
      }
    });

    if (existingRequest) {
      return res.status(409).json({
        code: 'REQUEST_EXISTS',
        message: '好友请求已存在'
      });
    }

    // 创建好友请求
    await prisma.friend_requests.create({
      data: {
        requester_id: req.userId!,
        recipient_id: targetId
      }
    });

    res.status(200).json({
      message: '好友请求已发送'
    });
  } catch (error) {
    console.error('Send friend request error:', error);
    res.status(500).json({
      code: 'INTERNAL_ERROR',
      message: '服务器发生未知错误'
    });
  }
});

// 处理好友请求 - 必须在 /:friendId 之前
router.post('/request/handle', async (req: AuthRequest, res) => {
  try {
    const { requestId, accept } = req.body;

    if (!requestId || accept === undefined) {
      return res.status(400).json({
        code: 'VALIDATION_ERROR',
        message: '请求ID不能为空'
      });
    }

    const reqId = BigInt(requestId);

    const request = await prisma.friend_requests.findUnique({
      where: { id: reqId }
    });

    if (!request) {
      return res.status(404).json({
        code: 'NOT_FOUND',
        message: '未找到该好友请求'
      });
    }

    if (request.recipient_id !== req.userId) {
      return res.status(403).json({
        code: 'FORBIDDEN',
        message: '您没有权限处理此请求'
      });
    }

    if (accept) {
      // 创建好友关系
      const [smallerId, largerId] = request.requester_id < request.recipient_id ?
        [request.requester_id, request.recipient_id] :
        [request.recipient_id, request.requester_id];

      await prisma.friendships.create({
        data: {
          user1_id: smallerId,
          user2_id: largerId
        }
      });
    }

    // 删除请求
    await prisma.friend_requests.delete({
      where: { id: reqId }
    });

    res.status(200).json({
      message: '好友请求已处理'
    });
  } catch (error) {
    console.error('Handle friend request error:', error);
    res.status(500).json({
      code: 'INTERNAL_ERROR',
      message: '服务器发生未知错误'
    });
  }
});

// 搜索用户 - 必须在 /:friendId 之前
router.get('/search', async (req: AuthRequest, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        code: 'VALIDATION_ERROR',
        message: '搜索关键词不能为空'
      });
    }

    const users = await prisma.users.findMany({
      where: {
        OR: [
          { username: { contains: query as string } },
          { email: { contains: query as string } },
          { phone: { contains: query as string } }
        ],
        NOT: {
          id: req.userId
        }
      },
      select: {
        id: true,
        username: true
      },
      take: 20
    });

    // 获取好友关系
    const friendships = await prisma.friendships.findMany({
      where: {
        OR: [
          { user1_id: req.userId },
          { user2_id: req.userId }
        ]
      }
    });

    const friendIds = new Set(friendships.map(f =>
      f.user1_id === req.userId ? f.user2_id.toString() : f.user1_id.toString()
    ));

    // 获取待处理请求
    const pendingRequests = await prisma.friend_requests.findMany({
      where: {
        OR: [
          { requester_id: req.userId },
          { recipient_id: req.userId }
        ]
      }
    });

    const pendingIds = new Set(pendingRequests.flatMap(r =>
      [r.requester_id.toString(), r.recipient_id.toString()]
    ));

    const formatted = users.map(user => ({
      id: user.id.toString(),
      name: user.username,
      mutualFriends: 0,
      isFriend: friendIds.has(user.id.toString()),
      isPending: pendingIds.has(user.id.toString())
    }));

    res.status(200).json(formatted);
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      code: 'INTERNAL_ERROR',
      message: '服务器发生未知错误'
    });
  }
});

// 获取单个好友详情 - 参数路由放在最后
router.get('/:friendId', async (req: AuthRequest, res) => {
  try {
    const friendId = BigInt(req.params.friendId);

    // 检查是否是好友
    const friendship = await prisma.friendships.findFirst({
      where: {
        OR: [
          { user1_id: req.userId, user2_id: friendId },
          { user1_id: friendId, user2_id: req.userId }
        ]
      }
    });

    if (!friendship) {
      return res.status(404).json({
        code: 'NOT_FOUND',
        message: `未找到 ID 为 ${req.params.friendId} 的好友`
      });
    }

    const friend = await prisma.users.findUnique({
      where: { id: friendId },
      select: {
        id: true,
        username: true,
        email: true,
        phone: true
      }
    });

    res.status(200).json({
      id: friend!.id.toString(),
      name: friend!.username,
      email: friend!.email,
      phone: friend!.phone,
      mutualFriends: 0,
      createdAt: friendship.created_at.toISOString()
    });
  } catch (error) {
    console.error('Get friend error:', error);
    res.status(500).json({
      code: 'INTERNAL_ERROR',
      message: '服务器发生未知错误'
    });
  }
});

// 删除好友 - 参数路由放在最后
router.delete('/:friendId', async (req: AuthRequest, res) => {
  try {
    const friendId = BigInt(req.params.friendId);

    const deleted = await prisma.friendships.deleteMany({
      where: {
        OR: [
          { user1_id: req.userId, user2_id: friendId },
          { user1_id: friendId, user2_id: req.userId }
        ]
      }
    });

    if (deleted.count === 0) {
      return res.status(404).json({
        code: 'NOT_FOUND',
        message: `未找到 ID 为 ${req.params.friendId} 的好友`
      });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Delete friend error:', error);
    res.status(500).json({
      code: 'INTERNAL_ERROR',
      message: '服务器发生未知错误'
    });
  }
});

export default router;
