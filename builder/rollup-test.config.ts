import alias from "@rollup/plugin-alias"
import commonjs from "@rollup/plugin-commonjs"
import multiEntry from "@rollup/plugin-multi-entry"
import nodeResolve from "@rollup/plugin-node-resolve"
import sucrase from "@rollup/plugin-sucrase"
import type {RollupOptions} from "rollup"
import {fileURLToPath} from "node:url"
import {showFiles} from "./show-files.ts"

const rollupConfig: RollupOptions = {
    input: "../test/*.test.ts",

    output: {
        file: "../browser/tests/bundled.js",
        format: "iife",
        // `test/jsdom-helper.ts` uses a dynamic `import("jsdom")` so
        // jsdom only loads on Node. Rollup would normally turn that
        // into a separate chunk, which IIFE output cannot represent;
        // force everything into a single bundle so the alias to
        // `jsdom.shim.ts` lands inline alongside the rest. The same
        // applies to `await import("html-ele")` calls inside tests.
        inlineDynamicImports: true,
    },

    treeshake: false,

    plugins: [
        // Browser-side replacements: each entry's import resolves to
        // the real module under `node --test` and to the local file
        // listed below in the rollup test bundle.
        alias({
            entries: [
                {find: "node:test", replacement: fileURLToPath(new URL("./node-test.shim.ts", import.meta.url))},
                {find: "node:assert", replacement: fileURLToPath(new URL("./node-assert.shim.ts", import.meta.url))},
                {find: "html-form-field", replacement: fileURLToPath(new URL("../browser/import.js", import.meta.url))},
                {find: "html-ele", replacement: fileURLToPath(new URL("./html-ele.shim.ts", import.meta.url))},
                {find: "jsdom", replacement: fileURLToPath(new URL("./jsdom.shim.ts", import.meta.url))},
            ],
        }),

        multiEntry(),

        nodeResolve({
            browser: true,
            preferBuiltins: false,
        }),

        // Required so rollup can interpret `browser/import.js`'s
        // `exports.formField = formField` syntax (the file is CJS so
        // it can also serve browserify users — see
        // browser/package.json).
        commonjs(),

        sucrase({
            exclude: ["node_modules/**"],
            transforms: ["typescript"],
        }),

        showFiles(),
    ],
}

export default rollupConfig
