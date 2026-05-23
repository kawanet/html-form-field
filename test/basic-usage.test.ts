import "./jsdom-helper.ts"
import {strict as assert} from "node:assert"
import {describe, it} from "node:test"
import {formField} from "html-form-field"

describe("basic-usage", async () => {
    const {ELE} = await import("html-ele")

    // language=HTML
    const form = (ELE`
        <form>
            <ul>
                <li><input type="text" name="TX" value="tx1"></li>
                <li><input type="date" name="DT" value=""></li>
                <li><input type="password" name="PW" value="pw1"></li>
                <li><input type="button" name="BT1" value="bt1"></li>
                <li>
                    <button name="BT2" value="bt2">bt2-text</button>
                </li>
            </ul>

            <div>
                <label><input type="radio" name="RB" value="RB1">rb1</label>
                <label><input type="radio" name="RB" value="RB2" checked>rb2</label>
                <label><input type="radio" name="RB" value="RB3">rb3</label>
            </div>

            <div>
                <label><input type="checkbox" name="CB" value="CB1">cb1</label>
                <label><input type="checkbox" name="CB" value="CB2" checked>cb2</label>
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
        const field = formField({form, name: "TX"})

        assert.equal(field.name, "TX")
        assert.equal(field.value, "tx1")

        field.value = "tx2"
        assert.equal(field.value, "tx2")

        assert.deepEqual(field.items().map(v => v.value), ["tx2"])
        assert.deepEqual(field.current().map(v => v.value), ["tx2"])
    })

    it("radio", () => {
        const field = formField({form, name: "RB"})

        assert.equal(field.name, "RB")
        assert.equal(field.value, "RB2")

        assert.equal(field.current().length, 1)
        assert.equal(field.current().at(0).value, "RB2")

        field.value = "RB3"
        assert.equal(field.value, "RB3")

        assert.equal(field.has("RB1"), false)
        assert.equal(field.has("RB2"), false)
        assert.equal(field.has("RB3"), true)

        assert.equal(field.current().length, 1)
        assert.equal(field.current().at(0).value, "RB3")
    })

    it("select-one", () => {
        const field = formField({form, name: "SS"})

        assert.equal(field.name, "SS")
        assert.equal(field.value, "SS2")

        assert.equal(field.current().length, 1)
        assert.equal(field.current().at(0).value, "SS2")

        field.value = "SS3"
        assert.equal(field.value, "SS3")

        assert.equal(field.current().length, 1)
        assert.equal(field.current().at(0).value, "SS3")
    })

    it("checkbox", () => {
        const field = formField({form, name: "CB"})

        assert.equal(field.name, "CB")
        assert.equal(field.value, "CB2,CB3")
        assert.deepEqual(field.current().map(v => v.value), ["CB2", "CB3"])

        field.toggle("CB1")
        assert.equal(field.value, "CB1,CB2,CB3")
        assert.deepEqual(field.current().map(v => v.value), ["CB1", "CB2", "CB3"])

        field.toggle("CB2", false)
        assert.equal(field.value, "CB1,CB3")
        assert.deepEqual(field.current().map(v => v.value), ["CB1", "CB3"])

        field.value = "CB2,CB3"
        assert.deepEqual(field.value, "CB2,CB3")

        assert.equal(field.has("CB1"), false)
        assert.equal(field.has("CB2"), true)
        assert.equal(field.has("CB3"), true)
    })

    it("select-multiple", () => {
        const field = formField({form, name: "SM"})

        assert.equal(field.name, "SM")
        assert.equal(field.value, "SM1,SM3")
        assert.deepEqual(field.current().map(v => v.value), ["SM1", "SM3"])

        field.toggle("SM2")
        assert.deepEqual(field.value, "SM1,SM2,SM3")
        assert.deepEqual(field.current().map(v => v.value), ["SM1", "SM2", "SM3"])

        field.toggle("SM1", false)
        assert.deepEqual(field.value, "SM2,SM3")
        assert.deepEqual(field.current().map(v => v.value), ["SM2", "SM3"])

        field.value = "SM1,SM3"
        assert.deepEqual(field.value, "SM1,SM3")

        assert.equal(field.has("SM1"), true)
        assert.equal(field.has("SM2"), false)
        assert.equal(field.has("SM3"), true)
    })

    it("textarea", () => {
        const field = formField({form, name: "TA"})

        assert.equal(field.name, "TA")
        assert.equal(field.value, "ta1")

        field.value = "ta2"
        assert.equal(field.value, "ta2")

        assert.deepEqual(field.items().map(v => v.value), ["ta2"])
        assert.deepEqual(field.current().map(v => v.value), ["ta2"])
    })

    it("button", () => {
        const BT1 = formField({form, name: "BT1"})
        assert.equal(BT1.name, "BT1")
        assert.equal(BT1.value, "bt1")

        const BT2 = formField({form, name: "BT2"})
        assert.equal(BT2.name, "BT2")
        assert.equal(BT2.value, "bt2")
        assert.equal(BT2.items().at(0).label, "bt2-text")
    })
})
