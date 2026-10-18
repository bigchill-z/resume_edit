<template>
  <div class="edit_all" :class="{ edit_show: showEdit }">
    <div class="edit_box">
      <div
        class="close"
        :title="showEdit ? '收起' : '展开'"
        @click="showEdit = !showEdit"
      >
        <el-icon><ArrowUp v-if="!showEdit" /><ArrowDown v-else /></el-icon>
      </div>
      <div class="save_tip" :class="{ save_tip_show: showSaveTip }">
        已自动保存
      </div>

      <div class="edit_top">
        <ul class="edit_tab">
          <li :class="{ active: tabIndex === 0 }" @click="tabFn(0)">
            <b>基本信息</b>
          </li>
          <li
            v-for="(m, i) in moduleList"
            :key="m.moduleName"
            :class="{ active: tabIndex === i + 1, module_hide: !m.visible }"
            @click="tabFn(i + 1)"
          >
            <span
              class="tab_dot"
              :class="{ off: !m.visible }"
              :title="m.visible ? '点击关闭模块' : '点击启用模块'"
              @click.stop="onVisible(m, !m.visible)"
            ></span>
            <el-input
              v-if="renameKey === m.moduleName"
              ref="renameInput"
              v-model="renameVal"
              class="tab_rename"
              size="small"
              maxlength="8"
              @click.stop
              @keyup.enter="commitRename(m)"
              @keyup.esc="cancelRename"
              @blur="commitRename(m)"
            />
            <b
              v-else
              title="双击可重命名模块"
              @dblclick.stop="startRename(m)"
              >{{ m.moduleValue || "无标题" }}</b
            >
            <el-icon
              class="btn_edit"
              title="修改模块标题"
              @click.stop="startRename(m)"
              ><Edit
            /></el-icon>
            <div
              v-if="i > 0"
              class="btn_prev"
              title="前移模块"
              @click.stop="moveModule(i, -1)"
            >
              <el-icon><ArrowLeftBold /></el-icon>
            </div>
            <div
              v-if="i < moduleList.length - 1"
              class="btn_next"
              title="后移模块"
              @click.stop="moveModule(i, 1)"
            >
              <el-icon><ArrowRightBold /></el-icon>
            </div>
          </li>
        </ul>
      </div>

      <div class="edit_b">
        <div class="edit_b_list">
          <!-- ============ 基本信息 ============ -->
          <div v-if="tabIndex === 0">
            <p class="info_tip">
              <el-icon><InfoFilled /></el-icon>
              填写的信息会自动排版在简历上，不需要的信息可以选择不填或删除内容。
            </p>
            <ul class="info_list clearfix" :class="{ hide_more: hideMore }">
              <li>
                <b>姓名</b>
                <el-input
                  v-model="basic.name"
                  maxlength="49"
                  @input="ctx.saveBasic()"
                />
              </li>
              <li>
                <b>性别</b>
                <el-select v-model="basic.sex" @change="ctx.saveBasic()">
                  <el-option :value="0" label="不填" />
                  <el-option :value="1" label="男" />
                  <el-option :value="2" label="女" />
                </el-select>
              </li>
              <li>
                <b>出生年月</b>
                <el-date-picker
                  v-model="basic.birthday"
                  type="month"
                  value-format="YYYY-MM"
                  placeholder="选择月份"
                  class="birthday_picker"
                  @change="ctx.saveBasic()"
                />
                <el-switch
                  v-model="basic.isAge"
                  class="age_switch"
                  active-color="#13ce66"
                  @change="ctx.saveBasic()"
                />
                <span class="age_text">转年龄</span>
              </li>
              <li>
                <b>照片</b>
                <span class="photo_upload" @click="photoInput.click()">
                  {{ uploading ? "上传中..." : "上传照片" }}
                  <input
                    ref="photoInput"
                    type="file"
                    accept="image/*"
                    @change="onPhotoChange"
                  />
                </span>
                <el-checkbox
                  v-model="basic.photoShow"
                  class="photo_check"
                  @change="ctx.saveBasic()"
                  >显示</el-checkbox
                >
                <img
                  v-if="basic.photo"
                  :src="basic.photo"
                  class="photo_preview"
                  alt="照片"
                />
              </li>
              <li>
                <b>工作年限</b>
                <el-select v-model="basic.workYears" @change="ctx.saveBasic()">
                  <el-option value="" label="不填" />
                  <el-option :value="0" label="应届生" />
                  <el-option
                    v-for="n in 15"
                    :key="n"
                    :value="n"
                    :label="n + '年经验'"
                  />
                </el-select>
              </li>
              <li>
                <b>联系电话</b>
                <el-input v-model="basic.mobile" @input="ctx.saveBasic()" />
              </li>
              <li>
                <b>联系邮箱</b>
                <el-input v-model="basic.email" @input="ctx.saveBasic()" />
              </li>
              <li>
                <b>婚姻状况</b>
                <el-select v-model="basic.hunyin" @change="ctx.saveBasic()">
                  <el-option :value="0" label="不填" />
                  <el-option :value="1" label="未婚" />
                  <el-option :value="2" label="已婚" />
                </el-select>
              </li>
              <li class="li_hw">
                <b>身高/体重</b>
                <el-input
                  v-model="basic.height"
                  class="hw_input"
                  placeholder="身高"
                  @input="ctx.saveBasic()"
                /><span class="hw_unit">cm</span>
                <el-input
                  v-model="basic.weight"
                  class="hw_input"
                  placeholder="体重"
                  @input="ctx.saveBasic()"
                /><span class="hw_unit">kg</span>
              </li>
              <li>
                <b>民族</b>
                <el-input
                  v-model="basic.minzu"
                  placeholder="请输入民族"
                  @input="ctx.saveBasic()"
                />
              </li>
              <li>
                <b>籍贯</b>
                <el-input v-model="basic.jiguan" @input="ctx.saveBasic()" />
              </li>
              <li>
                <b>政治面貌</b>
                <el-select v-model="basic.zhengzhi" @change="ctx.saveBasic()">
                  <el-option value="" label="不填" />
                  <el-option value="群众" label="群众" />
                  <el-option value="共青团员" label="共青团员" />
                  <el-option value="中共党员" label="中共党员" />
                  <el-option value="其他" label="其他" />
                </el-select>
              </li>
            </ul>
            <div class="line_box">
              <span class="btn_more" @click="hideMore = !hideMore">
                {{ hideMore ? "展开更多信息" : "收起更多信息" }}
                <el-icon
                  ><ArrowDown v-if="hideMore" /><ArrowUp v-else
                /></el-icon>
              </span>
            </div>

            <!-- 简历标题 / 简介（setData.title / slogan） -->
            <div class="qm-divider"></div>
            <div class="title_set_hd">简历标题与简介</div>
            <div class="qm-rows title_set_rows">
              <div class="qm-field">
                <label>显示标题</label>
                <el-switch
                  v-model="set.hasTitle"
                  @change="ctx.saveSet()"
                />
                <span class="title_switch_tip"
                  >经典单栏生效；简约标签模板始终显示</span
                >
              </div>
              <div class="qm-field title_input_field">
                <label>简历标题</label>
                <el-input
                  v-model="set.title"
                  maxlength="30"
                  placeholder="例如：个人简历"
                  @input="ctx.saveSet()"
                />
              </div>
              <div class="qm-field title_input_field">
                <label>简历简介</label>
                <el-input
                  v-model="set.slogan"
                  maxlength="60"
                  placeholder="例如：努力超越自己，每天进步一点点"
                  @input="ctx.saveSet()"
                />
              </div>
            </div>
          </div>

          <!-- ============ 模块表单 ============ -->
          <template v-else-if="activeModule">
            <p class="info_tip module_ctrl_tip">
              <el-icon><InfoFilled /></el-icon>
              模块名称上面的开关可以控制模块开启或关闭，
              <el-icon class="ctrl_arrow"><ArrowLeftBold /></el-icon>
              <el-icon class="ctrl_arrow"><ArrowRightBold /></el-icon>
              可以调整模块顺序，模块名称右边的
              <el-icon class="ctrl_edit"><Edit /></el-icon>
              可以修改模块名称。
            </p>

            <!-- 求职意向 -->
            <div v-if="activeModule.moduleName === 'yixiang'" class="qm-rows">
              <div class="qm-field">
                <label>求职意向</label>
                <el-input
                  v-model="activeModule.data.job"
                  placeholder="如：行政专员"
                  @input="ctx.saveModule(activeModule)"
                />
              </div>
              <div class="qm-field">
                <label>意向城市</label>
                <el-input
                  v-model="activeModule.data.city"
                  placeholder="如：上海"
                  @input="ctx.saveModule(activeModule)"
                />
              </div>
              <div class="qm-field">
                <label>期望薪资</label>
                <el-input
                  v-model="activeModule.data.money"
                  placeholder="如：15000/月"
                  @input="ctx.saveModule(activeModule)"
                />
              </div>
              <div class="qm-field">
                <label>到岗时间</label>
                <el-input
                  v-model="activeModule.data.joinTime"
                  placeholder="如：一个月内到岗"
                  @input="ctx.saveModule(activeModule)"
                />
              </div>
            </div>

            <!-- 报考信息 -->
            <template v-else-if="activeModule.moduleName === 'baokao'">
              <div class="qm-rows">
                <div class="qm-field">
                  <label>标题</label>
                  <el-input
                    v-model="activeModule.title"
                    placeholder="如：初试成绩"
                    @input="ctx.saveModule(activeModule)"
                  />
                </div>
                <div class="qm-field">
                  <label>院校</label>
                  <el-input
                    v-model="activeModule.name"
                    placeholder="报考院校"
                    @input="ctx.saveModule(activeModule)"
                  />
                </div>
                <div class="qm-field">
                  <label>专业</label>
                  <el-input
                    v-model="activeModule.major"
                    placeholder="报考专业"
                    @input="ctx.saveModule(activeModule)"
                  />
                </div>
              </div>
              <div class="qm-divider"></div>
              <div class="qm-scores">
                <div
                  v-for="(s, si) in activeModule.data"
                  :key="si"
                  class="qm-score"
                >
                  <el-input
                    v-model="s.name"
                    placeholder="科目"
                    class="qm-score-name"
                    @input="ctx.saveModule(activeModule)"
                  />
                  <el-input
                    v-model="s.score"
                    placeholder="分数"
                    class="qm-score-val"
                    @input="ctx.saveModule(activeModule)"
                  />
                  <el-icon
                    class="qm-score-del"
                    title="删除科目"
                    @click="removeScore(activeModule, si)"
                    ><Delete
                  /></el-icon>
                </div>
              </div>
              <el-button
                class="qm-add-outline"
                :icon="Plus"
                @click="addScore(activeModule)"
                >添加科目</el-button
              >
            </template>

            <!-- 条目数组类模块：左侧列表 + 右侧编辑 -->
            <div
              v-else-if="isArrayModule(activeModule.moduleName)"
              class="qm-dual"
            >
              <div class="qm-list">
                <div class="qm-list-hd">{{ activeModule.moduleValue }}列表</div>
                <div class="qm-list-bd">
                  <div
                    v-for="(item, idx) in activeModule.data"
                    :key="item.id"
                    class="qm-entry"
                    :class="{ on: idx === currentIdx }"
                    @click="currentIdx = idx"
                  >
                    <el-icon class="qm-entry-drag"><Rank /></el-icon>
                    <div class="qm-entry-name">
                      {{ item.name || "未填写" }}
                    </div>
                    <div class="qm-entry-sub">
                      {{ itemSub(activeModule, item) }} ·
                      {{ item.timeStart || "?" }}-{{
                        item.today ? "至今" : item.timeEnd || "?"
                      }}
                    </div>
                    <span class="qm-entry-ops" @click.stop>
                      <el-icon
                        title="上移"
                        :class="{ disabled: idx === 0 }"
                        @click="moveItem(activeModule, idx, -1)"
                        ><Top
                      /></el-icon>
                      <el-icon
                        title="下移"
                        :class="{
                          disabled: idx === activeModule.data.length - 1,
                        }"
                        @click="moveItem(activeModule, idx, 1)"
                        ><Bottom
                      /></el-icon>
                      <el-icon
                        title="删除"
                        class="danger"
                        @click="removeItem(activeModule, idx)"
                        ><Delete
                      /></el-icon>
                    </span>
                  </div>
                  <p v-if="!activeModule.data.length" class="qm-list-empty">
                    暂无条目，点击下方按钮添加
                  </p>
                </div>
                <p class="qm-drag-tip">
                  按住 <el-icon><Rank /></el-icon> 可以拖动顺序
                </p>
                <button
                  type="button"
                  class="qm-add-pill"
                  @click="addItem(activeModule)"
                >
                  <el-icon><Plus /></el-icon>
                  新增一条{{ activeModule.moduleValue }}
                </button>
              </div>

              <div class="qm-edit" v-if="currentItem">
                <div class="qm-rows">
                  <div class="qm-field">
                    <label>{{ itemLabels[activeModule.moduleName][0] }}</label>
                    <el-input
                      v-model="currentItem.name"
                      @input="ctx.saveModule(activeModule)"
                    />
                  </div>
                  <div class="qm-field">
                    <label>{{ itemLabels[activeModule.moduleName][1] }}</label>
                    <el-input
                      v-model="currentItem[jobKey(activeModule.moduleName)]"
                      @input="ctx.saveModule(activeModule)"
                    />
                  </div>
                  <div
                    v-if="activeModule.moduleName === 'jiaoyu'"
                    class="qm-field"
                  >
                    <label>学历</label>
                    <el-select
                      v-model="currentItem.xueli"
                      filterable
                      allow-create
                      default-first-option
                      placeholder="请选择或输入学历"
                      @change="ctx.saveModule(activeModule)"
                    >
                      <el-option
                        v-for="x in XUELI_OPTIONS"
                        :key="x"
                        :label="x"
                        :value="x"
                      />
                    </el-select>
                  </div>
                  <div class="qm-field qm-field-dates">
                    <label>在职时间</label>
                    <el-date-picker
                      v-model="currentItem.timeStart"
                      type="month"
                      value-format="YYYY-MM"
                      placeholder="开始时间"
                      class="qm-date"
                      @change="ctx.saveModule(activeModule)"
                    />
                    <el-date-picker
                      v-model="currentItem.timeEnd"
                      type="month"
                      value-format="YYYY-MM"
                      placeholder="结束时间"
                      :disabled="currentItem.today"
                      class="qm-date"
                      @change="ctx.saveModule(activeModule)"
                    />
                    <el-checkbox
                      v-model="currentItem.today"
                      @change="ctx.saveModule(activeModule)"
                      >至今</el-checkbox
                    >
                  </div>
                </div>
                <RichEditor
                  v-model="currentItem.content"
                  :height="235"
                  @change="ctx.saveModule(activeModule)"
                />
              </div>
            </div>

            <!-- 技能特长 -->
            <template v-else-if="activeModule.moduleName === 'jineng'">
              <RichEditor
                v-model="activeModule.content"
                :height="190"
                @change="ctx.saveModule(activeModule)"
              />
              <div class="qm-divider qm-divider-orange"></div>
              <div class="qm-skill-add">
                <el-input
                  v-model="newSkillName"
                  class="qm-skill-input"
                  placeholder="请输入自定义名称"
                  @keyup.enter="addSkill(activeModule)"
                />
                <el-button
                  class="qm-add-outline"
                  :icon="Plus"
                  @click="addSkill(activeModule)"
                  >添加自定义技能特长</el-button
                >
              </div>
              <div class="qm-skills">
                <div
                  v-for="(s, si) in activeModule.data"
                  :key="si"
                  class="qm-skill"
                >
                  <div class="qm-skill-head">
                    <b>{{ s.name || "未命名技能" }}</b>
                    <el-icon
                      class="danger"
                      title="删除"
                      @click="deleteSkill(activeModule, si)"
                      ><Delete
                    /></el-icon>
                  </div>
                  <div class="qm-skill-bar">
                    <el-slider
                      v-model="s.value"
                      :min="0"
                      :max="100"
                      :show-tooltip="false"
                      @change="ctx.saveModule(activeModule)"
                    />
                    <span>{{ s.value }}%</span>
                  </div>
                </div>
              </div>
            </template>

            <!-- 纯富文本模块 -->
            <template v-else>
              <RichEditor
                v-model="activeModule.content"
                :height="320"
                @change="ctx.saveModule(activeModule)"
              />
            </template>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, inject, watch, nextTick, onBeforeUnmount } from "vue";
import { ElMessage } from "element-plus";
import {
  ArrowDown,
  ArrowUp,
  ArrowLeftBold,
  ArrowRightBold,
  Delete,
  InfoFilled,
  Plus,
  Top,
  Bottom,
  Edit,
  Rank,
} from "@element-plus/icons-vue";
import RichEditor from "./RichEditor.vue";
import { uploadPhoto, unwrap } from "../api";

const ctx = inject("ctx");

const basic = computed(() => ctx.state.resume.basicInfo);
const set = computed(() => ctx.state.resume.setData);
const moduleList = computed(() => ctx.sortedModules);

const tabIndex = ref(0);
const showEdit = ref(false);
const showSaveTip = ref(false);
const uploading = ref(false);
const photoInput = ref(null);
const hideMore = ref(true);
const newSkillName = ref("");

// 双击重命名
const renameKey = ref("");
const renameVal = ref("");
const renameInput = ref(null);
let blurHandled = false;

// 数组类模块当前选中条目
const currentIdx = ref(0);

let tipTimer = null;
watch(
  () => ctx.state.lastSaved,
  (v) => {
    if (!v) return;
    showSaveTip.value = true;
    clearTimeout(tipTimer);
    tipTimer = setTimeout(() => (showSaveTip.value = false), 2000);
  },
);
onBeforeUnmount(() => clearTimeout(tipTimer));

const activeModule = computed(() => {
  if (tabIndex.value === 0) return null;
  return moduleList.value[tabIndex.value - 1] || null;
});

const currentItem = computed(() => {
  const m = activeModule.value;
  if (!m || !Array.isArray(m.data)) return null;
  if (currentIdx.value > m.data.length - 1) currentIdx.value = 0;
  return m.data[currentIdx.value] || null;
});

watch(activeModule, () => {
  currentIdx.value = 0;
});

const ARRAY_MODULES = ["jiaoyu", "work", "project", "shixi", "xiaoyuan"];
const isArrayModule = (name) => ARRAY_MODULES.includes(name);
const itemLabels = {
  jiaoyu: ["学校名称", "专业"],
  work: ["公司名称", "职位"],
  project: ["项目名称", "担任角色"],
  shixi: ["公司名称", "职位"],
  xiaoyuan: ["组织 / 活动名称", "担任角色"],
};
const jobKey = (name) => (name === "jiaoyu" ? "major" : "job");
// 教育背景的学历可选项（支持手动输入其它值）
const XUELI_OPTIONS = ["博士", "硕士", "本科", "大专", "中专", "高中"];

// 点击简历预览区的某个部分 → 展开底部编辑面板并切到对应页签
watch(
  () => ctx.state.editRequestTs,
  (ts) => {
    if (!ts) return;
    const target = ctx.state.editModule || "__basic";
    if (target === "__basic") {
      tabIndex.value = 0;
    } else {
      const idx = moduleList.value.findIndex((m) => m.moduleName === target);
      if (idx < 0) return;
      tabIndex.value = idx + 1;
    }
    showEdit.value = true;
    currentIdx.value = 0;
    nextTick(() => {
      const list = document.querySelector(".edit_b_list");
      if (list) list.scrollTop = 0;
    });
  },
);

function itemSub(m, item) {
  return m.moduleName === "jiaoyu"
    ? item.major || "专业"
    : item.job || item.major || "职位";
}

function tabFn(i) {
  tabIndex.value = i;
  showEdit.value = true;
}

function onVisible(m, v) {
  m.visible = v;
  ctx.saveModule(m);
}

function moveModule(i, dir) {
  const list = ctx.sortedModules.slice();
  const j = i + dir;
  if (j < 0 || j >= list.length) return;
  const [it] = list.splice(i, 1);
  list.splice(j, 0, it);
  ctx.setModuleOrder(list.map((m) => m.moduleName).join(","));
}

// ===== 双击重命名 =====
function startRename(m) {
  renameKey.value = m.moduleName;
  renameVal.value = m.moduleValue || "";
  blurHandled = false;
  nextTick(() => {
    const inst = Array.isArray(renameInput.value)
      ? renameInput.value[0]
      : renameInput.value;
    inst && inst.focus && inst.focus();
    inst && inst.select && inst.select();
  });
}

function commitRename(m) {
  if (blurHandled) return;
  blurHandled = true;
  const val = renameVal.value.trim();
  if (val && val !== m.moduleValue) {
    m.moduleValue = val;
    ctx.saveModule(m);
  }
  renameKey.value = "";
}

function cancelRename() {
  blurHandled = true;
  renameKey.value = "";
}

function moveItem(m, idx, dir) {
  const j = idx + dir;
  if (!Array.isArray(m.data) || j < 0 || j >= m.data.length) return;
  const [it] = m.data.splice(idx, 1);
  m.data.splice(j, 0, it);
  currentIdx.value = j;
  ctx.saveModule(m);
}

function addItem(m) {
  if (!Array.isArray(m.data)) m.data = [];
  m.data.push({
    id: Date.now(),
    timeStart: "",
    timeEnd: "",
    today: false,
    name: "",
    [jobKey(m.moduleName)]: "",
    content: "",
    zIndex: m.data.length,
  });
  currentIdx.value = m.data.length - 1;
  ctx.saveModule(m);
}

function removeItem(m, idx) {
  m.data.splice(idx, 1);
  currentIdx.value = Math.max(0, Math.min(idx, m.data.length - 1));
  ctx.saveModule(m);
}

function addSkill(m) {
  if (!Array.isArray(m.data)) m.data = [];
  const name = newSkillName.value.trim();
  m.data.push({ name: name || "新技能", value: 80, showDegree: true });
  newSkillName.value = "";
  ctx.saveModule(m);
}

function deleteSkill(m, idx) {
  m.data.splice(idx, 1);
  ctx.saveModule(m);
}

function addScore(m) {
  if (!Array.isArray(m.data)) m.data = [];
  m.data.push({ name: "", score: "" });
  ctx.saveModule(m);
}

function removeScore(m, idx) {
  m.data.splice(idx, 1);
  ctx.saveModule(m);
}

async function onPhotoChange(e) {
  const file = e.target.files && e.target.files[0];
  e.target.value = "";
  if (!file) return;
  uploading.value = true;
  try {
    const res = await uploadPhoto(file);
    const data = unwrap(res);
    basic.value.photo = data.url;
    basic.value.photoShow = true;
    ctx.saveBasic();
    ElMessage.success("照片上传成功");
  } catch (err) {
    ElMessage.error("照片上传失败");
  } finally {
    uploading.value = false;
  }
}
</script>

<style scoped>
/* ===== 标签条内重命名输入框 ===== */
:deep(.edit_tab) .tab_rename {
  position: absolute;
  left: 50%;
  top: 22px;
  transform: translateX(-50%);
  width: 80px;
  z-index: 5;
}
:deep(.edit_tab) .tab_rename .el-input__wrapper {
  padding: 0 6px;
  box-shadow: 0 0 0 1px #13d8a7 !important;
  border-radius: 4px;
}
:deep(.edit_tab) .tab_rename .el-input__inner {
  text-align: center;
  font-size: 13px;
  height: 26px;
}

/* ===== 模块操作提示 ===== */
.module_ctrl_tip {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 2px;
}
.module_ctrl_tip .ctrl_arrow {
  color: #13ce66;
  font-size: 14px;
  margin: 0 1px;
}
.module_ctrl_tip .ctrl_edit {
  color: #13ce66;
  font-size: 14px;
  margin: 0 2px;
}

/* ===== 基本信息：四列布局 ===== */
.info_list li {
  display: flex;
  align-items: center;
}
.info_list li > b {
  flex-shrink: 0;
}
.info_list li :deep(.el-input),
.info_list li :deep(.el-select) {
  width: 100%;
  min-width: 0;
  flex: 1;
}
.info_list li .birthday_picker {
  width: 128px !important;
  flex: none;
}
.info_list li .age_switch {
  margin: 0 4px 0 8px;
  flex: none;
}
.info_list li .age_text {
  font-size: 13px;
  color: #13ce66;
  white-space: nowrap;
}
.info_list li .photo_upload {
  flex: none;
}
.info_list li .photo_check {
  margin-left: 8px;
  flex: none;
}
.info_list li .photo_preview {
  width: 32px;
  height: 32px;
  margin-left: 8px;
  border-radius: 4px;
  object-fit: cover;
}
.li_hw :deep(.hw_input) {
  width: 56px !important;
  flex: none;
}
.li_hw .hw_unit {
  margin: 0 8px 0 2px;
  font-size: 13px;
  color: #666;
}
/* 隐藏第 9-12 项 */
.info_list.hide_more li:nth-child(9),
.info_list.hide_more li:nth-child(10),
.info_list.hide_more li:nth-child(11),
.info_list.hide_more li:nth-child(12) {
  display: none;
}
.line_box {
  margin-top: 12px;
  border-bottom: 1px solid #eee;
  position: relative;
  height: 14px;
}
.btn_more {
  position: absolute;
  left: 50%;
  top: -16px;
  transform: translateX(-50%);
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 16px;
  padding: 0 14px;
  height: 28px;
  line-height: 26px;
  font-size: 12px;
  color: #666;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
}
.btn_more:hover {
  color: #13d8a7;
  border-color: #13d8a7;
}

/* 简历标题 / 简介设置 */
.title_set_hd {
  margin: 4px 0 12px;
  font-size: 14px;
  font-weight: bold;
  color: #333;
}
.title_set_rows .title_input_field :deep(.el-input) {
  width: 320px !important;
}
.title_switch_tip {
  margin-left: 10px;
  font-size: 12px;
  color: #999;
}

/* ===== 统一表单风格（原站扁平灰底） ===== */
.qm-rows {
  display: flex;
  flex-wrap: wrap;
}
.qm-field {
  display: flex;
  align-items: center;
  margin: 0 34px 16px 0;
}
.qm-field > label {
  flex-shrink: 0;
  min-width: 70px;
  text-align: right;
  padding-right: 10px;
  font-size: 14px;
  font-weight: 400;
  color: #333;
  white-space: nowrap;
}
.qm-field :deep(.el-input),
.qm-field :deep(.el-select) {
  width: 190px !important;
}
.qm-field-dates :deep(.el-date-editor) {
  width: 130px !important;
  margin-right: 10px;
}

/* 分隔线 */
.qm-divider {
  border-top: 1px dashed #eee;
  margin: 4px 0 16px;
}
.qm-divider-orange {
  border-top: 1px dashed #ffc69f;
  margin: 18px 0;
}

/* 报考分数 */
.qm-scores {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 16px;
  margin-bottom: 16px;
}
.qm-score {
  display: flex;
  align-items: center;
  gap: 8px;
}
.qm-score :deep(.qm-score-name) {
  width: 120px !important;
}
.qm-score :deep(.qm-score-val) {
  width: 80px !important;
}
.qm-score-del {
  color: #f56c6c;
  opacity: 0.65;
  cursor: pointer;
  font-size: 17px;
}
.qm-score-del:hover {
  opacity: 1;
}

/* 描边小按钮（添加科目/技能） */
:deep(.qm-add-outline) {
  height: 34px;
  padding: 0 18px;
  border-radius: 6px;
  border-color: #13d8a7;
  color: #13d8a7;
  background: #fff;
  font-size: 13px;
}
:deep(.qm-add-outline:hover) {
  background: #13d8a7;
  color: #fff;
  border-color: #13d8a7;
}

/* ===== 数组模块：左列表 + 右编辑 ===== */
.qm-dual {
  display: flex;
  align-items: stretch;
  gap: 26px;
}
.qm-list {
  width: 260px;
  flex-shrink: 0;
  background: #f6f8f9;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
}
.qm-list-hd {
  padding: 13px 16px;
  font-size: 15px;
  font-weight: 700;
  color: #222;
}
.qm-list-bd {
  padding: 0 10px;
  max-height: 268px;
  overflow-y: auto;
}
.qm-entry {
  position: relative;
  background: #fff;
  border: 1px solid #e9edf0;
  border-radius: 8px;
  padding: 10px 66px 10px 30px;
  margin-bottom: 10px;
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    background 0.15s ease;
}
.qm-entry:hover {
  border-color: #9fe8d6;
}
.qm-entry.on {
  border-color: #13d8a7;
  background: #f0fffa;
}
.qm-entry-drag {
  position: absolute;
  left: 9px;
  top: 50%;
  transform: translateY(-50%);
  color: #c3ccd4;
  font-size: 15px;
  cursor: move;
}
.qm-entry-name {
  font-size: 14px;
  font-weight: 700;
  color: #222;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.qm-entry-sub {
  font-size: 12px;
  color: #99a1ad;
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.qm-entry-ops {
  position: absolute;
  right: 8px;
  top: 8px;
  display: flex;
  gap: 6px;
}
.qm-entry-ops .el-icon {
  font-size: 14px;
  color: #b3bcc6;
  cursor: pointer;
}
.qm-entry-ops .el-icon:hover {
  color: #13d8a7;
}
.qm-entry-ops .el-icon.danger:hover {
  color: #f56c6c;
}
.qm-entry-ops .el-icon.disabled {
  color: #dce1e6;
  cursor: not-allowed;
}
.qm-list-empty {
  text-align: center;
  color: #aab2bc;
  font-size: 13px;
  padding: 24px 0;
}
.qm-drag-tip {
  text-align: center;
  font-size: 12px;
  color: #b3bcc6;
  margin: 8px 0 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
}
.qm-drag-tip .el-icon {
  font-size: 13px;
}
.qm-add-pill {
  display: block;
  margin: 4px auto 16px;
  height: 40px;
  line-height: 40px;
  padding: 0 26px;
  border: none;
  border-radius: 20px;
  background: #13d8a7;
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: background 0.15s ease;
}
.qm-add-pill:hover {
  background: #11ca9c;
}

.qm-edit {
  flex: 1;
  min-width: 0;
}
.qm-edit :deep(.w-e-toolbar) {
  border-radius: 8px 8px 0 0;
}
.qm-edit :deep(.w-e-text-container) {
  border-radius: 0 0 8px 8px;
}

/* ===== 技能 ===== */
.qm-skill-add {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 16px;
}
.qm-skill-add :deep(.qm-skill-input) {
  width: 220px !important;
}
.qm-skills {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px 26px;
}
.qm-skill-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-right: 4px;
}
.qm-skill-head b {
  font-size: 14px;
  color: #222;
  font-weight: 700;
}
.qm-skill-head .el-icon {
  color: #f56c6c;
  opacity: 0.65;
  cursor: pointer;
  font-size: 15px;
}
.qm-skill-head .el-icon:hover {
  opacity: 1;
}
.qm-skill-bar {
  display: flex;
  align-items: center;
  gap: 10px;
}
.qm-skill-bar :deep(.el-slider) {
  flex: 1;
}
.qm-skill-bar span {
  width: 40px;
  text-align: right;
  font-size: 13px;
  color: #0ebd91;
}

@media (max-width: 1280px) {
  .qm-skills {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
