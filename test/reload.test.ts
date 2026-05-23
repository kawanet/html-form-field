import "./jsdom-helper.ts"
import {strict as assert} from "node:assert"
import {describe, it} from "node:test"
import {formField, type FormField} from "html-form-field"

describe("reload", async () => {
    const {ELE, HTML} = await import("html-ele")
    const Event = document.defaultView.Event

    // language=HTML
    const form = (ELE`
        <form>
            <div>
                <label><input type="checkbox" name="CB" value="CB1" checked>cb1</label>
                <label><input type="checkbox" name="CB" value="CB2">cb2</label>
                <label><input type="checkbox" name="CB" value="CB3" checked>cb3</label>
            </div>
        </form>
    `)

    const handler = () => {
        const queue: ({name: string, value: string})[] = []
        const writer = ({name, value}: FormField) => queue.push({name, value})
        const reader = () => queue.splice(0)
        return [reader, writer] as const
    }

    it("checkbox", () => {
        const [getWritten, onWrite] = handler()
        const [getChanged, onChange] = handler()
        const field = formField({form, onWrite, onChange, name: "CB"})

        assert.equal(field.value, "CB1,CB3")

        form.querySelector(`input[value="CB3"]`).remove()

        // language=HTML
        form.querySelector("div").append(HTML`
            <label><input type="checkbox" name="CB" value="CB4">cb4</label>
            <label><input type="checkbox" name="CB" value="CB5" checked>cb5</label>
        `)

        field.reload()
        assert.equal(field.value, "CB1,CB5")

        // direct DOM manipulation not to invoke onWrite/onChange
        const $CB1 = form.querySelector<HTMLInputElement>(`input[value="CB1"]`)
        $CB1.checked = false
        assert.deepEqual(getWritten(), [])
        assert.deepEqual(getChanged(), [])

        // change event to invoke onWrite/onChange
        $CB1.dispatchEvent(new Event("change", {bubbles: true}))
        assert.deepEqual(getWritten(), [{name: "CB", value: "CB5"}])
        assert.deepEqual(getChanged(), [{name: "CB", value: "CB5"}])
    })
})
