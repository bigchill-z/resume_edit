<template>
  <div class="edit_header" @mouseover="showSet = ''">
    <div class="edit_header_main">
      <a class="logo" href="/" target="_blank" title="大肥鱼简历">
        <img src="/logo.png" alt="大肥鱼简历" />
      </a>

      <ul class="get_list">
        <li class="theme_action">
          <el-dropdown trigger="click" @command="onThemeChange">
            <span class="theme_trigger" title="切换软件界面风格">
              <el-icon><Brush /></el-icon>
              {{ themeName }}
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item
                  v-for="t in UI_THEMES"
                  :key="t.key"
                  :command="t.key"
                  :disabled="t.key === ctx.uiTheme"
                >
                  {{ t.name }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </li>
        <li class="active" @click="emit('download', 'pdf')">
          <el-icon><Download /></el-icon>下载
        </li>
      </ul>

      <ul class="set_list">
        <!-- 更换模板（置于顶端） -->
        <li class="template_action">
          <el-dropdown trigger="click" @command="onTemplateChange">
            <span class="set_btn" title="更换模板">
              <svg class="set_icon" viewBox="0 0 24 24">
                <path d="M3 4h8v7H3zM13 4h8v7h-8zM3 13h8v7H3zM13 13h8v7h-8z" />
              </svg>
              <b>更换模板</b>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item
                  v-for="t in TEMPLATES"
                  :key="t.key"
                  :command="t.key"
                  :disabled="t.key === currentTemplate"
                >
                  {{ t.name }}
                  <span v-if="t.key === currentTemplate" class="tpl_cur"
                    >（当前）</span
                  >
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </li>

        <!-- 间距设置 -->
        <li
          :class="{ show_set: showSet === 'space' }"
          @mouseover.stop="showSet = 'space'"
        >
          <div class="set_btn">
            <svg class="set_icon" viewBox="0 0 24 24">
              <path d="M2 7h7.5v2H2zM14.5 7H22v2h-7.5z" />
              <circle cx="12" cy="8" r="2.8" />
              <path d="M2 15h2.5v2H2zM9.5 15H22v2H9.5z" />
              <circle cx="7" cy="16" r="2.8" />
            </svg>
            <b>间距设置</b>
          </div>
          <div class="set_box jianju_set">
            <ul class="set_page">
              <!-- 第 1 行 -->
              <li>
                <div class="slider_box">
                  <h5>
                    页面边距：<b>{{ set.pp }}</b>
                  </h5>
                  <el-slider
                    class="page_slider"
                    v-model="set.pp"
                    :min="10"
                    :max="50"
                    :step="2"
                    :show-tooltip="false"
                    @change="ctx.saveSet()"
                  />
                  <el-button
                    v-if="set.pp != 30"
                    class="el_btn"
                    size="small"
                    @click="resetSet('pp', 30)"
                    >重置</el-button
                  >
                </div>
              </li>
              <li>
                <div class="slider_box">
                  <h5>
                    行间距：<b>{{ set.lineHeight }}</b>
                  </h5>
                  <el-slider
                    class="page_slider"
                    v-model="set.lineHeight"
                    :min="1.3"
                    :max="2.2"
                    :step="0.05"
                    :show-tooltip="false"
                    @change="ctx.saveSet()"
                  />
                  <el-button
                    v-if="set.lineHeight != 1.7"
                    class="el_btn"
                    size="small"
                    @click="resetSet('lineHeight', 1.7)"
                    >重置</el-button
                  >
                </div>
              </li>
              <!-- 第 2 行 -->
              <li>
                <div class="slider_box">
                  <h5>
                    模块上下间距：<b>{{ set.mm }}</b>
                  </h5>
                  <el-slider
                    class="page_slider"
                    v-model="set.mm"
                    :min="5"
                    :max="50"
                    :step="1"
                    :show-tooltip="false"
                    @change="ctx.saveSet()"
                  />
                  <el-button
                    v-if="set.mm != 20"
                    class="el_btn"
                    size="small"
                    @click="resetSet('mm', 20)"
                    >重置</el-button
                  >
                </div>
              </li>
              <li>
                <div class="slider_box">
                  <h5>
                    子模块间距：<b>{{ set.itemGap ?? 10 }}</b>
                  </h5>
                  <el-slider
                    class="page_slider"
                    v-model="set.itemGap"
                    :min="0"
                    :max="40"
                    :step="1"
                    :show-tooltip="false"
                    @change="ctx.saveSet()"
                  />
                  <el-button
                    v-if="set.itemGap != 10"
                    class="el_btn"
                    size="small"
                    @click="resetSet('itemGap', 10)"
                    >重置</el-button
                  >
                </div>
              </li>
              <!-- 第 3 行 -->
              <li>
                <div class="slider_box">
                  <h5>
                    标题与横线间距：<b>{{ set.titleGap ?? 6 }}</b>
                  </h5>
                  <el-slider
                    class="page_slider"
                    v-model="set.titleGap"
                    :min="0"
                    :max="20"
                    :step="1"
                    :show-tooltip="false"
                    @change="ctx.saveSet()"
                  />
                  <el-button
                    v-if="set.titleGap != 6"
                    class="el_btn"
                    size="small"
                    @click="resetSet('titleGap', 6)"
                    >重置</el-button
                  >
                </div>
              </li>
              <li>
                <div class="slider_box">
                  <h5>
                    横线与内容间距：<b>{{ set.lineGap ?? 10 }}</b>
                  </h5>
                  <el-slider
                    class="page_slider"
                    v-model="set.lineGap"
                    :min="0"
                    :max="30"
                    :step="1"
                    :show-tooltip="false"
                    @change="ctx.saveSet()"
                  />
                  <el-button
                    v-if="set.lineGap != 10"
                    class="el_btn"
                    size="small"
                    @click="resetSet('lineGap', 10)"
                    >重置</el-button
                  >
                </div>
              </li>
            </ul>
          </div>
        </li>

        <!-- 字体 / 语言 -->
        <li>
          <div class="click_btn" @click="openDialog('font')">
            <svg class="set_icon" viewBox="0 0 24 24">
              <path d="M4 4h16v3.2h-6.3V20h-3.4V7.2H4z" />
            </svg>
            <b>字体<span>/</span>语言</b>
          </div>
        </li>

        <!-- 皮肤设置 -->
        <li
          :class="{ show_set: showSet === 'skin' }"
          @mouseover.stop="showSet = 'skin'"
        >
          <div class="set_btn">
            <svg class="set_icon" viewBox="0 0 24 24">
              <path
                d="M8.5 3 12 5.2 15.5 3 21 6.8l-2.4 3.1-2.1-1.5V21h-9V8.4l-2.1 1.5L3 6.8z"
              />
            </svg>
            <b>标题颜色</b>
          </div>
          <div class="set_box set_skin">
            <ul class="set_page">
              <li>
                <h5>推荐皮肤</h5>
                <div class="skin_list">
                  <span
                    v-for="c in SKIN_COLORS"
                    :key="c"
                    :class="{ active: set.skin === c }"
                    :style="{ backgroundColor: c }"
                    @click="
                      set.skin = c;
                      ctx.saveSet();
                    "
                  ></span>
                </div>
              </li>
              <li>
                <h5>自定义颜色</h5>
                <el-color-picker v-model="set.skin" @change="ctx.saveSet()" />
              </li>
            </ul>
          </div>
        </li>
      </ul>
    </div>

    <el-dialog
      v-model="dlg"
      :title="dlgTitle"
      width="680px"
      append-to-body
      destroy-on-close
    >
      <SettingPanel :section="dlgType" />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, inject } from "vue";
import SettingPanel from "./SettingPanel.vue";
import { SKIN_COLORS } from "../resumeCss";
import { UI_THEMES } from "../uiTheme";
import { TEMPLATES, getTemplate } from "../templates";

const ctx = inject("ctx");
const emit = defineEmits(["download"]);

const themeName = computed(() => {
  const item = UI_THEMES.find((t) => t.key === ctx.uiTheme);
  return (item || UI_THEMES[0]).name;
});

function onThemeChange(key) {
  ctx.setUiTheme(key);
}

const currentTemplate = computed(() =>
  getTemplate(ctx.state.resume && ctx.state.resume.setData),
);
function onTemplateChange(key) {
  ctx.setTemplate(key);
}

const showSet = ref("");
const dlg = ref(false);
const dlgType = ref("font");

const set = computed(() => ctx.state.resume.setData);

const DIALOG_TITLES = {
  font: "字体 / 语言",
};
const dlgTitle = computed(() => DIALOG_TITLES[dlgType.value] || "");

function resetSet(key, val) {
  set.value[key] = val;
  ctx.saveSet();
}

function openDialog(type) {
  dlgType.value = type;
  dlg.value = true;
}
</script>
