import { defineConfig, createLogger } from 'vite'
import react from '@vitejs/plugin-react'

const customLogger = createLogger()
const originalError = customLogger.error

customLogger.error = (msg, options) => {
  // Ignore harmless connection abort/reset errors from WebSocket and HTTP proxies
  if (
    typeof msg === 'string' &&
    (msg.includes('ECONNABORTED') ||
      msg.includes('ECONNRESET') ||
      msg.includes('EPIPE') ||
      msg.includes('ETIMEDOUT'))
  ) {
    return
  }
  originalError(msg, options)
}

export default defineConfig({
  customLogger,
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/api': {
        target: 'https://api-tms.altensor.com',
        changeOrigin: true,
        secure: false,
      },
      '/hubs': {
        target: 'https://api-tms.altensor.com',
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})

