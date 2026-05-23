import "./jsdom-helper.ts"
import {strict as assert} from "node:assert"
import {describe, it} from "node:test"
import {formField} from "html-form-field"

describe("synopsis", async () => {
    const {ELE} = await import("html-ele")

    // language=HTML
    const form = (ELE`
        <form>
            <ul>
                <li>Nickname: <input type="text" name="nickname" value="Alice"></li>
                <li>Email: <input type="email" name="email" value="alice@example.com"></li>
                <li>Favorites:
                    <label><input type="checkbox" name="favo" value="tech">Tech</label>
                    <label><input type="checkbox" name="favo" value="travel">Travel</label>
                    <label><input type="checkbox" name="favo" value="trading">Trading</label>
                </li>
            </ul>
        </form>
    `)

    // mock implementation for testing
    const console = {log: ((v: string | boolean) => assert.ok(v))}
    const submitForm = (): void => null
    const sessionStorage = {getItem: (name: string): string => null, setItem: (name: string, value: string): void => null}
    const document = {querySelector: (selector: string) => form}

    it("SYNOPSIS", () => {
        // import {formField} from "html-form-field";

        interface Context {
            nickname: string
            email: string
            favo: string
        }

        const form = document.querySelector("form")

        const ctx = {} as Context

        formField({form, bindTo: ctx, name: "nickname"})

        console.log(ctx.nickname) // reads from form field

        ctx.nickname = "John" // updates form field
    })

    it("Value access", () => {
        const email = formField({form, name: "email"})

        console.log(email.value) // current value

        email.value = "john@example.com" // update value
    })

    it("Multiple selections", () => {
        const favo = formField({form, name: "favo", delim: ","})

        favo.toggle("tech") // toggle checkbox

        favo.toggle("travel", true)

        favo.toggle("trading", false)

        console.log(favo.has("travel")) // check if selected

        // Shortcut to item by index. Equivalent to items().at(index))
        const firstItem = favo.itemAt(0)
        console.log(firstItem.checked)

        // Shortcut to item by value. Equivalent to items().find(v => v.value === value)
        const travelItem = favo.itemOf("travel")
        console.log(travelItem.checked)
    })

    it("Change handling and defaults", () => {
        formField({
            form,
            name: "email",
            onWrite: ({name, value}) => sessionStorage.setItem(name, value),
            onChange: ({name, value}) => submitForm(),
            defaults: [sessionStorage.getItem("email")],
        })
    })
})
