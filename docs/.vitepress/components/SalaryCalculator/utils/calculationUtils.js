import { Decimal } from 'decimal.js'
import { taxRateTableMonthly, taxRateTableYearly, taxThresholdMonthly, specialAddConfig } from '../config/taxConfig.js'

// 计算专项附加扣除合计（通用）
export const calculateSpecialAddDeduction = (items) => {
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

// 通用计算函数（单个月份）
export const calculateMonth = (data) => {
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
  const actualSSBase = data.socialSecurityBase || data.preTaxSalary || 0
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

// 计算年度汇总
export const calculateYearlySummary = (yearlyMonths) => {
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

  // 检查yearlyMonths是否为数组
  if (yearlyMonths && Array.isArray(yearlyMonths)) {
    yearlyMonths.forEach(month => {
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

  return summary
}
