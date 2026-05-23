import "./jsdom-helper.ts"
import {strict as assert} from "node:assert"
import {describe, it} from "node:test"
import {formField} from "html-form-field"

describe("document-fragment", async () => {
    const {HTML} = await import("html-ele")

    // language=HTML
    const form = (HTML`
        <form>
            <ul>
                <li><input type="text" name="TX" value="tx1"></li>
            </ul>
        </form>
    `)

    it("DocumentFragment", () => {
        const field = formField({form, name: "TX"})
        assert.equal(field.name, "TX")
        assert.equal(field.value, "tx1")
    })
})
