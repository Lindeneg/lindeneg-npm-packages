#!/usr/bin/env bash

CMD='yarn rollup -c ../../rollup.config.js && yarn tsc --project ./tsconfig-prod.json --declaration --emitDeclarationOnly --declarationDir ./dist && yarn custom'

LERNA_SCOPE=''

PREFIX='@lindeneg/'

SCOPES=()

BUILD_MSG="BUILDING "

if [[ ! -n $1 ]]
  then
    s="$PREFIX*"
    SCOPES+=( $s )
    LERNA_SCOPE=$s
    BUILD_MSG+="ALL PACKAGES: "
elif [ "$#" -eq 1 ]
  then
    s="$PREFIX$1"
    SCOPES+=( $s )
    LERNA_SCOPE=$s
    BUILD_MSG+="1 PACKAGE: "
else
  for arg in "$@" 
    do
      SCOPES+=( "$PREFIX$arg" )
  done
  BUILD_MSG+="$# PACKAGES: "
  LERNA_SCOPE="{$(echo ${SCOPES[*]}} | sed 's/\s/,/')"
fi

BUILD_MSG+="${SCOPES[*]}"

echo $BUILD_MSG

result="lerna exec --scope '$LERNA_SCOPE' -- $CMD"

$result

CODE=$?

exit $CODE
