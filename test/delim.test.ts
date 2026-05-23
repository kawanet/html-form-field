import "./jsdom-helper.ts"
import {strict as assert} from "node:assert"
import {describe, it} from "node:test"
import {formField} from "html-form-field"

describe("delim", async () => {
    const {ELE} = await import("html-ele")

    it("delim", () => {
        // language=HTML
        const form = (ELE`
            <form>
                <label><input type="checkbox" name="CB" value="CB1" checked>cb1</label>
                <label><input type="checkbox" name="CB" value="CB2" checked>cb2</label>
                <label><input type="checkbox" name="CB" value="CB3" checked>cb3</label>

                <select name="SM" multiple>
                    <option value="SM1" selected>sm1</option>
                    <option value="SM2" selected>sm2</option>
                    <option value="SM3" selected>sm3</option>
                </select>
            </form>
        `)

        assert.equal(formField({form, name: "CB", delim: "/"}).value, "CB1/CB2/CB3")

        assert.equal(formField({form, name: "SM", delim: "|"}).value, "SM1|SM2|SM3")
    })
})
