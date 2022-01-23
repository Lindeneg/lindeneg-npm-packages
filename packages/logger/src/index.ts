import type { EmptyObj } from '@lindeneg/types';

export enum Severity {
  Debug,
  Warn,
  Error,
}

type ErrorObj = { msg: string } & EmptyObj;

type ErrorType = string | ErrorObj;

export default class Logger {
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

  public print = (error: ErrorType, severity: Severity, context = '') => {
    if (!this.guard()) {
      return;
    }

    const { fn, color } = Logger.logMap[severity];

    const err = typeof error === 'string' ? { msg: error } : error;

    const result = {
      origin: context ? this.origin + '::' + context : this.origin,
      severity,
      ts: Date.now(),
      ...err,
    };

    if (this.isNode) {
      console.log(color, JSON.stringify(result, null, 2));
    } else {
      fn(result);
    }
  };

  public log = (error: ErrorType, context?: string) => {
    this.print(error, Severity.Debug, context);
  };

  public warn = (error: ErrorType, context?: string) => {
    this.print(error, Severity.Warn, context);
  };

  public error = (error: ErrorType, context?: string) => {
    this.print(error, Severity.Error, context);
  };
}
