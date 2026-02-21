<!-- .vitepress/components/SpecialDeduction.vue -->
<template>
  <div class="special-deduction">
    <div class="form-group">
      <div class="group-header" @click="toggleSpecialDeductionExpanded">
        <h3 class="group-title">四、专项附加扣除设置 </h3>
        <span class="expand-icon">{{ specialDeductionExpanded ? '▼' : '▶' }}</span>
      </div>

      <div v-show="specialDeductionExpanded" class="group-content">
        <div class="deduction-section">
          <h4 class="sub-title">专项附加扣除（可选）</h4>

          <!-- 扣除项分组 -->
          <div class="deduction-groups">
            <!-- 第一组：教育相关 -->
            <div class="deduction-group">
              <h5 class="deduction-group-title">教育相关</h5>
              <div class="deduction-items">
                <!-- 子女教育 -->
                <div class="deduction-item">
                  <label class="checkbox-label">
                    <input
                        type="checkbox"
                        v-model="items.childrenEducation"
                        @change="handleChange"
                    >
                    子女教育
                  </label>
                  <select
                      v-model="items.childrenEducationCount"
                      @change="handleChange"
                      :disabled="!items.childrenEducation"
                      class="deduction-select"
                  >
                    <option value="0">0个子女</option>
                    <option value="1">1个子女（2000元/月）</option>
                    <option value="2">2个子女（4000元/月）</option>
                    <option value="3">3个及以上（6000元/月）</option>
                  </select>
                </div>

                <!-- 继续教育 -->
                <div class="deduction-item">
                  <label class="checkbox-label">
                    <input
                        type="checkbox"
                        v-model="items.continueEducation"
                        @change="handleChange"
                    >
                    继续教育
                  </label>
                  <select
                      v-model="items.continueEducationType"
                      @change="handleChange"
                      :disabled="!items.continueEducation"
                      class="deduction-select"
                  >
                    <option value="monthly">400元/月（学历/学位）</option>
                    <option value="annual">3600元/年（职业资格）</option>
                  </select>
                </div>

                <!-- 婴幼儿照护 -->
                <div class="deduction-item">
                  <label class="checkbox-label">
                    <input
                        type="checkbox"
                        v-model="items.babyCare"
                        @change="handleChange"
                    >
                    婴幼儿照护
                  </label>
                  <select
                      v-model="items.babyCareCount"
                      @change="handleChange"
                      :disabled="!items.babyCare"
                      class="deduction-select"
                  >
                    <option value="0">0个婴幼儿</option>
                    <option value="1">1个婴幼儿（2000元/月）</option>
                    <option value="2">2个婴幼儿（4000元/月）</option>
                    <option value="3">3个及以上（6000元/月）</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- 第二组：住房相关 -->
            <div class="deduction-group">
              <h5 class="deduction-group-title">住房相关（二选一）</h5>
              <div class="deduction-items">
                <!-- 住房贷款利息 -->
                <div class="deduction-item">
                  <label class="checkbox-label">
                    <input
                        type="checkbox"
                        v-model="items.housingLoan"
                        @change="handleHousingMutual('loan')"
                    >
                    住房贷款利息
                  </label>
                  <span class="deduction-amount">1000元/月</span>
                </div>

                <!-- 住房租金 -->
                <div class="deduction-item">
                  <label class="checkbox-label">
                    <input
                        type="checkbox"
                        v-model="items.housingRent"
                        @change="handleHousingMutual('rent')"
                    >
                    住房租金
                  </label>
                  <select
                      v-model="items.housingRentType"
                      @change="handleChange"
                      :disabled="!items.housingRent"
                      class="deduction-select"
                  >
                    <option value="0">不适用</option>
                    <option value="800">其他城市（800元/月）</option>
                    <option value="1100">市辖区≥100万（1100元/月）</option>
                    <option value="1500">直辖市/省会（1500元/月）</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- 第三组：赡养老人 -->
            <div class="deduction-group">
              <h5 class="deduction-group-title">赡养老人</h5>
              <div class="deduction-items">
                <div class="deduction-item">
                  <label class="checkbox-label">
                    <input
                        type="checkbox"
                        v-model="items.supportElderly"
                        @change="handleChange"
                    >
                    赡养老人
                  </label>
                  <select
                      v-model="items.supportElderlyType"
                      @change="handleChange"
                      :disabled="!items.supportElderly"
                      class="deduction-select"
                  >
                    <option value="0">0元/月</option>
                    <option value="3000">独生子女（3000元/月）</option>
                    <option value="1500">非独生子女（最高1500元/月）</option>
                  </select>
                </div>
                <!-- 非独生子女约定分摊金额 -->
                <div v-if="items.supportElderly && items.supportElderlyType === '1500'" class="deduction-item">
                  <label class="checkbox-label">
                    约定分摊金额（元/月）：
                  </label>
                  <input
                      type="number"
                      v-model.number="items.supportElderlyShare"
                      min="0"
                      max="1500"
                      @input="handleChange"
                      class="deduction-input"
                      placeholder="最高1500元/月"
                  >
                </div>
              </div>
            </div>
          </div>

          <!-- 专项附加扣除合计 -->
        <div class="deduction-summary">
          <div class="summary-content">
            <span class="summary-label">专项附加扣除合计：</span>
            <span class="summary-value">¥{{ deductionTotal }}</span>
          </div>
          <small class="summary-tip">自动计算，根据您选择的扣除项汇总</small>
          <small class="summary-tip special-note">
            <span class="highlight">大病医疗</span>于次年汇算清缴时享受，本次计算暂不考虑
          </small>
        </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  items: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update'])

// 折叠展开状态
const specialDeductionExpanded = ref(false) // 专项附加扣除设置默认折叠

// 切换专项附加扣除设置的折叠状态
const toggleSpecialDeductionExpanded = () => {
  specialDeductionExpanded.value = !specialDeductionExpanded.value
}

// 专项附加扣除配置（官方标准）
const specialAddConfig = {
  childrenEducation: 2000, // 每个子女/月
  continueEducation: 400,  // 每月
  housingLoan: 1000,       // 每月
  housingRent: {
    0: 0,
    800: 800,
    1100: 1100,
    1500: 1500
  },
  supportElderly: {
    0: 0,
    1500: 1500,
    3000: 3000
  },
  babyCare: 2000 // 每个婴幼儿/月
}

// 计算专项附加扣除合计
const calculateSpecialAddDeduction = (items) => {
  let total = 0

  // 子女教育
  if (items.childrenEducation) {
    total += items.childrenEducationCount * specialAddConfig.childrenEducation
  }

  // 继续教育
  if (items.continueEducation) {
    if (items.continueEducationType === 'monthly') {
      total += specialAddConfig.continueEducation
    } else if (items.continueEducationType === 'annual') {
      total += 3600 // 职业资格证书：一次性3600元，无需分摊
    }
  }

  // 住房贷款利息
  if (items.housingLoan) {
    total += specialAddConfig.housingLoan
  }

  // 住房租金
  if (items.housingRent) {
    total += specialAddConfig.housingRent[items.housingRentType] || 0
  }

  // 赡养老人
  if (items.supportElderly) {
    if (items.supportElderlyType === '3000') {
      total += 3000
    } else if (items.supportElderlyType === '1500') {
      total += Math.min(items.supportElderlyShare || 1500, 1500) // 最高1500元/月
    }
  }

  // 婴幼儿照护
  if (items.babyCare) {
    total += items.babyCareCount * specialAddConfig.babyCare
  }

  return total
}

// 住房贷款/租金互斥处理
const handleHousingMutual = (type) => {
  if (type === 'loan') {
    props.items.housingRent = false
  } else {
    props.items.housingLoan = false
  }
  handleChange()
}

// 处理变化
const handleChange = () => {
  emit('update', { ...props.items })
}

// 计算扣除总额
const deductionTotal = computed(() => {
  return calculateSpecialAddDeduction(props.items)
})
</script>

<style scoped>
.form-group {
  margin-bottom: 30px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 6px;
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

.deduction-section {
  margin-top: 15px;
  padding: 15px;
  background: #e8f4f8;
  border-radius: 6px;
}

.sub-title {
  font-size: 0.95rem;
  color: #444;
  margin-bottom: 15px;
  padding-bottom: 8px;
  border-bottom: 1px solid #d0e6f0;
}

/* 扣除项分组 */
.deduction-groups {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 20px;
}

.deduction-group {
  background: #ffffff;
  border-radius: 6px;
  padding: 15px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.deduction-group-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
  padding-bottom: 6px;
  border-bottom: 1px solid #f0f0f0;
}

.deduction-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.deduction-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  padding: 8px 0;
  border-bottom: 1px solid #f9f9f9;
}

.deduction-item:last-child {
  border-bottom: none;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  flex: 1;
  min-width: 120px;
}

.deduction-select {
  flex: 1;
  min-width: 180px;
  padding: 6px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.85rem;
  background: #f9f9f9;
  transition: border-color 0.2s;
}

.deduction-select:focus {
  outline: none;
  border-color: #42b983;
  box-shadow: 0 0 0 2px rgba(66, 185, 131, 0.1);
}

.deduction-select:disabled {
  background: #f0f0f0;
  cursor: not-allowed;
}

.deduction-amount {
  font-size: 0.85rem;
  color: #666;
  font-weight: 500;
  min-width: 100px;
  text-align: right;
}

.deduction-input {
  flex: 1;
  min-width: 150px;
  padding: 6px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.85rem;
  background: #f9f9f9;
  transition: border-color 0.2s;
}

.deduction-input:focus {
  outline: none;
  border-color: #42b983;
  box-shadow: 0 0 0 2px rgba(66, 185, 131, 0.1);
}

/* 扣除合计 */
.deduction-summary {
  margin-top: 20px;
  padding: 15px;
  background: #ffffff;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.summary-content {
  font-weight: 500;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.summary-value {
  color: #42b983;
  font-size: 1.1rem;
  font-weight: bold;
}

.summary-tip {
  font-size: 0.8rem;
  color: #666;
  text-align: right;
  margin-top: 5px;
}

.special-note {
  display: block;
  margin-top: 8px;
  font-style: italic;
}

.highlight {
  color: #ff6b6b;
  font-weight: bold;
  background-color: #fff5f5;
  padding: 0 4px;
  border-radius: 2px;
}

@media (max-width: 768px) {
  .deduction-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .deduction-select {
    min-width: 100%;
    width: 100%;
  }

  .deduction-amount {
    min-width: auto;
    text-align: left;
  }

  .summary-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }

  .summary-tip {
    text-align: left;
  }
}
</style>
