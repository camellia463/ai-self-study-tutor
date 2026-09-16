import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // 代理目标支持环境变量覆盖（默认 3001），便于多副本并行验证
    proxy: {
      '/api': process.env.VITE_PROXY_TARGET || 'http://localhost:3001'
    }
  }
})
