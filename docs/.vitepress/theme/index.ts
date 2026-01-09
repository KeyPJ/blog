// https://vitepress.dev/guide/custom-theme
import {h, provide} from 'vue'
import type { Theme } from 'vitepress'
// import DefaultTheme from 'vitepress/theme'
// import './style.css'
import Teek from "vitepress-theme-teek";
import "vitepress-theme-teek/index.css";
import { TkCommentWaline, teekConfigContext } from "vitepress-theme-teek";
import "vitepress-theme-teek/theme-chalk/tk-comment-waline.css";
import {CommentConfig} from "vitepress-theme-teek/es/config/interface";


export default {
  extends: Teek,
  Layout: () =>
      h(Teek.Layout, null, {
        "doc-after": () => h(TkCommentWaline),
      }),
} satisfies Theme
