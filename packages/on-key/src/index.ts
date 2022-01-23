import { useEffect } from 'react';

export default function useOnKey(
  key: string,
  callback: (event: KeyboardEvent) => void,
  type: 'keydown' | 'keyup' | 'pressed' = 'keydown'
) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const e = type === 'pressed' ? 'keydown' : type;
      const handler = (event: KeyboardEvent) => {
        if (event.key === key) {
          if (event.repeat && type !== 'pressed') {
            return;
          }
          callback(event);
        }
      };
      window.addEventListener(e, handler);
      return () => {
        window.removeEventListener(e, handler);
      };
    }
  }, [callback, key, type]);
}
