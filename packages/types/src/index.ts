/* istanbul ignore file */
export type PrimitiveTypes = boolean | string | number | Date;

export type EmptyObj = Record<string | number | symbol, unknown>;

export type IMapped<T> = { [K in keyof T]: T[K] };

export type ObjConstraint<T> = IMapped<T> extends
  | PrimitiveTypes
  | Array<unknown>
  ? EmptyObj
  : IMapped<T>;

export type RefConstraint<T> = IMapped<T> extends PrimitiveTypes
  ? EmptyObj
  : IMapped<T>;

export type AllowedPrimitivesValues<T> = T extends PrimitiveTypes
  ? T
  : T extends ObjConstraint<T>
  ? RecursivePartialObj<T>
  : never;

export type RecursivePartialObj<T extends ObjConstraint<T>> = {
  [P in keyof T]?: T[P] extends Array<infer U>
    ? Array<AllowedPrimitivesValues<U>>
    : AllowedPrimitivesValues<T[P]>;
};

export type Substitute<
  T extends ObjConstraint<T>,
  K extends { [U in keyof Partial<T>]: unknown }
> = Omit<T, keyof K> & K;

export type UniqueArray<T, U extends unknown[] = []> = T extends [
  infer I,
  ...infer J
]
  ? UniqueArray<J, I extends U[number] ? U : [...U, I]>
  : U;

export type SafeOmit<T extends ObjConstraint<T>, K extends keyof T> = Pick<
  T,
  Exclude<keyof T, K>
>;
