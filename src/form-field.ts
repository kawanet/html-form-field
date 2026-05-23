import type {formField as NS, FormField, FormFieldOptions} from "html-form-field"
import {formItemList} from "./form-item.ts"

type FieldEventHandler = (this: NS.FieldElement, ev: Event) => void

const DELIM = "," // or use Unit Separator `\x1F` instead

const isString = (v: any): v is string => ("string" === typeof v)

const noNullString = (v: any): string => (v == null) ? "" : isString(v) ? v : String(v)

const splitString = (v: string | string[], delim: string) => (v == null) ? [] : Array.isArray(v) ? v.map(noNullString) : noNullString(v).split(delim)

const isHTMLElement = (v: ParentNode): v is HTMLElement => ("function" === typeof (v as HTMLElement).matches)

export const formField: typeof NS = (options) => {
    return new FormBridgeImpl(options)
}

const getNodeList = <T>({form, name}: {form: ParentNode, name: NS.StringKeys<T>}): Iterable<NS.FieldElement> => {
    const safeName = JSON.stringify(name)
    if (!name) {
        throw new Error(`Invalid name=${safeName}`)
    }

    const selector = `input[name=${safeName}], textarea[name=${safeName}], button[name=${safeName}], select[name=${safeName}]`

    const nodeList = form.querySelectorAll<NS.FieldElement>(selector)
    if (!nodeList.length && isHTMLElement(form) && form.matches(selector)) {
        return [form] as NS.FieldElement[]
    }

    // No throw on a 0-match result here: a freshly rendered form may not yet
    // contain the controls (dynamic radio/checkbox groups, lazy-populated
    // <select>, etc.). The error surfaces lazily from `items()` instead.
    return nodeList
}

const updateEventListener = (nodeList: Iterable<NS.FieldElement>, handler: FieldEventHandler) => {
    for (const node of nodeList) {
        node.removeEventListener("change", handler)
        node.addEventListener("change", handler)
    }
}

const triggerOnWrite = <T>(field: FormField<T>) => {
    const onWrite = field.options.onWrite
    if (onWrite) onWrite(field)
}

const triggerOnChange = <T>(field: FormField<T>) => {
    const onChange = field.options.onChange
    if (onChange) onChange(field)
}

const applyBindTo = <T>(bindTo: T, name: NS.StringKeys<T>, field: FormField<T>) => {
    if (!bindTo) return // nothing to be bound

    delete bindTo[name as keyof T]

    const getValue = () => field.value

    const setValue = (value: string) => {
        field.value = value
    }

    Object.defineProperty(bindTo, name, {
        get: getValue,
        set: setValue,
        enumerable: true,
        configurable: true,
    })
}

class FormBridgeImpl<T = any> implements FormField<T> {
    readonly options: FormFieldOptions<T>
    readonly name: FormField<T>["name"]

    private _fields: NS.FieldElement[]
    // `null` when the most recent getNodeList() returned zero matches.
    // Methods that need item-level access (items, value, current, etc.)
    // surface the error lazily; closest() still works because it walks
    // from `_fields[0]`, which is simply `undefined` in this state.
    private _items: NS.FormItem[] | null
    private readonly _onChange: FieldEventHandler

    constructor(options: FormFieldOptions<T> = {} as FormFieldOptions<T>) {
        this.options = options
        const name = this.name = options.name
        applyBindTo(options.bindTo, name, this)

        const _onChange = this._onChange = () => {
            triggerOnWrite(this)
            triggerOnChange(this)
        }

        const fields = this._fields = Array.from(getNodeList(options))
        updateEventListener(fields, _onChange)
        this._items = fields.length ? formItemList(this, fields) : null

        const defaults = options.defaults
        if (defaults) {
            for (const v of defaults) {
                if (this.setValue(v)) break
            }
        }
    }

    get value() {
        const values = this.current().map(v => v.value)
        if (values.length > 1) {
            const delim = this.options.delim || DELIM
            return values.join(delim)
        } else {
            return values[0]
        }
    }

    set value(value: string) {
        this.setValue(value)
        triggerOnWrite(this)
    }

    protected setValue(value: string | string[]): boolean {
        const items = this.items()

        if (items.length === 1 && !items[0].checkable && isString(value)) {
            value = [value]
        }

        const delim = this.options.delim || DELIM
        const values = splitString(value, delim)
        let i = 0
        let assigned = 0

        for (const item of items) {
            if (item.checkable) {
                const checked = values.includes(item.value)
                if (checked) assigned++
                if (item.checked !== checked) {
                    item.setChecked(checked)
                }
            } else {
                const value = values[i++]
                const isNull = (value == null)
                item.setValue(isNull ? "" : value)
                if (!isNull) assigned++
            }
        }

        return !!assigned
    }

    current() {
        return this.items().filter(v => (!v.disabled && (!v.checkable || v.checked)))
    }

    reload(): void {
        const fields = this._fields = Array.from(getNodeList(this.options))
        updateEventListener(fields, this._onChange)
        this._items = fields.length ? formItemList(this, fields) : null
    }

    items(): NS.FormItem[] {
        if (!this._items) {
            throw new Error(`Not found: name=${JSON.stringify(this.name)}`)
        }
        return this._items
    }

    /**
     * Walk up from the field's first element (inclusive) and return the
     * closest ancestor matching the selector. Useful for reaching the
     * container element when the field is a `<select>` (so you can
     * append `<option>` elements before calling `reload()`) or when
     * the field is part of a checkbox/radio group inside a wrapper.
     *
     * For multi-element fields (checkbox/radio groups), the walk starts
     * from the first element only — callers that need a different
     * starting point can use `items().at(i)?.node.closest(selector)`.
     *
     * Returns `null` when no ancestor matches, matching the contract
     * of `Element.closest()`.
     */
    closest<E extends Element = Element>(selector: string): E | null {
        return this._fields[0]?.closest<E>(selector) ?? null
    }

    toggle(value: string, checked?: boolean): boolean {
        let result: boolean
        const delim = this.options.delim || DELIM
        const values = splitString(value, delim)

        for (const item of this.items()) {
            if (values.includes(item.value)) {
                if (checked != null) {
                    result = checked
                } else {
                    result = !item.checked
                }
                item.checked = result
            }
        }

        return result
    }

    has(value: string): boolean {
        return !!this.current().find(v => v.value === value)
    }

    /**
     * Shortcut to access an item by index (operates on items()).
     * Equivalent to items().at(index). Returns undefined if out of range.
     */
    itemAt(index: number): NS.FormItem | undefined {
        return this.items().at(index)
    }

    /**
     * Shortcut to access an item by value (operates on items()).
     * Returns the first FormItem whose value equals the given value, or undefined if not found.
     */
    itemOf(value: string): NS.FormItem | undefined {
        return this.items().find(v => v.value === value)
    }
}
