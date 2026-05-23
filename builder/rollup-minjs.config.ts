import nodeResolve from "@rollup/plugin-node-resolve"
import sucrase from "@rollup/plugin-sucrase"
import terser from "@rollup/plugin-terser"
import type {RollupOptions} from "rollup"
import {showFiles} from "./show-files.ts"

const rollupConfig: RollupOptions = {
    input: "../src/index.ts",

    output: {
        file: "../dist/html-form-field.min.js",
        format: "iife",
        name: "formField",
        exports: "named",
        // The IIFE's auto-`return exports;` would yield
        // `var formField = {formField: <fn>}` (a namespace global).
        // Override with an early `return exports.formField;` so the
        // global is `var formField = <fn>` (callable directly).
        // The leading `module.exports = exports` makes the same bundle
        // usable as a CJS module (`require(...).formField` is the
        // function), matching the named-export shape published by
        // `dist/html-form-field.cjs`. Rollup's auto-return becomes
        // unreachable and terser drops it.
        outro: "if (typeof module !== 'undefined') { module.exports = exports }\nreturn exports.formField;",
    },

    plugins: [
        nodeResolve({
            browser: true,
            preferBuiltins: false,
        }),

        sucrase({
            exclude: ["node_modules/**"],
            transforms: ["typescript"],
        }),

        showFiles(),

        terser({
            compress: true,
            ecma: 2020,
            mangle: true,
        }),
    ],
}

export default rollupConfig
