#!/bin/bash

# delegates to parameterized script
BASEDIR=$(dirname "$0")

sh $BASEDIR/harvestCI.sh -url http://localhost:8280/data-discovery-dev -app data-discovery -env dev -copy
