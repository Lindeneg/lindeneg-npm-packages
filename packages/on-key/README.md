### useOnKey

Hook to listen for key-strokes and then do something

### Installation

`yarn add @lindeneg/on-key`

---

#### Arguments

| Name     | Required | Default     | Type                                 | Description                                                                                                        |
| -------- | -------- | ----------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| key      | Y        | -           | `string`                             | [KeyboardEvent.key](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values) to listen after |
| callback | Y        | -           | `(event: KeyboardEvent) => void`     | function to be called when desired event is dispatched                                                             |
| type     | N        | `"keydown"` | `"keydown" \| "keyup" \| "keypress"` | event type to listen after                                                                                         |

#### Usage

```tsx
function SomeComponent() {

  ...

  useOnKey("ArrowRight", (event) => console.log("ArrowRight Pressed", event));
}
```
