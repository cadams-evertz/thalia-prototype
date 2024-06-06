#!/bin/bash
banner() {
  echo -e "\n=== $* ==="
}

runQuiet() {
  TMP_FILENAME=/tmp/runQuiet.out
  rm -f $TMP_FILENAME
  $* > $TMP_FILENAME 2>&1

  if [ $? -ne 0 ]; then
    cat $TMP_FILENAME
    rm -f $TMP_FILENAME
    exit 1
  else
    rm -f $TMP_FILENAME
  fi
}

banner "Prettiering..."
runQuiet npx prettier src test --write

banner "Testing..."
runQuiet npx ts-node node_modules/jasmine/bin/jasmine $(find src -name '*.spec.ts')

mkdir -p dist
cd dist

banner "Compiling typescript..."
runQuiet npx tsc --project ../tsconfig.json --outDir src

banner "Packaging..."
cp ../package.json .
cp -R ../bin .
rm -f *.tgz
runQuiet npm pack
ls -l *.tgz
