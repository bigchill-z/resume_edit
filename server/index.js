const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const puppeteer = require("puppeteer-core");
const { execSync } = require("child_process");
const { buildDefaultTemplate } = require("./defaultTemplate");

const app = express();

// 数据目录（可由 startServer 覆盖：桌面版存到用户 AppData）
let DATA_DIR = path.join(__dirname, "data");
let UPLOAD_DIR = path.join(__dirname, "uploads");
let FILES_DIR = path.join(__dirname, "files");
let SERVER_PORT = 3001;

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// 目录在 startServer() 中按实际数据目录创建（打包后 asar 内不可写，不能在此处创建）

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

function ok(res, data) {
  res.json({ status: "success", data });
}

function fail(res, msg) {
  res.json({ status: "fail", data: msg });
}

function resumePath(resumeId) {
  return path.join(DATA_DIR, `${resumeId}.json`);
}

function loadResume(resumeId) {
  const p = resumePath(resumeId);
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, "utf-8"));
}

function saveResume(resumeId, data) {
  ensureDir(DATA_DIR);
  fs.writeFileSync(
    resumePath(resumeId),
    JSON.stringify(data, null, 2),
    "utf-8",
  );
}

// ===== 简历列表名称（resumeName）=====
// 「我的简历」列表里的名称是独立字段 resumeName，与简历内的姓名 basicInfo.name 解耦：
// 从「姓名」改名、双击列表重命名都只改 resumeName，不再互相影响。
function resumeDisplayName(data) {
  if (!data) return "我的简历";
  const name = String(data.resumeName || "").trim();
  if (name) return name;
  // 兼容旧数据（无 resumeName 时临时用姓名兜底，启动迁移会补上并固化）
  const basicName = String((data.basicInfo && data.basicInfo.name) || "").trim();
  return basicName || "我的简历";
}

function nextCopyName(data) {
  const base = resumeDisplayName(data).replace(/\s*副本(\s*\d+)?$/, "").trim();
  let suffix = " 副本";
  let n = 2;
  const existing = listResumes().map((r) => r.name);
  let name = `${base}${suffix}`.slice(0, 49);
  while (existing.includes(name)) {
    name = `${base} 副本 ${n}`.slice(0, 49);
    n += 1;
  }
  return name;
}

function listResumes() {
  let files = [];
  try {
    files = fs.readdirSync(DATA_DIR);
  } catch (e) {
    return [];
  }
  const list = [];
  files.forEach((file) => {
    if (!file.toLowerCase().endsWith(".json") || file.startsWith("_")) return;
    try {
      const p = path.join(DATA_DIR, file);
      const data = JSON.parse(fs.readFileSync(p, "utf-8"));
      const stat = fs.statSync(p);
      const yixiang = (data.moduleData || []).find(
        (m) => m && m.moduleName === "yixiang",
      );
      list.push({
        resumeId: data.resumeId || path.basename(file, ".json"),
        name: resumeDisplayName(data),
        job: (yixiang && yixiang.data && yixiang.data.job) || "",
        updateTime: stat.mtimeMs,
      });
    } catch (e) {
      // 跳过损坏文件
    }
  });
  list.sort((a, b) => b.updateTime - a.updateTime);
  return list;
}

// 旧简历首次启动时补充 resumeName（按当时的姓名固化一次），之后两者互不影响
function migrateResumeNames() {
  let files = [];
  try {
    files = fs.readdirSync(DATA_DIR);
  } catch (e) {
    return;
  }
  files.forEach((file) => {
    if (!file.toLowerCase().endsWith(".json") || file.startsWith("_")) return;
    const p = path.join(DATA_DIR, file);
    try {
      const data = JSON.parse(fs.readFileSync(p, "utf-8"));
      if (data && typeof data === "object" && !String(data.resumeName || "").trim()) {
        data.resumeName = resumeDisplayName(data);
        fs.writeFileSync(p, JSON.stringify(data, null, 2), "utf-8");
      }
    } catch (e) {
      // 跳过损坏文件
    }
  });
}

// 旧数据教育背景内容里可能残留重复的「学历：xxx」段落，清理掉
function migrateEducationContent() {
  let files = [];
  try {
    files = fs.readdirSync(DATA_DIR);
  } catch (e) {
    return;
  }
  files.forEach((file) => {
    if (!file.toLowerCase().endsWith(".json") || file.startsWith("_")) return;
    const p = path.join(DATA_DIR, file);
    try {
      const data = JSON.parse(fs.readFileSync(p, "utf-8"));
      const edu = (data.moduleData || []).find(
        (m) => m && m.moduleName === "jiaoyu",
      );
      if (!edu || !Array.isArray(edu.data)) return;
      let changed = false;
      edu.data.forEach((item) => {
        if (!item || typeof item.content !== "string") return;
        const xueli = String(item.xueli || "").trim();
        if (!xueli) return;
        const dup = `<p><strong>学历：</strong>${xueli}</p>`;
        if (item.content.includes(dup)) {
          item.content = item.content.replace(dup, "").trim();
          changed = true;
        }
      });
      if (changed) fs.writeFileSync(p, JSON.stringify(data, null, 2), "utf-8");
    } catch (e) {
      // 跳过损坏文件
    }
  });
}

function genResumeId() {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let id;
  do {
    id = "";
    for (let i = 0; i < 8; i++)
      id += chars.charAt(Math.floor(Math.random() * chars.length));
  } while (fs.existsSync(resumePath(id)));
  return id;
}

// ===== 接口 =====

// 列表
app.get("/api/resume/online/list", (req, res) => {
  ok(res, listResumes());
});

// 简历详情
app.get("/api/resume/online/detail", (req, res) => {
  const { resumeId } = req.query;
  const data = loadResume(resumeId);
  if (!data) return fail(res, "简历不存在");
  ok(res, data);
});

// 创建简历
app.post("/api/resume/online/create", (req, res) => {
  const { tplId } = req.body || {};
  const resumeId = genResumeId();
  const data = buildDefaultTemplate();
  data.resumeId = resumeId;
  if (tplId) data.setData.tplId = tplId;
  const basicName = String((data.basicInfo && data.basicInfo.name) || "").trim();
  data.resumeName = (basicName ? `${basicName}的简历` : "我的简历").slice(0, 49);
  saveResume(resumeId, data);
  ok(res, { resumeId });
});

// 复制简历
app.post("/api/resume/online/copy", (req, res) => {
  const { resumeId } = req.body || {};
  const source = loadResume(resumeId);
  if (!source) return fail(res, "简历不存在");
  const newId = genResumeId();
  const data = JSON.parse(JSON.stringify(source));
  data.resumeId = newId;
  data.resumeName = nextCopyName(source);
  saveResume(newId, data);
  ok(res, { resumeId: newId });
});

// 重命名简历：只改列表名称 resumeName，不改简历内的姓名
app.post("/api/resume/online/rename", (req, res) => {
  const { resumeId, name } = req.body || {};
  const data = loadResume(resumeId);
  if (!data) return fail(res, "简历不存在");
  const nextName = String(name || "").trim();
  if (!nextName) return fail(res, "名称不能为空");
  data.resumeName = nextName.slice(0, 49);
  saveResume(resumeId, data);
  ok(res, {});
});

// 删除简历
app.post("/api/resume/online/delete", (req, res) => {
  const { resumeId } = req.body || {};
  if (!resumeId) return fail(res, "缺少 resumeId");
  const p = resumePath(resumeId);
  if (!fs.existsSync(p)) return fail(res, "简历不存在");
  fs.unlinkSync(p);
  ok(res, {});
});

// 更新基本信息
app.post("/api/resume/online/updateBasic", (req, res) => {
  const { resumeId, basicInfo } = req.body || {};
  const data = loadResume(resumeId);
  if (!data) return fail(res, "简历不存在");
  data.basicInfo = basicInfo;
  saveResume(resumeId, data);
  ok(res, {});
});

// 更新单个模块
app.post("/api/resume/online/updateModule", (req, res) => {
  const { resumeId, module } = req.body || {};
  const data = loadResume(resumeId);
  if (!data) return fail(res, "简历不存在");
  const idx = data.moduleData.findIndex(
    (m) => m.moduleName === module.moduleName,
  );
  if (idx >= 0) data.moduleData[idx] = module;
  else data.moduleData.push(module);
  saveResume(resumeId, data);
  ok(res, {});
});

// 整体更新模块列表
app.post("/api/resume/online/updateModuleList", (req, res) => {
  const { resumeId, moduleData } = req.body || {};
  const data = loadResume(resumeId);
  if (!data) return fail(res, "简历不存在");
  data.moduleData = moduleData;
  saveResume(resumeId, data);
  ok(res, {});
});

// 更新模块排序
app.post("/api/resume/online/updateModuleSort", (req, res) => {
  const { resumeId, moduleSort } = req.body || {};
  const data = loadResume(resumeId);
  if (!data) return fail(res, "简历不存在");
  data.setData.moduleSort = moduleSort;
  const order = String(moduleSort).split(",");
  data.moduleData.forEach((m) => {
    const i = order.indexOf(m.moduleName);
    m.index = i >= 0 ? i : m.index;
  });
  data.moduleData.sort((a, b) => a.index - b.index);
  saveResume(resumeId, data);
  ok(res, {});
});

// 合并更新设置
app.post("/api/resume/online/updateSet", (req, res) => {
  const { resumeId, setData } = req.body || {};
  const data = loadResume(resumeId);
  if (!data) return fail(res, "简历不存在");
  data.setData = Object.assign({}, data.setData, setData);
  saveResume(resumeId, data);
  ok(res, {});
});

// 更新封面
app.post("/api/resume/online/setCover", (req, res) => {
  const { resumeId, coverData, coverId, coverShow } = req.body || {};
  const data = loadResume(resumeId);
  if (!data) return fail(res, "简历不存在");
  data.coverData = coverData;
  data.setData.coverId = coverId;
  data.setData.coverShow = coverShow;
  saveResume(resumeId, data);
  ok(res, {});
});

// 更新自荐信
app.post("/api/resume/online/zijianxin", (req, res) => {
  const { resumeId, zijianData } = req.body || {};
  const data = loadResume(resumeId);
  if (!data) return fail(res, "简历不存在");
  data.zijianData = zijianData;
  saveResume(resumeId, data);
  ok(res, {});
});

// 照片上传
const photoUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      ensureDir(UPLOAD_DIR);
      cb(null, UPLOAD_DIR);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname) || ".png";
      cb(null, `${Date.now()}_${Math.random().toString(36).slice(2, 8)}${ext}`);
    },
  }),
});

app.post("/api/photo/use", photoUpload.single("file"), (req, res) => {
  if (!req.file) return fail(res, "未收到文件");
  ok(res, { url: `/uploads/${req.file.filename}` });
});

// ===== 导出 PDF / 图片 =====
// 支持 Edge / Chrome 多个安装位置，并用 where 兜底（兼容不同机器与安装方式）
function browserCandidates() {
  const list = [];
  const envPath =
    process.env.PUPPETEER_EXECUTABLE_PATH || process.env.CHROME_PATH;
  if (envPath) list.push(envPath);
  const bases = [
    process.env["ProgramFiles(x86)"],
    process.env.ProgramFiles,
    process.env.LOCALAPPDATA,
  ].filter(Boolean);
  const relatives = [
    ["Microsoft", "Edge", "Application", "msedge.exe"],
    ["Google", "Chrome", "Application", "chrome.exe"],
    ["Google", "Chrome Beta", "Application", "chrome.exe"],
  ];
  for (const base of bases) {
    for (const rel of relatives) list.push(path.join(base, ...rel));
  }
  for (const cmd of ["msedge", "chrome"]) {
    try {
      const out = execSync(`where ${cmd}`, {
        stdio: ["ignore", "pipe", "ignore"],
        timeout: 3000,
      }).toString();
      out.split(/\r?\n/).forEach((line) => {
        const p = line.trim();
        if (p) list.push(p);
      });
    } catch (e) {
      // 该浏览器未安装
    }
  }
  return [...new Set(list.filter(Boolean))];
}

async function launchBrowser() {
  const tried = [];
  for (const executablePath of browserCandidates()) {
    if (!fs.existsSync(executablePath)) continue;
    for (let attempt = 1; attempt <= 2; attempt += 1) {
      try {
        const browser = await puppeteer.launch({
          executablePath,
          headless: true,
          timeout: 30000,
          args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-gpu",
            "--no-first-run",
            "--disable-extensions",
          ],
        });
        return browser;
      } catch (err) {
        tried.push(`${executablePath}: ${String(err.message || err).split("\n")[0]}`);
        if (attempt === 1) {
          await new Promise((r) => setTimeout(r, 500));
        }
      }
    }
  }
  throw new Error(
    "无法启动浏览器（导出需要本机安装 Microsoft Edge 或 Google Chrome）。已尝试：" +
      (tried.length ? tried.join("；") : "未找到可执行文件"),
  );
}

function sanitizeFilename(name) {
  return String(name).replace(/[\\/:*?"<>|]/g, "_");
}

// 同一时间只允许一个导出任务，避免并发启动多个无头浏览器导致失败
let exportBusy = false;

app.post("/api_file/template/online/downpdf", async (req, res) => {
  const { resumeId, cssStr, htmlDom, type } = req.body || {};
  const data = loadResume(resumeId);
  if (!data) return fail(res, "简历不存在");
  if (exportBusy) return fail(res, "正在导出中，请稍候再试");
  exportBusy = true;

  // 相对路径的图片（/uploads、/files）转绝对地址，保证 headless 渲染时能加载
  const base = `http://127.0.0.1:${SERVER_PORT}`;
  const safeHtml = String(htmlDom || "").replace(
    /((?:src|href)\s*=\s*["'])\/(?!\/)/g,
    `$1${base}/`,
  );

  const resetCss = `
    html,body{margin:0;padding:0;background:#fff;}
    #resume_pc{box-shadow:none!important;margin:0!important;}
    @page{size:A4;margin:0;}
  `;
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${resetCss}${cssStr || ""}</style></head><body>${safeHtml}</body></html>`;
  const resumeTitle =
    (data.basicInfo && data.basicInfo.name ? data.basicInfo.name : "简历") +
    "的简历";
  const ts = Date.now();
  const isImg = type === "img";
  const filename = `简历_${sanitizeFilename(resumeTitle)}_${resumeId}_${ts}.${isImg ? "jpg" : "pdf"}`;

  let browser;
  try {
    ensureDir(FILES_DIR);
    const filePath = path.join(FILES_DIR, filename);
    browser = await launchBrowser();
    const page = await browser.newPage();
    // 794 CSS px = A4 210mm @96dpi，2 倍缩放保证导出图片清晰
    await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 2 });
    await page.setContent(html, { waitUntil: "networkidle0" });
    if (isImg) {
      await page.screenshot({
        path: filePath,
        fullPage: true,
        type: "jpeg",
        quality: 92,
      });
    } else {
      await page.pdf({
        path: filePath,
        format: "A4",
        printBackground: true,
        margin: { top: 0, right: 0, bottom: 0, left: 0 },
      });
    }
    await browser.close();
    ok(res, { src: `/files/${filename}`, type });
  } catch (err) {
    fail(res, `导出失败: ${err.message}`);
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch (e) {
        try {
          const proc = browser.process();
          if (proc) proc.kill();
        } catch (e2) {
          // 忽略清理失败
        }
      }
    }
    exportBusy = false;
  }
});

// ===== 启动 =====
function startServer(options = {}) {
  const host = options.host || "0.0.0.0";
  const port = options.port ?? 3001;
  DATA_DIR = options.dataDir || path.join(__dirname, "data");
  UPLOAD_DIR = options.uploadDir || path.join(__dirname, "uploads");
  FILES_DIR = options.filesDir || path.join(__dirname, "files");
  [DATA_DIR, UPLOAD_DIR, FILES_DIR].forEach(ensureDir);
  // 静态目录按实际数据目录挂载（打包版为 AppData 下的真实路径）
  app.use("/uploads", express.static(UPLOAD_DIR));
  app.use("/files", express.static(FILES_DIR));

  // 桌面版由内嵌服务直接提供打包后的静态站点
  const webDist = options.webDist;
  if (webDist && fs.existsSync(webDist)) {
    app.use(express.static(webDist));
    app.get("*", (req, res, next) => {
      if (
        req.path.startsWith("/api") ||
        req.path.startsWith("/files") ||
        req.path.startsWith("/uploads")
      ) {
        return next();
      }
      res.sendFile(path.join(webDist, "index.html"));
    });
  }

  migrateResumeNames();
  migrateEducationContent();

  return new Promise((resolve, reject) => {
    const server = app.listen(port, host, () => {
      SERVER_PORT = server.address().port;
      console.log(`Resume server running at http://${host}:${SERVER_PORT}`);
      resolve({ port: SERVER_PORT, server });
    });
    server.on("error", reject);
  });
}

module.exports = { startServer };

if (require.main === module) {
  startServer({ host: "0.0.0.0", port: 3001 }).catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
