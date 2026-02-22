<!-- .vitepress/components/SalaryCalculator.vue -->
<template>
  <div class="salary-calculator">
<!--    <h2 class="calc-title">工资社保年金税后计算器</h2>-->

    <!-- 模式切换组件 -->
    <CalculatorModeSwitch
        v-model="calcMode"
    />

    <!-- 月度计算模块 -->
    <div v-if="calcMode === 'monthly'" class="monthly-section">
      <!-- 月度基础表单 -->
      <MonthlyBasicForm
          :data="monthlyData"
          @update="calculateMonthly"
          @update-medical-fee="calculateMonthly"
      />

      <!-- 专项附加扣除 -->
      <SpecialDeduction
          :items="monthlyData.specialAddItems"
          @update="handleSpecialAddUpdate"
      />

      <!-- 其他个税扣除 -->
      <OtherTaxDeduction
          :data="monthlyData"
          @update="calculateMonthly"
      />

      <!-- 月度结果展示 -->
      <MonthlyResult
          :data="monthlyData"
          :result="monthlyResult"
      />
    </div>

    <!-- 年度计算模块 -->
    <div v-if="calcMode === 'yearly'" class="yearly-section">
      <div class="yearly-tips">
        <p>💡 支持为每个月份设置不同的税前工资、基数和扣除项，点击月份卡片可展开/收起详细设置</p>
      </div>
      <div class="yearly-settings">
        <h4 class="settings-title">年度计算设置</h4>

        <!-- 7月变更基数设置 -->
        <div class="setting-section">
          <div class="checkbox-item">
            <label class="checkbox-label">
              <input
                  type="checkbox"
                  v-model="julyBaseChange.enable"
                  @change="calculateAllYearlyMonths"
              >
              启用7月变更基数
            </label>
          </div>

          <div v-if="julyBaseChange.enable" class="base-change-settings">
            <div class="form-grid">
              <div class="form-item">
                <label>社保基数（元）：</label>
                <input
                  type="number"
                  v-model.number="julyBaseChange.socialSecurityBase"
                  min="0"
                  :placeholder="`默认等于当前社保基数, ${monthlyData.socialSecurityBase}`"
                  @input="calculateAllYearlyMonths"
              >
              </div>
              <div class="form-item">
                <label>公积金基数（元）：</label>
                <input
                  type="number"
                  v-model.number="julyBaseChange.fundBase"
                  min="0"
                  :placeholder="`默认等于社保基数, ${julyBaseChange.socialSecurityBase || monthlyData.socialSecurityBase}`"
                  @input="calculateAllYearlyMonths"
              >
              </div>
              <div class="form-item">
                <label>年金基数（元）：</label>
                <input
                  type="number"
                  v-model.number="julyBaseChange.annuityBase"
                  min="0"
                  :placeholder="`默认等于社保基数, ${julyBaseChange.socialSecurityBase || monthlyData.socialSecurityBase}`"
                  @input="calculateAllYearlyMonths"
              >
              </div>
            </div>

          </div>
          <small class="form-tip">注：部分省份(如：北京、湖北等)社保年度非自然年,为当年7月至次年6月。启用后，7月及以后的月份将使用新设置的基数。如果公积金或年金基数未设置但启用了对应功能，则使用社保基数。</small>
        </div>
      </div>

      <!-- 年度工具栏 -->
      <div class="yearly-toolbar">
        <button class="btn" @click="copyMonthlyToCurrentMonth">将月度计算基础数据复制到<span class="highlight">当前月</span>设置</button>
        <button class="btn" @click="copyCurrentMonthToSubsequent">将<span class="highlight">当前月</span>设置复制到后续月份</button>
        <button class="btn" @click="toggleAllExpand">一键折叠/展开所有月份</button>
        <button class="btn btn-secondary" @click="resetYearlyData">重置所有月份数据</button>
      </div>

      <!-- 月份卡片列表 -->
      <div class="months-list">
        <MonthCard
            v-for="(month, index) in yearlyMonths"
            :key="index"
            :index="index"
            :month-data="month"
            :is-first-expanded="index === firstExpandedIndex"
            @update="calculateYearlyMonth"
            @toggle-expand="toggleMonthExpand"
            @update-special-add="calculateSpecialAddDeductionForMonth"
            @housing-mutual="handleHousingMutualExclusionForMonth"
        />
      </div>

      <!-- 年度结果展示 -->
      <YearlyResult
          :summary="yearlySummary"
          :months="yearlyMonths"
      />
    </div>
  </div>
</template>

<script setup>
import CalculatorModeSwitch from './CalculatorModeSwitch.vue'
import MonthlyBasicForm from './MonthlyBasicForm.vue'
import SpecialDeduction from './SpecialDeduction.vue'
import OtherTaxDeduction from './OtherTaxDeduction.vue'
import MonthlyResult from './MonthlyResult.vue'
import MonthCard from './MonthCard.vue'
import YearlyResult from './YearlyResult.vue'
import { useSalaryCalculator } from './composables/useSalaryCalculator.js'

// 使用薪资计算器 composable
const {
  calcMode,
  monthlyData,
  monthlyResult,
  yearlyMonths,
  firstExpandedIndex,
  yearlySummary,
  julyBaseChange,
  init,
  resetYearlyData,
  copyMonthlyToCurrentMonth,
  copyCurrentMonthToSubsequent,
  toggleMonthExpand,
  toggleAllExpand,
  handleSpecialAddUpdate,
  handleHousingMutualExclusionForMonth,
  calculateYearlyMonth,
  calculateMonthly,
  calculateAllYearlyMonths,
  calculateSpecialAddDeductionForMonth
} = useSalaryCalculator()

// 初始化薪资计算器
init()
</script>

<style scoped>
.salary-calculator {
  max-width: 100%;
  margin: 20px 0;
  padding: 20px;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.calc-title {
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.monthly-section, .yearly-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.yearly-tips {
  padding: 10px 15px;
  background: #e8f4f8;
  border-radius: 6px;
  font-size: 0.9rem;
  color: #444;
}

.yearly-settings {
  margin-bottom: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.settings-title {
  font-size: 1.1rem;
  color: #333;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e0e0e0;
}

.setting-section {
  margin-bottom: 20px;
}

.base-change-settings {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #eee;
}

.form-tip {
  display: block;
  margin-top: 10px;
  color: #666;
  font-size: 0.85rem;
}

/* 表单网格布局 */
.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
}

/* 表单项目 */
.form-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-item label {
  color: #555;
  font-size: 0.9rem;
  font-weight: 500;
}

.form-item input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
  transition: border-color 0.2s;
  min-width: 200px;
}

.form-item input:focus {
  outline: none;
  border-color: #42b983;
  box-shadow: 0 0 0 2px rgba(66, 185, 131, 0.2);
}

/* 复选框项目 */
.checkbox-item {
  flex-direction: row;
  align-items: center;
}

.months-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  margin-bottom: 30px;
}

/* 年度工具栏样式 */
.yearly-toolbar {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.yearly-toolbar .btn {
  padding: 8px 15px;
  background: #42b983;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.yearly-toolbar .btn-secondary {
  background: #6c757d;
}

/* 高亮样式 */
.highlight {
  color: #ff6b6b;
  font-weight: bold;
}

@media (max-width: 768px) {
  .yearly-toolbar {
    flex-direction: column;
  }

  .yearly-toolbar .btn {
    width: 100%;
  }
}

/* 移动端适配 */
@media (max-width: 1200px) {
  .months-list {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .months-list {
    grid-template-columns: 1fr;
  }
}
</style>