import { defineConfig } from 'vitest/config';

// Only the pure modules under src/lib and src/data are tested. Astro components
// are verified in a browser, not here: standing up an Astro container renderer
// to assert on markup would test the framework more than the charts.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
