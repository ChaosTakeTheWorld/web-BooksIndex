import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: '127.0.0.1', // 强制绑定 IPv4，解决 localhost 连不上
    port: 5173,        // 端口号，被占用会自动换
    strictPort: false, // 端口被占用时不报错，自动换下一个
    open: true,        // 启动后自动打开浏览器
  },
})