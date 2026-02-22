<!-- .vitepress/components/MonthCard.vue -->
<template>
  <div class="month-card" :class="{ 'expanded': monthData.expanded && isFirstExpanded }">
    <div class="month-card-header">
      <button class="expand-btn" @click.stop="$emit('toggle-expand', index)">
        <h4>{{ index + 1 }}月</h4>
        <span class="card-summary">
          税前：¥{{ (parseFloat(monthData.data.preTaxSalary) || 0).toFixed(2) }} | 税后预估：¥{{ monthData.result.afterTaxSalary.toFixed(2) }} | 个税：¥{{ monthData.result.personalTax.toFixed(2) }}
        </span>
        <span class="expand-icon">{{ monthData.expanded ? '▼' : '▶' }}</span>
      </button>
    </div>

    <!-- 月份详细设置（展开时显示） -->
    <div v-show="monthData.expanded" class="month-card-body">
      <!-- 基础薪资 -->
      <div class="form-group small-group">
        <h5 class="small-group-title">基础薪资</h5>
        <div class="form-grid small-grid">
          <div class="form-item">
            <label>税前工资（元）：</label>
            <input
                type="number"
                v-model.number="monthData.data.preTaxSalary"
                min="0"
                @input="$emit('update', index)"
            >
          </div>
          <div class="form-item">
            <label>社保基数（元）：</label>
            <input
                type="number"
                v-model.number="monthData.data.socialSecurityBase"
                min="0"
                :placeholder="`默认等于税前工资, ${monthData.data.preTaxSalary}`"
                @input="handleSocialSecurityBaseChange"
            >
          </div>
          <div class="form-item">
            <label>大病互助/长护险（元）：</label>
            <input
                type="number"
                v-model.number="monthData.data.medicalExtraFee"
                min="0"
                @input="$emit('update', index)"
            >
          </div>
        </div>
      </div>

      <!-- 公积金设置 -->
      <div class="form-group small-group">
        <h5 class="small-group-title">公积金设置</h5>
        <div class="form-item checkbox-item">
          <label class="checkbox-label">
            <input
                type="checkbox"
                v-model="monthData.data.enableFund"
                @change="$emit('update', index)"
            >
            缴纳公积金
          </label>
        </div>
        <div v-if="monthData.data.enableFund" class="form-grid small-grid">
          <div class="form-item">
            <label>公积金基数（元）：</label>
            <input
                type="number"
                v-model.number="monthData.data.fundBase"
                min="0"
                :placeholder="`默认等于社保基数, ${monthData.data.socialSecurityBase || monthData.data.preTaxSalary}`"
                @input="$emit('update', index)"
            >
          </div>
          <div class="form-item">
            <label>个人比例（%）：</label>
            <input
                type="number"
                v-model.number="monthData.data.fundPersonalRate"
                min="0"
                max="12"
                @input="$emit('update', index)"
            >
          </div>
        </div>
      </div>

      <!-- 年金设置 -->
      <div class="form-group small-group">
        <h5 class="small-group-title">年金设置</h5>
        <div class="form-item checkbox-item">
          <label class="checkbox-label">
            <input
                type="checkbox"
                v-model="monthData.data.enableAnnuity"
                @change="$emit('update', index)"
            >
            缴纳年金
          </label>
        </div>
        <div v-if="monthData.data.enableAnnuity" class="form-grid small-grid">
          <div class="form-item">
            <label>年金基数（元）：</label>
            <input
                type="number"
                v-model.number="monthData.data.annuityBase"
                min="0"
                :placeholder="`默认等于社保基数, ${monthData.data.socialSecurityBase || monthData.data.preTaxSalary}`"
                @input="$emit('update', index)"
            >
          </div>
          <div class="form-item">
            <label>个人比例（%）：</label>
            <input
                type="number"
                v-model.number="monthData.data.annuityPersonalRate"
                min="0"
                max="4"
                @input="$emit('update', index)"
            >
          </div>
        </div>
      </div>

      <!-- 专项附加扣除 -->
      <div class="form-group small-group">
        <h5 class="small-group-title">专项附加扣除</h5>
        <div class="deduction-items small-deduction">
          <!-- 子女教育 -->
          <div class="deduction-item">
            <label class="checkbox-label">
              <input
                  type="checkbox"
                  v-model="monthData.data.specialAddItems.childrenEducation"
                  @change="handleSpecialAddUpdate"
              >
              子女教育
            </label>
            <select
                v-model="monthData.data.specialAddItems.childrenEducationCount"
                @change="handleSpecialAddUpdate"
                :disabled="!monthData.data.specialAddItems.childrenEducation"
            >
              <option value="0">0个</option>
              <option value="1">1个（2000）</option>
              <option value="2">2个（4000）</option>
              <option value="3">3个+（6000）</option>
            </select>
          </div>

          <!-- 住房贷款 -->
          <div class="deduction-item">
            <label class="checkbox-label">
              <input
                  type="checkbox"
                  v-model="monthData.data.specialAddItems.housingLoan"
                  @change="handleHousingMutual('loan')"
              >
              住房贷款
            </label>
            <span class="deduction-amount">1000元/月</span>
          </div>

          <!-- 住房租金 -->
          <div class="deduction-item">
            <label class="checkbox-label">
              <input
                  type="checkbox"
                  v-model="monthData.data.specialAddItems.housingRent"
                  @change="handleHousingMutual('rent')"
              >
              住房租金
            </label>
            <select
                v-model="monthData.data.specialAddItems.housingRentType"
                @change="handleSpecialAddUpdate"
                :disabled="!monthData.data.specialAddItems.housingRent"
            >
              <option value="0">不适用</option>
              <option value="800">其他城市</option>
              <option value="1100">市辖区≥100万</option>
              <option value="1500">直辖市/省会</option>
            </select>
          </div>

          <!-- 继续教育 -->
          <div class="deduction-item">
            <label class="checkbox-label">
              <input
                  type="checkbox"
                  v-model="monthData.data.specialAddItems.continueEducation"
                  @change="handleSpecialAddUpdate"
              >
              继续教育
            </label>
            <select
                v-model="monthData.data.specialAddItems.continueEducationType"
                @change="handleSpecialAddUpdate"
                :disabled="!monthData.data.specialAddItems.continueEducation"
            >
              <option value="monthly">学历（400元/月）</option>
              <option value="annual">职业资格（3600元/年）</option>
            </select>
          </div>

          <!-- 赡养老人 -->
          <div class="deduction-item">
            <label class="checkbox-label">
              <input
                  type="checkbox"
                  v-model="monthData.data.specialAddItems.supportElderly"
                  @change="handleSpecialAddUpdate"
              >
              赡养老人
            </label>
            <select
                v-model="monthData.data.specialAddItems.supportElderlyType"
                @change="handleSpecialAddUpdate"
                :disabled="!monthData.data.specialAddItems.supportElderly"
            >
              <option value="3000">独生子女（3000）</option>
              <option value="1500">非独生子女（1500）</option>
            </select>
          </div>

          <!-- 非独生子女分摊金额 -->
          <div v-if="monthData.data.specialAddItems.supportElderly && monthData.data.specialAddItems.supportElderlyType === '1500'" class="deduction-item">
            <label class="checkbox-label">分摊金额（元）：</label>
            <input
                type="number"
                v-model.number="monthData.data.specialAddItems.supportElderlyShare"
                min="0"
                max="1500"
                placeholder="最高1500"
                @input="handleSpecialAddUpdate"
            >
          </div>

          <!-- 婴幼儿照护 -->
          <div class="deduction-item">
            <label class="checkbox-label">
              <input
                  type="checkbox"
                  v-model="monthData.data.specialAddItems.babyCare"
                  @change="handleSpecialAddUpdate"
              >
              婴幼儿照护
            </label>
            <select
                v-model="monthData.data.specialAddItems.babyCareCount"
                @change="handleSpecialAddUpdate"
                :disabled="!monthData.data.specialAddItems.babyCare"
            >
              <option value="0">0个</option>
              <option value="1">1个（2000）</option>
              <option value="2">2个（4000）</option>
              <option value="3">3个+（6000）</option>
            </select>
          </div>

          <!-- 其他扣除项 -->
          <div class="form-grid small-grid">
            <div class="form-item">
              <label>税延险（元）：</label>
              <input
                  type="number"
                  v-model.number="monthData.data.taxDeferredInsurance"
                  min="0"
                  @input="$emit('update', index)"
              >
            </div>
            <div class="form-item">
              <label>个人养老金（元）：</label>
              <input
                  type="number"
                  v-model.number="monthData.data.personalPension"
                  min="0"
                  @input="$emit('update', index)"
              >
            </div>
            <div class="form-item">
              <label>捐赠扣除（元）：</label>
              <input
                  type="number"
                  v-model.number="monthData.data.donationDeduction"
                  min="0"
                  @input="$emit('update', index)"
              >
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  index: {
    type: Number,
    required: true
  },
  monthData: {
    type: Object,
    required: true
  },
  isFirstExpanded: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update', 'toggle-expand', 'update-special-add', 'housing-mutual'])

// 监听社保基数变化，自动更新未设置的公积金和年金基数
const handleSocialSecurityBaseChange = () => {
  if (monthData.data.enableFund && (monthData.data.fundBase === null || monthData.data.fundBase === undefined)) {
    monthData.data.fundBase = monthData.data.socialSecurityBase
  }
  if (monthData.data.enableAnnuity && (monthData.data.annuityBase === null || monthData.data.annuityBase === undefined)) {
    monthData.data.annuityBase = monthData.data.socialSecurityBase
  }
  emit('update', props.index)
}

// 处理专项附加扣除更新
const handleSpecialAddUpdate = () => {
  emit('update-special-add', props.index)
  emit('update', props.index)
}

// 住房贷款/租金互斥处理
const handleHousingMutual = (type) => {
  emit('housing-mutual', props.index, type)
  handleSpecialAddUpdate()
}
</script>

<style scoped>
.month-card {
  border: 2px solid transparent;
  border-radius: 6px;
  background: #fff;
  overflow: hidden;
  margin-bottom: 10px;
  transition: border-color 0.3s ease;
}

/* 展开状态的边框样式 */
.month-card.expanded {
  border-color: #ff6b6b;
}

.month-card-header {
  padding: 0;
  background: #f5f7fa;
}

.expand-btn {
  width: 100%;
  padding: 10px 15px;
  background: transparent;
  border: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  text-align: left;
  font-family: inherit;
}

.expand-btn:hover {
  background: #e9ecef;
}

.expand-btn h4 {
  font-size: 1rem;
  color: #333;
  margin: 0;
}

.card-summary {
  font-size: 0.85rem;
  color: #666;
  flex: 1;
  text-align: center;
  margin: 0 10px;
}

.expand-icon {
  color: #42b983;
  font-weight: bold;
  width: 20px;
  text-align: center;
}

.month-card-body {
  padding: 15px;
  border-top: 1px solid #eee;
  transition: all 0.2s ease;
}

.small-group {
  margin-bottom: 15px;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 4px;
}

.small-group-title {
  font-size: 0.9rem;
  color: #444;
  margin-bottom: 8px;
}

.small-grid {
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 10px;
}

.small-deduction {
  gap: 8px;
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

.checkbox-item {
  flex-direction: row;
  align-items: center;
  margin-bottom: 10px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.deduction-items {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.deduction-item {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.deduction-amount {
  font-size: 0.85rem;
  color: #42b983;
  font-weight: 500;
  min-width: 120px;
  text-align: right;
}

@media (max-width: 768px) {
  .month-card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }

  .card-summary {
    font-size: 0.8rem;
    width: 100%;
  }
}
</style>
