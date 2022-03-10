#!/usr/bin/env bash

code=0

run_cleanup() {
  echo '[TEST:TS]: cleaning tests'
  rm __tests__/types.ts-test.js
  rm ./src/index.js
}


run_tests() {
  echo '[TEST:TS]: running tests'
  cmd="tsc __tests__/types.ts-test.ts"
  $cmd
  code=$?
  echo '[TEST:TS]: finished with status code' $code
  run_cleanup
  exit $code
}

run_tests
