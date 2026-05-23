import "./jsdom-helper.ts"
import {strict as assert} from "node:assert"
import {describe, it} from "node:test"
import {formField, type FormField} from "html-form-field"

describe("on-write", async () => {
    const {ELE} = await import("html-ele")
    const Event = document.defaultView.Event

    // language=HTML
    const form = (ELE`
        <form>
            <ul>
                <li><input type="text" name="TX" value="FOO"></li>
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
        </form>
    `)

    const handler = () => {
        const queue: ({name: string, value: string})[] = []
        const writer = ({name, value}: FormField) => queue.push({name, value})
        const reader = () => queue.splice(0)
        return [reader, writer] as const
    }

    it("text", () => {
        const [getWritten, onWrite] = handler()
        const [getChanged, onChange] = handler()
        const field = formField({form, onWrite, onChange, name: "TX"})
        const $elem = form.querySelector<HTMLInputElement>(`input[name="TX"]`)

        assert.equal(field.value, "FOO")
        assert.equal($elem.value, "FOO")

        // setting value to invoke onWrite but not onChange
        field.value = "BAR"
        assert.equal(field.value, "BAR")
        assert.equal($elem.value, "BAR")
        assert.deepEqual(getWritten(), [{name: "TX", value: "BAR"}])
        assert.deepEqual(getChanged(), [])

        // direct DOM manipulation not to invoke onWrite/onChange
        $elem.value = "BUZ"
        assert.equal(field.value, "BUZ")
        assert.deepEqual(getWritten(), [])
        assert.deepEqual(getChanged(), [])

        // change event to invoke onWrite/onChange
        $elem.dispatchEvent(new Event("change", {bubbles: true}))
        assert.deepEqual(getWritten(), [{name: "TX", value: "BUZ"}])
        assert.deepEqual(getChanged(), [{name: "TX", value: "BUZ"}])

        // setting value to invoke onWrite but not onChange
        field.items().at(0).value = "BUZ"
        assert.equal(field.value, "BUZ")
        assert.equal($elem.value, "BUZ")
        assert.deepEqual(getWritten(), [{name: "TX", value: "BUZ"}])
        assert.deepEqual(getChanged(), [])
    })

    it("radio", () => {
        const [getWritten, onWrite] = handler()
        const [getChanged, onChange] = handler()
        const field = formField({form, onWrite, onChange, name: "RB"})
        const $elems = form.querySelectorAll<HTMLInputElement>(`input[name="RB"]`)

        assert.equal(field.value, "RB2")

        // setting value to invoke onWrite but not onChange
        field.value = "RB3"
        assert.equal(field.value, "RB3")
        assert.deepEqual(getWritten(), [{name: "RB", value: "RB3"}])
        assert.deepEqual(getChanged(), [])

        // direct DOM manipulation not to invoke onWrite/onChange
        $elems[0].checked = true
        assert.equal(field.value, "RB1")
        assert.deepEqual(getWritten(), [])
        assert.deepEqual(getChanged(), [])

        // change event to invoke onWrite/onChange
        $elems[0].dispatchEvent(new Event("change", {bubbles: true}))
        assert.deepEqual(getWritten(), [{name: "RB", value: "RB1"}])
        assert.deepEqual(getChanged(), [{name: "RB", value: "RB1"}])
    })

    it("select-one", () => {
        const [getWritten, onWrite] = handler()
        const [getChanged, onChange] = handler()
        const field = formField({form, onWrite, onChange, name: "SS"})
        const $elem = form.querySelector<HTMLSelectElement>(`select[name="SS"]`)

        assert.equal(field.value, "SS2")

        // setting value to invoke onWrite but not onChange
        field.value = "SS3"
        assert.equal(field.value, "SS3")
        assert.deepEqual(getWritten(), [{name: "SS", value: "SS3"}])
        assert.deepEqual(getChanged(), [])

        // direct DOM manipulation not to invoke onWrite/onChange
        $elem.value = "SS1"
        assert.equal(field.value, "SS1")
        assert.deepEqual(getWritten(), [])
        assert.deepEqual(getChanged(), [])

        // change event to invoke onWrite/onChange
        $elem.dispatchEvent(new Event("change", {bubbles: true}))
        assert.deepEqual(getWritten(), [{name: "SS", value: "SS1"}])
        assert.deepEqual(getChanged(), [{name: "SS", value: "SS1"}])
    })

    it("checkbox", () => {
        const [getWritten, onWrite] = handler()
        const [getChanged, onChange] = handler()
        const field = formField({form, onWrite, onChange, name: "CB"})
        const $elems = form.querySelectorAll<HTMLInputElement>(`input[name="CB"]`)

        assert.equal(field.value, "CB1,CB3")

        // setting value to invoke onWrite but not onChange
        field.value = "CB2"
        assert.equal(field.value, "CB2")
        assert.deepEqual(getWritten(), [{name: "CB", value: "CB2"}])
        assert.deepEqual(getChanged(), [])

        // direct DOM manipulation not to invoke onWrite/onChange
        $elems[0].checked = true
        assert.equal(field.value, "CB1,CB2")
        assert.deepEqual(getWritten(), [])
        assert.deepEqual(getChanged(), [])

        // change event to invoke onWrite/onChange
        $elems[0].dispatchEvent(new Event("change", {bubbles: true}))
        assert.deepEqual(getWritten(), [{name: "CB", value: "CB1,CB2"}])
        assert.deepEqual(getChanged(), [{name: "CB", value: "CB1,CB2"}])
    })

    it("select-multiple", () => {
        const [getWritten, onWrite] = handler()
        const [getChanged, onChange] = handler()
        const field = formField({form, onWrite, onChange, name: "SM"})
        const $elem = form.querySelector<HTMLSelectElement>(`select[name="SM"]`)

        assert.equal(field.value, "SM1,SM3")

        // setting value to invoke onWrite but not onChange
        field.value = "SM2"
        assert.equal(field.value, "SM2")
        assert.deepEqual(getWritten(), [{name: "SM", value: "SM2"}])
        assert.deepEqual(getChanged(), [])

        // direct DOM manipulation not to invoke onWrite/onChange
        $elem.options.item(0).selected = true
        $elem.options.item(1).selected = true
        $elem.options.item(2).selected = false
        assert.equal(field.value, "SM1,SM2")
        assert.deepEqual(getWritten(), [])
        assert.deepEqual(getChanged(), [])

        // change event to invoke onWrite/onChange
        $elem.dispatchEvent(new Event("change", {bubbles: true}))
        assert.deepEqual(getWritten(), [{name: "SM", value: "SM1,SM2"}])
        assert.deepEqual(getChanged(), [{name: "SM", value: "SM1,SM2"}])
    })
})
