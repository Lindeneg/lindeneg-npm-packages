import { expectType, TypeEqual } from 'ts-expect';
import type { RecursivePartialObj, Substitute, UniqueArray } from '../src';

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
