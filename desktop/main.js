// Electron 桌面版入口：内嵌 Express 服务 + 打开应用窗口
// 数据统一存放在用户 AppData（app.getPath("userData")）下，exe 本身可随意移动/更新。
const path = require("path");
const fs = require("fs");
const {
  app,
  BrowserWindow,
  Menu,
  dialog,
  ipcMain,
  shell,
  screen,
  session,
} = require("electron");

const APP_TITLE = "大肥鱼简历";

app.setName("ResumeEditor");

// 自动化验收时用独立的数据目录，避免影响用户真实数据（RESUME_E2E_USER_DATA 仅测试使用）
if (process.env.RESUME_E2E_USER_DATA) {
  app.setPath("userData", process.env.RESUME_E2E_USER_DATA);
}

let mainWindow = null;
let httpServer = null;
let downloadHookInstalled = false;

/** 站内地址（本机服务）不走系统浏览器 */
function isLocalUrl(url, port) {
  return (
    url.startsWith(`http://127.0.0.1:${port}`) ||
    url.startsWith(`http://localhost:${port}`)
  );
}

// 导出文件重名时生成「文件名 (1).pdf」这类不冲突路径
function uniqueDownloadPath(filename) {
  const dir = app.getPath("downloads");
  const ext = path.extname(filename);
  const base = path.basename(filename, ext);
  let candidate = path.join(dir, filename);
  let i = 1;
  while (fs.existsSync(candidate)) {
    candidate = path.join(dir, `${base} (${i})${ext}`);
    i += 1;
  }
  return candidate;
}

// 在指定目录内生成不冲突的文件名
function uniquePathInDir(dir, filename) {
  const ext = path.extname(filename);
  const base = path.basename(filename, ext);
  let candidate = path.join(dir, filename);
  let i = 1;
  while (fs.existsSync(candidate)) {
    candidate = path.join(dir, `${base} (${i})${ext}`);
    i += 1;
  }
  return candidate;
}

// 导出后由用户选择保存目录（通过 preload 暴露给页面调用）
function setupIpc() {
  ipcMain.handle("save-export-as", async (event, payload) => {
    try {
      const src = String((payload && payload.src) || "");
      if (!src.startsWith("/files/")) {
        return { ok: false, error: "无效的导出文件地址" };
      }
      const name = path.basename(String((payload && payload.filename) || src));
      const filesDir = path.join(app.getPath("userData"), "files");
      const source = path.join(filesDir, name);
      if (!fs.existsSync(source)) {
        return { ok: false, error: "导出文件不存在，请重新导出" };
      }
      let dir = process.env.RESUME_E2E_EXPORT_DIR;
      if (!dir) {
        const result = await dialog.showOpenDialog(mainWindow, {
          title: "选择导出目录",
          defaultPath: app.getPath("downloads"),
          buttonLabel: "保存到该目录",
          properties: ["openDirectory", "createDirectory"],
        });
        if (result.canceled || !result.filePaths || !result.filePaths[0]) {
          return { canceled: true };
        }
        dir = result.filePaths[0];
      }
      fs.mkdirSync(dir, { recursive: true });
      const dest = uniquePathInDir(dir, name);
      fs.copyFileSync(source, dest);
      return { ok: true, path: dest };
    } catch (err) {
      return { ok: false, error: String((err && err.message) || err) };
    }
  });
}

function installDownloadHook(port) {
  if (downloadHookInstalled) return;
  downloadHookInstalled = true;
  // 导出 PDF/图片：直接保存到系统「下载」文件夹（与浏览器默认行为一致），
  // 避免在 will-download 回调里同步弹「另存为」阻塞下载导致导出失败。
  session.defaultSession.on("will-download", (event, item) => {
    item.setSavePath(uniqueDownloadPath(item.getFilename()));
  });
}

function createWindow(port) {
  const { width: screenW, height: screenH } = screen.getPrimaryDisplay().workAreaSize;
  const width = Math.max(1200, Math.min(1440, screenW - 40));
  const height = Math.max(700, Math.min(960, screenH - 40));

  mainWindow = new BrowserWindow({
    width,
    height,
    minWidth: 1200,
    minHeight: 700,
    title: APP_TITLE,
    backgroundColor: "#39394d",
    autoHideMenuBar: true,
    show: false,
    icon: path.join(__dirname, "build", "icon.ico"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      spellcheck: false,
    },
  });

  Menu.setApplicationMenu(null);
  mainWindow.once("ready-to-show", () => mainWindow.show());
  mainWindow.loadURL(`http://127.0.0.1:${port}/`);

  // 站内链接在应用内打开，外部链接交给系统浏览器
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (isLocalUrl(url, port)) return { action: "allow" };
    shell.openExternal(url);
    return { action: "deny" };
  });
  // 页面内跳转到外部地址时同样拦截
  mainWindow.webContents.on("will-navigate", (event, url) => {
    if (isLocalUrl(url, port)) return;
    event.preventDefault();
    shell.openExternal(url);
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  installDownloadHook(port);
}

async function bootstrap() {
  const userData = app.getPath("userData");
  const { startServer } = require("./server/index.js");
  const { port, server } = await startServer({
    host: "127.0.0.1",
    port: 0, // 由系统分配空闲端口，避免和本机其它服务冲突
    dataDir: path.join(userData, "data"),
    uploadDir: path.join(userData, "uploads"),
    filesDir: path.join(userData, "files"),
    webDist: path.join(__dirname, "web-dist"),
  });
  httpServer = server;
  setupIpc();
  createWindow(port);
}

// 单实例：重复双击 exe 时聚焦已有窗口
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (!mainWindow) return;
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  });

  app
    .whenReady()
    .then(bootstrap)
    .catch(async (err) => {
      const detail = String((err && err.stack) || err);
      if (fs.existsSync(path.join(__dirname, "web-dist"))) {
        await dialog.showMessageBox({
          type: "error",
          title: APP_TITLE,
          message: "应用启动失败",
          detail,
        });
      } else {
        console.error(detail);
      }
      app.quit();
    });

  app.on("window-all-closed", () => app.quit());
  app.on("will-quit", () => {
    if (httpServer) httpServer.close();
  });
}
