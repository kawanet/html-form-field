import "./jsdom-helper.ts"
import {strict as assert} from "node:assert"
import {describe, it} from "node:test"
import {formField} from "html-form-field"

describe("null", async () => {
    const {ELE} = await import("html-ele")

    // language=HTML
    const form = (ELE`
        <form>
            <ul>
                <li><input type="text" name="TX" value="tx1"></li>
            </ul>

            <div>
                <label><input type="radio" name="RB" value="RB1" checked>rb1</label>
            </div>

            <div>
                <label><input type="checkbox" name="CB" value="CB1" checked>cb1</label>
            </div>

            <select name="SM" multiple>
                <option value="SM1" selected>sm1</option>
            </select>
        </form>
    `)

    it("text", () => {
        const field = formField({form, name: "TX"})
        const $input = form.querySelector<HTMLInputElement>(`input[name="TX"]`)
        assert.equal(field.value, "tx1")

        field.value = null
        assert.equal($input.value, "", "#1")
        assert.equal(field.value, "", "#2")

        field.value = undefined
        assert.equal($input.value, "", "#3")
        assert.equal(field.value, "", "#4")

        field.value = ""
        assert.equal($input.value, "", "#5")
        assert.equal(field.value, "", "#6")
    })

    it("radio", () => {
        const field = formField({form, name: "RB"})
        const $input = form.querySelector<HTMLInputElement>(`input[name="RB"]`)
        assert.equal(field.value, "RB1")

        field.value = null
        assert.equal($input.value, "RB1", "#1")
        assert.equal(field.value, undefined, "#2")

        field.value = undefined
        assert.equal(field.value, undefined, "#3")

        field.value = ""
        assert.equal(field.value, undefined, "#4")

        field.value = "INVALID"
        assert.equal(field.value, undefined, "#5")
    })

    it("checkbox", () => {
        const field = formField({form, name: "CB"})
        const $input = form.querySelector<HTMLInputElement>(`input[name="CB"]`)
        assert.equal(field.value, "CB1")

        field.value = null
        assert.equal($input.value, "CB1", "#1")
        assert.equal(field.value, undefined, "#2")

        field.value = undefined
        assert.equal(field.value, undefined, "#3")

        field.value = ""
        assert.equal(field.value, undefined, "#4")

        field.value = "INVALID"
        assert.equal(field.value, undefined, "#5")
    })

    it("select-multiple", () => {
        const field = formField({form, name: "SM"})
        assert.equal(field.value, "SM1")

        field.value = null
        assert.equal(field.value, undefined, "#1")

        field.value = undefined
        assert.equal(field.value, undefined, "#2")

        field.value = ""
        assert.equal(field.value, undefined, "#3")

        field.value = "INVALID"
        assert.equal(field.value, undefined, "#4")
    })
})
