#!/bin/bash
SCRIPT_DIR=$(dirname $(readlink -f $0))

set -e

listByDate() {
  ls -tl -D "%y%m%d%H%M%S" $(find $1 -type f) | awk '{ print $6 }'
}

NEWEST_SOURCE=$(listByDate ../../src | head -1)
OLDEST_DEP=$(listByDate node_modules/thalia/src | tail -1)

if [ $NEWEST_SOURCE -gt $OLDEST_DEP ]; then
  pushd $SCRIPT_DIR/../..
  ./build.sh
  popd
  rm -rf package-lock.json node_modules/thalia
  npm i
else
  echo "No need to build thalia."
fi
