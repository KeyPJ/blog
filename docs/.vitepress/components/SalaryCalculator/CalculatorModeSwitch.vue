<!-- .vitepress/components/CalculatorModeSwitch.vue -->
<template>
  <div class="mode-switch">
    <label class="mode-label">
      <input
          type="radio"
          :checked="modelValue === 'monthly'"
          @change="$emit('update:modelValue', 'monthly')"
          name="calcMode"
      >
      月度计算（基础版）
    </label>
    <label class="mode-label">
      <input
          type="radio"
          :checked="modelValue === 'yearly'"
          @change="handleYearlyChange"
          name="calcMode"
      >
      年度计算（支持逐月设置）
    </label>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: String,
    default: 'monthly'
  }
})

const emit = defineEmits(['update:modelValue'])

const handleYearlyChange = () => {
  emit('update:modelValue', 'yearly')
  // 不再自动重置年度数据，使用已加载的缓存数据
}
</script>

<style scoped>
.mode-switch {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 6px;
}

.mode-label {
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  color: #555;
  font-weight: 500;
}

.mode-label input {
  cursor: pointer;
}

@media (max-width: 768px) {
  .mode-switch {
    flex-direction: column;
    gap: 10px;
  }
}
</style>
