
#!/bin/bash
SCRIPT_DIR=$(dirname $(readlink -f $0))

PRE_ARGS=""
POST_ARGS=""

for ARG in $*; do
  if [ "$ARG" == "--type-check" ]; then
    PRE_ARGS="$PRE_ARGS --swc"
  else
    POST_ARGS="$POST_ARGS $ARG"
  fi
done

node $SCRIPT_DIR/../../ts-node/dist/bin.js $PRE_ARGS $POST_ARGS
