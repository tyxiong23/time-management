# LabFlow — 研究者时间管理工具

> research · plan · ship

LabFlow 是一款专为研究人员设计的本地时间管理应用，集日记、任务、周计划、日历和项目追踪于一体，所有数据保存在浏览器本地，无需账号，无需联网。

---

## 功能介绍

### 1. 今日视图（Today）
- **每日日记**：记录四个维度——今日完成、正在进行、阻碍因素、自由笔记
- **今日任务**：自动汇总截止日期为今天或今日创建的任务
- **逾期提醒**：红色高亮显示所有过期未完成任务
- **快速添加**：底部输入框按回车即可快速新建任务

### 2. 任务管理（Todos）
- 创建、编辑、删除任务
- 四级优先级：🔴 紧急 / 🟠 高 / 🔵 中 / ⚪ 低
- 设置截止日期并关联研究项目
- 按状态筛选：全部 / 进行中 / 已完成
- 自动排序：优先级从高到低，截止日期从早到晚

### 3. 周计划（Weekly Plan）
- 前后切换任意周
- **周目标**：列出本周想完成的事项
- **周复盘**：记录进展与改进点
- **周评分**：1–5 星评价本周质量
- 按天分组展示本周所有任务

### 4. 日历（Calendar）
- 月视图，支持前后翻月
- 每天用彩色小圆点标示任务（颜色对应优先级）和日记记录（紫色点）
- 点击某天，右侧显示当天任务列表和日记摘要

### 5. 研究项目（Projects）
- 创建研究项目并设置状态（进行中 / 暂停 / 已完成 / 规划中）和截止日期
- 进度条实时显示「已完成任务 / 总任务」比例
- 展开项目卡片可记录里程碑、查看关联任务、快速新建任务

---

## 如何运行

### 第一步：安装 Node.js（只需做一次）

打开终端，运行：
```bash
brew install node
```
安装完成后验证：
```bash
node --version   # 应该输出 v20.x.x 或更高
npm --version    # 应该输出 10.x.x 或更高
```

### 第二步：安装项目依赖（只需做一次）

在终端进入项目目录：
```bash
cd <base-dir>/time-management
npm install
```
这一步会下载 React 和 Vite，完成后目录里会多出一个 `node_modules` 文件夹。

### 第三步：启动应用

```bash
npm run dev
```
终端会输出类似：
```
  ➜  Local:   http://localhost:5173/
```
用浏览器打开 `http://localhost:5173` 即可使用。

按 `Ctrl+C` 停止服务。

---

> **之后每次使用**：只需进入目录运行 `npm run dev`，打开浏览器即可。

---

## 数据存储说明

所有数据通过浏览器的 **localStorage** 本地持久化，**不会上传到任何服务器**。

| 存储键 | 存储内容 |
|---|---|
| `labflow-todos` | 所有任务列表 |
| `labflow-daily` | 每日日记（以日期为键） |
| `labflow-weeklyplans` | 每周计划与复盘（以周 ID 为键） |
| `labflow-projects` | 研究项目列表 |

数据在同一浏览器、同一域名下跨页面刷新持久保存。
清空浏览器缓存或切换浏览器/设备会导致数据丢失，请定期手动备份（可通过浏览器开发者工具导出 localStorage 内容）。

---

## 项目结构

```
time-management/
├── labflow.jsx              # 入口文件（re-export src/App）
├── .gitignore
├── README.md
└── src/
    ├── App.jsx              # 根组件，管理全局状态
    ├── constants/
    │   ├── storage.js       # localStorage 键名
    │   ├── priorities.js    # 任务优先级配置
    │   └── projectStatus.js # 项目状态配置
    ├── utils/
    │   ├── dateUtils.js     # 日期工具函数
    │   └── idUtils.js       # ID 生成
    ├── hooks/
    │   └── usePersistedState.js  # 自动持久化的 state hook
    ├── components/
    │   ├── Sidebar.jsx      # 左侧导航栏
    │   ├── icons/
    │   │   └── Icons.jsx    # 内联 SVG 图标
    │   ├── common/
    │   │   ├── MiniTodoItem.jsx  # 小型任务条目（共用）
    │   │   └── QuickAddTodo.jsx  # 快速添加任务输入框
    │   └── views/
    │       ├── TodayView.jsx     # 今日视图
    │       ├── TodosView.jsx     # 任务管理视图
    │       ├── WeeklyView.jsx    # 周计划视图
    │       ├── CalendarView.jsx  # 日历视图
    │       └── ProjectsView.jsx  # 项目视图
    └── styles/
        └── styles.js        # 全局样式对象
```

---

## 开发日志

详细的更改记录见 [development_record.md](./development_record.md)。
