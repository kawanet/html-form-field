import "./jsdom-helper.ts"
import {strict as assert} from "node:assert"
import {describe, it} from "node:test"
import {formField} from "html-form-field"

describe("defaults", async () => {
    const {ELE} = await import("html-ele")

    // language=HTML
    const form = (ELE`
        <form>
            <ul>
                <li><input type="text" name="TX" value="tx1"></li>
            </ul>

            <div>
                <label><input type="radio" name="RB" value="RB1">rb1</label>
                <label><input type="radio" name="RB" value="RB2" checked>rb2</label>
                <label><input type="radio" name="RB" value="RB3">rb3</label>
            </div>

            <div>
                <label><input type="checkbox" name="CB" value="CB1" checked>cb1</label>
                <label><input type="checkbox" name="CB" value="CB2">cb2</label>
                <label><input type="checkbox" name="CB" value="CB3" checked>cb3</label>
            </div>

            <select name="SS">
                <option value="SS1">ss1</option>
                <option value="SS2" selected>ss2</option>
                <option value="SS3">ss3</option>
            </select>

            <select name="SM" multiple>
                <option value="SM1" selected>sm1</option>
                <option value="SM2">sm2</option>
                <option value="SM3" selected>sm3</option>
            </select>

            <textarea name="TA">ta1</textarea>
        </form>
    `)

    it("text", () => {
        const field = formField({form, name: "TX", defaults: ["tx2"]})
        assert.equal(field.value, "tx2")
    })

    it("radio", () => {
        const field = formField({form, name: "RB", defaults: ["RB4", "RB3"]})
        assert.equal(field.value, "RB3")
    })

    it("checkbox", () => {
        const field = formField({form, name: "CB", defaults: ["CB4", "CB1,CB2"]})
        assert.equal(field.value, "CB1,CB2")
    })

    it("select-one", () => {
        const field = formField({form, name: "SS", defaults: ["SS4", "SS3"]})
        assert.equal(field.value, "SS3")
    })

    it("select-multiple", () => {
        const field = formField({form, name: "SM", defaults: ["SM4", "SM1,SM2"]})
        assert.equal(field.value, "SM1,SM2")
    })

    it("textarea", () => {
        const field = formField({form, name: "TA", defaults: ["ta2"]})
        assert.equal(field.value, "ta2")
    })

    it("text null", () => {
        const field = formField({form, name: "TX", defaults: [null, undefined, "tx3"]})
        assert.equal(field.value, "tx3")
    })

    it("textarea null", () => {
        const field = formField({form, name: "TX", defaults: [null, undefined, "ta3"]})
        assert.equal(field.value, "ta3")
    })
})
