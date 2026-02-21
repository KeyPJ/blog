<!-- .vitepress/components/OtherTaxDeduction.vue -->
<template>
  <div class="other-tax-deduction">
    <div class="form-group">
      <div class="group-header" @click="toggleOtherDeductionExpanded">
        <h3 class="group-title">五、其他个税扣除项（可选）</h3>
        <span class="expand-icon">{{ otherDeductionExpanded ? '▼' : '▶' }}</span>
      </div>
      
      <div v-show="otherDeductionExpanded" class="group-content">
        <div class="form-grid">
          <div class="form-item">
            <label>税延险扣除（元/月）：</label>
            <input
                type="number"
                v-model.number="data.taxDeferredInsurance"
                min="0"
                placeholder="例如：100元/月"
                @input="$emit('update')"
            >
          </div>
          <div class="form-item">
            <label>个人养老金扣除（元/月）：</label>
            <input
                type="number"
                v-model.number="data.personalPension"
                min="0"
                placeholder="每年最高12000元，按月分摊"
                @input="$emit('update')"
            >
          </div>
          <div class="form-item">
            <label>捐赠扣除（元/月）：</label>
            <input
                type="number"
                v-model.number="data.donationDeduction"
                min="0"
                placeholder="符合规定的公益捐赠扣除"
                @input="$emit('update')"
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  data: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update'])

// 折叠展开状态
const otherDeductionExpanded = ref(false) // 其他个税扣除项默认折叠

// 切换其他个税扣除项的折叠状态
const toggleOtherDeductionExpanded = () => {
  otherDeductionExpanded.value = !otherDeductionExpanded.value
}
</script>

<style scoped>
.form-group {
  margin-bottom: 30px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 6px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 15px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-item label {
  color: #555;
  font-size: 0.9rem;
  font-weight: 500;
}

.form-item input {
  padding: 8px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
  transition: border-color 0.2s;
}

.form-item input:focus {
  outline: none;
  border-color: #42b983;
  box-shadow: 0 0 0 2px rgba(66, 185, 131, 0.1);
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  margin-bottom: 15px;
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
}

.group-title {
  font-size: 1.1rem;
  color: #333;
  margin: 0;
}

.expand-icon {
  color: #42b983;
  font-weight: bold;
  transition: transform 0.2s;
}

.group-content {
  margin-top: 15px;
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
