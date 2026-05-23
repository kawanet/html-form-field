/**
 * html-form-field — Unified interface for HTML form fields with two-way
 * binding to object properties.
 *
 * @author kawanet
 * @see https://github.com/kawanet/html-form-field
 */

declare namespace formField {
    /** Form field elements addressable by `name=`. */
    type FieldElement = HTMLInputElement | HTMLTextAreaElement | HTMLButtonElement | HTMLSelectElement

    /** Individual item elements managed inside a field (a checkbox/radio in a group, or an `<option>` in a `<select>`). */
    type ItemElement = HTMLInputElement | HTMLTextAreaElement | HTMLButtonElement | HTMLOptionElement

    /**
     * Extracts the string-valued keys of `T`.
     *
     * - `T = undefined`: any `string` is accepted (no bound object means no key constraint).
     * - `T` is an object: the union of keys `K` where `T[K]` extends `string`.
     */
    type StringKeys<T> = [T] extends [undefined]
        ? string
        : { [K in keyof T]: K extends string ? (T[K] extends string ? K : never) : never }[keyof T];

    /** Handler invoked when a field value is written. See `FormFieldOptions.onWrite`. */
    type OnWrite<T> = FormFieldOptions<T>["onWrite"]

    /** Handler invoked on a user-driven `change` event. See `FormFieldOptions.onChange`. */
    type OnChange<T> = FormFieldOptions<T>["onChange"]

    interface FormFieldOptions<T = any> {
        /**
         * The form element, or any container element that holds the field elements.
         */
        form: HTMLFormElement | FieldElement | ParentNode

        /**
         * `name=` attribute of the field to bind.
         *
         * When `bindTo` is supplied, TypeScript infers `T` from that object and `name` is
         * restricted to keys of the bound object whose value type is `string`. Without
         * `bindTo`, any string is accepted.
         */
        name: StringKeys<T>

        /**
         * Object to synchronize with the form field.
         *
         * A getter/setter is installed on the property matching `name`: the getter reads
         * the live DOM value, the setter writes back to the DOM and fires `onWrite`. Other
         * properties on the object are left untouched.
         */
        bindTo?: T

        /**
         * Called whenever the field value is written — either by a setter
         * (`field.value = ...` or assignment to a bound property) or by a user-driven
         * `change` event. Fires before `onChange`.
         */
        onWrite?: (field: FormField<T>) => void

        /**
         * Called only on a user-driven `change` event. Setter assignments do not trigger
         * this handler. Fires after `onWrite`.
         */
        onChange?: (item: FormField<T>) => void

        /**
         * Delimiter joining multiple values for checkbox groups and multi-select fields.
         * Defaults to `,` (comma). Use Unit Separator (`\x1F`) if your values may contain
         * commas.
         */
        delim?: string

        /**
         * Candidate initial values, tried in order.
         *
         * For checkbox / radio / select fields, the first value with a matching option is
         * applied; if none matches, the next candidate is tried, and so on.
         */
        defaults?: string[]
    }

    interface FormField<T = any> {
        readonly options: FormFieldOptions<T>

        /** `name=` attribute of the bound field. */
        readonly name: StringKeys<T>

        /**
         * Getter/setter for the field value. Assignment fires the `onWrite` handler.
         *
         * For checkbox groups and multi-select fields the value is exposed as a single
         * string formed by joining the selected values with `options.delim` (default `,`).
         */
        value: string

        /**
         * Re-scan the form for items matching `name` and rebind them. Call this after
         * the underlying DOM changes — for example when checkboxes, radio buttons, or
         * `<option>` elements are added or removed — so the `FormField` reflects the
         * current state of the form.
         */
        reload(): void

        /**
         * All items belonging to the field, including disabled ones.
         *
         * - checkbox / radio / select: every option in the group.
         * - other field types: the single underlying item.
         */
        items(): FormItem[]

        /**
         * Active items only — disabled items are excluded.
         *
         * - checkbox / radio: items that are currently checked and enabled.
         * - select: options that are currently selected and enabled.
         * - other field types: the single underlying item, if enabled.
         */
        current(): FormItem[]

        /**
         * Toggle the selection of an item (checkbox or multi-select). With `checked`
         * supplied, sets the state explicitly; without it, flips the current state.
         * Returns the new selection state.
         */
        toggle(value: string, checked?: boolean): boolean

        /** Returns `true` if the given value is currently selected. */
        has(value: string): boolean

        /**
         * Shortcut for `items().at(index)`. Returns `undefined` when out of range.
         */
        itemAt(index: number): FormItem | undefined

        /**
         * Shortcut for `items().find(v => v.value === value)`. Returns the first match,
         * or `undefined` if no item has the given value.
         */
        itemOf(value: string): FormItem | undefined
    }

    interface FormItem<E extends ItemElement = ItemElement> {
        /** Underlying HTML element (`<input>`, `<option>`, `<textarea>`, ...). */
        readonly node: E

        /** Getter/setter for the item's `value` property. Assignment fires `onWrite`. */
        value: string

        /** Set `value` without firing `onWrite`. */
        setValue(value: string): void

        /** Whether the item is a checkable type (radio, checkbox, or `<option>`). */
        readonly checkable: boolean

        /**
         * Selection state for radio buttons, checkboxes, and `<option>` elements.
         * Assignment fires `onWrite`.
         */
        checked: boolean | undefined

        /** Set `checked` without firing `onWrite`. */
        setChecked(checked: boolean): void

        /** Getter/setter for the `disabled` property. */
        disabled: boolean

        /** Visible label text of the item, when the underlying element exposes one. */
        readonly label: string | undefined
    }
}

export type FormField<T = any> = formField.FormField<T>

export type FormFieldOptions<T = any> = formField.FormFieldOptions<T>

export const formField: <T = any>(options: FormFieldOptions<T>) => FormField<T>
