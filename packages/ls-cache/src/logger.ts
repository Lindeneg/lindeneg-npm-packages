import Logger from '@lindeneg/logger';

export const { error } = new Logger(
  '@lindeneg/ls-cache',
  /* istanbul ignore next */
  () => process.env.NODE_ENV === 'development'
);
