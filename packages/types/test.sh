#!/usr/bin/env bash

code=0

run_cleanup() {
  echo 'cleaning ts-tests'
  rm __tests__/types.ts-test.js
  rm ./src/index.js
}


run_tests() {
  echo 'running ts-tests'
  cmd="tsc __tests__/types.ts-test.ts"
  $cmd
  if [[ $? -gt 0 ]]
    then
      code=1
  fi
}

run_tests
run_cleanup
exit $code
