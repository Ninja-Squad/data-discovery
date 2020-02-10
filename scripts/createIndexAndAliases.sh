#!/bin/bash

# delegates to parameterized script
BASEDIR=$(dirname "$0")

# RARe index/alias
sh $BASEDIR/index.sh -host localhost -app rare -env dev --no-data

# WheatIS index/alias
sh $BASEDIR/index.sh -host localhost -app wheatis -env dev --no-data

# DataDiscovery index/alias
sh $BASEDIR/index.sh -host localhost -app data-discovery -env dev --no-data
