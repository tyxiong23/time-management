# LabFlow — 研究者时间管理工具

> research · plan · ship

LabFlow 是一款面向研究和长期项目管理的本地时间管理应用，集日记、任务、周计划、日历、项目管理、学习管理和旅行记录于一体。所有数据保存在项目本地文件中，无需账号，无需联网。

---

## 功能介绍

### 1. 今日视图（Today）
- 记录四个维度：今日完成、正在进行、阻碍因素、自由笔记
- 自动汇总今天到期或今天创建的未完成任务
- 高亮显示所有逾期未完成任务
- 支持快速添加今日任务

### 2. 任务管理（Todos）
- 创建、编辑、删除任务
- 四级优先级：🔴 紧急 / 🟠 高 / 🔵 中 / ⚪ 低
- 设置截止日期
- 任务可关联 `Projects` / `Learning` / `Traveling`
- 按状态筛选：全部 / 进行中 / 已完成
- 自动按优先级和截止日期排序

### 3. 周计划（Weekly Plan）
- 前后切换任意周
- 记录周目标、周复盘和周评分
- 按天分组展示本周任务

### 4. 日历（Calendar）
- 月视图，支持前后翻月
- 每天显示任务优先级圆点、日记标记和条目时间范围标签
- 条目标签带类别短标识，可直接区分 `Research / Learning / Travel`
- 点击某天后，右侧抽屉显示当天任务、日记摘要和相关条目
- 右侧详情会按类别分组展示相关条目
- 再次点击同一天可关闭详情
- 切换月份时自动清空之前选中的日期

### 5. Projects
- 创建项目，设置状态、开始日期和结束日期
- 每个项目有独立颜色，默认自动分配，也可手动选择 palette
- Projects / Learning / Traveling 统一按结束时间倒序排序，结束越晚越靠前
- 若开始/结束日期填写反了，系统会按有效日期区间自动纠正显示与排序
- 进度条显示日期进度，不再按任务完成率计算
- Active 状态会在 Date progress 右侧以红色显示剩余天数 / 逾期天数
- 单独显示 `Total tasks` 和 `Finished tasks`
- 支持里程碑、关联任务、Markdown Notes

### 6. Learning
- 与 Projects 使用同一套结构
- 适合记录课程、论文阅读、技能训练、长期学习主题
- 支持状态、日期、颜色、里程碑、关联任务和 Notes

### 7. Traveling
- 与 Projects 使用同一套结构
- 支持一次旅行录入多个地点（locations）
- 地点内部已升级为结构化数据，兼容旧字符串格式
- 支持状态、日期、颜色、里程碑、关联任务和 Notes
- 内置基于 Leaflet + OpenStreetMap 的 interactive map
- 地点标签、列表和地图都兼容结构化地点对象与旧字符串数据
- 支持点击地图 marker 高亮并展开对应 trip
- 支持在线搜索精确地点并自动写入坐标
- 地点既可直接写常见城市名，也可使用 `地点名 | 纬度, 经度`
- 地图瓦片和在线地点搜索需要联网

### 8. Markdown Notes 编辑器
- 全屏编辑器，支持 `Write / Live / Preview`
- 支持大纲导航、工具栏和常用快捷键
- 支持 checklist 点击勾选并回写 Markdown
- 支持数学公式：`$...$` 与 `$$...$$`
- 行内格式支持 toggle，再按一次可取消
- 集合笔记自动维护头部结构：
  - `# Item Name`
  - `## Tasks`
  - `## Notes`

---

## 如何运行

### 第一步：安装 Node.js（只需做一次）

```bash
brew install node
```

验证：

```bash
node --version
npm --version
```

### 第二步：安装依赖（只需做一次）

```bash
cd <base-dir>/time-management
npm install
```

### 第三步：启动开发环境

```bash
npm run dev
```

浏览器打开终端输出的本地地址，通常是：

```text
http://localhost:5173/
```

停止服务：

```bash
Ctrl+C
```

---

## 数据存储说明

所有数据保存在项目根目录的 `data/` 文件夹中，浏览器 `localStorage` 仅作为快速加载缓存使用。

| 文件 | 存储内容 |
|---|---|
| `data/labflow-todos.json` | 所有任务 |
| `data/labflow-daily.json` | 每日日记 |
| `data/labflow-weeklyplans.json` | 每周计划与复盘 |
| `data/labflow-projects.json` | Projects 数据 |
| `data/labflow-learning.json` | Learning 数据 |
| `data/labflow-traveling.json` | Traveling 数据 |

这些文件都可以直接查看、编辑或备份。

---

## 项目结构

```text
time-management/
├── data/
├── README.md
├── development_record.md
├── index.html
├── labflow.jsx
├── vite-plugin-data.js
└── src/
    ├── App.jsx
    ├── components/
    │   ├── Sidebar.jsx
    │   ├── common/
    │   │   ├── MarkdownEditor.jsx
    │   │   ├── MiniTodoItem.jsx
    │   │   └── QuickAddTodo.jsx
    │   ├── icons/
    │   │   └── Icons.jsx
    │   └── views/
    │       ├── CalendarView.jsx
    │       ├── ProjectsView.jsx
    │       ├── TodayView.jsx
    │       ├── TodosView.jsx
    │       └── WeeklyView.jsx
    ├── constants/
    │   ├── collectionColors.js
    │   ├── collectionTypes.js
    │   ├── priorities.js
    │   ├── projectStatus.js
    │   └── storage.js
    ├── hooks/
    │   └── usePersistedState.js
    ├── styles/
    │   ├── markdown.css
    │   └── styles.js
    └── utils/
        ├── collectionUtils.js
        ├── dateUtils.js
        ├── idUtils.js
        └── noteUtils.js
```

---

## 后续改进计划

### 1. Traveling Map 继续增强
- 在现有 interactive map 上加入路线连接和按时间顺序展示
- 增加国家/地区聚合统计
- 增加地点搜索、筛选和地图缩放体验

### 2. Notes 编辑体验继续增强
- 支持点击预览内容定位回源码
- 增强块级操作和快捷键
- 评估更完整的所见即所得编辑能力

### 3. 任务与条目双向联动
- 在 Notes 的 `## Tasks` 中直接勾选时同步真实 todo 状态
- 在 Calendar 中点击条目标签可直接跳转到对应详情
- 在 Today / Weekly 中增加按类别聚合统计

### 4. 稳定性与数据能力
- 增加数据导入 / 导出
- 增加 schema 版本和迁移机制
- 为 notes 转换、todo 关联和日历交互补测试
- 继续拆分主 bundle，优先考虑 Markdown 编辑器和集合视图

---

## 开发日志

详细的变更记录见 [development_record.md](./development_record.md)。
