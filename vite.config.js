import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const pkg = require("./package.json");

const htmlVersion = () => ({
	name: "html-version",
	transformIndexHtml: {
		order: "pre",
		handler(html) {
			return html.replace(
				"</head>",
				`\t<meta name="version" content="${pkg.version}">\n</head>`
			);
		},
	},
});

const removeHtmlComments = () => ({
	name: "remove-html-comments",
	apply: "build",
	transformIndexHtml: {
		order: "post",
		handler(html) {
			return html.replace(/<!--[\s\S]*?-->/g, "");
		},
	},
});

export default defineConfig({
	server: {
		port: 5173,
		strictPort: true,
		open: true,
	},
	plugins: [tailwindcss(), htmlVersion(), removeHtmlComments()],
	define: {
		__APP_VERSION__: JSON.stringify(pkg.version),
	},
	esbuild: {
		legalComments: "none",
	},
	build: {
		minify: "esbuild",
		cssMinify: "esbuild",
		sourcemap: false,
	},
});
