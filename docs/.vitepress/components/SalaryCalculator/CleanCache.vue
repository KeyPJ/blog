<!-- .vitepress/components/SalaryCalculator/CleanCache.vue -->
<template>
  <div class="clean-cache">
    <button class="btn btn-danger" @click="showConfirmDialog = true">清理计算器缓存</button>
    
    <!-- 确认对话框 -->
    <div v-if="showConfirmDialog" class="confirm-dialog">
      <div class="dialog-content">
        <h4>确认清理缓存</h4>
        <p>此操作将清除所有计算器设置和历史数据，恢复到默认状态。</p>
        <p>确定要继续吗？</p>
        <div class="dialog-buttons">
          <button class="btn btn-secondary" @click="showConfirmDialog = false">取消</button>
          <button class="btn btn-danger" @click="cleanCache">确定清理</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['cache-cleared'])

// 确认对话框状态
const showConfirmDialog = ref(false)

// 清理缓存
const cleanCache = () => {
  try {
    // 清除本地存储中的计算器数据
    localStorage.removeItem('salaryCalculatorBaseData')
    localStorage.removeItem('salaryCalculatorYearlyData')
    
    // 通知父组件缓存已清除
    emit('cache-cleared')
    
    // 显示成功消息
    alert('缓存清理成功！页面将刷新以恢复默认设置。')
    
    // 刷新页面以加载默认数据
    location.reload()
  } catch (error) {
    console.error('清理缓存失败:', error)
    alert('清理缓存失败，请重试。')
  } finally {
    // 关闭确认对话框
    showConfirmDialog.value = false
  }
}
</script>

<style scoped>
.clean-cache {
  margin: 10px 0;
}

.btn {
  padding: 8px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.btn-danger {
  background: #dc3545;
  color: #fff;
}

.btn-danger:hover {
  background: #c82333;
}

.btn-secondary {
  background: #6c757d;
  color: #fff;
  margin-right: 10px;
}

.btn-secondary:hover {
  background: #5a6268;
}

/* 确认对话框样式 */
.confirm-dialog {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.dialog-content {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.dialog-content h4 {
  margin-top: 0;
  color: #333;
}

.dialog-content p {
  margin: 10px 0;
  color: #666;
}

.dialog-buttons {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>