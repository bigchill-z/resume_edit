<template>
  <div class="setting-panel">
    <!-- 字体 / 语言 -->
    <el-form v-if="section === 'font'" label-width="90px" size="default">
      <el-form-item label="字体">
        <el-select
          v-model="set.font"
          style="width: 260px"
          @change="ctx.saveSet()"
        >
          <el-option :value="1" label="默认（黑体类 Sans）" />
          <el-option :value="2" label="Georgia 衬线" />
          <el-option :value="3" label="Helvetica / Arial" />
          <el-option :value="4" label="Monaco 等宽" />
        </el-select>
      </el-form-item>
      <el-form-item label="标题字号">
        <el-slider
          v-model="set.titleFontSize"
          :min="12"
          :max="24"
          :step="1"
          show-input
          style="width: 400px"
          @change="ctx.saveSet()"
        />
      </el-form-item>
      <el-form-item label="内容字号">
        <el-slider
          v-model="set.fontSize"
          :min="10"
          :max="18"
          :step="1"
          show-input
          style="width: 400px"
          @change="ctx.saveSet()"
        />
      </el-form-item>
      <div class="setting-tip">
        标题字号影响页面标题与模块标题；内容字号影响正文、列表等内容的文字大小。
      </div>
      <el-form-item label="语言">
        <el-radio-group v-model="set.language" @change="ctx.saveSet()">
          <el-radio value="cn">中文</el-radio>
          <el-radio value="en">English</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { computed, inject } from "vue";

defineProps({
  section: { type: String, default: "font" },
});

const ctx = inject("ctx");

const set = computed(() => ctx.state.resume.setData);
</script>

<style scoped>
.setting-panel {
  min-height: 120px;
}
.setting-tip {
  margin: -6px 0 14px 90px;
  font-size: 12px;
  color: #999;
}
</style>
