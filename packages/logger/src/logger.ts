import type { EmptyObj } from '@lindeneg/types';
import type { Guard, ErrorUnionType } from './types';
import { Severity, logMap } from './constants';

export default class Logger<T extends EmptyObj> {
  private readonly origin: string;
  private readonly isNode: boolean;
  private readonly guard: Guard;

  constructor(origin: string, guard?: Guard) {
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
    if (!this.guard(severity)) {
      return;
    }

    const { fn, color } = logMap[severity];

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
