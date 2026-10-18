// 打包脚本：同步 server 代码与 web 构建产物 → 调用 electron-builder 生成便携 exe
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const DESKTOP = __dirname;
const ROOT = path.join(DESKTOP, "..");
const WEB_DIST = path.join(ROOT, "web", "dist");
const SERVER_SRC = path.join(ROOT, "server");
const SERVER_DEST = path.join(DESKTOP, "server");
const WEB_DEST = path.join(DESKTOP, "web-dist");

function copyDir(src, dest) {
  fs.rmSync(dest, { recursive: true, force: true });
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(from, to);
    else fs.copyFileSync(from, to);
  }
}

if (!fs.existsSync(path.join(WEB_DIST, "index.html"))) {
  console.error("未找到 web/dist，请先在 web 目录执行 pnpm build");
  process.exit(1);
}

if (fs.existsSync(SERVER_DEST)) fs.rmSync(SERVER_DEST, { recursive: true, force: true });
fs.mkdirSync(SERVER_DEST, { recursive: true });
// 复制 server 下所有顶层 .js 文件（index.js / defaultTemplate.js / defaultAvatar.js 等）
for (const entry of fs.readdirSync(SERVER_SRC, { withFileTypes: true })) {
  if (!entry.isFile() || !entry.name.endsWith(".js")) continue;
  fs.copyFileSync(
    path.join(SERVER_SRC, entry.name),
    path.join(SERVER_DEST, entry.name),
  );
}
copyDir(WEB_DIST, WEB_DEST);
console.log("已同步 server 代码与 web/dist → desktop/");

process.env.ELECTRON_BUILDER_BINARIES_MIRROR =
  process.env.ELECTRON_BUILDER_BINARIES_MIRROR ||
  "https://npmmirror.com/mirrors/electron-builder-binaries/";

const bin = path.join(
  DESKTOP,
  "node_modules",
  ".bin",
  process.platform === "win32" ? "electron-builder.cmd" : "electron-builder",
);
if (!fs.existsSync(bin)) {
  console.error("未找到 electron-builder，请先在 desktop 目录执行 npm install");
  process.exit(1);
}

// 先准备 winCodeSign 缓存，避免 Windows 上解压符号链接失败导致打包中断
const cachePrep = spawnSync(
  process.execPath,
  [path.join(DESKTOP, "prepare-builder-cache.js")],
  { cwd: DESKTOP, stdio: "inherit", env: process.env },
);
if (cachePrep.status !== 0) process.exit(cachePrep.status || 1);

const result = spawnSync(bin, ["--win", "portable", "--x64"], {
  cwd: DESKTOP,
  stdio: "inherit",
  env: process.env,
  shell: process.platform === "win32",
});
process.exit(result.status === null ? 1 : result.status);
