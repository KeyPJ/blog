import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { defaultData } from '../config/taxConfig.js'
import { loadBaseDataFromLocalStorage, loadYearlyDataFromLocalStorage, saveBaseDataToLocalStorage, saveYearlyDataToLocalStorage } from '../utils/storageUtils.js'
import { calculateMonth, calculateSpecialAddDeduction, calculateYearlySummary } from '../utils/calculationUtils.js'
import { taxRateTableYearly } from '../config/taxConfig.js'

// 主要的薪资计算器 composable
export function useSalaryCalculator() {
  // 计算模式：monthly-月度基础版，yearly-年度版
  const calcMode = ref('monthly')

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

  // 保存原始基数数据，用于取消启用时恢复
  const originalBaseData = ref({})

  // 防抖函数，减少频繁保存
  let saveTimeout = null
  const debouncedSave = () => {
    clearTimeout(saveTimeout)
    saveTimeout = setTimeout(() => {
      try {
        // 保存基础数据
        const baseSaveData = {
          ...monthlyData.value
        }
        console.log('Saving base data to localStorage:', baseSaveData)
        saveBaseDataToLocalStorage(baseSaveData)

        // 保存年度数据
        const yearlySaveData = {
          yearlyMonths: yearlyMonths.value,
          julyBaseChange: julyBaseChange.value
        }
        console.log('Saving yearly data to localStorage:', yearlySaveData)
        saveYearlyDataToLocalStorage(yearlySaveData)
      } catch (error) {
        console.error('Error in debouncedSave:', error)
      }
    }, 300) // 300ms防抖，减少卡顿
  }

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
            console.warn('Yearly months length incorrect, initializing new yearly data')
            initYearlyMonths()
          }
        }
      }
    } catch (error) {
      console.error('Failed to load yearly data from localStorage:', error)
    }
    return false // 表示没有加载到年度数据
  }

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
      console.log("newMonthData", newMonthData)
      // newMonthData.socialSecurityBase = newMonthData.socialSecurityBase || newMonthData.preTaxSalary
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
    calculateSpecialAddDeductionForMonthly()
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
  const calculateSpecialAddDeductionForMonthly = () => {
    monthlyData.value.specialAddDeductionTotal = calculateSpecialAddDeduction(monthlyData.value.specialAddItems)
  }

  // 计算专项附加扣除合计（年度单月）
  const calculateSpecialAddDeductionForMonth = (index) => {
    const month = yearlyMonths.value[index]
    if (!month) return

    month.data.specialAddDeductionTotal = calculateSpecialAddDeduction(month.data.specialAddItems)
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

      // 计算当月应纳税所得额
      const monthlyTaxableIncome = Math.max(0,
        month.data.preTaxSalary - (tempResult.autoSpecialDeduction + tempResult.fundPersonal + tempResult.annuityPersonal) - 5000 - (month.data.specialAddDeductionTotal || 0) - ((month.data.taxDeferredInsurance || 0) + (month.data.personalPension || 0) + (month.data.donationDeduction || 0))
      )

      // 计算年度应纳税所得额（使用逐月累计的起征点）
      const currentMonthCount = index + 1 // 当前是第几个月（从1开始）
      const cumulativeTaxThreshold = 5000 * currentMonthCount // 累计起征点
      const yearlyTaxableIncome = Math.max(0,
        cumulativePreTaxSalary - cumulativeDeductions - cumulativeTaxThreshold - cumulativeSpecialAddDeductions - cumulativeOtherDeductions
      )

      // 计算年度累计个税
      let yearlyCumulativeTax = 0
      let taxRate = 0
      let quickDeduction = 0
      if (yearlyTaxableIncome > 0) {
        const taxLevel = taxRateTableYearly.find(level => yearlyTaxableIncome > level.min && yearlyTaxableIncome <= level.max) || taxRateTableYearly[taxRateTableYearly.length - 1]
        yearlyCumulativeTax = yearlyTaxableIncome * taxLevel.rate / 100 - taxLevel.deduct
        taxRate = taxLevel.rate
        quickDeduction = taxLevel.deduct
      }

      // 计算当月个税（累计个税 - 前期累计个税）
      const currentMonthTax = Math.max(0, yearlyCumulativeTax - cumulativeTax)
      const paidTax = cumulativeTax
      cumulativeTax = yearlyCumulativeTax

      // 更新结果
      month.result = {
        ...tempResult,
        personalTax: currentMonthTax,
        afterTaxSalary: month.data.preTaxSalary - (tempResult.autoSpecialDeduction + tempResult.fundPersonal + tempResult.annuityPersonal) - currentMonthTax,
        taxableIncome: monthlyTaxableIncome,
        cumulativeTaxableIncome: yearlyTaxableIncome,
        taxRate: taxRate,
        quickDeduction: quickDeduction,
        cumulativeTax: yearlyCumulativeTax,
        paidTax: paidTax
      }
    })

    // 更新年度汇总
    yearlySummary.value = calculateYearlySummary(yearlyMonths.value)
  }

  // 初始化
  const init = () => {
    // 加载年度数据
    const hasLoadedYearlyData = loadYearlyData()

    // 初始化年度月份数据（只有在没有加载到年度数据时才初始化）
    if (!hasLoadedYearlyData) {
      console.log('No yearly data loaded, initializing new yearly months')
      initYearlyMonths()
    }

    // 计算特殊扣除和月度结果
    calculateSpecialAddDeductionForMonthly()
    calculateMonthly()

    // 如果有7月变更基数设置，应用它
    if (julyBaseChange.value.enable) {
      console.log('Applying July base change settings')
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

    // 监听专项附加扣除项变化，自动更新合计
    watch(
      () => monthlyData.value.specialAddItems,
      () => {
        calculateSpecialAddDeductionForMonthly()
        calculateMonthly()
        debouncedSave() // 防抖保存
      },
      { deep: true }
    )

    // 监听月度数据变化，自动保存到localStorage
    watch(
      monthlyData,
      () => {
        debouncedSave() // 防抖保存
      },
      { deep: true }
    )

    // 监听年度数据变化，自动保存到localStorage
    watch(
      yearlyMonths,
      () => {
        debouncedSave() // 防抖保存
      },
      { deep: true }
    )

    // 监听7月变更基数设置变化，自动保存到localStorage
    watch(
      julyBaseChange,
      () => {
        applyJulyBaseChangeToDisplay()
        calculateAllYearlyMonths()
        debouncedSave() // 防抖保存
      },
      { deep: true }
    )

    // 页面卸载前，保存所有数据
    onBeforeUnmount(() => {
      clearTimeout(saveTimeout)
      // 保存基础数据
      const baseSaveData = {
        ...monthlyData.value
      }
      console.log('Saving base data on unmount:', baseSaveData)
      saveBaseDataToLocalStorage(baseSaveData)

      // 保存年度数据
      const yearlySaveData = {
        yearlyMonths: yearlyMonths.value,
        julyBaseChange: julyBaseChange.value
      }
      console.log('Saving yearly data on unmount:', yearlySaveData)
      saveYearlyDataToLocalStorage(yearlySaveData)
    })
  }

  return {
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
  }
}
