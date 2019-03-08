#!/bin/bash

# delegates to parameterized script
BASEDIR=$(dirname "$0")

sh $BASEDIR/harvestCI.sh -url http://localhost:8080/rare-dev -app rare -env dev -copy
