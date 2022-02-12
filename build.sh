#!/usr/bin/env bash

CMD='yarn rollup -c ../../rollup.config.js && yarn tsc --project ./tsconfig-prod.json --declaration --emitDeclarationOnly --declarationDir ./dist && yarn custom'

LERNA_SCOPE=''

PREFIX='@lindeneg/'

BUILD_MSG="BUILDING "

function build_scopes () {
  local SCOPES=()
  for arg in "$@" 
    do
      SCOPES+=( "$PREFIX$arg" )
  done
  local SCOPES_STR+="${SCOPES[*]}"
  LERNA_SCOPE="{$(echo $SCOPES_STR} | sed 's/\s/,/')"
  BUILD_MSG+="$# PACKAGES: $SCOPES_STR"
}

function build_scope () {
  local S="$PREFIX$1"
  LERNA_SCOPE=$S
  BUILD_MSG+="$2: $S"
}

function main () {
  if [[ ! -n $1 ]]
    then
      build_scope '*' 'ALL PACKAGES'
  elif [ "$#" -eq 1 ]
    then
      build_scope "$1" '1 PACKAGE'
  else
    build_scopes $@
  fi
}

function build () {
  echo $BUILD_MSG

  result="lerna exec --scope '$LERNA_SCOPE' -- $CMD"

  $result

  CODE=$?

  exit $CODE 
}

main $@

build
