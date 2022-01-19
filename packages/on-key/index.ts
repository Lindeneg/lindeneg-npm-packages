import { useEffect } from "react";

export default function useOnKey(
  key: string,
  callback: (event: KeyboardEvent) => void,
  type: "keydown" | "keyup" | "pressed" = "keydown"
) {
  useEffect(() => {
    if (typeof window !== "undefined") {
      const e = type === "pressed" ? "keydown" : type;
      const onKeyDown = (event: KeyboardEvent) => {
        if (event.key === key) {
          if (event.repeat && type !== "pressed") {
            return;
          }
          callback(event);
        }
      };
      window.addEventListener(e, onKeyDown);
      return () => {
        window.removeEventListener(e, onKeyDown);
      };
    }
  }, [callback, key, type]);
}
