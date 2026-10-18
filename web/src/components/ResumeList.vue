<template>
  <div class="page_r_box resume-list-card">
    <h4>
      <span class="section-title">我的简历</span>
      <button
        type="button"
        class="rs-add"
        :disabled="creating"
        :title="creating ? '正在创建简历' : '新建一份空白简历'"
        @click="onCreate"
      >
        <el-icon><Plus /></el-icon>
        新建
      </button>
    </h4>

    <div
      class="rs-body"
      v-loading="ctx.state.resumeListLoading"
      element-loading-text="简历列表加载中..."
    >
      <div v-if="resumes.length" class="rs-scroll">
        <div
          v-for="item in resumes"
          :key="item.resumeId"
          class="rs-item"
          :class="{ active: item.resumeId === ctx.resumeId }"
          :title="item.name || '未命名简历'"
          @click="onItemClick(item)"
        >
          <el-input
            v-if="renameId === item.resumeId"
            ref="renameInput"
            v-model="renameVal"
            class="rs-rename"
            size="small"
            maxlength="49"
            @click.stop
            @keyup.enter="commitRename(item)"
            @keyup.esc="cancelRename"
            @blur="commitRename(item)"
          />
          <div
            v-else
            class="rs-name"
            title="双击重命名"
            @dblclick.stop="onNameDblclick(item)"
          >
            {{ item.name || "未命名简历" }}
          </div>
          <div class="rs-job" :class="{ 'is-empty': !item.job }">
            {{ item.job || "未填写求职意向" }}
          </div>
          <div class="rs-time">
            <el-icon><Clock /></el-icon>
            {{ fmtTime(item.updateTime) }}
          </div>

          <span class="rs-ops" @click.stop>
            <el-icon class="rs-op" title="复制简历" @click.stop="onCopy(item)"
              ><CopyDocument
            /></el-icon>
            <el-icon
              class="rs-op danger"
              title="删除简历"
              @click.stop="onDelete(item)"
              ><Delete
            /></el-icon>
          </span>
        </div>
      </div>
      <p v-else-if="!ctx.state.resumeListLoading" class="rs-empty">
        暂无简历，点击右上角新建
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, inject, onMounted, onBeforeUnmount, nextTick } from "vue";
import { ElMessageBox } from "element-plus";
import { Plus, Clock, CopyDocument, Delete } from "@element-plus/icons-vue";
import { formatDateTime } from "../utils";

const ctx = inject("ctx", null);

const creating = ref(false);
// 防止切换/复制过程中重复触发
const busy = ref(false);

// 双击名称行内重命名
const renameId = ref("");
const renameVal = ref("");
const renameInput = ref(null);
let blurHandled = false;
// 单击切换延迟，用于区分单击/双击（双击改名时不切换简历）
let switchTimer = null;
const CLICK_DELAY = 220;

const resumes = computed(() => {
  const list = ctx && ctx.state ? ctx.state.resumes : null;
  return Array.isArray(list) ? list : [];
});

function fmtTime(v) {
  if (v === undefined || v === null || v === "") return "";
  try {
    return formatDateTime(v) || "";
  } catch (e) {
    return "";
  }
}

async function onCreate() {
  if (!ctx || creating.value || ctx.state.switching) return;
  creating.value = true;
  try {
    await ctx.createResume();
  } catch (e) {
    // 成功 / 失败提示由 App.vue 统一负责，此处静默
  } finally {
    creating.value = false;
  }
}

async function onSwitch(item) {
  if (!ctx || busy.value || ctx.state.switching) return;
  // 当前项不重复请求
  if (item.resumeId === ctx.resumeId) return;
  busy.value = true;
  try {
    await ctx.switchResume(item.resumeId);
  } catch (e) {
    // 提示由 App.vue 负责
  } finally {
    busy.value = false;
  }
}

// 单击延迟切换，给双击重命名留出识别时间
function onItemClick(item) {
  if (renameId.value) return;
  if (switchTimer) clearTimeout(switchTimer);
  switchTimer = setTimeout(() => {
    switchTimer = null;
    onSwitch(item);
  }, CLICK_DELAY);
}

async function onNameDblclick(item) {
  if (switchTimer) {
    clearTimeout(switchTimer);
    switchTimer = null;
  }
  await startRename(item);
}

async function startRename(item) {
  if (!ctx || ctx.state.switching) return;
  renameId.value = item.resumeId;
  renameVal.value = item.name || "";
  blurHandled = false;
  await nextTick();
  const input = Array.isArray(renameInput.value)
    ? renameInput.value[0]
    : renameInput.value;
  if (input && input.focus) input.focus();
  if (input && input.select) input.select();
}

function commitRename(item) {
  if (blurHandled) return;
  blurHandled = true;
  const val = renameVal.value.trim();
  const old = (item.name || "").trim();
  renameId.value = "";
  if (val && val !== old && typeof ctx.renameResume === "function") {
    Promise.resolve(ctx.renameResume(item.resumeId, val)).catch(() => {});
  }
}

function cancelRename() {
  blurHandled = true;
  renameId.value = "";
}

async function onCopy(item) {
  if (!ctx || busy.value || ctx.state.switching) return;
  busy.value = true;
  try {
    await ctx.copyResume(item.resumeId);
  } catch (e) {
    // 提示由 App.vue 负责
  } finally {
    busy.value = false;
  }
}

function onDelete(item) {
  if (!ctx || ctx.state.switching) return;
  const name = item.name || "未命名简历";
  ElMessageBox.confirm(
    `确定删除简历「${name}」吗？删除后不可恢复。`,
    "删除简历",
    {
      type: "warning",
      confirmButtonText: "删除",
      cancelButtonText: "取消",
    },
  )
    .then(() => ctx.deleteResume(item.resumeId))
    .catch(() => {
      // 取消与请求失败均静默，提示由 App.vue 负责
    });
}

onMounted(() => {
  try {
    if (!ctx) return;
    const list = ctx.state ? ctx.state.resumes : null;
    if (
      (!Array.isArray(list) || list.length === 0) &&
      typeof ctx.refreshResumeList === "function"
    ) {
      Promise.resolve(ctx.refreshResumeList()).catch(() => {});
    }
  } catch (e) {
    // 列表刷新失败不阻塞其余卡片渲染
  }
});

onBeforeUnmount(() => {
  if (switchTimer) clearTimeout(switchTimer);
});
</script>

<style scoped>
.resume-list-card {
  margin-bottom: 14px;
}

/* ===== 标题右侧「新建」按钮 ===== */
.rs-add {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  flex: 0 0 auto;
  height: 26px;
  padding: 0 10px;
  border: 1px solid #13d8a7;
  border-radius: 13px;
  background: #fff;
  color: #0eaa83;
  font-size: 12px;
  line-height: 24px;
  cursor: pointer;
  outline: none;
  transition:
    background 0.18s ease,
    color 0.18s ease,
    border-color 0.18s ease;
}
.rs-add .el-icon {
  font-size: 13px;
}
.rs-add:hover:not(:disabled) {
  background: #13d8a7;
  border-color: #13d8a7;
  color: #fff;
}
.rs-add:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

/* ===== 列表容器 ===== */
.rs-body {
  position: relative;
  min-height: 104px;
  padding: 12px 14px 14px;
}
.rs-scroll {
  max-height: 280px;
  overflow-y: auto;
  padding-right: 4px;
  scrollbar-width: thin;
  scrollbar-color: #d5dde5 transparent;
}
.rs-scroll::-webkit-scrollbar {
  width: 6px;
}
.rs-scroll::-webkit-scrollbar-track {
  background: transparent;
}
.rs-scroll::-webkit-scrollbar-thumb {
  background: #d5dde5;
  border-radius: 3px;
}
.rs-scroll::-webkit-scrollbar-thumb:hover {
  background: #b9c4cf;
}

/* ===== 单条简历 ===== */
.rs-item {
  position: relative;
  padding: 10px 12px;
  margin-bottom: 8px;
  border: 1px solid #eef1f5;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  transition:
    border-color 0.18s ease,
    background 0.18s ease,
    box-shadow 0.18s ease;
}
.rs-item:last-child {
  margin-bottom: 0;
}
.rs-item:hover {
  border-color: #9fe8d6;
  box-shadow: 0 3px 10px rgba(19, 216, 167, 0.08);
}
.rs-item.active {
  border-color: #13d8a7;
  background: #f0fffa;
}
.rs-name {
  padding-right: 6px;
  font-size: 14px;
  font-weight: 700;
  line-height: 20px;
  color: #202936;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: text;
  user-select: none;
}
.rs-item.active .rs-name {
  color: #0eaa83;
}
/* 双击重命名的行内输入框 */
.rs-rename {
  margin: -3px 0 1px;
}
.rs-rename :deep(.el-input__inner) {
  font-size: 14px;
  font-weight: 700;
  color: #202936;
}
.rs-rename :deep(.el-input__wrapper) {
  padding: 0 8px;
}
.rs-job {
  margin-top: 2px;
  font-size: 12px;
  line-height: 18px;
  color: #8a95a3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.rs-job.is-empty {
  color: #b3bcc6;
}
.rs-time {
  display: flex;
  align-items: center;
  gap: 3px;
  margin-top: 4px;
  font-size: 11px;
  line-height: 16px;
  color: #aab2bc;
}
.rs-time .el-icon {
  font-size: 11px;
}

/* ===== hover 操作按钮 ===== */
.rs-ops {
  position: absolute;
  right: 8px;
  top: 8px;
  display: flex;
  align-items: center;
  gap: 1px;
  padding: 2px 3px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 2px 8px rgba(31, 45, 61, 0.12);
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.15s ease;
}
.rs-item:hover .rs-ops,
.rs-item.active:hover .rs-ops {
  opacity: 1;
  visibility: visible;
}
.rs-op {
  padding: 3px;
  border-radius: 4px;
  font-size: 24px;
  color: #8a95a3;
  cursor: pointer;
  transition:
    color 0.15s ease,
    background 0.15s ease;
}
.rs-op:hover {
  color: #13d8a7;
  background: #eefaf6;
}
.rs-op.danger:hover {
  color: #f56c6c;
  background: #fef0f0;
}

/* ===== 空态 ===== */
.rs-empty {
  margin: 0;
  padding: 30px 0 24px;
  text-align: center;
  font-size: 13px;
  line-height: 20px;
  color: #aab2bc;
}

:deep(.el-loading-mask) {
  border-radius: 8px;
}
</style>
