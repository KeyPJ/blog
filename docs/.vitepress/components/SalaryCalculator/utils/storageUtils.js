// 从localStorage读取基础数据
export const loadBaseDataFromLocalStorage = () => {
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
export const loadYearlyDataFromLocalStorage = () => {
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
export const saveBaseDataToLocalStorage = (data) => {
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
export const saveYearlyDataToLocalStorage = (data) => {
  try {
    // 检查localStorage是否存在（避免服务器端渲染错误）
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('salaryCalculatorYearlyData', JSON.stringify(data))
    }
  } catch (error) {
    console.error('Failed to save yearly data to localStorage:', error)
  }
}
