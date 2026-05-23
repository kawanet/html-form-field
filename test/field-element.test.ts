import "./jsdom-helper.ts"
import {strict as assert} from "node:assert"
import {describe, it} from "node:test"
import {formField} from "html-form-field"

describe("field-element", async () => {
    const {ele} = await import("html-ele")

    it("text", () => {
        // language=HTML
        const form = (ele("input")`
            <input type="text" name="TX" value="tx1">
        `)

        const field = formField({form, name: "TX"})
        assert.equal(field.name, "TX")
        assert.equal(field.value, "tx1")
    })

    it("select", () => {
        // language=HTML
        const form = (ele("select")`
            <select name="SS">
                <option value="SS1">ss1</option>
                <option value="SS2" selected>ss2</option>
                <option value="SS3">ss3</option>
            </select>
        `)

        const field = formField({form, name: "SS"})
        assert.equal(field.name, "SS")
        assert.equal(field.value, "SS2")
    })
})
