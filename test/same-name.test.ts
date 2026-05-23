import "./jsdom-helper.ts"
import {strict as assert} from "node:assert"
import {describe, it} from "node:test"
import {formField} from "../src/index.ts"

describe("same-name", async () => {
    const {ELE} = await import("html-ele")

    it("same-name", () => {
        // language=HTML
        const form = (ELE`
            <form>
                <input type="text" name="TXTA" value="TX">
                <textarea name="TXTA">TA</textarea>

                <input type="text" name="TX2" value="">

                <label><input type="checkbox" name="CBRB" value="CB" checked>cb</label>
                <label><input type="radio" name="CBRB" value="RB" checked>rb</label>

                <select name="SSSM">
                    <option value="SS1">ss1</option>
                </select>
                <select name="SSSM" multiple>
                    <option value="SM1" selected>sm1</option>
                </select>
            </form>
        `)

        {
            const field = formField({form, name: "TXTA"})
            assert.equal(field.value, "TX,TA")
            field.value = "tx1,ta1"
            assert.equal(field.items().at(0).value, "tx1")
            assert.equal(field.items().at(1).value, "ta1")
        }

        {
            const field = formField({form, name: "TX2"})
            field.value = "tx2,ta2"
            assert.equal(field.value, "tx2,ta2")
        }

        assert.equal(formField({form, name: "CBRB"}).value, "CB,RB")

        assert.equal(formField({form, name: "SSSM"}).value, "SS1,SM1")
    })
})
