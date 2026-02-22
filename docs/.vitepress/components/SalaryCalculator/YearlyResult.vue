<!-- .vitepress/components/YearlyResult.vue -->
<template>
  <div class="yearly-result">
    <div class="result-section yearly-result">
      <h3 class="result-title">年度汇总结果</h3>
      <div class="core-result">
        <div class="result-item highlight">
          <span class="label">全年税后工资总计：</span>
          <span class="value">¥{{ summary.totalAfterTax.toFixed(2) }}</span>
        </div>
        <div class="result-item">
          <span class="label">全年应缴个税总计：</span>
          <span class="value">¥{{ summary.totalTax.toFixed(2) }}</span>
        </div>
        <div class="result-item">
          <span class="label">全年税前扣除总计：</span>
          <span class="value">¥{{ summary.totalPreTaxDeduction.toFixed(2) }}</span>
        </div>
        <div class="result-item">
          <span class="label">全年个税扣除总计：</span>
          <span class="value">¥{{ summary.totalSpecialAddDeduction.toFixed(2) }}</span>
        </div>
      </div>

      <!-- 逐月税后明细表格 -->
      <div class="yearly-detail-table">
        <div class="table-header">
          <h4 class="sub-title">逐月税后明细</h4>
          <div class="table-controls">
            <label class="checkbox-label">
              <input
                  type="checkbox"
                  v-model="hideCompanyColumns"
              >
              隐藏企业部分
            </label>
            <button class="export-btn" @click="exportToExcel">
              导出CSV
            </button>
          </div>
        </div>
        <div class="table-container">
          <table class="detail-table">
            <thead>
            <tr>
              <th>月份</th>
              <th>税前工资</th>
              <th>社保基数</th>
              <th>养老</th>
              <th>失业</th>
              <th>医疗</th>
              <th>大病互助/长护险</th>
              <th>公积金基数</th>
              <th>公积金</th>
              <th>年金基数</th>
              <th>企业年金</th>
              <th>应纳税所得额</th>
              <th>累计应纳税所得额</th>
              <th>税率</th>
              <th>速算扣除数</th>
              <th>累计应纳税额</th>
              <th>已缴税额</th>
              <th>本月应缴税额</th>
              <th>税后工资</th>
              <th v-if="!hideCompanyColumns">公司养老保险</th>
              <th v-if="!hideCompanyColumns">公司失业保险</th>
              <th v-if="!hideCompanyColumns">公司医疗保险</th>
              <th v-if="!hideCompanyColumns">公司工伤保险</th>
              <th v-if="!hideCompanyColumns">公司公积金</th>
              <th v-if="!hideCompanyColumns">公司企业年金</th>
              <th v-if="!hideCompanyColumns">公司额外支出</th>
              <th v-if="!hideCompanyColumns">公司总支出</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="(month, index) in months" :key="index">
              <td>{{ index + 1 }}月</td>
              <td>{{ formatNumber(month.data.preTaxSalary) }}</td>
              <td>{{ formatNumber(month.data.socialSecurityBase || month.data.preTaxSalary) }}</td>
              <td>{{ month.result.pensionPersonal.toFixed(2) }}</td>
              <td>{{ month.result.unemploymentPersonal.toFixed(2) }}</td>
              <td>{{ month.result.medicalPersonal.toFixed(2) }}</td>
              <td>{{ formatNumber(month.data.medicalExtraFee) }}</td>
              <td>{{ formatNumber(calculateBase(month.data.enableFund, month.data.fundBase, month.data.socialSecurityBase, month.data.preTaxSalary)) }}</td>
              <td>{{ month.result.fundPersonal.toFixed(2) }}</td>
              <td>{{ formatNumber(calculateBase(month.data.enableAnnuity, month.data.annuityBase, month.data.socialSecurityBase, month.data.preTaxSalary)) }}</td>
              <td>{{ month.result.annuityPersonal.toFixed(2) }}</td>
              <td>{{ (month.result.taxableIncome || 0).toFixed(2) }}</td>
              <td>{{ (month.result.cumulativeTaxableIncome || 0).toFixed(2) }}</td>
              <td>{{ (month.result.taxRate || 0) }}%</td>
              <td>{{ (month.result.quickDeduction || 0).toFixed(2) }}</td>
              <td>{{ (month.result.cumulativeTax || 0).toFixed(2) }}</td>
              <td>{{ (month.result.paidTax || 0).toFixed(2) }}</td>
              <td>{{ month.result.personalTax.toFixed(2) }}</td>
              <td>{{ month.result.afterTaxSalary.toFixed(2) }}</td>
              <td v-if="!hideCompanyColumns">{{ month.result.pensionCompany.toFixed(2) }}</td>
              <td v-if="!hideCompanyColumns">{{ month.result.unemploymentCompany.toFixed(2) }}</td>
              <td v-if="!hideCompanyColumns">{{ month.result.medicalCompany.toFixed(2) }}</td>
              <td v-if="!hideCompanyColumns">{{ month.result.injuryCompany.toFixed(2) }}</td>
              <td v-if="!hideCompanyColumns">{{ month.result.fundCompany.toFixed(2) }}</td>
              <td v-if="!hideCompanyColumns">{{ month.result.annuityCompany.toFixed(2) }}</td>
              <td v-if="!hideCompanyColumns">{{ calculateCompanyTotal(month).toFixed(2) }}</td>
              <td v-if="!hideCompanyColumns">{{ (month.data.preTaxSalary + calculateCompanyTotal(month)).toFixed(2) }}</td>
            </tr>
            <tr class="total-row">
              <td>总计</td>
              <td>{{ summary.totalPreTax.toFixed(2) }}</td>
              <td>-</td>
              <td>{{ calculateTotal('pensionPersonal').toFixed(2) }}</td>
              <td>{{ calculateTotal('unemploymentPersonal').toFixed(2) }}</td>
              <td>{{ calculateTotal('medicalPersonal').toFixed(2) }}</td>
              <td>{{ calculateTotalMedicalExtraFee().toFixed(2) }}</td>
              <td>-</td>
              <td>{{ calculateTotal('fundPersonal').toFixed(2) }}</td>
              <td>-</td>
              <td>{{ calculateTotal('annuityPersonal').toFixed(2) }}</td>
              <td>-</td>
              <td>-</td>
              <td>-</td>
              <td>-</td>
              <td>-</td>
              <td>-</td>
              <td>{{ summary.totalTax.toFixed(2) }}</td>
              <td>{{ summary.totalAfterTax.toFixed(2) }}</td>
              <td v-if="!hideCompanyColumns">{{ calculateTotal('pensionCompany').toFixed(2) }}</td>
              <td v-if="!hideCompanyColumns">{{ calculateTotal('unemploymentCompany').toFixed(2) }}</td>
              <td v-if="!hideCompanyColumns">{{ calculateTotal('medicalCompany').toFixed(2) }}</td>
              <td v-if="!hideCompanyColumns">{{ calculateTotal('injuryCompany').toFixed(2) }}</td>
              <td v-if="!hideCompanyColumns">{{ calculateTotal('fundCompany').toFixed(2) }}</td>
              <td v-if="!hideCompanyColumns">{{ calculateTotal('annuityCompany').toFixed(2) }}</td>
              <td v-if="!hideCompanyColumns">{{ calculateTotalCompanyTotal().toFixed(2) }}</td>
              <td v-if="!hideCompanyColumns">{{ (summary.totalPreTax + calculateTotalCompanyTotal()).toFixed(2) }}</td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 年度成本分析 -->
      <div class="yearly-cost-analysis">
        <h4 class="sub-title">年度成本分析</h4>
        <div class="cost-grid">
          <div class="cost-item">
            <span class="cost-label">员工全年税前收入：</span>
            <span class="cost-value">¥{{ summary.totalPreTax.toFixed(2) }}</span>
          </div>
          <div class="cost-item">
            <span class="cost-label">员工全年到手收入：</span>
            <span class="cost-value">¥{{ summary.totalAfterTax.toFixed(2) }}</span>
          </div>
          <div class="cost-item">
            <span class="cost-label">公司全年额外支出：</span>
            <span class="cost-value">¥{{ summary.totalCompanyPayment.toFixed(2) }}</span>
          </div>
          <div class="cost-item">
            <span class="cost-label">公司全年人力成本：</span>
            <span class="cost-value">¥{{ (summary.totalPreTax + summary.totalCompanyPayment).toFixed(2) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { Decimal } from 'decimal.js'

const props = defineProps({
  summary: {
    type: Object,
    required: true
  },
  months: {
    type: Array,
    required: true
  }
})

// 控制是否隐藏企业部分列
const hideCompanyColumns = ref(true)

// 计算基数的辅助函数
const calculateBase = (enable, base, defaultBase, preTaxSalary) => {
  return enable === true ? (base || defaultBase || preTaxSalary || 0) : 0
}

// 格式化数字的辅助函数
const formatNumber = (value) => {
  return (parseFloat(value) || 0).toFixed(2)
}

// 导出Excel功能
const exportToExcel = () => {
  // 准备表头
  let headers = [
    '月份', '税前工资', '养老', '失业', '医疗', '公积金', '大病互助/长护险',
    '企业年金', '应纳税所得额', '累计应纳税所得额', '税率', '速算扣除数',
    '累计应纳税额', '已缴税额', '本月应缴税额', '税后工资'
  ]

  // 如果显示企业部分，添加企业部分表头
  if (!hideCompanyColumns.value) {
    headers = headers.concat([
      '公司养老保险', '公司失业保险', '公司医疗保险', '公司工伤保险',
      '公司公积金', '公司企业年金', '公司额外支出', '公司总支出'
    ])
  }

  // 准备数据行
  const rows = []

  // 添加月度数据
  props.months.forEach((month, index) => {
    const row = [
      `${index + 1}月`,
      (parseFloat(month.data.preTaxSalary) || 0).toFixed(2),
      month.result.pensionPersonal.toFixed(2),
      month.result.unemploymentPersonal.toFixed(2),
      month.result.medicalPersonal.toFixed(2),
      month.result.fundPersonal.toFixed(2),
      (parseFloat(month.data.medicalExtraFee) || 0).toFixed(2),
      month.result.annuityPersonal.toFixed(2),
      calculateTaxableIncome(month).toFixed(2),
      calculateCumulativeTaxableIncome(index).toFixed(2),
      `${calculateTaxRate(index)}%`,
      calculateQuickDeduction(index).toFixed(2),
      calculateCumulativeTax(index).toFixed(2),
      calculatePaidTax(index).toFixed(2),
      month.result.personalTax.toFixed(2),
      month.result.afterTaxSalary.toFixed(2)
    ]

    // 如果显示企业部分，添加企业部分数据
    if (!hideCompanyColumns.value) {
      const companyExtraExpense = calculateCompanyTotal(month)
      const companyTotalExpense = parseFloat(month.data.preTaxSalary) + companyExtraExpense
      row.push(
        month.result.pensionCompany.toFixed(2),
        month.result.unemploymentCompany.toFixed(2),
        month.result.medicalCompany.toFixed(2),
        month.result.injuryCompany.toFixed(2),
        month.result.fundCompany.toFixed(2),
        month.result.annuityCompany.toFixed(2),
        companyExtraExpense.toFixed(2),
        companyTotalExpense.toFixed(2)
      )
    }

    rows.push(row)
  })

  // 添加总计行
  const totalRow = [
    '总计',
    props.summary.totalPreTax.toFixed(2),
    calculateTotal('pensionPersonal').toFixed(2),
    calculateTotal('unemploymentPersonal').toFixed(2),
    calculateTotal('medicalPersonal').toFixed(2),
    calculateTotal('fundPersonal').toFixed(2),
    calculateTotalMedicalExtraFee().toFixed(2),
    calculateTotal('annuityPersonal').toFixed(2),
    '-', '-', '-', '-', '-', '-',
    props.summary.totalTax.toFixed(2),
    props.summary.totalAfterTax.toFixed(2)
  ]

  // 如果显示企业部分，添加企业部分总计
  if (!hideCompanyColumns.value) {
    const totalCompanyExtraExpense = calculateTotalCompanyTotal()
    const totalCompanyTotalExpense = props.summary.totalPreTax + totalCompanyExtraExpense
    totalRow.push(
      calculateTotal('pensionCompany').toFixed(2),
      calculateTotal('unemploymentCompany').toFixed(2),
      calculateTotal('medicalCompany').toFixed(2),
      calculateTotal('injuryCompany').toFixed(2),
      calculateTotal('fundCompany').toFixed(2),
      calculateTotal('annuityCompany').toFixed(2),
      totalCompanyExtraExpense.toFixed(2),
      totalCompanyTotalExpense.toFixed(2)
    )
  }

  rows.push(totalRow)

  // 构建CSV内容
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n')

  // 添加UTF-8 BOM标记，解决中文乱码问题
  const bom = '\ufeff'
  const csvWithBom = bom + csvContent

  // 创建Blob对象
  const blob = new Blob([csvWithBom], { type: 'text/csv;charset=utf-8;' })

  // 创建下载链接
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `薪资明细_${new Date().toISOString().slice(0, 10)}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// 计算单个月份的应纳税所得额
const calculateTaxableIncome = (month) => {
  const preTaxSalary = parseFloat(month.data.preTaxSalary) || 0
  const deductions = month.result.autoSpecialDeduction + month.result.fundPersonal + month.result.annuityPersonal
  const specialAddDeduction = parseFloat(month.data.specialAddDeductionTotal) || 0
  const otherDeductions = (parseFloat(month.data.taxDeferredInsurance) || 0) + (parseFloat(month.data.personalPension) || 0) + (parseFloat(month.data.donationDeduction) || 0)
  const taxThreshold = 5000

  const result = new Decimal(preTaxSalary)
    .minus(deductions)
    .minus(taxThreshold)
    .minus(specialAddDeduction)
    .minus(otherDeductions)
    .toNumber()

  return Math.max(0, result)
}

// 计算累计应纳税所得额
const calculateCumulativeTaxableIncome = (index) => {
  let cumulative = 0
  for (let i = 0; i <= index; i++) {
    cumulative += calculateTaxableIncome(props.months[i])
  }
  return cumulative
}

// 税率表
const taxRateTable = [
  { min: 0, max: 36000, rate: 3, deduct: 0 },
  { min: 36000, max: 144000, rate: 10, deduct: 2520 },
  { min: 144000, max: 300000, rate: 20, deduct: 16920 },
  { min: 300000, max: 420000, rate: 25, deduct: 31920 },
  { min: 420000, max: 660000, rate: 30, deduct: 52920 },
  { min: 660000, max: 960000, rate: 35, deduct: 85920 },
  { min: 960000, max: Infinity, rate: 45, deduct: 181920 }
]

// 计算税率
const calculateTaxRate = (index) => {
  const cumulativeIncome = calculateCumulativeTaxableIncome(index)
  for (const level of taxRateTable) {
    if (cumulativeIncome > level.min && cumulativeIncome <= level.max) {
      return level.rate
    }
  }
  return taxRateTable[taxRateTable.length - 1].rate
}

// 计算速算扣除数
const calculateQuickDeduction = (index) => {
  const cumulativeIncome = calculateCumulativeTaxableIncome(index)
  for (const level of taxRateTable) {
    if (cumulativeIncome > level.min && cumulativeIncome <= level.max) {
      return new Decimal(level.deduct).div(12).toNumber() // 转换为月度
    }
  }
  return new Decimal(taxRateTable[taxRateTable.length - 1].deduct).div(12).toNumber()
}

// 计算累计应纳税额
const calculateCumulativeTax = (index) => {
  const cumulativeIncome = calculateCumulativeTaxableIncome(index)
  const rate = calculateTaxRate(index) / 100
  const deduction = calculateQuickDeduction(index) * (index + 1)

  const result = new Decimal(cumulativeIncome)
    .times(rate)
    .minus(deduction)
    .toNumber()

  return Math.max(0, result)
}

// 计算已缴税额
const calculatePaidTax = (index) => {
  if (index === 0) {
    return 0
  }
  return calculateCumulativeTax(index - 1)
}

// 计算公司总支出
const calculateCompanyTotal = (month) => {
  return new Decimal(month.result.pensionCompany)
    .plus(month.result.medicalCompany)
    .plus(month.result.unemploymentCompany)
    .plus(month.result.injuryCompany)
    .plus(month.result.fundCompany)
    .plus(month.result.annuityCompany)
    .toNumber()
}

// 计算总计
const calculateTotal = (property) => {
  return props.months.reduce((sum, month) => {
    return new Decimal(sum).plus(month.result[property] || 0).toNumber()
  }, 0)
}

// 计算大病互助/长护险总计
const calculateTotalMedicalExtraFee = () => {
  return props.months.reduce((sum, month) => {
    return new Decimal(sum).plus(parseFloat(month.data.medicalExtraFee) || 0).toNumber()
  }, 0)
}

// 计算公司总支出总计
const calculateTotalCompanyTotal = () => {
  return props.months.reduce((sum, month) => {
    return new Decimal(sum).plus(calculateCompanyTotal(month)).toNumber()
  }, 0)
}
</script>

<style scoped>
.result-section {
  margin-top: 30px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 6px;
}

.result-title {
  font-size: 1.1rem;
  color: #333;
  margin-bottom: 15px;
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
}

.core-result {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 20px;
  padding: 15px;
  background: #fff;
  border-radius: 6px;
}

.result-item {
  flex: 1;
  min-width: 200px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.95rem;
}

.result-item.highlight {
  font-size: 1rem;
}

.result-item.highlight .value {
  color: #42b983;
  font-weight: bold;
  font-size: 1.1rem;
}

.result-item .label {
  color: #666;
}

.result-item .value {
  color: #333;
  font-weight: 500;
}

.yearly-detail-table {
  margin-top: 20px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.table-controls {
  display: flex;
  gap: 15px;
  align-items: center;
}

.export-btn {
  padding: 6px 12px;
  background: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.export-btn:hover {
  background: #3aa876;
}

.table-container {
  overflow-x: auto;
  margin-top: 15px;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.detail-table {
  width: 100%;
  min-width: 1200px;
  border-collapse: collapse;
  font-size: 0.85rem;
  background: #fff;
}

.detail-table th, .detail-table td {
  padding: 6px 8px;
  text-align: center;
  border: 1px solid #eee;
  white-space: nowrap;
}

.detail-table th {
  background: #f5f7fa;
  font-weight: bold;
}

.total-row {
  background: #f0f2f5 !important;
  font-weight: bold;
}

.yearly-cost-analysis {
  margin-top: 20px;
  padding: 15px;
  background: #e8f4f8;
  border-radius: 6px;
}

.cost-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
  margin-top: 10px;
}

.cost-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 10px;
  background: #fff;
  border-radius: 4px;
}

.cost-label {
  color: #666;
  font-size: 0.9rem;
}

.cost-value {
  color: #333;
  font-weight: 500;
}

.sub-title {
  font-size: 0.95rem;
  color: #444;
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
}

@media (max-width: 768px) {
  .core-result {
    flex-direction: column;
    gap: 10px;
  }

  .result-item {
    min-width: 100%;
  }

  .cost-grid {
    grid-template-columns: 1fr;
  }

  .yearly-detail-table {
    overflow-x: scroll;
  }
}
</style>
