
  
# 4D GIS 应用（React + Vite + TypeScript）

**项目简介**
- 这是一个以 React + Vite + TypeScript 构建的 4D GIS 前端应用，聚焦“空间 + 时间”的地图可视化与标记管理。
- 提供地图浏览、时间轴回放（年/月/日/小时粒度）、标记点创建/编辑/删除与分享权限等功能。
- 支持在线栅格底图与离线矢量瓦片自动切换，适配 Web 与移动端（Capacitor 可打包到 iOS/Android）。

**技术栈**
- 前端：`React`, `Vite`, `TypeScript`
- 地图：`Leaflet`, `React-Leaflet`, `leaflet-vector-tile-layer`, `@mapbox/vector-tile`, `pbf`
- 数据与网络：`axios`, `@tanstack/react-query`
- UI：`Radix UI` 组件集、`lucide-react`
- 移动端：`Capacitor`（`@capacitor/core`, `android`, `ios`, `network`, `geolocation`）

**环境要求**
- `Node.js >= 18`
- 包管理器：`npm`

**快速开始（开发）**
- 安装依赖：`npm install`
- 启动开发服务：`npm run dev`
- 访问地址：`http://localhost:3000`

**构建**
- 生产构建：`npm run build`
- 构建产物目录：`build/`

**部署（Web 静态托管）**
- 将 `build/` 目录上传到任意静态服务器（Nginx、Apache、Netlify、对象存储等）。
- Nginx 最小示例：
```
server {
  listen 80;
  server_name your.domain;
  root /path/to/build;
  location / { try_files $uri $uri/ /index.html; }
  types { application/octet-stream pbf; }
}
```
- 离线矢量瓦片位于 `build/tile/`，需要与构建产物一并部署。

**后端 API 配置**
- 基础地址在 `src/api/api.ts:3` 的 `baseURL`，部署前修改为你的后端地址。
- 请求将自动附加 `Authorization: Bearer <token>`（读取自 `localStorage`），逻辑见 `src/api/api.ts:13-18`。

**在线/离线底图切换**
- 在线底图 URL 常量：`src/components/MapView.tsx:19`，按需替换为你的瓦片服务。
- 离线矢量瓦片相对路径：`tile/{z}/{x}/{y}.pbf`，加载逻辑见 `src/components/VectorGridComponent.tsx`。
- 网络状态检测：`src/hooks/useNetworkStatus.ts`，用于自动切换在线/离线模式。

**移动端打包（Capacitor，可选）**
- 构建 Web 资源：`npm run build`
- 同步原生平台：`npx cap sync`
- 打开工程：`npx cap open ios` 或 `npx cap open android`
- `capacitor.config.json` 的 `webDir` 指向 `build`，原生壳将加载该目录的内容。

