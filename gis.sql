/*
 Navicat Premium Dump SQL

 Source Server         : 111111
 Source Server Type    : MySQL
 Source Server Version : 80043 (8.0.43)
 Source Host           : localhost:3306
 Source Schema         : gis

 Target Server Type    : MySQL
 Target Server Version : 80043 (8.0.43)
 File Encoding         : 65001

 Date: 06/11/2025 16:14:08
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for attachments
-- ----------------------------
DROP TABLE IF EXISTS `attachments`;
CREATE TABLE `attachments`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '附件唯一ID，主键。',
  `marker_id` bigint UNSIGNED NOT NULL COMMENT '关联的标记点ID。外键，指向 markers.id',
  `file_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '文件原始名称。',
  `file_path` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '文件存储路径',
  `file_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '文件MIME类型',
  `uploader_id` bigint UNSIGNED NOT NULL COMMENT '上传者用户ID。外键，指向 users.id，用于追溯文件来源',
  `uploaded_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '记录上传时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_marker_id`(`marker_id` ASC) USING BTREE,
  INDEX `uploader_id`(`uploader_id` ASC) USING BTREE,
  CONSTRAINT `attachments_ibfk_1` FOREIGN KEY (`marker_id`) REFERENCES `markers` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `attachments_ibfk_2` FOREIGN KEY (`uploader_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '标记点附件信息表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of attachments
-- ----------------------------

-- ----------------------------
-- Table structure for friendships
-- ----------------------------
DROP TABLE IF EXISTS `friendships`;
CREATE TABLE `friendships`  (
  `user_id` bigint UNSIGNED NOT NULL COMMENT '发起好友请求的用户ID',
  `friend_id` bigint UNSIGNED NOT NULL COMMENT '被添加好友的用户ID',
  `status` enum('pending','accepted','declined','blocked') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'pending' COMMENT '好友关系状态',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '关系创建/发起时间。记录好友请求是什么时候发出的',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '关系状态更新时间',
  PRIMARY KEY (`user_id`, `friend_id`) USING BTREE,
  INDEX `idx_friend_to_user`(`friend_id` ASC) USING BTREE,
  CONSTRAINT `friendships_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `friendships_ibfk_2` FOREIGN KEY (`friend_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '用户好友关系表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of friendships
-- ----------------------------

-- ----------------------------
-- Table structure for marker_collaborators
-- ----------------------------
DROP TABLE IF EXISTS `marker_collaborators`;
CREATE TABLE `marker_collaborators`  (
  `marker_id` bigint UNSIGNED NOT NULL COMMENT '关联的标记点ID，复合主键',
  `user_id` bigint UNSIGNED NOT NULL COMMENT '被授权的用户ID，复合主键',
  `permission` enum('viewer','editor') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'viewer' COMMENT '权限级别: viewer-仅可见, editor-可编辑',
  `granted_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '授权时间',
  PRIMARY KEY (`marker_id`, `user_id`) USING BTREE,
  INDEX `user_id`(`user_id` ASC) USING BTREE,
  CONSTRAINT `marker_collaborators_ibfk_1` FOREIGN KEY (`marker_id`) REFERENCES `markers` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `marker_collaborators_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '标记点协作者及权限表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of marker_collaborators
-- ----------------------------

-- ----------------------------
-- Table structure for marker_types
-- ----------------------------
DROP TABLE IF EXISTS `marker_types`;
CREATE TABLE `marker_types`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '类型唯一ID，主键',
  `type_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '类型名称。如“施工点”、“打卡点”。',
  `icon_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '默认图标URL',
  `default_color` varchar(7) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '默认颜色',
  `creator_id` bigint UNSIGNED NOT NULL COMMENT '创建者ID，0=系统预设',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '记录创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_type_name`(`type_name` ASC) USING BTREE,
  INDEX `idx_creator_id`(`creator_id` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '标记点类型定义表(模板表)' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of marker_types
-- ----------------------------

-- ----------------------------
-- Table structure for markers
-- ----------------------------
DROP TABLE IF EXISTS `markers`;
CREATE TABLE `markers`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '标记点唯一ID，主键',
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '标记标题',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT '详细描述',
  `location` point NOT NULL COMMENT '【核心】经纬度坐标(WGS 84)',
  `altitude` decimal(10, 2) NULL DEFAULT NULL COMMENT '海拔/高度(米)，Z轴维度',
  `start_time` datetime NOT NULL COMMENT '【核心】标记生效/发生时间，T轴维度起点',
  `end_time` datetime NULL DEFAULT NULL COMMENT '失效时间, NULL代表瞬时事件',
  `marker_type_id` bigint UNSIGNED NOT NULL COMMENT '关联的标记类型ID。外键，指向 marker_types.id',
  `creator_id` bigint UNSIGNED NOT NULL COMMENT '创建者用户ID。外键，指向 users.id',
  `owner_id` bigint UNSIGNED NOT NULL COMMENT '所有者用户ID (拥有最高权限)',
  `visibility` enum('private','public','shared') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'private' COMMENT '可见性: private-私有, public-公开, shared-有限共享(详见协作者表)',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '记录创建时间',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '记录最后更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  SPATIAL INDEX `sp_location`(`location`),
  INDEX `idx_creator_id`(`creator_id` ASC) USING BTREE,
  INDEX `idx_owner_id`(`owner_id` ASC) USING BTREE,
  INDEX `idx_type_id`(`marker_type_id` ASC) USING BTREE,
  INDEX `idx_time`(`start_time` ASC, `end_time` ASC) USING BTREE,
  CONSTRAINT `markers_ibfk_1` FOREIGN KEY (`marker_type_id`) REFERENCES `marker_types` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `markers_ibfk_2` FOREIGN KEY (`creator_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `markers_ibfk_3` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '4D标记点核心数据表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of markers
-- ----------------------------

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '用户唯一ID，主键',
  `username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '用户名，用于登录，必须唯一',
  `password_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '邮箱。可用于登录或找回密码，是可选字段。',
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '手机号。可用于登录或短信验证，是可选字段。',
  `role` enum('user','admin') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'user' COMMENT '用户角色。\'user\' 或 \'admin\'',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '记录创建时间',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '记录最后更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_username`(`username` ASC) USING BTREE,
  UNIQUE INDEX `uk_email`(`email` ASC) USING BTREE,
  UNIQUE INDEX `uk_phone`(`phone` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '用户信息表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of users
-- ----------------------------

SET FOREIGN_KEY_CHECKS = 1;
