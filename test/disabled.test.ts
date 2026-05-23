import "./jsdom-helper.ts"
import {strict as assert} from "node:assert"
import {describe, it} from "node:test"
import {formField} from "html-form-field"

describe("disabled", async () => {
    const {ELE} = await import("html-ele")

    // language=HTML
    const form = (ELE`
        <form>
            <ul>
                <li><input type="text" name="TX" value="tx1" disabled></li>
            </ul>

            <div>
                <label><input type="radio" name="RB" value="RB1" checked disabled>rb1</label>
            </div>
            <div>
                <label><input type="checkbox" name="CB" value="CB1" checked disabled>cb1</label>
            </div>

            <select name="SM1" multiple disabled>
                <option value="SM11" selected>sm11</option>
            </select>

            <select name="SM2" multiple>
                <option value="SM21" selected disabled>sm21</option>
            </select>

            <textarea name="TA" disabled>ta1</textarea>
        </form>
    `)

    it("text", () => {
        const field = formField({form, name: "TX"})

        assert.equal(field.name, "TX")
        assert.equal(field.value, undefined)

        field.items().at(0).disabled = false
        assert.equal(field.value, "tx1")
    })

    it("radio", () => {
        const field = formField({form, name: "RB"})

        assert.equal(field.name, "RB")
        assert.equal(field.value, undefined)
        assert.equal(field.has("RB1"), false)

        field.items().at(0).disabled = false
        assert.equal(field.value, "RB1")
        assert.equal(field.has("RB1"), true)
    })

    it("checkbox", () => {
        const field = formField({form, name: "CB"})

        assert.equal(field.name, "CB")
        assert.equal(field.value, undefined)
        assert.equal(field.has("CB1"), false)

        field.items().at(0).disabled = false
        assert.equal(field.value, "CB1")
        assert.equal(field.has("CB1"), true)
    })

    it("select", () => {
        const field = formField({form, name: "SM2"})

        assert.equal(field.name, "SM2")
        assert.equal(field.value, undefined)
        assert.equal(field.items().at(0).disabled, true)
        assert.equal(field.has("SM21"), false)

        field.items().at(0).disabled = false
        assert.equal(field.items().at(0).disabled, false)
        assert.equal(field.value, "SM21")
        assert.equal(field.has("SM21"), true)
    })

    it("textarea", () => {
        const field = formField({form, name: "TA"})

        assert.equal(field.name, "TA")
        assert.equal(field.value, undefined)

        field.items().at(0).disabled = false
        assert.equal(field.value, "ta1")
    })
})
