import React, { useState, useMemo, useCallback } from "react";
import { EmptyObj } from "@lindeneg/types";

type Concat<K, P> = K extends string | number
  ? P extends string | number
    ? `${K extends number ? "n" : K}${"" extends P ? "" : "."}${P}`
    : never
  : never;

type Depth = [never, 0, 1, 2, 3, 4, 5, ...0[]];

type TargetKeyConstraint<T, U extends number = 5> = U extends never
  ? never
  : T extends object
  ? {
      [K in keyof T]-?: Concat<K, TargetKeyConstraint<T[K], Depth[U]>>;
    }[keyof T]
  : "";

type EntryConstraint = EmptyObj | EmptyObj[];

type KeyConstraint<T extends unknown[]> = [
  TargetKeyConstraint<T[number]>,
  ...TargetKeyConstraint<T[number]>[]
];

type SanitizeMode = "strict" | "lenient";

type UseSearchOptions<T extends unknown[]> = {
  mode?: SanitizeMode;
  sort?: (a: T[number], b: T[number]) => number;
};

const sanitize = function (str: string, mode: SanitizeMode = "lenient") {
  const isStrict = mode === "strict";
  return str.replace(/[^a-z0-9]/gi, (match) => {
    return isStrict || match === "\\" ? " " : "\\" + match;
  });
};

function reduceToString(obj: EmptyObj[], key: string | null) {
  return obj.reduce((a, b) => {
    const val = key ? b[key] : b;
    return a + " " + (val ? String(val) : "");
  }, "");
}

function handleArray(keys: string[], current: EmptyObj[]) {
  const nKeys = keys.slice(1);
  const result =
    nKeys.length > 0
      ? current.reduce((a, b) => a + " " + getNestedValue(b, nKeys), "")
      : reduceToString(current, null);
  return result;
}

function getNestedValue(obj: EntryConstraint, keys: string[]): string {
  const isArray = Array.isArray(obj);
  if (keys.length === 1) {
    const result = isArray ? reduceToString(obj, null) : obj[keys[0]];
    return result ? String(result) : "";
  }
  const newKeys = [...keys];
  const [key] = newKeys.splice(0, 1);
  const cur = <EntryConstraint>(!isArray ? obj[key] : obj[0]);
  if (!cur) {
    return "";
  } else if (Array.isArray(cur) && newKeys[0] === "n") {
    return handleArray(newKeys, cur);
  } else {
    return getNestedValue(cur, newKeys);
  }
}

function filter<T extends unknown[]>(
  obj: T,
  keys: KeyConstraint<T>,
  query: string,
  mode?: SanitizeMode
): T {
  const trimmed = query.trim();
  if (!trimmed) {
    return obj;
  }
  const uniqueKeys = Array.from(new Set(keys))
    .map((e) => e.split("."))
    .sort();
  return <T>obj.filter((entry) => {
    if (entry) {
      try {
        const targets = uniqueKeys.reduce(
          (a, b) => a + " " + getNestedValue(<EntryConstraint>entry, b),
          ""
        );
        return new RegExp(sanitize(trimmed, mode), "i").test(targets);
      } catch (err) {
        process.env.NODE_ENV !== "production" && console.error("");
      }
    }
    return false;
  });
}

export default function useSearch<T extends unknown[]>(
  obj: T,
  predicate:
    | KeyConstraint<T>
    | ((value: string, item: T[number], index: number) => boolean),
  opts: UseSearchOptions<T> = {}
) {
  const [query, setQuery] = useState("");

  const onQueryChange = useCallback(
    (target: string | React.FormEvent<HTMLInputElement>) => {
      setQuery(
        typeof target === "string" ? target : target.currentTarget.value
      );
    },
    []
  );

  const filtered = <T>useMemo(() => {
    const data = Array.isArray(predicate)
      ? filter<T>(obj, predicate, query, opts.mode)
      : obj.filter((entry, index) => predicate(query, <T[number]>entry, index));
    return opts.sort ? [...data].sort(opts.sort) : data;
  }, [obj, query, predicate, opts.sort]);

  return {
    filtered,
    query,
    onQueryChange,
  };
}
