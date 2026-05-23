# html-form-field

Unified interface for HTML form fields with two-way binding to object properties.

[![Node.js CI](https://github.com/kawanet/html-form-field/actions/workflows/nodejs.yml/badge.svg?branch=main)](https://github.com/kawanet/html-form-field/actions/)
[![npm version](https://img.shields.io/npm/v/html-form-field)](https://www.npmjs.com/package/html-form-field)
[![gzip size](https://img.badgesize.io/https://cdn.jsdelivr.net/npm/html-form-field/dist/html-form-field.min.js?compression=gzip)](https://cdn.jsdelivr.net/npm/html-form-field/dist/html-form-field.min.js)

- A single getter/setter API for text inputs, checkboxes, radio buttons, and `<select>` elements.
- Two-way binding between a form field and an object property: assignments flow in either direction.
- Change-detection hooks via `onWrite` (any value write) and `onChange` (user-driven change events).
- Tiny browser build — [html-form-field.min.js](https://cdn.jsdelivr.net/npm/html-form-field/dist/html-form-field.min.js) is under 4 KB minified and under 2 KB gzipped.
- First-class TypeScript types — see [html-form-field.d.ts](https://github.com/kawanet/html-form-field/blob/main/types/html-form-field.d.ts) for the full surface.

## SYNOPSIS

```typescript
import {formField} from "html-form-field"

interface Context {
    nickname: string
    email: string
    favo: string
}

const form = document.querySelector("form")

const ctx = {} as Context

formField({form, bindTo: ctx, name: "nickname"})

console.log(ctx.nickname) // reads from the form field

ctx.nickname = "John"     // writes back to the form field
```

#### HTML Example

```html
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
```

#### Value Access

```js
const email = formField({form, name: "email"})

console.log(email.value)         // read the current value

email.value = "john@example.com" // assign a new value
```

#### Multiple Selections

```js
const favo = formField({form, name: "favo", delim: ","})

favo.toggle("tech")           // toggle one checkbox
favo.toggle("travel", true)   // force-check
favo.toggle("trading", false) // force-uncheck

console.log(favo.has("travel")) // is this option currently selected?

// Shortcut for items().at(index)
const firstItem = favo.itemAt(0)
console.log(firstItem.checked)

// Shortcut for items().find(v => v.value === value)
const travelItem = favo.itemOf("travel")
console.log(travelItem.checked)
```

#### Change Handling and Default Values

```js
formField({
    form,
    bindTo: ctx,
    name: "email",
    onWrite: ({name, value}) => sessionStorage.setItem(name, value),
    onChange: ({name, value}) => submitForm(),
    defaults: [sessionStorage.getItem("email")],
})
```

## SEE ALSO

- https://www.npmjs.com/package/html-form-field
- https://github.com/kawanet/html-form-field

## MIT LICENSE

Copyright (c) 2025-2026 Yusuke Kawasaki

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
