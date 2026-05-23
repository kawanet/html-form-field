// Browser-side shim for `html-ele`. Aliased into the test bundle by
// the rollup test config so `await import("html-ele")` inside test
// sources resolves to this file. The values are read from the
// global `ele` namespace set by html-ele's own iife bundle, which
// browser/tests.html loads via a separate <script> tag before the
// test bundle runs. Outside the browser test bundle, the real
// `html-ele` package is used as a normal devDependency.

declare const ele: {
    ele: unknown
    ELE: unknown
    HTML: unknown
    EN: unknown
}

// `eleFn` is renamed on export so the local binding does not shadow
// the global `ele` namespace constant declared above.
const eleFn = ele.ele
export const ELE = ele.ELE
export const HTML = ele.HTML
export const EN = ele.EN
export {eleFn as ele}
