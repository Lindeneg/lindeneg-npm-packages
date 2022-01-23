import type { EmptyObj } from '@lindeneg/types';

export enum Severity {
  Debug,
  Warn,
  Error,
}

export type ErrorObj<T extends EmptyObj = EmptyObj> = {
  origin: string;
  severity: Severity;
  ts: number;
  msg: string;
} & T;

export type ErrorArg<T extends EmptyObj> = { msg: string } & T;

export type ErrorUnionType<T extends EmptyObj> = string | ErrorArg<T>;

export default class Logger<T extends EmptyObj = Record<string, unknown>> {
  private readonly origin: string;
  private readonly isNode: boolean;
  private readonly guard: () => boolean;
  private static readonly logMap = {
    [Severity.Debug]: {
      fn: console.log,
      color: '\x1b[0m%s\x1b',
    },
    [Severity.Warn]: {
      fn: console.warn,
      color: '\x1b[33m%s\x1b',
    },
    [Severity.Error]: {
      fn: console.error,
      color: '\x1b[31m%s\x1b',
    },
  };

  constructor(origin: string, guard?: () => boolean) {
    this.origin = origin;
    this.guard = guard || (() => true);
    this.isNode =
      typeof process !== 'undefined' &&
      process.versions != null &&
      process.versions.node != null;
  }

  public print = (
    error: ErrorUnionType<T>,
    severity: Severity,
    context = '',
    ts = Date.now()
  ) => {
    if (!this.guard()) {
      return;
    }

    const { fn, color } = Logger.logMap[severity];

    const err = typeof error === 'string' ? { msg: error } : error;

    const result = JSON.stringify(
      {
        origin: context ? this.origin + '::' + context : this.origin,
        severity,
        ts,
        ...err,
      },
      null,
      2
    );

    if (this.isNode) {
      console.log(color, result);
    } else {
      fn(result);
    }
  };

  public log = (error: ErrorUnionType<T>, context?: string, ts?: number) => {
    this.print(error, Severity.Debug, context, ts);
  };

  public warn = (error: ErrorUnionType<T>, context?: string, ts?: number) => {
    this.print(error, Severity.Warn, context, ts);
  };

  public error = (error: ErrorUnionType<T>, context?: string, ts?: number) => {
    this.print(error, Severity.Error, context, ts);
  };
}
