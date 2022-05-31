#!/usr/bin/env bash

# delegates to parameterized script
BASEDIR=$(dirname "$0")

$SHELL $BASEDIR/index.sh -app brc4env -data /mnt/index-data-is/rare --local
