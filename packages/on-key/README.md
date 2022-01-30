### @lindeneg/on-key

![typescript](https://badgen.net/badge/icon/typescript?icon=typescript&label) ![bundle-size](https://badgen.net/bundlephobia/min/@lindeneg/on-key) ![license](https://badgen.net/npm/license/@lindeneg/on-key)

[Sandbox](https://codesandbox.io/s/lindeneg-on-key-m99cq)

---

Hook to listen for key-strokes and then do something

### Installation

`yarn add @lindeneg/on-key`

---

#### Arguments

| Name     | Required | Default     | Type                                | Description                                                                                                        |
| -------- | -------- | ----------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| key      | Y        | -           | `string`                            | [KeyboardEvent.key](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values) to listen after |
| callback | Y        | -           | `(event: KeyboardEvent) => void`    | function to be called when desired event is dispatched                                                             |
| type     | N        | `"keydown"` | `"keydown" \| "keyup" \| "pressed"` | event type to listen after                                                                                         |

#### Usage

```tsx
import useOnKey from '@lindeneg/on-key';

function SomeComponent() {
  useOnKey('ArrowRight', (event) => console.log('ArrowRight: keydown', event));
}
```
