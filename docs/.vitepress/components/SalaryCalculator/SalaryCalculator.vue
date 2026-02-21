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
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { Decimal } from 'decimal.js'
import CalculatorModeSwitch from './CalculatorModeSwitch.vue'
import MonthlyBasicForm from './MonthlyBasicForm.vue'
import SpecialDeduction from './SpecialDeduction.vue'
import OtherTaxDeduction from './OtherTaxDeduction.vue'
import MonthlyResult from './MonthlyResult.vue'
import MonthCard from './MonthCard.vue'
import YearlyResult from './YearlyResult.vue'

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

// 计算模式：monthly-月度基础版，yearly-年度版
const calcMode = ref('monthly')

// 从localStorage读取基础数据
const loadBaseDataFromLocalStorage = () => {
  try {
    // 检查localStorage是否存在（避免服务器端渲染错误）
    if (typeof localStorage !== 'undefined') {
      const savedData = localStorage.getItem('salaryCalculatorBaseData')
      console.log('Loaded base data from localStorage:', savedData)
      if (savedData) {
        const parsedData = JSON.parse(savedData)
        console.log('Parsed base data:', parsedData)
        // 数据校验：确保返回的数据是对象
        if (typeof parsedData === 'object' && parsedData !== null) {
          // 即使缺少某些属性，也返回所有可用数据
          return parsedData
        }
        console.warn('Base data format is incorrect, but cache will not be cleared.')
      }
    }
  } catch (error) {
    console.error('Failed to load base data from localStorage, but cache will not be cleared:', error)
  }
  return null
}

// 从localStorage读取年度数据
const loadYearlyDataFromLocalStorage = () => {
  try {
    // 检查localStorage是否存在（避免服务器端渲染错误）
    if (typeof localStorage !== 'undefined') {
      const savedData = localStorage.getItem('salaryCalculatorYearlyData')
      console.log('Loaded yearly data from localStorage:', savedData)
      if (savedData) {
        const parsedData = JSON.parse(savedData)
        console.log('Parsed yearly data:', parsedData)
        // 数据校验：确保返回的数据是对象
        if (typeof parsedData === 'object' && parsedData !== null) {
          // 即使缺少某些属性，也返回所有可用数据
          return parsedData
        }
        console.warn('Yearly data format is incorrect, but cache will not be cleared.')
      }
    }
  } catch (error) {
    console.error('Failed to load yearly data from localStorage, but cache will not be cleared:', error)
  }
  return null
}

// 保存基础数据到localStorage
const saveBaseDataToLocalStorage = (data) => {
  try {
    // 检查localStorage是否存在（避免服务器端渲染错误）
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('salaryCalculatorBaseData', JSON.stringify(data))
    }
  } catch (error) {
    console.error('Failed to save base data to localStorage:', error)
  }
}

// 保存年度数据到localStorage
const saveYearlyDataToLocalStorage = (data) => {
  try {
    // 检查localStorage是否存在（避免服务器端渲染错误）
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('salaryCalculatorYearlyData', JSON.stringify(data))
    }
  } catch (error) {
    console.error('Failed to save yearly data to localStorage:', error)
  }
}

// 默认数据
const defaultData = {
  // 基础薪资
  preTaxSalary: 10000,
  socialSecurityBase: 10000,
  medicalExtraFee: 3, // 大病互助/长护险 默认3元/月

  // 社保比例
  pensionPersonalRate: 8,
  pensionCompanyRate: 16,
  medicalPersonalRate: 2,
  medicalCompanyRate: 9.5,
  unemploymentPersonalRate: 0.5,
  unemploymentCompanyRate: 0.5,
  injuryCompanyRate: 0.2,

  // 公积金
  enableFund: true,
  fundBase: null, // 默认为空，使用社保基数
  fundPersonalRate: 12,
  fundCompanyRate: 12,

  // 年金
  enableAnnuity: false,
  annuityBase: null, // 默认为空，使用社保基数
  annuityPersonalRate: 4,
  annuityCompanyRate: 8,

  // 专项附加扣除项（勾选/下拉）
  specialAddItems: {
    childrenEducation: false,
    childrenEducationCount: 0,
    continueEducation: false,
    housingLoan: false,
    housingRent: false,
    housingRentType: 0,
    supportElderly: false,
    supportElderlyAmount: 0,
    babyCare: false,
    babyCareCount: 0
  },
  specialAddDeductionTotal: 0, // 专项附加扣除合计

  // 其他个税扣除项
  taxDeferredInsurance: 0,
  personalPension: 0,
  donationDeduction: 0
}

// 月度基础版数据（从localStorage加载基础数据或使用默认值）
const baseData = loadBaseDataFromLocalStorage()
const monthlyData = ref(baseData && typeof baseData === 'object' ? {
  ...defaultData,
  ...baseData
} : JSON.parse(JSON.stringify(defaultData)))

// 月度计算结果
const monthlyResult = ref({
  autoSpecialDeduction: 0, // 自动计算的三险+大病扣除
  pensionPersonal: 0,
  pensionCompany: 0,
  medicalPersonal: 0,
  medicalCompany: 0,
  unemploymentPersonal: 0,
  unemploymentCompany: 0,
  injuryCompany: 0,
  fundPersonal: 0,
  fundCompany: 0,
  annuityPersonal: 0,
  annuityCompany: 0,
  personalTax: 0,
  afterTaxSalary: 0,
  totalPersonal: 0,
  totalCompany: 0
})

// 年度月份数据（12个月）
const yearlyMonths = ref([])

// 计算第一个展开的月份索引
const firstExpandedIndex = computed(() => {
  return yearlyMonths.value.findIndex(month => month && month.expanded)
})

// 年度汇总结果
const yearlySummary = ref({
  totalPreTax: 0,
  totalTax: 0,
  totalAfterTax: 0,
  totalPersonalDeduction: 0,
  totalCompanyPayment: 0,
  totalPreTaxDeduction: 0,
  totalFundDeduction: 0,
  totalSpecialAddDeduction: 0
})

// 7月变更基数设置
const julyBaseChange = ref({
  enable: false,
  socialSecurityBase: null,
  fundBase: null,
  annuityBase: null
})

// 从localStorage读取年度数据并加载
const loadYearlyData = () => {
  try {
    const loadedYearlyData = loadYearlyDataFromLocalStorage()
    console.log('Loaded yearly data from localStorage:', loadedYearlyData)
    if (loadedYearlyData && typeof loadedYearlyData === 'object') {
      // 如果有7月变更基数设置，加载它
      if (loadedYearlyData.julyBaseChange && typeof loadedYearlyData.julyBaseChange === 'object') {
        console.log('Loading julyBaseChange:', loadedYearlyData.julyBaseChange)
        julyBaseChange.value = {
          ...julyBaseChange.value,
          ...loadedYearlyData.julyBaseChange
        }
      }

      // 如果有年度月份数据，加载它
      if (loadedYearlyData.yearlyMonths && Array.isArray(loadedYearlyData.yearlyMonths)) {
        console.log('Loading yearlyMonths:', loadedYearlyData.yearlyMonths)
        // 确保yearlyMonths是长度为12的数组
        if (loadedYearlyData.yearlyMonths.length === 12) {
          // 使用深拷贝，避免引用关系导致的问题
          yearlyMonths.value = JSON.parse(JSON.stringify(loadedYearlyData.yearlyMonths))
          // 加载后计算所有月份
          calculateAllYearlyMonths()
          return true // 表示成功加载了年度数据
        } else {
          // 如果长度不正确，初始化新的年度数据
          console.warn('Yearly months length incorrect, initializing new yearly data');
          initYearlyMonths()
        }
      }
    }
  } catch (error) {
    console.error('Failed to load yearly data from localStorage:', error)
  }
  return false // 表示没有加载到年度数据
}

// 调用加载函数
const hasLoadedYearlyData = loadYearlyData()

// 保存原始基数数据，用于取消启用时恢复
const originalBaseData = ref({})

// 初始化原始基数数据
const initOriginalBaseData = () => {
  originalBaseData.value = {}
  if (yearlyMonths.value && Array.isArray(yearlyMonths.value)) {
    yearlyMonths.value.forEach((month, index) => {
      if (month && month.data) {
        originalBaseData.value[index] = {
          socialSecurityBase: month.data.socialSecurityBase,
          fundBase: month.data.fundBase,
          annuityBase: month.data.annuityBase
        }
      }
    })
  }
}

// 应用7月变更基数到表格显示
const applyJulyBaseChangeToDisplay = () => {
  if (yearlyMonths.value && Array.isArray(yearlyMonths.value)) {
    yearlyMonths.value.forEach((month, index) => {
      if (month && month.data && index >= 6) { // 7月及以后的月份
        if (julyBaseChange.value.enable) {
          // 启用时，先保存当前基数作为原始数据
          if (!originalBaseData.value[index]) {
            originalBaseData.value[index] = {
              socialSecurityBase: month.data.socialSecurityBase,
              fundBase: month.data.fundBase,
              annuityBase: month.data.annuityBase
            }
          }
          // 应用变更基数到显示
          if (julyBaseChange.value.socialSecurityBase !== null) {
            month.data.socialSecurityBase = julyBaseChange.value.socialSecurityBase
          }
          if (julyBaseChange.value.fundBase !== null) {
            month.data.fundBase = julyBaseChange.value.fundBase
          } else if (month.data.enableFund) {
            month.data.fundBase = julyBaseChange.value.socialSecurityBase || month.data.socialSecurityBase
          }
          if (julyBaseChange.value.annuityBase !== null) {
            month.data.annuityBase = julyBaseChange.value.annuityBase
          } else if (month.data.enableAnnuity) {
            month.data.annuityBase = julyBaseChange.value.socialSecurityBase || month.data.socialSecurityBase
          }
        } else {
          // 取消启用时，恢复原始基数
          if (originalBaseData.value[index]) {
            month.data.socialSecurityBase = originalBaseData.value[index].socialSecurityBase
            month.data.fundBase = originalBaseData.value[index].fundBase
            month.data.annuityBase = originalBaseData.value[index].annuityBase
          }
        }
      }
    })
  }
}

// 监听7月变更基数设置变化，更新表格显示
watch(
  [() => julyBaseChange.value.enable, () => julyBaseChange.value.socialSecurityBase, () => julyBaseChange.value.fundBase, () => julyBaseChange.value.annuityBase],
  () => {
    applyJulyBaseChangeToDisplay()
    calculateAllYearlyMonths()
  },
  { deep: true }
)

// 初始化年度月份数据
const initYearlyMonths = () => {
  const months = []
  for (let i = 0; i < 12; i++) {
    // 使用深拷贝复制月度基础版数据作为初始值，确保年度数据与月度数据完全独立
    const monthData = JSON.parse(JSON.stringify(monthlyData.value))
    // 重置专项附加扣除合计
    monthData.specialAddDeductionTotal = 0

    // 如果是7月及以后的月份，并且启用了7月变更基数设置，应用变更
    if (i >= 6 && julyBaseChange.value.enable) {
      if (julyBaseChange.value.socialSecurityBase !== null) {
        monthData.socialSecurityBase = julyBaseChange.value.socialSecurityBase
      }
      if (julyBaseChange.value.fundBase !== null) {
        monthData.fundBase = julyBaseChange.value.fundBase
      } else if (monthData.enableFund) {
        monthData.fundBase = julyBaseChange.value.socialSecurityBase || monthData.socialSecurityBase
      }
      if (julyBaseChange.value.annuityBase !== null) {
        monthData.annuityBase = julyBaseChange.value.annuityBase
      } else if (monthData.enableAnnuity) {
        monthData.annuityBase = julyBaseChange.value.socialSecurityBase || monthData.socialSecurityBase
      }
    }

    months.push({
      expanded: i === 0, // 默认展开1月
      data: monthData,
      result: JSON.parse(JSON.stringify(monthlyResult.value))
    })
  }
  yearlyMonths.value = months
  // 初始化原始基数数据
  initOriginalBaseData()
  // 计算所有月份
  calculateAllYearlyMonths()
  console.log('Initialized yearly months data:', yearlyMonths.value)
}

// 重置年度数据
const resetYearlyData = () => {
  initYearlyMonths()
}

// 将月度计算基础数据复制到当前月设置
const copyMonthlyToCurrentMonth = () => {
  try {
    // 检查yearlyMonths.value是否为数组且不为空
    if (!yearlyMonths.value || !Array.isArray(yearlyMonths.value) || yearlyMonths.value.length === 0) {
      console.error('Yearly months data is empty, cannot copy monthly settings')
      return
    }

    // 找到展开的第一个月份
    const expandedMonthIndex = yearlyMonths.value.findIndex(month => month && month.expanded)
    const targetIndex = expandedMonthIndex >= 0 ? expandedMonthIndex : 0 // 如果没有展开的月份，使用第一个月份
    const targetMonth = yearlyMonths.value[targetIndex]

    if (!targetMonth) {
      console.error('Target month is missing, cannot copy monthly settings')
      return
    }

    // 使用深拷贝复制月度基础数据，确保数据的独立性
    const newMonthData = JSON.parse(JSON.stringify(monthlyData.value))
    console.log("newMonthData",newMonthData)
    newMonthData.socialSecurityBase = newMonthData.socialSecurityBase || newMonthData.preTaxSalary
    // 重置专项附加扣除合计
    newMonthData.specialAddDeductionTotal = 0

    targetMonth.data = newMonthData
    calculateYearlyMonth(targetIndex)
    console.log('Copied monthly basic settings to current month')
  } catch (error) {
    console.error('Error in copyMonthlyToCurrentMonth:', error)
  }
}

// 将当前月设置复制到后续月份
const copyCurrentMonthToSubsequent = () => {
  try {
    // 检查yearlyMonths.value是否为数组且不为空
    if (!yearlyMonths.value || !Array.isArray(yearlyMonths.value) || yearlyMonths.value.length === 0) {
      console.error('Yearly months data is empty, cannot copy settings')
      return
    }

    // 找到展开的第一个月份
    const expandedMonthIndex = yearlyMonths.value.findIndex(month => month && month.expanded)
    const currentIndex = expandedMonthIndex >= 0 ? expandedMonthIndex : 0 // 如果没有展开的月份，使用第一个月份
    const currentMonthData = yearlyMonths.value[currentIndex].data

    if (!currentMonthData) {
      console.error('Current month data is missing, cannot copy settings')
      return
    }

    // 只复制到后续月份（当前月份之后的月份）
    yearlyMonths.value.forEach((month, index) => {
      if (month && index > currentIndex) { // 只复制到后续月份
        // 使用深拷贝复制当前月份的数据，确保数据的独立性
        const newMonthData = JSON.parse(JSON.stringify(currentMonthData))

        // 如果是7月及以后的月份，并且启用了7月变更基数设置，应用变更
        if (index >= 6 && julyBaseChange.value.enable) {
          if (julyBaseChange.value.socialSecurityBase !== null) {
            newMonthData.socialSecurityBase = julyBaseChange.value.socialSecurityBase
          }
          if (julyBaseChange.value.fundBase !== null) {
            newMonthData.fundBase = julyBaseChange.value.fundBase
          } else if (newMonthData.enableFund) {
            newMonthData.fundBase = julyBaseChange.value.socialSecurityBase || newMonthData.socialSecurityBase
          }
          if (julyBaseChange.value.annuityBase !== null) {
            newMonthData.annuityBase = julyBaseChange.value.annuityBase
          } else if (newMonthData.enableAnnuity) {
            newMonthData.annuityBase = julyBaseChange.value.socialSecurityBase || newMonthData.socialSecurityBase
          }
        }

        month.data = newMonthData
      }
    })
    calculateAllYearlyMonths()
    console.log('Copied current month settings to subsequent months')
  } catch (error) {
    console.error('Error in copyCurrentMonthToSubsequent:', error)
  }
}

// 切换月份卡片展开/收起
const toggleMonthExpand = (index) => {
  if (yearlyMonths.value[index]) {
    yearlyMonths.value[index].expanded = !yearlyMonths.value[index].expanded
  }
}

// 一键折叠/展开所有月份卡片
const toggleAllExpand = () => {
  // 检查当前是否所有卡片都已展开
  const allExpanded = yearlyMonths.value.every(month => month.expanded)
  // 如果所有都展开了，则全部折叠；否则全部展开
  yearlyMonths.value.forEach(month => {
    month.expanded = !allExpanded
  })
}

// 处理专项附加扣除更新（月度）
const handleSpecialAddUpdate = (items) => {
  monthlyData.value.specialAddItems = items
  calculateSpecialAddDeduction()
  calculateMonthly()
}

// 住房贷款/租金互斥处理（年度）
const handleHousingMutualExclusionForMonth = (index, type) => {
  const month = yearlyMonths.value[index]
  if (type === 'loan') {
    month.data.specialAddItems.housingRent = false
  } else {
    month.data.specialAddItems.housingLoan = false
  }
  calculateSpecialAddDeductionForMonth(index)
  calculateYearlyMonth(index)
}

// 计算专项附加扣除合计（月度）
 const calculateSpecialAddDeduction = (items) => {
  const targetItems = items || monthlyData.value.specialAddItems
  let total = 0

  // 子女教育
  if (targetItems.childrenEducation) {
    total += targetItems.childrenEducationCount * specialAddConfig.childrenEducation
  }

  // 继续教育
  if (targetItems.continueEducation) {
    if (targetItems.continueEducationType === 'monthly') {
      total += specialAddConfig.continueEducation
    } else if (targetItems.continueEducationType === 'annual') {
      total += 3600 // 职业资格证书：一次性3600元，无需分摊
    }
  }

  // 住房贷款利息
  if (targetItems.housingLoan) {
    total += specialAddConfig.housingLoan
  }

  // 住房租金
  if (targetItems.housingRent) {
    total += specialAddConfig.housingRent[targetItems.housingRentType] || 0
  }

  // 赡养老人
  if (targetItems.supportElderly) {
    if (targetItems.supportElderlyType === '3000') {
      total += 3000
    } else if (targetItems.supportElderlyType === '1500') {
      total += Math.min(targetItems.supportElderlyShare || 1500, 1500) // 最高1500元/月
    }
  }

  // 婴幼儿照护
  if (targetItems.babyCare) {
    total += targetItems.babyCareCount * specialAddConfig.babyCare
  }

  if (items) {
    return total
  } else {
    monthlyData.value.specialAddDeductionTotal = total
  }
}

// 计算专项附加扣除合计（年度单月）
const calculateSpecialAddDeductionForMonth = (index) => {
  const month = yearlyMonths.value[index]
  if (!month) return

  const targetItems = month.data.specialAddItems
  let total = 0

  // 子女教育
  if (targetItems.childrenEducation) {
    total += targetItems.childrenEducationCount * specialAddConfig.childrenEducation
  }

  // 继续教育
  if (targetItems.continueEducation) {
    if (targetItems.continueEducationType === 'monthly') {
      total += specialAddConfig.continueEducation
    } else if (targetItems.continueEducationType === 'annual') {
      total += 3600 // 职业资格证书：一次性3600元，无需分摊
    }
  }

  // 住房贷款利息
  if (targetItems.housingLoan) {
    total += specialAddConfig.housingLoan
  }

  // 住房租金
  if (targetItems.housingRent) {
    total += specialAddConfig.housingRent[targetItems.housingRentType] || 0
  }

  // 赡养老人
  if (targetItems.supportElderly) {
    if (targetItems.supportElderlyType === '3000') {
      total += 3000
    } else if (targetItems.supportElderlyType === '1500') {
      total += Math.min(targetItems.supportElderlyShare || 1500, 1500) // 最高1500元/月
    }
  }

  // 婴幼儿照护
  if (targetItems.babyCare) {
    total += targetItems.babyCareCount * specialAddConfig.babyCare
  }

  month.data.specialAddDeductionTotal = total
}

// 个税起征点（月度）
const taxThresholdMonthly = 5000

// 个税税率表（月度）
const taxRateTableMonthly = [
  { min: 0, max: 3000, rate: 3, deduct: 0 },
  { min: 3000, max: 12000, rate: 10, deduct: 210 },
  { min: 12000, max: 25000, rate: 20, deduct: 1410 },
  { min: 25000, max: 35000, rate: 25, deduct: 2660 },
  { min: 35000, max: 55000, rate: 30, deduct: 4410 },
  { min: 55000, max: 80000, rate: 35, deduct: 7160 },
  { min: 80000, max: Infinity, rate: 45, deduct: 15160 }
]

// 个税税率表（年度）
const taxRateTableYearly = [
  { min: 0, max: 36000, rate: 3, deduct: 0 },
  { min: 36000, max: 144000, rate: 10, deduct: 2520 },
  { min: 144000, max: 300000, rate: 20, deduct: 16920 },
  { min: 300000, max: 420000, rate: 25, deduct: 31920 },
  { min: 420000, max: 660000, rate: 30, deduct: 52920 },
  { min: 660000, max: 960000, rate: 35, deduct: 85920 },
  { min: 960000, max: Infinity, rate: 45, deduct: 181920 }
]

// 通用计算函数（单个月份）
 const calculateMonth = (data) => {
  const result = {
    autoSpecialDeduction: 0,
    pensionPersonal: 0,
    pensionCompany: 0,
    medicalPersonal: 0,
    medicalCompany: 0,
    unemploymentPersonal: 0,
    unemploymentCompany: 0,
    injuryCompany: 0,
    fundPersonal: 0,
    fundCompany: 0,
    annuityPersonal: 0,
    annuityCompany: 0,
    personalTax: 0,
    afterTaxSalary: 0,
    totalPersonal: 0,
    totalCompany: 0
  }

  // 处理默认基数
  const actualSSBase = data.socialSecurityBase || data.preTaxSalary
  const actualFundBase = data.enableFund ? (data.fundBase || actualSSBase) : 0
  const actualAnnuityBase = data.enableAnnuity ? (data.annuityBase || actualSSBase) : 0

  // 1. 计算社保
  result.pensionPersonal = new Decimal(actualSSBase).times(data.pensionPersonalRate).div(100).toDecimalPlaces(3).toNumber()
  result.pensionCompany = new Decimal(actualSSBase).times(data.pensionCompanyRate).div(100).toDecimalPlaces(3).toNumber()
  result.medicalPersonal = new Decimal(actualSSBase).times(data.medicalPersonalRate).div(100).toDecimalPlaces(3).toNumber()
  result.medicalCompany = new Decimal(actualSSBase).times(data.medicalCompanyRate).div(100).toDecimalPlaces(3).toNumber()
  result.unemploymentPersonal = new Decimal(actualSSBase).times(data.unemploymentPersonalRate).div(100).toDecimalPlaces(3).toNumber()
  result.unemploymentCompany = new Decimal(actualSSBase).times(data.unemploymentCompanyRate).div(100).toDecimalPlaces(3).toNumber()
  result.injuryCompany = new Decimal(actualSSBase).times(data.injuryCompanyRate).div(100).toDecimalPlaces(3).toNumber()

  // 2. 自动计算专项扣除（三险+大病/长护险，不可手动修改）
  result.autoSpecialDeduction = new Decimal(result.pensionPersonal)
    .plus(result.medicalPersonal)
    .plus(result.unemploymentPersonal)
    .plus(data.medicalExtraFee || 0)
    .toDecimalPlaces(3)
    .toNumber()

  // 3. 计算公积金（税前工资扣除）
  if (data.enableFund) {
    result.fundPersonal = new Decimal(actualFundBase).times(data.fundPersonalRate).div(100).toDecimalPlaces(3).toNumber()
    result.fundCompany = new Decimal(actualFundBase).times(data.fundCompanyRate).div(100).toDecimalPlaces(3).toNumber()
  }

  // 4. 计算年金（税前工资扣除）
  if (data.enableAnnuity) {
    result.annuityPersonal = new Decimal(actualAnnuityBase).times(data.annuityPersonalRate).div(100).toDecimalPlaces(3).toNumber()
    result.annuityCompany = new Decimal(actualAnnuityBase).times(data.annuityCompanyRate).div(100).toDecimalPlaces(3).toNumber()
  }

  // 5. 计算其他个税扣除项（仅个税计算，不扣工资）
  const otherTaxDeductions = new Decimal(data.taxDeferredInsurance || 0)
    .plus(data.personalPension || 0)
    .plus(data.donationDeduction || 0)
    .toDecimalPlaces(3)
    .toNumber()

  // 6. 计算应纳税所得额
  // 税前工资扣除项：三险+公积金+年金 → 从工资中扣除
  // 个税扣除项：专项附加+税延险+养老金+捐赠 → 仅抵扣个税，不扣工资
  const preTaxDeductions = new Decimal(result.autoSpecialDeduction)
    .plus(result.fundPersonal)
    .plus(result.annuityPersonal)
    .toDecimalPlaces(3)
    .toNumber()

  const taxableIncome = Math.max(0,
    new Decimal(data.preTaxSalary)
      .minus(preTaxDeductions)
      .minus(taxThresholdMonthly)
      .minus(data.specialAddDeductionTotal || 0)
      .minus(otherTaxDeductions)
      .toDecimalPlaces(3)
      .toNumber()
  )

  // 7. 计算个税
  if (taxableIncome > 0) {
    const taxLevel = taxRateTableMonthly.find(level => taxableIncome > level.min && taxableIncome <= level.max) || taxRateTableMonthly[taxRateTableMonthly.length - 1]
    result.personalTax = new Decimal(taxableIncome)
      .times(taxLevel.rate)
      .div(100)
      .minus(taxLevel.deduct)
      .toDecimalPlaces(3)
      .toNumber()
  } else {
    result.personalTax = 0
  }

  // 8. 计算税后工资（工资 - 三险 - 公积金 - 年金 - 个税）
  result.afterTaxSalary = new Decimal(data.preTaxSalary)
    .minus(preTaxDeductions)
    .minus(result.personalTax)
    .toDecimalPlaces(3)
    .toNumber()

  // 9. 计算总计
  result.totalPersonal = new Decimal(preTaxDeductions)
    .plus(result.personalTax)
    .plus(otherTaxDeductions)
    .toDecimalPlaces(3)
    .toNumber()

  result.totalCompany = new Decimal(result.pensionCompany)
    .plus(result.medicalCompany)
    .plus(result.unemploymentCompany)
    .plus(result.injuryCompany)
    .plus(result.fundCompany)
    .plus(result.annuityCompany)
    .toDecimalPlaces(3)
    .toNumber()

  // 最终结果保留2位小数
  Object.keys(result).forEach(key => {
    result[key] = Number(result[key].toFixed(2))
  })

  return result
}

// 计算月度基础版
const calculateMonthly = () => {
  monthlyResult.value = calculateMonth(monthlyData.value)
}

// 计算单个年度月份（包含累计计算）
const calculateYearlyMonth = (index) => {
  if (!yearlyMonths.value[index]) return

  // 先计算专项附加扣除
  calculateSpecialAddDeductionForMonth(index)

  // 然后重新计算所有月份，确保累计数据正确
  calculateAllYearlyMonths()
}

// 计算所有年度月份（实现累计个税计算）
const calculateAllYearlyMonths = () => {
  // 重置累计数据
  let cumulativePreTaxSalary = 0
  let cumulativeDeductions = 0
  let cumulativeSpecialAddDeductions = 0
  let cumulativeOtherDeductions = 0
  let cumulativeTax = 0

  yearlyMonths.value.forEach((month, index) => {
    // 计算专项附加扣除
    calculateSpecialAddDeductionForMonth(index)

    // 应用7月变更基数设置
    let monthData = { ...month.data }
    if (julyBaseChange.value.enable && index >= 6) { // 7月及以后的月份（index从0开始）
      // 更新社保基数
      if (julyBaseChange.value.socialSecurityBase !== null) {
        monthData.socialSecurityBase = julyBaseChange.value.socialSecurityBase
      }
      // 更新公积金基数
      if (julyBaseChange.value.fundBase !== null) {
        monthData.fundBase = julyBaseChange.value.fundBase
      } else if (monthData.enableFund) {
        // 如果公积金基数未设置但启用了公积金，则使用社保基数
        monthData.fundBase = julyBaseChange.value.socialSecurityBase || monthData.socialSecurityBase
      }
      // 更新年金基数
      if (julyBaseChange.value.annuityBase !== null) {
        monthData.annuityBase = julyBaseChange.value.annuityBase
      } else if (monthData.enableAnnuity) {
        // 如果年金基数未设置但启用了年金，则使用社保基数
        monthData.annuityBase = julyBaseChange.value.socialSecurityBase || monthData.socialSecurityBase
      }
    }

    // 基础计算（不包含个税）
    const tempResult = calculateMonth(monthData)

    // 累计数据
    cumulativePreTaxSalary += month.data.preTaxSalary
    cumulativeDeductions += tempResult.autoSpecialDeduction + tempResult.fundPersonal + tempResult.annuityPersonal
    cumulativeSpecialAddDeductions += month.data.specialAddDeductionTotal || 0
    cumulativeOtherDeductions += month.data.taxDeferredInsurance + month.data.personalPension + month.data.donationDeduction

    // 计算年度应纳税所得额（使用逐月累计的起征点）
    const currentMonthCount = index + 1 // 当前是第几个月（从1开始）
    const cumulativeTaxThreshold = 5000 * currentMonthCount // 累计起征点
    const yearlyTaxableIncome = Math.max(0,
      cumulativePreTaxSalary - cumulativeDeductions - cumulativeTaxThreshold - cumulativeSpecialAddDeductions - cumulativeOtherDeductions
    )

    // 计算年度累计个税
    let yearlyCumulativeTax = 0
    if (yearlyTaxableIncome > 0) {
      const taxLevel = taxRateTableYearly.find(level => yearlyTaxableIncome > level.min && yearlyTaxableIncome <= level.max) || taxRateTableYearly[taxRateTableYearly.length - 1]
      yearlyCumulativeTax = yearlyTaxableIncome * taxLevel.rate / 100 - taxLevel.deduct
    }

    // 计算当月个税（累计个税 - 前期累计个税）
    const currentMonthTax = Math.max(0, yearlyCumulativeTax - cumulativeTax)
    cumulativeTax = yearlyCumulativeTax

    // 更新结果
    month.result = {
      ...tempResult,
      personalTax: currentMonthTax,
      afterTaxSalary: month.data.preTaxSalary - (tempResult.autoSpecialDeduction + tempResult.fundPersonal + tempResult.annuityPersonal) - currentMonthTax
    }
  })

  calculateYearlySummary()
}

// 计算年度汇总
const calculateYearlySummary = () => {
  try {
    const summary = {
      totalPreTax: 0,
      totalTax: 0,
      totalAfterTax: 0,
      totalPersonalDeduction: 0,
      totalCompanyPayment: 0,
      totalPreTaxDeduction: 0,
      totalFundDeduction: 0,
      totalSpecialAddDeduction: 0
    }

    // 检查yearlyMonths.value是否为数组
    if (yearlyMonths.value && Array.isArray(yearlyMonths.value)) {
      yearlyMonths.value.forEach(month => {
        if (month && month.data && month.result) {
          summary.totalPreTax += month.data.preTaxSalary || 0
          summary.totalTax += month.result.personalTax || 0
          summary.totalAfterTax += month.result.afterTaxSalary || 0
          summary.totalPersonalDeduction += month.result.totalPersonal || 0
          summary.totalCompanyPayment += month.result.totalCompany || 0
          summary.totalPreTaxDeduction += month.result.autoSpecialDeduction || 0
          summary.totalFundDeduction += month.result.fundPersonal || 0
          summary.totalSpecialAddDeduction += month.data.specialAddDeductionTotal || 0
        }
      })
    }

    yearlySummary.value = summary
  } catch (error) {
    console.error('Error in calculateYearlySummary:', error)
  }
}

// 初始化年度月份数据（只有在没有加载到年度数据时才初始化）
if (!hasLoadedYearlyData) {
  console.log('No yearly data loaded, initializing new yearly months');
  initYearlyMonths()
}

// 计算特殊扣除和月度结果
calculateSpecialAddDeduction()
calculateMonthly()

// 如果有7月变更基数设置，应用它
if (julyBaseChange.value.enable) {
  console.log('Applying July base change settings');
  applyJulyBaseChangeToDisplay()
  calculateAllYearlyMonths()
}

// 全局阻止数值输入框的滑轮事件
window.addEventListener('wheel', (e) => {
  if (e.target.type === 'number') {
    e.preventDefault()
  }
}, { passive: false })

// 监听月度数据变化，自动重新计算
watch([
  () => monthlyData.value.preTaxSalary,
  () => monthlyData.value.socialSecurityBase,
  () => monthlyData.value.medicalExtraFee,
  () => monthlyData.value.enableFund,
  () => monthlyData.value.fundBase,
  () => monthlyData.value.enableAnnuity,
  () => monthlyData.value.annuityBase,
  () => monthlyData.value.taxDeferredInsurance,
  () => monthlyData.value.personalPension,
  () => monthlyData.value.donationDeduction
], calculateMonthly)

// 监听五险两金比例变化，自动同步到年度数据
watch([
  () => monthlyData.value.pensionPersonalRate,
  () => monthlyData.value.pensionCompanyRate,
  () => monthlyData.value.medicalPersonalRate,
  () => monthlyData.value.medicalCompanyRate,
  () => monthlyData.value.unemploymentPersonalRate,
  () => monthlyData.value.unemploymentCompanyRate,
  () => monthlyData.value.injuryCompanyRate,
  () => monthlyData.value.fundPersonalRate,
  () => monthlyData.value.fundCompanyRate,
  () => monthlyData.value.annuityPersonalRate,
  () => monthlyData.value.annuityCompanyRate
], () => {
  // 同步五险两金比例到年度数据
  yearlyMonths.value.forEach(month => {
    if (month && month.data) {
      month.data.pensionPersonalRate = monthlyData.value.pensionPersonalRate
      month.data.pensionCompanyRate = monthlyData.value.pensionCompanyRate
      month.data.medicalPersonalRate = monthlyData.value.medicalPersonalRate
      month.data.medicalCompanyRate = monthlyData.value.medicalCompanyRate
      month.data.unemploymentPersonalRate = monthlyData.value.unemploymentPersonalRate
      month.data.unemploymentCompanyRate = monthlyData.value.unemploymentCompanyRate
      month.data.injuryCompanyRate = monthlyData.value.injuryCompanyRate
      month.data.fundPersonalRate = monthlyData.value.fundPersonalRate
      month.data.fundCompanyRate = monthlyData.value.fundCompanyRate
      month.data.annuityPersonalRate = monthlyData.value.annuityPersonalRate
      month.data.annuityCompanyRate = monthlyData.value.annuityCompanyRate
    }
  })
  // 重新计算所有月份
  calculateAllYearlyMonths()
  console.log('Synced insurance and fund rates to yearly data')
}, { deep: true })

// 防抖函数，减少频繁保存
let saveTimeout = null;
const debouncedSave = () => {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    try {
      // 保存基础数据
      const baseSaveData = {
        ...monthlyData.value
      };
      console.log('Saving base data to localStorage:', baseSaveData);
      saveBaseDataToLocalStorage(baseSaveData);

      // 保存年度数据
      const yearlySaveData = {
        yearlyMonths: yearlyMonths.value,
        julyBaseChange: julyBaseChange.value
      };
      console.log('Saving yearly data to localStorage:', yearlySaveData);
      saveYearlyDataToLocalStorage(yearlySaveData);
    } catch (error) {
      console.error('Error in debouncedSave:', error);
    }
  }, 300); // 300ms防抖，减少卡顿
};

// 监听专项附加扣除项变化，自动更新合计
watch(
    () => monthlyData.value.specialAddItems,
    () => {
      calculateSpecialAddDeduction();
      calculateMonthly();
      debouncedSave(); // 防抖保存
    },
    { deep: true }
);

// 监听月度数据变化，自动保存到localStorage
watch(
    monthlyData,
    () => {
      debouncedSave(); // 防抖保存
    },
    { deep: true }
);

// 监听年度数据变化，自动保存到localStorage
watch(
    yearlyMonths,
    () => {
      debouncedSave(); // 防抖保存
    },
    { deep: true }
);

// 监听7月变更基数设置变化，自动保存到localStorage
watch(
    julyBaseChange,
    () => {
      applyJulyBaseChangeToDisplay();
      calculateAllYearlyMonths();
      debouncedSave(); // 防抖保存
    },
    { deep: true }
);

// 页面卸载前，保存所有数据
onBeforeUnmount(() => {
  clearTimeout(saveTimeout);
  // 保存基础数据
  const baseSaveData = {
    ...monthlyData.value
  };
  console.log('Saving base data on unmount:', baseSaveData);
  saveBaseDataToLocalStorage(baseSaveData);

  // 保存年度数据
  const yearlySaveData = {
    yearlyMonths: yearlyMonths.value,
    julyBaseChange: julyBaseChange.value
  };
  console.log('Saving yearly data on unmount:', yearlySaveData);
  saveYearlyDataToLocalStorage(yearlySaveData);
});
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
