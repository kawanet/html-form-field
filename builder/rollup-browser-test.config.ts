import alias from "@rollup/plugin-alias"
import multiEntry from "@rollup/plugin-multi-entry"
import nodeResolve from "@rollup/plugin-node-resolve"
import sucrase from "@rollup/plugin-sucrase"
import type {RollupOptions} from "rollup"
import {showFiles} from "./show-files.ts"

// Bundles the test suites for browser/tests.html: Node builtins become
// shims, and the package name resolves to the global left behind by
// dist/*.min.js, so the browser exercises the shipped bundle.
const rollupConfig: RollupOptions = {
    // 90.entrypoint tests require() the shipped files; Node-only, no browser
    // shim, so the negative pattern keeps them out of the browser bundle.
    input: ["../test/*.test.ts", "!../test/90.*"],

    // Bare specifiers stay external; only relative paths are bundled.
    external: /^[^.\/]+$/,

    output: {
        file: "../browser/tests/bundled.mjs",
        format: "esm",
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
        alias({
            entries: [
                {find: /^(\.\.\/)+src\/index\.ts$/, replacement: "html-form-field"},
            ],
        }),

        multiEntry(),

        nodeResolve({
            browser: true,
            preferBuiltins: false,
        }),

        sucrase({
            disableESTransforms: true,
            exclude: ["node_modules/**"],
            transforms: ["typescript"],
        }),

        showFiles(),
    ],
}

export default rollupConfig
