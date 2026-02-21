<!-- .vitepress/components/MonthlyResult.vue -->
<template>
  <div class="monthly-result">
    <div class="result-section">
      <h3 class="result-title">本月计算结果</h3>
      <div class="core-result">
        <div class="result-item">
          <span class="label">减除费用(起征点)：</span>
          <span class="value">¥5000.00</span>
        </div>
        <div class="result-item">
          <span class="label">个人专项扣除(社保公积金)：</span>
          <span class="value">¥{{ (result.autoSpecialDeduction + result.fundPersonal).toFixed(2) }}</span>
        </div>
        <div class="result-item">
          <span class="label">企业/职业年金个人部分：</span>
          <span class="value">¥{{ result.annuityPersonal.toFixed(2) }}</span>
        </div>
        <div class="result-item">
          <span class="label">专项附加扣除：</span>
          <span class="value">¥{{ (data.specialAddDeductionTotal || 0).toFixed(2) }}</span>
        </div>
        <div class="result-item">
          <span class="label">其他个税扣除项：</span>
          <span class="value">¥{{ ((parseFloat(data.taxDeferredInsurance) || 0) + (parseFloat(data.personalPension) || 0) + (parseFloat(data.donationDeduction) || 0)).toFixed(2) }}</span>
        </div>
        <div class="result-item">
          <span class="label">本月应缴个人所得税：</span>
          <span class="value">¥{{ result.personalTax.toFixed(2) }}</span>
        </div>
        <div class="result-item highlight">
          <span class="label">本月税后到手工资：</span>
          <span class="value">¥{{ result.afterTaxSalary.toFixed(2) }}</span>
        </div>
      </div>

      <!-- 月度明细对比和个税计算过程 -->
      <div class="comparison-with-tips">
        <div class="comparison-table">
          <h4 class="sub-title">本月个人/公司缴纳明细</h4>
          <table>
            <thead>
            <tr>
              <th>项目</th>
              <th>个人缴纳（元）</th>
              <th>公司缴纳（元）</th>
              <th>合计（元）</th>
            </tr>
            </thead>
            <tbody>
            <tr>
              <td>养老保险</td>
              <td>{{ result.pensionPersonal.toFixed(2) }}</td>
              <td>{{ result.pensionCompany.toFixed(2) }}</td>
              <td>{{ (result.pensionPersonal + result.pensionCompany).toFixed(2) }}</td>
            </tr>
            <tr>
              <td>医疗保险（含生育）</td>
              <td>{{ result.medicalPersonal.toFixed(2) }}</td>
              <td>{{ result.medicalCompany.toFixed(2) }}</td>
              <td>{{ (result.medicalPersonal + result.medicalCompany).toFixed(2) }}</td>
            </tr>
            <tr>
              <td>大病互助/长护险</td>
              <td>{{ data.medicalExtraFee.toFixed(2) }}</td>
              <td>0.00</td>
              <td>{{ data.medicalExtraFee.toFixed(2) }}</td>
            </tr>
            <tr>
              <td>失业保险</td>
              <td>{{ result.unemploymentPersonal.toFixed(2) }}</td>
              <td>{{ result.unemploymentCompany.toFixed(2) }}</td>
              <td>{{ (result.unemploymentPersonal + result.unemploymentCompany).toFixed(2) }}</td>
            </tr>
            <tr>
              <td>工伤保险</td>
              <td>0.00</td>
              <td>{{ result.injuryCompany.toFixed(2) }}</td>
              <td>{{ result.injuryCompany.toFixed(2) }}</td>
            </tr>
            <tr v-if="data.enableFund">
              <td>住房公积金</td>
              <td>{{ result.fundPersonal.toFixed(2) }}</td>
              <td>{{ result.fundCompany.toFixed(2) }}</td>
              <td>{{ (result.fundPersonal + result.fundCompany).toFixed(2) }}</td>
            </tr>
            <tr v-if="data.enableAnnuity">
              <td>企业/职业年金</td>
              <td>{{ result.annuityPersonal.toFixed(2) }}</td>
              <td>{{ result.annuityCompany.toFixed(2) }}</td>
              <td>{{ (result.annuityPersonal + result.annuityCompany).toFixed(2) }}</td>
            </tr>
            <tr>
              <td>个人所得税</td>
              <td>{{ result.personalTax.toFixed(2) }}</td>
              <td></td>
              <td></td>
            </tr>
            <tr class="total-row">
              <td>总计</td>
              <td>{{ result.totalPersonal.toFixed(2) }}</td>
              <td>{{ result.totalCompany.toFixed(2) }}</td>
              <td></td>
            </tr>
            </tbody>
          </table>
        </div>

        <!-- 个税计算过程 -->
        <div class="tax-calculation-tips">
          <h4 class="sub-title">个税计算过程</h4>
          <div class="yearly-tips">
            <p>💡 仅供参考,本过程使用月度个税税率表,具体计算请前往年度计算</p>
          </div>
          <div class="tax-steps">
            <div class="tax-step">
              <span class="step-number">1</span>
              <span class="step-desc">计算应纳税所得额</span>
              <div class="step-detail">
                应纳税所得额 = 税前工资 - 个人专项扣除(社保公积金个人部分) - 减除费用(起征点,5000元) - 专项附加扣除 - 其他扣除 等
              </div>
              <div class="step-formula">
                ¥{{ (data.preTaxSalary - (result.autoSpecialDeduction + result.fundPersonal) - 5000 - (data.specialAddDeductionTotal || 0) - (result.annuityPersonal + data.taxDeferredInsurance + data.personalPension + data.donationDeduction)).toFixed(2) }}
              </div>
            </div>
            <div class="tax-step">
              <span class="step-number">2</span>
              <span class="step-desc">确定税率和速算扣除数</span>
              <div class="step-detail">
                根据应纳税所得额查找税率表，确定适用税率和速算扣除数
              </div>
              <div class="step-formula">
                {{ calculateTaxRateInfo() }}
              </div>
            </div>
            <div class="tax-step">
              <span class="step-number">3</span>
              <span class="step-desc">计算个人所得税</span>
              <div class="step-detail">
                个人所得税 = 应纳税所得额 × 适用税率 - 速算扣除数
              </div>
              <div class="step-formula">
                ¥{{ result.personalTax.toFixed(2) }}
              </div>
            </div>
            <div class="tax-step">
              <span class="step-number">4</span>
              <span class="step-desc">计算税后工资</span>
              <div class="step-detail">
                税后工资 = 税前工资 - 个人专项扣除 - 个人所得税
              </div>
              <div class="step-formula">
                ¥{{ result.afterTaxSalary.toFixed(2) }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 核心数据表格 -->
      <div class="core-data-table">
        <h4 class="sub-title">核心数据</h4>
        <table class="core-table">
          <tbody>
          <tr>
            <td class="core-label">个人税前工资</td>
            <td class="core-value">¥{{ data.preTaxSalary.toFixed(2) }}</td>
          </tr>
          <tr>
            <td class="core-label">个人税后工资</td>
            <td class="core-value">¥{{ result.afterTaxSalary.toFixed(2) }}</td>
          </tr>
          <tr>
            <td class="core-label">公司总成本</td>
            <td class="core-value">¥{{ (data.preTaxSalary + result.totalCompany).toFixed(2) }}</td>
          </tr>
          </tbody>
        </table>
      </div>

      <!-- 饼图展示 -->
      <div class="chart-section">
        <h4 class="sub-title">工资去向与成本分析</h4>
        <div class="chart-grid">
          <!-- 个人工资去向饼图 -->
          <div class="chart-item">
            <h5>个人工资去向</h5>
            <div class="pie-chart" style="width: 100%; height: 300px; position: relative;">
              <canvas ref="personalChart"></canvas>
            </div>
          </div>
          <!-- 企业成本分析饼图 -->
          <div class="chart-item">
            <h5>企业成本分析</h5>
            <div class="pie-chart" style="width: 100%; height: 300px; position: relative;">
              <canvas ref="companyChart"></canvas>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'

const props = defineProps({
  data: {
    type: Object,
    required: true
  },
  result: {
    type: Object,
    required: true
  }
})

// 计算税率信息
const calculateTaxRateInfo = () => {
  const { preTaxSalary } = props.data
  const { autoSpecialDeduction, fundPersonal, annuityPersonal, personalTax } = props.result
  const { specialAddDeductionTotal = 0, taxDeferredInsurance = 0, personalPension = 0, donationDeduction = 0 } = props.data

  // 计算应纳税所得额
  const taxableIncome = preTaxSalary - (autoSpecialDeduction + fundPersonal) - 5000 - specialAddDeductionTotal - (annuityPersonal + taxDeferredInsurance + personalPension + donationDeduction)

  if (taxableIncome <= 0) {
    return '无需缴税（应纳税所得额≤0）'
  }

  // 税率表
  const taxRateTable = [
    { min: 0, max: 3000, rate: 3, deduct: 0 },
    { min: 3000, max: 12000, rate: 10, deduct: 210 },
    { min: 12000, max: 25000, rate: 20, deduct: 1410 },
    { min: 25000, max: 35000, rate: 25, deduct: 2660 },
    { min: 35000, max: 55000, rate: 30, deduct: 4410 },
    { min: 55000, max: 80000, rate: 35, deduct: 7160 },
    { min: 80000, max: Infinity, rate: 45, deduct: 15160 }
  ]

  // 查找适用税率
  const taxLevel = taxRateTable.find(level => taxableIncome > level.min && taxableIncome <= level.max) || taxRateTable[taxRateTable.length - 1]

  return `税率：${taxLevel.rate}%，速算扣除数：¥${taxLevel.deduct}`
}

const personalChart = ref(null)
const companyChart = ref(null)

// 绘制饼图的函数
const drawPieChart = (canvas, data, labels, colors, title) => {
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  const width = canvas.width
  const height = canvas.height
  const centerX = width * 0.6 // 调整饼图位置，为左侧标签留出空间
  const centerY = height / 2
  const radius = Math.min(centerX, centerY - 20) - 20 // 调整半径，确保不与顶部标题重叠

  // 清空画布
  ctx.clearRect(0, 0, width, height)

  // 计算总和
  const total = data.reduce((sum, value) => sum + value, 0)

  // 绘制饼图
  let startAngle = -Math.PI / 2

  // 存储标签信息，用于左侧垂直排列
  const labelInfo = []

  data.forEach((value, index) => {
    const sliceAngle = (value / total) * 2 * Math.PI

    // 绘制扇形
    ctx.beginPath()
    ctx.moveTo(centerX, centerY)
    ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle)
    ctx.closePath()
    ctx.fillStyle = colors[index]
    ctx.fill()
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 2
    ctx.stroke()

    // 存储标签信息
    const percentage = ((value / total) * 100).toFixed(1)
    labelInfo.push({
      label: labels[index],
      value: value,
      percentage: percentage,
      color: colors[index],
      startAngle: startAngle,
      endAngle: startAngle + sliceAngle
    })

    startAngle += sliceAngle
  })

  // 绘制左侧垂直排列的标签
  const labelStartY = height * 0.2
  const labelSpacing = 35 // 增加间距，为具体数值留出空间
  const labelX = width * 0.2

  labelInfo.forEach((info, index) => {
    const labelY = labelStartY + index * labelSpacing

    // 绘制颜色方块
    ctx.fillStyle = info.color
    ctx.fillRect(labelX, labelY - 12, 16, 16)

    // 绘制标签文字
    ctx.fillStyle = '#333'
    ctx.font = '14px Arial'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.fillText(`${info.label}`, labelX + 24, labelY - 10)

    // 绘制具体数值和百分比
    ctx.font = '12px Arial'
    ctx.fillText(`¥${info.value.toFixed(2)} (${info.percentage}%)`, labelX + 24, labelY + 10)
  })

  // 绘制标题
  ctx.fillStyle = '#333'
  ctx.font = '16px Arial'
  ctx.textAlign = 'center'
  ctx.fillText(`${title} (共 ¥${total.toFixed(2)})`, centerX, 30) // 固定在30px高度，确保不与饼图重叠
}

// 绘制个人工资去向饼图
const drawPersonalChart = () => {
  const { preTaxSalary } = props.data
  const { afterTaxSalary, pensionPersonal, medicalPersonal, unemploymentPersonal, fundPersonal, annuityPersonal, personalTax } = props.result
  const medicalExtraFee = props.data.medicalExtraFee || 0

  const data = [
    afterTaxSalary,
    pensionPersonal,
    medicalPersonal,
    unemploymentPersonal + medicalExtraFee,
    fundPersonal,
    annuityPersonal,
    personalTax
  ]

  const labels = ['税后工资', '养老保险金', '医疗保险金', '失业保险金', '住房公积金', '年金', '个人所得税']
  const colors = ['#42b983', '#3498db', '#f39c12', '#e74c3c', '#9b59b6', '#1abc9c', '#34495e']

  drawPieChart(personalChart.value, data, labels, colors, '个人工资去向')
}

// 绘制企业成本分析饼图
const drawCompanyChart = () => {
  const { preTaxSalary } = props.data
  const { pensionCompany, medicalCompany, unemploymentCompany, injuryCompany, fundCompany, annuityCompany } = props.result

  const data = [
    preTaxSalary,
    pensionCompany,
    medicalCompany,
    unemploymentCompany,
    injuryCompany,
    fundCompany,
    annuityCompany
  ]

  const labels = ['税前工资', '养老', '医疗', '失业', '工伤', '公积金', '年金']
  const colors = ['#42b983', '#3498db', '#f39c12', '#e74c3c', '#9b59b6', '#1abc9c', '#34495e']

  drawPieChart(companyChart.value, data, labels, colors, '企业成本分析')
}

// 组件挂载后绘制图表
onMounted(() => {
  // 设置canvas尺寸
  if (personalChart.value) {
    personalChart.value.width = personalChart.value.offsetWidth
    personalChart.value.height = 300
  }
  if (companyChart.value) {
    companyChart.value.width = companyChart.value.offsetWidth
    companyChart.value.height = 300
  }

  drawPersonalChart()
  drawCompanyChart()
})

// 监听数据变化，重新绘制图表
watch([() => props.data, () => props.result], () => {
  drawPersonalChart()
  drawCompanyChart()
}, { deep: true })
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
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
  padding: 20px;
  background: #fff;
  border-radius: 6px;
}

.result-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.95rem;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.result-item:last-child {
  border-bottom: none;
}

.result-item.highlight {
  font-size: 1rem;
  background-color: #f8fff8;
  padding: 12px;
  border-radius: 4px;
  border-bottom: none;
  margin-bottom: 8px;
}

.result-item.highlight .value {
  color: #42b983;
  font-weight: bold;
  font-size: 1.1rem;
}

.result-item .label {
  color: #666;
  flex: 1;
}

.result-item .value {
  color: #333;
  font-weight: 500;
  flex: 1;
  text-align: right;
}

.comparison-table {
  margin-top: 20px;
}

.comparison-table table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.comparison-table th, .comparison-table td {
  padding: 8px 10px;
  text-align: center;
  border: 1px solid #eee;
}

.comparison-table th {
  background: #f5f7fa;
}

.total-row {
  background: #f0f2f5 !important;
  font-weight: bold;
}

.highlight-row {
  background: #e8f4f8 !important;
  font-weight: bold;
  color: #333;
}

.sub-title {
  font-size: 0.95rem;
  color: #444;
  margin-bottom: 10px;
}

/* 图表部分样式 */
.chart-section {
  margin-top: 30px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 6px;
}

.chart-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 30px;
  margin-top: 20px;
}

.chart-item {
  background: #fff;
  padding: 20px;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.chart-item h5 {
  font-size: 1rem;
  color: #333;
  margin-bottom: 15px;
  text-align: center;
}

.pie-chart {
  position: relative;
  width: 100%;
  height: 300px;
}

.pie-chart canvas {
  width: 100% !important;
  height: 100% !important;
}

/* 对比表格和个税计算过程容器样式 */
.comparison-with-tips {
  display: flex;
  gap: 20px;
  margin-top: 20px;
  flex-wrap: wrap;
}

.comparison-table {
  flex: 1;
  min-width: 400px;
}

.tax-calculation-tips {
  flex: 1;
  min-width: 400px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 6px;
  border-left: 3px solid #42b983;
}

.tax-steps {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.tax-step {
  background: #fff;
  padding: 12px;
  border-radius: 4px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.step-number {
  display: inline-block;
  width: 20px;
  height: 20px;
  line-height: 20px;
  text-align: center;
  background: #42b983;
  color: #fff;
  border-radius: 50%;
  margin-right: 8px;
  font-size: 0.8rem;
}

.step-desc {
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
  display: block;
}

.step-detail {
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 5px;
  line-height: 1.4;
}

.step-formula {
  font-size: 0.9rem;
  color: #42b983;
  font-weight: bold;
  margin-top: 5px;
}

/* 核心数据表格样式 */
.core-data-table {
  margin-top: 30px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 6px;
}

.core-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 15px;
}

.core-table td {
  padding: 12px 15px;
  border: 1px solid #eee;
}

.core-label {
  background: #f5f7fa;
  font-weight: bold;
  color: #333;
  width: 50%;
}

.core-value {
  background: #fff;
  text-align: right;
  font-weight: bold;
  color: #42b983;
  width: 50%;
}

@media (max-width: 768px) {
  .core-result {
    flex-direction: column;
    gap: 10px;
  }

  .result-item {
    min-width: 100%;
  }

  .comparison-with-tips {
    flex-direction: column;
  }

  .comparison-table,
  .tax-calculation-tips {
    min-width: 100%;
  }

  .chart-grid {
    grid-template-columns: 1fr;
  }

  .chart-item {
    padding: 15px;
  }

  .pie-chart {
    height: 250px;
  }
}
</style>
