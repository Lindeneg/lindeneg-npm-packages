### @lindeneg/on-key

Hook to listen for key-strokes and then do something

[Sandbox](https://codesandbox.io/s/lindeneg-on-key-m99cq?file=/src/App.tsx) | [Size](https://bundlephobia.com/package/@lindeneg/on-key)

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
import useOnKey from "@lindeneg/on-key";

function SomeComponent() {

  ...

  useOnKey("ArrowRight", (event) => console.log("ArrowRight: keydown", event));
}
```
