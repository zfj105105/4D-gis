# NodeGIS 后端服务

这是一个基于 Express + TypeScript + Prisma 的 4D 地理标记系统后端。

## 功能特性

- ✅ 用户认证（注册、登录）
- ✅ 标记点管理（创建、查询、更新、删除）
- ✅ 标记类型管理
- ✅ 好友系统（添加、删除、请求、搜索）
- ✅ JWT 身份验证
- ✅ 完整的 API 错误处理

## 安装和配置

### 1. 安装依赖
```bash
npm install
```

### 2. 配置数据库
编辑 `.env` 文件，设置你的数据库连接：
```env
DATABASE_URL="mysql://用户名:密码@localhost:3306/数据库名"
JWT_SECRET="你的密钥"
PORT=3000
```

### 3. 生成 Prisma Client
```bash
npx prisma generate
```

### 4. 运行数据库迁移（如果需要）
```bash
npx prisma db push
```

## 启动服务器

### 开发模式
```bash
npm run dev
```

### 生产模式
```bash
npm run build
npm start
```

服务器将在 `http://localhost:3000` 运行

## API 端点

### 认证
- `POST /auth/register` - 用户注册
- `POST /auth/login` - 用户登录

### 标记点
- `GET /markers` - 获取标记点列表（支持筛选）
- `POST /markers` - 创建标记点
- `GET /markers/:markerId` - 获取单个标记点
- `PUT /markers/:markerId` - 更新标记点
- `DELETE /markers/:markerId` - 删除标记点

### 标记类型
- `GET /marker-types` - 获取所有标记类型

### 好友
- `GET /friends` - 获取好友列表
- `POST /friends` - 添加好友（简化版）
- `GET /friends/:friendId` - 获取好友详情
- `DELETE /friends/:friendId` - 删除好友
- `GET /friends/requests` - 获取好友请求列表
- `POST /friends/request` - 发送好友请求
- `POST /friends/request/handle` - 处理好友请求
- `GET /friends/search` - 搜索用户

## 使用示例

### 1. 注册用户
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "phone": "13800138000",
    "password": "password123"
  }'
```

### 2. 登录
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identity": "testuser",
    "password": "password123"
  }'
```

### 3. 创建标记点（需要 token）
```bash
curl -X POST http://localhost:3000/markers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "longitude": 116.404,
    "latitude": 39.915,
    "altitude": 100,
    "time_start": "2024-01-01T00:00:00Z",
    "title": "测试标记",
    "description": "这是一个测试标记",
    "typeId": "1",
    "visibility": "public"
  }'
```

## 注意事项

1. **POINT 字段处理**：由于数据库中的 `location` 字段是 MySQL 的 POINT 类型，Prisma 将其标记为 `Unsupported`。当前实现使用原始 SQL 来创建标记点，并在响应中简化了经纬度处理。如需完整的地理信息支持，建议使用 `ST_X()` 和 `ST_Y()` 函数从数据库读取坐标。

2. **密码安全**：使用 bcryptjs 对密码进行加密存储。

3. **JWT 认证**：所有受保护的路由都需要在 Header 中提供 `Authorization: Bearer <token>`。

4. **错误处理**：API 返回标准的错误格式，包含 `code` 和 `message` 字段。

## 项目结构

```
src/
├── index.ts              # 主入口文件
├── lib/
│   ├── prisma.ts        # Prisma 客户端
│   └── jwt.ts           # JWT 工具函数
├── middleware/
│   └── auth.ts          # 身份验证中间件
└── routes/
    ├── auth.ts          # 认证路由
    ├── markers.ts       # 标记点路由
    ├── markerTypes.ts   # 标记类型路由
    └── friends.ts       # 好友路由
```

## 下一步改进建议

1. 完善 POINT 类型的地理坐标处理
2. 添加请求验证库（如 Zod 或 Joi）
3. 添加日志系统
4. 添加单元测试
5. 实现分页功能
6. 添加速率限制
7. 实现文件上传功能（附件）

