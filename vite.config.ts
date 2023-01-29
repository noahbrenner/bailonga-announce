import autoprefixer from "autoprefixer"
import { compile as compileEjs } from "ejs";
import postcssNesting from "postcss-nesting";
import { createFilter, defineConfig, PluginOption } from "vite";

function ejsTransformer({ debug }: { debug: boolean }): PluginOption {
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

export default defineConfig(async ({ mode }) => {
    const { default: pugTransformer } =
        await import("vite-plugin-pug-transformer");

    return {
        clearScreen: false,
        plugins: [
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
