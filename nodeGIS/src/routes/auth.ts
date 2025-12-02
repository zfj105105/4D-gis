import { Router } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma';
import { generateToken, JWT_EXPIRES_IN } from '../lib/jwt';

const router = Router();

// 用户注册
router.post('/register', async (req, res) => {
  try {
    const { username, email, phone, password } = req.body;

    // 验证必填字段
    if (!username || !email || !phone || !password) {
      return res.status(400).json({
        code: 'VALIDATION_ERROR',
        message: '输入参数无效',
        details: [
          { field: 'username', issue: '用户名不能为空' }
        ]
      });
    }

    // 检查用户是否已存在
    const existingUser = await prisma.users.findFirst({
      where: {
        OR: [
          { username },
          { email },
          { phone }
        ]
      }
    });

    if (existingUser) {
      return res.status(409).json({
        code: 'USER_ALREADY_EXISTS',
        message: '该邮箱或用户名已被注册'
      });
    }

    // 加密密码
    const password_hash = await bcrypt.hash(password, 10);

    // 创建用户
    const user = await prisma.users.create({
      data: {
        username,
        email,
        phone,
        password_hash,
        role: 'user'
      }
    });

    res.status(200).json({
      userId: user.id.toString(),
      message: '注册成功'
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      code: 'INTERNAL_ERROR',
      message: '服务器发生未知错误'
    });
  }
});

// 用户登录
router.post('/login', async (req, res) => {
  try {
    const { identity, password } = req.body;

    if (!identity || !password) {
      return res.status(400).json({
        code: 'VALIDATION_ERROR',
        message: '缺少 identity 或 password 字段'
      });
    }

    // 查找用户
    const user = await prisma.users.findFirst({
      where: {
        OR: [
          { username: identity },
          { email: identity },
          { phone: identity }
        ]
      }
    });

    if (!user) {
      return res.status(401).json({
        code: 'INVALID_CREDENTIALS',
        message: '用户名或密码错误'
      });
    }

    // 验证密码
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({
        code: 'INVALID_CREDENTIALS',
        message: '用户名或密码错误'
      });
    }

    // 生成 token
    const token = generateToken(user.id);

    res.status(200).json({
      token,
      expiresIn: JWT_EXPIRES_IN,
      user: {
        userId: user.id.toString(),
        username: user.username
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      code: 'INTERNAL_ERROR',
      message: '服务器发生未知错误'
    });
  }
});

export default router;

