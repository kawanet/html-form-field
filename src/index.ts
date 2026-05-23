// Self-reference via the package name so `tsc --noEmit` resolves these
// types through `package.json` `exports` — the same path an external
// consumer would take. If the `exports.types` mapping ever breaks, the
// build fails here.
import type * as declared from "html-form-field"

export {formField} from "./form-field.ts"
export type {FormField, FormFieldOptions} from "html-form-field"
export type formField = typeof declared.formField
