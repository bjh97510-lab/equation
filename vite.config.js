import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

/**
 * 빌드 결과는 dist/index.html 한 파일에 JS·CSS·KaTeX 폰트가 모두 포함됩니다.
 *  - 웹서버 없이 파일을 더블클릭해 열어도(file://) 동작합니다.
 *  - 물론 GitHub Pages, Netlify, 학교 서버 등에 올려도 그대로 동작합니다.
 */
export default defineConfig({
  plugins: [react(), viteSingleFile({ removeViteModuleLoader: true })],
  base: './',
  build: {
    chunkSizeWarningLimit: 2000,
    assetsInlineLimit: 100 * 1024 * 1024, // 폰트까지 모두 인라인
    cssCodeSplit: false,
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.{js,jsx}'],
    css: false,
    // UI(jsdom) 테스트가 다른 파일의 부하로 시간 초과되지 않도록 파일 단위로 순차 실행
    fileParallelism: false,
    testTimeout: 20000,
    // 테스트는 항상 Mock 모드 (.env 의 실제 시트 URL 을 무시)
    env: { VITE_GOOGLE_SCRIPT_URL: '' },
  },
});
