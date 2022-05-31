#!/usr/bin/env bash

# delegates to parameterized script
BASEDIR=$(dirname "$0")

$SHELL $BASEDIR/index.sh -app faidare -data /mnt/index-data-is/faidare --local
