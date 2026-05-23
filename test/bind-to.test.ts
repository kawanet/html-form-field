import "./jsdom-helper.ts"
import {strict as assert} from "node:assert"
import {describe, it} from "node:test"
import {formField} from "html-form-field"

describe("bind-to", async () => {
    const {ELE} = await import("html-ele")

    // language=HTML
    const form = (ELE`
        <form>
            <ul>
                <li><input type="text" name="TX" value="tx1"></li>
                <li><input type="text" name="TX2"></li>
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
        </form>
    `)

    interface Context {
        TX: string
        RB: string
        CB: string
        SS: string
        SM: string
    }

    const ctx = {} as Context

    it("text", () => {
        const field = formField({form, bindTo: ctx, name: "TX"})
        assert.equal(ctx.TX, "tx1")
        ctx.TX = "tx2"
        assert.equal(field.value, "tx2")
    })

    it("radio", () => {
        const field = formField({form, bindTo: ctx, name: "RB"})
        assert.equal(ctx.RB, "RB2")
        ctx.RB = "RB3"
        assert.equal(field.value, "RB3")
    })

    it("checkbox", () => {
        const field = formField({form, bindTo: ctx, name: "CB"})
        assert.equal(ctx.CB, "CB2,CB3")
        ctx.CB = "CB1,CB2"
        assert.equal(field.value, "CB1,CB2")
    })

    it("select-one", () => {
        const field = formField({form, bindTo: ctx, name: "SS"})
        assert.equal(ctx.SS, "SS2")
        ctx.SS = "SS1"
        assert.equal(field.value, "SS1")
    })

    it("select-multiple", () => {
        const field = formField({form, bindTo: ctx, name: "SM"})
        assert.equal(ctx.SM, "SM1,SM3")
        ctx.SM = "SM1,SM2"
        assert.equal(field.value, "SM1,SM2")
    })

    it("errors", () => {
        // @ts-expect-error
        // TS2322: Type '"TX2"' is not assignable
        assert.doesNotThrow(() => formField({form, bindTo: ctx, name: "TX2"}))

        // @ts-expect-error
        // TS2322: Type '"TX0"' is not assignable
        assert.throws(() => formField({form, bindTo: ctx, name: "TX0"}), /Not found/)

        assert.throws(() => formField({form, bindTo: ctx, name: undefined}), /Invalid name/)

        assert.throws(() => formField({form, bindTo: ctx, name: null}), /Invalid name/)
    })
})
