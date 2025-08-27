import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Code splitting for better performance
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-accordion', '@radix-ui/react-checkbox', '@radix-ui/react-dialog'],
          icons: ['lucide-react'],
        },
      },
    },
    // Asset optimization
    assetsInlineLimit: 4096, // Inline assets smaller than 4KB
    cssCodeSplit: true,
    sourcemap: mode === 'development',
    minify: mode === 'production' ? 'esbuild' : false,
  },
}));
