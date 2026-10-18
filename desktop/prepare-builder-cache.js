// 准备 electron-builder 的 winCodeSign 缓存。
// Windows 上 electron-builder 解压 winCodeSign-2.6.0.7z 时，会因 darwin 目录里的
// 符号链接（需要管理员/开发者模式权限）失败，导致打包中断。
// 这里自行下载并解压缓存，排除 Windows 打包用不到的 darwin 目录，绕开该限制。
const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");

const LOCAL_APP_DATA =
  process.env.LOCALAPPDATA || path.join(os.homedir(), "AppData", "Local");
const CACHE_ROOT = path.join(LOCAL_APP_DATA, "electron-builder", "Cache");
const TARGET_DIR = path.join(CACHE_ROOT, "winCodeSign", "winCodeSign-2.6.0");
const ARCHIVE_URL =
  process.env.ELECTRON_BUILDER_BINARIES_MIRROR
    ? `${process.env.ELECTRON_BUILDER_BINARIES_MIRROR.replace(/\/?$/, "/")}winCodeSign-2.6.0/winCodeSign-2.6.0.7z`
    : "https://npmmirror.com/mirrors/electron-builder-binaries/winCodeSign-2.6.0/winCodeSign-2.6.0.7z";
const SEVEN_ZIP = path.join(__dirname, "node_modules", "7zip-bin", "win", "x64", "7za.exe");

(async () => {
  if (process.platform !== "win32") return;
  if (fs.existsSync(path.join(TARGET_DIR, "windows-10"))) {
    console.log("winCodeSign 缓存已就绪");
    return;
  }
  if (!fs.existsSync(SEVEN_ZIP)) {
    console.warn("未找到 7za，跳过 winCodeSign 缓存准备");
    return;
  }
  console.log("下载 winCodeSign 缓存（Windows 打包工具）...");
  const res = await fetch(ARCHIVE_URL);
  if (!res.ok) throw new Error(`下载失败: HTTP ${res.status}`);
  const tmp = path.join(os.tmpdir(), `winCodeSign-${Date.now()}.7z`);
  fs.writeFileSync(tmp, Buffer.from(await res.arrayBuffer()));
  fs.rmSync(TARGET_DIR, { recursive: true, force: true });
  fs.mkdirSync(path.dirname(TARGET_DIR), { recursive: true });
  execFileSync(
    SEVEN_ZIP,
    ["x", tmp, `-o${TARGET_DIR}`, "-y", "-bd", "-xr!darwin"],
    { stdio: "inherit" },
  );
  fs.rmSync(tmp, { force: true });
  console.log("winCodeSign 缓存准备完成（已跳过 Windows 打包不需要的 darwin 符号链接）");
})().catch((err) => {
  console.error("准备构建缓存失败：", err.message);
  process.exit(1);
});
