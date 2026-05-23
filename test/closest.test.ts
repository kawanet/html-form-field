import "./jsdom-helper.ts"
import {strict as assert} from "node:assert"
import {describe, it} from "node:test"
import {formField} from "html-form-field"

describe("closest", async () => {
    const {ELE} = await import("html-ele")

    it("select: returns the <select> itself (closest is inclusive)", () => {
        // language=HTML
        const form = (ELE`
            <form>
                <div class="wrap">
                    <select name="city">
                        <option value="tokyo">Tokyo</option>
                        <option value="osaka">Osaka</option>
                    </select>
                </div>
            </form>
        `)

        const field = formField({form, name: "city"})
        const select = field.closest<HTMLSelectElement>("select")
        assert.ok(select)
        assert.equal(select.tagName, "SELECT")
        assert.equal(select.name, "city")
        assert.equal(select.options.length, 2)
    })

    it("empty <select>: still resolvable so callers can populate it", () => {
        // The scenario the API is designed for — there are no <option>
        // children, so the previous workaround
        // (`field.items().at(0)?.node.closest("select")`) cannot find
        // a starting node. `field.closest()` walks from the <select>
        // itself and works regardless.
        // language=HTML
        const form = (ELE`
            <form>
                <select name="lazy"></select>
            </form>
        `)

        const field = formField({form, name: "lazy"})
        assert.equal(field.items().length, 0, "sanity: no items in an empty select")

        const select = field.closest<HTMLSelectElement>("select")
        assert.ok(select)
        assert.equal(select.tagName, "SELECT")

        // Populate the select after the fact and ensure reload() picks
        // up the new options.
        select.append(ELE`<option value="tokyo">Tokyo</option>`)
        select.append(ELE`<option value="osaka">Osaka</option>`)

        field.reload()
        assert.equal(field.items().length, 2)
        assert.deepEqual(field.items().map(v => v.value), ["tokyo", "osaka"])
    })

    it("text input: closest('input') returns the input itself", () => {
        // language=HTML
        const form = (ELE`
            <form>
                <input type="text" name="nickname" value="Alice">
            </form>
        `)

        const field = formField({form, name: "nickname"})
        const input = field.closest<HTMLInputElement>("input")
        assert.ok(input)
        assert.equal(input.tagName, "INPUT")
        assert.equal(input.name, "nickname")
    })

    it("text input: closest('form') walks up to the <form>", () => {
        // language=HTML
        const form = (ELE`
            <form>
                <input type="text" name="nickname" value="Alice">
            </form>
        `)

        const field = formField({form, name: "nickname"})
        const f = field.closest<HTMLFormElement>("form")
        assert.equal(f, form)
        assert.equal(f.tagName, "FORM")
    })

    it("radio group: closest('div') returns the wrapping container", () => {
        // language=HTML
        const form = (ELE`
            <form>
                <div class="group">
                    <label><input type="radio" name="favo" value="tech">Tech</label>
                    <label><input type="radio" name="favo" value="travel">Travel</label>
                </div>
            </form>
        `)

        const field = formField({form, name: "favo"})
        const div = field.closest<HTMLDivElement>("div.group")
        assert.ok(div)
        assert.equal(div.tagName, "DIV")
        assert.equal(div.className, "group")
        assert.equal(div.querySelectorAll('input[name="favo"]').length, 2)
    })

    it("no match: returns null, matching Element.closest()", () => {
        // language=HTML
        const form = (ELE`
            <form>
                <input type="text" name="nickname" value="Alice">
            </form>
        `)

        const field = formField({form, name: "nickname"})
        assert.equal(field.closest("fieldset"), null)
    })

    it("survives reload() — _fields is refreshed", () => {
        // language=HTML
        const form = (ELE`
            <form>
                <select name="city"></select>
            </form>
        `)

        const field = formField({form, name: "city"})
        const before = field.closest<HTMLSelectElement>("select")
        assert.ok(before)

        // Add an option and reload. The closest() lookup must still
        // resolve to the same <select> after the internal field cache
        // is rebuilt.
        before.append(ELE`<option value="tokyo">Tokyo</option>`)
        field.reload()

        const after = field.closest<HTMLSelectElement>("select")
        assert.equal(after, before, "closest() returns the same <select> after reload()")
        assert.equal(field.items().length, 1)
    })
})
