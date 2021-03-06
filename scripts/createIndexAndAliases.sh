#!/usr/bin/env bash

# delegates to parameterized script
BASEDIR=$(dirname "$0")

# RARe index/alias
$SHELL $BASEDIR/index.sh -host localhost -app rare -env dev --no-data

# BRC4Env index/alias
$SHELL $BASEDIR/index.sh -host localhost -app brc4env -env dev --no-data

# WheatIS index/alias
$SHELL $BASEDIR/index.sh -host localhost -app wheatis -env dev --no-data

# DataDiscovery index/alias
$SHELL $BASEDIR/index.sh -host localhost -app faidare -env dev --no-data
