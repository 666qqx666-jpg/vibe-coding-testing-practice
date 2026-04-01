import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// GitHub Pages：project site 用 `/仓库名/`；用户站 `username.github.io` 仓库则改为 `/`
// 勿用 NODE_ENV 判断：vite build 时 shell 里常常没设 NODE_ENV，base 会错
// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/vibe-coding-testing-practice/' : '/',
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default', 'html'],
    outputFile: {
      html: './html-report/index.html',
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      reportsDirectory: './coverage',
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.test.{ts,tsx}', 'src/test/**', 'src/mocks/**', 'src/main.tsx', 'src/vite-env.d.ts'],
    },
  },
}))
