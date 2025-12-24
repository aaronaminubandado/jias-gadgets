import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";


// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 5137,
    proxy: {
      "/api": {
        target: (import.meta as unknown as { env: { VITE_API_URL?: string } }).env.VITE_API_URL,
				changeOrigin: true,
			},
		},
	},
	plugins: [react()].filter(Boolean),
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	}
}));
