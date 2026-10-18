# 简历列表（右侧栏）设计

日期：2026-10-17
状态：用户已确认「原右侧栏内、常见问题上方」+「切换/新建/删除/重命名/复制」范围

## 背景

当前项目（Vue3 + Element Plus 前端 `web/`，Express 后端 `server/`）只有单份简历编辑页：
预览区右侧是一栏 360px 的「常见问题」卡片，无法查看/切换/新建多份简历。
后端数据以 `server/data/<resumeId>.json` 一简历一文件存放，已有 detail/create 接口，但没有列表管理能力。

## 目标

在预览区右侧（现有 360px 固定栏）顶部新增「我的简历」卡片，支持：

1. 展示全部简历：名称、求职意向、更新时间；
2. 切换简历（原地切换，不刷新页面，切换前 flush 未落盘保存）；
3. 新建简历（基于空白模板，创建后自动切换过去）；
4. 复制简历（生成副本并切换过去）；
5. 重命名简历（只改列表名称 `resumeName`，与简历内姓名 `basicInfo.name` 解耦；双击列表名称行内重命名）；
6. 删除简历（二次确认；删除当前简历后自动切到其它简历，无其它简历则自动新建一份）。

常见问题卡片保留在列表下方；右栏整体超高时可滚动。

## 架构与数据流

```
server/index.js  ←→  server/data/<resumeId>.json   （一简历一文件）
      ↑ HTTP（统一 {status,data} 包装）
web/src/api.js  （新增 5 个接口封装）
      ↑
web/src/App.vue （状态中枢：state.resumes / ctx.switchResume / ctx.saveAll ...）
      ↑ provide('ctx')
web/src/components/RightPanel.vue
      └── ResumeList.vue（展示 + 交互）
```

- `_template.json`：空白模板，启动时若缺失则由种子简历派生（清空个人信息与模块内容），列表接口跳过 `_` 前缀文件。
- 切换简历：先把待保存的 debounce 队列 flush（保证写入旧 `resumeId`），再替换 `resumeId`、重新拉取详情并 `history.replaceState` 更新 URL。
- 保存后（`markSaved`）防抖刷新列表，保证「更新时间」新鲜。

## 接口契约

统一响应：`{ status: 'success' | 'fail', data }`。

| 方法 | 路径 | 请求 | 响应 data |
| --- | --- | --- | --- |
| GET | `/api/resume/online/list` | — | `[{ resumeId, name, job, tplId, updateTime }]`（按更新时间倒序） |
| POST | `/api/resume/online/create` | `{ tplId? }` | `{ resumeId }` |
| POST | `/api/resume/online/copy` | `{ resumeId }` | `{ resumeId }` |
| POST | `/api/resume/online/rename` | `{ resumeId, name }` | `{}` |
| POST | `/api/resume/online/delete` | `{ resumeId }` | `{}` |

- `name` = 简历列表名称 `resumeName`（独立字段；旧数据首次启动时按当时姓名迁移固化一次），空则「未命名简历」；
- `job` = 求职意向模块 `data.job`；
- `updateTime` = 数据文件 mtime（毫秒时间戳）；
- 重命名只写 `resumeName`，限制 1–49 字符，不改简历姓名。

## 前端 ctx 契约（App.vue provide）

| 成员 | 说明 |
| --- | --- |
| `ctx.state.resumes` | 列表数据 |
| `ctx.state.resumeListLoading` | 列表加载中 |
| `ctx.resumeId` | 当前简历 id（reactive 解包后为字符串） |
| `ctx.switchResume(id)` | 切换简历 |
| `ctx.createResume()` | 新建并切换 |
| `ctx.copyResume(id)` | 复制并切换 |
| `ctx.renameResume(id, name)` | 重命名 |
| `ctx.deleteResume(id)` | 删除 |
| `ctx.refreshResumeList()` | 重新拉列表 |
| `ctx.saveAll()` | flush 所有待保存请求 |

## 改动文件

- `server/index.js`：新增 list/create/copy/rename/delete，空白模板派生
- `web/src/api.js`：5 个接口封装
- `web/src/utils.js`：`formatDateTime`，`debounce().pending()`
- `web/src/App.vue`：resumeId 改为 ref、列表状态、切换/新建/复制/重命名/删除编排、切换前 flush、右栏滚动样式
- `web/src/components/ResumeList.vue`（新增）：列表卡片
- `web/src/components/RightPanel.vue`：列表卡片置于常见问题上方
- `server/data/_template.json`：空白模板（运行时生成/提交）

## 验收

1. 后端接口用 PowerShell 冒烟：list/create/copy/rename/delete 全部成功，数据文件正确增删，现有 detail/update 接口不受影响；
2. 前端 `pnpm build` 通过；
3. 浏览器端到端：默认进入最近一份简历；新建→自动切到新简历；切换后预览/编辑区内容随之变化；改名后列表与预览同步；复制生成副本；删除当前简历后自动切换，删空后自动新建；编辑后切换再切回内容已保存。
