import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env so we can use VITE_SN_INSTANCE in the proxy target
  const env = loadEnv(mode, process.cwd(), '');
  const snInstance = env.VITE_SN_INSTANCE || 'https://yourinstance.service-now.com';

  return {
    plugins: [react()],
    server: {
      proxy: {
        // OAuth token exchange — mirrors api/servicenow-oauth.js
        // In dev the browser sends client_id + client_secret directly
        // (they are VITE_ prefixed in .env.local for this purpose only)
        '/servicenow-oauth': {
          target: snInstance,
          changeOrigin: true,
          rewrite: () => '/oauth_token.do',
        },
        // All REST API calls — mirrors api/servicenow-api.js
        // Strips the /servicenow-api prefix before forwarding
        '/servicenow-api': {
          target: snInstance,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/servicenow-api/, ''),
        },
      },
    },
  };
});
