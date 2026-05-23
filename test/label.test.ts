import "./jsdom-helper.ts"
import {strict as assert} from "node:assert"
import {describe, it} from "node:test"
import {formField} from "html-form-field"

describe("label", async () => {
    const {ELE} = await import("html-ele")

    // language=HTML
    const form = (ELE`
        <form>
            <div>
                <input type="text" name="TX" id="TX">
                <label for="TX">tx-label</label>
            </div>

            <div>
                <label><input type="radio" name="RB" value="RB1">rb1</label>
            </div>

            <div>
                <label><input type="checkbox" name="CB" value="CB1">cb1</label>
            </div>

            <select name="SS">
                <option value="SS1">ss1</option>
                <option value="SS2" label="ss2-label">ss2-text</option>
            </select>
        </form>
    `)

    it("radio", () => {
        const field = formField({form, name: "RB"})
        assert.equal(field.name, "RB")
        assert.deepEqual(field.items().map(v => v.label), ["rb1"])
    })

    it("checkbox", () => {
        const field = formField({form, name: "CB"})
        assert.equal(field.name, "CB")
        assert.deepEqual(field.items().map(v => v.label), ["cb1"])
    })

    it("select", () => {
        const field = formField({form, name: "SS"})

        assert.equal(field.name, "SS")
        assert.deepEqual(field.items().map(v => v.label), ["ss1", "ss2-label"])
    })

    /**
     * jsdom connects labels whenever the node is not attached to DOM tree
     * browsers look not to connect labels until the node is attached on DOM tree
     */
    const labelsConnected = !!form.querySelector<HTMLInputElement>(`input[name="TX"]`)?.labels?.length
    ;(labelsConnected ? it : it.skip)("separated label", () => {
        const field = formField({form, name: "TX"})
        assert.equal(field.name, "TX")
        assert.deepEqual(field.items().map(v => v.label), ["tx-label"])
    })
})
