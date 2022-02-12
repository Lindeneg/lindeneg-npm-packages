#!/usr/bin/env bash

CMD='yarn rollup -c ../../rollup.config.js && yarn tsc --project ./tsconfig-prod.json --declaration --emitDeclarationOnly --declarationDir ./dist && yarn custom'

LERNA_SCOPE=''

PREFIX='@lindeneg/'

SCOPES=()

BUILD_MSG="BUILDING "

if [[ "$#" -gt 1 ]]
  then
    BUILD_MSG+="$# PACKAGES: "
elif [[ "$#" -eq 0 ]]
  then
    BUILD_MSG+="ALL PACKAGES: "
  else
    BUILD_MSG+="1 PACKAGE: "
fi

if [[ ! -n $1 ]]
  then
    s="$PREFIX*"
    SCOPES+=( $s )
    LERNA_SCOPE=$s
elif [ "$#" -eq 1 ]
  then
    s="$PREFIX$1"
    SCOPES+=( $s )
    LERNA_SCOPE=$s
else
  for arg in "$@" 
    do
      SCOPES+=( "$PREFIX$arg" )
  done
  LERNA_SCOPE="{$(echo ${SCOPES[*]}} | sed 's/\s/,/')"
fi

BUILD_MSG+="${SCOPES[*]}"

echo $BUILD_MSG

lerna exec --scope "'$LERNA_SCOPE'" -- "$CMD"
