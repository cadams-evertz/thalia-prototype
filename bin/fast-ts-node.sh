
#!/bin/bash
SCRIPT_DIR=$(dirname $(readlink -f $0))

node $SCRIPT_DIR/../../ts-node/dist/bin.js --swc $*
