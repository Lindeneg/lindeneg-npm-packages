import useMemoryCache from "./useMemoryCache";
import { EmptyObj } from "../shared";

function tryLS<T>(cb: () => T) {
  try {
    return cb();
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.error("cl-react-hooks could not use localStorage for cache.");
      console.error(err);
    }
  }
  return null;
}

function getStored<T extends EmptyObj>() {
  return tryLS<T>(() => {
    const stored = window.localStorage.getItem("something");
    if (stored) {
      return JSON.parse(stored);
    }
  });
}

function setStored(obj: EmptyObj) {
  tryLS(() => {
    window.localStorage.setItem("something", JSON.stringify(obj));
  });
}

function destructStored() {
  tryLS(() => {
    window.localStorage.removeItem("something");
  });
}

export default function useBrowserCache<T extends EmptyObj>() {
  const { cache } = useMemoryCache<T>(() => {
    const stored = getStored<T>();
    if (stored) {
      return stored;
    }
    return {};
  });

  cache().on("set", (key, value) => {
    const stored = getStored<T>();
    if (stored) {
      stored[key] = value;
      setStored(stored);
    }
  });

  cache().on("remove", (key) => {
    const stored = getStored<T>();
    if (stored) {
      delete stored[key];
      setStored(stored);
    }
  });

  cache().on("clear", () => {
    setStored({});
  });

  cache().on("destruct", () => {
    destructStored();
  });

  return { cache };
}
