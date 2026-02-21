# 开发日志

## 2026-02-21

**代码重构**
- 将单文件 `labflow.jsx`（~1500 行）拆分为 `src/` 下的模块化结构
- 新增 `src/constants/`（storage、priorities、projectStatus）、`src/utils/`（dateUtils、idUtils）、`src/hooks/`（usePersistedState）、`src/styles/`（styles）
- 组件按职责拆分到 `src/components/`：Sidebar、icons/Icons、common/（MiniTodoItem、QuickAddTodo）、views/（TodayView、TodosView、WeeklyView、CalendarView、ProjectsView）
- 移除未使用的 `lodash` 依赖
- `labflow.jsx` 精简为入口 re-export

**项目配置**
- 新增 `package.json`、`vite.config.js`、`index.html`、`src/main.jsx`，使项目可通过 `npm run dev` 直接运行
- 新增 `.gitignore`

**文档**
- 新增中文 `README.md`（功能介绍、运行方法、数据存储说明、项目结构）
