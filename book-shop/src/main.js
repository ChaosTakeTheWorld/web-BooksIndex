// 第 6 次课：Vite 入口。
// 只干一件事——创建 Vue 应用，把 App.vue 装进 index.html 的 #app。
// 样式统一在 App.vue 里 import "./style.css"，这里不重复引入。
import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')
