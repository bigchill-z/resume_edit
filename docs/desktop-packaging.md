# 打包成 Windows exe（Electron 便携版）

本项目是「Vue3 前端 + Express 后端」的本地应用。桌面版用 Electron 把两者装进一个 exe：

- 主进程启动内嵌 Express（只监听 `127.0.0.1` 的随机空闲端口），再用窗口加载 `http://127.0.0.1:<端口>/`；
- 前端 `web/dist` 由同一个 Express 服务托管，因此开发和打包后的代码路径一致；
- 简历数据、上传照片、导出文件都写到 `%APPDATA%\ResumeEditor\`，exe 本身可随意移动或覆盖升级。

## 产物

```text
desktop/release/ResumeEditor-1.0.0.exe     # 便携版单文件 exe，约 76 MB，双击即用
desktop/release/win-unpacked/ResumeEditor.exe  # 未打包目录版（调试用）
```

首次双击 exe 后：

- 应用窗口直接打开编辑器；
- 自动在 `%APPDATA%\ResumeEditor\data` 创建一份默认模板简历（张明 / 校招行政专员）；
- 再次双击会聚焦已打开的窗口（单实例）；
- 导出 PDF/图片时弹出系统「另存为」对话框，文件由本机 Edge 无头渲染生成（Windows 10/11 自带 Edge）。

## 重新打包

前置：Node 18+、`web/` 依赖已安装、`desktop/` 依赖已安装。

```powershell
# 1) 构建前端
cd web
pnpm build            # 产物在 web/dist

# 2) 安装桌面依赖（首次）
cd ..\desktop
npm install

# 3) 打包便携 exe
npm run build         # = node build.js
```

`build.js` 会：把 `server/index.js`、`server/defaultTemplate.js` 与 `web/dist` 同步到 `desktop/` 下 →
准备 electron-builder 缓存 → 调用 electron-builder 生成 `release/ResumeEditor-<版本>.exe`。

### 构建常见问题

1. **winCodeSign 解压报「Cannot create symbolic link」**：electron-builder 缓存里的
   `winCodeSign-2.6.0.7z` 含 darwin 符号链接，普通用户无权限创建。`prepare-builder-cache.js`
   已自动下载并排除 darwin 目录预解压；若仍失败，删除
   `%LOCALAPPDATA%\electron-builder\Cache\winCodeSign` 后重跑 `npm run build`。
2. **`bad option: --enable-logging=...` 或窗口不出现**：检查是否在带有
   `ELECTRON_RUN_AS_NODE=1` 的终端里启动（该变量会让 Electron 以 Node 模式运行）。
   用户双击 exe 不受影响；命令行调试时先 `$env:ELECTRON_RUN_AS_NODE=$null`。
3. **Electron / electron-builder 下载慢**：`desktop/.npmrc` 与 `package.json` 的
   `build.electronDownload.mirror` 已指向 npmmirror 镜像。

## 目录与配置

| 文件 | 作用 |
| --- | --- |
| [desktop/main.js](desktop/main.js) | Electron 主进程：启动内嵌服务、创建窗口、单实例、外链、下载另存为 |
| [desktop/build.js](desktop/build.js) | 打包入口：同步资源 → 准备缓存 → electron-builder |
| [desktop/prepare-builder-cache.js](desktop/prepare-builder-cache.js) | 预解压 winCodeSign 缓存，绕开 Windows 符号链接权限限制 |
| [desktop/package.json](desktop/package.json) | Electron/electron-builder 依赖与 `build` 打包配置（应用名、图标、便携目标） |
| [desktop/build/make-icon.py](desktop/build/make-icon.py) | 生成应用图标 `icon.ico` / `icon.png`（Pillow） |
| [server/index.js](server/index.js) | `startServer({ host, port, dataDir, uploadDir, filesDir, webDist })` 可被 Electron 内嵌调用 |

改应用名/图标/版本：改 `desktop/package.json` 的 `build.productName`、`build.win.icon`、`version`；
改窗口标题与行为：改 `desktop/main.js`。

## 数据迁移（把现有简历带进 exe）

开发环境的数据在 `server/data`、`server/uploads`、`server/files`。打包版使用 AppData，首次启动后再复制：

```powershell
$dest = "$env:APPDATA\ResumeEditor"
New-Item -ItemType Directory -Force "$dest" | Out-Null
Copy-Item server\data    "$dest\data"    -Recurse -Force
Copy-Item server\uploads "$dest\uploads" -Recurse -Force
Copy-Item server\files   "$dest\files"   -Recurse -Force
```

复制后重新打开 exe，列表里即为原简历。反之，打包版的数据也可拷回 `server/data` 继续在开发环境使用。

## 已知限制

- exe **未做代码签名**：首次运行 Windows SmartScreen 可能提示「未知发布者」，点「更多信息 → 仍要运行」即可；分发给他人也一样。
- 仅构建了 **Windows x64 便携版**；需要安装包可把 `build.win.target` 改为 `nsis`。
- PDF/图片导出依赖本机 **Microsoft Edge**（Windows 10/11 默认自带）；若系统没有 Edge，导出会失败并提示。
- 应用体积约 76 MB（Electron 运行时 + Node 依赖），属于 Electron 方案的正常水平。
