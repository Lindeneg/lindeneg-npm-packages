import { expectType, TypeEqual } from 'ts-expect';
import type {
  RecursivePartialObj,
  SafeOmit,
  Substitute,
  UniqueArray,
  RefConstraint,
  ObjConstraint,
} from '../src';

type User = {
  id: number;
  name: {
    first: string;
    last: string;
  };
  address: {
    street: string;
    city: string;
  };
};

expectType<Substitute<User, { name: string; address: string }>>({
  id: 1,
  name: 'hello',
  address: 'there',
});

expectType<Substitute<User, { name: [string, string]; address: string }>>({
  id: 1,
  name: ['hello', 'there'],
  address: 'miles',
});

expectType<
  TypeEqual<
    UniqueArray<[1, 1, 2, 3, 4, 4, 5, 5, 5, 6, 7]>,
    [1, 1, 2, 3, 4, 4, 5, 5, 5, 6, 7]
  >
>(false);

expectType<
  TypeEqual<
    UniqueArray<[1, 1, 2, 3, 4, 4, 5, 5, 5, 6, 7]>,
    [1, 2, 3, 4, 5, 6, 7]
  >
>(true);

//@ts-expect-error Partial is not recursive, so this should raise an error
expectType<Partial<User>>({ name: {} });

expectType<RecursivePartialObj<User>>({ name: {} });
expectType<RecursivePartialObj<User>>({ name: { first: '' } });
expectType<RecursivePartialObj<User>>({ name: { first: '', last: '' } });
expectType<RecursivePartialObj<User>>({
  address: {},
});
expectType<RecursivePartialObj<User>>({
  address: { street: '' },
});
expectType<RecursivePartialObj<User>>({
  address: { street: '', city: '' },
});

expectType<TypeEqual<SafeOmit<User, 'address' | 'name'>, { id: number }>>(true);
expectType<TypeEqual<SafeOmit<User, 'address'>, { id: number }>>(false);
//@ts-expect-error should raise a TypeScript error because the key is not found
expectType<TypeEqual<SafeOmit<User, 'not-exist'>, User>>(true);

declare function objConstrainedFn<T extends ObjConstraint<T>>(): void;
declare function refConstrainedFn<T extends RefConstraint<T>>(): void;

//@ts-expect-error should raise error, function is constrained to obj shapes
objConstrainedFn<[]>();
//@ts-expect-error should raise error, function is constrained to obj shapes
objConstrainedFn<number>();
//@ts-expect-error should raise error, function is constrained to obj shapes
objConstrainedFn<string>();
//@ts-expect-error should raise error, function is constrained to obj shapes
objConstrainedFn<boolean>();
//@ts-expect-error should raise error, function is constrained to obj shapes
objConstrainedFn<User[]>();

objConstrainedFn<User>();
objConstrainedFn<Record<string, unknown>>();

//@ts-expect-error should raise error, function is constrained to ref shapes
refConstrainedFn<number>();
//@ts-expect-error should raise error, function is constrained to ref shapes
refConstrainedFn<string>();
//@ts-expect-error should raise error, function is constrained to ref shapes
refConstrainedFn<boolean>();

refConstrainedFn<User>();
refConstrainedFn<Record<string, unknown>>();
refConstrainedFn<Record<string, unknown>[]>();
refConstrainedFn<User[]>();
