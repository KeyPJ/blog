// 个税税率表（月度）
export const taxRateTableMonthly = [
  { min: 0, max: 3000, rate: 3, deduct: 0 },
  { min: 3000, max: 12000, rate: 10, deduct: 210 },
  { min: 12000, max: 25000, rate: 20, deduct: 1410 },
  { min: 25000, max: 35000, rate: 25, deduct: 2660 },
  { min: 35000, max: 55000, rate: 30, deduct: 4410 },
  { min: 55000, max: 80000, rate: 35, deduct: 7160 },
  { min: 80000, max: Infinity, rate: 45, deduct: 15160 }
]

// 个税税率表（年度）
export const taxRateTableYearly = [
  { min: 0, max: 36000, rate: 3, deduct: 0 },
  { min: 36000, max: 144000, rate: 10, deduct: 2520 },
  { min: 144000, max: 300000, rate: 20, deduct: 16920 },
  { min: 300000, max: 420000, rate: 25, deduct: 31920 },
  { min: 420000, max: 660000, rate: 30, deduct: 52920 },
  { min: 660000, max: 960000, rate: 35, deduct: 85920 },
  { min: 960000, max: Infinity, rate: 45, deduct: 181920 }
]

// 个税起征点（月度）
export const taxThresholdMonthly = 5000

// 专项附加扣除配置（官方标准）
export const specialAddConfig = {
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

// 默认数据
export const defaultData = {
  // 基础薪资
  preTaxSalary: 10000,
  socialSecurityBase: null,
  medicalExtraFee: 3, // 大病互助/长护险 默认3元/月

  // 社保比例
  pensionPersonalRate: 8,
  pensionCompanyRate: 16,
  medicalPersonalRate: 2,
  medicalCompanyRate: 9.8,
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
