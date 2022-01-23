export type EmptyObj = Record<string | number | symbol, unknown>;

export type AllowedPrimitivesValues<T> = T extends
  | boolean
  | string
  | number
  | Date
  ? T
  : T extends EmptyObj
  ? RecursivePartialObj<T>
  : never;

export type RecursivePartialObj<T extends EmptyObj> = {
  [P in keyof T]?: T[P] extends Array<infer U>
    ? Array<AllowedPrimitivesValues<U>>
    : AllowedPrimitivesValues<T[P]>;
};

export type Substitute<
  T extends EmptyObj,
  K extends { [U in keyof Partial<T>]: unknown }
> = Omit<T, keyof K> & K;

export type UniqueArray<T, U extends unknown[] = []> = T extends [
  infer I,
  ...infer J
]
  ? UniqueArray<J, I extends U[number] ? U : [...U, I]>
  : U;
