import "./jsdom-helper.ts"
import {strict as assert} from "node:assert"
import {describe, it} from "node:test"
import {formField} from "html-form-field"

describe("lazy-throw on missing", async () => {
    const {ELE} = await import("html-ele")
    // node:test runs under jsdom but does not expose the DOM constructors
    // on globalThis — only `document`. Pull `Event` from the window so
    // `new Event("change")` works the same as in the browser.
    const Event = document.defaultView.Event

    it("construction does not throw when zero controls match", () => {
        // language=HTML
        const form = (ELE`
            <form>
                <div class="radio-group"></div>
            </form>
        `)

        // The form has no input[name="favo"] yet — typical of a dynamic
        // group whose options are rendered from data after the field
        // handle is created.
        assert.doesNotThrow(() => formField({form, name: "favo"}))
    })

    it("items() throws Not found when no control was matched", () => {
        // language=HTML
        const form = (ELE`
            <form>
                <div class="radio-group"></div>
            </form>
        `)

        const field = formField({form, name: "favo"})
        assert.throws(() => field.items(), /Not found: name="favo"/)
    })

    it("closest() returns null when nothing matched (no anchor to walk from)", () => {
        // `closest()` walks up from `_fields[0]`; with zero matches the
        // optional chain returns null. Useful to remember when picking
        // between `field.closest(sel)` (ancestor of a matched control)
        // and `options.form.querySelector(sel)` (descendant of the
        // form root) — the latter is the right tool for finding a
        // dynamic group's wrapper before any control exists.
        // language=HTML
        const form = (ELE`
            <form>
                <div class="radio-group"></div>
            </form>
        `)

        const field = formField({form, name: "favo"})
        assert.equal(field.closest("div.radio-group"), null)
    })

    it("populate then reload(): items() works without further intervention", () => {
        // Typical dynamic-group flow: locate the wrapper via the form
        // root, append controls, reload. The field handle existed from
        // the start with no controls — that's exactly what the lazy
        // throw enables.
        // language=HTML
        const form = (ELE`
            <form>
                <div class="radio-group"></div>
            </form>
        `)

        const field = formField({form, name: "favo"})
        const wrapper = form.querySelector<HTMLDivElement>("div.radio-group")

        wrapper.append(ELE`<label><input type="radio" name="favo" value="tech">Tech</label>`)
        wrapper.append(ELE`<label><input type="radio" name="favo" value="travel">Travel</label>`)
        field.reload()

        assert.equal(field.items().length, 2)
        assert.deepEqual(field.items().map(v => v.value), ["tech", "travel"])
    })

    it("reload() back to zero controls: items() throws again", () => {
        // language=HTML
        const form = (ELE`
            <form>
                <div class="radio-group">
                    <input type="radio" name="favo" value="tech">
                </div>
            </form>
        `)

        const field = formField({form, name: "favo"})
        assert.equal(field.items().length, 1, "sanity: matched once")

        const wrapper = field.closest<HTMLDivElement>("div.radio-group")
        wrapper.replaceChildren()
        field.reload()

        assert.throws(() => field.items(), /Not found: name="favo"/)
    })

    it("reload() detaches the change listener from controls that dropped out", () => {
        // Regression for a pre-existing leak that lazy-throw made
        // easier to hit: when `reload()` transitions from N controls
        // to M < N (including M = 0), the (N − M) elements that no
        // longer match the selector must stop firing this field's
        // change handler. Previously `updateEventListener` only
        // re-bound the new list and left the old listeners attached.
        // language=HTML
        const form = (ELE`
            <form>
                <div class="radio-group">
                    <label><input type="radio" name="favo" value="tech">Tech</label>
                    <label><input type="radio" name="favo" value="travel">Travel</label>
                </div>
            </form>
        `)

        let fired = 0
        const field = formField({form, name: "favo", onChange: () => fired++})
        const travel = form.querySelector<HTMLInputElement>('input[value="travel"]')

        // Sanity: the original binding fires.
        travel.dispatchEvent(new Event("change"))
        assert.equal(fired, 1)

        // Drop the second radio and reload — the field is now down to one
        // control, and the orphaned `<input>` should no longer trip the
        // handler even though its JS reference is still around.
        travel.remove()
        field.reload()

        travel.dispatchEvent(new Event("change"))
        assert.equal(fired, 1, "orphaned control must not fire onChange")
    })

    it("Invalid name (falsy) still throws at construction", () => {
        // The `name` falsy guard is a programming-error check, not a
        // missing-control case — it stays eager so typos surface
        // immediately rather than at first `items()` access.
        // language=HTML
        const form = (ELE`<form></form>`)
        assert.throws(() => formField({form, name: "" as never}), /Invalid name=""/)
    })
})
