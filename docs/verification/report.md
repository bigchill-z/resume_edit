# 简历列表功能验收报告

日期：2026-10-17
环境：Windows，Node v24.13.1，Vite dev 5173，Express 3001，Edge Headless（puppeteer-core，来自 `server/node_modules`）
验收方式：真实浏览器端到端（`puppeteer-core` + 本机 Edge 无头），脚本放在 `.tabbit-scripts/`：
`e2e-resume-list.js`（主流程）、`e2e-resume-list-2.js`（补充流程）、`e2e-readonly-check.js`（只读回归）。

## 结论

主流程 36 项断言通过 35 项（1 项为脚本准备步骤计数错误，见「备注」），补充/只读回归全部关键项通过；
`pnpm build`、`node --check server/index.js`、`node --check web/src/utils.js` 均通过。

## 覆盖矩阵

| # | 场景 | 结果 |
| --- | --- | --- |
| 1 | 右栏「我的简历」卡片、新建按钮出现，位于预览纸张右侧（360px 栏） | PASS |
| 2 | 常见问题卡片保留在列表下方 | PASS |
| 3 | 默认打开最近更新的简历，当前项高亮，预览/编辑区/URL resumeId 一致 | PASS |
| 4 | 列表项展示名称、求职意向、更新时间（YYYY-MM-DD HH:mm） | PASS |
| 5 | 新建 → 列表 +1、自动切到新简历、URL 更新、数据文件落盘 | PASS |
| 6 | 编辑姓名自动保存 → 预览实时更新、列表名称/更新时间静默刷新、后端已写入 | PASS |
| 7 | 切换简历 → 预览与底部编辑区内容随之变化、URL 同步 | PASS |
| 8 | 切走再切回 → 之前编辑内容已保存（切换前 flush 生效） | PASS |
| 9 | 重命名 → 弹窗带出原名、列表与预览同步、后端写入 | PASS |
| 10 | 复制 → 列表 +1、自动切到副本、名称带「副本」、独立新 id | PASS |
| 11 | 删除当前简历 → 二次确认 → 列表 -1、自动切到其它简历、文件删除 | PASS |
| 12 | 删除非当前简历 → 当前简历不变、目标文件删除 | PASS |
| 13 | 列表为空时刷新 → 自动新建一份空白简历并落盘 | PASS |
| 14 | 带 `?resumeId=` 刷新直达指定简历 | PASS |
| 15 | 右栏内容超出视口时可滚动（`.edit_fixed` max-height + overflow） | PASS |
| 16 | 浏览器控制台无 JS 报错（仅沿用既有的 `/favicon.ico` 404） | PASS |
| 17 | 生产构建 `pnpm build` | PASS |

截图：`01-initial.png`（初始）、`02-created.png`（新建）、`03-renamed-and-copied.png`（重命名+复制）、
`04-final.png`（最终整页）、`05-final-sidebar.png`（右栏特写）。

## 备注

1. **脚本缺陷导致的数据事故（已处理）**：主流程脚本「删除非当前简历」一步误将种子简历
   `2610170I3NIWACD9VC.json` 当作目标删除，随后已用 `git checkout -- server/data/2610170I3NIWACD9VC.json`
   从提交版本恢复。该文件在本次任务开始前本就带有约 1KB 未提交改动（手机号/邮箱/部分导入文本），
   这部分工作区改动未进入 git，无法恢复；当前内容为 git HEAD 版本 + 用户后续在界面里改的名称。
   后续测试改为「按名称定位测试简历」并在 `finally` 中按 SHA256 校验还原数据。
2. Tabbit 浏览器运行时无法创建页面（`Target.createTarget` 不能派发），改用项目已有
   puppeteer-core + 本机 Edge 完成端到端验收。
3. `/favicon.ico` 404 为项目既有问题，与本次功能无关；构建的 chunk >500kB 警告也是既有问题。
4. 空白模板新建的简历预览会显示全部 12 个空模块标题（沿用模板结构 `visible:true`）；
   如需「新建即隐藏空模块」可再调整模板派生策略。（已在「新建简历默认模板」变更中解决，见下）

## 新建简历默认模板（2026-10-17 追加）

新建简历改为默认填充「校招行政专员简历模板」，模板固定写在 `server/defaultTemplate.js`，
原 `_template.json` 与种子派生逻辑已删除；模板中无内容的 6 个模块默认隐藏。

验收脚本：`.tabbit-scripts/verify-default-template.js`（API 新建 + UI 新建各一份，完成后删除并校验数据还原）。

| # | 场景 | 结果 |
| --- | --- | --- |
| 1 | 新建简历默认姓名「张明」，基本信息行（2002-05 / 女 / 应届生 / 手机 / 邮箱） | PASS |
| 2 | 求职意向渲染「行政专员 \| 北京」 | PASS |
| 3 | 有内容模块全部展示：教育背景、实习经历、校园经历、技能特长、自我评价 | PASS |
| 4 | 无内容模块默认隐藏（不出现空标题）：报考信息、工作经历、项目经验、荣誉证书、兴趣爱好、自定义模块 | PASS |
| 5 | 教育背景（学校/专业/时间/GPA/主修课程/荣誉奖项） | PASS |
| 6 | 实习经历 2 条、校园经历 2 条、专业技能 2 类、自我评价 4 条 | PASS |
| 7 | UI「新建」按钮走同一模板，编辑区空模块标签为未启用（灰点） | PASS |
| 8 | 控制台无 JS 报错 | PASS |
| 9 | 测试简历已清理，用户原有 3 份简历 SHA256 未被改动 | PASS |

截图：`08-new-resume-template.png`。

## 桌面版 exe 打包（2026-10-17 追加）

用 Electron 把前端 + Express 打包成 Windows 便携 exe（详见 `docs/desktop-packaging.md`）。
产物：`desktop/release/ResumeEditor-1.0.0.exe`（约 76 MB）。
验收脚本：`.tabbit-scripts/verify-desktop-app.js`（启动 win-unpacked 版与便携版、通过 CDP 检查界面与接口、PDF 导出、清理进程）。

| # | 场景 | 结果 |
| --- | --- | --- |
| 1 | 便携 exe 存在、可启动并解包运行 | PASS |
| 2 | 窗口加载内嵌 Express 页面（随机本机端口，仅监听 127.0.0.1） | PASS |
| 3 | 首次启动自动创建默认模板简历（张明），列表/新建按钮正常 | PASS |
| 4 | 简历数据写入 `%APPDATA%\ResumeEditor\data`，uploads/files 目录创建 | PASS |
| 5 | 打包版内 PDF 导出可用（puppeteer-core + 本机 Edge，生成约 195KB PDF） | PASS |
| 6 | 应用控制台无 JS 报错，窗口保持运行 | PASS |
| 7 | 便携版与解包版共用 AppData 数据 | PASS |

截图：`09-desktop-app.png`（Electron 窗口内应用）、`10-desktop-portable.png`（便携版窗口）、
`11-exe-icon.png`（嵌入的 exe 图标）。

备注：exe 未做代码签名，首次运行可能出现 SmartScreen「未知发布者」提示；
测试期间创建的 `%APPDATA%\ResumeEditor` 已清理，用户首次启动即为全新状态；
在带 `ELECTRON_RUN_AS_NODE=1` 的终端里启动 exe 会进入 Node 模式，双击启动不受影响（文档已说明）。

## 基本信息预览渲染修复（2026-10-17 追加）

问题：编辑区填写「婚姻状况、身高/体重、民族、政治面貌」后，简历预览区不显示这些字段。
原因：`web/src/components/ResumePreview.vue` 的 `personItems` 只拼接了出生年月/性别/籍贯/工作年限。
修复：补充婚姻状况（1→未婚、2→已婚）、政治面貌、民族、身高（cm）、体重（kg）渲染；
身高/体重输入已带单位时不再重复拼接；信息行顺序为
出生年月 / 性别 / 籍贯 / 婚姻状况 / 政治面貌 / 民族 / 身高 / 体重 / 工作年限。
导出 PDF/图片复用同一份 DOM，因此导出内容同步生效。

验收脚本：`.tabbit-scripts/verify-basic-info-preview.js`、`.tabbit-scripts/verify-desktop-basic-info.js`。

| # | 场景 | 结果 |
| --- | --- | --- |
| 1 | 预览渲染婚姻状况「未婚」 | PASS |
| 2 | 预览渲染政治面貌「中共党员」 | PASS |
| 3 | 预览渲染民族「汉族」 | PASS |
| 4 | 预览渲染身高「170cm」、体重「60kg」 | PASS |
| 5 | 原有出生年月/性别/籍贯/工作年限不受影响，顺序自然 | PASS |
| 6 | 编辑区修改民族/身高后预览实时联动 | PASS |
| 7 | 体重输入「65kg」不重复拼接为「65kgkg」 | PASS |
| 8 | 控制台无 JS 报错，测试简历已清理 | PASS |
| 9 | 重新打包 exe 后，打包版预览同样渲染政治面貌等字段 | PASS |

截图：`12-basic-info-preview.png`、`13-desktop-basic-info.png`。

## 导入功能删除（2026-10-17 追加）

按需求移除「导入简历」功能，涉及前端入口、事件链路、接口封装与后端解析逻辑：

- 前端：顶栏「导入」按钮、隐藏的文件选择框、`import-file` 事件、App.vue 的 `onImportFile/mergeImportedModule`、api.js 的 `importResume`、顶栏 `.import_action` 样式
- 后端：`POST /api/resume/import` 路由、`importUpload`、`parseResumeText` 解析函数，以及 `mammoth`、`pdf-parse` 依赖（server 与 desktop 的 package.json 同步移除，桌面版重新安装依赖）
- 保留：照片上传（`/api/photo/use`）、下载/导出、简历列表等其它功能

验收脚本：`.tabbit-scripts/verify-import-removed.js`、`.tabbit-scripts/verify-desktop-import-removed.js`。

| # | 场景 | 结果 |
| --- | --- | --- |
| 1 | 顶栏不再显示「导入」按钮，仅保留「下载」 | PASS |
| 2 | 页面中不再出现「导入」文字 | PASS |
| 3 | 不再有接受 doc/docx/pdf/txt 的文件选择框（仅保留照片 image/*） | PASS |
| 4 | 后端 GET/POST `/api/resume/import` 均返回 404 | PASS |
| 5 | 简历列表/详情接口、照片上传路由不受影响 | PASS |
| 6 | 控制台无 JS 报错 | PASS |
| 7 | 重新打包后，便携版 exe 同样无导入入口、接口 404 | PASS |

重新打包后的 exe 体积由 80.0 MB 降至 77.8 MB（移除解析依赖）。
截图：`14-import-removed.png`、`15-desktop-import-removed.png`。

## 软件风格切换（2026-10-17 追加）

顶栏右上角新增风格下拉，支持两种界面风格，选择后立即生效并写入 `localStorage`（刷新/重开 exe 后保留）：

- **经典深色**（原有）：深色背景 + 青绿主色
- **清爽 SaaS**（新增）：浅灰背景（#eef1f6）+ 白色卡片 + 深蓝主按钮（#1d4ed8）+ 灰色次按钮 + 红色仅用于删除，整体清爽专业

实现要点：

- 主题通过 `<html data-ui-theme="…">` + CSS 覆盖层实现（`web/src/uiTheme.js` 负责读取/持久化），Element Plus 主色变量同步切换；
- 只影响编辑器外观（顶栏、右栏卡片、编辑面板、按钮、A4 分页线、滚动条等），**简历纸张 `#resume_pc` 与导出 PDF/图片不受影响**；
- 顺带清理：按需求彻底移除右下「下载/导出简历」大按钮（模板元素 + 两套主题的遗留样式），并同步更新常见问题里「底部大按钮」「绿色圆点」等过时文案。

验收脚本：`.tabbit-scripts/verify-theme-switch.js`、`.tabbit-scripts/verify-desktop-theme.js`。

| # | 场景 | 结果 |
| --- | --- | --- |
| 1 | 默认「经典深色」，深色背景 + 青绿主色 | PASS |
| 2 | 下拉切换到「清爽 SaaS」：浅灰背景、白色卡片、深蓝主色 | PASS |
| 3 | 顶栏下载主按钮、FAQ/标签激活色、A4 分页线、按钮/输入框配色切换正确 | PASS |
| 4 | 次按钮灰色、删除图标 hover 红色（红色仅用于删除） | PASS |
| 5 | 简历纸张内容与导出样式不受主题影响 | PASS |
| 6 | 刷新后保持所选风格，可切回经典深色 | PASS |
| 7 | 打包版 exe 内切换、持久化均正常，无右下大按钮 | PASS |
| 8 | 控制台无 JS 报错 | PASS |

截图：`16-theme-classic.png`、`17-theme-saas.png`、`18-theme-saas-edit.png`、
`19-theme-saas-dialog.png`、`21-theme-saas-dropdown.png`、`22-theme-classic-dropdown.png`、`23-desktop-theme-saas.png`。

## 简历列表名称解耦 + 双击重命名（2026-10-17 追加）

需求：①「我的简历」列表名称不要与简历内的姓名绑定；②移除列表项的「重命名」编辑按钮，改为双击名称行内重命名。

实现：

- 简历数据新增独立字段 `resumeName`（列表名称），与简历内容里的 `basicInfo.name` 完全解耦：
  - 列表接口 `name` 取 `resumeName`；
  - `create` 默认 `「{模板姓名}的简历」`（如「张明的简历」）；
  - `copy` 只给 `resumeName` 追加「 副本」，不改简历姓名；
  - `rename` 只写 `resumeName`；
  - 旧数据启动时一次性迁移：按当时姓名固化 `resumeName`，之后互不影响。
- 列表项移除「重命名」图标（现仅保留复制/删除），双击名称切换为行内 `el-input`：Enter/失焦提交、Esc 取消；
  单击切换增加 220ms 延迟以区分单击与双击（双击改名不会触发切换）。

验收脚本：`.tabbit-scripts/verify-resume-name-decoupled.js`、`.tabbit-scripts/verify-desktop-resume-name.js`。

| # | 场景 | 结果 |
| --- | --- | --- |
| 1 | 新建简历列表名为「张明的简历」，简历姓名仍为「张明」 | PASS |
| 2 | 修改简历姓名后列表名称不变（解耦） | PASS |
| 3 | 重命名列表名称生效且不改简历姓名 | PASS |
| 4 | 复制时仅列表名称追加「 副本」，简历姓名保持原样 | PASS |
| 5 | 列表项不再有「重命名」按钮，仅复制/删除 | PASS |
| 6 | 双击名称行内编辑：Enter 提交、Esc 取消、失焦提交 | PASS |
| 7 | 修改简历姓名后预览更新、列表名称保持不变 | PASS |
| 8 | 旧简历启动迁移后显示原姓名作为列表名，且后续不再联动 | PASS |
| 9 | 重新打包 exe 后行为一致 | PASS |

截图：`24-resume-name-decoupled.png`、`25-desktop-resume-name.png`。

## 教育背景补充学历字段（2026-10-17 追加）

需求：教育背景编辑区补「学历」填写项；预览中「学校 - 专业 - 学历」用同样的分隔方式且三部分都加粗。

实现：

- 编辑区：教育背景条目新增「学历」下拉（可输入自定义值，选项：博士/硕士/本科/大专/中专/高中），排在专业之后、在职时间之前，写入 `jiaoyu.data[i].xueli` 并自动保存；
- 预览：教育背景条目标题改为「学校 - 专业 - 学历」，三部分同处 `.r-item-name`（bold），不再对专业/学历使用普通字重；其它模块（实习/校园等）标题样式保持不变；
- 默认模板同步：教育条目保留 `xueli: "本科"`，富文本里旧的重复段落「学历：本科」已删除；
- 旧数据迁移：启动时自动删除教育背景富文本里与 `xueli` 完全重复的 `<p><strong>学历：</strong>X</p>` 段落，避免旧简历出现重复学历。

验收脚本：`.tabbit-scripts/verify-education-xueli.js`、`.tabbit-scripts/verify-desktop-education-xueli.js`。

| # | 场景 | 结果 |
| --- | --- | --- |
| 1 | 默认模板教育条目含 `xueli: 本科`，富文本不再重复「学历：」行 | PASS |
| 2 | 预览标题为「北京XX大学 - 行政管理 - 本科」且整体加粗（700） | PASS |
| 3 | 编辑面板教育背景字段顺序：学校名称 → 专业 → 学历 → 在职时间 | PASS |
| 4 | 学历下拉显示当前值「本科」 | PASS |
| 5 | 改为「硕士」后预览实时更新且仍加粗，并自动保存到后端 | PASS |
| 6 | 其它模块标题样式（名称加粗 + 子项普通字重）不受影响 | PASS |
| 7 | 旧简历富文本中重复的「学历：X」段落被启动迁移清理 | PASS |
| 8 | 打包版 exe 同样显示学历字段与加粗标题 | PASS |

截图：`26-education-xueli.png`、`27-education-xueli-edit.png`、`28-desktop-education-xueli.png`。

## 导出 / 日期分隔符 / 日期行加粗（2026-10-17 追加）

1. **导出失败修复**
   - 前端下载改为不带 `target="_blank"` 的 `<a download>`，避免被浏览器/Electron 当成新窗口拦截；成功时提示「导出成功，已开始下载」，失败时带上具体原因；
   - Electron 端不再在 `will-download` 回调里同步弹「另存为」（会阻塞下载导致失败），改为直接保存到系统「下载」文件夹并自动处理重名（`文件名 (1).pdf`）。
2. **只有一个日期时不渲染分隔符**：`timeText(item)` 统一处理——只填开始→只显示开始；只填结束→只显示结束；两个都有→`开始 - 结束`；勾选至今→`开始 - 至今`。
3. **日期行除日期外全部加粗**：条目标题（教育背景「学校 - 专业 - 学历」、其它模块「名称 - 职位/角色」）全部放在 `.r-item-name`（bold）内内联渲染，日期 `.r-time` 保持普通字重（400）。
   （本节替代上一节表格第 6 条「子项普通字重」的旧行为。）

验收脚本：`.tabbit-scripts/verify-export-dates-bold.js`、`.tabbit-scripts/verify-desktop-export.js`。

| # | 场景 | 结果 |
| --- | --- | --- |
| 1 | 只填开始日期：显示 `2023-07`，无分隔符 | PASS |
| 2 | 只填结束日期：显示 `2023-06`，无分隔符 | PASS |
| 3 | 两个日期都填：`2024-01 - 2024-12` | PASS |
| 4 | 勾选至今：`2025-01 - 至今` | PASS |
| 5 | 教育/实习等条目标题整体加粗（700），日期普通字重（400） | PASS |
| 6 | 开发环境导出成功：后端生成文件 + 浏览器完成下载 + 成功提示 | PASS |
| 7 | 打包版 exe 导出成功：文件保存到「下载」文件夹（约 196KB） | PASS |

## 自动保存与运行环境排查（2026-10-17 追加）

**自动保存本身经实测正常**（开发环境与打包版均验证：修改姓名/模块 → 请求成功 → 数据文件落盘 → 刷新后仍存在）。
但排查中发现两个由「验收脚本」引入的问题，会让应用*看起来*像自动保存失效：

1. 打包版验收脚本会删除 `%APPDATA%\ResumeEditor`（打包版数据目录）并 `taskkill /IM ResumeEditor.exe`，
   如果此时用户正开着打包版，数据会被删、进程会被杀 → 表现为「保存失败 / 数据消失」。
2. 脚本使用固定调试端口 `9230` 启动测试用 Electron，而 **9230 是 DeepSeek Harness 自己的 inspector 端口**
   （`/json/version` 返回 `dsh-experimental-inspector/0`，页面为 `dsh://host`）。脚本误把它当成测试应用，
   清理阶段又按端口占用 PID 执行 `taskkill /T /F`，**直接杀掉了 Harness 主进程**，导致会话两次崩溃重启。

修复：

- 测试脚本改用 `RESUME_E2E_USER_DATA` 指向临时目录（桌面版 `main.js` 支持该环境变量），不再动用户数据；
- 调试端口改为动态挑选空闲端口，并校验端点确实属于测试应用（拒绝 `dsh://`），只结束自己 spawn 的进程且先核对进程名；
- 服务端 `saveResume` / 导出写文件前自动重建 data/files 目录，目录被删也能恢复写入；
- 前端在 `visibilitychange/pagehide/beforeunload` 时 flush 未落盘的自动保存，减少关闭前丢改动的概率。

验证：`.tabbit-scripts/verify-save-robustness.js`（6/6：删 data/files 目录后新建/保存/导出自动重建并成功）、
`.tabbit-scripts/verify-desktop-export.js`（7/7：打包版导出成功 + 自动保存落盘，隔离数据目录、未影响用户数据）。

## 新建/切换简历闪屏优化（2026-10-18 追加）

问题：每次新建简历整个编辑器会「闪一下」。

原因：`switchResume()` 先把 `state.resume = null`，模板顶层的 `v-if="state.resume"` 立即为 false
→ 整个编辑器（顶栏/预览/右栏/底部面板）被卸载，显示全屏 loading，再重新挂载 → 明显闪屏。

优化：

- `switchResume()` 改为「先请求新简历详情，成功后一次性替换 `state.resume` 并更新 `resumeId`/URL」，
  失败则保留原简历并提示，不再把 `state.resume` 置空；
- 切换/新建过程中在纸张右上角显示轻量「切换中…」提示，纸张做 0.15s 淡出（`is-switching`），
  不再整页卸载；经典深色与 SaaS 两种风格都有对应样式；
- 切换期间禁用列表的新建/切换/复制/删除/双击重命名与导出操作，避免拿到新旧混合的数据；
- 初次打开页面仍保留原有的加载占位（此时确实还没有简历数据）。

验收脚本：`.tabbit-scripts/verify-no-flicker.js`（用 `requestAnimationFrame` 逐帧记录编辑器和纸张是否被卸载）。

| # | 场景 | 结果 |
| --- | --- | --- |
| 1 | 新建简历：104 帧中编辑器/纸张始终存在（0 帧缺失），无整页闪烁 | PASS |
| 2 | 新建期间显示「切换中」轻提示 | PASS |
| 3 | 新建后列表 +1、自动切到新简历、URL 同步 | PASS |
| 4 | 切换简历：108 帧中编辑器/纸张始终存在 | PASS |
| 5 | 切换后预览正确显示目标简历 | PASS |
| 6 | 新建耗时 0.7s / 切换耗时 0.25s（本地环境） | PASS |
| 7 | 控制台无 JS 报错，测试简历已清理 | PASS |

截图：`31-no-flicker-switch.png`。

## 更换品牌 Logo 与应用图标（2026-10-18 追加）

需求：用新提供的蓝色「人像 + 文档」图标替换顶栏原来的「青绿 logo + 简历文字」，打包 exe 的图标也使用该图。

实现：

- 新增 `web/public/logo.png`（用户提供的 200×200 PNG，透明圆角），顶栏 logo 改为 `<img src="/logo.png">`（44×44，保留悬停浮起效果与两种主题下的样式适配）；
- `web/index.html` 增加 `<link rel="icon" href="/logo.png">`，顺带消除原来的 favicon 404；
- `desktop/build/make-icon.py` 改为从 `web/public/logo.png` 生成多尺寸 `icon.ico`（16/32/48/64/128/256）与 `icon.png`，electron-builder 用它作为 exe 图标；
- `desktop/package.json` 的打包文件列表加入 `build/icon.ico`，打包版窗口图标不再加载失败。

验收脚本：`.tabbit-scripts/verify-logo.js`（开发环境 + 打包版，安全端口与端点校验）。

| # | 场景 | 结果 |
| --- | --- | --- |
| 1 | 顶栏 logo 使用新图片并成功加载（自然尺寸 200×200） | PASS |
| 2 | 顶栏 logo 显示尺寸 44×44 | PASS |
| 3 | 页面 favicon 指向新 logo，`/logo.png` 返回 200 | PASS |
| 4 | 打包版窗口内 logo 正常加载 | PASS |
| 5 | 打包版窗口图标不再报「Failed to load image」 | PASS |
| 6 | 从 exe 提取的图标为新 logo（多尺寸 ico） | PASS |

截图：`32-logo-dev.png`、`33-logo-desktop.png`、`34-exe-icon-new.png`。

## 默认风格改为「清爽 SaaS」（2026-10-18 追加）

- `web/src/uiTheme.js` 默认主题改为 `saas`，风格下拉顺序也调整为「清爽 SaaS」在前、「经典深色」在后；
- 存储 key 升级为 `resume_ui_theme_v2`：旧版自动写入的 `classic` 默认值不再生效（避免升级后仍是深色），
  旧版中明确选过 `saas` 的保留；用户手动切换的风格写入新 key 并持久化；
- 首屏在挂载前应用主题，无闪烁。

验收脚本：`.tabbit-scripts/verify-default-theme.js`、`.tabbit-scripts/verify-desktop-default-theme.js`。

| # | 场景 | 结果 |
| --- | --- | --- |
| 1 | 清空本地存储后首次打开默认「清爽 SaaS」（浅灰背景 + 深蓝主色） | PASS |
| 2 | 旧 key 遗留 `classic` 时仍默认 SaaS，旧 key 被清理 | PASS |
| 3 | 旧 key 显式选择过 `saas` 的保留 SaaS | PASS |
| 4 | 手动切换到经典深色立即生效，刷新后保持 | PASS |
| 5 | 再切回 SaaS 后刷新保持 | PASS |
| 6 | 打包版 exe 默认同样为 SaaS | PASS |

截图：`35-default-saas.png`、`36-desktop-default-saas.png`。

## 点击预览区打开对应编辑（2026-10-18 追加）

需求：点击简历预览区某个部分，自动打开该部分对应的编辑表单。

实现：

- `ResumePreview.vue`：基本信息区域绑定 `openEditor('__basic')`，求职意向行绑定 `openEditor('yixiang')`（`@click.stop`），
  每个可见模块绑定 `openEditor(m.moduleName)`；并给可点击区域加 `title="点击编辑：…"`；
- `App.vue`：新增 `state.editModule` / `state.editRequestTs` 与 `openModuleEditor()` 并经 `ctx` 提供给预览组件；
- `EditPanel.vue`：watch `editRequestTs` → 展开底部面板并把页签切到目标模块（`__basic` 对应基本信息），
  同时把编辑区滚动回顶部；
- 样式：仅编辑器内生效的 hover 提示（浅色描边/背景，两种主题各自配色），导出内容不受影响。

**同时发现并修复的文件回滚**：本次修改前检测到 `web/src/api.js`、`ResumePreview.vue`、`RightPanel.vue`、
`EditPanel.vue`、`resumeCss.js` 被还原成了 git 提交版本，会导致「我的简历」列表、学历字段、日期分隔符/加粗、
基本信息扩展字段渲染等此前功能丢失；已按此前验证过的内容全部恢复并回归验证。

| # | 场景 | 结果 |
| --- | --- | --- |
| 1 | 右栏「我的简历」列表、教育「学校 - 专业 - 学历」加粗、日期无多余分隔符、扩展信息渲染 | PASS |
| 2 | 点击教育背景 → 面板展开并切到「教育背景」，含学历字段 | PASS |
| 3 | 点击实习经历 / 技能特长 → 切到对应编辑页签 | PASS |
| 4 | 点击姓名区域 → 切到「基本信息」 | PASS |
| 5 | 点击求职意向 → 切到「求职意向」 | PASS |
| 6 | 面板收起后再次点击预览可重新打开 | PASS |
| 7 | 预览模块 cursor:pointer + 点击提示文案 | PASS |
| 8 | 打包版 exe 内点击教育背景同样打开对应编辑 | PASS |
| 9 | 导出/日期/加粗回归测试 13/13 通过 | PASS |
| 10 | 控制台无 JS 报错 | PASS |

截图：`37-click-to-edit.png`、`38-desktop-click-to-edit.png`。

## 新增三种间距调整（2026-10-18 追加）

需求：在「间距设置」中增加
① 模块标题与横线的间距；② 横线与下方内容的间距；③ 模块内多个子模块之间的间距。

实现：

- `setData` 新增三个字段：`titleGap`（默认 6）、`lineGap`（默认 10）、`itemGap`（默认 10）；
- `buildResumeCss` 把它们映射到 `.r-module-title { padding-bottom / margin-bottom }` 和 `.r-item { margin-bottom }`，
  预览与导出共用同一份 CSS，导出 PDF/图片同步生效；
- 顶栏「间距设置」面板新增 3 个滑块（含数值展示与重置按钮），范围分别为 0–20 / 0–30 / 0–40；
- 旧简历没有这些字段时，前端加载会自动补默认值（`normalizeSetData`），滑块与预览保持一致；
- 默认模板 `setData` 同步带上三个默认值；
- 同时修正间距面板定位：原 CSS 选择器写错（`.set_box .jianju_set` 应为 `.set_box.jianju_set`），
  新增设置后出现左侧被裁切的问题；现面板左对齐按钮、300px 宽，完整显示。

| # | 场景 | 结果 |
| --- | --- | --- |
| 1 | 新建简历默认含 titleGap=6 / lineGap=10 / itemGap=10 | PASS |
| 2 | 默认渲染：标题下 6px、横线下 10px、子模块间 10px，模块间距 mm 不受影响 | PASS |
| 3 | 间距面板含 6 个滑块（新增 3 项）且完整显示在视口内 | PASS |
| 4 | 修改为 12/20/24 后预览与共用 CSS 同步生效 | PASS |
| 5 | 面板数值与重置按钮同步更新 | PASS |
| 6 | 打包版 exe 面板同样包含 6 项且默认值正确 | PASS |
| 7 | 控制台无 JS 报错 | PASS |

截图：`39-spacing-settings.png`、`40-desktop-spacing.png`。

## 间距调整对分页提醒的影响（2026-10-18 追加）

结论：**分页提醒工作正常，没有出现错乱**；间距变化会改变简历高度，分页检测会按新高度自动重算页数与分页线（这是预期行为）。

实测（`.tabbit-scripts/verify-spacing-pagination.js` / `verify-spacing-pagination-threshold.js`）：

| # | 场景 | 结果 |
| --- | --- | --- |
| 1 | 分页线数量 = `ceil(简历高度 / 1123)`，位置 = `n*1123-9` | PASS |
| 2 | 拖动「子模块间距」滑块（无需刷新）：高度变化、页数重算、分页线位置正确、自动保存 | PASS |
| 3 | 三种间距拉到最大：1 页 → 2 页，页数与位置正确 | PASS |
| 4 | 间距缩到最小：2 页 → 1 页，页数与位置正确 | PASS |
| 5 | 刷新后分页提醒仍与内容高度一致 | PASS |
| 6 | 控制台无 JS 报错 | PASS |

顺带修复一个相关体验问题：「自动调整为1页」原先只压缩模块上下间距 `mm`，若新增间距调得很大可能压不回 1 页。
现在会在压缩 `mm` 后继续依次压缩 `lineGap → itemGap → titleGap`，直到回到 1 页。
验证：间距调大产生 2 页后点击「自动调整为1页」，成功回到 1 页，且新增间距被一并调小
（`.tabbit-scripts/verify-spacing-one-page.js`，5/5 PASS）。

## 间距面板改为 3 行 × 2 列并调整顺序（2026-10-18 追加）

- 布局由「6 行 1 列」改为「3 行 × 2 列」（面板宽 536，单列 50%，滑块 150px）；
- 顺序按要求排列：页面边距 → 行间距 → 模块上下间距 → 子模块间距 → 标题与横线间距 → 横线与内容间距，
  对应到 3 行 2 列为：

| 行 | 左列 | 右列 |
| --- | --- | --- |
| 第 1 行 | 页面边距 | 行间距 |
| 第 2 行 | 模块上下间距 | 子模块间距 |
| 第 3 行 | 标题与横线间距 | 横线与内容间距 |

验收脚本：`.tabbit-scripts/verify-spacing-layout.js`（15/15）。

| # | 场景 | 结果 |
| --- | --- | --- |
| 1 | 面板 6 个间距项，布局为 3 行 × 2 列，每行列宽一致 | PASS |
| 2 | 顺序为 页面边距 → 行间距 → 模块上下间距 → 子模块间距 → 标题与横线 → 横线与内容 | PASS |
| 3 | 逐行断言：第 1 行页面边距/行间距、第 2 行模块上下间距/子模块间距、第 3 行标题与横线/横线与内容 | PASS |
| 4 | 面板完整显示在视口内（left/right 均在屏内） | PASS |
| 5 | 修改后数值展示、预览样式应用、重置按钮均正常 | PASS |
| 6 | 控制台无 JS 报错 | PASS |

截图：`45-spacing-order.png`。

## 右侧栏改为随页面滚动（2026-10-18 追加）

需求：右侧栏（我的简历 + 常见问题）不要再有独立滚动条，改为随浏览器滚动条一起滚动。

实现：

- `.edit_right .edit_fixed` 由 `position: fixed`（固定定位 + `max-height/overflow-y` 独立滚动）改为 `position: static`，
  右栏回到正常文档流，高度随内容自然撑开；
- 移除右栏自定义滚动条样式（含 SaaS 主题下的 thumb 覆盖）；
- 保持右栏宽度 360、位于预览纸张右侧、顶部与纸张顶部对齐；页面本身（body）滚动条统一控制滚动。

验收脚本：`.tabbit-scripts/verify-right-column-scroll.js`（11/11）。

| # | 场景 | 结果 |
| --- | --- | --- |
| 1 | 右栏不再是 fixed 定位，overflow 为 visible（无独立滚动条） | PASS |
| 2 | 右栏位于纸张右侧（宽约 360），顶部与纸张对齐 | PASS |
| 3 | 页面可滚动且无横向滚动条 | PASS |
| 4 | 页面下滚 420px：右栏卡片 top 同步减少约 420px（随页面滚动） | PASS |
| 5 | 常见问题卡片与「我的简历」同步滚动 | PASS |
| 6 | 滚到页面底部时右栏已随页面滚出视口 | PASS |
| 7 | 控制台无 JS 报错 | PASS |

截图：`43-right-column-scroll-top.png`、`44-right-column-scroll-mid.png`。



## 左上角 logo 改为 36×36 并垂直居中（2026-10-18 追加）

- `.edit_header_main .logo`：宽高由 44×44 改为 36×36，圆角 9px；
- 顶栏高 70px，`top` 设为 `(70-36)/2 = 17px`，使 logo 中心与顶栏中心对齐；
- 位置保持左侧 8px，与「间距设置」按钮不重叠。

验收脚本：`.tabbit-scripts/verify-logo-size.js`（6/6）。

| # | 场景 | 结果 |
| --- | --- | --- |
| 1 | logo 显示尺寸 36×36（含图片） | PASS |
| 2 | logo 中心与顶栏中心一致（偏差 ≤ 0.5px） | PASS |
| 3 | 顶栏高度 70px 基准正确 | PASS |
| 4 | 不遮挡右侧「间距设置」按钮 | PASS |
| 5 | 图片正常加载、控制台无 JS 报错 | PASS |

截图：`46-logo-36.png`、`46-logo-36-header.png`。


## 新增「更换模板」功能（2026-10-18 追加）

需求：为简历添加更换模板功能，入口置于顶部，并新增「左侧深色栏」模板（参考给定 HTML 的样式）。

实现：

- 顶栏最左侧新增「更换模板」下拉入口（模板选择置于顶端），当前模板在菜单中标注「（当前）」；
- 新增 `web/src/templates.js`：模板列表 `classic`（经典单栏）/ `sidebar`（左侧深色栏），默认 `classic`；
- 模板选择保存在 `setData.tplKey`，自动保存；旧简历加载时自动补默认值；新建简历默认经典单栏；
- `ResumePreview.vue` 按模板渲染两套结构：
  - 侧栏模板：左侧 235px 深色栏（照片、个人信息、技能特长/进度条），右侧主内容（姓名、求职意向、模块标题带方形图标）；
  - 经典模板：保持原单栏结构不变；
- `resumeCss.js` 按模板分发 CSS（`buildResumeCss`），预览与导出共用同一份样式，导出 PDF/图片同步模板效果；
- 三种间距设置（页面边距/模块间距/子模块间距等）在两套模板下都生效；切换后重新测量分页；
- 两套模板都支持「点击预览区打开对应编辑」。

验收脚本：`.tabbit-scripts/verify-template-switch.js`（19/19）、`.tabbit-scripts/verify-desktop-template.js`（6/6），
经典模板导出回归 `.tabbit-scripts/verify-export-dates-bold.js`（13/13）。

| # | 场景 | 结果 |
| --- | --- | --- |
| 1 | 新建简历默认经典单栏；顶栏有「更换模板」入口 | PASS |
| 2 | 切到左侧深色栏：左栏深色 235px、两栏并排、右栏顶部姓名、左栏个人信息/技能区 | PASS |
| 3 | 右栏模块标题带图标，求职意向在右栏顶部 | PASS |
| 4 | 侧栏模板分页提醒仍按高度正确计算 | PASS |
| 5 | 模板选择自动保存到 `setData.tplKey`，可切回经典单栏 | PASS |
| 6 | 侧栏模板下点击模块仍可打开对应编辑 | PASS |
| 7 | 侧栏模板导出 PDF 成功（接口 200、返回 pdf 文件、提示成功） | PASS |
| 8 | 打包版 exe 内可切换模板并正确渲染 | PASS |
| 9 | 经典模板导出/日期/加粗回归 13/13 | PASS |

截图：`47-template-sidebar.png`、`48-template-sidebar-edit.png`、`49-desktop-template.png`。


## 新建简历默认内容替换为 DeepSeek 示例（2026-10-18 追加）

需求：把「DeepSeek（蓝色大肥鱼版）」示例内容作为新的简历模板内容（用户选择：替换新建简历默认内容）。

实现：

- `server/defaultTemplate.js` 重写默认内容：
  - 基本信息：姓名 DeepSeek（蓝色大肥鱼版）、身份 AI 助手、物种大肥鱼、现居地云端服务器集群、联系方式「在对话框里戳我一下」；
  - 求职意向：AI 助手 / 知识工作搭子 / 简历优化陪练，含意向城市/期望薪资/入职时间；
  - 教育背景：数据海洋大学 · 自然语言理解与人类意图识别 · 自修成才；
  - 工作经历 2 段、项目经验 3 段、技能特长 7 项熟练度数据、自我评价；
  - 实习/校园/荣誉/兴趣/自定义模块默认隐藏；
- 新增 `server/defaultAvatar.js`：把用户提供的头像压缩为 240×240 JPEG 后以 data URL 内嵌，
  预览与导出均自包含（导出 PDF 不依赖外部图片路径）；
- `desktop/build.js` 修复：原先只复制 `index.js`/`defaultTemplate.js`，新增的 `defaultAvatar.js` 不会进包，
  导致打包版服务启动失败；现改为复制 server 目录下所有顶层 .js 文件；
- 已有简历数据不受影响，仅新建简历使用新默认内容；头像在经典/侧栏两套模板下都显示。

验收脚本：`.tabbit-scripts/verify-default-content.js`（17/17）、`.tabbit-scripts/verify-desktop-default-content.js`（5/5）。

| # | 场景 | 结果 |
| --- | --- | --- |
| 1 | 新建简历默认姓名/头像（data URL）/基本信息字段正确 | PASS |
| 2 | 模块可见性、求职意向、教育背景、工作 2 段、项目 3 段、技能 7 项 | PASS |
| 3 | 列表名称自动为「DeepSeek（蓝色大肥鱼版）的简历」 | PASS |
| 4 | 经典模板预览头像/技能条/分页正常 | PASS |
| 5 | 侧栏模板预览头像/技能条/分页正常 | PASS |
| 6 | 新内容导出 PDF 成功（头像 data URL 内嵌） | PASS |
| 7 | 打包版新建简历同样为 DeepSeek 内容且头像正常 | PASS |
| 8 | 打包构建已包含 defaultAvatar.js | PASS |

截图：`50-default-template-classic.png`、`51-default-template-sidebar.png`、`52-desktop-default-content.png`。


## 修复：侧栏自我评价白字 + 自动调整为1页入口消失（2026-10-18 追加）

1. **左侧深色栏模板「自我评价」出现白色加粗文字**
   原因：侧栏样式里 `#resume_pc.tpl-sidebar .r-side-content b, strong { color:#fff }` 选择器范围过大，
   右侧主内容复用了 `.r-side-content` 类，导致「自我评价」等主内容的加粗文字也被刷成白色。
   修复：把白字规则限定在左栏内 `.r-side .r-side-content`，主内容保持深色文字。

2. **「自动调整为1页」入口消失**
   原因：`showSetOne` 原先只在「第二页内容很少」（高度 < A4 + 260px）时显示；新默认内容约 2 页
   （经典模板高 1503px），超过阈值后入口被隐藏。
   修复：改为**只要当前是 2 页就显示**该入口；并增强自动压缩策略——在压缩模块间距/三种细分间距之后，
   继续压缩行间距（1.7 → 1.3）直到回到 1 页，避免差十几像素仍压不回去。

验收脚本：`.tabbit-scripts/verify-sidebar-text-onepage.js`（9/9）、`.tabbit-scripts/verify-desktop-fixes.js`（5/5）。

| # | 场景 | 结果 |
| --- | --- | --- |
| 1 | 侧栏模板「自我评价」加粗文字为深色（#444），左栏技能区仍为白色 | PASS |
| 2 | 经典/侧栏两页时都显示「自动调整为1页」入口 | PASS |
| 3 | 点击后压回 1 页（高度 ≤ 1123），压缩结果自动保存 | PASS |
| 4 | 打包版同样通过以上修复验证 | PASS |

截图：`53-sidebar-text-color.png`、`54-one-page-after.png`、`55-desktop-fixes.png`。


## 默认内容改名并移除 DeepSeek 文本（2026-10-18 追加）

- 新建简历默认姓名改为「蓝色大肥鱼」；
- 默认内容中所有 DeepSeek 文本已移除：标题「蓝色大肥鱼」、工作经历名称「AI 助手」、
  邮箱改为 `blue-fish@data-ocean.ai`，默认数据 JSON 中已无 deepseek 字样；
- 头像与其余内容保持不变，列表名称自动为「蓝色大肥鱼的简历」。

验收脚本：`.tabbit-scripts/verify-default-renamed.js`（12/12）、打包版默认内容脚本（5/5）。

| # | 场景 | 结果 |
| --- | --- | --- |
| 1 | 默认姓名 = 蓝色大肥鱼，默认数据不含 DeepSeek（大小写不敏感） | PASS |
| 2 | 标题/邮箱/工作经历名称已同步修改 | PASS |
| 3 | 头像仍正常、列表名「蓝色大肥鱼的简历」 | PASS |
| 4 | 预览姓名正确、无 DeepSeek 文本、头像/分页正常 | PASS |
| 5 | 打包版新建简历同样为「蓝色大肥鱼」 | PASS |

截图：`56-default-renamed.png`。


## 新建简历时自动检查并压缩为 1 页（2026-10-18 追加）

需求：新建简历后，按当前模板检查是否超过 1 页；超过则自动调整为 1 页。

实现：

- `createResume()` 在切换到新简历、等待 Vue 渲染与字体就绪后重新测量高度；
- 若 `pageCount > 1`，自动调用 `setOnePage(true)`（静默模式）：
  压缩顺序为 模块上下间距 → 横线与内容间距 → 子模块间距 → 标题与横线间距 → 行间距（1.7→1.3）；
- 压缩成功提示「已新建简历，并已自动调整为1页」；仍超出时提示可手动精简；
- 自动压缩只修改新简历自身的间距数据，不影响其他简历；
- 压缩过程优化了等待间隔（120ms/90ms），实测新建并压到 1 页约 2.7 秒。

验收脚本：`.tabbit-scripts/verify-create-auto-onepage.js`（9/9），打包版默认内容脚本（5/5，含自动压到 1 页等待）。

| # | 场景 | 结果 |
| --- | --- | --- |
| 1 | 新建后自动变为 1 页（高度 ≤ 1123） | PASS |
| 2 | 提示「已新建简历，并已自动调整为1页」 | PASS |
| 3 | 压缩结果已保存（mm/间距/行间距下降）且使用默认经典模板 | PASS |
| 4 | 新建按钮未卡在 loading，新建耗时约 2.7s | PASS |
| 5 | 打包版新建简历同样自动压到 1 页 | PASS |

截图：`57-create-auto-one-page.png`。


## 新增第三套模板「简约标签」（2026-10-18 追加）

需求：参考给定 HTML（居中标题 + 基本信息表 + 带底色方块标签的模块标题）新增一套简历模板，主要关注样式。

实现：

- `templates.js` 新增 `label`（简约标签），顶栏「更换模板」自动出现第三项；
- `ResumePreview.vue` 新增模板结构：
  - 顶部居中标题「个人简历」+ 简介；
  - 基本信息以「标签：值」表格行展示（姓名/出生/性别/籍贯/婚姻/政治面貌/民族/身高/体重/工作年限/电话/邮箱），照片绝对定位在右侧；
  - 每个模块标题为深色底 + 白字方块标签（颜色跟随主题色）；
  - 求职意向以「职位：xxx」等行内项展示；
  - 教育/工作等条目为「时间 + 学校加粗 + 专业（学历）」行，下方富文本内容；
  - 技能特长为进度条 + 名称 + 「百分比 · 熟练度」文案；
- `resumeCss.js` 新增 `buildLabelCss`，预览与导出共用；间距设置在该模板下同样生效；
- 支持点击预览区打开对应编辑；模板选择保存到 `setData.tplKey`。

验收脚本：`.tabbit-scripts/verify-template-label.js`（15/15）、`.tabbit-scripts/verify-desktop-label.js`（5/5）。

| # | 场景 | 结果 |
| --- | --- | --- |
| 1 | 切换到简约标签模板，结构正确（标题/基本信息表/方块标签） | PASS |
| 2 | 模块标签底色 = 主题色，教育行含「专业（学历）」 | PASS |
| 3 | 工作 2 段/项目 3 段，技能 7 条进度条与熟练度文案 | PASS |
| 4 | 头像正常、分页提醒正确、模板选择已保存 | PASS |
| 5 | 导出 PDF 成功，可切回经典单栏互不影响 | PASS |
| 6 | 打包版可切换并正确渲染 | PASS |

截图：`58-template-label.png`、`59-desktop-label-template.png`。


## 技能掌握程度：去掉百分比 + 简约标签一行 3 个（2026-10-18 追加）

- 所有模板的技能掌握程度不再显示百分比：
  - 经典单栏：技能条右侧由 `95%` 改为熟练度文案（精通/熟练/良好/一般）；
  - 左侧深色栏：同上；
  - 简约标签：由 `95% · 精通` 改为 `精通`；
- 简约标签模板技能区改为**一行 3 个**（grid 宽度 `calc((100% - 44px)/3)`），7 项自动排成 3/3/1 三行；
- 技能条长度仍按数值渲染（数据不变），预览与导出共用同一套样式。

验收脚本：`.tabbit-scripts/verify-skill-degree.js`（10/10）、打包版简约标签脚本（7/7）。

| # | 场景 | 结果 |
| --- | --- | --- |
| 1 | 经典模板 7 项技能显示熟练度文案、无 % | PASS |
| 2 | 侧栏模板 7 项技能显示熟练度文案、无 % | PASS |
| 3 | 简约标签 7 项技能无 %，显示熟练度文案 | PASS |
| 4 | 简约标签技能每行 3 个（3/3/1 三行） | PASS |
| 5 | 打包版同样通过 | PASS |

截图：`60-label-skills-3cols.png`、`61-label-skills-row.png`。


## 经典单栏技能掌握程度改为一行 3 个（2026-10-18 追加）

- 经典单栏技能区布局由「一行 2 个」改为「一行 3 个」（宽度 `calc((100% - 36px)/3)`，名称列 104px、数值列 28px）；
- 技能掌握程度继续保持只显示熟练度文案（精通/熟练/良好/一般），不显示百分比；
- 7 项技能自动排成 3/3/1 三行，技能条宽度正常（约 95px），名称过长时省略号截断；
- 预览与导出共用样式，导出 PDF 同步。

验收脚本：`.tabbit-scripts/verify-classic-skills.js`（8/8），打包版默认内容脚本（7/7）。

| # | 场景 | 结果 |
| --- | --- | --- |
| 1 | 经典单栏技能 7 项排成 3/3/1 三行 | PASS |
| 2 | 不显示百分比、显示熟练度文案 | PASS |
| 3 | 技能条宽度正常（未被挤压） | PASS |
| 4 | 分页提醒正常，简约标签模板不受影响 | PASS |
| 5 | 打包版同样通过 | PASS |

截图：`62-classic-skills-3cols.png`。


## 简约标签标题右侧浅色方块（2026-10-18 追加）

- 每个模块标题行改为：左边深色标题块 + 右边浅色方块（`::after` 占满剩余空间，两块紧贴无间隙、外侧圆角）；
- 浅色方块颜色不再写死，而是**由「标题颜色」设置（setData.skin）向白色混合 88% 得到**，
  修改标题颜色时浅色方块同步变化（默认 #333333 → #e7e7e7；例如 #1575bf → #e3eef7）；
- 方块高度随标题块拉伸，圆角仅在外侧（右）保留，与标题块无缝拼接。

验收脚本：`.tabbit-scripts/verify-label-title-block.js`（8/8）、打包版简约标签脚本（8/8）。

| # | 场景 | 结果 |
| --- | --- | --- |
| 1 | 每个模块标题右侧都有浅色方块并占满剩余空间、无间隙 | PASS |
| 2 | 默认标题颜色 #333333 → 浅色块 #e7e7e7 | PASS |
| 3 | 修改标题颜色为 #1575bf → 浅色块同步变为 #e3eef7 | PASS |
| 4 | 经典单栏模板不受影响 | PASS |
| 5 | 打包版同样通过 | PASS |

截图：`63-label-title-block.png`。


## 新建简历沿用当前模板（2026-10-18 追加）

需求：新建简历时不再总是切到「经典单栏」，应使用当前正在使用的模板。

实现：

- `createResume()` 在创建前记录当前简历的模板（`setData.tplKey`），创建并切换到新简历后把新简历的 `tplKey` 设为该模板并保存；
- 随后仍在当前模板下测量页数，超过 1 页则自动压缩为 1 页；
- 简约标签模板固定留白较多，自动适配时先启用紧凑样式（`setData.labelCompact`，压缩标题区/基本信息行距/标题块内边距/技能间距等），
  再继续压缩间距/行高，确保能收回 1 页；该紧凑样式只在简约标签模板生效；
- 经典/侧栏模板行为不变（经典模板通常无需紧凑样式即可 1 页）。

验收脚本：`.tabbit-scripts/verify-create-keeps-template.js`（7/7）、`.tabbit-scripts/verify-desktop-create-keeps-template.js`（4/4）。

| # | 场景 | 结果 |
| --- | --- | --- |
| 1 | 在左侧深色栏下新建 → 新简历为侧栏模板且 1 页 | PASS |
| 2 | 在简约标签下新建 → 新简历为标签模板（compact）且 1 页 | PASS |
| 3 | 在经典单栏下新建 → 仍为经典模板 | PASS |
| 4 | 打包版同样通过 | PASS |

截图：`64-create-keeps-template.png`、`65-desktop-create-keeps-template.png`。


## 移除新建简历时的「自动调整为1页」（2026-10-18 追加）

需求：新建简历时不再自动压缩为 1 页。

实现：

- `createResume()` 删除创建后的测量/自动压缩逻辑，仅保留「沿用当前模板」并提示「已新建简历」；
- 手动入口不受影响：预览区分页处仍有「自动调整为1页」，点击后仍按原逻辑压缩（含简约标签紧凑样式）；
- 新建简历的间距/字号保持默认值（mm 21、细分间距 6/10/10、行距 1.7、字号 13），不再被自动改动。

验收脚本：`.tabbit-scripts/verify-create-no-autofit.js`（7/7）、`.tabbit-scripts/verify-create-keeps-template.js`（7/7）、
打包版默认内容/模板沿用脚本（7/7、4/4）。

| # | 场景 | 结果 |
| --- | --- | --- |
| 1 | 新建后不再自动压缩（默认内容为 2 页），提示仅为「已新建简历」 | PASS |
| 2 | 新建时未修改间距/字号（保持默认值） | PASS |
| 3 | 手动「自动调整为1页」入口仍保留且可正常压缩 | PASS |
| 4 | 新建仍沿用当前模板（侧栏/标签/经典） | PASS |
| 5 | 打包版同样通过 | PASS |

截图：`66-create-no-auto-fit.png`。


## 基本信息模块可编辑「简历标题/简介」（2026-10-18 追加）

需求：「不吃饭，只耗电，随叫随到」这类文字需从「基本信息」模块配置，而不是固定模板值。

实现：

- `EditPanel.vue` 基本信息页签底部新增「简历标题与简介」：
  - 显示标题开关（`setData.hasTitle`）；
  - 简历标题输入（`setData.title`）；
  - 简历简介输入（`setData.slogan`）；
  三者修改后自动保存；
- 经典单栏模板：打开「显示标题」后显示标题+简介（关闭时隐藏）；
- 简约标签模板：顶部标题始终显示（标题为空时显示「个人简历」），简介有值时显示，编辑即时生效；
- 预览与导出共用同一份数据，导出内容同步。

验收脚本：`.tabbit-scripts/verify-title-slogan.js`（9/9）、`.tabbit-scripts/verify-desktop-title-slogan.js`（3/3）。

| # | 场景 | 结果 |
| --- | --- | --- |
| 1 | 基本信息模块出现标题/简介输入框并预填当前值 | PASS |
| 2 | 修改后自动保存到 setData.title / slogan | PASS |
| 3 | 经典模板：开关打开显示新标题/简介，关闭隐藏 | PASS |
| 4 | 简约标签模板：显示新标题/简介 | PASS |
| 5 | 打包版同样通过 | PASS |

截图：`67-title-slogan-edit.png`、`68-desktop-title-slogan.png`。


## 字体/语言：新增独立「内容字号」设置（2026-10-18 追加）

需求：原先「字号」只有一个滑杆，无法单独设置正文内容字号；现拆分为标题字号 + 内容字号。

实现：

- `SettingPanel.vue`：字号拆为两个滑杆
  - **标题字号**（`setData.titleFontSize`，12–24，默认 16）：影响页面标题、模块标题；
  - **内容字号**（`setData.fontSize`，10–18，默认 13）：影响正文、列表、基本信息行、技能名称等；
  - 并附说明文案；
- `resumeCss.js`：三套模板的标题/内容字号分别取自两个字段：
  - 经典单栏：模块标题 = titleFontSize、正文继承 fontSize、页面标题 = titleFontSize+10；
  - 简约标签：标题块 = titleFontSize、页面标题 = titleFontSize+11、基本信息/内容 = fontSize 系列；
  - 左侧深色栏：模块标题 = titleFontSize、正文/侧栏信息 = fontSize 系列；
- 兼容旧简历：加载时若缺少 `titleFontSize` 自动按模板补齐（经典/侧栏 fontSize+3，简约标签 fontSize+2），显示与之前一致；
- 新建简历默认 `titleFontSize=16`、`fontSize=13`。

验收脚本：`.tabbit-scripts/verify-font-sizes.js`（14/14）、`.tabbit-scripts/verify-desktop-font-sizes.js`（3/3）。

| # | 场景 | 结果 |
| --- | --- | --- |
| 1 | 弹窗出现「标题字号」「内容字号」两个滑杆与默认值 16 / 13 | PASS |
| 2 | 经典模板：标题 20px、正文 16px 正确应用 | PASS |
| 3 | 简约标签：标题块 20px、页面标题 31px、信息行 17px、正文 16px | PASS |
| 4 | 侧栏模板：标题 20px、正文 16px、侧栏信息 15.5px | PASS |
| 5 | 重新打开弹窗回显已保存值；旧简历默认值兼容 | PASS |
| 6 | 打包版同样通过 | PASS |

截图：`69-font-size-dialog.png`、`70-desktop-font-sizes.png`。


## Logo 白底化、exe 图标更新、窗口标题改为「大肥鱼简历」（2026-10-18 追加）

- `web/public/logo.png`：由透明背景改为**白底 PNG**（同时导出 `logo.jpg`），顶栏/favicon 继续使用该文件；
- 由新 logo 重新生成 `desktop/build/icon.ico`（多尺寸）与 `icon.png`，electron-builder 用它作为 **exe 图标**；
- `desktop/main.js`：`APP_TITLE` 改为「大肥鱼简历」，窗口标题、错误弹窗标题同步；窗口图标 `build/icon.ico` 随新图标更新
  （已确认该文件被打进 app.asar）；
- `web/index.html` 页面标题、顶栏 logo 的 title/alt 均改为「大肥鱼简历」。

验收（打包版 `.tabbit-scripts/verify-logo-title.js`，3/3；exe 图标提取比对）：

| # | 场景 | 结果 |
| --- | --- | --- |
| 1 | 白底 logo 文件（RGB、角落白色、中心为主题蓝） | PASS |
| 2 | 打包版页面/窗口标题为「大肥鱼简历」 | PASS |
| 3 | 打包版顶栏 logo 为最新图片、正常加载 36×36 | PASS |
| 4 | exe 提取图标为最新 logo（白底蓝方块） | PASS |
| 5 | app.asar 内包含 build/icon.ico（窗口图标） | PASS |

截图：`71-exe-icon-white.png`、`72-desktop-logo-title.png`。


## Logo 裁剪左右白边（2026-10-18 追加）

- 原 logo（200×200，透明圆角 + 左右各约 12px 透明边）白底化后，两侧出现白边；
- 按 alpha 内容包围盒裁剪：`(12, 0, 187, 200)` → 输出 **175×200** 白底 PNG（并同步 JPG），两侧白边消除；
- 重新生成 `desktop/build/icon.ico / icon.png` 并重打 exe；窗口图标与 exe 图标同步更新；
- 顶栏 logo 容器 36×36 填满显示，无左右白条。

验收：打包版 `.tabbit-scripts/verify-logo-title.js`（3/3，logo naturalWidth=175）；exe 图标提取核对为新裁剪图标。

截图：`73-exe-icon-cropped.png`、`72-desktop-logo-title.png`。


## 修复打包版启动失败（mammoth）与导出异常（2026-10-18 追加）

现象：打包版打开报 `Cannot find module 'mammoth'`，导出也失败。

原因：

1. `server/index.js` 被回滚为旧版本（仍 require `mammoth` / `pdf-parse`、使用旧种子创建逻辑、缺少列表接口与 startServer），
   打包后桌面端依赖已移除这两个包，因此启动即崩溃；
2. 恢复服务端时又发现旧逻辑在 **模块加载阶段** 就 `mkdir` 数据目录，而打包后 `__dirname` 位于 `app.asar` 内（不可写），
   导致 `ENOTDIR`；同时 `/uploads`、`/files` 静态目录在模块加载时按默认路径挂载，打包后指向错误目录。

处理：

- 重新实现并恢复 `server/index.js`：列表/新建/复制/重命名/删除、resumeName 迁移、教育背景清理、
  `startServer({host,port,dataDir,uploadDir,filesDir,webDist})`、动态端口、导出（puppeteer + Edge）、移除导入功能；
- 数据目录只在 `startServer()` 内按实际路径创建并挂载 `/uploads`、`/files` 静态目录，兼容 asar；
- 重新构建 web 与 exe（同时包含圆角 logo、窗口标题「大肥鱼简历」、最新图标）；
- 恢复被一并回滚的 `web/src/api.js`、`web/src/components/RightPanel.vue`。

验收：

| # | 场景 | 结果 |
| --- | --- | --- |
| 1 | 服务端接口（列表/详情/新建/重命名/复制/删除/导出）10/10 | PASS |
| 2 | 打包版正常启动、标题「大肥鱼简历」、圆角 logo 正常 | PASS |
| 3 | 打包版导出图片成功（595KB 落盘） | PASS |
| 4 | 打包版自动保存生效并落盘 | PASS |
| 5 | 字号设置 14/14、标题简介编辑 9/9 回归通过 | PASS |

截图：`74-exe-icon-rounded.png`、`75-logo-rounded.png`。


## 导出失败修复 + Logo 回退到圆角之前版本（2026-10-18 追加）

导出失败现象：勾选导出后提示 `导出失败: Failed to launch the browser process!`。

排查与加固：

- 系统中残留了 14 个测试遗留的无头 Edge 进程（`--headless=new` + `puppeteer_dev_chrome_profile-*`），已全部清理；
- 导出浏览器查找改为多路径 + 兜底：Edge（Program Files/Program Files(x86)/LOCALAPPDATA）、Chrome、`PUPPETEER_EXECUTABLE_PATH`/`CHROME_PATH` 环境变量、`where msedge/chrome`；
- 每个候选浏览器失败后自动重试一次（Edge 更新/占用时更稳），全部失败时返回明确提示（已尝试路径列表）；
- 导出增加并发锁：同一时间只允许一个导出任务，避免并发启动多个无头浏览器；
- 浏览器在 `finally` 中关闭，关闭失败时强制 kill 进程，避免残留；
- 启动超时 30s，并新增 `--disable-gpu --no-first-run --disable-extensions` 等参数。

验证：服务端连续导出 3/3 成功；并发导出第二个返回「正在导出中，请稍候再试」；打包版 UI 导出接口成功、文件生成。

同时按「退回到【这个logo再改成圆角】之前」的要求，把 logo 恢复为**裁剪白底、未额外加圆角**的 175×200 版本，
并据此重新生成图标、重打 exe；打包版验证：标题「大肥鱼简历」、logo 175×200 正常、导出 3/3 成功。

截图：`76-exe-icon-flat.png`。


## 桌面版导出支持「选择保存目录」（2026-10-18 追加）

需求：导出修复后，允许用户选择导出文件的保存目录。

实现：

- 新增 `desktop/preload.js`，通过 contextBridge 只暴露 `window.resumeDesktop.saveExportAs()`（不开放 Node 权限）；
- `desktop/main.js` 注册 IPC `save-export-as`：
  - 校验 `/files/xxx` 地址与文件存在，源目录为用户数据目录下的 files；
  - 弹出系统「选择导出目录」对话框（`showOpenDialog` 目录选择），默认下载文件夹；
  - 复制文件到所选目录，重名自动生成「(1)」后缀，返回最终路径；
  - `RESUME_E2E_EXPORT_DIR` 环境变量用于自动化验收时跳过原生对话框；
- `App.vue`：下载弹窗新增「导出后选择保存目录」复选框（仅桌面版显示，默认勾选）；
  勾选时调用 IPC 保存并提示「导出成功，已保存到：<路径>」，取消则提示已取消；
  浏览器环境或未勾选时保持原下载行为；
- electron-builder 的 files 增加 `preload.js`。

验证：打包版 `.tabbit-scripts/verify-export-choose-dir.js`（7/7）：
preload 能力可用、复选框默认勾选、导出接口成功、文件保存到所选目录、提示含完整路径、文件大小正常；
浏览器环境回归：复选框隐藏、导出仍提示「导出成功，已开始下载」。

截图：`77-export-choose-dir.png`。


## Logo 再次改为圆角（2026-10-18 追加）

- 在当前裁剪版 logo（175×200 白底）基础上加圆角蒙版（半径 30），输出圆角白底 PNG/JPG；
- 重新生成 `desktop/build/icon.ico / icon.png`，重打 exe（exe 图标/窗口图标同步为圆角版）；
- 打包版验证：title「大肥鱼简历」、logo 175×200 正常显示；选择目录导出 7/7 仍正常。

截图：`78-exe-icon-rounded2.png`。


## 导出进度提示（2026-10-18 追加）

需求：点击「确定下载」后到实际导出（选择目录前）之间显示进度条，避免误以为卡住。

实现：

- `App.vue` 新增全屏导出进度遮罩：加载图标 + 「正在导出简历」+ 进度条 + 阶段文案；
- 进度从 3% 开始，按定时估算增长到 90%；服务端返回后进入「请选择导出目录…」95%，保存完成/开始下载时跳 100% 并自动淡出；
- 浏览器下载、桌面版选择目录两种流程都会显示；取消/失败立即隐藏；
- 遮罩使用固定定位 z-index 3000，经典/SaaS 主题分别适配。

验证（打包版 `.tabbit-scripts/verify-export-choose-dir.js`，9/9）：

| # | 场景 | 结果 |
| --- | --- | --- |
| 1 | 导出过程中出现进度遮罩（含标题/阶段/百分比） | PASS |
| 2 | 导出完成后进度条自动隐藏 | PASS |
| 3 | 选择目录导出 7 项原有检查全部通过 | PASS |
| 4 | 浏览器环境导出仍正常（无遮罩残留、提示已开始下载） | PASS |

截图：`79-export-progress.png`。


## 任务栏图标圆角修复（2026-10-18 追加）

问题：exe 任务栏图标仍显示直角。

原因：之前图标由「白底圆角 logo」生成，圆角外侧是**不透明白色**，任务栏（深色）上会显示为白色方块，看起来仍是直角。

处理：

- 新增 `desktop/build/logo-transparent.png`：裁剪后的 logo 加圆角蒙版，圆角外部为**透明**，居中放到 256×256 透明画布；
- `make-icon.py` 优先使用透明源生成 `icon.ico`（含 16/32/48/64/128/256 多尺寸，角部 alpha=0）；
- 重打 exe，从 exe 提取图标验证：32×32 角部 alpha=0、中心为蓝色 → 任务栏显示圆角；
- 网页顶栏 logo 仍为白底圆角版本（网页背景为白色，不受影响）。

验证：打包版启动/标题/logo 3/3；选择目录导出 9/9 仍通过。

提示：若资源管理器仍显示旧图标，是 Windows 图标缓存导致，可执行 `ie4uinit.exe -show` 或重启资源管理器刷新。

截图：`80-exe-icon-transparent.png`。


## 任务栏图标改为「白色圆角底 + 透明圆角」（2026-10-18 追加）

问题：上一版透明圆角图标在任务栏显示为全透明效果，用户要求「中间白底、圆角透明」。

处理：

- 重新生成 `desktop/build/logo-transparent.png`：256×256 透明画布上先绘制**白色圆角方形底**（圆角半径 52），
  再把蓝色 logo 缩小居中叠放在上面（四周留白边），圆角外部保持透明；
- 重新生成 `icon.ico`（多尺寸）与 `icon.png`；
- 重打 exe，任务栏/窗口图标变为「白色圆角底 + 蓝色 logo + 透明圆角」；
- 网页顶栏 logo 不变。

验证：从 exe 提取图标检查——角部 alpha=0（透明），圆角内侧为白色底，中心为蓝色 logo；
打包版启动/标题/顶栏 logo 3/3 通过。

提示：Windows 图标缓存可能延迟更新，可执行 `ie4uinit.exe -show` 或重启资源管理器后查看。

截图：`82-exe-icon-white-badge.png`、`83-taskbar-icon-preview-dark.png`。


## 任务栏图标：蓝色 logo 放大一点点（2026-10-18 追加）

- 白色圆角底保持不变；蓝色 logo 等比放大：高度 170 → 192（宽度 168），四周白边相应缩小；
- 重新生成 `logo-transparent.png`、`icon.ico`、`icon.png` 并重打 exe；
- 深色任务栏模拟预览：白色圆角底 + 更大的蓝色 logo，圆角外侧透明。

验证：exe 提取图标角部透明、圆角内白底、中心蓝色 logo；打包版启动/标题/顶栏 logo 3/3 通过。

截图：`84-exe-icon-badge-bigger.png`、`85-taskbar-icon-bigger-dark.png`。
