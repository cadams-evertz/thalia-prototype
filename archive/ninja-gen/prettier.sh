#!/bin/bash
SCRIPT_DIR=$(dirname $(readlink -f $0))

npx prettier -w $(find . -name '*.ts')
