
#!/bin/bash
SCRIPT_DIR=$(dirname $(readlink -f $0))

if [ "$1" == "--debug" ]; then
  shift
  ARGS=""
else
  ARGS="--swc"
fi

node $SCRIPT_DIR/../../ts-node/dist/bin.js $ARGS $*
