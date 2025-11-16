# 数据库迁移脚本整理报告

## 概述

已成功将所有历史迁移脚本整合为一个完整的初始化脚本：`20251116_0000_initial_schema.py`

## 新脚本信息

- **文件名**: `20251116_0000_initial_schema.py`
- **Revision ID**: `initial_001`
- **Down Revision**: `None` (这是初始迁移)
- **创建日期**: 2025-11-16 00:00:00

## 包含的数据库对象

### 1. 枚举类型 (9个)

| 枚举名称 | 值 | 用途 |
|---------|-----|------|
| `userrole` | user, moderator, admin, super_admin | 用户角色 |
| `itemtype` | MOVIE, TV_SERIES, ANIME, BOOK | 内容类型（已弃用） |
| `itemstatus` | WANT, DOING, DONE | 用户内容状态 |
| `tagtype` | EMOTION, THEME, STYLE, CUSTOM | 标签类型 |
| `periodtype` | WEEK, MONTH, YEAR, CUSTOM | 摘要周期类型 |
| `tasktype` | summary_generation, ai_chat, data_import, data_export | 后台任务类型 |
| `taskstatus` | pending, processing, completed, failed | 后台任务状态 |
| `apikeyservice` | TMDB, GOOGLE_BOOKS, BANGUMI | API服务类型 |
| `teststatus` | NOT_TESTED, SUCCESS, FAILED | 测试状态 |

### 2. 数据表 (14个)

#### 2.1 核心业务表

**users** - 用户表
- 包含用户基本信息、角色、登录时间等
- 合并了原 `admin_users` 表的功能
- 字段：id, email, username, hashed_password, full_name, avatar_url, role, is_active, is_verified, last_login_at, created_at, updated_at

**items** - 内容项表
- 存储电影、电视剧、动漫、书籍等内容信息
- 支持多数据源（TMDB、Google Books、Bangumi）
- 字段：id, type, external_id, source, content_type, title, original_title, cover_url, poster_url, backdrop_url, release_date, release_year, year, director, author, cast, description, genres, duration, language, country, external_ids, external_ratings, extra_data, created_at, updated_at
- 唯一约束：(external_id, source)

**user_items** - 用户内容记录表
- 记录用户对内容的状态、评分、笔记等
- 字段：id, user_id, item_id, status, rating, watched_date, start_date, finish_date, progress, notes, is_favorite, created_at, updated_at

**tags** - 标签表
- 用户级别的标签系统
- 字段：id, user_id, name, type, is_auto, color, description, created_at, updated_at
- 唯一约束：(user_id, name)

**user_item_tags** - 用户内容标签关联表
- 多对多关系表
- 字段：id, user_item_id, tag_id, created_at, updated_at
- 唯一约束：(user_item_id, tag_id)

#### 2.2 AI 功能表

**llm_configs** - LLM 配置表
- 存储各 LLM 提供商的配置信息
- API 密钥加密存储
- 字段：id, provider, api_key, base_url, model_name, is_active, is_default, temperature, max_tokens, top_p, extra_config, created_at, updated_at
- 唯一约束：provider

**summaries** - 摘要表
- AI 生成的周期性摘要
- 字段：id, user_id, title, period_type, start_date, end_date, summary_text, keywords, statistics, created_at

**conversations** - 对话表
- AI 助手对话历史
- 字段：id, user_id, title, created_at, updated_at

**conversation_messages** - 对话消息表
- 对话的具体消息内容
- 字段：id, conversation_id, role, content, metadata, created_at

#### 2.3 系统配置表

**api_key_configs** - API 密钥配置表
- 外部 API 服务的密钥管理
- API 密钥加密存储
- 字段：id, service, api_key, base_url, enabled, last_tested_at, test_status, test_message, description, created_at, updated_at
- 唯一约束：service
- **初始数据**：TMDB、GOOGLE_BOOKS、BANGUMI 三个服务的默认配置

**background_tasks** - 后台任务表
- 异步任务跟踪
- 字段：id, task_id, task_type, status, user_id, params, result, error_message, progress, progress_message, created_at, started_at, completed_at, updated_at
- 唯一约束：task_id

**user_settings** - 用户设置表
- 用户个人偏好设置
- 字段：id, user_id, auto_generate_tags, created_at, updated_at
- 唯一约束：user_id

**system_settings** - 系统设置表
- 全局系统配置（单例模式）
- 字段：id, enable_explore, created_at, updated_at
- **初始数据**：默认记录，enable_explore = false

### 3. 索引 (共 60+ 个)

#### 3.1 基础索引
每个表的主键和外键都有对应的索引

#### 3.2 性能优化索引

**items 表**:
- `ix_items_content_type_year` - 按内容类型和年份查询
- `ix_items_content_type_release_year` - 按内容类型和发布年份查询
- `ix_items_source_external_id` - 按数据源和外部ID查询
- `ix_items_title_content_type` - 按标题和内容类型查询

**user_items 表**:
- `ix_user_items_user_id_status` - 按用户和状态查询
- `ix_user_items_user_id_item_id` - 按用户和内容查询
- `ix_user_items_user_id_created_at` - 按用户和创建时间排序
- `ix_user_items_user_id_updated_at` - 按用户和更新时间排序
- `ix_user_items_user_id_rating` - 按用户和评分查询

**tags 表**:
- `ix_tags_user_id_type` - 按用户和标签类型查询
- `ix_tags_user_id_name` - 按用户和标签名称查询

**user_item_tags 表**:
- `ix_user_item_tags_user_item_id_tag_id` - 正向关联查询
- `ix_user_item_tags_tag_id_user_item_id` - 反向关联查询

## 整合的历史迁移

### 从 backup_20251106_164603 目录 (13个脚本)
1. `20251024_0324_2fbf5706c5dc_initial_schema.py` - 初始架构
2. `20251031_0344_77aff2c8e975_add_external_id_and_source_to_items.py` - items 表添加外部数据源字段
3. `20251031_0346_8d3e0e4f1f07_update_user_item_fields.py` - 更新 user_items 字段
4. `20251103_0256_aa1ef49d8a36_add_user_item_tags_and_update_tags.py` - 添加 user_item_tags 表
5. `20251104_0235_fa5f55d0067b_add_llm_config_table.py` - 添加 LLM 配置表
6. `20251104_0444_ae7caf68cf4b_merge_admin_users_into_users_add_role.py` - 合并管理员表
7. `20251104_0454_1180bba91402_add_chinese_comments_to_all_tables.py` - 添加中文注释
8. `20251104_0455_42196f5525fe_simplify_user_roles_to_user_and_admin.py` - 简化角色
9. `20251105_0100_add_user_settings_table.py` - 添加用户设置表
10. `20251105_0200_add_system_settings_table.py` - 添加系统设置表
11. `20251105_145619_add_training_config.py` - 添加训练配置
12. `20251105_165140_add_conversation_tables.py` - 添加对话表
13. `20251106_0300_add_allow_user_ai_tag_settings.py` - 添加 AI 标签设置

### 从 backup_20251114_consolidated 目录 (7个脚本)
1. `20251107_0445_935827bc807c_add_summary_table.py` - 添加摘要表
2. `20251107_1200_add_background_task_table.py` - 添加后台任务表
3. `20251108_1227_d002e93ff086_add_api_key_configs_table.py` - 添加 API 密钥配置表
4. `20251108_1431_1b61b8d13a1c_update_llm_config_encrypted_storage.py` - 更新 LLM 配置加密存储
5. `20251112_0800_add_last_login_at_to_users.py` - 添加最后登录时间
6. `20251112_1600_add_performance_indexes.py` - 添加性能索引
7. `20251114_1717_remove_collections_tables.py` - 删除 collections 表

### 当前目录的脚本 (2个)
1. `20251107_0000_consolidated_schema.py` - 第一次整合
2. `20251112_0000_performance_and_cleanup.py` - 性能优化和加密

**总计**: 22个历史迁移脚本已整合

## 已删除的表

以下表在历史迁移中被创建后又被删除，新脚本中不包含：

1. **admin_users** - 已合并到 users 表
2. **item_tags** - 已被 user_item_tags 替代
3. **collections** - 功能未使用，已删除
4. **collection_items** - 功能未使用，已删除

## 重要说明

### 1. 加密功能
新脚本**不包含**自动加密现有数据的功能。如果你有现有数据库：
- LLM 配置的 API 密钥需要手动加密
- API 密钥配置需要手动加密
- 或者在首次配置时直接使用加密存储

### 2. 数据迁移
此脚本适用于：
- ✅ 全新数据库初始化
- ⚠️ 现有数据库需要先备份，然后重新导入数据

### 3. 字段变更
- `items.type` 字段已弃用，使用 `items.content_type` 代替
- `items.cover_url` 字段已弃用，使用 `items.poster_url` 代替
- `user_items.is_favorite` 从 Integer 改为 Boolean

## 验证建议

在确认脚本无误后，建议进行以下验证：

1. **语法检查**: ✅ 已通过（无诊断错误）

2. **在测试环境运行**:
```bash
# 备份当前数据库
make backup-db

# 重置数据库（谨慎操作！）
docker-compose exec backend python scripts/reset_db.py

# 运行新的迁移脚本
make migrate
```

3. **验证表结构**:
```bash
# 进入数据库
make shell-db

# 查看所有表
\dt

# 查看表结构
\d users
\d items
\d user_items
# ... 等等
```

4. **验证索引**:
```sql
SELECT tablename, indexname 
FROM pg_indexes 
WHERE schemaname = 'public' 
ORDER BY tablename, indexname;
```

5. **验证初始数据**:
```sql
SELECT * FROM api_key_configs;
SELECT * FROM system_settings;
```

## 清理操作已完成 ✅

### 第一次清理（2025-11-16）

1. ✅ 已删除旧迁移文件：
   - `20251107_0000_consolidated_schema.py`
   - `20251112_0000_performance_and_cleanup.py`

2. ✅ 已保留备份目录（待后续清理）：
   - `backup_20251106_164603/`
   - `backup_20251114_consolidated/`

3. ✅ 已保留新的初始化脚本：
   - `20251116_0000_initial_schema.py`

4. ✅ 已更新 Makefile，添加 `reset-db` 命令

5. ✅ 已更新文档：`docs/Makefile使用指南.md`

### 第二次清理（2025-11-16）

1. ✅ 已创建数据库备份：`backups/yueying_*.sql`

2. ✅ 已删除所有历史迁移备份目录：
   - `backup_20251106_164603/` (13个历史迁移文件)
   - `backup_20251114_consolidated/` (7个历史迁移文件)

3. ✅ 验证迁移链完整性：
   - 迁移链：`base -> initial_001 -> db0f5c7317a4 (head)`
   - 当前版本：`db0f5c7317a4`
   - 状态：正常 ✓

4. ✅ 当前保留的迁移文件：
   - `20251116_0000_initial_schema.py` (revision: initial_001)
   - `20251116_0049_db0f5c7317a4_rename_llm_config_model_to_default_model.py` (revision: db0f5c7317a4, head)
   - `MIGRATION_CONSOLIDATION_REPORT.md` (本文档)

## 使用新的迁移脚本

### 方式 1：使用 reset-db 命令（推荐）

```bash
# 完整的数据库重置流程
make reset-db
```

这将自动执行：
1. 删除所有表和枚举类型
2. 运行新的初始化迁移
3. 加载种子数据

### 方式 2：手动执行

```bash
# 1. 备份当前数据库（可选）
make backup-db

# 2. 进入后端容器
make shell-backend

# 3. 执行重置脚本
python scripts/reset_db.py

# 4. 运行迁移
alembic upgrade head

# 5. 加载种子数据
python scripts/seed_data.py
```

## 后续维护建议

1. ✅ **备份目录清理**：已完成
   - 已删除 `backup_20251106_164603/`
   - 已删除 `backup_20251114_consolidated/`

2. **版本控制**：将清理后的迁移脚本提交到 Git：
   ```bash
   git add backend/alembic/versions/
   git commit -m "chore: 清理历史迁移备份目录"
   ```

3. **团队同步**：通知团队成员
   - 当前迁移链已简化为 2 个文件
   - 如需重置数据库，使用 `make reset-db`
   - 数据库备份位于 `backups/` 目录

## 回滚方案

如果清理后出现问题，可以使用以下方法回滚：

1. **恢复数据库备份**：
   ```bash
   make restore-db
   # 选择最新的备份文件：backups/yueying_*.sql
   ```

2. **从 Git 恢复备份目录**（如果已提交）：
   ```bash
   git checkout HEAD~1 -- backend/alembic/versions/backup_*
   ```

3. **重新运行迁移**：
   ```bash
   docker-compose exec backend alembic downgrade base
   docker-compose exec backend alembic upgrade head
   ```
