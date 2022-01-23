### @lindeneg/types

Utility types.

### Installation

`yarn add @lindeneg/types`

### Types

```ts
import type {
  // Partial but recursive
  RecursivePartialObj,
  // substitute keys with new values
  Substitute,
  // unique values in an array
  UniqueArray,
} from '@lindeneg/types';

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

type PartialUser = RecursivePartialObj<User>;

// PartialUser would be the following type
{
  id?: number;
  name?: {
    first?: string;
    last?: string;
  };
  address?: {
    street?: string;
    city?: string;
  };
};

type SubstitutedUser = Substitute<User, { name: [string, string]; address: string }>;

// SubstitutedUser would be the following type
{
  id: number;
  name: [string, string];
  address: string;
};

type Arr = UniqueArray<[1, 1, 2, 3, 4, 4, 5, 5, 5, 6, 7]>;

// Arr would be the following type
[1, 2, 3, 4, 5, 6, 7]
```
