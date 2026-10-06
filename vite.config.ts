import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  // In development the API is reached through this proxy so the refresh-token cookie stays same-origin.
  const apiTarget = env.VITE_DEV_API_PROXY ?? 'http://localhost:5273'

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },
    server: {
      // PORT lets tooling pick a free port; 5173 otherwise.
      port: Number(env.PORT) || 5173,
      proxy: {
        '/api': { target: apiTarget, changeOrigin: true },
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) return undefined
            if (id.includes('recharts') || id.includes('d3-')) return 'charts'
            if (id.includes('motion')) return 'motion'
            if (id.includes('react-router') || id.includes('react-dom') || id.includes('/react/')) return 'react'
            if (id.includes('@tanstack') || id.includes('redux') || id.includes('axios')) return 'data'
            return undefined
          },
        },
      },
    },
  }
})
