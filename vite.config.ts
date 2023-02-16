import autoprefixer from "autoprefixer"
import { compile as compileEjs } from "ejs";
import { minify } from "html-minifier-terser";
import postcssNesting from "postcss-nesting";
import { createFilter, defineConfig, Plugin } from "vite";

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
        }
    };
}

export default defineConfig(async ({ mode }) => {
    const { default: pugTransformer } =
        await import("vite-plugin-pug-transformer");

    return {
        clearScreen: false,
        base: "./",
        plugins: [
            indexHtmlMinifier(),
            pugTransformer({}),
            ejsTransformer({ debug: mode !== "production" }),
        ],
        css: {
            postcss: {
                plugins: [postcssNesting, autoprefixer()],
            },
        },
    };
});
