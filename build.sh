#!/usr/bin/env bash

CMD='yarn rollup -c ../../rollup.config.js && yarn tsc --project ./tsconfig-prod.json --declaration --emitDeclarationOnly --declarationDir ./dist && yarn custom'

PREFIX='@lindeneg/'

SCOPES=()

if [[ ! -n $1 ]]
  then
    SCOPES+=( "$PREFIX*" )
else
  for arg in "$@" 
    do
      SCOPES+=( "$PREFIX$arg" )
  done
fi

CLEANED_SCOPES="{$(echo ${SCOPES[*]}} | sed 's/\s/,/')"

echo "BUILDING: $CLEANED_SCOPES"

lerna exec --scope "'$CLEANED_SCOPES'" -- "$CMD" > /dev/null
