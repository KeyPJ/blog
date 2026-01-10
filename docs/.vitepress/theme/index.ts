// https://vitepress.dev/guide/custom-theme
import {h, provide} from 'vue'
import type {Theme} from 'vitepress'
// import DefaultTheme from 'vitepress/theme'
// import './style.css'
import Teek from "vitepress-theme-teek";
import "vitepress-theme-teek/index.css";
import {TkCommentWaline, teekConfigContext} from "vitepress-theme-teek";
import "vitepress-theme-teek/theme-chalk/tk-comment-waline.css";
import {TkTransitionCollapse} from "vitepress-theme-teek";

export default {
    extends: Teek,
    enhanceApp({app}) {
        // 全局注册折叠过渡组件
        app.component('TransitionCollapse', TkTransitionCollapse)
    },
    Layout: () =>
        h(Teek.Layout, null, {
            "doc-after": () => h('div', {id: 'tk-comment'}, [
                h(TkCommentWaline) // 评论组件作为子元素
            ]),
        }),
} satisfies Theme
