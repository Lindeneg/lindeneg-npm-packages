export enum Severity {
  Debug,
  Warn,
  Error,
}

type LogMap = Record<
  Severity,
  {
    fn: (...args: unknown[]) => void;
    color: string;
  }
>;

export const logMap: LogMap = {
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
