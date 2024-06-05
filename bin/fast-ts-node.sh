
#!/bin/bash
SCRIPT_DIR=$(dirname $(readlink -f $0))

grep '"swc": true' tsconfig.json > /dev/null
if [ $? -ne 0 ]; then
  echo 'Warning: "swc": true not set in tsconfig.json - ts-node will be slow to start'
fi

node $SCRIPT_DIR/../../ts-node/dist/bin.js $*
