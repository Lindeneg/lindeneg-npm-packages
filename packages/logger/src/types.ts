import type { EmptyObj } from '@lindeneg/types';
import { Severity } from './constants';

export type ErrorObj<T extends EmptyObj> = {
  origin: string;
  severity: Severity;
  ts: number;
  msg: string;
} & T;

export type Guard = (severity: Severity) => boolean;

export type ErrorArg<T extends EmptyObj> = { msg: string } & T;

export type ErrorUnionType<T extends EmptyObj> = string | ErrorArg<T>;
