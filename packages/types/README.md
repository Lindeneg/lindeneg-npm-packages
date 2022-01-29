### @lindeneg/types

![typescript](https://badgen.net/badge/icon/typescript?icon=typescript&label) ![license](https://badgen.net/npm/license/@lindeneg/types)

Utility types.

### Installation

`yarn add -D @lindeneg/types`

### Usage

We'll use the this `User` type in the following examples:

```ts
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
```

#### RecursivePartialObj

`Partial` but recursive.

```ts
import type { RecursivePartialObj } from '@lindeneg/types';

type PartialUser = RecursivePartialObj<User>;
// becomes:
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
```

#### Substitute

Substitute types in an object.

```ts
import type { Substitute } from '@lindeneg/types';

type SubstitutedUser = Substitute<User, { name: [string, string] }>;
// becomes:
{
  id: number;
  name: [string, string];
  address: {
    street: string;
    city: string;
  }
}
```

#### UniqueArray

Substitute a keys type in an object with another type.

```ts
import type { UniqueArray } from '@lindeneg/types';

type Arr = UniqueArray<[1, 1, 2, 3, 4, 4, 5, 5, 5, 6, 7]>;

// becomes:
[1, 2, 3, 4, 5, 6, 7];
```

#### SafeOmit

`Omit` but with enhanced type-safety.

```ts
import type { SafeOmit } from '@lindeneg/types';

type OmittedUser = SafeOmit<User, 'name' | 'address'>;

// becomes:
{
  id: string;
}
```
