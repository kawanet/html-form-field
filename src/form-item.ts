import type {FormField, formField as NS} from "html-form-field"

const triggerOnWrite = (field: FormField) => {
    const onWrite = field.options.onWrite
    if (onWrite) onWrite(field)
}

const checkableMap: Record<string, boolean> = {
    option: true,
    radio: true,
    checkbox: true,
}

type UpperCaseTagNameMap = { [K in Uppercase<keyof HTMLElementTagNameMap>]: HTMLElementTagNameMap[Lowercase<K>] }

const isElementOf = <N extends keyof UpperCaseTagNameMap>(v: Node, tagName: N): v is UpperCaseTagNameMap[N] => ((v as HTMLElement).tagName === tagName)

export const formItemList = (field: FormField, nodeList: Iterable<NS.FieldElement>) => {
    const list: NS.FormItem[] = []

    for (const node of nodeList) {
        if (isElementOf(node, "SELECT")) {
            for (const option of node.options) {
                list.push(new OptionItem(field, option))
            }
        } else {
            list.push(new InputItem(field, node))
        }
    }

    return list
}

abstract class BaseFormItem<E extends NS.ItemElement> implements NS.FormItem<E> {
    protected readonly field: FormField
    abstract readonly checkable: boolean
    readonly node: E

    protected constructor(field: FormField, node: E) {
        this.field = field
        this.node = node
    }

    get value() {
        return this.node.value
    }

    set value(value: string) {
        this.setValue(value)
        triggerOnWrite(this.field)
    }

    setValue(value: string) {
        this.node.value = value
    }

    get checked(): boolean {
        return this.getChecked()
    }

    protected abstract getChecked(): boolean

    set checked(checked: boolean) {
        const prev = this.checked
        if (prev !== checked) {
            this.setChecked(checked)
            triggerOnWrite(this.field)
        }
    }

    abstract setChecked(checked: boolean): void

    get disabled() {
        return this.node.disabled
    }

    set disabled(disabled: boolean) {
        this.node.disabled = disabled
    }

    abstract get label(): string
}

class InputItem<E extends HTMLInputElement | HTMLTextAreaElement | HTMLButtonElement> extends BaseFormItem<E> {
    readonly checkable: boolean

    constructor(entry: FormField, node: E) {
        super(entry, node)
        this.checkable = checkableMap[node.type]
    }

    protected getChecked() {
        return (this.node as HTMLInputElement).checked
    }

    setChecked(checked: boolean) {
        (this.node as HTMLInputElement).checked = checked
    }

    get label() {
        const node = this.node
        const label = node.closest("label")
        const siblings = label && label.querySelectorAll(node.tagName)

        if (siblings && siblings.length === 1) {
            const text = pickText(label)
            if (text) return text
        }

        const labels = node.labels
        for (const label of labels) {
            const text = pickText(label)
            if (text) return text
        }

        const text = pickText(node)
        if (text) return text

        function pickText(node: HTMLElement) {
            const text = node.innerText || node.textContent
            if (text) return text.trim()
        }
    }
}

class OptionItem<E extends HTMLOptionElement> extends BaseFormItem<E> {
    readonly checkable: boolean

    constructor(entry: FormField, node: E) {
        super(entry, node)
        this.checkable = true
    }

    protected getChecked() {
        return this.node.selected
    }

    setChecked(checked: boolean) {
        // Note: Setting false may trigger auto-selection of the first option on select-one
        this.node.selected = checked
    }

    get label() {
        const node = this.node
        const text = node.label || node.textContent
        if (text) return text.trim()
    }
}
