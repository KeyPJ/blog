<!-- .vitepress/components/MonthlyBasicForm.vue -->
<template>
  <div class="monthly-basic-form">
    <!-- 基础薪资 -->
    <div class="form-group">
      <h3 class="group-title">一、基础薪资</h3>
      <div class="form-grid">
        <div class="form-item">
          <label>税前工资（元）：<span class="required">*</span></label>
          <input
              type="number"
              v-model.number="data.preTaxSalary"
              min="0"
              placeholder="请输入本月税前工资"
              @input="$emit('update')"
          >
        </div>
        <div class="form-item">
          <label>社保基数（元）：</label>
          <input
              type="number"
              v-model.number="data.socialSecurityBase"
              min="0"
              :placeholder="`默认等于税前工资, ${data.preTaxSalary}`"
              @input="$emit('update')"
          >
        </div>
      </div>
    </div>

    <!-- 五险一金比例 -->
    <div class="form-group">
      <div class="group-header" @click="toggleSocialSecurityExpanded">
        <h3 class="group-title">二、社保公积金缴纳设置</h3>
        <span class="expand-icon">{{ socialSecurityExpanded ? '▼' : '▶' }}</span>
      </div>

      <div v-show="socialSecurityExpanded" class="group-content">
        <!-- 五险一金个人/单位比例展示 -->
        <div class="ratio-table">
          <h4 class="sub-title">社保个人/单位缴纳比例（可修改）</h4>
          <table class="small-table">
            <thead>
            <tr>
              <th>险种</th>
              <th>个人比例（%）</th>
              <th>单位比例（%）</th>
              <th>说明</th>
            </tr>
            </thead>
            <tbody>
            <tr>
              <td>养老保险</td>
              <td>
                <input
                    type="number"
                    v-model.number="data.pensionPersonalRate"
                    min="0"
                    max="20"
                    @input="$emit('update')"
                >
              </td>
              <td>
                <input
                    type="number"
                    v-model.number="data.pensionCompanyRate"
                    min="0"
                    max="20"
                    @input="$emit('update')"
                >
              </td>
              <td>-</td>
            </tr>
            <tr>
              <td>医疗保险（含生育）</td>
              <td>
                <input
                    type="number"
                    v-model.number="data.medicalPersonalRate"
                    min="0"
                    max="10"
                    @input="$emit('update')"
                >
              </td>
              <td>
                <input
                    type="number"
                    v-model.number="data.medicalCompanyRate"
                    min="0"
                    max="10"
                    @input="$emit('update')"
                >
              </td>
              <td>已合并生育保险</td>
            </tr>
            <tr>
              <td>失业保险</td>
              <td>
                <input
                    type="number"
                    v-model.number="data.unemploymentPersonalRate"
                    min="0"
                    max="2"
                    @input="$emit('update')"
                >
              </td>
              <td>
                <input
                    type="number"
                    v-model.number="data.unemploymentCompanyRate"
                    min="0"
                    max="2"
                    @input="$emit('update')"
                >
              </td>
              <td>-</td>
            </tr>
            <tr>
              <td>工伤保险</td>
              <td>0</td>
              <td>
                <input
                    type="number"
                    v-model.number="data.injuryCompanyRate"
                    min="0"
                    max="2"
                    @input="$emit('update')"
                >
              </td>
              <td>仅单位缴纳</td>
            </tr>
            </tbody>
          </table>
        </div>

        <!-- 社保缴费比例参考（北京） -->
        <div class="social-security-tips">
          <h5>参考：北京社保缴费比例</h5>
          <p>以下为北京市2024年社保缴费比例参考：</p>
          <ul>
            <li>养老保险：个人8%，单位16%</li>
            <li>医疗保险：个人2% +3 ，单位9.8%（含生育）</li>
            <li>失业保险：个人0.5%，单位0.5%</li>
            <li>工伤保险：个人0%，单位0.2%-1.9%（根据行业不同）</li>
            <li>公积金：个人5%-12%，单位5%-12%（双方比例一致）</li>
          </ul>
          <p>注：具体缴费比例可能因地区、行业和政策调整而有所不同，请以当地最新政策为准。</p>
        </div>

        <!-- 医保相关新增项 -->
        <div class="form-grid" style="margin-top: 15px;">
          <div class="form-item">
            <label>大病互助/长护险（元/月）：</label>
            <input
                type="number"
                v-model.number="data.medicalExtraFee"
                min="0"
                placeholder="例如：3元/月"
                @input="$emit('update-medical-fee')"
            >
          </div>
        </div>

        <!-- 公积金设置 -->
        <div class="form-item checkbox-item" style="margin-top: 15px;">
          <label class="checkbox-label">
            <input
                type="checkbox"
                v-model="data.enableFund"
                @change="$emit('update')"
            >
            是否缴纳公积金
          </label>
        </div>

        <!-- 公积金设置（仅勾选后显示） -->
        <div v-if="data.enableFund" class="form-grid fund-grid">
          <div class="form-item">
            <label>公积金基数（元）：</label>
            <input
                type="number"
                v-model.number="data.fundBase"
                min="0"
                :placeholder="`默认等于社保基数, ${data.socialSecurityBase||data.preTaxSalary}`"
                @input="$emit('update')"
            >
          </div>
          <div class="form-item">
            <label>公积金个人缴纳比例（%）：</label>
            <input
                type="number"
                v-model.number="data.fundPersonalRate"
                min="0"
                max="12"
                placeholder="默认7%"
                @input="$emit('update')"
            >
          </div>
          <div class="form-item">
            <label>公积金单位缴纳比例（%）：</label>
            <input
                type="number"
                v-model.number="data.fundCompanyRate"
                min="0"
                max="12"
                placeholder="默认7%"
                @input="$emit('update')"
            >
          </div>
        </div>

        <!-- 个人专项扣除（不可手动修改） -->
        <div class="deduction-summary special-deduction-summary" style="margin-top: 20px;">
          <div class="summary-content">
            <span class="summary-label">个人专项扣除（三险+大病/长护险+公积金）（元）：</span>
            <span class="summary-value">¥{{ autoDeduction() }}</span>
          </div>
          <small class="summary-tip">自动计算，包含养老+医疗+失业+大病/长护险+公积金</small>
        </div>
      </div>
    </div>

    <!-- 年金设置 -->
    <div class="form-group">
      <div class="group-header" @click="toggleAnnuityExpanded">
        <h3 class="group-title">三、年金缴纳设置</h3>
        <span class="expand-icon">{{ annuityExpanded ? '▼' : '▶' }}</span>
      </div>

      <div v-show="annuityExpanded" class="group-content">
        <div class="form-item checkbox-item">
          <label class="checkbox-label">
            <input
                type="checkbox"
                v-model="data.enableAnnuity"
                @change="$emit('update')"
            >
            是否缴纳企业年金/职业年金
          </label>
        </div>

        <!-- 年金设置（仅勾选后显示） -->
        <div v-if="data.enableAnnuity" class="form-grid annuity-grid">
          <div class="form-item">
            <label>年金基数（元）：</label>
            <input
                type="number"
                v-model.number="data.annuityBase"
                min="0"
                :placeholder="`默认等于社保基数, ${data.socialSecurityBase||data.preTaxSalary}`"
                @input="$emit('update')"
            >
          </div>
          <div class="form-item">
            <label>年金个人缴纳比例（%）：</label>
            <input
                type="number"
                v-model.number="data.annuityPersonalRate"
                min="0"
                max="4"
                placeholder="默认1%"
                @input="$emit('update')"
            >
          </div>
          <div class="form-item">
            <label>年金单位缴纳比例（%）：</label>
            <input
                type="number"
                v-model.number="data.annuityCompanyRate"
                min="0"
                max="8"
                placeholder="默认4%"
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

const emit = defineEmits(['update', 'update-medical-fee'])

// 折叠展开状态
const socialSecurityExpanded = ref(true) // 社保公积金缴纳设置默认展开
const annuityExpanded = ref(false) // 年金缴纳设置默认折叠

// 切换社保公积金缴纳设置的折叠状态
const toggleSocialSecurityExpanded = () => {
  socialSecurityExpanded.value = !socialSecurityExpanded.value
}

// 切换年金缴纳设置的折叠状态
const toggleAnnuityExpanded = () => {
  annuityExpanded.value = !annuityExpanded.value
}

// 计算自动扣除额（用于展示）
const autoDeduction = () => {
  const data = props.data
  const base = data.socialSecurityBase === null || data.socialSecurityBase === undefined || data.socialSecurityBase === 0 ? data.preTaxSalary : data.socialSecurityBase
  const pension = base * data.pensionPersonalRate / 100
  const medical = base * data.medicalPersonalRate / 100
  const unemployment = base * data.unemploymentPersonalRate / 100
  const medicalExtra = data.medicalExtraFee || 0

  // 计算公积金
  let fund = 0
  if (data.enableFund) {
    const fundBase = data.fundBase === null || data.fundBase === undefined || data.fundBase === 0 ? base : data.fundBase
    fund = fundBase * data.fundPersonalRate / 100
  }

  return (pension + medical + unemployment + medicalExtra + fund).toFixed(2)
}
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

.required {
  color: #e64343;
}

.form-item input {
  padding: 8px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
  transition: border-color 0.2s;
}

.readonly-input {
  background: #f5f7fa;
  color: #333;
  cursor: not-allowed;
}

.input-tip {
  font-size: 0.8rem;
  color: #666;
  margin-top: 4px;
}

/* 个人专项扣除展示样式 */
.special-deduction-display {
  background: #e8f4f8;
  padding: 15px;
  border-radius: 6px;
  margin-top: 20px;
}

.special-deduction-display .form-item {
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.deduction-value {
  font-size: 1.1rem;
  font-weight: bold;
  color: #42b983;
  min-width: 150px;
  text-align: right;
}

/* 社保缴费比例tips */
.social-security-tips {
  margin-top: 15px;
  padding: 15px;
  background: #f0f8ff;
  border-radius: 6px;
  border-left: 4px solid #3498db;
}

.social-security-tips h5 {
  font-size: 0.9rem;
  color: #333;
  margin-bottom: 10px;
}

.social-security-tips p {
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 5px;
}

.social-security-tips ul {
  font-size: 0.85rem;
  color: #666;
  margin-top: 5px;
  margin-left: 20px;
}

.social-security-tips li {
  margin-bottom: 3px;
}

/* 个人专项扣除合计样式（与专项附加扣除合计保持一致） */
.special-deduction-summary {
  background: #ffffff;
  border-radius: 6px;
  padding: 15px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  margin-top: 20px;
}

.special-deduction-summary .summary-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.special-deduction-summary .summary-label {
  font-weight: 500;
  color: #333;
}

.special-deduction-summary .summary-value {
  font-size: 1.1rem;
  font-weight: bold;
  color: #42b983;
  min-width: 150px;
  text-align: right;
}

.special-deduction-summary .summary-tip {
  font-size: 0.8rem;
  color: #666;
  text-align: right;
  margin-top: 4px;
}

.form-item input:focus {
  outline: none;
  border-color: #42b983;
  box-shadow: 0 0 0 2px rgba(66, 185, 131, 0.1);
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

/* 比例表格 */
.ratio-table {
  margin-top: 15px;
}

.small-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
}

.small-table th, .small-table td {
  padding: 6px 8px;
  text-align: center;
  border: 1px solid #eee;
}

.small-table th {
  background: #f5f7fa;
}

.small-table input {
  width: 60px;
  text-align: center;
  padding: 4px;
}

.sub-title {
  font-size: 0.95rem;
  color: #444;
  margin-bottom: 10px;
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
