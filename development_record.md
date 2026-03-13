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

## 2026-03-12

**数据存储迁移：localStorage → 本地文件**
- 新增 `vite-plugin-data.js`，通过 Vite dev server 中间件提供 `/api/data/:key` 的 GET/PUT 接口
- 数据以 JSON 文件保存在项目根目录 `data/` 文件夹中，可直接查看、编辑、备份
- `usePersistedState` 改为从文件 API 读写，localStorage 仅作快速加载缓存
- `.gitignore` 添加 `data/`

**项目功能增强**
- 项目表单新增开始日期（startDate），原 deadline 作为结束日期
- 里程碑改为结构化列表：独立添加/编辑/删除，可设截止日期，支持勾选完成，逾期红色高亮
- 日历视图集成项目日期范围：日期格内显示彩色项目标签，侧栏列出当天进行中的项目
- `App.jsx` 向 CalendarView 传入 projects

**Markdown 笔记编辑器**
- 新增 `MarkdownEditor.jsx`：全屏 Modal 编辑器，支持 Edit/Preview 模式切换
- 左侧大纲面板自动从 `#` 标题提取目录，点击可跳转
- Preview 使用 `marked` 渲染，新增 `markdown.css` 提供完整排版样式
- 项目卡片中 Notes 区域改为预览按钮，点击打开全屏编辑器
- 安装依赖：`marked`

**向后兼容**
- 旧数据中 milestones 为字符串时安全降级为空数组
- 缺少 startDate、notes 等新字段的旧项目正常显示

## 2026-03-13

**Markdown 编辑器增强**
- 修复 Preview 模式白屏：避免同时传入 `dangerouslySetInnerHTML` 与 children 导致 React 运行时异常
- `MarkdownEditor.jsx` 升级为 `Write / Live / Preview` 三模式，默认进入实时预览（Live）
- 新增 Markdown 工具栏与快捷键：支持粗体、斜体、行内代码、标题、引用、列表、checklist、链接、数学公式
- 粗体/斜体等行内格式支持 toggle：已包裹内容再次触发会自动取消标记
- Preview 中的 checklist 支持点击勾选，并反向更新原始 Markdown
- 集成 `katex`，支持 `$...$` 与 `$$...$$` 数学公式渲染
- `markdown.css` 增加 task list、公式块、错误态等样式

**项目 Notes 自动结构化**
- 项目笔记顶部固定为 `# Project Name`，其下自动生成 `## Tasks` 与 `## Notes`
- `## Tasks` 区域由项目关联 todos 自动生成，完成状态会随任务更新同步变化
- 编辑器实际保存 `## Notes` 正文，自动头部区域由系统生成，避免手工维护
- 已存在的旧 notes 会自动迁移：去除旧标题/任务区，仅保留正文内容
- 项目重命名时自动同步关联 todo，避免任务与项目笔记断联

**日历视图修复**
- 修复选中日期后日历网格被侧栏挤压，导致周六不可见的问题
- 日期详情改为右侧固定抽屉，不再影响月历 7 列布局
- 重复点击同一天会关闭详情面板
- 切换月份时自动清空之前选中的日期
- 月视图补齐完整周，避免最后一行列数不足

**集合管理扩展：Projects / Learning / Traveling**
- 将原 `ProjectsView` 抽象为通用集合视图，新增 `Learning` 与 `Traveling` 两个模块
- 侧边栏新增 `Learning`、`Traveling` 入口，新增对应本地存储键 `labflow-learning`、`labflow-traveling`
- 每个条目新增独立颜色，创建时自动分配，也可在表单中从 color palette 手动选择
- 集合卡片排序调整为最新创建的条目优先显示在左上
- 进度条改为显示日期进度（startDate → deadline），不再使用任务完成率
- 进度条下方新增任务统计行，仅显示 `Total tasks` 与 `Finished tasks`

**Todo 关联模型升级**
- Todo 从仅支持 `project` 扩展为通用 `category + relatedItem` 关联模型
- Todos 视图新增类别与关联对象选择，可关联 `Projects`、`Learning`、`Traveling`
- 保留对旧 `todo.project` 数据的兼容读取，旧任务会自动归入 `projects` 类别
- `MiniTodoItem`、Calendar 等视图同步显示新的类别/关联标签

**Traveling 数据准备**
- `Traveling` 条目支持录入多个地点（locations）
- 卡片中展示地点标签，并为后续 interactive map 预留数据结构与占位区域

**文档同步规范**
- `README.md` 已同步更新到当前功能状态，补充 `Learning`、`Traveling`、Markdown 编辑器、通用集合模型与日历交互说明
- `README.md` 新增“后续改进计划”章节，明确 interactive map、Notes 编辑体验、任务联动和数据稳定性方向
- 后续功能修改需要同步更新 `development_record.md` 与 `README.md`

**Traveling Interactive Map**
- 新增 `travelMapUtils.js`，提供地点解析、常见城市坐标映射与经纬度投影逻辑
- 接入 `leaflet` 与 `react-leaflet`，将本地 SVG 地图升级为真实交互地图
- `Traveling` 视图顶部新增基于 OpenStreetMap 的 interactive map，总览所有旅行地点 marker
- 点击地图 marker 或 trip pill 可高亮并展开对应 traveling 条目
- 同一 trip 的多个地点会在地图上用折线连接
- 地点输入支持三种方式：常见城市名、`地点名 | 纬度, 经度`、在线搜索后自动插入精确坐标
- `Traveling` 表单新增在线地点搜索，使用网络地理编码服务补全精确位置
- 单个 traveling 卡片中新增地点解析状态展示，未识别地点会提示需要补坐标

**Traveling 结构优化**
- 地点数据从纯字符串升级为结构化对象（label / lat / lng / source / note），同时兼容旧字符串格式
- 新增 `TravelMap.jsx`，将地图模块独立拆分并使用 `React.lazy` 懒加载
- 地图相关依赖成功拆出独立构建产物，降低非 Traveling 路径的加载负担

**Traveling Bugfix**
- 修复添加地点后白屏：结构化地点对象在卡片地点标签处被直接渲染为 React child，触发运行时异常
- 地点标签渲染改为统一走地点解析逻辑，确保字符串与结构化对象都可正常显示

**集合排序调整**
- `Projects`、`Learning`、`Traveling` 改为统一按结束时间 `deadline` 倒序排序，结束越晚越靠前
- 无结束时间的条目排在后面；结束时间相同时，再按创建时间倒序打平
- 增加日期容错：若 `deadline < startDate`，排序、日期展示与进度计算会自动按有效区间修正

**日期进度提示**
- 在 `Projects`、`Learning`、`Traveling` 卡片的 `Date progress` 右侧新增 active 状态剩余天数提示
- 剩余天数 / 逾期天数使用红色显示，帮助快速识别时间压力

**Calendar 类别区分**
- 月历日期格中的条目标签新增类别短标识，显式区分 `Research / Learning / Travel`
- 日期详情侧栏中的相关条目改为按类别分组展示，降低跨类别混淆

**构建验证**
- 本次改动已通过 `npm run build`
- 地图模块已完成首轮代码分割，但主 bundle 仍偏大，后续可继续拆分 Markdown 编辑器或集合视图
