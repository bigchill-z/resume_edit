<template>
  <div class="rich-editor">
    <Toolbar class="rich-toolbar" :editor="editorRef" :default-config="toolbarConfig" mode="simple" />
    <Editor
      class="rich-content"
      :style="{ height: height + 'px' }"
      :model-value="modelValue"
      :default-config="editorConfig"
      mode="simple"
      @onCreated="onCreated"
      @onChange="onChange"
    />
  </div>
</template>

<script setup>
import { shallowRef, onBeforeUnmount } from 'vue'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'

defineProps({
  modelValue: { type: String, default: '' },
  height: { type: Number, default: 150 }
})
const emit = defineEmits(['update:modelValue', 'change'])

const editorRef = shallowRef()
const toolbarConfig = {
  toolbarKeys: ['bold', 'italic', 'underline', 'bulletedList', 'numberedList', 'justifyLeft', 'justifyCenter', 'justifyRight']
}
const editorConfig = { placeholder: '请输入内容...' }

function onCreated(editor) {
  editorRef.value = editor
}

function onChange(editor) {
  const html = editor.isEmpty() ? '' : editor.getHtml()
  emit('update:modelValue', html)
  emit('change', html)
}

onBeforeUnmount(() => {
  const editor = editorRef.value
  if (editor) editor.destroy()
})
</script>

<style scoped>
.rich-editor {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}
.rich-toolbar {
  border-bottom: 1px solid #e4e7ed;
}
.rich-content {
  overflow-y: hidden;
}
</style>
