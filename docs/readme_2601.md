# 开发日志 - 2026年01月

## [2026-01-31 12:32:14] feat(ui): 新增 Apple 风格组件和管理后台功能增强

**Body**: 
新增 AppleSelect 和 AppleSwitch 组件，完善 Apple 风格设计系统；新增管理后台日志、RAG、系统设置相关 Hooks；优化主题初始化逻辑，支持系统偏好检测和持久化；新增 adminUIStore 管理后台 UI 状态。

**Files**:
- frontend/src/components/ui/AppleSelect.tsx
- frontend/src/components/ui/AppleSelect.example.tsx
- frontend/src/components/ui/AppleSwitch.tsx
- frontend/src/components/ui/AppleSwitch.example.tsx
- frontend/src/components/ui/animated-theme-toggler.tsx
- frontend/src/components/ui/index.ts
- frontend/src/hooks/useAdminLogs.ts
- frontend/src/hooks/useAdminRAG.ts
- frontend/src/hooks/useAdminSystemSettings.ts
- frontend/src/hooks/useThemeInitializer.ts
- frontend/src/stores/adminUIStore.ts
- frontend/src/stores/uiStore.ts
- frontend/src/types/log.ts
- .gitignore
- .kiro/hooks/*.kiro.hook
- .kiro/settings/mcp.json
- .kiro/specs/**/design.md, requirements.md, tasks.md
- .kiro/steering/*.md
- docker-compose.yml
- docs/api_reference.md
- frontend/package.json
- frontend/pnpm-lock.yaml
- frontend/src/app/admin/**/page.tsx
- frontend/src/components/admin/*.tsx
- frontend/src/components/features/admin/*.tsx
- frontend/src/components/features/search/*.tsx
- frontend/src/components/providers/*.tsx
- frontend/src/components/shared/ThemeRegistry.tsx

---
