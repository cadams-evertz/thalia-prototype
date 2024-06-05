#!/bin/bash
set -e

echo "Prettiering..."
npx prettier src --write

mkdir -p dist
cd dist

echo "Compiling typescript..."
npx tsc --pretty --declaration --declarationMap --sourceMap --outDir src ../src/index.ts

echo "Packaging..."
cp ../package.json .
cp -R ../bin .
rm -f *.tgz
npm pack
