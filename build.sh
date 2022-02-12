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

for scope in ${SCOPES[@]}; do
  echo "BUILDING: $scope"
  lerna exec --scope "$scope" -- "$CMD" > /dev/null
done
