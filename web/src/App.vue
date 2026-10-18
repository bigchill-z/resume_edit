<template>
  <div v-if="state.resume" class="edit_resume">
    <TopBar @download="openDownload" />

    <div class="edit_main">
      <RightPanel />
      <div class="tpl_box" :class="{ 'is-switching': state.switching }">
        <div v-if="state.switching" class="switch-hint">
          <el-icon class="is-loading"><Loading /></el-icon>
          切换中…
        </div>
        <div class="tpl_main" :style="{ minHeight: A4_H * pageCount + 'px' }">
          <ResumePreview />
          <!-- A4 分页提醒线 -->
          <ul class="page_line" :style="{ height: A4_H * pageCount + 'px' }">
            <li
              v-for="n in pageCount"
              :key="n"
              :style="{ top: n * A4_H - 9 + 'px' }"
            >
              <p v-if="pageCount > 1 && n < pageCount" class="pl-hint">
                分页区，请在内容里用换行避开此区域
              </p>
              <div class="page_num">
                第{{ n }}页（共<b class="orange">{{ pageCount }}</b
                >页）
                <span
                  v-if="showSetOne && n === pageCount"
                  class="set_onepage"
                  @click="setOnePage"
                  >自动调整为1页</span
                >
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <EditPanel />

    <div v-if="state.exporting" class="export_progress_mask">
      <div class="export_progress_card">
        <el-icon class="is-loading export_progress_icon"><Loading /></el-icon>
        <div class="export_progress_title">正在导出简历</div>
        <el-progress
          :percentage="state.exportPercent"
          :stroke-width="10"
          :show-text="true"
        />
        <div class="export_progress_stage">{{ state.exportStage }}</div>
      </div>
    </div>

    <el-dialog
      v-model="downloadDlg"
      title="下载简历"
      width="380px"
      append-to-body
    >
      <el-checkbox
        v-if="isDesktopApp"
        v-model="state.chooseExportDir"
        class="export-dir-check"
        >导出后选择保存目录</el-checkbox
      >
      <el-radio-group v-model="dtype">
        <el-radio value="pdf">PDF 文档</el-radio>
        <el-radio value="img">图片</el-radio>
      </el-radio-group>
      <template #footer>
        <el-button @click="downloadDlg = false">取消</el-button>
        <el-button
          type="primary"
          :loading="state.downloading"
          @click="confirmDownload"
          >确定下载</el-button
        >
      </template>
    </el-dialog>
  </div>
  <div
    v-else
    v-loading="true"
    element-loading-text="简历加载中..."
    class="loading"
  ></div>
</template>

<script setup>
import {
  reactive,
  computed,
  provide,
  ref,
  watch,
  nextTick,
  onMounted,
  onBeforeUnmount,
} from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import TopBar from "./components/TopBar.vue";
import RightPanel from "./components/RightPanel.vue";
import ResumePreview from "./components/ResumePreview.vue";
import EditPanel from "./components/EditPanel.vue";
import {
  getDetail,
  updateBasic,
  updateModule,
  updateModuleSort,
  updateSet,
  downpdf,
  unwrap,
  getResumeList,
  createResume as createResumeApi,
  copyResume as copyResumeApi,
  renameResume as renameResumeApi,
  deleteResume as deleteResumeApi,
} from "./api";
import { debounce, nowTime } from "./utils";
import { buildResumeCss } from "./resumeCss";
import { getUiTheme, applyUiTheme } from "./uiTheme";
import { TEMPLATES, getTemplate } from "./templates";

// URL 里带 resumeId 就优先打开它，否则默认打开最近更新的简历
const initialResumeId =
  new URLSearchParams(location.search).get("resumeId") || "";
const resumeId = ref(initialResumeId);

const state = reactive({
  resume: null,
  lastSaved: "",
  downloading: false,
  resumes: [],
  resumeListLoading: false,
  creatingResume: false,
  // 正在切换/新建简历：保持旧界面不卸载，只做轻微淡出，避免整页闪一下
  switching: false,
  // 点击预览区某部分时，请求打开对应编辑页签（editRequestTs 用于重复点击也能触发）
  editModule: "",
  editRequestTs: 0,
  // 桌面版：导出后是否弹出「选择保存目录」（默认开启）
  chooseExportDir: true,
  // 导出进度提示
  exporting: false,
  exportPercent: 0,
  exportStage: "",
});

// 桌面版（Electron）通过 preload 暴露的能力；浏览器环境为 undefined
const isDesktopApp = ref(false);
onMounted(() => {
  isDesktopApp.value = !!(window.resumeDesktop && window.resumeDesktop.isDesktop);
});

// 预览区点击某个部分 → 请求打开对应的编辑表单
function openModuleEditor(moduleName) {
  state.editModule = moduleName || "__basic";
  state.editRequestTs = Date.now();
}

// ===== 软件界面风格：仅影响编辑器外观，不影响简历纸张与导出内容 =====
const uiTheme = ref(getUiTheme());
function setUiTheme(key) {
  uiTheme.value = applyUiTheme(key);
}

// ===== 简历模板（样式切换，数据不变）=====
function setTemplate(key) {
  const s = state.resume && state.resume.setData;
  if (!s || !TEMPLATES.some((t) => t.key === key)) return;
  if (getTemplate(s) === key) return;
  s.tplKey = key;
  saveSet();
  // 模板结构变化会改变纸张高度，稍后重新测量分页
  nextTick(() => setTimeout(measureResume, 180));
  const t = TEMPLATES.find((item) => item.key === key);
  ElMessage.success(`已切换为「${t ? t.name : key}」模板`);
}

const moduleMap = computed(() => {
  if (!state.resume) return {};
  return Object.fromEntries(
    state.resume.moduleData.map((m) => [m.moduleName, m]),
  );
});

const sortedModules = computed(() => {
  if (!state.resume) return [];
  const sort = state.resume.setData.moduleSort || "";
  return sort
    .split(",")
    .map((n) => moduleMap.value[n])
    .filter(Boolean);
});

function markSaved() {
  state.lastSaved = nowTime();
  // 保存成功后静默刷新列表里的「更新时间」
  refreshListLazy();
}

async function wrapSave(promise) {
  try {
    await promise;
    markSaved();
  } catch (e) {
    ElMessage.error("保存失败，请检查后端服务");
  }
}

const saveSet = debounce(() =>
  wrapSave(updateSet(resumeId.value, state.resume.setData)),
);
const saveBasic = debounce(() =>
  wrapSave(updateBasic(resumeId.value, state.resume.basicInfo)),
);
const saveSort = debounce(() =>
  wrapSave(updateModuleSort(resumeId.value, state.resume.setData.moduleSort)),
);

const moduleSavers = {};
function saveModule(module) {
  const name = module.moduleName;
  if (!moduleSavers[name]) {
    moduleSavers[name] = debounce(() =>
      wrapSave(updateModule(resumeId.value, moduleMap.value[name])),
    );
  }
  moduleSavers[name]();
}

// 切换/删除简历前，把 debounce 队列里还没发出的保存全部落盘，
// 避免旧简历的修改丢失或被写进新简历。
function saveAll() {
  if (!state.resume) return;
  const savers = [saveSet, saveBasic, saveSort, ...Object.values(moduleSavers)];
  savers.forEach((fn) => {
    if (fn.pending && fn.pending()) fn.flush();
  });
}

// 页面隐藏/关闭、窗口失焦前，把尚未落盘的修改立即保存，避免丢最后几秒的编辑
function flushPendingSaves() {
  if (!state.resume) return;
  saveAll();
}
window.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") flushPendingSaves();
});
window.addEventListener("pagehide", flushPendingSaves);
window.addEventListener("beforeunload", flushPendingSaves);

function setModuleOrder(sortStr) {
  state.resume.setData.moduleSort = sortStr;
  saveSort();
}

// ===== 简历列表 / 多简历管理 =====
const refreshListLazy = debounce(() => refreshResumeList(true), 1500);

async function refreshResumeList(silent = false) {
  if (!silent) state.resumeListLoading = true;
  try {
    state.resumes = unwrap(await getResumeList()) || [];
  } catch (e) {
    if (!silent) ElMessage.error("简历列表加载失败，请检查后端服务");
  } finally {
    if (!silent) state.resumeListLoading = false;
  }
  return state.resumes;
}

// 旧简历没有细分间距字段时补上默认值，保证滑块与预览一致
function normalizeSetData(data) {
  const s = data && data.setData;
  if (!s) return data;
  if (s.titleGap == null) s.titleGap = 6;
  if (s.lineGap == null) s.lineGap = 10;
  if (s.itemGap == null) s.itemGap = 10;
  if (s.titleFontSize == null)
    s.titleFontSize =
      (Number(s.fontSize) || 13) + (getTemplate(s) === "label" ? 2 : 3);
  if (!s.tplKey) s.tplKey = getTemplate(s);
  if (s.hasTitle === undefined) s.hasTitle = false;
  return data;
}

async function load(id = resumeId.value) {
  try {
    const res = await getDetail(id);
    state.resume = normalizeSetData(unwrap(res));
  } catch (e) {
    ElMessage.error("简历加载失败，请确认后端服务已启动");
  }
}

function syncUrl() {
  try {
    history.replaceState(
      null,
      "",
      `?resumeId=${encodeURIComponent(resumeId.value)}`,
    );
  } catch (e) {
    /* 忽略：file:// 等不支持改 URL 的环境 */
  }
}

async function switchResume(id) {
  if (!id || id === resumeId.value || state.switching) return;
  // 先把待保存内容落盘；再拉取新简历，成功后才一次性替换 state.resume。
  // 不把 state.resume 置空，避免整页被 v-if 卸载/重建造成闪屏。
  saveAll();
  state.switching = true;
  const prevId = resumeId.value;
  try {
    const res = await getDetail(id);
    const data = normalizeSetData(unwrap(res));
    state.resume = data;
    resumeId.value = id;
    syncUrl();
  } catch (e) {
    ElMessage.error(e.message || "简历加载失败，请确认后端服务已启动");
    resumeId.value = prevId;
  } finally {
    state.switching = false;
  }
}

async function createResume() {
  if (state.creatingResume) return;
  // 记录新建时所在的模板，新简历沿用该模板
  const currentTpl =
    state.resume && state.resume.setData
      ? getTemplate(state.resume.setData)
      : "classic";
  state.creatingResume = true;
  try {
    saveAll();
    const data = unwrap(await createResumeApi());
    const id = data && data.resumeId;
    if (!id) throw new Error("新建失败");
    await refreshResumeList(true);
    await switchResume(id);
    // 新简历默认内容使用服务端默认模板，这里切换为“当前模板”
    if (state.resume && state.resume.setData && currentTpl) {
      if (getTemplate(state.resume.setData) !== currentTpl) {
        state.resume.setData.tplKey = currentTpl;
        saveSet();
      }
    }
    ElMessage.success("已新建简历");
  } catch (e) {
    ElMessage.error(e.message || "新建简历失败，请检查后端服务");
  } finally {
    state.creatingResume = false;
  }
}

async function copyResume(id) {
  try {
    if (id === resumeId.value) saveAll();
    const data = unwrap(await copyResumeApi(id));
    const newId = data && data.resumeId;
    if (!newId) throw new Error("复制失败");
    await refreshResumeList(true);
    await switchResume(newId);
    ElMessage.success("已复制简历");
  } catch (e) {
    ElMessage.error(e.message || "复制简历失败，请检查后端服务");
  }
}

// 重命名只改「我的简历」列表里的名称（resumeName），不影响简历内的姓名
async function renameResume(id, name) {
  const val = String(name || "").trim();
  if (!val) return;
  try {
    unwrap(await renameResumeApi(id, val));
    if (id === resumeId.value && state.resume) state.resume.resumeName = val;
    await refreshResumeList(true);
    ElMessage.success("简历已重命名");
  } catch (e) {
    ElMessage.error(e.message || "重命名失败，请检查后端服务");
  }
}

async function deleteResume(id) {
  try {
    if (id === resumeId.value) {
      // 删除当前简历：先切到其它简历（切换会 flush 待保存内容），再删文件
      const other = state.resumes.find((r) => r.resumeId !== id);
      if (other) await switchResume(other.resumeId);
      else await createResume();
      if (resumeId.value === id) return; // 切走失败则放弃删除
    }
    unwrap(await deleteResumeApi(id));
    await refreshResumeList(true);
    ElMessage.success("简历已删除");
  } catch (e) {
    ElMessage.error(e.message || "删除简历失败，请检查后端服务");
  }
}

async function init() {
  await refreshResumeList();
  const wanted = resumeId.value;
  if (wanted && state.resumes.some((r) => r.resumeId === wanted)) {
    await load(wanted);
  } else if (state.resumes.length) {
    await switchResume(state.resumes[0].resumeId);
  } else {
    // 一份简历都没有时自动创建，保证页面可用
    await createResume();
  }
}
init();

// ===== A4 分页检测：预览区显示分页线与页数提醒 =====
const A4_H = 1123; // A4 @96dpi 像素高度，与导出 viewport 一致
const resumeHeight = ref(A4_H);
let resizeObserver = null;

const pageCount = computed(() =>
  Math.max(1, Math.ceil(resumeHeight.value / A4_H)),
);
// 两页时始终提供「自动调整为1页」入口（间距调大后第二页可能超出一屏提示阈值）
const showSetOne = computed(() => pageCount.value === 2);

function measureResume() {
  const el = document.querySelector("#resume_pc");
  if (el) resumeHeight.value = el.offsetHeight;
}
const measureLazy = debounce(measureResume, 250);

// 兜底：部分环境 ResizeObserver 不可靠，定时对比高度变化（图片/字体/布局抖动）
setInterval(() => {
  if (!state.resume) return;
  const el = document.querySelector("#resume_pc");
  if (el && el.offsetHeight !== resumeHeight.value)
    resumeHeight.value = el.offsetHeight;
}, 1200);

watch(
  () => state.resume,
  (r) => {
    if (!r) return;
    // 预览组件可能晚于数据渲染，轮询直到 #resume_pc 可用
    let tries = 0;
    const timer = setInterval(() => {
      tries++;
      const el = document.querySelector("#resume_pc");
      if (!el) {
        if (tries > 40) clearInterval(timer);
        return;
      }
      clearInterval(timer);
      measureResume();
      if (!resizeObserver && typeof ResizeObserver !== "undefined") {
        resizeObserver = new ResizeObserver(() => {
          try {
            measureResume();
          } catch (e) {
            /* ignore */
          }
        });
        resizeObserver.observe(el);
      }
      el.querySelectorAll("img").forEach((img) =>
        img.addEventListener("load", measureResume),
      );
      if (document.fonts && document.fonts.ready)
        document.fonts.ready.then(measureResume);
    }, 200);
  },
);

watch(
  () => state.resume && JSON.stringify(state.resume),
  () => nextTick(measureLazy),
);

onBeforeUnmount(() => resizeObserver && resizeObserver.disconnect());

async function setOnePage(silent = false) {
  const set = state.resume.setData;
  let mm = set.mm ?? 25;
  let guard = 0;
  // 简约标签模板的固定留白较多：先启用紧凑样式，再继续压缩间距
  if (getTemplate(set) === "label" && !set.labelCompact) {
    set.labelCompact = true;
    saveSet();
    await nextTick();
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
  measureResume();
  while (resumeHeight.value > A4_H && mm > 5 && guard < 8) {
    mm = Math.max(5, mm - 4);
    set.mm = mm;
    saveSet();
    await nextTick();
    await new Promise((resolve) => setTimeout(resolve, 120));
    measureResume();
    guard++;
  }
  // 若仅压缩模块间距仍超过 1 页，再依次压缩：横线与内容 / 子模块 / 标题与横线间距
  const gapDefaults = { lineGap: 10, itemGap: 10, titleGap: 6 };
  for (const key of ["lineGap", "itemGap", "titleGap"]) {
    while (
      resumeHeight.value > A4_H &&
      Number(set[key] ?? gapDefaults[key]) > 0 &&
      guard < 24
    ) {
      set[key] = Math.max(0, Number(set[key] ?? gapDefaults[key]) - 2);
      saveSet();
      await nextTick();
      await new Promise((resolve) => setTimeout(resolve, 90));
      measureResume();
      guard++;
    }
  }
  // 最后再压缩行间距（1.7 → 1.3），尽量把轻微超出的内容收回 1 页
  while (
    resumeHeight.value > A4_H &&
    Number(set.lineHeight ?? 1.7) > 1.3 &&
    guard < 40
  ) {
    set.lineHeight = Math.max(
      1.3,
      Number((Number(set.lineHeight ?? 1.7) - 0.05).toFixed(2)),
    );
    saveSet();
    await nextTick();
    await new Promise((resolve) => setTimeout(resolve, 90));
    measureResume();
    guard++;
  }
  // 最后如仍超出，再小幅缩小字号（最小 11），保证能收回 1 页
  while (
    resumeHeight.value > A4_H &&
    Number(set.fontSize ?? 13) > 11 &&
    guard < 60
  ) {
    set.fontSize = Math.max(
      11,
      Number((Number(set.fontSize ?? 13) - 0.5).toFixed(1)),
    );
    saveSet();
    await nextTick();
    await new Promise((resolve) => setTimeout(resolve, 90));
    measureResume();
    guard++;
  }
  if (resumeHeight.value <= A4_H) {
    if (!silent) ElMessage.success("已自动调整为1页简历");
    return true;
  }
  if (!silent)
    ElMessage.warning("第二页内容仍较多，建议精简文字或隐藏不常用模块");
  return false;
}

const downloadDlg = ref(false);
const dtype = ref("pdf");
function openDownload(type) {
  if (type) dtype.value = type;
  downloadDlg.value = true;
}
function confirmDownload() {
  downloadDlg.value = false;
  doDownload(dtype.value);
}

// ===== 导出进度提示（点击下载到保存完成之间可见，避免误以为卡住） =====
let exportProgressTimer = null;
function startExportProgress() {
  state.exporting = true;
  state.exportPercent = 3;
  state.exportStage = "正在准备导出…";
  if (exportProgressTimer) clearInterval(exportProgressTimer);
  exportProgressTimer = setInterval(() => {
    if (!state.exporting) return;
    if (state.exportPercent < 90) {
      const step = Math.max(1, Math.round((90 - state.exportPercent) / 10));
      state.exportPercent = Math.min(90, state.exportPercent + step);
    }
  }, 220);
}
function setExportProgress(stage, percent) {
  if (typeof stage === "string") state.exportStage = stage;
  if (typeof percent === "number") state.exportPercent = percent;
}
function stopExportProgress(finalStage = "导出完成", delay = 700) {
  if (exportProgressTimer) {
    clearInterval(exportProgressTimer);
    exportProgressTimer = null;
  }
  state.exportPercent = 100;
  state.exportStage = finalStage;
  setTimeout(() => {
    state.exporting = false;
  }, delay);
}
function abortExportProgress() {
  if (exportProgressTimer) {
    clearInterval(exportProgressTimer);
    exportProgressTimer = null;
  }
  state.exporting = false;
}

async function doDownload(type) {
  if (state.switching) {
    ElMessage.info("简历切换中，请稍候再导出");
    return;
  }
  measureResume();
  if (pageCount.value > 1) {
    if (showSetOne.value) {
      try {
        await ElMessageBox.confirm(
          "检测到第二页内容较少，可自动缩小模块间距，尝试将正文调整为 1 页。",
          "版面优化建议",
          {
            confirmButtonText: "自动调整",
            cancelButtonText: "保持并下载",
            distinguishCancelAndClose: true,
            type: "info",
          },
        );
        await setOnePage();
        return;
      } catch (action) {
        if (action === "close") return; // 取消：保持并下载则继续
      }
    } else {
      try {
        await ElMessageBox.confirm(
          `当前简历共 ${pageCount.value} 页，内容将被分页线切割，建议精简为 1 页。是否仍要下载？`,
          "超出一页A4",
          {
            confirmButtonText: "仍要下载",
            cancelButtonText: "返回修改",
            type: "warning",
          },
        );
      } catch (action) {
        return;
      }
    }
  }
  state.downloading = true;
  startExportProgress();
  try {
    const el = document.querySelector("#resume_pc");
    // 必须发送 outerHTML：导出页的 CSS 选择器全部以 #resume_pc 开头，
    // 只发 innerHTML 会丢失包裹元素导致导出无任何样式。
    const htmlDom = el.outerHTML
      .replace(/\s*data-v-[a-f0-9]+(="")?/g, "")
      .replace(/<!---->/g, "");
    const cssStr = buildResumeCss(state.resume.setData);
    const res = await downpdf({
      resumeId: resumeId.value,
      cssStr,
      htmlDom,
      type,
    });
    const data = unwrap(res);
    if (data && data.src) {
      const filename = data.src.split("/").pop() || "";
      const desktop = window.resumeDesktop;
      if (isDesktopApp.value && state.chooseExportDir && desktop && desktop.saveExportAs) {
        // 桌面版：弹出目录选择框，把服务端生成的文件复制到用户选择的位置
        setExportProgress("请选择导出目录…", 95);
        const saved = await desktop.saveExportAs({ src: data.src, filename });
        if (saved && saved.canceled) {
          abortExportProgress();
          ElMessage.info("已取消保存");
        } else if (saved && saved.ok) {
          stopExportProgress("已保存到所选目录");
          ElMessage.success("导出成功，已保存到：" + saved.path);
        } else {
          abortExportProgress();
          ElMessage.error(
            "导出失败：" + ((saved && saved.error) || "保存文件失败"),
          );
        }
      } else {
        // 浏览器 / 未勾选选择目录：直接触发下载
        const a = document.createElement("a");
        a.href = data.src;
        a.download = filename;
        a.rel = "noopener";
        document.body.appendChild(a);
        a.click();
        a.remove();
        stopExportProgress("已开始下载");
        ElMessage.success("导出成功，已开始下载");
      }
    } else {
      abortExportProgress();
      ElMessage.warning("导出成功但未返回文件地址");
    }
  } catch (e) {
    abortExportProgress();
    const msg =
      (e && e.message && e.message !== "Network Error" && e.message) ||
      "请检查后端服务是否正常";
    ElMessage.error("导出失败：" + msg);
  } finally {
    state.downloading = false;
  }
}

provide(
  "ctx",
  reactive({
    state,
    resumeId,
    moduleMap,
    sortedModules,
    saveSet,
    saveBasic,
    saveModule,
    saveSort,
    setModuleOrder,
    saveAll,
    refreshResumeList,
    switchResume,
    createResume,
    copyResume,
    renameResume,
    deleteResume,
    uiTheme,
    setUiTheme,
    setTemplate,
    openModuleEditor,
  }),
);
</script>

<style>
html,
body,
#app {
  height: 100%;
  margin: 0;
}
body {
  font-family:
    "Microsoft YaHei", "PingFang SC", "Hiragino Sans GB", "Helvetica Neue",
    Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
}
/* Element Plus 主题色统一为原站青绿 */
:root {
  --el-color-primary: #13d8a7;
  --el-color-primary-light-3: #4de2bc;
  --el-color-primary-light-5: #7fe9cf;
  --el-color-primary-light-7: #b3f1e2;
  --el-color-primary-light-8: #ccf5ea;
  --el-color-primary-light-9: #e6faf4;
  --el-color-primary-dark-2: #0fad85;
}
.loading {
  height: 100%;
}

/* ============ 根布局 ============ */
.edit_resume {
  background-color: #39394d;
  padding-top: 70px;
  padding-bottom: 500px;
  min-width: 1200px;
  min-height: 100%;
}
.edit_resume * {
  box-sizing: border-box;
}
.edit_resume ul,
.edit_resume li {
  list-style: none;
  margin: 0;
  padding: 0;
}

/* ============ 头部 ============ */
.edit_resume .edit_header {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 6;
  width: 100%;
  background-color: #fff;
  box-shadow: 0 0 12px rgba(57, 57, 77, 0.66);
}
.edit_resume .edit_header .edit_header_main {
  height: 70px;
  width: 1200px;
  margin: 0 auto;
  position: relative;
}
.edit_resume .edit_header_main .logo {
  position: absolute;
  left: 8px;
  /* 顶栏高 70px，36px logo 垂直居中：(70-36)/2 = 17 */
  top: 17px;
  display: block;
  width: 36px;
  height: 36px;
  overflow: hidden;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}
.edit_resume .edit_header_main .logo img {
  display: block;
  width: 100%;
  height: 100%;
}
.edit_resume .edit_header_main .logo:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(30, 70, 192, 0.28);
}
/* 设置标签条 */
.edit_resume .set_list {
  width: 618px;
  margin-left: 70px;
  height: 70px;
  text-align: left;
}
.edit_resume .set_list > li {
  display: inline-block;
  position: relative;
  vertical-align: top;
}
.edit_resume .set_list > li:hover {
  z-index: 3;
}
.edit_resume .set_list > li .set_btn,
.edit_resume .set_list > li .click_btn {
  text-align: center;
  height: 70px;
  padding: 10px 16px 0;
  color: #39394d;
  cursor: pointer;
  background-color: #fff;
  position: relative;
  z-index: 2;
}
.edit_resume .set_list > li .set_btn i.el-icon,
.edit_resume .set_list > li .click_btn i.el-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 26px;
  font-size: 26px;
  color: #13a783;
}
.edit_resume .set_list > li .set_icon {
  display: block;
  width: 26px;
  height: 26px;
  margin: 0 auto;
  fill: #13a783;
  transition: fill 0.2s ease;
}
.edit_resume .set_list > li .set_btn b,
.edit_resume .set_list > li .click_btn b {
  margin-top: 5px;
  display: block;
  font-size: 14px;
  font-weight: 400;
  color: #136e58;
}
.edit_resume .set_list > li:hover .set_btn,
.edit_resume .set_list > li:hover .click_btn {
  box-shadow: 0 -8px 10px rgba(0, 0, 0, 0.12);
}
.edit_resume .set_list > li:hover .set_btn i.el-icon,
.edit_resume .set_list > li:hover .click_btn i.el-icon,
.edit_resume .set_list > li:hover .set_btn b,
.edit_resume .set_list > li:hover .click_btn b {
  color: #13d8a7;
}
.edit_resume .set_list > li:hover .set_icon {
  fill: #13d8a7;
}
.edit_resume .set_list > li .click_btn b span {
  color: #999;
  margin: 0 1px;
}
.edit_resume .set_box .set_page::after {
  content: "";
  display: block;
  clear: both;
}
/* 设置下拉面板 */
.edit_resume .set_box {
  width: 536px;
  padding: 0;
  background-color: #fff;
  box-shadow: 0 3px 9px 0 rgba(0, 0, 0, 0.3);
  position: absolute;
  left: 50%;
  top: 69px;
  margin-left: -268px;
  overflow: hidden;
  height: 0;
  transition: height 0.2s ease-out;
  text-align: left;
}
.edit_resume .set_list > li.show_set .set_box,
.edit_resume .set_list > li:hover .set_box {
  height: auto;
  overflow: inherit;
  padding: 20px 30px 0;
}
.edit_resume .set_box .set_page li {
  float: left;
  width: 50%;
  margin-bottom: 20px;
  min-height: 76px;
  position: relative;
}
.edit_resume .set_box .set_page li h5 {
  font-size: 14px;
  color: #333;
  margin: 0 0 10px;
  font-weight: 400;
}
.edit_resume .set_box .set_page li h5 b {
  color: #f60;
}
.edit_resume .set_box .set_page li .slider_box {
  position: relative;
  margin-bottom: 6px;
}
.edit_resume .set_box .set_page li .page_slider {
  width: 138px;
  margin-top: 2px;
}
.edit_resume .set_box .set_page li .el_btn {
  position: absolute;
  right: 22px;
  top: 22px;
}
.edit_resume .set_box .clearfix::after {
  content: "";
  display: block;
  clear: both;
}
.edit_resume .set_box.jianju_set {
  /* 左对齐到「间距设置」按钮；3 行 × 2 列布局 */
  width: 536px;
  left: 0;
  margin-left: 0;
}
.edit_resume .set_box.jianju_set .set_page li {
  width: 50%;
  min-height: 74px;
}
.edit_resume .set_box.jianju_set .page_slider {
  width: 150px;
}
.edit_resume .set_box.set_skin {
  width: 290px;
  left: 0;
  margin-left: 0;
}
.edit_resume .set_box.set_skin .set_page li {
  float: none;
  width: 226px;
  min-height: 0;
}
.edit_resume .set_box.set_skin .set_page li:nth-child(2) {
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}
.edit_resume .set_box.set_skin .set_page li h5 {
  margin-bottom: 10px;
  font-size: 13px;
  color: #666;
}
.edit_resume .skin_list {
  display: grid;
  grid-template-columns: repeat(6, 28px);
  gap: 10px;
  padding: 4px;
}
.edit_resume .skin_list span {
  position: relative;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.08);
  transition: all 0.15s ease-out;
  cursor: pointer;
}
.edit_resume .skin_list span:hover {
  transform: scale(1.12);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
}
.edit_resume .skin_list .active {
  cursor: default;
  box-shadow:
    0 0 0 2px #fff,
    0 0 0 4px #13d8a7;
}
.edit_resume .skin_list .active:hover {
  transform: none;
  box-shadow:
    0 0 0 2px #fff,
    0 0 0 4px #13d8a7;
}
.edit_resume .make_skin {
  width: 100%;
  height: 28px;
  border-radius: 6px;
  cursor: pointer;
  background: linear-gradient(
    90deg,
    red,
    #fb0,
    #00ff26,
    #00c8ff,
    blue,
    #fb00ff,
    #000
  );
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.08);
  margin-top: 10px;
}
/* 操作组 */
.edit_resume .get_list {
  float: right;
  display: flex;
  align-items: center;
  padding: 4px;
  margin: 13px 18px 0 0;
  position: relative;
  z-index: 2;
  border: 1px solid #e7eaf0;
  border-radius: 12px;
  background: #f7f8fa;
  box-shadow: 0 3px 12px rgba(30, 41, 59, 0.05);
}
.edit_resume .get_list li {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 34px;
  padding: 0 11px;
  border-radius: 8px;
  cursor: pointer;
  margin: 0;
  color: #475569;
  font-size: 13px;
  line-height: 34px;
  white-space: nowrap;
  position: relative;
  transition:
    color 0.2s ease,
    background-color 0.2s ease,
    box-shadow 0.2s ease;
}
.edit_resume .get_list li i.el-icon {
  font-size: 16px;
  display: inline-block;
  margin-right: 6px;
  color: #64748b;
  transition: color 0.2s ease;
}
.edit_resume .get_list li + li {
  margin-left: 2px;
}
.edit_resume .get_list li:hover {
  color: #087f65;
  background: #fff;
  box-shadow: 0 2px 8px rgba(30, 41, 59, 0.08);
}
.edit_resume .get_list li:hover i.el-icon {
  color: #0f9f7e;
}
.edit_resume .get_list li.active {
  color: #fff;
  background: linear-gradient(135deg, #13b98f, #0f9f7e);
  box-shadow: 0 4px 10px rgba(15, 159, 126, 0.22);
}
.edit_resume .get_list li.active i.el-icon {
  color: #fff;
}
.edit_resume .get_list li.active:hover {
  background: linear-gradient(135deg, #10ad86, #0d9273);
}

/* ============ 主体 ============ */
.edit_resume .edit_main {
  width: 1200px;
  margin: 0 auto;
  padding-top: 10px;
}
.edit_resume .edit_main .edit_right {
  float: right;
  width: 360px;
  position: relative;
}
.edit_resume .edit_main .edit_right .edit_fixed {
  /* 右侧栏（我的简历 + 常见问题）随浏览器滚动条一起滚动，不再使用独立滚动条 */
  position: static;
  width: 360px;
}
.edit_resume .page_r_box {
  border: 1px solid #e8edf3;
  box-shadow: 0 8px 28px rgba(31, 45, 61, 0.08);
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 14px;
  background-color: #fff;
  transition:
    box-shadow 0.25s ease,
    transform 0.25s ease;
}
.edit_resume .page_r_box:hover {
  box-shadow: 0 12px 34px rgba(31, 45, 61, 0.11);
}
.edit_resume .page_r_box h2 {
  margin: 0;
}
.edit_resume .page_r_box h4 {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0;
  padding: 12px 18px;
  font-size: 16px;
  font-weight: 600;
  line-height: 22px;
  color: #202936;
  border-bottom: 1px solid #f0f3f7;
}
.edit_resume .page_r_box h4:before {
  content: "";
  width: 4px;
  height: 16px;
  margin-right: 8px;
  border-radius: 4px;
  background: linear-gradient(180deg, #13d8a7, #0ebc91);
}
.edit_resume .page_r_box h4 .section-title {
  margin-right: auto;
}
.edit_resume .qa-video-btn {
  display: inline-flex;
  align-items: center;
  flex: 0 0 auto;
  width: auto;
  height: 28px;
  padding: 0 10px;
  border: 1px solid #ffe0c7;
  border-radius: 14px;
  background: #fff8f2;
  color: #f27624;
  font-size: 12px;
  line-height: 26px;
  cursor: pointer;
  outline: none;
  transition: all 0.2s ease;
}
.edit_resume .qa-video-btn i {
  position: relative;
  display: inline-block;
  width: 16px;
  height: 16px;
  margin-right: 6px;
  border-radius: 50%;
  background: #f27624;
}
.edit_resume .qa-video-btn i:after {
  content: "";
  position: absolute;
  top: 4px;
  left: 6px;
  border-width: 4px 0 4px 6px;
  border-style: solid;
  border-color: transparent transparent transparent #fff;
}
.edit_resume .qa-video-btn:hover {
  border-color: #13d8a7;
  background: rgba(19, 216, 167, 0.08);
  color: #0eaa83;
}
.edit_resume .qa-video-btn:hover i {
  background-color: #13d8a7;
}
.edit_resume .page_r_box .page_r_content {
  padding: 18px;
}
.edit_resume .assistant-card {
  position: relative;
  border-color: rgba(19, 200, 155, 0.2);
}
.edit_resume .assistant-card:before {
  content: "";
  position: absolute;
  top: 0;
  right: 0;
  width: 120px;
  height: 120px;
  border-radius: 0 0 0 120px;
  background: linear-gradient(
    225deg,
    rgba(19, 216, 167, 0.14),
    rgba(19, 216, 167, 0)
  );
  pointer-events: none;
}
.edit_resume .assistant-card__header {
  position: relative;
  display: flex;
  align-items: center;
  padding: 20px 18px 8px;
}
.edit_resume .assistant-card__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 42px;
  height: 42px;
  margin-right: 12px;
  border-radius: 12px;
  background: linear-gradient(135deg, #e6fbf5, #f1fffb);
  color: #0eb78c;
  font-size: 22px;
  box-shadow: inset 0 0 0 1px rgba(19, 200, 155, 0.12);
}
.edit_resume .assistant-card__title {
  display: block;
  color: #202936;
  font-size: 17px;
  font-weight: 600;
  line-height: 24px;
}
.edit_resume .assistant-card__desc {
  display: block;
  margin-top: 2px;
  color: #8a95a3;
  font-size: 12px;
  font-weight: 400;
  line-height: 18px;
}
.edit_resume .zhushou_btn_box {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.edit_resume .btn_dingzhi,
.edit_resume .btn_zhenduan {
  width: 100%;
  height: 40px;
  margin: 0;
  padding: 0;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
}
.edit_resume .btn_optimize {
  border-color: #12c79a !important;
  background: linear-gradient(135deg, #18d4a6, #0ebd91) !important;
  color: #fff !important;
  box-shadow: 0 6px 16px rgba(15, 190, 145, 0.22);
}
.edit_resume .btn_ai {
  border-color: #12c79a !important;
  background: rgba(19, 200, 155, 0.06) !important;
  color: #0eaa83 !important;
}
.edit_resume .btn_zhenduan {
  border-color: #d8e8e3 !important;
  background: #f7fbfa !important;
  color: #3e655b !important;
}
.edit_resume .btn_human {
  border-color: #dfe6ed !important;
  background: #f8fafc !important;
  color: #485568 !important;
}
.edit_resume .page_r_box .page_r_content2 {
  padding: 0 18px 5px;
}
.edit_resume .qa_list {
  margin: 0;
  border-top: 1px solid #f0f3f7;
}
.edit_resume .qa_list:first-child {
  border: none;
}
.edit_resume .qa_list dt {
  min-height: 38px;
  padding: 9px 34px 9px 0;
  font-size: 13px;
  line-height: 20px;
  color: #3c4655;
  position: relative;
  cursor: pointer;
  transition: color 0.2s ease;
}
.edit_resume .qa_list dt i {
  position: absolute;
  right: 2px;
  top: 12px;
  color: #a6b0bc;
  font-size: 12px;
  transition:
    transform 0.25s ease,
    color 0.2s ease;
}
.edit_resume .qa_list dd {
  margin: 0;
  padding: 0 24px 0 0;
  font-size: 12px;
  line-height: 20px;
  color: #7b8797;
  max-height: 0;
  overflow: hidden;
  opacity: 0;
  transition:
    max-height 0.3s ease,
    padding 0.3s ease,
    opacity 0.2s ease;
}
.edit_resume .qa_list.active dt {
  color: #0eaa83;
  font-weight: 500;
}
.edit_resume .qa_list.active dt i {
  color: #13c89b;
  transform: rotate(180deg);
}
.edit_resume .qa_list.active dd {
  padding: 0 24px 10px 0;
  max-height: 200px;
  opacity: 1;
}
.edit_resume .ad_box {
  position: relative;
}
.edit_resume .ad_box .ad_placeholder {
  height: 222px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: linear-gradient(135deg, #eefbf7, #f7fdfb);
  color: #0eb78c;
  font-size: 13px;
}
.edit_resume .ad_box .ad_tag {
  display: block;
  position: absolute;
  right: 0;
  top: 0;
  background: rgba(0, 0, 0, 0.1);
  color: #999;
  font-size: 12px;
  line-height: 14px;
  z-index: 3;
  padding: 0 3px;
}

/* 预览纸张 */
.edit_resume .edit_main .tpl_box {
  width: 820px;
  background-color: #fff;
  box-shadow: 0 0 6px rgba(0, 0, 0, 0.1);
  position: relative;
  padding: 12px 0 20px;
}
.edit_resume .edit_main .tpl_box .tpl_main {
  position: relative;
  transition: opacity 0.15s ease;
}
/* 切换简历时纸张轻微淡出 + 右上角提示，避免整页卸载造成闪屏 */
.edit_resume .edit_main .tpl_box.is-switching .tpl_main {
  opacity: 0.55;
}
.edit_resume .edit_main .tpl_box .switch-hint {
  position: absolute;
  top: 14px;
  right: 14px;
  z-index: 6;
  display: flex;
  align-items: center;
  gap: 6px;
  height: 30px;
  padding: 0 12px;
  border-radius: 15px;
  background: rgba(57, 57, 77, 0.85);
  color: #fff;
  font-size: 12px;
  pointer-events: none;
}
.edit_resume .edit_main .tpl_box .switch-hint i.el-icon {
  font-size: 14px;
}
/* ===== A4 分页提醒线 ===== */
.edit_resume .edit_main .tpl_box .page_line {
  position: absolute;
  left: 50%;
  top: 0;
  transform: translateX(-50%);
  width: 794px;
  margin: 0;
  padding: 0;
  list-style: none;
  z-index: 3;
  pointer-events: none;
}
.edit_resume .edit_main .tpl_box .page_line li {
  position: absolute;
  left: 0;
  width: 100%;
  height: 18px;
  background-color: #39394d;
  border-radius: 2px;
  font-size: 12px;
}
.edit_resume .edit_main .tpl_box .page_line li .page_num {
  position: absolute;
  left: 50%;
  top: 0;
  transform: translateX(-50%);
  color: #fff;
  line-height: 18px;
  text-align: center;
  white-space: nowrap;
}
.edit_resume .edit_main .tpl_box .page_line li .page_num .orange {
  color: #ff8b1a;
  margin: 0 2px;
  font-weight: 700;
}
.edit_resume .edit_main .tpl_box .page_line li .pl-hint {
  position: absolute;
  left: 12px;
  top: 0;
  margin: 0;
  line-height: 18px;
  color: #cfd3dc;
  white-space: nowrap;
}
.edit_resume .edit_main .tpl_box .page_line li .set_onepage {
  position: absolute;
  left: 118%;
  top: 0;
  line-height: 18px;
  color: #13d8a7;
  text-decoration: underline;
  white-space: nowrap;
  cursor: pointer;
  pointer-events: auto;
}
.edit_resume .edit_main .tpl_box .page_line li .set_onepage:hover {
  color: #f60;
}

/* ============ 底部编辑面板 ============ */
.edit_resume .edit_all {
  width: 100%;
  background-color: #fff;
  position: fixed;
  left: 0;
  bottom: 0;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease-out;
  transform: translateY(calc(100% - 55px));
  z-index: 6;
}
.edit_resume .edit_all.edit_show {
  transform: translateY(0);
}
.edit_resume .edit_all .edit_box {
  width: 1200px;
  margin: 0 auto;
  position: relative;
}
.edit_resume .edit_all .edit_box .close {
  color: #13d8a7;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
  position: absolute;
  left: 50%;
  top: -25px;
  z-index: 2;
  margin-left: -40px;
  background-color: #fff;
  cursor: pointer;
  font-size: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease-out;
}
.edit_resume .edit_all .edit_box .close:hover {
  color: #0fbf95;
}
.edit_resume .edit_all .edit_box .save_tip {
  position: absolute;
  left: 62px;
  top: -31px;
  padding: 0 20px;
  height: 30px;
  line-height: 30px;
  color: #fb1e1e;
  font-size: 13px;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.4);
  background-color: #fff;
  font-weight: 700;
  z-index: 8;
  opacity: 0;
  transition: all 0.5s ease-out;
}
.edit_resume .edit_all .edit_box .save_tip.save_tip_show {
  opacity: 1;
}
.edit_resume .edit_all .edit_box .edit_top {
  height: 55px;
  border-bottom: 2px solid #ddd;
  background-color: #fff;
  position: relative;
  z-index: 2;
}
.edit_resume .edit_tab {
  display: block;
}
.edit_resume .edit_tab li {
  float: left;
  padding: 23px 11px 0 9px;
  height: 55px;
  width: 92px;
  border-bottom: 2px solid #ddd;
  cursor: pointer;
  position: relative;
}
.edit_resume .edit_tab li b {
  display: block;
  text-align: center;
  line-height: 32px;
  font-size: 15px;
  font-weight: 400;
  color: #222;
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.edit_resume .edit_tab li .tab_dot {
  position: absolute;
  left: 50%;
  top: 7px;
  transform: translateX(-50%);
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #13d8a7;
  box-shadow: inset 0 0 0 3px rgba(255, 255, 255, 0.35);
  cursor: pointer;
  transition:
    background 0.2s ease,
    transform 0.15s ease;
}
.edit_resume .edit_tab li .tab_dot:hover {
  transform: translateX(-50%) scale(1.15);
}
.edit_resume .edit_tab li .tab_dot.off {
  background: #ddd;
  box-shadow: none;
}
.edit_resume .edit_tab li .btn_prev,
.edit_resume .edit_tab li .btn_next {
  position: absolute;
  top: 6px;
  color: #13ce66;
  font-size: 16px;
  opacity: 0.55;
  display: none;
  cursor: pointer;
  z-index: 3;
}
.edit_resume .edit_tab li .btn_prev {
  left: 2px;
}
.edit_resume .edit_tab li .btn_next {
  right: 2px;
}
.edit_resume .edit_tab li .btn_edit {
  position: absolute;
  right: 2px;
  bottom: 5px;
  font-size: 14px;
  color: #13ce66;
  opacity: 0.8;
  display: none;
  cursor: pointer;
  z-index: 3;
}
.edit_resume .edit_tab li .btn_edit:hover {
  opacity: 1;
}
.edit_resume .edit_tab li:hover b {
  color: #f60;
}
.edit_resume .edit_tab li:hover .btn_prev,
.edit_resume .edit_tab li:hover .btn_next,
.edit_resume .edit_tab li:hover .btn_edit {
  display: block;
}
.edit_resume .edit_tab li:hover .btn_prev:hover,
.edit_resume .edit_tab li:hover .btn_next:hover {
  opacity: 1;
}
.edit_resume .edit_tab li.active {
  border-bottom-color: #f60;
}
.edit_resume .edit_tab li.active b {
  color: #f60;
  font-weight: 700;
}
.edit_resume .edit_tab li.active .tab_dot {
  box-shadow:
    inset 0 0 0 3px rgba(255, 255, 255, 0.35),
    0 0 0 2px rgba(19, 216, 167, 0.3);
}
.edit_resume .edit_tab li.active .btn_prev,
.edit_resume .edit_tab li.active .btn_next,
.edit_resume .edit_tab li.active .btn_edit {
  display: block;
}
.edit_resume .edit_tab li.module_hide b {
  color: #ccc !important;
}
.edit_resume .edit_tab li.module_hide .btn_prev,
.edit_resume .edit_tab li.module_hide .btn_next,
.edit_resume .edit_tab li.module_hide .btn_edit {
  display: none !important;
}
.edit_resume .edit_tab::after {
  content: "";
  display: block;
  clear: both;
}
.edit_resume .edit_all .edit_box .edit_b {
  min-height: 400px;
  padding-top: 15px;
  clear: both;
}
.edit_resume .edit_all .edit_box .edit_b .edit_b_list {
  min-height: 380px;
  max-height: 380px;
  overflow-y: auto;
  padding-right: 22px;
  padding-top: 5px;
}
.edit_resume .edit_b_list::-webkit-scrollbar {
  width: 8px;
}
.edit_resume .edit_b_list::-webkit-scrollbar-track {
  background-color: #ddd;
  border-radius: 4px;
}
.edit_resume .edit_b_list::-webkit-scrollbar-thumb {
  border-radius: 4px;
  background-color: #999;
}
.edit_resume .info_tip {
  margin-bottom: 15px;
  color: #888;
  font-size: 13px;
  line-height: 22px;
}
.edit_resume .info_tip i.el-icon {
  font-size: 16px;
  color: #ff9e5d;
  margin-right: 6px;
  vertical-align: -2px;
}
.edit_resume .info_list {
  overflow: hidden;
  display: flex;
  flex-wrap: wrap;
}
.edit_resume .info_list li {
  margin-bottom: 15px;
  float: none;
  width: 25%;
  margin-right: 0;
  padding-right: 10px;
  box-sizing: border-box;
}
.edit_resume .info_list li.wide {
  width: 50%;
}
.edit_resume .info_list li.full {
  width: 100%;
}
.edit_resume .info_list li > b {
  display: inline-block;
  vertical-align: top;
  text-align: justify;
  text-align-last: justify;
  min-width: 65px;
  line-height: 32px;
  text-align: right;
  padding-right: 10px;
  color: #333;
  font-size: 14px;
  font-weight: 400;
}
.edit_resume .info_list li .field {
  display: inline-block;
  vertical-align: top;
  line-height: 32px;
}
/* 表单元素对齐原站：灰底、32px 高 */
.edit_resume .edit_b_list .el-input,
.edit_resume .edit_b_list .el-select {
  width: 100%;
}
.edit_resume .edit_b_list .el-input__wrapper,
.edit_resume .edit_b_list .el-select__wrapper {
  box-shadow: none !important;
  border: 1px solid #f0f4f6;
  background-color: #f3f4f6;
  border-radius: 3px;
  min-height: 32px;
}
.edit_resume .edit_b_list .el-input__wrapper:hover {
  border-color: #cfeee5;
}
.edit_resume .edit_b_list .el-input__wrapper.is-focus,
.edit_resume .edit_b_list .el-select__wrapper.is-focused {
  border-color: #13d8a7;
  background-color: #fff;
}
.edit_resume .edit_b_list .el-input__inner {
  font-size: 13px;
  color: #222;
}
.edit_resume .edit_b_list .el-select .el-input__inner {
  color: #666;
}
/* 日期选择器默认宽度 */
.edit_resume .edit_b_list .el-date-editor {
  width: 130px;
}
.edit_resume .edit_text {
  height: 140px;
}
.edit_resume .info_hastime li {
  width: auto;
  margin-left: 20px;
}
.edit_resume .info_hastime li:first-child {
  margin-left: 0;
}
.edit_resume .info_hastime li > b {
  width: auto;
  min-width: 0;
}
.edit_resume .edit_b_content {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px dashed #ffc69f;
}
.edit_resume .edit_b_content:first-child {
  border: none;
  margin: 0;
  padding: 0;
}
.edit_resume .edit_has_sort {
  padding-right: 120px;
  position: relative;
  overflow: hidden;
}
.edit_resume .btn_box {
  position: absolute;
  right: 0;
  top: 0;
}
.edit_resume .btn_box .btn_up,
.edit_resume .btn_box .btn_remove {
  display: block;
  width: 98px;
  height: 28px;
  line-height: 28px;
  margin-top: 20px;
  border-radius: 14px;
  cursor: pointer;
  text-align: center;
  font-size: 14px;
}
.edit_resume .btn_box .btn_up {
  border: 1px solid #13d8a7;
  color: #13d8a7;
  background: #fff;
}
.edit_resume .btn_box .btn_up:hover {
  background-color: #13d8a7;
  color: #fff;
}
.edit_resume .btn_box .btn_remove {
  border: 1px solid #ff755d;
  color: #ff755d;
  background: #fff;
}
.edit_resume .btn_box .btn_remove:hover {
  background-color: #ff755d;
  color: #fff;
}
.edit_resume .btn_add {
  margin: 15px 0 20px;
}
.edit_resume .btn_add .el-button {
  border: 1px solid #13d8a7;
  color: #13d8a7;
  border-radius: 14px;
  height: 32px;
  background: #fff;
}
.edit_resume .btn_add .el-button:hover {
  background-color: #13d8a7;
  color: #fff;
}
.edit_resume .photo_upload {
  position: relative;
  display: inline-block;
  border: 1px solid #13d8a7;
  width: 100px;
  line-height: 30px;
  text-align: center;
  font-size: 12px;
  border-radius: 16px;
  overflow: hidden;
  background-color: #13d8a7;
  color: #fff;
  cursor: pointer;
  vertical-align: top;
}
.edit_resume .photo_upload:hover {
  border-color: #11ca9c;
  background-color: #11ca9c;
}
.edit_resume .photo_upload input {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}
.edit_resume .photo_preview {
  width: 36px;
  height: 48px;
  object-fit: cover;
  border: 1px solid #e4e7ed;
  border-radius: 3px;
  margin: 0 8px;
  vertical-align: middle;
}
.edit_resume .jineng_list li {
  float: left;
  width: 25%;
  margin-top: 15px;
}
.edit_resume .jineng_list li b {
  display: block;
  margin-right: 20px;
  margin-bottom: 5px;
  font-size: 13px;
  color: #333;
  font-weight: 400;
}
.edit_resume .jineng_list li .del {
  color: red;
  opacity: 0.6;
  cursor: pointer;
  margin-left: 8px;
  font-size: 16px;
}
.edit_resume .jineng_list li .del:hover {
  opacity: 1;
}
.edit_resume .jineng_row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}
.edit_resume .jineng_row .el-slider {
  flex: 1;
}
.edit_resume .tag_box {
  overflow: hidden;
}
.edit_resume .tag_box span {
  float: left;
  height: 28px;
  line-height: 28px;
  padding: 0 10px;
  border-radius: 16px;
  border: 1px solid #ddd;
  margin-right: 10px;
  margin-top: 3px;
  cursor: pointer;
  color: #999;
}
.edit_resume .tag_box span:hover {
  color: #13d8a7;
  border-color: #13d8a7;
}
.edit_resume .tag_box span.active {
  color: #fff;
  border-color: #13d8a7;
  background-color: #13d8a7;
}

/* ================= 软件风格切换：顶栏入口 ================= */
.edit_resume .get_list li.theme_action {
  padding: 0 9px;
}
.edit_resume .get_list li.theme_action .el-dropdown {
  display: flex;
  align-items: center;
  height: 34px;
}
.edit_resume .get_list li.theme_action .theme_trigger {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 34px;
  font-size: 13px;
  line-height: 1;
  color: #475569;
  cursor: pointer;
  outline: none;
  white-space: nowrap;
}
.edit_resume .get_list li.theme_action .theme_trigger i.el-icon {
  margin-right: 0;
  font-size: 15px;
  color: inherit;
}
.edit_resume .get_list li.theme_action:hover .theme_trigger {
  color: #087f65;
}
.edit_resume .get_list li.theme_action .theme_trigger:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: -2px;
  border-radius: 4px;
}

/* ================= 软件风格：清爽 SaaS =================
   浅灰背景 + 白色卡片 + 深蓝主按钮 + 灰色次按钮 + 红色仅用于删除。
   只覆盖编辑器外观；#resume_pc 简历纸张与导出内容不受影响。 */
html[data-ui-theme="saas"] {
  --el-color-primary: #1d4ed8;
  --el-color-primary-light-3: #4874e0;
  --el-color-primary-light-5: #8aa6ea;
  --el-color-primary-light-7: #b6c8f2;
  --el-color-primary-light-8: #cfdbf7;
  --el-color-primary-light-9: #e9effc;
  --el-color-primary-dark-2: #1740b0;
  --el-color-danger: #dc2626;
  --el-border-radius-base: 6px;
}
html[data-ui-theme="saas"] body,
html[data-ui-theme="saas"] #app {
  background: #eef1f6;
}
html[data-ui-theme="saas"] .edit_resume,
html[data-ui-theme="saas"] .edit_resume .edit_main {
  background-color: #eef1f6 !important;
}

/* 顶栏 */
html[data-ui-theme="saas"] .edit_resume .edit_header {
  box-shadow:
    0 1px 0 #e5e7eb,
    0 8px 20px rgba(15, 23, 42, 0.04) !important;
}

/* 顶栏设置入口 */
html[data-ui-theme="saas"] .edit_resume .set_list > li .set_btn b,
html[data-ui-theme="saas"] .edit_resume .set_list > li .click_btn b {
  color: #374151 !important;
}
html[data-ui-theme="saas"] .edit_resume .set_list > li .set_btn i.el-icon,
html[data-ui-theme="saas"] .edit_resume .set_list > li .click_btn i.el-icon {
  color: #1d4ed8 !important;
}
html[data-ui-theme="saas"] .edit_resume .set_list > li .set_icon {
  fill: #1d4ed8 !important;
}
html[data-ui-theme="saas"] .edit_resume .set_list > li:hover .set_btn b,
html[data-ui-theme="saas"] .edit_resume .set_list > li:hover .click_btn b {
  color: #1d4ed8 !important;
}
html[data-ui-theme="saas"] .edit_resume .set_list > li:hover .set_icon {
  fill: #1d4ed8 !important;
}
html[data-ui-theme="saas"] .edit_resume .set_list > li:hover .set_btn,
html[data-ui-theme="saas"] .edit_resume .set_list > li:hover .click_btn {
  box-shadow: 0 6px 16px rgba(15, 23, 42, 0.08) !important;
}
html[data-ui-theme="saas"] .edit_resume .set_box {
  border: 1px solid #e5e7eb !important;
  box-shadow: 0 14px 34px rgba(15, 23, 42, 0.12) !important;
}
html[data-ui-theme="saas"] .edit_resume .set_box .set_page li h5 {
  color: #374151 !important;
}
html[data-ui-theme="saas"] .edit_resume .set_box .set_page li h5 b {
  color: #1d4ed8 !important;
}
html[data-ui-theme="saas"] .edit_resume .skin_list .active,
html[data-ui-theme="saas"] .edit_resume .skin_list .active:hover {
  box-shadow:
    0 0 0 2px #fff,
    0 0 0 4px #1d4ed8 !important;
}
html[data-ui-theme="saas"] .edit_resume .make_skin {
  box-shadow: inset 0 0 0 1px #e5e7eb !important;
}

/* 顶栏右侧按钮组 */
html[data-ui-theme="saas"] .edit_resume .get_list {
  border-color: #e5e7eb !important;
  background: #fff !important;
  box-shadow: 0 4px 14px rgba(15, 23, 42, 0.06) !important;
}
html[data-ui-theme="saas"] .edit_resume .get_list li {
  color: #4b5563 !important;
}
html[data-ui-theme="saas"] .edit_resume .get_list li i.el-icon {
  color: #64748b !important;
}
html[data-ui-theme="saas"] .edit_resume .get_list li:hover {
  color: #1d4ed8 !important;
  background: #f3f6ff !important;
  box-shadow: none !important;
}
html[data-ui-theme="saas"] .edit_resume .get_list li:hover i.el-icon {
  color: #1d4ed8 !important;
}
html[data-ui-theme="saas"] .edit_resume .get_list li.active {
  color: #fff !important;
  background: linear-gradient(135deg, #1e40af, #1d4ed8) !important;
  box-shadow: 0 4px 12px rgba(29, 78, 216, 0.25) !important;
}
html[data-ui-theme="saas"] .edit_resume .get_list li.active i.el-icon {
  color: #fff !important;
}
html[data-ui-theme="saas"] .edit_resume .get_list li.active:hover {
  background: linear-gradient(135deg, #1e3a8a, #1e40af) !important;
}
html[data-ui-theme="saas"]
  .edit_resume
  .get_list
  li.theme_action
  .theme_trigger {
  color: #4b5563 !important;
}
html[data-ui-theme="saas"]
  .edit_resume
  .get_list
  li.theme_action:hover
  .theme_trigger {
  color: #1d4ed8 !important;
}
html[data-ui-theme="saas"]
  .edit_resume
  .get_list
  li.theme_action
  .theme_trigger
  i.el-icon {
  color: inherit !important;
}

/* 纸张与右栏卡片 */
html[data-ui-theme="saas"] .edit_resume .edit_main .tpl_box {
  border: 1px solid #e5e7eb !important;
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.08) !important;
}
html[data-ui-theme="saas"] .edit_resume .edit_main .tpl_box .switch-hint {
  background: #fff !important;
  color: #1d4ed8 !important;
  border: 1px solid #e5e7eb;
  box-shadow: 0 4px 14px rgba(15, 23, 42, 0.1);
}
html[data-ui-theme="saas"] .edit_resume .page_r_box {
  border-color: #e5e7eb !important;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06) !important;
}
html[data-ui-theme="saas"] .edit_resume .page_r_box:hover {
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.09) !important;
}
html[data-ui-theme="saas"] .edit_resume .page_r_box h4 {
  color: #111827 !important;
  border-bottom-color: #f1f5f9 !important;
}
html[data-ui-theme="saas"] .edit_resume .page_r_box h4:before {
  background: linear-gradient(180deg, #1d4ed8, #1e40af) !important;
}
html[data-ui-theme="saas"] .edit_resume .qa_list {
  border-top-color: #f1f5f9 !important;
}
html[data-ui-theme="saas"] .edit_resume .qa_list dt {
  color: #374151 !important;
}
html[data-ui-theme="saas"] .edit_resume .qa_list dt i {
  color: #9ca3af !important;
}
html[data-ui-theme="saas"] .edit_resume .qa_list dd {
  color: #6b7280 !important;
}
html[data-ui-theme="saas"] .edit_resume .qa_list.active dt,
html[data-ui-theme="saas"] .edit_resume .qa_list.active dt i {
  color: #1d4ed8 !important;
}

/* 我的简历列表 */
html[data-ui-theme="saas"] .edit_resume .rs-add {
  border-color: #1d4ed8 !important;
  color: #1d4ed8 !important;
}
html[data-ui-theme="saas"] .edit_resume .rs-add:hover:not(:disabled) {
  background: #1d4ed8 !important;
  border-color: #1d4ed8 !important;
  color: #fff !important;
}
html[data-ui-theme="saas"] .edit_resume .rs-item {
  border-color: #eef1f5 !important;
}
html[data-ui-theme="saas"] .edit_resume .rs-item:hover {
  border-color: #bfd3f7 !important;
  box-shadow: 0 3px 12px rgba(29, 78, 216, 0.08) !important;
}
html[data-ui-theme="saas"] .edit_resume .rs-item.active {
  border-color: #1d4ed8 !important;
  background: #eff6ff !important;
}
html[data-ui-theme="saas"] .edit_resume .rs-name {
  color: #111827 !important;
}
html[data-ui-theme="saas"] .edit_resume .rs-item.active .rs-name {
  color: #1d4ed8 !important;
}
html[data-ui-theme="saas"] .edit_resume .rs-op:hover {
  color: #1d4ed8 !important;
  background: #eff6ff !important;
}
html[data-ui-theme="saas"] .edit_resume .rs-op.danger:hover {
  color: #dc2626 !important;
  background: #fef2f2 !important;
}
html[data-ui-theme="saas"] .edit_resume .rs-empty {
  color: #9ca3af !important;
}
html[data-ui-theme="saas"] .edit_resume .rs-rename .el-input__wrapper {
  border-color: #e5e7eb !important;
  background-color: #f9fafb !important;
}
html[data-ui-theme="saas"] .edit_resume .rs-rename .el-input__wrapper.is-focus {
  border-color: #1d4ed8 !important;
  background-color: #fff !important;
}

/* A4 分页线 */
html[data-ui-theme="saas"] .edit_resume .page_line li {
  background-color: #e5e7eb !important;
}
html[data-ui-theme="saas"] .edit_resume .page_line li .page_num {
  color: #374151 !important;
}
html[data-ui-theme="saas"] .edit_resume .page_line li .page_num .orange {
  color: #1d4ed8 !important;
}
html[data-ui-theme="saas"] .edit_resume .page_line li .pl-hint {
  color: #9ca3af !important;
}
html[data-ui-theme="saas"] .edit_resume .page_line li .set_onepage {
  color: #1d4ed8 !important;
}
html[data-ui-theme="saas"] .edit_resume .page_line li .set_onepage:hover {
  color: #1e40af !important;
}

/* 底部编辑面板 */
html[data-ui-theme="saas"] .edit_resume .edit_all {
  border-top: 1px solid #e5e7eb !important;
  box-shadow: 0 -8px 24px rgba(15, 23, 42, 0.08) !important;
}
html[data-ui-theme="saas"] .edit_resume .edit_all .edit_box .close {
  color: #1d4ed8 !important;
  border: 1px solid #e5e7eb !important;
  box-shadow: 0 4px 14px rgba(15, 23, 42, 0.1) !important;
}
html[data-ui-theme="saas"] .edit_resume .edit_all .edit_box .close:hover {
  color: #1e40af !important;
}
html[data-ui-theme="saas"] .edit_resume .save_tip {
  color: #1d4ed8 !important;
  border: 1px solid #e5e7eb !important;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.12) !important;
}
html[data-ui-theme="saas"] .edit_resume .edit_tab li {
  border-bottom-color: #eef1f5 !important;
}
html[data-ui-theme="saas"] .edit_resume .edit_tab li b {
  color: #374151 !important;
}
html[data-ui-theme="saas"] .edit_resume .edit_tab li:hover b {
  color: #1d4ed8 !important;
}
html[data-ui-theme="saas"] .edit_resume .edit_tab li.active {
  border-bottom-color: #1d4ed8 !important;
}
html[data-ui-theme="saas"] .edit_resume .edit_tab li.active b {
  color: #1d4ed8 !important;
}
html[data-ui-theme="saas"] .edit_resume .edit_tab li .tab_dot {
  background: #1d4ed8 !important;
}
html[data-ui-theme="saas"] .edit_resume .edit_tab li .tab_dot.off {
  background: #d1d5db !important;
}
html[data-ui-theme="saas"] .edit_resume .edit_tab li.active .tab_dot {
  box-shadow:
    inset 0 0 0 3px rgba(255, 255, 255, 0.35),
    0 0 0 2px rgba(29, 78, 216, 0.3) !important;
}
html[data-ui-theme="saas"] .edit_resume .edit_tab li .btn_prev,
html[data-ui-theme="saas"] .edit_resume .edit_tab li .btn_next,
html[data-ui-theme="saas"] .edit_resume .edit_tab li .btn_edit {
  color: #1d4ed8 !important;
}
html[data-ui-theme="saas"] .edit_resume .edit_b_list::-webkit-scrollbar-track {
  background-color: #eef1f5;
}
html[data-ui-theme="saas"] .edit_resume .edit_b_list::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
}

/* 表单 */
html[data-ui-theme="saas"] .edit_resume .info_tip {
  color: #6b7280 !important;
}
html[data-ui-theme="saas"] .edit_resume .info_tip i.el-icon {
  color: #1d4ed8 !important;
}
html[data-ui-theme="saas"] .edit_resume .info_list li > b {
  color: #374151 !important;
}
html[data-ui-theme="saas"] .edit_resume .edit_b_list .el-input__wrapper,
html[data-ui-theme="saas"] .edit_resume .edit_b_list .el-select__wrapper {
  border-color: #e5e7eb !important;
  background-color: #f9fafb !important;
}
html[data-ui-theme="saas"] .edit_resume .edit_b_list .el-input__wrapper:hover {
  border-color: #bfd3f7 !important;
}
html[data-ui-theme="saas"]
  .edit_resume
  .edit_b_list
  .el-input__wrapper.is-focus,
html[data-ui-theme="saas"]
  .edit_resume
  .edit_b_list
  .el-select__wrapper.is-focused {
  border-color: #1d4ed8 !important;
  background-color: #fff !important;
}
html[data-ui-theme="saas"] .edit_resume .edit_b_list .el-input__inner {
  color: #111827 !important;
}
html[data-ui-theme="saas"] .edit_resume .edit_b_content {
  border-top-color: #e5e7eb !important;
}
html[data-ui-theme="saas"] .edit_resume .rich-editor {
  border-color: #e5e7eb !important;
}
html[data-ui-theme="saas"] .edit_resume .rich-toolbar {
  border-bottom-color: #f1f5f9 !important;
}

/* 主按钮（深蓝） */
html[data-ui-theme="saas"] .edit_resume .photo_upload {
  border-color: #1d4ed8 !important;
  background-color: #1d4ed8 !important;
}
html[data-ui-theme="saas"] .edit_resume .photo_upload:hover {
  border-color: #1e40af !important;
  background-color: #1e40af !important;
}
html[data-ui-theme="saas"] .edit_resume .qm-add-pill {
  background: #1d4ed8 !important;
}
html[data-ui-theme="saas"] .edit_resume .qm-add-pill:hover {
  background: #1e40af !important;
}

/* 次按钮（灰） */
html[data-ui-theme="saas"] .edit_resume .btn_add .el-button,
html[data-ui-theme="saas"] .edit_resume .qm-add-outline {
  border-color: #d1d5db !important;
  color: #374151 !important;
  background: #fff !important;
}
html[data-ui-theme="saas"] .edit_resume .btn_add .el-button:hover,
html[data-ui-theme="saas"] .edit_resume .qm-add-outline:hover {
  border-color: #9ca3af !important;
  color: #111827 !important;
  background: #f3f4f6 !important;
}
html[data-ui-theme="saas"] .edit_resume .btn_box .btn_up {
  border-color: #d1d5db !important;
  color: #374151 !important;
}
html[data-ui-theme="saas"] .edit_resume .btn_box .btn_up:hover {
  border-color: #9ca3af !important;
  color: #111827 !important;
  background: #f3f4f6 !important;
}

/* 危险色（仅删除） */
html[data-ui-theme="saas"] .edit_resume .btn_box .btn_remove {
  border-color: #dc2626 !important;
  color: #dc2626 !important;
}
html[data-ui-theme="saas"] .edit_resume .btn_box .btn_remove:hover {
  background: #dc2626 !important;
  color: #fff !important;
}
html[data-ui-theme="saas"] .edit_resume .qm-skill-head .el-icon,
html[data-ui-theme="saas"] .edit_resume .jineng_list li .del,
html[data-ui-theme="saas"] .edit_resume .qm-score-del {
  color: #dc2626 !important;
}

/* 模块条目 / 技能 / 标签 */
html[data-ui-theme="saas"] .edit_resume .tab_rename .el-input__wrapper {
  box-shadow: 0 0 0 1px #1d4ed8 !important;
}
html[data-ui-theme="saas"] .edit_resume .btn_more {
  border-color: #e5e7eb !important;
  color: #6b7280 !important;
  background: #fff !important;
}
html[data-ui-theme="saas"] .edit_resume .btn_more:hover {
  color: #1d4ed8 !important;
  border-color: #1d4ed8 !important;
}
html[data-ui-theme="saas"] .edit_resume .line_box {
  border-bottom-color: #eef1f5 !important;
}
html[data-ui-theme="saas"] .edit_resume .module_ctrl_tip .ctrl_arrow,
html[data-ui-theme="saas"] .edit_resume .module_ctrl_tip .ctrl_edit {
  color: #1d4ed8 !important;
}
html[data-ui-theme="saas"] .edit_resume .qm-entry {
  border-color: #eef1f5 !important;
}
html[data-ui-theme="saas"] .edit_resume .qm-entry:hover {
  border-color: #bfd3f7 !important;
}
html[data-ui-theme="saas"] .edit_resume .qm-entry.on {
  border-color: #1d4ed8 !important;
  background: #eff6ff !important;
}
html[data-ui-theme="saas"] .edit_resume .qm-entry-ops .el-icon:hover {
  color: #1d4ed8 !important;
}
html[data-ui-theme="saas"] .edit_resume .qm-entry-ops .el-icon.danger:hover {
  color: #dc2626 !important;
}
html[data-ui-theme="saas"] .edit_resume .qm-skill-bar span {
  color: #1d4ed8 !important;
}
html[data-ui-theme="saas"] .edit_resume .qm-list-empty {
  color: #9ca3af !important;
}
html[data-ui-theme="saas"] .edit_resume .qm-list-hd {
  color: #111827 !important;
}
html[data-ui-theme="saas"] .edit_resume .qm-divider {
  border-top-color: #eef1f5 !important;
}
html[data-ui-theme="saas"] .edit_resume .qm-divider-orange {
  border-top-color: #e5e7eb !important;
}
html[data-ui-theme="saas"] .edit_resume .tag_box span {
  color: #6b7280 !important;
  border-color: #e5e7eb !important;
  background: #fff !important;
}
html[data-ui-theme="saas"] .edit_resume .tag_box span:hover {
  color: #1d4ed8 !important;
  border-color: #1d4ed8 !important;
}
html[data-ui-theme="saas"] .edit_resume .tag_box span.active {
  color: #fff !important;
  border-color: #1d4ed8 !important;
  background-color: #1d4ed8 !important;
}

/* ============ 预览区「点击编辑」交互（仅编辑器内，不影响导出） ============ */
#resume_pc .r-basic,
#resume_pc .r-module {
  cursor: pointer;
  border-radius: 4px;
  transition:
    background-color 0.15s ease,
    box-shadow 0.15s ease;
}
#resume_pc .r-intention {
  cursor: pointer;
  transition: color 0.15s ease;
}
#resume_pc .r-basic:hover,
#resume_pc .r-module:hover {
  background-color: rgba(19, 216, 167, 0.06);
  box-shadow: 0 0 0 1px rgba(19, 216, 167, 0.28);
}
#resume_pc .r-intention:hover {
  color: #0eaa83;
}
html[data-ui-theme="saas"] #resume_pc .r-basic:hover,
html[data-ui-theme="saas"] #resume_pc .r-module:hover {
  background-color: rgba(29, 78, 216, 0.05);
  box-shadow: 0 0 0 1px rgba(29, 78, 216, 0.22);
}
html[data-ui-theme="saas"] #resume_pc .r-intention:hover {
  color: #1d4ed8;
}

/* 导出进度提示 */
.edit_resume .export_progress_mask {
  position: fixed;
  inset: 0;
  z-index: 3000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(15, 23, 42, 0.35);
}
.edit_resume .export_progress_card {
  width: 340px;
  padding: 22px 24px 18px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 18px 48px rgba(0, 0, 0, 0.22);
  text-align: center;
}
.edit_resume .export_progress_icon {
  font-size: 26px;
  color: #13d8a7;
  margin-bottom: 8px;
}
.edit_resume .export_progress_title {
  margin-bottom: 14px;
  font-size: 15px;
  font-weight: bold;
  color: #333;
}
.edit_resume .export_progress_stage {
  margin-top: 10px;
  font-size: 12px;
  color: #888;
}
html[data-ui-theme="saas"] .edit_resume .export_progress_icon {
  color: #1d4ed8;
}
html[data-ui-theme="saas"] .edit_resume .export_progress_card {
  border: 1px solid #e5e7eb;
  box-shadow: 0 18px 48px rgba(15, 23, 42, 0.18);
}

/* 桌面版导出目录选择 */
.export-dir-check {
  display: block;
  margin-bottom: 14px;
}

/* ============ 更换模板入口（顶栏） ============ */
.edit_resume .set_list > li.template_action .set_btn {
  display: block;
}
.edit_resume .set_list > li.template_action .set_btn b {
  white-space: nowrap;
}
.tpl_cur {
  color: #999;
  font-size: 12px;
}

/* ============ 左侧深色栏模板的点击编辑提示（仅编辑器内） ============ */
#resume_pc.tpl-sidebar .r-side-block,
#resume_pc.tpl-sidebar .r-side-module,
#resume_pc.tpl-sidebar .r-side-yixiang,
#resume_pc.tpl-sidebar .r-side-photo {
  cursor: pointer;
  border-radius: 4px;
  transition:
    background-color 0.15s ease,
    box-shadow 0.15s ease;
}
#resume_pc.tpl-sidebar .r-side-block:hover {
  background-color: rgba(255, 255, 255, 0.08);
}
#resume_pc.tpl-sidebar .r-side-module:hover {
  background-color: rgba(19, 216, 167, 0.05);
  box-shadow: 0 0 0 1px rgba(19, 216, 167, 0.25);
}
#resume_pc.tpl-sidebar .r-side-yixiang:hover {
  color: #0eaa83;
}
html[data-ui-theme="saas"] #resume_pc.tpl-sidebar .r-side-module:hover {
  background-color: rgba(29, 78, 216, 0.05);
  box-shadow: 0 0 0 1px rgba(29, 78, 216, 0.22);
}
html[data-ui-theme="saas"] #resume_pc.tpl-sidebar .r-side-yixiang:hover {
  color: #1d4ed8;
}

/* ============ 简约标签模板的点击编辑提示（仅编辑器内） ============ */
#resume_pc.tpl-label .r-label-module,
#resume_pc.tpl-label .r-label-photo {
  cursor: pointer;
  border-radius: 4px;
  transition:
    background-color 0.15s ease,
    box-shadow 0.15s ease;
}
#resume_pc.tpl-label .r-label-module:hover {
  background-color: rgba(19, 216, 167, 0.045);
  box-shadow: 0 0 0 1px rgba(19, 216, 167, 0.22);
}
html[data-ui-theme="saas"] #resume_pc.tpl-label .r-label-module:hover {
  background-color: rgba(29, 78, 216, 0.045);
  box-shadow: 0 0 0 1px rgba(29, 78, 216, 0.2);
}
</style>
