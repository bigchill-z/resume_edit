<template>
  <div
    id="resume_pc"
    :class="['tpl-' + template, { compact: template === 'label' && set.labelCompact }]"
  >
    <!-- ================= 左侧深色栏模板 ================= -->
    <template v-if="template === 'sidebar'">
      <div class="r-side" :style="{ backgroundColor: set.skin || '#333333' }">
        <div
          v-if="basic.photoShow && basic.photo"
          class="r-side-photo"
          title="点击编辑基本信息"
          @click="openEditor('__basic')"
        >
          <img :src="basic.photo" alt="照片" />
        </div>

        <div
          class="r-side-block"
          title="点击编辑基本信息"
          @click="openEditor('__basic')"
        >
          <div
            v-for="(item, i) in sideInfoItems"
            :key="'p' + i"
            class="r-side-info-item"
          >
            <i class="r-side-dot"></i>{{ item }}
          </div>
        </div>

        <div
          v-if="jineng.visible"
          class="r-side-block"
          title="点击编辑：技能特长"
          @click="openEditor('jineng')"
        >
          <div class="r-side-title">技能特长</div>
          <div class="r-side-content" v-html="jineng.content"></div>
          <div v-if="(jineng.data || []).length" class="r-side-skills">
            <div
              v-for="(s, i) in jineng.data || []"
              :key="i"
              class="r-side-skill"
            >
              <div class="r-side-skill-name">{{ s.name }}</div>
              <div class="r-side-skill-bar">
                <i :style="{ width: (s.value || 0) + '%' }"></i>
              </div>
              <div v-if="s.showDegree !== false" class="r-side-skill-val">
                {{ degreeText(s.value) }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="r-main">
        <div class="r-side-name">{{ basic.name }}</div>

        <ul
          v-if="yixiangItems.length"
          class="r-side-yixiang"
          title="点击编辑求职意向"
          @click="openEditor('yixiang')"
        >
          <li v-for="(it, i) in yixiangItems" :key="i">
            <b>{{ it.label }}：</b>{{ it.value }}
          </li>
        </ul>

        <div
          v-for="m in sidebarMainModules"
          :key="m.moduleName"
          class="r-side-module"
          :title="'点击编辑：' + (m.moduleValue || '模块')"
          @click="openEditor(m.moduleName)"
        >
          <div class="r-side-module-title">
            <i class="r-side-module-ic"></i>{{ m.moduleValue }}
          </div>

          <div class="r-side-module-body">
            <!-- 报考信息 -->
            <template v-if="m.moduleName === 'baokao'">
              <div class="r-baokao-head">
                {{ m.title }} · {{ m.name }} · {{ m.major }}
              </div>
              <div class="r-baokao-scores">
                <span
                  v-for="(s, i) in m.data || []"
                  :key="i"
                  class="r-baokao-score"
                  >{{ s.name }}：<b>{{ s.score }}</b></span
                >
              </div>
            </template>

            <!-- 条目数组类模块 -->
            <template v-else-if="isArrayModule(m.moduleName)">
              <div
                v-for="item in m.data || []"
                :key="item.id"
                class="r-side-item"
              >
                <ul class="r-side-item-top">
                  <li v-if="timeText(item)" class="r-side-item-time">
                    {{ timeText(item) }}
                  </li>
                  <li class="r-side-item-name">
                    <template
                      v-for="(part, pi) in itemTitleParts(m, item)"
                      :key="pi"
                    >
                      <template v-if="pi > 0"> - </template>{{ part }}
                    </template>
                  </li>
                </ul>
                <div class="r-side-content" v-html="item.content"></div>
              </div>
            </template>

            <!-- 纯富文本模块 -->
            <template v-else>
              <div class="r-side-content" v-html="m.content"></div>
            </template>
          </div>
        </div>

        <!-- 自荐信 -->
        <div v-if="zijian.visible" class="r-side-module">
          <div class="r-side-module-title">
            <i class="r-side-module-ic"></i>自荐信
          </div>
          <div class="r-side-content" v-html="zijian.content"></div>
        </div>
      </div>
    </template>

    <!-- ================= 简约标签模板 ================= -->
    <template v-else-if="template === 'label'">
      <dl class="r-label-head">
        <dt :style="{ color: set.skin || '#333333' }">
          {{ set.title || "个人简历" }}
        </dt>
        <dd v-if="set.slogan">{{ set.slogan }}</dd>
      </dl>

      <div class="r-label-content">
        <!-- 基本信息 -->
        <div
          class="r-label-module"
          title="点击编辑基本信息"
          @click="openEditor('__basic')"
        >
          <div class="r-label-title">
            <b :style="{ backgroundColor: set.skin || '#333333' }">基本信息</b>
          </div>
          <div class="r-label-body r-label-basic-body">
            <dl class="r-label-info">
              <dd v-for="(it, i) in basicRows" :key="i">
                <span class="r-label-key">{{ it.label }}</span>：{{ it.value }}
              </dd>
            </dl>
            <div
              v-if="basic.photoShow && basic.photo"
              class="r-label-photo"
              @click.stop="openEditor('__basic')"
            >
              <img :src="basic.photo" alt="照片" />
            </div>
          </div>
        </div>

        <!-- 求职意向 -->
        <div
          v-if="yixiangItems.length"
          class="r-label-module"
          title="点击编辑求职意向"
          @click="openEditor('yixiang')"
        >
          <div class="r-label-title">
            <b :style="{ backgroundColor: set.skin || '#333333' }"
              >求职意向</b
            >
          </div>
          <div class="r-label-body">
            <ul class="r-label-yixiang">
              <li v-for="(it, i) in labelYixiangItems" :key="i">
                {{ it.label }}：{{ it.value }}
              </li>
            </ul>
          </div>
        </div>

        <!-- 其他模块 -->
        <div
          v-for="m in visibleModules"
          :key="m.moduleName"
          class="r-label-module"
          :title="'点击编辑：' + (m.moduleValue || '模块')"
          @click="openEditor(m.moduleName)"
        >
          <div class="r-label-title">
            <b :style="{ backgroundColor: set.skin || '#333333' }">{{
              m.moduleValue
            }}</b>
          </div>

          <div class="r-label-body">
            <!-- 报考信息 -->
            <template v-if="m.moduleName === 'baokao'">
              <div class="r-baokao-head">
                {{ m.title }} · {{ m.name }} · {{ m.major }}
              </div>
              <div class="r-baokao-scores">
                <span
                  v-for="(s, i) in m.data || []"
                  :key="i"
                  class="r-baokao-score"
                  >{{ s.name }}：<b>{{ s.score }}</b></span
                >
              </div>
            </template>

            <!-- 条目数组类模块 -->
            <template v-else-if="isArrayModule(m.moduleName)">
              <div
                v-for="item in m.data || []"
                :key="item.id"
                class="r-label-item"
              >
                <ul class="r-label-item-top">
                  <li v-if="timeText(item)" class="r-label-time">
                    {{ timeText(item) }}
                  </li>
                  <li class="r-label-name">
                    <b>{{ item.name }}</b>
                  </li>
                  <li class="r-label-sub">
                    <template v-if="m.moduleName === 'jiaoyu'">
                      {{ item.major
                      }}<template v-if="item.xueli"
                        >（<b>{{ item.xueli }}</b>）</template
                      >
                    </template>
                    <template v-else>{{ item.job || item.major }}</template>
                  </li>
                </ul>
                <div class="r-label-content-text" v-html="item.content"></div>
              </div>
            </template>

            <!-- 技能特长 -->
            <template v-else-if="m.moduleName === 'jineng'">
              <div class="r-label-content-text" v-html="m.content"></div>
              <div v-if="(m.data || []).length" class="r-label-skills">
                <div
                  v-for="(s, i) in m.data || []"
                  :key="i"
                  class="r-label-skill"
                >
                  <div class="r-label-skill-bar">
                    <i :style="{ width: (s.value || 0) + '%' }"></i>
                  </div>
                  <div class="r-label-skill-meta">
                    <span class="r-label-skill-name">{{ s.name }}</span>
                    <span
                      v-if="s.showDegree !== false"
                      class="r-label-skill-deg"
                      >{{ degreeText(s.value) }}</span
                    >
                  </div>
                </div>
              </div>
            </template>

            <!-- 纯富文本模块 -->
            <template v-else>
              <div class="r-label-content-text" v-html="m.content"></div>
            </template>
          </div>
        </div>

        <!-- 自荐信 -->
        <div v-if="zijian.visible" class="r-label-module">
          <div class="r-label-title">
            <b :style="{ backgroundColor: set.skin || '#333333' }">自荐信</b>
          </div>
          <div class="r-label-body">
            <div class="r-label-content-text" v-html="zijian.content"></div>
          </div>
        </div>
      </div>
    </template>

    <!-- ================= 经典单栏模板 ================= -->
    <template v-else>
      <div v-if="set.coverShow" class="r-cover">
        <div class="r-cover-name">{{ cover.name || basic.name }}</div>
        <div v-if="cover.job" class="r-cover-job">{{ cover.job }}</div>
        <ul class="r-cover-info">
          <li v-if="cover.school">毕业院校：{{ cover.school }}</li>
          <li v-if="cover.mobile || basic.mobile">
            联系电话：{{ cover.mobile || basic.mobile }}
          </li>
          <li v-if="cover.email || basic.email">
            联系邮箱：{{ cover.email || basic.email }}
          </li>
        </ul>
      </div>

      <div v-if="set.hasTitle" class="r-head">
        <div class="r-title">{{ set.title }}</div>
        <div v-if="set.slogan" class="r-slogan">{{ set.slogan }}</div>
      </div>

      <div
        class="r-basic"
        :class="{ 'has-photo': basic.photoShow && basic.photo }"
        title="点击编辑基本信息"
        @click="openEditor('__basic')"
      >
        <img
          v-if="basic.photoShow && basic.photo"
          :src="basic.photo"
          class="r-photo"
          alt="照片"
        />
        <div class="r-name">{{ basic.name }}</div>
        <div
          v-if="yixiangText"
          class="r-intention"
          title="点击编辑求职意向"
          @click.stop="openEditor('yixiang')"
        >
          求职意向：{{ yixiangText }}
        </div>
        <div v-if="personItems.length" class="r-info-line">
          <span v-for="(item, i) in personItems" :key="i" class="r-info-item">{{
            item
          }}</span>
        </div>
        <div v-if="contactItems.length" class="r-info-line">
          <span v-for="(item, i) in contactItems" :key="i" class="r-info-item">{{
            item
          }}</span>
        </div>
      </div>

      <div
        v-for="m in visibleModules"
        :key="m.moduleName"
        class="r-module"
        :title="'点击编辑：' + (m.moduleValue || '模块')"
        @click="openEditor(m.moduleName)"
      >
        <div class="r-module-title">{{ m.moduleValue }}</div>

        <!-- 报考信息 -->
        <template v-if="m.moduleName === 'baokao'">
          <div class="r-baokao-head">
            {{ m.title }} · {{ m.name }} · {{ m.major }}
          </div>
          <div class="r-baokao-scores">
            <span v-for="(s, i) in m.data || []" :key="i" class="r-baokao-score"
              >{{ s.name }}：<b>{{ s.score }}</b></span
            >
          </div>
        </template>

        <!-- 条目数组类模块：标题「名称 - 子项」整体加粗，日期单独普通字重 -->
        <template v-else-if="isArrayModule(m.moduleName)">
          <div v-for="item in m.data || []" :key="item.id" class="r-item">
            <div class="r-item-head">
              <span class="r-item-name">
                <template
                  v-for="(part, pi) in itemTitleParts(m, item)"
                  :key="pi"
                >
                  <template v-if="pi > 0"> - </template>{{ part }}
                </template>
              </span>
              <span v-if="timeText(item)" class="r-time">{{
                timeText(item)
              }}</span>
            </div>
            <div class="r-content" v-html="item.content"></div>
          </div>
        </template>

        <!-- 技能特长 -->
        <template v-else-if="m.moduleName === 'jineng'">
          <div class="r-content" v-html="m.content"></div>
          <div class="r-skills">
            <div v-for="(s, i) in m.data || []" :key="i" class="r-skill">
              <span class="r-skill-name">{{ s.name }}</span>
              <span class="r-skill-bar"
                ><i :style="{ width: (s.value || 0) + '%' }"></i
              ></span>
              <span v-if="s.showDegree !== false" class="r-skill-val"
                >{{ degreeText(s.value) }}</span
              >
            </div>
          </div>
        </template>

        <!-- 纯富文本模块 -->
        <template v-else>
          <div class="r-content" v-html="m.content"></div>
        </template>
      </div>

      <!-- 自荐信 -->
      <div v-if="zijian.visible" class="r-module">
        <div class="r-module-title">自荐信</div>
        <div class="r-content" v-html="zijian.content"></div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, inject, watchEffect } from "vue";
import { buildResumeCss } from "../resumeCss";
import { getTemplate } from "../templates";

const ctx = inject("ctx");

const set = computed(() => ctx.state.resume.setData);
const basic = computed(() => ctx.state.resume.basicInfo);
const zijian = computed(() => ctx.state.resume.zijianData);
const cover = computed(() => ctx.state.resume.coverData || {});

const template = computed(() => getTemplate(set.value));

const ARRAY_MODULES = ["jiaoyu", "work", "project", "shixi", "xiaoyuan"];
const isArrayModule = (name) => ARRAY_MODULES.includes(name);

const visibleModules = computed(() =>
  ctx.sortedModules.filter((m) => m.visible && m.moduleName !== "yixiang"),
);
// 左侧深色栏模板：技能特长放左栏，其余模块放右栏
const sidebarMainModules = computed(() =>
  visibleModules.value.filter((m) => m.moduleName !== "jineng"),
);

const jineng = computed(() => ctx.moduleMap.jineng);

// 点击预览区某个部分 → 打开下方对应的编辑表单
function openEditor(moduleName) {
  if (ctx && typeof ctx.openModuleEditor === "function") {
    ctx.openModuleEditor(moduleName);
  }
}

// 条目名称行：教育背景为「学校 - 专业 - 学历」，其它为「名称 - 职位/角色」
// 名称行整体加粗（日期行单独渲染、保持普通字重）
function itemTitleParts(m, item) {
  const parts =
    m.moduleName === "jiaoyu"
      ? [item.name, item.major, item.xueli]
      : [item.name, item.job || item.major];
  return parts.map((v) => String(v == null ? "" : v).trim()).filter(Boolean);
}

// 条目日期：只有开始或只有结束时，不渲染多余的分隔符
function timeText(item) {
  const start = String(item.timeStart || "").trim();
  const end = String(item.timeEnd || "").trim();
  if (item.today) return start ? `${start} - 至今` : "至今";
  if (start && end) return `${start} - ${end}`;
  return start || end;
}

const yixiang = computed(() => ctx.moduleMap.yixiang);
const yixiangText = computed(() => {
  const d = yixiang.value && yixiang.value.visible ? yixiang.value.data : null;
  if (!d) return "";
  return [d.job, d.city, d.money, d.joinTime].filter(Boolean).join(" | ");
});

// 左侧深色栏模板的求职意向：按项展示
const yixiangItems = computed(() => {
  const d = yixiang.value && yixiang.value.visible ? yixiang.value.data : null;
  if (!d) return [];
  return [
    { label: "求职意向", value: d.job },
    { label: "意向城市", value: d.city },
    { label: "期望薪资", value: d.money },
    { label: "入职时间", value: d.joinTime },
  ].filter((it) => it.value);
});

// 简约标签模板的求职意向：项名用「职位」等短标签，避免与模块标题重复
const labelYixiangItems = computed(() => {
  const d = yixiang.value && yixiang.value.visible ? yixiang.value.data : null;
  if (!d) return [];
  return [
    { label: "职位", value: d.job },
    { label: "意向城市", value: d.city },
    { label: "期望薪资", value: d.money },
    { label: "入职时间", value: d.joinTime },
  ].filter((it) => it.value);
});

const SEX_TEXT = { 1: "男", 2: "女" };
const HUNYIN_TEXT = { 1: "未婚", 2: "已婚" };

// 身高/体重：数字自动补单位，用户已输入单位时不重复拼接
function withUnit(val, unit) {
  const s = String(val == null ? "" : val).trim();
  if (!s) return "";
  return s.toLowerCase().endsWith(unit.toLowerCase()) ? s : s + unit;
}

// 个人信息行：年龄 / 性别 / 籍贯 / 婚姻状况 / 政治面貌 / 民族 / 身高 / 体重 / 经验
const personItems = computed(() => {
  const b = basic.value;
  const items = [];
  if (b.birthday) {
    if (b.isAge) {
      // 开启"转年龄"：出生年月换算为年龄
      const age =
        new Date().getFullYear() - Number(String(b.birthday).slice(0, 4));
      if (age > 0 && age < 120) items.push(age + "岁");
    } else {
      items.push(String(b.birthday));
    }
  }
  if (SEX_TEXT[b.sex]) items.push(SEX_TEXT[b.sex]);
  if (b.jiguan) items.push(b.jiguan);
  if (HUNYIN_TEXT[b.hunyin]) items.push(HUNYIN_TEXT[b.hunyin]);
  if (b.zhengzhi) items.push(b.zhengzhi);
  if (b.minzu) items.push(b.minzu);
  const height = withUnit(b.height, "cm");
  if (height) items.push(height);
  const weight = withUnit(b.weight, "kg");
  if (weight) items.push(weight);
  if (b.workYears === 0) items.push("应届生");
  else if (b.workYears !== "" && b.workYears != null)
    items.push(b.workYears + "年经验");
  return items;
});
// 联系方式行：电话 / 邮箱
const contactItems = computed(() => {
  const b = basic.value;
  return [b.mobile, b.email].filter(Boolean);
});

// 左栏信息：个人信息 + 联系方式合并成一行一条
const sideInfoItems = computed(() => [...personItems.value, ...contactItems.value]);

// 简约标签模板：基本信息表（标签 + 值）
const basicRows = computed(() => {
  const b = basic.value;
  const rows = [];
  if (b.name) rows.push({ label: "姓名", value: b.name });
  if (b.birthday) {
    const year = Number(String(b.birthday).slice(0, 4));
    if (b.isAge) {
      const age = new Date().getFullYear() - year;
      if (age > 0 && age < 120) rows.push({ label: "年龄", value: age + "岁" });
    } else {
      rows.push({ label: "出生年月", value: String(b.birthday) });
    }
  }
  if (SEX_TEXT[b.sex]) rows.push({ label: "性别", value: SEX_TEXT[b.sex] });
  if (b.jiguan) rows.push({ label: "籍贯", value: b.jiguan });
  if (HUNYIN_TEXT[b.hunyin])
    rows.push({ label: "婚姻状况", value: HUNYIN_TEXT[b.hunyin] });
  if (b.zhengzhi) rows.push({ label: "政治面貌", value: b.zhengzhi });
  if (b.minzu) rows.push({ label: "民族", value: b.minzu });
  const height = withUnit(b.height, "cm");
  if (height) rows.push({ label: "身高", value: height });
  const weight = withUnit(b.weight, "kg");
  if (weight) rows.push({ label: "体重", value: weight });
  if (b.workYears === 0) rows.push({ label: "工作年限", value: "应届生" });
  else if (b.workYears !== "" && b.workYears != null)
    rows.push({ label: "工作年限", value: b.workYears + "年经验" });
  if (b.mobile) rows.push({ label: "电话", value: b.mobile });
  if (b.email) rows.push({ label: "邮箱", value: b.email });
  return rows;
});

// 技能熟练度文案
function degreeText(v) {
  const n = Number(v) || 0;
  if (n >= 90) return "精通";
  if (n >= 75) return "熟练";
  if (n >= 60) return "良好";
  return "一般";
}

// 预览样式与导出共用一份 CSS，注入 head 中
watchEffect(() => {
  let el = document.getElementById("resume-preview-style");
  if (!el) {
    el = document.createElement("style");
    el.id = "resume-preview-style";
    document.head.appendChild(el);
  }
  el.textContent = buildResumeCss(set.value);
});
</script>
