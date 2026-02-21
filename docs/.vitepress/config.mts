import { defineConfig } from 'vitepress'

import { defineTeekConfig } from "vitepress-theme-teek/config";

// Teek 主题配置
const teekConfig = defineTeekConfig({
  vpHome:false,
  toComment: {
    enabled: true, // 是否启动滚动到评论区功能
    done: TkMessage => TkMessage.success("已抵达评论区"), // 滚动到评论区后的回调
  },
  author: {
    name: "云林夕", // 作者名称
    link: "/me.html", // 点击作者名称后跳转的链接
  },
  banner: {
    enabled: true, // 是否启用 Banner
    name: "云林夕", // Banner 标题，默认读取 vitepress 的 title 属性
    bgStyle: "fullImg", // Banner 背景风格：pure 为纯色背景，partImg 为局部图片背景，fullImg 为全屏图片背景
    pureBgColor: "#28282d", // Banner 背景色，bgStyle 为 pure 时生效
    imgSrc: ["https://blogimg.52v6.com/2026/01/c4142ff664d7e6a0448f0309bf0255bd.jpg"], // Banner 图片链接。bgStyle 为 partImg 或 fullImg 时生效
    imgInterval: 15000, // 当多张图片时（imgSrc 为数组），设置切换时间，单位：毫秒
    imgShuffle: false, // 图片是否随机切换，为 false 时按顺序切换，bgStyle 为 partImg 或 fullImg 时生效
    imgWaves: false, // 是否开启 Banner 图片波浪纹，bgStyle 为 fullImg 时生效
    mask: true, // Banner 图片遮罩，bgStyle 为 partImg 或 fullImg 时生效
    maskBg: "rgba(0, 0, 0, 0.4)", // Banner 遮罩颜色，如果为数字，则是 rgba(0, 0, 0, ${maskBg})，如果为字符串，则作为背景色。bgStyle 为 partImg 或 fullImg 且 mask 为 true 时生效
    textColor: "#ffffff", // Banner 字体颜色，bgStyle 为 pure 时为 '#000000'，其他为 '#ffffff'
    titleFontSize: "3.2rem", // 标题字体大小
    descFontSize: "1.4rem", // 描述字体大小
    descStyle: "types", // 描述信息风格：default 为纯文字渲染风格（如果 description 为数组，则取第一个），types 为文字打印风格，switch 为文字切换风格
    description: ["关爱父母,关注父母养老","云梦拆字即为云林夕","分享点儿个人经验"], // 描述信息
    switchTime: 4000, // 描述信息切换间隔时间，单位：毫秒。descStyle 为 switch 时生效
    switchShuffle: false, // 描述信息是否随机切换，为 false 时按顺序切换。descStyle 为 switch 时生效
    typesInTime: 200, // 输出一个文字的时间，单位：毫秒。descStyle 为 types 时生效
    typesOutTime: 100, // 删除一个文字的时间，单位：毫秒。descStyle 为 types 时生效
    typesNextTime: 800, // 打字与删字的间隔时间，单位：毫秒。descStyle 为 types 时生效
    typesShuffle: false, // 描述信息是否随机打字，为 false 时按顺序打字，descStyle 为 types 时生效
  },
  social: [
    {
      icon: "mdi:github",
      name: "GitHub",
      link: "https://github.com/KeyPJ",
    },
    {
      icon: "https://blogimg.52v6.com/2026/01/5281e972ec463897022f56464011b5ed.jpg",
      name: "微信公众号",
      link: "https://mp.weixin.qq.com/s/vb-2yy7rBtOeleP1q_DX6Q",
    },
    {
      icon: "mdi:post",
      name: "Blog",
      link: "https://keypj.52v6.com",
    },
    {
      icon: "https://blogimg.52v6.com/2026/01/e9b082eb8752047022941c05f301e49d.jpg",
      name: "小红书",
      link: "https://www.xiaohongshu.com/user/profile/64020807000000002a00adf9",
    },
    {
      icon: "mdi:email-edit",
      name: "邮箱",
      link: "mailto:keypj@52v6.com",
    }
  ],
  footerInfo: {
    // 页脚信息，支持 HTML 格式（位于主题版权上方）
    topMessage: ["云林夕"],
    // 页脚信息，支持 HTML 格式（位于主题版权下方）
    // bottomMessage: ["上面的内容和图标都可以修改（本条内容也可以隐藏的）"],
    // 主题版权配置
    theme: {
      show: true, // 是否显示主题版权，建议显示
      name: "CC BY-NC-SA 4.0", // 自定义名称
      link: "", // 自定义链接
    },
    // 博客版权配置
    copyright: {
      show: true, // 是否显示博客版权
      createYear: 2024, // 创建年份
      suffix: "云林夕 Blog", // 后缀
    },
    // ICP 备案信息配置
    // icpRecord: {
    //   name: "",
    //   link: "",
    // },
    // // 网络安全备案信息配置
    // securityRecord: {
    //   name: "",
    //   link: "",
    // },
  },
  themeEnhance: {
    layoutSwitch: {
      defaultMode: "bothWidthAdjustable",
    },
    themeColor: {
      defaultColorName: "ep-blue",
    },
  },
  comment: {
    provider: "waline",
    options: {
      serverURL: "https://waline.keypj.52v6.com/",
      jsLink: "https://unpkg.com/@waline/client@v3/dist/waline.js",
      cssLink: "https://unpkg.com/@waline/client@v3/dist/waline.css",
    }
  },
  docAnalysis: {
    enabled: true, // 是否启用站点信息卡片
    createTime: "2026-01-01", // 站点创建时间
    wordCount: true, // 是否开启文章页的字数统计
    readingTime: true, // 是否开启文章页的阅读时长统计
  },
  articleAnalyze:{
    showCategory: true, // 是否展示分类
    showTag: true, // 是否展示标签
  },
  page: {
    disabled: false, // 是否禁用
    pageSize: 10, // 每页显示条目数
    pagerCount: 7, // 设置最大页码按钮数。 页码按钮的数量，当总页数超过该值时会折叠
    layout: "prev, pager, next, jumper, ->, total", // 组件布局，子组件名用逗号分隔
    size: "default", // 分页大小
    background: false, // 是否为分页按钮添加背景色
    hideOnSinglePage: false, // 只有一页时是否隐藏
    // ...
  },
  articleShare: {
    enabled: true, // 是否开启文章链接分享功能
    text: "分享此页面", // 分享按钮文本
    copiedText: "链接已复制", // 复制成功文本
    query: false, // 是否包含查询参数
    hash: false, // 是否包含哈希值
  },
  articleUpdate: {
    enabled: true, // 是否启用文章最近更新栏
    limit: 3, // 文章最近更新栏显示数量
  },
  articleBanner: {
    enabled: true, // 是否启用单文章页 Banner
    showCategory: true, // 是否展示分类
    showTag: true, // 是否展示标签
    defaultCoverImg: "", // 默认封面图
    defaultCoverBgColor: "", // 默认封面背景色，优先级低于 defaultCoverImg
  },

});



// https://vitepress.dev/reference/site-config
export default defineConfig({
  extends: teekConfig,
  title: "云林夕",
  description: "分享点儿个人经验",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: '主页', link: '/' },
      { text: '归档', link: '/archives' },
      { text: '关爱父母,关注城乡养老', link: '/pages/series-index.html' },
    ],

    // sidebar: [
    //   {
    //     text: 'Examples',
    //     items: [
    //       { text: 'Markdown Examples', link: '/markdown-examples' },
    //       { text: 'Runtime API Examples', link: '/api-examples' }
    //     ]
    //   }
    // ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/KeyPJ' },
    ],
  }
})
