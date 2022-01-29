#!/usr/bin/env bash

CMD='yarn rollup -c ../../rollup.config.js && yarn tsc --project ./tsconfig-prod.json --declaration --emitDeclarationOnly --declarationDir ./dist && yarn custom'

SCOPE='@lindeneg/'

if [[ -n $1 ]]
  then
    SCOPE+=$1
else
  SCOPE+=*
fi

lerna exec --scope $SCOPE -- $CMD