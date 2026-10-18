<template>
  <div class="edit_right">
    <div class="edit_fixed">
      <!-- 我的简历 -->
      <ResumeList />

      <!-- 常见问题 -->
      <div class="page_r_box help-card">
        <h4>
          <span class="section-title">常见问题</span>
        </h4>
        <div class="page_r_content page_r_content2">
          <dl
            v-for="(q, i) in faqs"
            :key="i"
            class="qa_list"
            :class="{ active: qaIndex === i }"
            @click="qaIndex = qaIndex === i ? -1 : i"
          >
            <dt>
              {{ q.q }}
              <el-icon><ArrowDown /></el-icon>
            </dt>
            <dd>{{ q.a }}</dd>
          </dl>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { ElMessage } from "element-plus";
import ResumeList from "./ResumeList.vue";

const qaIndex = ref(0);

const faqs = [
  {
    q: "怎么快速编辑某个部分？",
    a: "直接点击简历预览区里对应的部分（如教育背景、实习经历），就会自动打开下方对应的编辑表单；点击顶部姓名/信息区域可打开「基本信息」，点击求职意向可打开「求职意向」。",
  },
  {
    q: "简历怎么保存？",
    a: "简历有任何修改都会自动保存，无需手动保存。您任何时候重新打开本页面，都能查看到最新的简历内容，并随时可以编辑和下载。",
  },
  {
    q: "怎么下载 / 导出简历？",
    a: "简历编辑页顶部右侧有「下载」按钮，点击后选择 PDF 或图片格式即可导出。",
  },
  {
    q: "怎么隐藏不需要的模块？",
    a: "在页面底部编辑区，点击模块名称上面的圆点开关，可以隐藏模块（关闭后圆点变灰）。",
  },
  {
    q: "隐藏模块怎么显示出来？",
    a: "在页面底部编辑区，点击模块名称上面的灰色圆点开关，可以重新显示模块。",
  },
  {
    q: "模块顺序怎么调整？",
    a: "鼠标移入页面底部编辑区的模块标题上，会显示左右箭头，点击箭头可以调整模块顺序。",
  },
];

function tip(msg) {
  ElMessage.info(msg);
}
</script>
