// Browser-side shim for `jsdom`. Aliased into the test bundle by
// the rollup test config so `import("jsdom")` inside
// `test/jsdom-helper.ts` resolves to this file instead of the real
// jsdom package — which is Node-only and would explode the bundle
// with a transitive dep tree of Node builtins.
//
// At runtime in the browser, `test/jsdom-helper.ts` gates every use
// of jsdom on `typeof document === "undefined"`. The browser already
// has a real `document`, so the gate is false and these stubs are
// never actually called — they exist purely to satisfy rollup's
// static module graph.

export class JSDOM {
    get window(): {document: undefined} {
        // Unreachable in practice (see header). Throw rather than
        // return a fake object so any future code path that
        // accidentally reaches this in the browser fails loudly
        // instead of silently using a bogus document.
        throw new Error("jsdom is not available in the browser test bundle");
    }
}
