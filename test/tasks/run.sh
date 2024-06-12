#!/bin/bash
SCRIPT_DIR=$(dirname $(readlink -f $0))

set -e

if [ ! -e $SCRIPT_DIR/node_modules ]; then
  echo "node_modules not found. Installing using npm..."
  npm --no-audit --no-fund i
fi

$SCRIPT_DIR/node_modules/thalia/bin/fast-ts-node.sh run.ts
