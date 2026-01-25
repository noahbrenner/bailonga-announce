import { compile as compileEjs } from "ejs";
import { minify } from "html-minifier-terser";
import { createFilter, defineConfig, type Plugin } from "vite";
import pugTransformer from "vite-plugin-pug-transformer";

function ejsTransformer({ debug }: { debug: boolean }): Plugin {
  return {
    name: "ejs-transformer",
    transform(src, id) {
      const filter = createFilter("**/*.ejs");
      if (filter(id)) {
        const templateFunction = compileEjs(src, {
          client: true, // Generate a standalone function
          _with: false, // Do not use the `with` JavaScript keyword
          compileDebug: debug, // Generate debug code?
        });
        return {
          code: `export default ${templateFunction.toString()};`,
          map: null,
        };
      }
      return undefined;
    },
  };
}

function indexHtmlMinifier(): Plugin {
  return {
    name: "html-minifier",
    transformIndexHtml(html) {
      return minify(html, {
        removeComments: true,
        collapseWhitespace: true,
        collapseBooleanAttributes: true,
      });
    },
  };
}

export default defineConfig(({ mode }) => ({
  clearScreen: false,
  base: "./",
  plugins: [
    indexHtmlMinifier(),
    pugTransformer({}),
    ejsTransformer({ debug: mode !== "production" }),
  ],
  css: {
    transformer: "lightningcss",
  },
  build: {
    cssMinify: "lightningcss",
  },
}));
