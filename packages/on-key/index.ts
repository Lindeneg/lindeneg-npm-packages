import { useEffect } from "react";

export default function useOnKey(
  key: string,
  callback: (event: KeyboardEvent) => void,
  type: "keydown" | "keyup" | "keypress" = "keydown"
) {
  useEffect(() => {
    if (typeof window !== "undefined") {
      const onKeyDown = (event: KeyboardEvent) => {
        if (event.key === key) {
          callback(event);
        }
      };
      window.addEventListener(type, onKeyDown);
      return () => {
        window.removeEventListener(type, onKeyDown);
      };
    }
  }, [callback, key, type]);
}
