#!/usr/bin/env bash

# delegates to parameterized script
BASEDIR=$(dirname "$0")

$SHELL $BASEDIR/index.sh -app data-discovery --local
