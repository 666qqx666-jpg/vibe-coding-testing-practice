import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

/** GitHub Pages：项目站 `/<repo>/`；`<user>.github.io` 用户站根域名用 `/` */
function githubPagesBase(): string {
  const full = process.env.GITHUB_REPOSITORY // "owner/repo"，仅 CI 里有
  if (!full) return '/vibe-coding-testing-practice/'
  const name = full.split('/')[1] ?? ''
  if (name.endsWith('.github.io')) return '/'
  return `/${name}/`
}

// 勿用 NODE_ENV 判断：vite build 时 shell 里常常没设 NODE_ENV
// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  base: command === 'build' ? githubPagesBase() : '/',
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
