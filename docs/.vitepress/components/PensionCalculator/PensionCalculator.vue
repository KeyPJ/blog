<template>
  <div class="pension-calculator">
    <div class="hero-card">
      <div class="hero-badge"><i class="fas fa-hand-holding-heart"></i> 政府惠民·养老提档专属通道</div>
      <div class="hero-title">城乡居民养老保险<br>缴费档次变更 · 多缴多得</div>
      <div class="hero-sub">
        <span><i class="fas fa-arrow-up"></i> 一次提档·终身受用</span>
        <span><i class="fas fa-chart-line"></i> 最高可提至9600元/年</span>
        <span><i class="fas fa-star-of-life"></i> 缴费年限增发补贴</span>
      </div>
      <div class="highlight-gold"><i class="fas fa-heart"></i> 为父母多存一份养老钱，是最实在的孝心</div>
    </div>

    <div class="control-panel">
      <div class="slider-group">
        <div class="label-row">
          <label><i class="fas fa-coins"></i> 年缴费档次（提档目标）</label>
          <span class="value-badge">{{ formatNumber(annualAmount) }} 元/年</span>
        </div>
        <input type="range" v-model.number="sliderValue" min="300" max="9600" step="100">
        <div class="quick-buttons">
          <button class="quick-btn" :class="{active: annualAmount === 300}" @click="setAnnual(300)">300元（参考）</button>
          <button class="quick-btn" :class="{active: annualAmount === 2000}" @click="setAnnual(2000)">2000元</button>
          <button class="quick-btn" :class="{active: annualAmount === 5000}" @click="setAnnual(5000)">5000元</button>
          <button class="quick-btn" :class="{active: annualAmount === 9600}" @click="setAnnual(9600)">9600元（湖北上限）</button>
          <button class="quick-btn" :class="{active: annualAmount === 45000}" @click="setAnnual(45000)">45000元*</button>
        </div>
        <div class="flex-row-inputs">
          <div class="input-group">
            <label><i class="fas fa-pen-alt"></i> 手动输入整百金额</label>
            <input type="number" v-model="manualInputValue" step="100" placeholder="支持大于9600">
            <div class="hint-text">允许超过9600，超出时请确认当地政策</div>
          </div>
          <div class="input-group">
            <label><i class="fas fa-calendar-alt"></i> 预计总缴费年限 (年)</label>
            <input type="number" v-model.number="totalYears" step="1" placeholder="至少1年">
            <div class="hint-text">包含已缴和未来补缴年份</div>
          </div>
          <div class="input-group">
            <label><i class="fas fa-sack-dollar"></i> 当前已累计缴费总额 (元)</label>
            <input type="number" v-model.number="currentPaidTotal" step="100" placeholder="如: 4500">
            <div class="hint-text">原300元/年×15年=4500元</div>
          </div>
        </div>
        <div v-if="annualAmount > 9600" class="high-warning">
          <i class="fas fa-exclamation-triangle"></i> <strong>提醒：您设定的缴费档次超过湖北省当前最高标准9600元/年</strong>，请确认参保地是否支持更高档次后再办理提档，避免无法核定。
        </div>
        <div class="warning-hint" v-if="extraPayment < 0">
          <i class="fas fa-info-circle"></i> 已缴总额已超过新标准总额，无需补缴，个人账户总额取较高值。
        </div>
        <div class="footnote-inner">
          <i class="fas fa-calculator"></i> 补缴差额 = max(新档次×年限, 已缴总额) - 已缴总额；个人账户总额 = max(新档次×年限, 已缴总额) 。
        </div>
      </div>

      <div class="base-pension-area">
        <div class="section-title"><i class="fas fa-building"></i> 基础养老金标准 (含年限补贴)</div>
        <div class="pension-mode-group">
          <button class="mode-btn" :class="{active: pensionMode === 'fixed'}" @click="pensionMode = 'fixed'">固定金额（自定义）</button>
          <button class="mode-btn" :class="{active: pensionMode === 'wuhan'}" @click="pensionMode = 'wuhan'">武汉市标准</button>
          <button class="mode-btn" :class="{active: pensionMode === 'other_hubei'}" @click="pensionMode = 'other_hubei'">湖北省内其他地区标准</button>
        </div>
        <div class="base-value-row">
          <div v-if="pensionMode === 'fixed'">
            <label>基础养老金每月金额 (元) : </label>
            <input type="number" v-model.number="fixedBasePension" step="5" class="num-input">
            <span class="hint-text">示例: 巴东标准185+15=200元</span>
          </div>
          <div v-if="pensionMode === 'other_hubei'" class="inline-flex">
            <label>基础养老金基数 (元/月) : </label>
            <input type="number" v-model.number="otherBasePension" step="5" class="num-input-small">
            <span class="hint-text">默认180，可修改</span>
          </div>
          <div v-if="pensionMode === 'wuhan'" class="info-badge">
            武汉政策固定基数367元/月 + 年限增发
          </div>
          <div v-if="pensionMode !== 'fixed' && pensionMode !== 'other_hubei'" class="info-badge">
            当前计算基础养老金 = {{ formatNumber(effectiveBasePension) }} 元/月
          </div>
          <div v-if="pensionMode === 'other_hubei'" class="info-badge">
            有效基础养老金 = {{ formatNumber(effectiveBasePension) }} 元/月 (基数{{ otherBasePension }} + 年限增发)
          </div>
        </div>
        <div class="policy-note">
          <i class="fas fa-chart-line"></i> <strong>年限增发政策简析：</strong>
          <span v-if="pensionMode === 'wuhan'">累计缴费年限 ≤15年部分每满1年加发2元，超过15年部分每满1年加发3元。</span>
          <span v-else-if="pensionMode === 'other_hubei'">非武汉地区：≤15年加发≥1元/年，15~25年加发≥2元/年，25年以上加发≥3元/年（按最低标准测算）。</span>
          <span v-else>您当前使用固定金额模式，可参考各地标准（如武汉367元+年限增发，其他地区基数可自定义+分段增发）。</span>
        </div>
        <div class="detail-note">
          <i class="fas fa-check-circle"></i> <strong>基础养老金与缴费年限增发详细说明</strong><br>
          • <strong>武汉市标准</strong>：基础养老金367元/月，缴费年限≤15年部分每满1年加发2元；＞15年部分每满1年加发3元。<br>
          • <strong>湖北省内其他地区</strong>：基础养老金基数可自定义（默认180元/月），年限增发分段计算：≤15年加发1元/年；15-25年加发2元/年；＞25年加发3元/年（按最低标准）。<br>
          • <strong>固定金额模式</strong>：忽略年限增发，直接使用您输入的基础养老金（如巴东原标准185+15=200元/月）。<br>
          • 提档后养老金 = 基础养老金（含年限增发） + 个人账户总额 ÷ 139，多缴多得，长缴多得。<br>
          • <strong>缴费档次提示</strong>：滑动条最高9600元，手动可输入更高金额，但需确认当地政策。
        </div>
      </div>
    </div>

    <div class="result-grid">
      <div class="stat-card">
        <div class="stat-title"><i class="fas fa-hand-holding-usd"></i> 需补缴差额</div>
        <div class="stat-value">{{ formatNumber(Math.max(0, extraPayment)) }} 元</div>
        <div class="stat-sub">补缴后账户总额提升</div>
      </div>
      <div class="stat-card">
        <div class="stat-title"><i class="fas fa-database"></i> 提档后个人账户总额*</div>
        <div class="stat-value">{{ formatNumber(newAccountTotal) }} 元</div>
        <div class="stat-sub">原已缴{{ formatNumber(currentPaidTotal) }}元 + 补缴{{ formatNumber(Math.max(0, extraPayment)) }}元</div>
      </div>
      <div class="stat-card highlight-big">
        <div class="stat-title"><i class="fas fa-calendar-alt"></i> 提档后月领养老金*</div>
        <div class="stat-value">{{ formatMoney(monthlyPensionAfter) }} 元/月</div>
        <div class="stat-sub">基础养老金{{ formatNumber(effectiveBasePension) }} + 账户÷139</div>
      </div>
      <div class="stat-card">
        <div class="stat-title"><i class="fas fa-trend-up"></i> 年领总额</div>
        <div class="stat-value">{{ formatMoney(annualPensionAfter) }} 元/年</div>
        <div class="stat-sub">晚年保障大幅提高</div>
      </div>
    </div>

    <div class="explain-note">
      <i class="fas fa-comment-dollar"></i> <strong>*关于计算的说明</strong><br>
      以上计算仅供参考，不构成任何建议。个人账户余额仅考虑了缴费,未考虑补贴、利息、资助、补助等其他来源.
    </div>

    <div class="compare-info">
      <div><i class="fas fa-chart-simple"></i> <strong>与当前已缴情况对比</strong> (目前月领: {{ formatMoney(monthlyPensionCurrent) }} 元)</div>
      <div class="upgrade-tag"><i class="fas fa-rocket"></i> 每月多领 {{ formatMoney(monthlyPensionAfter - monthlyPensionCurrent) }} 元 · 涨幅 {{ increasePercent }}%</div>
      <div class="upgrade-tag" style="background:#b3412f; color:white;">养老金 ≈ {{ pensionMultiple }}倍</div>
    </div>

    <div class="info-row">
      <span><i class="fas fa-chart-line"></i> <strong>提档后“回本”年数<sup>*</sup></strong> &nbsp; {{ paybackYears }} 年</span>
      <span class="star-note"><i class="fas fa-info-circle"></i> * 计算方式：个人账户总投入 ÷ 提档后每年领取金额（保留两位小数）</span>
    </div>
    <div class="explain-note">
      <i class="fas fa-comment-dollar"></i> <strong>*关于“回本”年数的说明</strong><br>
      按60岁领取养老待遇，计发月数均为139个月（个人账户余额分139个月发放）。领完个人账户后，国家仍按原标准继续发放终身养老金，因此“多缴多得”长期优势明显。“回本”早的主要原因是缴费档次较低时，基础养老金占月养老金比例较高，而个人账户养老金部分无本质差异。本计算仅展示静态资金回流周期，实际养老保障更看重终身待遇提升。
    </div>

    <div style="overflow-x: auto; margin-bottom: 1.5rem;">
      <table>
        <thead>
          <tr><th>提档目标(元/年)</th><th>需补缴差额(元)</th><th>新个人账户总额(元)</th><th>月领养老金(元)</th><th>提升倍数(对比当前)</th><th>回本年数(年)*</th></tr>
        </thead>
        <tbody>
          <tr v-for="row in compareRows" :key="row.value" :class="{ 'custom-row': row.isCustom }" :style="row.value === annualAmount ? 'background:#fff2dd; font-weight:bold;' : row.isCustom ? 'background:#fff9e6' : ''">
            <td>{{ row.isCustom ? '⭐' : '' }}{{ row.value }}元{{ row.value === 45000 ? '*' : '' }}</td>
            <td>{{ formatNumber(row.extra) }}</td>
            <td>{{ formatNumber(row.accountTotal) }}</td>
            <td>{{ formatMoney(row.monthlyPension) }}</td>
            <td>{{ row.multiple }}倍</td>
            <td>{{ row.payback }}</td>
          </tr>
        </tbody>
      </table>
      <div class="table-note">基于总年限 {{ safeYears }}年、已缴总额 {{ formatNumber(safePaid) }}元，基础养老金按当前选择模式动态计算。回本年数 = 新个人账户总额 ÷ (月领养老金×12)。</div>
    </div>

    <div class="warning">
      <i class="fas fa-exclamation-triangle"></i> <strong>提档机会仅一次，不可退费<span style="color:#b85c00;">*</span>！</strong> 政策截止时间未定，请谨慎决策。单个核定单补缴差额需一次性缴清。
    </div>

    <div class="steps">
      <div class="step">
        <i class="fas fa-id-card"></i>
        <h4>1. 乡镇窗口核定</h4>
        <small>本人携带身份证，户籍所在乡镇社保服务窗口开具“核定单”</small>
      </div>
      <div class="step">
        <i class="fas fa-mobile-alt"></i>
        <h4>2. 湖北电子税务局APP</h4>
        <small>登录APP → 社保费 → 核定单缴费 → 完成支付</small>
      </div>
    </div>

    <div class="footnote">
      <i class="fas fa-check-circle"></i> <strong>重要时限 · 立即办理</strong><br>
      • 2026年度标准：多缴多得。一次提档终身受益，提档上限提升至9600元/年（各县市最高档不一,请核实当地政策标准）。<br>
      • 建议子女主动协助父母办理，官方渠道谨防诈骗。<br>
      • 测算数据依据湖北省巴东现行规则：基础养老金185元+年限补贴15元=200元/月，个人账户月计发标准=账户总额÷139，本工具支持动态微调基础养老金，合理规划量力而行。<br>
      • <strong>缴费渠道补充说明</strong>：除了湖北电子税务局APP，您还可以通过 <strong>鄂汇办APP、支付宝鄂汇办小程序、湖北电子税务局网页</strong> 办理核定缴费，请认准官方渠道。<br>
      • <strong>*注</strong>：<a href="https://www.xiaohongshu.com/discovery/item/699fb4ce000000002801c423?source=webshare&xhsshare=pc_web&xsec_token=CBGvaNTo3E5BTF9rrsV0nSO19tMSERDC9dWU_3VdaIcCs=&xsec_source=pc_share" target="_blank" rel="noopener noreferrer">外省某地某年曾设最高缴费档次45000元/年</a>，目前已取消，此处仅供政策回顾参考。<br>
      • <strong>*关于“不可退费”的说明</strong>：此处“退费”指提档后不允许以“误缴”或“反悔”为由申请退回差额补缴款，并非指参保人权益注销结算。若参保人不幸去世，其继承人可按规定办理城乡居民养老保险关系注销，<strong>个人账户剩余余额将一次性退还给法定继承人</strong>；若满足当地丧葬补助金申领条件（如缴费年限、死亡情形等），还可额外领取丧葬补助金。特此说明，以正视听。
    </div>
    <div class="bottom-slogan">
      <i class="fas fa-shield-alt"></i> 官方惠民通道 · 一次提档 保障晚年 · 最高9600元/年
    </div>
    <div class="app-footer">
      <p>inspired by <a href="https://blogimg.52v6.com/2026/04/cf4fa1ac61f343853878afc7529d87ac.webp" target="_blank" rel="noopener noreferrer">巴东县宣传图</a> | made by <a href="/me" target="_blank" rel="noopener noreferrer">云林夕</a></p>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'

const MIN_ANNUAL = 300
const MIN_YEARS = 1
const COMPARE_LEVELS = [
  { value: 300 }, { value: 2000 }, { value: 5000 }, { value: 9600 }, { value: 45000 }
]

function useDebouncedWatch(sourceRef, validateFn, delay = 2000) {
  let timer = null
  watch(sourceRef, () => {
    clearTimeout(timer)
    timer = setTimeout(validateFn, delay)
  })
}

function toSafeNum(sourceRef) {
  return computed(() => { const v = Number(sourceRef.value); return isNaN(v) ? 0 : v })
}

export default {
  name: 'PensionCalculator',
  setup() {
    const annualAmount = ref(9600)
    const sliderValue = ref(Math.min(annualAmount.value, 9600))
    const totalYears = ref(15)
    const currentPaidTotal = ref(4500)
    const manualInputValue = ref(annualAmount.value)

    const pensionMode = ref('fixed')
    const fixedBasePension = ref(200)
    const otherBasePension = ref(180)

    watch(sliderValue, (newVal) => {
      if (annualAmount.value !== newVal) annualAmount.value = newVal
      if (manualInputValue.value !== newVal) manualInputValue.value = newVal
    })
    watch(annualAmount, (newVal) => {
      const clamped = Math.min(newVal, 9600)
      if (sliderValue.value !== clamped) sliderValue.value = clamped
      if (manualInputValue.value !== newVal) manualInputValue.value = newVal
    })

    const roundToHundred = (val) => {
      let num = Number(val)
      if (isNaN(num)) return MIN_ANNUAL
      num = Math.round(num / 100) * 100
      if (num < MIN_ANNUAL) return MIN_ANNUAL
      return num
    }
    const setAnnual = (val) => {
      let target = roundToHundred(val)
      annualAmount.value = target
      manualInputValue.value = target
    }

    useDebouncedWatch(totalYears, () => {
      const y = Number(totalYears.value)
      if (isNaN(y) || y < MIN_YEARS) totalYears.value = MIN_YEARS
    })
    useDebouncedWatch(currentPaidTotal, () => {
      const v = Number(currentPaidTotal.value)
      if (isNaN(v) || v < 0) currentPaidTotal.value = 0
    })
    useDebouncedWatch(manualInputValue, () => {
      let corrected = roundToHundred(manualInputValue.value)
      if (corrected !== annualAmount.value) annualAmount.value = corrected
      manualInputValue.value = corrected
    })
    useDebouncedWatch(fixedBasePension, () => {
      const v = Number(fixedBasePension.value)
      if (isNaN(v) || v < 100) fixedBasePension.value = 200
    })
    useDebouncedWatch(otherBasePension, () => {
      const v = Number(otherBasePension.value)
      if (isNaN(v) || v < 100) otherBasePension.value = 180
    })

    const safeAnnual = toSafeNum(annualAmount)
    const safeYears = toSafeNum(totalYears)
    const safePaid = toSafeNum(currentPaidTotal)
    const safeFixedBase = toSafeNum(fixedBasePension)
    const safeOtherBase = toSafeNum(otherBasePension)

    const wuhanBonus = computed(() => {
      const n = Math.floor(safeYears.value)
      if (n <= 15) return n * 2
      return 15 * 2 + (n - 15) * 3
    })
    const otherBonus = computed(() => {
      const n = Math.floor(safeYears.value)
      let bonus = 0
      bonus += Math.min(n, 15) * 1
      if (n > 15) bonus += Math.min(n - 15, 10) * 2
      if (n > 25) bonus += (n - 25) * 3
      return bonus
    })

    const effectiveBasePension = computed(() => {
      if (pensionMode.value === 'wuhan') return 367 + wuhanBonus.value
      if (pensionMode.value === 'other_hubei') return safeOtherBase.value + otherBonus.value
      return safeFixedBase.value
    })

    const targetTotalShould = computed(() => safeAnnual.value * safeYears.value)
    const newAccountTotal = computed(() => Math.max(targetTotalShould.value, safePaid.value))
    const extraPayment = computed(() => newAccountTotal.value - safePaid.value)

    const monthlyPensionCurrent = computed(() => effectiveBasePension.value + (safePaid.value / 139))
    const monthlyPensionAfter = computed(() => effectiveBasePension.value + (newAccountTotal.value / 139))
    const annualPensionAfter = computed(() => monthlyPensionAfter.value * 12)
    const increasePercent = computed(() => {
      if (monthlyPensionCurrent.value <= 0) return 0
      return ((monthlyPensionAfter.value / monthlyPensionCurrent.value - 1) * 100).toFixed(1)
    })
    const pensionMultiple = computed(() => {
      if (monthlyPensionCurrent.value <= 0) return '1.00'
      return (monthlyPensionAfter.value / monthlyPensionCurrent.value).toFixed(2)
    })

    const paybackYears = computed(() => {
      const annualIncome = annualPensionAfter.value
      if (annualIncome <= 0) return '∞'
      return (newAccountTotal.value / annualIncome).toFixed(2)
    })

    const compareRows = computed(() => {
      const presetValues = COMPARE_LEVELS.map(l => l.value)
      const preset = presetValues.includes(safeAnnual.value)
      const levels = preset ? COMPARE_LEVELS : [...COMPARE_LEVELS, { value: safeAnnual.value }].sort((a, b) => a.value - b.value)
      return levels.map(level => {
        const accountTotal = Math.max(level.value * safeYears.value, safePaid.value)
        const monthlyPension = effectiveBasePension.value + (accountTotal / 139)
        return {
          value: level.value,
          isCustom: !presetValues.includes(level.value),
          extra: Math.max(0, level.value * safeYears.value - safePaid.value),
          accountTotal,
          monthlyPension,
          multiple: (monthlyPension / monthlyPensionCurrent.value).toFixed(2),
          payback: (accountTotal / (monthlyPension * 12)).toFixed(2)
        }
      })
    })

    const formatNumber = (num) => {
      if (num === undefined || num === null) return '0'
      const n = Number(num)
      if (isNaN(n)) return '0'
      return Math.round(n).toLocaleString('zh-CN')
    }
    const formatMoney = (num) => {
      const n = Number(num)
      if (isNaN(n)) return '0.00'
      return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    }

    return {
      annualAmount,
      sliderValue,
      totalYears,
      currentPaidTotal,
      manualInputValue,
      pensionMode,
      fixedBasePension,
      otherBasePension,
      effectiveBasePension,
      safeYears,
      safePaid,
      newAccountTotal,
      extraPayment,
      monthlyPensionCurrent,
      monthlyPensionAfter,
      annualPensionAfter,
      increasePercent,
      pensionMultiple,
      paybackYears,
      compareRows,
      formatNumber,
      formatMoney,
      setAnnual
    }
  }
}
</script>






<style scoped>
/* 浅红色主题样式 */
.pension-calculator {
  max-width: 1280px;
  margin: 0 auto;
}
/* 表格移动端优化 - 减少横向滑动距离 */
.pension-calculator :deep(table) {
  min-width: 560px;  /* 从760px调低，适合6列紧凑显示 */
  width: 100%;
}
.pension-calculator :deep(th),
.pension-calculator :deep(td) {
  padding: 6px 4px;   /* 减小内边距 */
  font-size: 0.75rem; /* 适当缩小字体 */
  white-space: nowrap;
}
/* 针对特定列可略微增加宽度弹性，但不影响整体 */
@media (max-width: 700px) {
  .pension-calculator :deep(th),
  .pension-calculator :deep(td) {
    padding: 4px 2px;
    font-size: 0.7rem;
  }
}

/* 头部卡片：浅红色渐变 */
.hero-card {
  background: linear-gradient(135deg, #e25c4a, #c73e31);
  border-radius: 2rem;
  padding: 1.5rem 2rem;
  margin-bottom: 2rem;
  color: white;
  box-shadow: 0 20px 35px -10px rgba(226, 92, 74, 0.3);
  position: relative;
  overflow: hidden;
}
.hero-card::before { content: "🎯"; font-size: 180px; position: absolute; right: -20px; bottom: -50px; opacity: 0.1; pointer-events: none; }
.hero-badge { background: #ffc107; color: #b3412f; display: inline-block; padding: 0.25rem 1rem; border-radius: 40px; font-weight: bold; font-size: 0.85rem; margin-bottom: 1rem; }
.hero-title { font-size: 1.8rem; font-weight: 800; margin-bottom: 0.5rem; line-height: 1.2; }
.hero-sub { display: flex; flex-wrap: wrap; gap: 1rem; margin-top: 0.75rem; font-size: 1rem; }
.highlight-gold { background: rgba(255, 193, 7, 0.2); border-left: 4px solid #ffc107; padding: 0.5rem 1rem; border-radius: 16px; font-weight: 500; margin-top: 1rem; }

/* 控制面板 */
.control-panel { background: white; border-radius: 2rem; box-shadow: 0 12px 28px rgba(0,0,0,0.08); padding: 1.5rem 2rem; margin-bottom: 2rem; }
.label-row { display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; margin-bottom: 0.75rem; font-weight: 600; color: #cd5c4b; }
.value-badge { background: #feedeb; padding: 0.2rem 1rem; border-radius: 40px; font-size: 1.3rem; font-weight: 800; color: #e25c4a; }
input[type="range"] { width: 100%; height: 6px; appearance: none; -webkit-appearance: none; background: linear-gradient(90deg, #e25c4a, #ffc107); border-radius: 10px; outline: none; margin: 1rem 0 0.5rem; }
input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; width: 24px; height: 24px; background: #ffc107; border-radius: 50%; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.2); border: 2px solid white; }
.quick-buttons { display: flex; flex-wrap: wrap; gap: 0.8rem; margin: 1rem 0; }
.quick-btn { background: #fef1ef; border: 1px solid #f5cbc4; padding: 0.5rem 1rem; border-radius: 40px; font-weight: 600; font-size: 0.9rem; cursor: pointer; transition: all 0.2s; color: #e25c4a; }
.quick-btn.active, .quick-btn:hover { background: #e25c4a; color: white; border-color: #e25c4a; }
.flex-row-inputs { display: flex; flex-wrap: wrap; gap: 1.5rem; margin-top: 1rem; background: #fdf7f6; padding: 0.8rem 1.2rem; border-radius: 1.8rem; align-items: flex-end; }
.input-group { flex: 1; min-width: 160px; }
.input-group label { display: block; font-size: 0.75rem; font-weight: 600; color: #c25748; margin-bottom: 0.25rem; }
.input-group input { width: 100%; padding: 0.6rem 0.8rem; border-radius: 2rem; border: 1px solid #f1cdc6; font-size: 1rem; font-weight: 600; text-align: center; background: white; }
.hint-text { font-size: 0.7rem; color: #c5857a; margin-top: 0.25rem; }
.warning-hint { background: #fff1e0; border-radius: 1rem; padding: 0.4rem 0.8rem; font-size: 0.7rem; color: #c45c00; margin-top: 8px; }
.footnote-inner { margin-top: 12px; background: #fef8f7; font-size: 0.73rem; padding: 0.5rem 1rem; border-radius: 1rem; }

/* 基础养老金区域 */
.base-pension-area { background: #fdfaf9; border-radius: 1.5rem; padding: 1rem 1.5rem; margin-top: 1rem; }
.section-title { font-weight: 700; margin-bottom: 0.5rem; color: #cd5c4b; }
.pension-mode-group { display: flex; flex-wrap: wrap; gap: 1rem; margin-bottom: 1rem; align-items: center; }
.mode-btn { background: #f2e2de; border: none; padding: 0.4rem 1rem; border-radius: 2rem; font-size: 0.85rem; font-weight: 600; cursor: pointer; color: #b3412f; }
.mode-btn.active { background: #e25c4a; color: white; }
.base-value-row { display: flex; flex-wrap: wrap; align-items: baseline; gap: 0.5rem; }
.num-input { width: 110px; padding: 0.3rem; border-radius: 2rem; border: 1px solid #f1cdc6; text-align: center; }
.num-input-small { width: 100px; padding: 0.3rem; border-radius: 2rem; border: 1px solid #f1cdc6; text-align: center; }
.info-badge { font-weight: 500; background: #fae7e3; padding: 0.3rem 1rem; border-radius: 2rem; color: #b3412f; }
.policy-note { background: #fff8e7; border-left: 4px solid #ffc107; margin-top: 0.8rem; padding: 0.6rem 1rem; border-radius: 1rem; font-size: 0.75rem; color: #4e5f49; }
.detail-note { background: #fef5f3; margin-top: 0.5rem; padding: 0.6rem 1rem; border-radius: 1rem; font-size: 0.75rem; }

/* 结果卡片 */
.result-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
.stat-card { background: white; border-radius: 1.5rem; padding: 1.2rem 1.5rem; box-shadow: 0 5px 15px rgba(0,0,0,0.05); border-left: 6px solid #ffc107; }
.stat-card .stat-value { font-size: 2rem; font-weight: 800; color: #b3412f; line-height: 1.2; }
.stat-sub { font-size: 0.8rem; color: #6f6f6f; margin-top: 0.25rem; }
.highlight-big { background: linear-gradient(120deg, #fff6e6, #ffece6); border-left-color: #e67e22; }

/* 对比信息 */
.compare-info { background: #fef6f4; border-radius: 1.5rem; padding: 1rem 1.8rem; display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; margin-bottom: 1rem; gap: 0.8rem; }
.upgrade-tag { background: #ffd966; padding: 0.3rem 1rem; border-radius: 2rem; font-weight: bold; color: #b3412f; white-space: nowrap; }
.info-row { background: #fef6f4; border-radius: 1.5rem; padding: 0.8rem 1.8rem; margin-bottom: 1.5rem; display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; }
.explain-note { background: #fef2ef; margin-bottom: 1.5rem; padding: 0.8rem 1.2rem; border-radius: 1rem; font-size: 0.8rem; }

/* 表格 */
table { width: 100%; border-collapse: collapse; background: white; border-radius: 1.5rem; overflow: hidden; }
th, td { padding: 10px 8px; border-bottom: 1px solid #f1cdc6; text-align: center; }
th { background: #fae7e3; font-weight: 700; color: #b3412f; }
.custom-row td:first-child { font-weight: 700; }
.table-note { padding: 0.8rem 1rem; background: #fef8e7; font-size: 0.75rem; border-radius: 0 0 1.5rem 1.5rem; }

/* 警告 */
.warning { background: #ffefe5; border-left: 5px solid #e67e22; padding: 0.8rem 1.2rem; border-radius: 1rem; font-size: 0.85rem; color: #b85c00; margin: 1rem 0; }

/* 步骤 */
.steps { display: flex; flex-wrap: wrap; gap: 1rem; margin: 1.5rem 0 0.5rem; justify-content: space-between; }
.step { flex: 1; background: #fdf5f4; border-radius: 1.2rem; padding: 1rem; text-align: center; }
.step i { font-size: 1.6rem; color: #e25c4a; display: block; margin-bottom: 0.5rem; }
.step h4 { margin: 0.5rem 0; }

/* 脚注 */
.footnote { background: #fff4e5; border-radius: 1.2rem; padding: 1rem 1.8rem; font-size: 0.85rem; border: 1px solid #ffe0b5; margin-top: 1.5rem; }
.bottom-slogan { text-align: center; margin-top: 1rem; font-size: 0.7rem; color: #c5857a; }
.star-note { font-size: 0.7rem; color: #c5857a; }
.high-warning { background: #ffe3d6; border-left: 5px solid #d9534f; padding: 0.4rem 1rem; border-radius: 1rem; margin: 0.5rem 0; font-weight: bold; color: #b33; }

/* 页脚 */
.app-footer {
  text-align: center;
  margin-top: 2rem;
  padding: 1rem;
  font-size: 0.8rem;
  color: #c5857a;
  border-top: 1px solid #f1cdc6;
}
.app-footer a {
  color: #e25c4a;
  text-decoration: none;
  font-weight: 500;
}
.app-footer a:hover {
  text-decoration: underline;
}

@media (max-width: 700px) {
  .hero-title { font-size: 1.5rem; }
  .stat-card .stat-value { font-size: 1.5rem; }
  .control-panel { padding: 1.2rem; }
}
</style>
