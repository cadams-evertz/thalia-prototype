
#!/bin/bash
SCRIPT_DIR=$(dirname $(readlink -f $0))

ROOT_DIR=$*

if [ "$ROOT_DIR" == "" ]; then
  ROOT_DIR=.
fi

for NINJA_FILENAME in $(find $ROOT_DIR -name '*.ninja'); do
  grep 'ninjaFileDir = ' $NINJA_FILENAME > /dev/null

  if [ $? -eq 0 ]; then
    echo $NINJA_FILENAME
    NINJA_FILE_DIR=$(dirname $(readlink -f $NINJA_FILENAME))
    sed "s:ninjaFileDir = .*:ninjaFileDir = $NINJA_FILE_DIR:g" $NINJA_FILENAME > /tmp/fix-ninja-paths.tmp
    mv /tmp/fix-ninja-paths.tmp $NINJA_FILENAME
  fi
done
