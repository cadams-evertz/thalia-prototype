#!/bin/bash
SCRIPT_DIR=$(dirname $(readlink -f $0))

rm -rf $SCRIPT_DIR/node_modules/thalia $SCRIPT_DIR/package-lock.json
